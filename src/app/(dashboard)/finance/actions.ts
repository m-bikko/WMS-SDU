"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { type Database } from "@/lib/types/supabase"

type Wallet = Database["public"]["Tables"]["wallets"]["Row"]

export async function addFundsAction(formData: FormData) {
    const supabase = await createClient()
    const walletId = formData.get("wallet_id") as string
    const amount = Number(formData.get("amount"))
    const description = formData.get("description") as string
    const reason = formData.get("reason") as string

    if (!walletId || !amount) {
        return { error: "Missing required fields" }
    }

    const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("balance")
        .eq("id", walletId)
        .single()

    if (walletError || !wallet) return { error: "Wallet not found" }

    const newBalance = Number(wallet.balance) + amount

    const { error: updateError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("id", walletId)

    if (updateError) return { error: "Failed to update balance" }

    const { error: txError } = await supabase.from("transactions").insert({
        wallet_id: walletId,
        type: "income",
        amount,
        description: reason === "other" ? description : reason,
        reference_type: "manual",
    })

    if (txError) return { error: "Failed to create transaction" }

    revalidatePath("/finance")
    revalidatePath("/dashboard")
    return { success: true }
}

export async function withdrawFundsAction(formData: FormData) {
    const supabase = await createClient()
    const walletId = formData.get("wallet_id") as string
    const amount = Number(formData.get("amount"))
    const description = formData.get("description") as string
    const reason = formData.get("reason") as string

    if (!walletId || !amount) {
        return { error: "Missing required fields" }
    }

    const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("balance")
        .eq("id", walletId)
        .single()

    if (walletError || !wallet) return { error: "Wallet not found" }

    const newBalance = Number(wallet.balance) - amount

    const { error: updateError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("id", walletId)

    if (updateError) return { error: "Failed to update balance" }

    const { error: txError } = await supabase.from("transactions").insert({
        wallet_id: walletId,
        type: "expense",
        amount,
        description: reason === "other" ? description : reason,
        reference_type: "manual",
    })

    if (txError) return { error: "Failed to create transaction" }

    revalidatePath("/finance")
    revalidatePath("/dashboard")
    return { success: true }
}
