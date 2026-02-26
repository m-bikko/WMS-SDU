import { createClient } from "@/lib/supabase/server"

export async function getDashboardData() {
    const supabase = await createClient()

    // 1. Total Revenue (Completed Orders sum)
    let { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, status, created_at')

    const orders = ordersData || []

    // Total Revenue from completed orders
    const totalRevenue = orders
        .filter(o => o.status === 'completed' || o.status === 'delivered')
        .reduce((sum, o) => sum + Number(o.total_amount || 0), 0)

    // Active Orders
    const activeOrders = orders.filter(o => !['completed', 'cancelled', 'voided', 'delivered'].includes(o.status)).length

    // 2. Inventory Value & Low Stock
    let { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
            id,
            name,
            cost_price,
            total_stock,
            low_stock_threshold,
            category_id,
            categories (name)
        `)

    const products = productsData || []

    let totalInventoryValue = 0
    let lowStockItems = 0
    let categoryMap: Record<string, number> = {}

    products.forEach(p => {
        const cost = Number(p.cost_price || 0)
        const stock = Number(p.total_stock || 0)
        const val = cost * stock
        totalInventoryValue += val

        if (stock <= Number(p.low_stock_threshold || 5)) {
            lowStockItems++
        }

        const catName = (p.categories as any)?.name || 'Uncategorized'
        categoryMap[catName] = (categoryMap[catName] || 0) + val
    })

    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }))

    // 3. Sales Trend (Last 30 Days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const salesMap: Record<string, number> = {}
    for (let i = 29; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        salesMap[dateStr] = 0
    }

    orders.forEach(o => {
        if (!o.created_at || o.status === 'cancelled' || o.status === 'voided') return
        const dateStr = o.created_at.split('T')[0]
        if (salesMap[dateStr] !== undefined) {
            salesMap[dateStr] += Number(o.total_amount || 0)
        }
    })

    const salesData = Object.entries(salesMap).map(([date, revenue]) => {
        return {
            date: date,
            revenue
        }
    })

    // 4. Recent Activity (Purchases and Orders)
    let activityLog: any[] = []

    // Fetch recent purchases
    let { data: recentPurchases } = await supabase
        .from('purchases')
        .select(`
            id,
            status,
            created_at,
            purchase_items (
                quantity,
                products (name)
            )
        `)
        .order('created_at', { ascending: false })
        .limit(5)

    if (recentPurchases) {
        recentPurchases.forEach(p => {
            if (p.purchase_items && p.purchase_items.length > 0) {
                activityLog.push({
                    id: `pur-${p.id}`,
                    type: 'inbound',
                    product: (p.purchase_items[0].products as any)?.name || 'Multiple Products',
                    quantity: p.purchase_items.reduce((s: number, i: any) => s + Number(i.quantity || 0), 0),
                    user: 'System', // Could expand to show real user
                    date: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Unknown',
                    rawDate: p.created_at
                })
            }
        })
    }

    // Fetch recent orders
    let { data: recentOrders } = await supabase
        .from('orders')
        .select(`
            id,
            status,
            created_at,
            order_items (
                quantity,
                products (name)
            )
        `)
        .order('created_at', { ascending: false })
        .limit(5)

    if (recentOrders) {
        recentOrders.forEach(o => {
            if (o.order_items && o.order_items.length > 0) {
                activityLog.push({
                    id: `ord-${o.id}`,
                    type: 'outbound',
                    product: (o.order_items[0].products as any)?.name || 'Multiple Products',
                    quantity: o.order_items.reduce((s: number, i: any) => s + Number(i.quantity || 0), 0),
                    user: 'System', // Could expand to show customer name if we fetched customer
                    date: o.created_at ? new Date(o.created_at).toLocaleDateString() : 'Unknown',
                    rawDate: o.created_at
                })
            }
        })
    }

    activityLog.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime())
    activityLog = activityLog.slice(0, 8)

    return {
        totalRevenue,
        activeOrders,
        totalInventoryValue,
        lowStockItems,
        salesData,
        categoryData,
        activityLog
    }
}
