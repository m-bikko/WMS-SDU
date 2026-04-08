"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getCurrentUserContext } from "@/lib/auth/current-user"

async function ensureWalletAccess(walletId: string) {
    const { userId, isSuperAdmin } = await getCurrentUserContext()
    const supabase = await createClient()
    let q = supabase.from("wallets").select("balance, owner_id").eq("id", walletId)
    if (!isSuperAdmin) q = q.eq("owner_id", userId)
    const { data: wallet, error } = await q.single()
    if (error || !wallet) return { error: "Wallet not found" as const, supabase, userId, wallet: null }
    return { error: null, supabase, userId, wallet }
}

export async function addFundsAction(formData: FormData) {
    const walletId = formData.get("wallet_id") as string
    const amount = Number(formData.get("amount"))
    const description = formData.get("description") as string
    const reason = formData.get("reason") as string

    if (!walletId || !amount) return { error: "Missing required fields" }

    const ctx = await ensureWalletAccess(walletId)
    if (ctx.error) return { error: ctx.error }
    const { supabase, wallet } = ctx

    const newBalance = Number(wallet.balance) + amount

    const { error: updateError } = await supabase.from("wallets").update({ balance: newBalance }).eq("id", walletId)
    if (updateError) return { error: "Failed to update balance" }

    const { error: txError } = await supabase.from("transactions").insert({
        wallet_id: walletId,
        type: "income",
        amount,
        description: reason === "other" ? description : reason,
        reference_type: "manual",
        owner_id: wallet.owner_id ?? ctx.userId,
    })
    if (txError) return { error: "Failed to create transaction" }

    revalidatePath("/finance")
    revalidatePath("/dashboard")
    return { success: true }
}

export async function withdrawFundsAction(formData: FormData) {
    const walletId = formData.get("wallet_id") as string
    const amount = Number(formData.get("amount"))
    const description = formData.get("description") as string
    const reason = formData.get("reason") as string

    if (!walletId || !amount) return { error: "Missing required fields" }

    const ctx = await ensureWalletAccess(walletId)
    if (ctx.error) return { error: ctx.error }
    const { supabase, wallet } = ctx

    const newBalance = Number(wallet.balance) - amount

    const { error: updateError } = await supabase.from("wallets").update({ balance: newBalance }).eq("id", walletId)
    if (updateError) return { error: "Failed to update balance" }

    const { error: txError } = await supabase.from("transactions").insert({
        wallet_id: walletId,
        type: "expense",
        amount,
        description: reason === "other" ? description : reason,
        reference_type: "manual",
        owner_id: wallet.owner_id ?? ctx.userId,
    })
    if (txError) return { error: "Failed to create transaction" }

    revalidatePath("/finance")
    revalidatePath("/dashboard")
    return { success: true }
}
