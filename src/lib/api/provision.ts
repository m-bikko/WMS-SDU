"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * Auto-provisions a new tenant after signup:
 *  - Creates an empty wallet (KZT, balance 0)
 *  - Creates an empty default warehouse
 *
 * Idempotent: if the user already has a wallet/warehouse, does nothing.
 */
export async function provisionTenant() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    // Wallet
    const { data: existingWallet } = await supabase
        .from("wallets")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle()
    if (!existingWallet) {
        await supabase.from("wallets").insert({
            name: "Мой кошелёк",
            currency: "KZT",
            balance: 0,
            owner_id: user.id,
        })
    }

    // Warehouse
    const { data: existingWh } = await supabase
        .from("warehouses")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle()
    if (!existingWh) {
        await supabase.from("warehouses").insert({
            name: "Мой склад",
            address: "",
            owner_id: user.id,
        })
    }

    return { success: true }
}
