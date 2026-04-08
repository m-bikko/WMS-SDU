import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        console.log("=== SEED IP CUSTOMERS: Starting... ===");

        // ──────────────────────────────────────────
        // Step 1: Add 3 IP customers
        // ──────────────────────────────────────────
        const ipCustomersData = [
            {
                name: "ИП Абдрахманов А.К.",
                email: "abdrakhmanov.ak@gmail.com",
                phone: "+77017778899",
                address: "г. Алматы, мкр. Самал-2, дом 33, кв. 12",
            },
            {
                name: "ИП Бекова Г.М.",
                email: "bekova.gm@mail.kz",
                phone: "+77052224466",
                address: "г. Астана, ул. Сыганак 18, офис 405",
            },
            {
                name: "ИП Сулейменов Д.Б.",
                email: "suleimenov.db@bk.ru",
                phone: "+77081116677",
                address: "г. Шымкент, пр. Тауке хана 56",
            },
        ];

        const ipCustomers: { id: string; name: string; volume: "low" | "mid" | "high" }[] = [];
        const volumes: ("low" | "mid" | "high")[] = ["low", "mid", "high"];

        for (let i = 0; i < ipCustomersData.length; i++) {
            const cust = ipCustomersData[i];
            const { data, error } = await supabase.from("customers").insert(cust).select("id, name").single();
            if (error) throw new Error("IP customer insert: " + error.message);
            ipCustomers.push({ ...data, volume: volumes[i] });
        }
        console.log(`Added ${ipCustomers.length} IP customers`);

        // ──────────────────────────────────────────
        // Step 2: Filter eligible products (400–25000 ₸)
        // ──────────────────────────────────────────
        const { data: allProducts, error: prodErr } = await supabase
            .from("products")
            .select("*")
            .gte("sales_price", 400)
            .lte("sales_price", 25000);
        if (prodErr || !allProducts || allProducts.length === 0) {
            throw new Error("No eligible products in range 400–25000 ₸");
        }
        console.log(`Eligible products: ${allProducts.length}`);

        // ──────────────────────────────────────────
        // Step 3: Get wallet & pre-fetch stocks
        // ──────────────────────────────────────────
        const { data: wallet, error: walletErr } = await supabase
            .from("wallets")
            .select("*")
            .eq("name", "Основной Счёт компании")
            .single();
        if (walletErr || !wallet) throw new Error("Main wallet not found");
        let currentWalletBalance = Number(wallet.balance) || 0;

        const stockCache: Record<string, { id: string; quantity: number; warehouse_id: string }[]> = {};
        for (const prod of allProducts) {
            const { data: stocks } = await supabase.from("product_stocks").select("*").eq("product_id", prod.id);
            stockCache[prod.id] = stocks || [];
        }

        // ──────────────────────────────────────────
        // Step 4: Generate daily orders
        // ──────────────────────────────────────────
        const startDate = new Date(2026, 2, 1);  // 01.03.2026
        const endDate = new Date(2026, 3, 7);    // 07.04.2026
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        let totalOrdersCreated = 0;
        const perCustomerStats: Record<string, number> = {};

        const getOrderCountFor = (volume: "low" | "mid" | "high"): number => {
            if (volume === "low") return Math.floor(Math.random() * 5);          // 0–4
            if (volume === "mid") return 3 + Math.floor(Math.random() * 10);     // 3–12
            return 6 + Math.floor(Math.random() * 20);                            // 6–25
        };

        const getNumItems = (): number => {
            const r = Math.random();
            if (r < 0.7) return 1;
            if (r < 0.95) return 2;
            return 3;
        };

        for (let day = 0; day < totalDays; day++) {
            const currentDay = new Date(startDate);
            currentDay.setDate(currentDay.getDate() + day);

            for (const customer of ipCustomers) {
                const ordersToday = getOrderCountFor(customer.volume);

                for (let o = 0; o < ordersToday; o++) {
                    // Random time 08:00–22:00
                    const hour = 8 + Math.floor(Math.random() * 14);
                    const minute = Math.floor(Math.random() * 60);
                    const second = Math.floor(Math.random() * 60);
                    const orderTime = new Date(currentDay);
                    orderTime.setHours(hour, minute, second, 0);
                    const orderTimestamp = orderTime.toISOString();

                    // Status distribution
                    const statusRoll = Math.random();
                    let status: string;
                    if (statusRoll < 0.9) status = "delivered";
                    else if (statusRoll < 0.97) status = "pending";
                    else status = "cancelled";

                    // Pick items
                    const numItems = getNumItems();
                    const shuffled = [...allProducts].sort(() => Math.random() - 0.5);
                    const orderItems: { product_id: string; quantity: number; unit_price: number; stockEntry: any }[] = [];
                    let totalAmount = 0;

                    for (let i = 0; i < numItems; i++) {
                        const prod = shuffled[i];
                        if (!prod) continue;
                        const stocks = stockCache[prod.id];
                        if (!stocks || stocks.length === 0) continue;

                        const stockEntry = stocks.find(s => s.quantity >= 3);
                        if (!stockEntry) continue;

                        if (orderItems.find(oi => oi.product_id === prod.id)) continue;

                        const qty = 1 + Math.floor(Math.random() * 3); // 1–3
                        if (stockEntry.quantity < qty) continue;

                        orderItems.push({
                            product_id: prod.id,
                            quantity: qty,
                            unit_price: prod.sales_price || 0,
                            stockEntry,
                        });
                        totalAmount += (prod.sales_price || 0) * qty;
                    }

                    if (orderItems.length === 0) continue;

                    const { data: order, error: ordErr } = await supabase.from("orders").insert({
                        customer_id: customer.id,
                        customer_name: customer.name,
                        total_amount: totalAmount,
                        status,
                        created_at: orderTimestamp,
                    }).select("*").single();

                    if (ordErr) {
                        console.warn("Order skip:", ordErr.message);
                        continue;
                    }

                    await supabase.from("order_items").insert(
                        orderItems.map(oi => ({
                            order_id: order.id,
                            product_id: oi.product_id,
                            quantity: oi.quantity,
                            unit_price: oi.unit_price,
                            created_at: orderTimestamp,
                        }))
                    );

                    if (status === "delivered") {
                        currentWalletBalance += totalAmount;
                        await supabase.from("transactions").insert({
                            wallet_id: wallet.id,
                            type: "income",
                            amount: totalAmount,
                            reference_type: "order",
                            reference_id: order.id,
                            description: `Оплата заказа от ${customer.name}`,
                            created_at: orderTimestamp,
                        });

                        for (const oi of orderItems) {
                            oi.stockEntry.quantity -= oi.quantity;

                            await supabase.from("product_stocks")
                                .update({ quantity: oi.stockEntry.quantity })
                                .eq("id", oi.stockEntry.id);

                            const productStocks = stockCache[oi.product_id];
                            const newTotal = productStocks.reduce((s, st) => s + st.quantity, 0);
                            await supabase.from("products").update({ total_stock: newTotal }).eq("id", oi.product_id);

                            await supabase.from("stock_movements").insert({
                                product_id: oi.product_id,
                                warehouse_id: oi.stockEntry.warehouse_id,
                                quantity: -oi.quantity,
                                type: "outbound",
                                reference_id: order.id,
                                created_at: orderTimestamp,
                            });
                        }
                    }

                    totalOrdersCreated++;
                    perCustomerStats[customer.name] = (perCustomerStats[customer.name] || 0) + 1;
                }
            }

            if ((day + 1) % 10 === 0) {
                console.log(`Day ${day + 1}/${totalDays} done. Orders so far: ${totalOrdersCreated}`);
            }
        }
        console.log(`Total orders created: ${totalOrdersCreated}`);

        // ──────────────────────────────────────────
        // Step 5: Final sync
        // ──────────────────────────────────────────
        await supabase.from("wallets").update({ balance: currentWalletBalance }).eq("id", wallet.id);

        for (const prod of allProducts) {
            const { data: allStocks } = await supabase.from("product_stocks").select("quantity").eq("product_id", prod.id);
            const total = allStocks?.reduce((acc, s) => acc + s.quantity, 0) || 0;
            await supabase.from("products").update({ total_stock: total }).eq("id", prod.id);
        }

        console.log("=== SEED IP CUSTOMERS: Complete! ===");

        return NextResponse.json({
            success: true,
            message: `Added 3 IP customers with ${totalOrdersCreated} orders over ${totalDays} days`,
            stats: {
                customers: ipCustomers.map(c => ({ name: c.name, orders: perCustomerStats[c.name] || 0 })),
                totalOrders: totalOrdersCreated,
                days: totalDays,
                walletBalance: currentWalletBalance,
            },
        });
    } catch (error: any) {
        console.error("SEED IP CUSTOMERS error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
