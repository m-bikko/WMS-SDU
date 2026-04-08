"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getCurrentUserContext } from "@/lib/auth/current-user"

export type Product = {
    id: string
    category_id: string | null
    name: string
    description: string | null
    sku: string
    barcode_type: string | null
    barcode_value: string | null
    external_code: string | null
    cost_price: number
    sales_price: number
    discount_price: number | null
    total_stock: number // aggregated
    low_stock_threshold: number | null
    attributes: Record<string, any> | null
    images: string[] | null
    created_at: string | null
    stocks?: { warehouse_id: string; quantity: number }[]
}

export async function getProducts(query?: string, categoryId?: string, warehouseId?: string) {
    const { userId, isSuperAdmin } = await getCurrentUserContext()
    const supabase = await createClient()

    let dbQuery: any

    if (warehouseId && warehouseId !== "null") {
        dbQuery = supabase
            .from("products")
            .select(`
        *,
        categories (name),
        product_stocks!inner (warehouse_id, quantity)
      `)
            .eq("product_stocks.warehouse_id", warehouseId)
    } else {
        dbQuery = supabase
            .from("products")
            .select(`
        *,
        categories (name),
        product_stocks (warehouse_id, quantity)
      `)
    }

    if (query) {
        dbQuery = dbQuery.or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
    }

    if (categoryId && categoryId !== "null") {
        dbQuery = dbQuery.eq("category_id", categoryId)
    }

    if (!isSuperAdmin) {
        dbQuery = dbQuery.eq("owner_id", userId)
    }

    const { data: products, error } = await dbQuery.order("created_at", { ascending: false })
    if (error) throw new Error(error.message)

    return products.map((p: any) => ({
        ...p,
        stocks: p.product_stocks,
        total_stock: p.product_stocks?.reduce((sum: number, s: any) => sum + s.quantity, 0) ?? p.total_stock ?? 0
    }))
}

export async function createProduct(formData: FormData) {
    const { userId } = await getCurrentUserContext()
    const supabase = await createClient()

    const name = formData.get("name") as string
    const sku = formData.get("sku") as string
    const category_id = formData.get("category_id") as string
    const attributes = formData.get("attributes") ? JSON.parse(formData.get("attributes") as string) : {}
    const description = formData.get("description") as string
    const cost_price = parseFloat(formData.get("cost_price") as string) || 0
    const sales_price = parseFloat(formData.get("sales_price") as string) || 0
    const images = formData.get("images") ? JSON.parse(formData.get("images") as string) : []

    const stocksMap = formData.get("stocks") ? JSON.parse(formData.get("stocks") as string) : {}
    const total_stock = Object.values(stocksMap).reduce((sum: number, qty: any) => sum + (parseInt(qty) || 0), 0)

    const { data: product, error } = await supabase.from("products").insert({
        name,
        sku,
        category_id: category_id === "null" || category_id === "" ? null : category_id,
        attributes,
        description,
        cost_price,
        sales_price,
        images,
        total_stock,
        owner_id: userId,
    }).select().single()

    if (error) return { error: error.message }

    if (Object.keys(stocksMap).length > 0) {
        const stockInserts = Object.entries(stocksMap).map(([warehouseId, quantity]) => ({
            product_id: product.id,
            warehouse_id: warehouseId,
            quantity: parseInt(quantity as string) || 0,
            owner_id: userId,
        }))
        const { error: stockError } = await supabase.from("product_stocks").insert(stockInserts)
        if (stockError) console.error("Error creating stocks:", stockError)
    }

    revalidatePath("/inventory/products")
    return { success: true }
}

export async function updateProduct(id: string, formData: FormData) {
    const { userId, isSuperAdmin } = await getCurrentUserContext()
    const supabase = await createClient()

    const name = formData.get("name") as string
    const sku = formData.get("sku") as string
    const category_id = formData.get("category_id") as string
    const attributes = formData.get("attributes") ? JSON.parse(formData.get("attributes") as string) : {}
    const description = formData.get("description") as string
    const cost_price = parseFloat(formData.get("cost_price") as string) || 0
    const sales_price = parseFloat(formData.get("sales_price") as string) || 0
    const images = formData.get("images") ? JSON.parse(formData.get("images") as string) : []

    const stocksMap = formData.get("stocks") ? JSON.parse(formData.get("stocks") as string) : {}
    const total_stock = Object.values(stocksMap).reduce((sum: number, qty: any) => sum + (parseInt(qty) || 0), 0)

    let updateQuery = supabase
        .from("products")
        .update({
            name,
            sku,
            category_id: category_id === "null" || category_id === "" ? null : category_id,
            attributes,
            description,
            cost_price,
            sales_price,
            images,
            total_stock,
        })
        .eq("id", id)
    if (!isSuperAdmin) updateQuery = updateQuery.eq("owner_id", userId)

    const { error } = await updateQuery
    if (error) return { error: error.message }

    if (Object.keys(stocksMap).length > 0) {
        const stockUpserts = Object.entries(stocksMap).map(([warehouseId, quantity]) => ({
            product_id: id,
            warehouse_id: warehouseId,
            quantity: parseInt(quantity as string) || 0,
            owner_id: userId,
        }))
        const { error: stockError } = await supabase.from("product_stocks").upsert(stockUpserts, {
            onConflict: 'product_id,warehouse_id'
        })
        if (stockError) console.error("Error updating stocks:", stockError)
    }

    revalidatePath("/inventory/products")
    return { success: true }
}

export async function deleteProduct(id: string) {
    const { userId, isSuperAdmin } = await getCurrentUserContext()
    const supabase = await createClient()

    let query = supabase.from("products").delete().eq("id", id)
    if (!isSuperAdmin) query = query.eq("owner_id", userId)

    const { error } = await query
    if (error) return { error: error.message }

    revalidatePath("/inventory/products")
    return { success: true }
}
