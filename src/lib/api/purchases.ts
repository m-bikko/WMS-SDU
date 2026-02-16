"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { addTransaction } from "./finance"

export async function getPurchases() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("purchases")
        .select(`
            *,
            purchase_items (
                *,
                products (name, sku)
            )
        `)
        .order("created_at", { ascending: false })

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
    const supabase = await createClient()

    // 1. Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0)

    // 2. Get Main Wallet (assuming single wallet for now)
    const { data: wallets } = await supabase.from("wallets").select("id").limit(1)
    if (!wallets || wallets.length === 0) {
        return { error: "No wallet found to pay for purchase" }
    }
    const walletId = wallets[0].id

    // 2.5 Get Supplier Name
    const { data: supplier, error: supplierError } = await supabase
        .from("suppliers")
        .select("name")
        .eq("id", supplierId)
        .single()

    if (supplierError || !supplier) {
        return { error: "Invalid supplier selected" }
    }

    // 3. Create Purchase Record
    const { data: purchase, error: purchaseError } = await supabase
        .from("purchases")
        .insert({
            supplier_id: supplierId,
            supplier_name: supplier.name,
            warehouse_id: warehouseId,
            total_amount: totalAmount,
            status: "draft", // Start as draft
        })
        .select()
        .single()

    if (purchaseError) {
        return { error: `Failed to create purchase: ${purchaseError.message}` }
    }

    // 4. Create Purchase Items
    const purchaseItems = items.map(item => ({
        purchase_id: purchase.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_cost: item.unitCost,
    }))

    const { error: itemsError } = await supabase.from("purchase_items").insert(purchaseItems)

    if (itemsError) {
        // Cleanup purchase if items fail (ideal world transaction, but simplified here)
        return { error: `Failed to create items: ${itemsError.message}` }
    }

    // NOTE: Stock and Wallet updates are moved to `receivePurchase` action.

    revalidatePath("/purchases")
    return { success: true }
}

export async function receivePurchase(purchaseId: string) {
    const supabase = await createClient()

    // 1. Get Purchase Details
    const { data: purchase, error: purchaseError } = await supabase
        .from("purchases")
        .select(`
            *,
            purchase_items (*)
        `)
        .eq("id", purchaseId)
        .single()

    if (purchaseError || !purchase) {
        return { error: "Purchase not found" }
    }

    return { success: true }
}

export async function voidPurchase(purchaseId: string) {
    const supabase = await createClient()

    // 1. Get Purchase Details
    const { data: purchase, error: purchaseError } = await supabase
        .from("purchases")
        .select(`
            *,
            purchase_items (*)
        `)
        .eq("id", purchaseId)
        .single()

    if (purchaseError || !purchase) {
        return { error: "Purchase not found" }
    }

    if (purchase.status === "voided") {
        return { error: "Purchase already voided" }
    }

    // 2. Handle Draft
    if (purchase.status === "draft") {
        const { error: updateError } = await supabase
            .from("purchases")
            .update({ status: "voided" })
            .eq("id", purchaseId)

        if (updateError) {
            return { error: "Failed to void draft purchase" }
        }
        revalidatePath(`/purchases/${purchaseId}`)
        return { success: true }
    }

    // 3. Handle Received/Completed
    if (purchase.status === "received" || purchase.status === "completed") {
        // A. Check Wallet
        const { data: wallets } = await supabase.from("wallets").select("id").limit(1)
        if (!wallets || wallets.length === 0) {
            return { error: "No wallet found to refund" }
        }
        const walletId = wallets[0].id

        const warehouseId = purchase.warehouse_id

        // B. Revert Stock & Cost
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

            // Decrement Stock
            await supabase
                .from("product_stocks")
                .update({ quantity: stockRecord.quantity - item.quantity })
                .eq("id", stockRecord.id)

            // Revert WAC (Approximation/Reverse)
            const { data: product } = await supabase
                .from("products")
                .select("cost_price")
                .eq("id", item.product_id)
                .single()

            if (product) {
                const currentCost = product.cost_price || 0

                // Get current total stock (which includes the items we are about to remove)
                // We actually just removed them in the DB in the step above, so we need to be careful.
                // Re-fetch total stock
                const { data: allStocks } = await supabase
                    .from("product_stocks")
                    .select("quantity")
                    .eq("product_id", item.product_id)

                const currentTotalStock = allStocks?.reduce((sum, s) => sum + s.quantity, 0) || 0
                // This currentTotalStock is AFTER removal.

                // Formula to reverse: 
                // OldTotalValue = (CurrentTotalStock + ItemQty) * CurrentWaitAvgCost ?? No, that's not right.
                // We want to remove the 'contribution' of this purchase from the WAC.
                // CurrentValue = (CurrentTotalStock + ItemQty) * CurrentCost  <-- roughly the total value before we removed stock?
                // Actually, since we updated stock record, `currentTotalStock` is the NEW stock level.
                // `product.cost_price` is the WAC *before* voiding.

                // So Total Value (before void) = (CurrentTotalStock + ItemQty) * currentCost
                // Value of Voided Items = ItemQty * ItemUnitCost
                // New Total Value = Total Value (before void) - Value of Voided Items
                // New WAC = New Total Value / CurrentTotalStock

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
                    // If stock goes to 0, cost is 0? or keeps last known?
                    // Let's keep last known or set to 0.
                    await supabase.from("products").update({ total_stock: 0 }).eq("id", item.product_id)
                }
            }
        }

        // C. Refund Wallet
        await addTransaction(
            walletId,
            "income",
            purchase.total_amount || 0,
            `Refund: Voided Purchase #${purchase.id.slice(0, 8)}`,
            "adjustment", // or refund
            purchase.id
        )

        // D. Update Status
        const { error: updateError } = await supabase
            .from("purchases")
            .update({
                status: "voided",
                received_at: null
            })
            .eq("id", purchaseId)

        if (updateError) {
            return { error: "Failed to update status to voided" }
        }

        revalidatePath(`/purchases/${purchaseId}`)
        revalidatePath("/finance")
        revalidatePath("/inventory")
        return { success: true }
    }

    return { error: "Cannot void purchase in current status" }
}

export async function getPurchase(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("purchases")
        .select(`
            *,
            purchase_items (
                *,
                products (name, sku)
            ),
            suppliers (name, contact_name, email, phone),
            warehouses (name)
        `)
        .eq("id", id)
        .single()

    if (error) {
        console.error("Error fetching purchase:", error)
        return null
    }

    return data
}
