"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

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
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name")

    if (error) throw new Error(error.message)
    return data as Category[]
}

export async function createCategory(formData: FormData) {
    const supabase = await createClient()

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const parent_id = formData.get("parent_id") as string | null
    // simple slug generation
    const slug = name.toLowerCase().replace(/ /g, "-") + "-" + Date.now()

    const { error } = await supabase.from("categories").insert({
        name,
        description,
        parent_id: parent_id === "null" || parent_id === "" ? null : parent_id,
        slug,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/inventory/categories")
    return { success: true }
}

export async function updateCategory(id: string, formData: FormData) {
    const supabase = await createClient()

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const parent_id = formData.get("parent_id") as string | null

    const { error } = await supabase
        .from("categories")
        .update({
            name,
            description,
            parent_id: parent_id === "null" || parent_id === "" ? null : parent_id,
        })
        .eq("id", id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/inventory/categories")
    return { success: true }
}

export async function deleteCategory(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/inventory/categories")
    return { success: true }
}
