import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function POST() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        console.log("Starting massive order simulation...");

        // Get basic entities
        const { data: dbCustomers, error: custErr } = await supabase.from('customers').select('*');
        if (custErr || !dbCustomers || dbCustomers.length === 0) throw new Error("Need customers to run simulation");

        const { data: dbProducts, error: prodErr } = await supabase.from('products').select('*');
        if (prodErr || !dbProducts || dbProducts.length === 0) throw new Error("Need products to run simulation");

        // Prepare Wallet
        let { data: wallet } = await supabase.from('wallets').select('*').eq('name', 'Основной Счёт компании').single();
        if (!wallet) {
            console.log("Primary wallet not found, creating a new one...");
            const { data: newWal } = await supabase.from('wallets').insert({
                name: 'Основной Счёт компании',
                currency: 'KZT',
                balance: 50000000
            }).select('*').single();
            wallet = newWal!;
        }
        let currentWalletBalance = wallet.balance || 0;

        // Date boundaries (Feb 12 2026 - Feb 25 2026)
        // JS months are 0-indexed (1 = Feb)
        const startDate = new Date(2026, 1, 12).getTime();
        const endDate = new Date(2026, 1, 26).getTime(); // Up to midnight of Feb 26

        const totalOrders = 200;
        let successfulOrders = 0;

        // Create a modest inbound stock movement to guarantee we don't hit negative stock constraints 
        // if there are any, and simply to make sure we have inventory to fulfill
        console.log("Briefly restocking all products by 50 units just in case...");
        const whResponse = await supabase.from('warehouses').select('*').limit(1).single();
        if (!whResponse.data) throw new Error("No warehouse found");
        const defaultWh = whResponse.data.id;

        for (const p of dbProducts) {
            const { data: existingStock } = await supabase.from('product_stocks')
                .select('*').eq('product_id', p.id).eq('warehouse_id', defaultWh).maybeSingle();

            if (existingStock) {
                await supabase.from('product_stocks').update({ quantity: existingStock.quantity + 50 }).eq('id', existingStock.id);
            } else {
                await supabase.from('product_stocks').insert({ product_id: p.id, warehouse_id: defaultWh, quantity: 50 });
            }

            // Recalculate total_stock
            const { data: allStocks } = await supabase.from('product_stocks').select('quantity').eq('product_id', p.id);
            const total = allStocks?.reduce((acc, s) => acc + s.quantity, 0) || 0;
            await supabase.from('products').update({ total_stock: total }).eq('id', p.id);
        }

        console.log(`Starting generation of ${totalOrders} orders...`);

        // Create 200 Orders
        for (let i = 0; i < totalOrders; i++) {
            const customer = dbCustomers[Math.floor(Math.random() * dbCustomers.length)];
            const orderItems: {
                product_id: string;
                quantity: number;
                unit_price: number;
                wh: string;
                stockId: string;
                currentQty: number;
            }[] = [];
            let totalAmount = 0;

            // 1 to 2 different products per order
            const numProducts = Math.floor(Math.random() * 2) + 1;

            for (let j = 0; j < numProducts; j++) {
                const prod = dbProducts[Math.floor(Math.random() * dbProducts.length)];

                const { data: st } = await supabase.from('product_stocks').select('*').eq('product_id', prod.id).limit(1);

                if (st && st.length > 0 && st[0].quantity > 0) {
                    const maxQty = Math.min(st[0].quantity, 2);
                    const qty = Math.floor(Math.random() * maxQty) + 1;

                    // Don't add duplicate products in the same order array
                    if (!orderItems.find(oi => oi.product_id === prod.id)) {
                        orderItems.push({
                            product_id: prod.id,
                            quantity: qty,
                            unit_price: prod.sales_price || 0,
                            wh: st[0].warehouse_id,
                            stockId: st[0].id,
                            currentQty: st[0].quantity
                        });
                        totalAmount += (prod.sales_price || 0) * qty;
                    }
                }
            }

            if (orderItems.length === 0) continue;

            // Generate an exact random time inside the window
            const randomTime = new Date(startDate + Math.random() * (endDate - startDate)).toISOString();

            const { data: order, error: ordErr } = await supabase.from('orders').insert({
                customer_id: customer.id,
                customer_name: customer.name,
                total_amount: totalAmount,
                status: 'delivered', // Allowed statuses: 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
                created_at: randomTime
            }).select('*').single();

            if (ordErr) {
                console.warn(`Skipping order due to error: ${ordErr.message}`);
                continue;
            }

            const itemsToInsert = orderItems.map(oi => ({
                order_id: order.id,
                product_id: oi.product_id,
                quantity: oi.quantity,
                unit_price: oi.unit_price,
                created_at: randomTime
            }));
            await supabase.from('order_items').insert(itemsToInsert);

            // Transaction income inside the same randomly generated timestamp
            currentWalletBalance += totalAmount;
            await supabase.from('transactions').insert({
                wallet_id: wallet.id,
                type: 'income',
                amount: totalAmount,
                reference_type: 'order',
                reference_id: order.id,
                description: `Оплата заказа от ${customer.name}`,
                created_at: randomTime
            });

            // Deduct stocks & movement
            for (const oi of orderItems) {
                await supabase.from('product_stocks').update({ quantity: oi.currentQty - oi.quantity }).eq('id', oi.stockId);

                const { data: allStocks } = await supabase.from('product_stocks').select('quantity').eq('product_id', oi.product_id);
                const total = allStocks?.reduce((acc, s) => acc + s.quantity, 0) || 0;
                await supabase.from('products').update({ total_stock: total }).eq('id', oi.product_id);

                await supabase.from('stock_movements').insert({
                    product_id: oi.product_id,
                    warehouse_id: oi.wh,
                    quantity: -oi.quantity,
                    type: 'outbound',
                    reference_id: order.id,
                    created_at: randomTime
                });
            }

            successfulOrders++;
            if (successfulOrders % 20 === 0) {
                console.log(`Processed ${successfulOrders} orders...`);
            }
        }

        // Final wallet sync
        await supabase.from('wallets').update({ balance: currentWalletBalance }).eq('id', wallet.id);

        return NextResponse.json({
            success: true,
            message: `Successfully simulated ${successfulOrders} orders between Feb 12 and Feb 25, 2026!`
        });
    } catch (error: any) {
        console.error("Massive seed script error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
