"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getCurrentUserContext } from "@/lib/auth/current-user"

export async function getWallets() {
    const { userId, isSuperAdmin } = await getCurrentUserContext()
    const supabase = await createClient()
    let query = supabase.from("wallets").select("*").order("created_at", { ascending: true })
    if (!isSuperAdmin) query = query.eq("owner_id", userId)
    const { data, error } = await query
    if (error) {
        console.error("Error fetching wallets:", error)
        return []
    }
    return data
}

export async function createWallet(name: string, currency: string = "KZT") {
    const { userId } = await getCurrentUserContext()
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("wallets")
        .insert({ name, currency, balance: 0, owner_id: userId })
        .select()
        .single()
    if (error) return { error: error.message }
    return { data }
}

export async function getTransactions(walletId?: string) {
    const { userId, isSuperAdmin } = await getCurrentUserContext()
    const supabase = await createClient()
    let query = supabase.from("transactions").select("*").order("created_at", { ascending: false })
    if (walletId) query = query.eq("wallet_id", walletId)
    if (!isSuperAdmin) query = query.eq("owner_id", userId)
    const { data, error } = await query
    if (error) {
        console.error("Error fetching transactions:", error)
        return []
    }
    return data
}

export async function addTransaction(
    walletId: string,
    type: "income" | "expense" | "adjustment",
    amount: number,
    description: string,
    referenceType: string = "manual",
    referenceId?: string
) {
    const { userId, isSuperAdmin } = await getCurrentUserContext()
    const supabase = await createClient()

    let walletQuery = supabase.from("wallets").select("balance, owner_id").eq("id", walletId)
    if (!isSuperAdmin) walletQuery = walletQuery.eq("owner_id", userId)
    const { data: wallet, error: walletError } = await walletQuery.single()

    if (walletError || !wallet) return { error: "Wallet not found" }

    let newBalance = Number(wallet.balance)
    if (type === "income") newBalance += amount
    else newBalance -= amount

    const { error: updateError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("id", walletId)
    if (updateError) return { error: "Failed to update wallet balance" }

    const { error: txError } = await supabase
        .from("transactions")
        .insert({
            wallet_id: walletId,
            type,
            amount,
            description,
            reference_type: referenceType,
            reference_id: referenceId,
            owner_id: wallet.owner_id ?? userId,
        })

    if (txError) {
        console.error("Failed to create transaction record:", txError)
        return { error: "Failed to create transaction record" }
    }

    revalidatePath("/finance")
    revalidatePath("/dashboard")
    return { success: true }
}
