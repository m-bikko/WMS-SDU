import { getWarehouses } from "@/lib/api/warehouses"
import { WarehouseDialog } from "@/components/warehouses/warehouse-dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { MapPin } from "lucide-react"

export default async function WarehousesPage() {
    const warehouses = await getWarehouses().catch((e) => {
        console.error("Failed to fetch warehouses:", e)
        return []
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Warehouses</h2>
                <WarehouseDialog />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead className="text-right">Created</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {warehouses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    No warehouses found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            warehouses.map((warehouse) => (
                                <TableRow key={warehouse.id}>
                                    <TableCell className="font-medium">{warehouse.name}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center text-muted-foreground">
                                            <MapPin className="mr-2 h-4 w-4" />
                                            {warehouse.address || "No address"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {format(new Date(warehouse.created_at), "MMM dd, yyyy")}
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
