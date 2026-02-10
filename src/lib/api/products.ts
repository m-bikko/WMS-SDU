"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

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
    stock_quantity: number
    attributes: Record<string, any> | null
    images: string[] | null
    created_at: string | null
}

export async function getProducts(query?: string, categoryId?: string) {
    const supabase = await createClient()

    let dbQuery = supabase
        .from("products")
        .select(`
      *,
      categories (
        name
      )
    `)

    if (query) {
        dbQuery = dbQuery.or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
    }

    if (categoryId && categoryId !== "null") {
        dbQuery = dbQuery.eq("category_id", categoryId)
    }

    const { data, error } = await dbQuery.order("created_at", { ascending: false })

    if (error) throw new Error(error.message)
    return data
}

export async function createProduct(formData: FormData) {
    const supabase = await createClient()

    // Extract fields
    const name = formData.get("name") as string
    const sku = formData.get("sku") as string
    const category_id = formData.get("category_id") as string
    const attributes = formData.get("attributes") ? JSON.parse(formData.get("attributes") as string) : {}
    const description = formData.get("description") as string
    const cost_price = parseFloat(formData.get("cost_price") as string) || 0
    const sales_price = parseFloat(formData.get("sales_price") as string) || 0
    const images = formData.get("images") ? JSON.parse(formData.get("images") as string) : []

    const { error } = await supabase.from("products").insert({
        name,
        sku,
        category_id: category_id === "null" || category_id === "" ? null : category_id,
        attributes,
        description,
        cost_price,
        sales_price,
        images,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/inventory/products")
    return { success: true }
}

export async function updateProduct(id: string, formData: FormData) {
    const supabase = await createClient()

    const name = formData.get("name") as string
    const sku = formData.get("sku") as string
    const category_id = formData.get("category_id") as string
    const attributes = formData.get("attributes") ? JSON.parse(formData.get("attributes") as string) : {}
    const description = formData.get("description") as string
    const cost_price = parseFloat(formData.get("cost_price") as string) || 0
    const sales_price = parseFloat(formData.get("sales_price") as string) || 0
    const images = formData.get("images") ? JSON.parse(formData.get("images") as string) : []

    const { error } = await supabase
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
        })
        .eq("id", id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/inventory/products")
    return { success: true }
}

export async function deleteProduct(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/inventory/products")
    return { success: true }
}
