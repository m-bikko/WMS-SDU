import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
    const supabase = await createClient()
    const { data: products } = await supabase.from("products").select("name, cost_price, total_stock").limit(10)
    
    return NextResponse.json({ products })
}
