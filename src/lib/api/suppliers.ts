"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Database } from "@/lib/types/supabase"

export type Supplier = Database["public"]["Tables"]["suppliers"]["Row"]
export type NewSupplier = Database["public"]["Tables"]["suppliers"]["Insert"]

export async function getSuppliers() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name")

    if (error) {
        console.error("Error fetching suppliers:", error)
        return []
    }

    return data
}

export async function getSupplier(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("id", id)
        .single()

    if (error) {
        return null
    }

    return data
}

export async function createSupplier(supplier: NewSupplier) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("suppliers")
        .insert(supplier)
        .select()
        .single()

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/suppliers")
    return { data }
}

export async function updateSupplier(id: string, supplier: Partial<NewSupplier>) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("suppliers")
        .update(supplier)
        .eq("id", id)
        .select()
        .single()

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/suppliers")
    return { data }
}

export async function deleteSupplier(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from("suppliers")
        .delete()
        .eq("id", id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/suppliers")
    return { success: true }
}
