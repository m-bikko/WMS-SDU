import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { getPurchase } from "@/lib/api/purchases"
import { ReceivePurchaseButton } from "@/components/purchases/receive-purchase-button"
import { VoidPurchaseButton } from "@/components/purchases/void-purchase-button"

interface PurchasePageProps {
    params: Promise<{
        id: string
    }>
}

export default async function PurchasePage({ params }: PurchasePageProps) {
    const { id } = await params
    const purchase = await getPurchase(id)

    if (!purchase) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/purchases">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight">Purchase Details</h2>
                </div>
                <div className="flex gap-2">
                    {purchase.status === "draft" && (
                        <ReceivePurchaseButton purchaseId={purchase.id} />
                    )}
                    {purchase.status !== "voided" && (
                        <VoidPurchaseButton purchaseId={purchase.id} />
                    )}
                    <Button variant="outline">
                        <Printer className="mr-2 h-4 w-4" />
                        Print Order
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Purchase Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Order ID:</span>
                            <span className="font-mono">{purchase.id.slice(0, 8)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Date:</span>
                            <span>{purchase.created_at ? format(new Date(purchase.created_at), "PPP p") : "-"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant={purchase.status === "received" || purchase.status === "completed" ? "default" : "secondary"}>
                                {purchase.status}
                            </Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Warehouse:</span>
                            <span>{purchase.warehouses?.name || "N/A"}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Supplier Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Name:</span>
                            <span className="font-medium">{purchase.suppliers?.name || purchase.supplier_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Contact:</span>
                            <span>{purchase.suppliers?.contact_name || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Email:</span>
                            <span>{purchase.suppliers?.email || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Phone:</span>
                            <span>{purchase.suppliers?.phone || "-"}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Items</CardTitle>
                    <CardDescription>List of products ordered in this purchase</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Unit Cost</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {purchase.purchase_items.map((item: any) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.products?.name || "Unknown Product"}</TableCell>
                                    <TableCell>{item.products?.sku || "-"}</TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                    <TableCell className="text-right">₸{Number(item.unit_cost).toFixed(2)}</TableCell>
                                    <TableCell className="text-right">₸{(item.quantity * item.unit_cost).toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Separator className="my-4" />
                    <div className="flex justify-end p-4">
                        <div className="flex gap-4 text-lg font-bold">
                            <span>Total Amount:</span>
                            <span>₸{Number(purchase.total_amount).toFixed(2)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
