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
    supplierName: string,
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

    // 3. Create Purchase Record
    const { data: purchase, error: purchaseError } = await supabase
        .from("purchases")
        .insert({
            supplier_name: supplierName,
            warehouse_id: warehouseId,
            total_amount: totalAmount,
            status: "completed", // Auto-complete for simplicity
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
        return { error: `Failed to create items: ${itemsError.message}` }
    }

    // 5. Update Stock Levels & Weighted Average Cost
    for (const item of items) {
        // A. Update Stock
        // Check if stock record exists
        const { data: stockRecord } = await supabase
            .from("product_stocks")
            .select("*")
            .eq("product_id", item.productId)
            .eq("warehouse_id", warehouseId)
            .single()

        if (stockRecord) {
            await supabase
                .from("product_stocks")
                .update({ quantity: stockRecord.quantity + item.quantity })
                .eq("id", stockRecord.id)
        } else {
            await supabase
                .from("product_stocks")
                .insert({
                    product_id: item.productId,
                    warehouse_id: warehouseId,
                    quantity: item.quantity
                })
        }

        // B. Update Weighted Average Cost
        // Formula: ((Current Qty * Current Cost) + (New Qty * New Cost)) / (Current Qty + New Qty)
        // Note: We need TOTAL stock across all warehouses for global cost price, or per-warehouse cost?
        // Usually cost price is global or per-batch. Let's do global weighted average for simplicity.

        const { data: product } = await supabase
            .from("products")
            .select("cost_price, total_stock") // total_stock might be stale, better recalculate or use what we have
            .eq("id", item.productId)
            .single()

        if (product) {
            const currentCost = product.cost_price || 0
            // We need accurate total stock. Let's sum product_stocks
            const { data: allStocks } = await supabase
                .from("product_stocks")
                .select("quantity")
                .eq("product_id", item.productId)

            const currentTotalStock = allStocks?.reduce((sum, s) => sum + s.quantity, 0) || 0
            // The currentTotalStock includes the JUST added stock (because we updated it in step A).
            // So previous stock was currentTotalStock - item.quantity.

            const previousStock = Math.max(0, currentTotalStock - item.quantity)

            let newCostPrice = item.unitCost
            if (previousStock > 0) {
                const totalValue = (previousStock * currentCost) + (item.quantity * item.unitCost)
                newCostPrice = totalValue / (previousStock + item.quantity)
            }

            await supabase
                .from("products")
                .update({ cost_price: newCostPrice, total_stock: currentTotalStock }) // Update total_stock cache too
                .eq("id", item.productId)
        }
    }

    // 6. Deduct from Wallet (Expense)
    await addTransaction(
        walletId,
        "expense",
        totalAmount,
        `Purchase from ${supplierName}`,
        "purchase",
        purchase.id
    )

    revalidatePath("/purchases")
    revalidatePath("/finance")
    revalidatePath("/inventory")
    revalidatePath("/dashboard")

    return { success: true }
}
