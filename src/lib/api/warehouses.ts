"use server"

import { createClient } from "@/lib/supabase/server"
import { Database } from "@/lib/types/supabase"
import { revalidatePath } from "next/cache"
import { getCurrentUserContext } from "@/lib/auth/current-user"

export type Warehouse = Database["public"]["Tables"]["warehouses"]["Row"]
export type CreateWarehouseInput = Database["public"]["Tables"]["warehouses"]["Insert"]
export type UpdateWarehouseInput = Database["public"]["Tables"]["warehouses"]["Update"]

export async function getWarehouses() {
    const { userId, isSuperAdmin } = await getCurrentUserContext()
    const supabase = await createClient()
    let query = supabase.from("warehouses").select("*").order("created_at", { ascending: true })
    if (!isSuperAdmin) query = query.eq("owner_id", userId)
    const { data, error } = await query
    if (error) throw new Error(error.message)
    return data
}

export async function getWarehouse(id: string) {
    const { userId, isSuperAdmin } = await getCurrentUserContext()
    const supabase = await createClient()
    let query = supabase.from("warehouses").select("*").eq("id", id)
    if (!isSuperAdmin) query = query.eq("owner_id", userId)
    const { data, error } = await query.single()
    if (error) throw new Error(error.message)
    return data
}

export async function createWarehouse(input: CreateWarehouseInput) {
    const { userId } = await getCurrentUserContext()
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("warehouses")
        .insert({ ...input, owner_id: userId })
        .select()
        .single()
    if (error) throw new Error(error.message)
    revalidatePath("/warehouses")
    return data
}

export async function updateWarehouse(id: string, input: UpdateWarehouseInput) {
    const { userId, isSuperAdmin } = await getCurrentUserContext()
    const supabase = await createClient()
    const { owner_id, ...safe } = input as any
    let query = supabase.from("warehouses").update(safe).eq("id", id)
    if (!isSuperAdmin) query = query.eq("owner_id", userId)
    const { data, error } = await query.select().single()
    if (error) throw new Error(error.message)
    revalidatePath("/warehouses")
    return data
}

export async function deleteWarehouse(id: string) {
    const { userId, isSuperAdmin } = await getCurrentUserContext()
    const supabase = await createClient()
    let query = supabase.from("warehouses").delete().eq("id", id)
    if (!isSuperAdmin) query = query.eq("owner_id", userId)
    const { error } = await query
    if (error) throw new Error(error.message)
    revalidatePath("/warehouses")
}
