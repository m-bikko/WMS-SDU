import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function POST() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        console.log("Starting database seed...");

        // Categories
        const categoriesData = [
            { name: "Электроника", slug: "electronics", description: "Smartphones, Laptops, etc." },
            { name: "Дом и Сад", slug: "home", description: "Furniture, Appliances" },
            { name: "Одежда", slug: "clothing", description: "Apparel and shoes" },
            { name: "Продукты", slug: "food", description: "Groceries and beverages" }
        ];

        const catMap: Record<string, string> = {};
        for (const cat of categoriesData) {
            let { data: existingCat } = await supabase.from('categories').select('id').eq('slug', cat.slug).single();
            if (!existingCat) {
                const { data: newCat, error } = await supabase.from('categories').insert(cat).select('id').single();
                if (error) throw new Error("Cat insert: " + error.message);
                existingCat = newCat;
            }
            catMap[cat.slug] = existingCat.id;
        }

        // Warehouses
        const warehousesData = [
            { name: "Склад Алматы (Главный)", address: "г. Алматы, ул. Суюнбая 2" },
            { name: "Склад Астана (Региональный)", address: "г. Астана, пр. Туран 10" }
        ];

        const whMap: Record<string, string> = {};
        for (const wh of warehousesData) {
            let { data: existingWh } = await supabase.from('warehouses').select('id').eq('name', wh.name).single();
            if (!existingWh) {
                const { data: newWh, error } = await supabase.from('warehouses').insert(wh).select('id').single();
                if (error) throw new Error("WH insert: " + error.message);
                existingWh = newWh;
            }
            whMap[wh.name] = existingWh.id;
        }
        const whAlmaty = whMap["Склад Алматы (Главный)"];
        const whAstana = whMap["Склад Астана (Региональный)"];


        // Suppliers
        const suppliersData = [
            { name: "Logistics Pro KZ", contact_name: "Артем Смирнов", email: "artem@logistics.kz", phone: "+77010001010" },
            { name: "Global Tech Supply", contact_name: "John Doe", email: "sales@globaltech.com", phone: "+18001234567" },
            { name: "KazFood Distribution", contact_name: "Айнур Берикова", email: "info@kazfood.kz", phone: "+77051234567" }
        ];

        const dbSuppliers = [];
        for (const sup of suppliersData) {
            let { data: existingSup } = await supabase.from('suppliers').select('*').eq('email', sup.email).single();
            if (!existingSup) {
                const { data: newSup, error } = await supabase.from('suppliers').insert(sup).select('*').single();
                if (error) throw new Error("Sup insert: " + error.message);
                existingSup = newSup;
            }
            dbSuppliers.push(existingSup);
        }

        // Customers
        const customersData = [
            { name: "ТОО Трейд Эксперт", email: "zakup@trade.kz", phone: "+77079998877", address: "Алматы, Абай 100" },
            { name: "ИП Иванов", email: "ivanov@mail.ru", phone: "+77001112233", address: "Астана, Мангилик Ел 8" },
            { name: "МегаСтрой Маркет", email: "supply@megastroy.kz", phone: "+77005556677", address: "Шымкент, Тауелсиздик 5" }
        ];

        const dbCustomers = [];
        for (const cust of customersData) {
            let { data: existingCust } = await supabase.from('customers').select('*').eq('email', cust.email).single();
            if (!existingCust) {
                const { data: newCust, error } = await supabase.from('customers').insert(cust).select('*').single();
                if (error) throw new Error("Cust insert: " + error.message);
                existingCust = newCust;
            }
            dbCustomers.push(existingCust);
        }

        const productsData = [
            { name: "Apple MacBook Pro 14", sku: "APP-MBP-14", cat: catMap.electronics, cost: 800000, price: 1000000 },
            { name: "Apple iPhone 15 Pro", sku: "APP-IP15P", cat: catMap.electronics, cost: 450000, price: 600000 },
            { name: "Samsung Galaxy S24 Ultra", sku: "SAM-S24U", cat: catMap.electronics, cost: 420000, price: 580000 },
            { name: "Apple iPad Air 5", sku: "APP-IPAD-5", cat: catMap.electronics, cost: 250000, price: 350000 },
            { name: "Apple AirPods Pro 2", sku: "APP-APD-P2", cat: catMap.electronics, cost: 80000, price: 120000 },
            { name: "LG OLED TV 55\"", sku: "LG-OLED55", cat: catMap.electronics, cost: 500000, price: 700000 },
            { name: "Sony PlayStation 5", sku: "SON-PS5", cat: catMap.electronics, cost: 220000, price: 280000 },
            { name: "Apple USB-C Cable", sku: "APP-USBC", cat: catMap.electronics, cost: 5000, price: 12000 },
            { name: "Dell UltraSharp 27", sku: "DEL-US27", cat: catMap.electronics, cost: 180000, price: 250000 },
            { name: "Keychron K2 Keyboard", sku: "KCR-K2", cat: catMap.electronics, cost: 35000, price: 55000 },

            { name: "Сканди Диван угловой", sku: "FURN-SOF-SC", cat: catMap.home, cost: 120000, price: 200000 },
            { name: "Офисное Кресло Эрго", sku: "FURN-CHR-ER", cat: catMap.home, cost: 45000, price: 75000 },
            { name: "Деревянный Обеденный Стол", sku: "FURN-TBL-WD", cat: catMap.home, cost: 90000, price: 150000 },
            { name: "Tefal Набор Посуды", sku: "KTC-TEF-SET", cat: catMap.home, cost: 25000, price: 40000 },
            { name: "Xiaomi Робот-пылесос", sku: "XIA-VAC-RBT", cat: catMap.home, cost: 60000, price: 90000 },
            { name: "Dyson Увлажнитель", sku: "DYS-HUM-01", cat: catMap.home, cost: 150000, price: 220000 },
            { name: "Bosch Газонокосилка", sku: "BOS-LWM-01", cat: catMap.home, cost: 85000, price: 130000 },
            { name: "Набор Садовых Инструментов", sku: "GRD-TSET", cat: catMap.home, cost: 15000, price: 25000 },
            { name: "Weber Гриль Master-Touch", sku: "WEB-GRL-MT", cat: catMap.home, cost: 130000, price: 180000 },
            { name: "DeLonghi Кофемашина", sku: "DEL-CFF-MCH", cat: catMap.home, cost: 140000, price: 210000 },

            { name: "North Face Куртка", sku: "NF-JCK-WNT", cat: catMap.clothing, cost: 40000, price: 75000 },
            { name: "Nike Air Max Кроссовки", sku: "NIK-AMX", cat: catMap.clothing, cost: 25000, price: 55000 },
            { name: "Базовая Белая Футболка", sku: "CLO-TSH-WHT", cat: catMap.clothing, cost: 2000, price: 6000 },
            { name: "Levi's 501 Джинсы", sku: "LEV-501", cat: catMap.clothing, cost: 15000, price: 35000 },
            { name: "Худи Оверсайз", sku: "CLO-HD-OVR", cat: catMap.clothing, cost: 8000, price: 18000 },

            { name: "Lavazza Кофе в зернах 1кг", sku: "FD-LAV-1KG", cat: catMap.food, cost: 6000, price: 11000 },
            { name: "Оливковое Масло Premium 1л", sku: "FD-OLV-1L", cat: catMap.food, cost: 3500, price: 5000 },
            { name: "Barilla Макароны 500г", sku: "FD-BAR-500", cat: catMap.food, cost: 400, price: 800 },
            { name: "Lindt Шоколад 100г", sku: "FD-LND-100", cat: catMap.food, cost: 600, price: 1200 },
            { name: "Rich Грейпфрутовый Сок 1л", sku: "FD-RCH-1L", cat: catMap.food, cost: 350, price: 700 }
        ];

        // Insert Products (Upsert via sku if possible or fetch first)
        const dbProducts = [];
        for (const p of productsData) {
            let { data: existingProd } = await supabase.from('products').select('*').eq('sku', p.sku).single();
            if (!existingProd) {
                const { data: newProd, error } = await supabase.from('products').insert({
                    name: p.name,
                    sku: p.sku,
                    category_id: p.cat,
                    warehouse_id: whAlmaty,
                    cost_price: p.cost,
                    sales_price: p.price,
                    total_stock: 0,
                    low_stock_threshold: Math.floor(Math.random() * 10) + 5,
                }).select('*').single();
                if (error) throw new Error("Prod insert: " + error.message);
                existingProd = newProd;
            }
            dbProducts.push(existingProd);
        }

        // Wallet
        let { data: wallet } = await supabase.from('wallets').select('*').eq('name', 'Основной Счёт компании').single();
        if (!wallet) {
            const { data: newWal, error } = await supabase.from('wallets').insert({
                name: 'Основной Счёт компании',
                currency: 'KZT',
                balance: 50000000
            }).select('*').single();
            if (error) throw new Error("Wallet insert: " + error.message);
            wallet = newWal;
        }

        let currentWalletBalance = wallet.balance || 0;

        // Create 5 Purchases
        for (let i = 0; i < 5; i++) {
            const supplier = dbSuppliers[Math.floor(Math.random() * dbSuppliers.length)];
            const isAlmaty = i % 2 === 0;
            const wh = isAlmaty ? whAlmaty : whAstana;

            const purchaseItems = [];
            let totalAmount = 0;

            for (let j = 0; j < 5; j++) {
                const prod = dbProducts[Math.floor(Math.random() * dbProducts.length)];
                const qty = Math.floor(Math.random() * 50) + 10;
                purchaseItems.push({
                    product_id: prod.id,
                    quantity: qty,
                    unit_cost: prod.cost_price || 0
                });
                totalAmount += (prod.cost_price || 0) * qty;
            }

            const { data: purchase, error: purErr } = await supabase.from('purchases').insert({
                supplier_id: supplier.id,
                supplier_name: supplier.name,
                warehouse_id: wh,
                total_amount: totalAmount,
                status: 'completed',
                received_at: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toISOString(),
                notes: 'Авто-Закуп ' + (i + 1)
            }).select('*').single();
            if (purErr) throw new Error("Pur: " + purErr.message);

            const itemsToInsert = purchaseItems.map(pi => ({ ...pi, purchase_id: purchase.id }));
            await supabase.from('purchase_items').insert(itemsToInsert);

            // Deduct from wallet
            currentWalletBalance -= totalAmount;
            await supabase.from('transactions').insert({
                wallet_id: wallet.id,
                type: 'expense',
                amount: totalAmount,
                reference_type: 'purchase',
                reference_id: purchase.id,
                description: `Оплата закупки #${purchase.id.split('-')[0]}`
            });

            // Update stocks 
            for (const pi of purchaseItems) {
                const { data: stockRecord } = await supabase.from('product_stocks')
                    .select('*').eq('product_id', pi.product_id).eq('warehouse_id', wh).maybeSingle();

                if (stockRecord) {
                    await supabase.from('product_stocks').update({ quantity: stockRecord.quantity + pi.quantity }).eq('id', stockRecord.id);
                } else {
                    await supabase.from('product_stocks').insert({ product_id: pi.product_id, warehouse_id: wh, quantity: pi.quantity });
                }

                const { data: allStocks } = await supabase.from('product_stocks').select('quantity').eq('product_id', pi.product_id);
                const total = allStocks?.reduce((acc, s) => acc + s.quantity, 0) || 0;
                await supabase.from('products').update({ total_stock: total }).eq('id', pi.product_id);

                await supabase.from('stock_movements').insert({
                    product_id: pi.product_id,
                    warehouse_id: wh,
                    quantity: pi.quantity,
                    type: 'inbound',
                    reference_id: purchase.id,
                });
            }
        }

        // Create 15 Orders
        for (let i = 0; i < 15; i++) {
            const customer = dbCustomers[Math.floor(Math.random() * dbCustomers.length)];
            const orderItems = [];
            let totalAmount = 0;

            for (let j = 0; j < 3; j++) {
                const prod = dbProducts[Math.floor(Math.random() * dbProducts.length)];

                // Get available stock across warehouses
                const { data: st } = await supabase.from('product_stocks').select('*').eq('product_id', prod.id).limit(1);

                if (st && st.length > 0 && st[0].quantity > 5) {
                    const qty = Math.floor(Math.random() * 4) + 1;
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

            if (orderItems.length === 0) continue;

            const { data: order, error: ordErr } = await supabase.from('orders').insert({
                customer_id: customer.id,
                customer_name: customer.name,
                total_amount: totalAmount,
                status: 'delivered',
                created_at: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 15).toISOString()
            }).select('*').single();

            if (ordErr) throw new Error("Order error: " + ordErr.message);

            const itemsToInsert = orderItems.map(oi => ({
                order_id: order.id,
                product_id: oi.product_id,
                quantity: oi.quantity,
                unit_price: oi.unit_price
            }));
            await supabase.from('order_items').insert(itemsToInsert);

            // Add to wallet
            currentWalletBalance += totalAmount;
            await supabase.from('transactions').insert({
                wallet_id: wallet.id,
                type: 'income',
                amount: totalAmount,
                reference_type: 'order',
                reference_id: order.id,
                description: `Оплата заказа от ${customer.name}`
            });

            // Deduct stocks
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
                });
            }
        }

        // Final wallet sync
        await supabase.from('wallets').update({ balance: currentWalletBalance }).eq('id', wallet.id);

        return NextResponse.json({ success: true, message: "DB seeded beautifully with 30 products and tons of activity!" });
    } catch (error: any) {
        console.error("Seed script error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
