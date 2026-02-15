import { getPurchases } from "@/lib/api/purchases"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

export default async function PurchasesPage() {
    const purchases = await getPurchases()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Purchases</h2>
                <Button asChild>
                    <Link href="/purchases/create">
                        <Plus className="mr-2 h-4 w-4" /> New Purchase
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Supplier</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Itmes</TableHead>
                            <TableHead className="text-right">Total Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!purchases || purchases.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No purchases found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            purchases.map((purchase) => (
                                <TableRow key={purchase.id}>
                                    <TableCell>
                                        {purchase.created_at ? format(new Date(purchase.created_at), "MMM d, yyyy") : "-"}
                                    </TableCell>
                                    <TableCell>{purchase.supplier_name}</TableCell>
                                    <TableCell>
                                        <Badge variant={purchase.status === "completed" ? "default" : "secondary"}>
                                            {purchase.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {purchase.purchase_items?.length || 0} items
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        ₸{Number(purchase.total_amount).toFixed(2)}
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
