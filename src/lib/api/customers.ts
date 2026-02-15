import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/types/supabase"

export type Customer = Database["public"]["Tables"]["customers"]["Row"]
export type CreateCustomerInput = Database["public"]["Tables"]["customers"]["Insert"]
export type UpdateCustomerInput = Database["public"]["Tables"]["customers"]["Update"]

export async function getCustomers(query?: string) {
    const supabase = createClient()
    let request = supabase
        .from("customers")
        .select("*")
        .order("name", { ascending: true })

    if (query) {
        request = request.ilike("name", `%${query}%`)
    }

    const { data, error } = await request

    if (error) throw new Error(error.message)
    return data
}

export async function getCustomer(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", id)
        .single()

    if (error) throw new Error(error.message)
    return data
}

export async function createCustomer(input: CreateCustomerInput) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("customers")
        .insert(input)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function updateCustomer(id: string, input: UpdateCustomerInput) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("customers")
        .update(input)
        .eq("id", id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteCustomer(id: string) {
    const supabase = createClient()
    const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", id)

    if (error) throw error
}
