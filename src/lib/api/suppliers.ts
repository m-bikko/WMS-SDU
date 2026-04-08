"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Database } from "@/lib/types/supabase"
import { getCurrentUserContext } from "@/lib/auth/current-user"

export type Supplier = Database["public"]["Tables"]["suppliers"]["Row"]
export type NewSupplier = Database["public"]["Tables"]["suppliers"]["Insert"]

export async function getSuppliers() {
    const { userId, isSuperAdmin } = await getCurrentUserContext()
    const supabase = await createClient()
    let query = supabase.from("suppliers").select("*").order("name")
    if (!isSuperAdmin) query = query.eq("owner_id", userId)
    const { data, error } = await query
    if (error) {
        console.error("Error fetching suppliers:", error)
        return []
    }
    return data
}

export async function getSupplier(id: string) {
    const { userId, isSuperAdmin } = await getCurrentUserContext()
    const supabase = await createClient()
    let query = supabase.from("suppliers").select("*").eq("id", id)
    if (!isSuperAdmin) query = query.eq("owner_id", userId)
    const { data, error } = await query.single()
    if (error) return null
    return data
}

export async function createSupplier(supplier: NewSupplier) {
    const { userId } = await getCurrentUserContext()
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("suppliers")
        .insert({ ...supplier, owner_id: userId })
        .select()
        .single()
    if (error) return { error: error.message }
    revalidatePath("/suppliers")
    return { data }
}

export async function updateSupplier(id: string, supplier: Partial<NewSupplier>) {
    const { userId, isSuperAdmin } = await getCurrentUserContext()
    const supabase = await createClient()
    const { owner_id, ...safe } = supplier as any
    let query = supabase.from("suppliers").update(safe).eq("id", id)
    if (!isSuperAdmin) query = query.eq("owner_id", userId)
    const { data, error } = await query.select().single()
    if (error) return { error: error.message }
    revalidatePath("/suppliers")
    return { data }
}

export async function deleteSupplier(id: string) {
    const { userId, isSuperAdmin } = await getCurrentUserContext()
    const supabase = await createClient()
    let query = supabase.from("suppliers").delete().eq("id", id)
    if (!isSuperAdmin) query = query.eq("owner_id", userId)
    const { error } = await query
    if (error) return { error: error.message }
    revalidatePath("/suppliers")
    return { success: true }
}
