import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        console.log("=== SEED FULL: Starting... ===");

        // ──────────────────────────────────────────
        // Step 1: Clear all tables
        // ──────────────────────────────────────────
        console.log("Step 1: Clearing database...");
        const tablesToClear = [
            "stock_movements", "transactions", "order_items", "purchase_items",
            "product_stocks", "locations", "orders", "purchases", "products",
            "wallets", "customers", "suppliers", "warehouses", "categories"
        ];
        for (const table of tablesToClear) {
            await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
        }
        console.log("All tables cleared.");

        // ──────────────────────────────────────────
        // Step 2: Base entities
        // ──────────────────────────────────────────
        console.log("Step 2: Creating base entities...");

        // Categories
        const categoriesData = [
            { name: "Канцелярия", slug: "stationery", description: "Канцелярские товары для офиса и учёбы" },
            { name: "Бытовая химия", slug: "household-chemicals", description: "Средства для уборки и ухода" },
            { name: "Продукты питания", slug: "food", description: "Продовольственные товары" },
            { name: "Электроника", slug: "electronics", description: "Электроника и аксессуары" },
            { name: "Одежда", slug: "clothing", description: "Одежда и обувь" },
            { name: "Хозтовары", slug: "household-goods", description: "Хозяйственные товары и инструменты" },
        ];

        const catMap: Record<string, string> = {};
        for (const cat of categoriesData) {
            const { data, error } = await supabase.from("categories").insert(cat).select("id").single();
            if (error) throw new Error("Category insert: " + error.message);
            catMap[cat.slug] = data.id;
        }

        // Warehouses
        const warehousesData = [
            { name: "Склад Алматы (Главный)", address: "г. Алматы, ул. Суюнбая 2" },
            { name: "Склад Астана (Региональный)", address: "г. Астана, пр. Туран 10" },
        ];
        const warehouses: { id: string; name: string }[] = [];
        for (const wh of warehousesData) {
            const { data, error } = await supabase.from("warehouses").insert(wh).select("id, name").single();
            if (error) throw new Error("Warehouse insert: " + error.message);
            warehouses.push(data);
        }
        const whAlmaty = warehouses[0].id;
        const whAstana = warehouses[1].id;

        // Suppliers
        const suppliersData = [
            { name: "ТОО КазСнаб", contact_name: "Ержан Калиев", email: "info@kazsnab.kz", phone: "+77010001122" },
            { name: "ТОО АлмаТрейд", contact_name: "Марат Нурланов", email: "sales@almatrade.kz", phone: "+77021112233" },
            { name: "ТОО Астана Логистик", contact_name: "Дана Сагиндыкова", email: "dana@astanalog.kz", phone: "+77013334455" },
            { name: "ИП Ким", contact_name: "Виктор Ким", email: "kim@supply.kz", phone: "+77055556677" },
        ];
        const dbSuppliers: any[] = [];
        for (const sup of suppliersData) {
            const { data, error } = await supabase.from("suppliers").insert(sup).select("*").single();
            if (error) throw new Error("Supplier insert: " + error.message);
            dbSuppliers.push(data);
        }

        // Customers
        const customersData = [
            { name: "ТОО Трейд Эксперт", email: "zakup@trade.kz", phone: "+77079998877", address: "Алматы, Абай 100" },
            { name: "ИП Иванов", email: "ivanov@mail.ru", phone: "+77001112233", address: "Астана, Мангилик Ел 8" },
            { name: "МегаСтрой Маркет", email: "supply@megastroy.kz", phone: "+77005556677", address: "Шымкент, Тауелсиздик 5" },
            { name: "ТОО Офис Плюс", email: "office@officeplus.kz", phone: "+77012223344", address: "Караганда, Бухар-Жырау 30" },
            { name: "ИП Сериков", email: "serikov@bk.ru", phone: "+77083334455", address: "Актобе, Абилкайыр хана 12" },
            { name: "ТОО ЭкоДом", email: "info@ecodom.kz", phone: "+77024445566", address: "Алматы, Толе Би 59" },
            { name: "ИП Жумабаева", email: "zhumabaeva@gmail.com", phone: "+77015556677", address: "Астана, Сарыарка 22" },
            { name: "ТОО НурСтрой", email: "nurstroy@mail.kz", phone: "+77096667788", address: "Тараз, Абай 15" },
        ];
        const dbCustomers: any[] = [];
        for (const cust of customersData) {
            const { data, error } = await supabase.from("customers").insert(cust).select("*").single();
            if (error) throw new Error("Customer insert: " + error.message);
            dbCustomers.push(data);
        }

        // Wallet
        const { data: wallet, error: walletErr } = await supabase.from("wallets").insert({
            name: "Основной Счёт компании",
            currency: "KZT",
            balance: 0,
        }).select("*").single();
        if (walletErr) throw new Error("Wallet insert: " + walletErr.message);
        let currentWalletBalance = 0;

        // ──────────────────────────────────────────
        // Step 3: 50 Products
        // ──────────────────────────────────────────
        console.log("Step 3: Creating 50 products...");

        const productsData = [
            // Канцелярия (9 items, 500–5000 ₸)
            { name: "Ручка шариковая BIC", sku: "KNC-PEN-01", cat: "stationery", cost: 350, price: 500 },
            { name: "Тетрадь 96 листов", sku: "KNC-NTB-96", cat: "stationery", cost: 450, price: 700 },
            { name: "Папка-регистратор A4", sku: "KNC-FLD-A4", cat: "stationery", cost: 800, price: 1200 },
            { name: "Скотч прозрачный 50м", sku: "KNC-TPC-50", cat: "stationery", cost: 400, price: 600 },
            { name: "Степлер №24", sku: "KNC-STP-24", cat: "stationery", cost: 1200, price: 1800 },
            { name: "Набор маркеров 12шт", sku: "KNC-MRK-12", cat: "stationery", cost: 1500, price: 2500 },
            { name: "Ножницы офисные 21см", sku: "KNC-SCR-21", cat: "stationery", cost: 600, price: 900 },
            { name: "Бумага А4 500 листов", sku: "KNC-PPR-A4", cat: "stationery", cost: 2200, price: 3200 },
            { name: "Клей-карандаш 36г", sku: "KNC-GLU-36", cat: "stationery", cost: 350, price: 550 },

            // Бытовая химия (8 items, 800–8000 ₸)
            { name: "Стиральный порошок 3кг", sku: "BHM-PWD-3K", cat: "household-chemicals", cost: 2500, price: 3800 },
            { name: "Средство для мытья посуды 1л", sku: "BHM-DSH-1L", cat: "household-chemicals", cost: 600, price: 900 },
            { name: "Жидкое мыло 500мл", sku: "BHM-SOP-500", cat: "household-chemicals", cost: 500, price: 800 },
            { name: "Чистящее средство для ванной", sku: "BHM-BTH-01", cat: "household-chemicals", cost: 700, price: 1100 },
            { name: "Средство для стёкол 500мл", sku: "BHM-GLS-500", cat: "household-chemicals", cost: 550, price: 850 },
            { name: "Отбеливатель 1л", sku: "BHM-BLC-1L", cat: "household-chemicals", cost: 400, price: 650 },
            { name: "Кондиционер для белья 2л", sku: "BHM-SFT-2L", cat: "household-chemicals", cost: 1800, price: 2800 },
            { name: "Набор губок 10шт", sku: "BHM-SPG-10", cat: "household-chemicals", cost: 500, price: 800 },

            // Продукты питания (8 items, 500–15000 ₸)
            { name: "Масло подсолнечное 1л", sku: "FD-OIL-1L", cat: "food", cost: 800, price: 1200 },
            { name: "Рис Басмати 1кг", sku: "FD-RCE-1K", cat: "food", cost: 1200, price: 1800 },
            { name: "Чай Greenfield 100 пак", sku: "FD-TEA-100", cat: "food", cost: 1500, price: 2300 },
            { name: "Кофе Jacobs 230г", sku: "FD-CFF-230", cat: "food", cost: 2500, price: 3800 },
            { name: "Сахар 1кг", sku: "FD-SGR-1K", cat: "food", cost: 400, price: 600 },
            { name: "Мука высший сорт 2кг", sku: "FD-FLR-2K", cat: "food", cost: 600, price: 900 },
            { name: "Макароны Barilla 500г", sku: "FD-PST-500", cat: "food", cost: 500, price: 800 },
            { name: "Набор специй 12шт", sku: "FD-SPC-12", cat: "food", cost: 3000, price: 4500 },

            // Электроника (9 items, 15000–120000 ₸)
            { name: "Наушники JBL Tune 520BT", sku: "EL-JBL-520", cat: "electronics", cost: 18000, price: 25000 },
            { name: "Мышь Logitech M330", sku: "EL-LOG-M33", cat: "electronics", cost: 8000, price: 12000 },
            { name: "Клавиатура Logitech K380", sku: "EL-LOG-K38", cat: "electronics", cost: 15000, price: 22000 },
            { name: "Колонка JBL Flip 6", sku: "EL-JBL-FL6", cat: "electronics", cost: 35000, price: 48000 },
            { name: "Веб-камера Logitech C920", sku: "EL-LOG-C92", cat: "electronics", cost: 25000, price: 35000 },
            { name: "Powerbank Xiaomi 20000mAh", sku: "EL-XIA-PB2", cat: "electronics", cost: 8000, price: 15000 },
            { name: "USB-хаб 4 порта", sku: "EL-USB-HUB", cat: "electronics", cost: 3500, price: 5500 },
            { name: "Монитор Samsung 24\"", sku: "EL-SAM-M24", cat: "electronics", cost: 75000, price: 105000 },
            { name: "Планшет Samsung Tab A9", sku: "EL-SAM-TA9", cat: "electronics", cost: 85000, price: 120000 },

            // Одежда (8 items, 3000–45000 ₸)
            { name: "Футболка базовая хлопок", sku: "CLO-TSH-BS", cat: "clothing", cost: 2000, price: 3500 },
            { name: "Джинсы классические", sku: "CLO-JNS-CL", cat: "clothing", cost: 6000, price: 9500 },
            { name: "Куртка зимняя утеплённая", sku: "CLO-JCK-WN", cat: "clothing", cost: 25000, price: 42000 },
            { name: "Кроссовки спортивные", sku: "CLO-SNK-SP", cat: "clothing", cost: 12000, price: 19000 },
            { name: "Рубашка офисная", sku: "CLO-SHR-OF", cat: "clothing", cost: 5000, price: 8500 },
            { name: "Худи оверсайз", sku: "CLO-HOD-OV", cat: "clothing", cost: 6500, price: 11000 },
            { name: "Шапка вязаная", sku: "CLO-HAT-KN", cat: "clothing", cost: 2000, price: 3500 },
            { name: "Носки набор 5 пар", sku: "CLO-SCK-5P", cat: "clothing", cost: 1500, price: 2800 },

            // Хозтовары (8 items, 1000–25000 ₸)
            { name: "Набор отвёрток 12шт", sku: "HZ-SCD-12", cat: "household-goods", cost: 3500, price: 5500 },
            { name: "Лампочка LED 12W", sku: "HZ-LED-12W", cat: "household-goods", cost: 600, price: 1000 },
            { name: "Удлинитель 5м 4 розетки", sku: "HZ-EXT-5M", cat: "household-goods", cost: 2000, price: 3200 },
            { name: "Перчатки рабочие", sku: "HZ-GLV-WR", cat: "household-goods", cost: 800, price: 1200 },
            { name: "Дрель-шуруповёрт аккум.", sku: "HZ-DRL-AK", cat: "household-goods", cost: 15000, price: 24000 },
            { name: "Рулетка 5м", sku: "HZ-TPM-5M", cat: "household-goods", cost: 1000, price: 1500 },
            { name: "Изолента ПВХ 20м", sku: "HZ-IZL-20", cat: "household-goods", cost: 300, price: 500 },
            { name: "Набор свёрл 10шт", sku: "HZ-BIT-10", cat: "household-goods", cost: 2500, price: 4000 },
        ];

        const dbProducts: any[] = [];
        for (const p of productsData) {
            const { data, error } = await supabase.from("products").insert({
                name: p.name,
                sku: p.sku,
                category_id: catMap[p.cat],
                warehouse_id: whAlmaty,
                cost_price: p.cost,
                sales_price: p.price,
                total_stock: 0,
                low_stock_threshold: Math.floor(Math.random() * 10) + 5,
            }).select("*").single();
            if (error) throw new Error("Product insert " + p.sku + ": " + error.message);
            dbProducts.push(data);
        }
        console.log(`Created ${dbProducts.length} products.`);

        // ──────────────────────────────────────────
        // Step 4: Initial purchases (stock up)
        // ──────────────────────────────────────────
        console.log("Step 4: Creating initial purchases...");

        const purchaseConfigs = [
            { supplier: dbSuppliers[0], warehouse: whAlmaty },
            { supplier: dbSuppliers[1], warehouse: whAstana },
            { supplier: dbSuppliers[2], warehouse: whAlmaty },
            { supplier: dbSuppliers[3], warehouse: whAstana },
            { supplier: dbSuppliers[0], warehouse: whAstana },
            { supplier: dbSuppliers[1], warehouse: whAlmaty },
        ];

        for (let pi = 0; pi < purchaseConfigs.length; pi++) {
            const { supplier, warehouse } = purchaseConfigs[pi];
            const purchaseItems: { product_id: string; quantity: number; unit_cost: number }[] = [];
            let totalAmount = 0;

            // Pick 8–12 random products per purchase
            const numItems = 8 + Math.floor(Math.random() * 5);
            const shuffled = [...dbProducts].sort(() => Math.random() - 0.5);
            const selected = shuffled.slice(0, numItems);

            for (const prod of selected) {
                const qty = 30 + Math.floor(Math.random() * 71); // 30–100
                purchaseItems.push({
                    product_id: prod.id,
                    quantity: qty,
                    unit_cost: prod.cost_price || 0,
                });
                totalAmount += (prod.cost_price || 0) * qty;
            }

            const purchaseDate = new Date(2026, 0, 20 + pi * 2).toISOString(); // Jan 20, 22, 24, 26, 28, 30

            const { data: purchase, error: purErr } = await supabase.from("purchases").insert({
                supplier_id: supplier.id,
                supplier_name: supplier.name,
                warehouse_id: warehouse,
                total_amount: totalAmount,
                status: "completed",
                received_at: purchaseDate,
                created_at: purchaseDate,
                notes: `Закупка #${pi + 1}`,
            }).select("*").single();
            if (purErr) throw new Error("Purchase insert: " + purErr.message);

            await supabase.from("purchase_items").insert(
                purchaseItems.map(item => ({ ...item, purchase_id: purchase.id, created_at: purchaseDate }))
            );

            // Expense transaction
            currentWalletBalance -= totalAmount;
            await supabase.from("transactions").insert({
                wallet_id: wallet.id,
                type: "expense",
                amount: totalAmount,
                reference_type: "purchase",
                reference_id: purchase.id,
                description: `Оплата закупки от ${supplier.name}`,
                created_at: purchaseDate,
            });

            // Update stocks
            for (const item of purchaseItems) {
                const { data: existing } = await supabase.from("product_stocks")
                    .select("*").eq("product_id", item.product_id).eq("warehouse_id", warehouse).maybeSingle();

                if (existing) {
                    await supabase.from("product_stocks").update({ quantity: existing.quantity + item.quantity }).eq("id", existing.id);
                } else {
                    await supabase.from("product_stocks").insert({ product_id: item.product_id, warehouse_id: warehouse, quantity: item.quantity });
                }

                // Recalc total_stock
                const { data: allStocks } = await supabase.from("product_stocks").select("quantity").eq("product_id", item.product_id);
                const total = allStocks?.reduce((acc, s) => acc + s.quantity, 0) || 0;
                await supabase.from("products").update({ total_stock: total }).eq("id", item.product_id);

                // Stock movement
                await supabase.from("stock_movements").insert({
                    product_id: item.product_id,
                    warehouse_id: warehouse,
                    quantity: item.quantity,
                    type: "inbound",
                    reference_id: purchase.id,
                    created_at: purchaseDate,
                });
            }
        }
        console.log("6 purchases created.");

        // ──────────────────────────────────────────
        // Step 5: Daily orders 01.02.2026 – 25.03.2026
        // ──────────────────────────────────────────
        console.log("Step 5: Generating daily orders...");

        const startDate = new Date(2026, 1, 1); // Feb 1
        const endDate = new Date(2026, 2, 25);  // Mar 25
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        let totalOrdersCreated = 0;

        // Pre-fetch current stock state for efficiency
        const stockCache: Record<string, { id: string; quantity: number; warehouse_id: string }[]> = {};
        for (const prod of dbProducts) {
            const { data: stocks } = await supabase.from("product_stocks").select("*").eq("product_id", prod.id);
            stockCache[prod.id] = stocks || [];
        }

        for (let day = 0; day < totalDays; day++) {
            const currentDay = new Date(startDate);
            currentDay.setDate(currentDay.getDate() + day);

            const ordersToday = 5 + Math.floor(Math.random() * 21); // 5–25

            for (let o = 0; o < ordersToday; o++) {
                const customer = dbCustomers[Math.floor(Math.random() * dbCustomers.length)];

                // Random time 08:00–22:00
                const hour = 8 + Math.floor(Math.random() * 14);
                const minute = Math.floor(Math.random() * 60);
                const orderTime = new Date(currentDay);
                orderTime.setHours(hour, minute, Math.floor(Math.random() * 60), 0);
                const orderTimestamp = orderTime.toISOString();

                // Determine status
                const statusRoll = Math.random();
                let status: string;
                if (statusRoll < 0.85) status = "delivered";
                else if (statusRoll < 0.95) status = "pending";
                else status = "cancelled";

                // Pick 1–4 products
                const numItems = 1 + Math.floor(Math.random() * 4);
                const shuffled = [...dbProducts].sort(() => Math.random() - 0.5);
                const orderItems: { product_id: string; quantity: number; unit_price: number; stockEntry: any }[] = [];
                let totalAmount = 0;

                for (let i = 0; i < numItems; i++) {
                    const prod = shuffled[i];
                    const stocks = stockCache[prod.id];
                    if (!stocks || stocks.length === 0) continue;

                    // Find a stock entry with enough quantity
                    const stockEntry = stocks.find(s => s.quantity >= 2);
                    if (!stockEntry) continue;

                    // Already in this order?
                    if (orderItems.find(oi => oi.product_id === prod.id)) continue;

                    const qty = 1 + Math.floor(Math.random() * Math.min(5, stockEntry.quantity));
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

                // Only process stock/finance for delivered orders
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
                        // Deduct from cache
                        oi.stockEntry.quantity -= oi.quantity;

                        // DB update
                        await supabase.from("product_stocks")
                            .update({ quantity: oi.stockEntry.quantity })
                            .eq("id", oi.stockEntry.id);

                        // Recalc total_stock from cache
                        const productStocks = stockCache[oi.product_id];
                        const newTotal = productStocks.reduce((s, st) => s + st.quantity, 0);
                        await supabase.from("products").update({ total_stock: newTotal }).eq("id", oi.product_id);

                        // Stock movement
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
            }

            if ((day + 1) % 10 === 0) {
                console.log(`Day ${day + 1}/${totalDays} done. Orders so far: ${totalOrdersCreated}`);
            }
        }
        console.log(`Total orders created: ${totalOrdersCreated}`);

        // ──────────────────────────────────────────
        // Step 6: Final sync
        // ──────────────────────────────────────────
        console.log("Step 6: Final sync...");

        // Sync wallet balance
        await supabase.from("wallets").update({ balance: currentWalletBalance }).eq("id", wallet.id);

        // Final total_stock sync from actual product_stocks
        for (const prod of dbProducts) {
            const { data: allStocks } = await supabase.from("product_stocks").select("quantity").eq("product_id", prod.id);
            const total = allStocks?.reduce((acc, s) => acc + s.quantity, 0) || 0;
            await supabase.from("products").update({ total_stock: total }).eq("id", prod.id);
        }

        console.log("=== SEED FULL: Complete! ===");

        return NextResponse.json({
            success: true,
            message: `Seeded: 6 categories, 50 products, 8 customers, 4 suppliers, 2 warehouses, 6 purchases, ${totalOrdersCreated} orders (${totalDays} days)`,
            stats: {
                products: dbProducts.length,
                orders: totalOrdersCreated,
                days: totalDays,
                walletBalance: currentWalletBalance,
            },
        });
    } catch (error: any) {
        console.error("SEED FULL error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
