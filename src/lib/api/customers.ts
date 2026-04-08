"use server"

import { createClient } from "@/lib/supabase/server"
import { Database } from "@/lib/types/supabase"
import { revalidatePath } from "next/cache"
import { getCurrentUserContext } from "@/lib/auth/current-user"

export type Customer = Database["public"]["Tables"]["customers"]["Row"]
export type CreateCustomerInput = Database["public"]["Tables"]["customers"]["Insert"]
export type UpdateCustomerInput = Database["public"]["Tables"]["customers"]["Update"]

async function requireSuperAdmin() {
    const ctx = await getCurrentUserContext()
    if (!ctx.isSuperAdmin) throw new Error("Forbidden: super-admin only")
    return ctx
}

export async function getCustomers(query?: string) {
    await requireSuperAdmin()
    const supabase = await createClient()
    let request = supabase.from("customers").select("*").order("name", { ascending: true })
    if (query) request = request.ilike("name", `%${query}%`)
    const { data, error } = await request
    if (error) throw new Error(error.message)
    return data
}

export async function getCustomer(id: string) {
    await requireSuperAdmin()
    const supabase = await createClient()
    const { data, error } = await supabase.from("customers").select("*").eq("id", id).single()
    if (error) throw new Error(error.message)
    return data
}

export async function createCustomer(input: CreateCustomerInput) {
    await requireSuperAdmin()
    const supabase = await createClient()
    const { data, error } = await supabase.from("customers").insert(input).select().single()
    if (error) throw error
    revalidatePath("/customers")
    return data
}

export async function updateCustomer(id: string, input: UpdateCustomerInput) {
    await requireSuperAdmin()
    const supabase = await createClient()
    const { data, error } = await supabase.from("customers").update(input).eq("id", id).select().single()
    if (error) throw error
    revalidatePath("/customers")
    return data
}

export async function deleteCustomer(id: string) {
    await requireSuperAdmin()
    const supabase = await createClient()
    const { error } = await supabase.from("customers").delete().eq("id", id)
    if (error) throw error
    revalidatePath("/customers")
}
