"use server"

import { createClient } from "@/lib/supabase/server"
import { Database } from "@/lib/types/supabase"
import { getCurrentUserContext } from "@/lib/auth/current-user"

export type Order = Database["public"]["Tables"]["orders"]["Row"]
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"]
export type OrderWithItems = Order & {
    order_items: (OrderItem & {
        products: Database["public"]["Tables"]["products"]["Row"] | null
    })[]
    customers: Database["public"]["Tables"]["customers"]["Row"] | null
}

export type CreateOrderInput = {
    customer_id: string
    items: {
        product_id: string
        quantity: number
        unit_price: number
    }[]
}

export async function getOrders() {
    const { userId, isSuperAdmin } = await getCurrentUserContext()
    const supabase = await createClient()
    let query = supabase
        .from("orders")
        .select(`*, customers (name)`)
        .order("created_at", { ascending: false })
    if (!isSuperAdmin) query = query.eq("owner_id", userId)
    const { data, error } = await query
    if (error) throw new Error(error.message)
    return data
}

export async function getOrder(id: string) {
    const { userId, isSuperAdmin } = await getCurrentUserContext()
    const supabase = await createClient()
    let query = supabase
        .from("orders")
        .select(`*, customers (*), order_items (*, products (*))`)
        .eq("id", id)
    if (!isSuperAdmin) query = query.eq("owner_id", userId)
    const { data, error } = await query.single()
    if (error) throw new Error(error.message)
    return data as OrderWithItems
}

export async function createOrder(input: CreateOrderInput) {
    const { userId } = await getCurrentUserContext()
    const supabase = await createClient()

    const total_amount = input.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)

    // Fetch customer name (required column)
    const { data: cust } = await supabase.from("customers").select("name").eq("id", input.customer_id).single()

    const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
            customer_id: input.customer_id,
            customer_name: cust?.name ?? "",
            total_amount,
            status: "pending",
            owner_id: userId,
        })
        .select()
        .single()

    if (orderError) throw orderError

    const itemsData = input.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        owner_id: userId,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(itemsData)
    if (itemsError) {
        console.error("Failed to create order items", itemsError)
        throw itemsError
    }

    return order
}

export async function updateOrderStatus(id: string, status: Order["status"]) {
    const { userId, isSuperAdmin } = await getCurrentUserContext()
    const supabase = await createClient()
    let query = supabase.from("orders").update({ status }).eq("id", id)
    if (!isSuperAdmin) query = query.eq("owner_id", userId)
    const { error } = await query
    if (error) throw error
}
