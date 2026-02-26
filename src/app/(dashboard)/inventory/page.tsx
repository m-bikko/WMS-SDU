import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getProducts } from "@/lib/api/products"
import { getCategories } from "@/lib/api/categories"
import { getWarehouses } from "@/lib/api/warehouses"
import { Box, Package, DollarSign } from "lucide-react"
import { WarehouseFilter } from "@/components/inventory/warehouse-filter"

interface InventoryDashboardPageProps {
    searchParams?: Promise<{
        warehouseId?: string
    }>
}

export default async function InventoryDashboardPage(props: InventoryDashboardPageProps) {
    const searchParams = await props.searchParams
    const warehouseId = searchParams?.warehouseId || ""

    const products: any[] = await getProducts("", "", warehouseId) || []
    const categories = await getCategories() || []
    const warehouses = await getWarehouses() || []

    const totalValue = products.reduce((acc, p) => acc + ((Number(p.cost_price) || 0) * (Number(p.total_stock) || 0)), 0)
    const lowStockCount = products.filter(p => (Number(p.total_stock) || 0) <= (Number(p.low_stock_threshold) || 5)).length

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Inventory Overview</h2>
                <div className="flex items-center space-x-2">
                    <WarehouseFilter warehouses={warehouses} />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{products.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
                        <Box className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{categories.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inventory Value (Cost)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalValue.toLocaleString("ru-RU", { style: "currency", currency: "KZT", maximumFractionDigits: 0 })}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Low Stock Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {lowStockCount > 0 ? (
                            <div className="space-y-2">
                                {products
                                    .filter(p => (p.total_stock || 0) <= (p.low_stock_threshold || 5))
                                    .slice(0, 5)
                                    .map(p => (
                                        <div key={p.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{p.name}</span>
                                                <span className="text-xs text-muted-foreground">{p.sku}</span>
                                            </div>
                                            <div className="text-sm font-bold text-red-500">
                                                {p.total_stock} left
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No low stock items.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
