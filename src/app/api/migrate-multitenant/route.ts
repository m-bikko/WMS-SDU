import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const IP_EMAILS = [
    "abdrakhmanov.ak@gmail.com",
    "bekova.gm@mail.kz",
    "suleimenov.db@bk.ru",
]

export async function POST() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    try {
        console.log("=== MULTI-TENANT BACKFILL: Starting ===")

        // ── 1. Get the 3 IP auth users
        const { data: usersData, error: usersErr } = await supabase.auth.admin.listUsers({ perPage: 200 })
        if (usersErr) throw new Error("listUsers: " + usersErr.message)

        const ipUsers = IP_EMAILS.map((email) => {
            const u = usersData.users.find((x) => x.email?.toLowerCase() === email)
            if (!u) throw new Error(`IP user not found: ${email}`)
            return { id: u.id, email: email }
        })
        console.log(`Found 3 IP users: ${ipUsers.map((u) => u.email).join(", ")}`)

        const randomOwner = (): string => ipUsers[Math.floor(Math.random() * ipUsers.length)].id

        // ── 2. Warehouses → random owner
        const { data: warehouses } = await supabase.from("warehouses").select("id, owner_id")
        const whOwnerMap: Record<string, string> = {}
        for (const wh of warehouses ?? []) {
            const owner = wh.owner_id ?? randomOwner()
            whOwnerMap[wh.id] = owner
            await supabase.from("warehouses").update({ owner_id: owner }).eq("id", wh.id)
        }
        console.log(`Warehouses: ${warehouses?.length ?? 0}`)

        // ── 3. Wallets: existing main wallet → first IP, create empty wallets for others
        const { data: wallets } = await supabase.from("wallets").select("id, name, owner_id")
        const walletOwnerMap: Record<string, string> = {}
        const ownersWithWallet = new Set<string>()

        for (let i = 0; i < (wallets?.length ?? 0); i++) {
            const w = wallets![i]
            const owner = w.owner_id ?? ipUsers[i % ipUsers.length].id
            walletOwnerMap[w.id] = owner
            ownersWithWallet.add(owner)
            await supabase.from("wallets").update({ owner_id: owner }).eq("id", w.id)
        }

        // Create wallets for IPs who don't have one yet
        for (const u of ipUsers) {
            if (!ownersWithWallet.has(u.id)) {
                const { data: nw } = await supabase.from("wallets").insert({
                    name: "Мой кошелёк",
                    currency: "KZT",
                    balance: 0,
                    owner_id: u.id,
                }).select("id").single()
                if (nw) walletOwnerMap[nw.id] = u.id
            }
        }
        console.log(`Wallets processed`)

        // ── 4. Products: owner = warehouse owner (fallback random)
        const { data: products } = await supabase.from("products").select("id, warehouse_id, owner_id")
        const productOwnerMap: Record<string, string> = {}
        for (const p of products ?? []) {
            const owner = p.owner_id ?? (p.warehouse_id ? whOwnerMap[p.warehouse_id] : randomOwner()) ?? randomOwner()
            productOwnerMap[p.id] = owner
            await supabase.from("products").update({ owner_id: owner }).eq("id", p.id)
        }
        console.log(`Products: ${products?.length ?? 0}`)

        // ── 5. product_stocks
        const { data: stocks } = await supabase.from("product_stocks").select("id, warehouse_id, product_id, owner_id")
        for (const s of stocks ?? []) {
            const owner = s.owner_id ?? whOwnerMap[s.warehouse_id] ?? productOwnerMap[s.product_id] ?? randomOwner()
            await supabase.from("product_stocks").update({ owner_id: owner }).eq("id", s.id)
        }
        console.log(`product_stocks: ${stocks?.length ?? 0}`)

        // ── 6. locations
        const { data: locations } = await supabase.from("locations").select("id, warehouse_id, owner_id")
        for (const l of locations ?? []) {
            const owner = l.owner_id ?? whOwnerMap[l.warehouse_id] ?? randomOwner()
            await supabase.from("locations").update({ owner_id: owner }).eq("id", l.id)
        }

        // ── 7. Purchases & purchase_items
        const { data: purchases } = await supabase.from("purchases").select("id, warehouse_id, owner_id")
        const purchaseOwnerMap: Record<string, string> = {}
        for (const p of purchases ?? []) {
            const owner = p.owner_id ?? (p.warehouse_id ? whOwnerMap[p.warehouse_id] : randomOwner()) ?? randomOwner()
            purchaseOwnerMap[p.id] = owner
            await supabase.from("purchases").update({ owner_id: owner }).eq("id", p.id)
        }
        console.log(`Purchases: ${purchases?.length ?? 0}`)

        const { data: purchaseItems } = await supabase.from("purchase_items").select("id, purchase_id, owner_id")
        for (const pi of purchaseItems ?? []) {
            const owner = pi.owner_id ?? purchaseOwnerMap[pi.purchase_id] ?? randomOwner()
            await supabase.from("purchase_items").update({ owner_id: owner }).eq("id", pi.id)
        }
        console.log(`purchase_items: ${purchaseItems?.length ?? 0}`)

        // ── 8. Customers (lookup map for orders)
        const { data: customersAll } = await supabase.from("customers").select("id, email")
        const customerEmailMap: Record<string, string> = {}
        for (const c of customersAll ?? []) {
            if (c.email) customerEmailMap[c.email.toLowerCase()] = c.id
        }
        // Map customer.id → owner if customer matches one of the IP emails
        const customerToOwner: Record<string, string> = {}
        for (const u of ipUsers) {
            const cid = customerEmailMap[u.email]
            if (cid) customerToOwner[cid] = u.id
        }

        // ── 9. Orders
        const { data: orders } = await supabase.from("orders").select("id, customer_id, owner_id")
        const orderOwnerMap: Record<string, string> = {}
        for (const o of orders ?? []) {
            const owner = o.owner_id ?? (o.customer_id ? customerToOwner[o.customer_id] : undefined) ?? randomOwner()
            orderOwnerMap[o.id] = owner
            await supabase.from("orders").update({ owner_id: owner }).eq("id", o.id)
        }
        console.log(`Orders: ${orders?.length ?? 0}`)

        const { data: orderItems } = await supabase.from("order_items").select("id, order_id, owner_id")
        for (const oi of orderItems ?? []) {
            const owner = oi.owner_id ?? orderOwnerMap[oi.order_id] ?? randomOwner()
            await supabase.from("order_items").update({ owner_id: owner }).eq("id", oi.id)
        }
        console.log(`order_items: ${orderItems?.length ?? 0}`)

        // ── 10. stock_movements (by warehouse_id)
        const { data: movements } = await supabase.from("stock_movements").select("id, warehouse_id, owner_id")
        for (const m of movements ?? []) {
            const owner = m.owner_id ?? whOwnerMap[m.warehouse_id] ?? randomOwner()
            await supabase.from("stock_movements").update({ owner_id: owner }).eq("id", m.id)
        }
        console.log(`stock_movements: ${movements?.length ?? 0}`)

        // ── 11. Transactions: by reference_id (purchase or order) or wallet
        const { data: txs } = await supabase.from("transactions").select("id, wallet_id, reference_type, reference_id, owner_id")
        for (const t of txs ?? []) {
            let owner: string | undefined = t.owner_id ?? undefined
            if (!owner && t.reference_type === "purchase" && t.reference_id) {
                owner = purchaseOwnerMap[t.reference_id]
            }
            if (!owner && t.reference_type === "order" && t.reference_id) {
                owner = orderOwnerMap[t.reference_id]
            }
            if (!owner) owner = walletOwnerMap[t.wallet_id]
            if (!owner) owner = randomOwner()
            await supabase.from("transactions").update({ owner_id: owner }).eq("id", t.id)
        }
        console.log(`transactions: ${txs?.length ?? 0}`)

        // ── 12. Categories: duplicate per IP user
        const { data: categories } = await supabase.from("categories").select("*")
        const categoryRemap: Record<string, Record<string, string>> = {} // origCatId -> { ownerId -> newCatId }
        for (const cat of categories ?? []) {
            categoryRemap[cat.id] = {}
            for (let i = 0; i < ipUsers.length; i++) {
                const u = ipUsers[i]
                if (i === 0) {
                    // Reuse the original row for first owner
                    await supabase.from("categories").update({ owner_id: u.id }).eq("id", cat.id)
                    categoryRemap[cat.id][u.id] = cat.id
                } else {
                    const { data: newCat } = await supabase.from("categories").insert({
                        name: cat.name,
                        slug: `${cat.slug}-${i}`,
                        description: cat.description,
                        owner_id: u.id,
                    }).select("id").single()
                    if (newCat) categoryRemap[cat.id][u.id] = newCat.id
                }
            }
        }
        console.log(`Categories duplicated`)

        // Update product.category_id to point at the right per-owner copy
        const { data: prodForCat } = await supabase.from("products").select("id, category_id, owner_id")
        for (const p of prodForCat ?? []) {
            if (!p.category_id || !p.owner_id) continue
            const remap = categoryRemap[p.category_id]
            if (remap && remap[p.owner_id] && remap[p.owner_id] !== p.category_id) {
                await supabase.from("products").update({ category_id: remap[p.owner_id] }).eq("id", p.id)
            }
        }

        // ── 13. Suppliers: duplicate per IP user
        const { data: suppliers } = await supabase.from("suppliers").select("*")
        const supplierRemap: Record<string, Record<string, string>> = {}
        for (const sup of suppliers ?? []) {
            supplierRemap[sup.id] = {}
            for (let i = 0; i < ipUsers.length; i++) {
                const u = ipUsers[i]
                if (i === 0) {
                    await supabase.from("suppliers").update({ owner_id: u.id }).eq("id", sup.id)
                    supplierRemap[sup.id][u.id] = sup.id
                } else {
                    const { data: newSup } = await supabase.from("suppliers").insert({
                        name: sup.name,
                        contact_name: sup.contact_name,
                        email: sup.email ? `${u.id.slice(0, 8)}-${sup.email}` : null,
                        phone: sup.phone,
                        address: sup.address,
                        owner_id: u.id,
                    }).select("id").single()
                    if (newSup) supplierRemap[sup.id][u.id] = newSup.id
                }
            }
        }
        console.log(`Suppliers duplicated`)

        // Update purchase.supplier_id to per-owner copy
        const { data: purForSup } = await supabase.from("purchases").select("id, supplier_id, owner_id")
        for (const p of purForSup ?? []) {
            if (!p.supplier_id || !p.owner_id) continue
            const remap = supplierRemap[p.supplier_id]
            if (remap && remap[p.owner_id] && remap[p.owner_id] !== p.supplier_id) {
                await supabase.from("purchases").update({ supplier_id: remap[p.owner_id] }).eq("id", p.id)
            }
        }

        console.log("=== MULTI-TENANT BACKFILL: Complete ===")

        return NextResponse.json({
            success: true,
            message: "Backfill complete",
            stats: {
                warehouses: warehouses?.length ?? 0,
                products: products?.length ?? 0,
                purchases: purchases?.length ?? 0,
                orders: orders?.length ?? 0,
                stock_movements: movements?.length ?? 0,
                transactions: txs?.length ?? 0,
            },
        })
    } catch (error: any) {
        console.error("Backfill error:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
