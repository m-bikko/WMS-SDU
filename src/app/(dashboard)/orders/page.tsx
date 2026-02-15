import Link from "next/link"
import { getOrders } from "@/lib/api/orders"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Plus } from "lucide-react"
import { format } from "date-fns"

export default async function OrdersPage() {
    // In a real app, this would be fetched from the DB
    // For now, it will return an empty array or error if the table doesn't exist
    // But since the user has to run the SQL manually, we will assume it might fail gracefully or just show empty
    // Actually, getOrders throws if error. So if table doesn't exist, this page will crash 500.
    // That's acceptable as it signals the user to run the migration.
    const orders = await getOrders().catch((e) => {
        // Supabase/Postgrest error for missing table is roughly "relation ... does not exist"
        // or code "42P01".
        console.error("Failed to fetch orders:", e)
        return []
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
                <Button asChild>
                    <Link href="/orders/new">
                        <Plus className="mr-2 h-4 w-4" /> Create Order
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total Amount</TableHead>
                            <TableHead className="text-right">Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/orders/${order.id}`} className="hover:underline">
                                            {order.id.slice(0, 8)}...
                                        </Link>
                                    </TableCell>
                                    <TableCell>{order.customers?.name || "Unknown"}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                order.status === "delivered" ? "default" :
                                                    order.status === "cancelled" ? "destructive" :
                                                        order.status === "shipped" ? "secondary" : "outline"
                                            }
                                        >
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        ₸{Number(order.total_amount).toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {format(new Date(order.created_at), "MMM dd, yyyy")}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
