import { getCustomers } from "@/lib/api/customers"
import { CustomerDialog } from "@/components/customers/customer-dialog"
import { CustomerActions } from "@/components/customers/customer-actions"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { getCurrentUserContext } from "@/lib/auth/current-user"
import { redirect } from "next/navigation"

export default async function CustomersPage(props: { searchParams: Promise<{ query?: string }> }) {
    const { isSuperAdmin } = await getCurrentUserContext()
    if (!isSuperAdmin) redirect("/dashboard")

    const searchParams = await props.searchParams
    const query = searchParams?.query || ""

    // Similar error handling as Orders page
    const customers = await getCustomers(query).catch((e) => {
        console.error("Failed to fetch customers:", e)
        return []
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
                <CustomerDialog />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead className="text-right">Joined</TableHead>
                            <TableHead className="text-right w-[60px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No customers found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            customers.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell className="font-medium">{customer.name}</TableCell>
                                    <TableCell>{customer.email}</TableCell>
                                    <TableCell>{customer.phone}</TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={customer.address || ""}>
                                        {customer.address}
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {format(new Date(customer.created_at), "MMM dd, yyyy")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <CustomerActions customer={customer} />
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
