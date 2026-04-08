import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Truck, AlertTriangle, Wallet, ShoppingCart, ArrowDown } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUserContext } from "@/lib/auth/current-user"

export default async function DashboardPage() {
    const { userId, isSuperAdmin } = await getCurrentUserContext()
    const supabase = await createClient()

    // Fetch Key Metrics — scoped by tenant
    let productsCountQuery = supabase.from("products").select("*", { count: 'exact', head: true })
    if (!isSuperAdmin) productsCountQuery = productsCountQuery.eq("owner_id", userId)
    const { count: productCount } = await productsCountQuery

    let lowStockCountQuery = supabase.from("products").select("*", { count: 'exact', head: true }).lt("total_stock", 10)
    if (!isSuperAdmin) lowStockCountQuery = lowStockCountQuery.eq("owner_id", userId)
    const { count: lowStockCount } = await lowStockCountQuery

    let revenueQuery = supabase.from("orders").select("total_amount").eq("status", "completed")
    if (!isSuperAdmin) revenueQuery = revenueQuery.eq("owner_id", userId)
    const { data: revenueData } = await revenueQuery
    const totalRevenue = revenueData?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0

    let walletQuery = supabase.from("wallets").select("balance").limit(1)
    if (!isSuperAdmin) walletQuery = walletQuery.eq("owner_id", userId)
    const { data: wallet } = await walletQuery.maybeSingle()
    const walletBalance = wallet ? Number(wallet.balance) : 0

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Wallet Balance
                        </CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₸{walletBalance.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            Current funds
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <ArrowDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₸{totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            Completed orders
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Products
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{productCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Items in catalog
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Low Stock Items
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{lowStockCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Stock below threshold
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Future: Charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                            Chart placeholder
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                            List placeholder
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
