import { addDays, format, subDays } from "date-fns"

export type SalesData = {
    date: string
    revenue: number
    orders: number
}

export type CategoryData = {
    name: string
    value: number
}

export type ActivityLog = {
    id: string
    type: "inbound" | "outbound" | "adjustment"
    product: string
    quantity: number
    date: string
    user: string
}

// Use a fixed date to avoid hydration mismatches due to time/date changes
const REFERENCE_DATE = new Date("2024-01-01T12:00:00")

export const generateSalesData = (days: number = 30): SalesData[] => {
    const data: SalesData[] = []
    for (let i = days; i >= 0; i--) {
        const date = subDays(REFERENCE_DATE, i)
        // Deterministic pseudo-random based on index 'i'
        const baseRevenue = 1000 + ((i * 137) % 4000)
        const trend = (30 - i) * 50
        const revenue = Math.floor(baseRevenue + trend)
        const orders = Math.floor(revenue / (50 + ((i * 29) % 50)))

        data.push({
            date: format(date, "MMM dd"),
            revenue,
            orders,
        })
    }
    return data
}

export const categoryData: CategoryData[] = [
    { name: "Electronics", value: 45000 },
    { name: "Clothing", value: 32000 },
    { name: "Home & Garden", value: 28000 },
    { name: "Toys", value: 15000 },
    { name: "Books", value: 8000 },
]

export const generateRecentActivity = (count: number = 10): ActivityLog[] => {
    const types: ActivityLog["type"][] = ["inbound", "outbound", "adjustment"]
    const products = ["iPhone 15", "Samsung TV", "Office Chair", "Running Shoes", "Desk Lamp", "Bluetooth Speaker"]
    const users = ["Admin", "Warehouse Mgr", "System"]

    return Array.from({ length: count }).map((_, i) => ({
        id: `act-${i}`,
        // Deterministic selection based on index
        type: types[i % types.length],
        product: products[i % products.length],
        quantity: ((i * 17) % 50) + 1,
        date: format(subDays(REFERENCE_DATE, i % 5), "MMM dd, HH:mm"),
        user: users[i % users.length],
    }))
}

export const kpiData = {
    totalRevenue: { value: "₸124,500", change: "+12.5%" },
    activeOrders: { value: "45", change: "-2.3%" },
    lowStockItems: { value: "12", change: "+4" },
    totalInventoryValue: { value: "₸450,200", change: "+5.1%" },
}
