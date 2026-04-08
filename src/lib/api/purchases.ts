"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { addTransaction } from "./finance"
import { getCurrentUserContext } from "@/lib/auth/current-user"

export async function getPurchases() {
    const { userId, isSuperAdmin } = await getCurrentUserContext()
    const supabase = await createClient()
    let query = supabase
        .from("purchases")
        .select(`*, purchase_items (*, products (name, sku))`)
        .order("created_at", { ascending: false })
    if (!isSuperAdmin) query = query.eq("owner_id", userId)
    const { data, error } = await query
    if (error) {
        console.error("Error fetching purchases:", error)
        return []
    }
    return data
}

export type CreatePurchaseItem = {
    productId: string
    quantity: number
    unitCost: number
}

export async function createPurchase(
    supplierId: string,
    warehouseId: string,
    items: CreatePurchaseItem[]
) {
    const { userId } = await getCurrentUserContext()
    const supabase = await createClient()

    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0)

    // Get tenant's wallet
    const { data: wallets } = await supabase.from("wallets").select("id").eq("owner_id", userId).limit(1)
    if (!wallets || wallets.length === 0) {
        return { error: "No wallet found to pay for purchase" }
    }

    // Verify supplier belongs to tenant
    const { data: supplier, error: supplierError } = await supabase
        .from("suppliers")
        .select("name")
        .eq("id", supplierId)
        .eq("owner_id", userId)
        .single()
    if (supplierError || !supplier) return { error: "Invalid supplier selected" }

    // Verify warehouse belongs to tenant
    const { data: warehouse } = await supabase
        .from("warehouses")
        .select("id")
        .eq("id", warehouseId)
        .eq("owner_id", userId)
        .single()
    if (!warehouse) return { error: "Invalid warehouse selected" }

    const { data: purchase, error: purchaseError } = await supabase
        .from("purchases")
        .insert({
            supplier_id: supplierId,
            supplier_name: supplier.name,
            warehouse_id: warehouseId,
            total_amount: totalAmount,
            status: "draft",
            owner_id: userId,
        })
        .select()
        .single()

    if (purchaseError) return { error: `Failed to create purchase: ${purchaseError.message}` }

    const purchaseItems = items.map(item => ({
        purchase_id: purchase.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_cost: item.unitCost,
        owner_id: userId,
    }))

    const { error: itemsError } = await supabase.from("purchase_items").insert(purchaseItems)
    if (itemsError) return { error: `Failed to create items: ${itemsError.message}` }

    revalidatePath("/purchases")
    return { success: true }
}

export async function receivePurchase(purchaseId: string) {
    const { userId, isSuperAdmin } = await getCurrentUserContext()
    const supabase = await createClient()

    let query = supabase
        .from("purchases")
        .select(`*, purchase_items (*)`)
        .eq("id", purchaseId)
    if (!isSuperAdmin) query = query.eq("owner_id", userId)

    const { data: purchase, error: purchaseError } = await query.single()
    if (purchaseError || !purchase) return { error: "Purchase not found" }

    return { success: true }
}

export async function voidPurchase(purchaseId: string) {
    const { userId, isSuperAdmin } = await getCurrentUserContext()
    const supabase = await createClient()

    let purchaseQuery = supabase
        .from("purchases")
        .select(`*, purchase_items (*)`)
        .eq("id", purchaseId)
    if (!isSuperAdmin) purchaseQuery = purchaseQuery.eq("owner_id", userId)
    const { data: purchase, error: purchaseError } = await purchaseQuery.single()

    if (purchaseError || !purchase) return { error: "Purchase not found" }
    if (purchase.status === "voided") return { error: "Purchase already voided" }

    if (purchase.status === "draft") {
        const { error: updateError } = await supabase
            .from("purchases")
            .update({ status: "voided" })
            .eq("id", purchaseId)
        if (updateError) return { error: "Failed to void draft purchase" }
        revalidatePath(`/purchases/${purchaseId}`)
        return { success: true }
    }

    if (purchase.status === "received" || purchase.status === "completed") {
        const ownerId = purchase.owner_id ?? userId
        const { data: wallets } = await supabase.from("wallets").select("id").eq("owner_id", ownerId).limit(1)
        if (!wallets || wallets.length === 0) return { error: "No wallet found to refund" }
        const walletId = wallets[0].id

        const warehouseId = purchase.warehouse_id

        for (const item of purchase.purchase_items) {
            const { data: stockRecord } = await supabase
                .from("product_stocks")
                .select("*")
                .eq("product_id", item.product_id)
                .eq("warehouse_id", warehouseId)
                .single()

            if (!stockRecord || stockRecord.quantity < item.quantity) {
                return { error: `Insufficient stock for product ${item.product_id} to void purchase` }
            }

            await supabase
                .from("product_stocks")
                .update({ quantity: stockRecord.quantity - item.quantity })
                .eq("id", stockRecord.id)

            const { data: product } = await supabase
                .from("products")
                .select("cost_price")
                .eq("id", item.product_id)
                .single()

            if (product) {
                const currentCost = product.cost_price || 0
                const { data: allStocks } = await supabase
                    .from("product_stocks")
                    .select("quantity")
                    .eq("product_id", item.product_id)
                const currentTotalStock = allStocks?.reduce((sum, s) => sum + s.quantity, 0) || 0

                if (currentTotalStock > 0) {
                    const totalValueBeforeVoid = (currentTotalStock + item.quantity) * currentCost
                    const voidedValue = item.quantity * item.unit_cost
                    const newTotalValue = totalValueBeforeVoid - voidedValue
                    const newCost = Math.max(0, newTotalValue / currentTotalStock)

                    await supabase
                        .from("products")
                        .update({ cost_price: newCost, total_stock: currentTotalStock })
                        .eq("id", item.product_id)
                } else {
                    await supabase.from("products").update({ total_stock: 0 }).eq("id", item.product_id)
                }
            }
        }

        await addTransaction(
            walletId,
            "income",
            purchase.total_amount || 0,
            `Refund: Voided Purchase #${purchase.id.slice(0, 8)}`,
            "adjustment",
            purchase.id
        )

        const { error: updateError } = await supabase
            .from("purchases")
            .update({ status: "voided", received_at: null })
            .eq("id", purchaseId)
        if (updateError) return { error: "Failed to update status to voided" }

        revalidatePath(`/purchases/${purchaseId}`)
        revalidatePath("/finance")
        revalidatePath("/inventory")
        return { success: true }
    }

    return { error: "Cannot void purchase in current status" }
}

export async function getPurchase(id: string) {
    const { userId, isSuperAdmin } = await getCurrentUserContext()
    const supabase = await createClient()
    let query = supabase
        .from("purchases")
        .select(`
            *,
            purchase_items (*, products (name, sku)),
            suppliers (name, contact_name, email, phone),
            warehouses (name)
        `)
        .eq("id", id)
    if (!isSuperAdmin) query = query.eq("owner_id", userId)

    const { data, error } = await query.single()
    if (error) {
        console.error("Error fetching purchase:", error)
        return null
    }
    return data
}
