import { createClient } from "@/lib/supabase/server"
import { Database } from "@/lib/types/supabase"

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
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("orders")
        .select(`
            *,
            customers (name)
        `)
        .order("created_at", { ascending: false })

    if (error) throw new Error(error.message)
    return data
}

export async function getOrder(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("orders")
        .select(`
            *,
            customers (*),
            order_items (
                *,
                products (*)
            )
        `)
        .eq("id", id)
        .single()

    if (error) throw new Error(error.message)
    return data as OrderWithItems
}

export async function createOrder(input: CreateOrderInput) {
    const supabase = await createClient()

    // Calculate total
    const total_amount = input.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)

    // 1. Create Order
    const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
            customer_id: input.customer_id,
            total_amount,
            status: "pending"
        })
        .select()
        .single()

    if (orderError) throw orderError

    // 2. Create Items
    const itemsData = input.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price
    }))

    const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsData)

    if (itemsError) {
        // ideally we should rollback here, but for now we'll just throw
        // In a real app, use a Supabase RPC function for atomicity
        console.error("Failed to create order items", itemsError)
        throw itemsError
    }

    return order
}

export async function updateOrderStatus(id: string, status: Order["status"]) {
    const supabase = await createClient()
    const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id)

    if (error) throw error
}
