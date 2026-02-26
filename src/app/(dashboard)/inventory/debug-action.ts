"use server"

import { createClient } from "@/lib/supabase/server"

export async function fetchDebugData() {
    const supabase = await createClient()
    const { data: products } = await supabase.from("products").select("name, cost_price, total_stock").limit(5)
    console.log("=== DB DEBUG LOGS ===")
    console.log(JSON.stringify(products, null, 2))
    return products
}
