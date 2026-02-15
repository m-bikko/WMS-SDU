"use server"

import { createClient } from "@/lib/supabase/server"
import { Database } from "@/lib/types/supabase"
import { revalidatePath } from "next/cache"

export type Warehouse = Database["public"]["Tables"]["warehouses"]["Row"]
export type CreateWarehouseInput = Database["public"]["Tables"]["warehouses"]["Insert"]
export type UpdateWarehouseInput = Database["public"]["Tables"]["warehouses"]["Update"]

export async function getWarehouses() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("warehouses")
        .select("*")
        .order("created_at", { ascending: true })

    if (error) throw new Error(error.message)
    return data
}

export async function getWarehouse(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("warehouses")
        .select("*")
        .eq("id", id)
        .single()

    if (error) throw new Error(error.message)
    return data
}

export async function createWarehouse(input: CreateWarehouseInput) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("warehouses")
        .insert(input)
        .select()
        .single()

    if (error) throw new Error(error.message)
    revalidatePath("/warehouses")
    return data
}

export async function updateWarehouse(id: string, input: UpdateWarehouseInput) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("warehouses")
        .update(input)
        .eq("id", id)
        .select()
        .single()

    if (error) throw new Error(error.message)
    revalidatePath("/warehouses")
    return data
}

export async function deleteWarehouse(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from("warehouses")
        .delete()
        .eq("id", id)

    if (error) throw new Error(error.message)
    revalidatePath("/warehouses")
}
