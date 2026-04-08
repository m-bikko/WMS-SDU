"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getCurrentUserContext } from "@/lib/auth/current-user"

export type Category = {
    id: string
    parent_id: string | null
    name: string
    slug: string
    description: string | null
    path: string[] | null
    created_at: string | null
}

export async function getCategories() {
    const { userId, isSuperAdmin } = await getCurrentUserContext()
    const supabase = await createClient()
    let query = supabase.from("categories").select("*").order("name")
    if (!isSuperAdmin) query = query.eq("owner_id", userId)
    const { data, error } = await query
    if (error) throw new Error(error.message)
    return data as Category[]
}

export async function createCategory(formData: FormData) {
    const { userId } = await getCurrentUserContext()
    const supabase = await createClient()

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const parent_id = formData.get("parent_id") as string | null
    const slug = name.toLowerCase().replace(/ /g, "-") + "-" + Date.now()

    const { error } = await supabase.from("categories").insert({
        name,
        description,
        parent_id: parent_id === "null" || parent_id === "" ? null : parent_id,
        slug,
        owner_id: userId,
    })
    if (error) return { error: error.message }
    revalidatePath("/inventory/categories")
    return { success: true }
}

export async function updateCategory(id: string, formData: FormData) {
    const { userId, isSuperAdmin } = await getCurrentUserContext()
    const supabase = await createClient()

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const parent_id = formData.get("parent_id") as string | null

    let query = supabase
        .from("categories")
        .update({
            name,
            description,
            parent_id: parent_id === "null" || parent_id === "" ? null : parent_id,
        })
        .eq("id", id)
    if (!isSuperAdmin) query = query.eq("owner_id", userId)

    const { error } = await query
    if (error) return { error: error.message }
    revalidatePath("/inventory/categories")
    return { success: true }
}

export async function deleteCategory(id: string) {
    const { userId, isSuperAdmin } = await getCurrentUserContext()
    const supabase = await createClient()

    let query = supabase.from("categories").delete().eq("id", id)
    if (!isSuperAdmin) query = query.eq("owner_id", userId)

    const { error } = await query
    if (error) return { error: error.message }
    revalidatePath("/inventory/categories")
    return { success: true }
}
