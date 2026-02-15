import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { type Database } from "@/lib/types/supabase"
import { format } from "date-fns"
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"

type Transaction = Database["public"]["Tables"]["transactions"]["Row"]

interface TransactionListProps {
    transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                No transactions found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        transactions.map((tx) => (
                            <TableRow key={tx.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {tx.type === "income" ? (
                                            <ArrowDownLeft className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <ArrowUpRight className="h-4 w-4 text-red-500" />
                                        )}
                                        <span className="capitalize">{tx.type}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{tx.description || "-"}</TableCell>
                                <TableCell className="capitalize text-muted-foreground">
                                    {tx.reference_type}
                                </TableCell>
                                <TableCell>
                                    {tx.created_at ? format(new Date(tx.created_at), "MMM d, yyyy HH:mm") : "-"}
                                </TableCell>
                                <TableCell className={`text-right font-medium ${tx.type === "income" ? "text-green-600" : "text-red-600"
                                    }`}>
                                    {tx.type === "income" ? "+" : "-"}₸{Number(tx.amount).toFixed(2)}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
