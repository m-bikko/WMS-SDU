import Link from "next/link"
import { getSuppliers } from "@/lib/api/suppliers"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Plus, Building2, Phone, Mail, MapPin } from "lucide-react"

export default async function SuppliersPage() {
    const suppliers = await getSuppliers()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Suppliers</h2>
                <div className="flex items-center space-x-2">
                    <Link href="/suppliers/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Supplier
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>No.</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact Person</TableHead>
                            <TableHead>Contact Info</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {suppliers && suppliers.length > 0 ? (
                            suppliers.map((supplier, index) => (
                                <TableRow key={supplier.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center">
                                            <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {supplier.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>{supplier.contact_name || "-"}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col space-y-1 text-sm">
                                            {supplier.phone && (
                                                <div className="flex items-center">
                                                    <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                                                    {supplier.phone}
                                                </div>
                                            )}
                                            {supplier.email && (
                                                <div className="flex items-center">
                                                    <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                                                    {supplier.email}
                                                </div>
                                            )}
                                            {!supplier.phone && !supplier.email && "-"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {supplier.address ? (
                                            <div className="flex items-center">
                                                <MapPin className="mr-2 h-3 w-3 text-muted-foreground" />
                                                <span className="truncate max-w-[200px]">{supplier.address}</span>
                                            </div>
                                        ) : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {/* Actions will go here (Edit/Delete) */}
                                        <Button variant="ghost" size="sm" disabled>Edit (Coming Soon)</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No suppliers found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
