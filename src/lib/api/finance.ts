"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getWallets() {
    const supabase = await createClient()
    const { data, error } = await supabase.from("wallets").select("*").order("created_at", { ascending: true })

    if (error) {
        console.error("Error fetching wallets:", error)
        return []
    }

    return data
}

export async function createWallet(name: string, currency: string = "KZT") {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("wallets")
        .insert({ name, currency, balance: 0 })
        .select()
        .single()

    if (error) {
        return { error: error.message }
    }

    return { data }
}

export async function getTransactions(walletId?: string) {
    const supabase = await createClient()
    let query = supabase.from("transactions").select("*").order("created_at", { ascending: false })

    if (walletId) {
        query = query.eq("wallet_id", walletId)
    }

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
    const supabase = await createClient()

    // 1. Get current balance
    const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("balance")
        .eq("id", walletId)
        .single()

    if (walletError || !wallet) {
        return { error: "Wallet not found" }
    }

    // 2. Calculate new balance
    let newBalance = Number(wallet.balance)
    if (type === "income") {
        newBalance += amount
    } else {
        newBalance -= amount
    }

    // 3. Update wallet balance
    const { error: updateError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("id", walletId)

    if (updateError) {
        return { error: "Failed to update wallet balance" }
    }

    // 4. Create transaction record
    const { error: txError } = await supabase
        .from("transactions")
        .insert({
            wallet_id: walletId,
            type,
            amount,
            description,
            reference_type: referenceType,
            reference_id: referenceId,
        })

    if (txError) {
        // Rollback wallet update would be ideal here, but simpler for now to just log error
        // in a real app, use a proper transaction block (RPC)
        console.error("Failed to create transaction record:", txError)
        return { error: "Failed to create transaction record" }
    }

    revalidatePath("/finance")
    revalidatePath("/dashboard")
    return { success: true }
}
