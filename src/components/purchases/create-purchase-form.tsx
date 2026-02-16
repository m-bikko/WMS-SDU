"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { type Product } from "@/lib/api/products"
import { type Warehouse } from "@/lib/api/warehouses"
import { type Supplier } from "@/lib/api/suppliers"
import { createPurchase, type CreatePurchaseItem } from "@/lib/api/purchases"
import { Separator } from "@/components/ui/separator"

interface CreatePurchaseFormProps {
    products: Product[]
    warehouses: Warehouse[]
    suppliers: Supplier[]
}

export function CreatePurchaseForm({ products, warehouses, suppliers }: CreatePurchaseFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [supplierId, setSupplierId] = useState("")
    const [warehouseId, setWarehouseId] = useState("")

    // Items state
    const [items, setItems] = useState<Array<{
        tempId: string // for React key
        productId: string
        quantity: number
        unitCost: number
    }>>([
        { tempId: "1", productId: "", quantity: 1, unitCost: 0 }
    ])

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0)
    }

    const addItem = () => {
        setItems([...items, { tempId: Math.random().toString(), productId: "", quantity: 1, unitCost: 0 }])
    }

    const removeItem = (index: number) => {
        if (items.length > 1) {
            const newItems = [...items]
            newItems.splice(index, 1)
            setItems(newItems)
        }
    }

    const updateItem = (index: number, field: keyof typeof items[0], value: any) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }

        // If product selected, maybe pre-fill cost price?
        if (field === 'productId') {
            const product = products.find(p => p.id === value)
            if (product && product.cost_price) {
                newItems[index].unitCost = Number(product.cost_price)
            }
        }

        setItems(newItems)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!supplierId) {
            toast.error("Please select a supplier")
            return
        }
        if (!warehouseId) {
            toast.error("Please select a warehouse")
            return
        }

        // Validate items
        const validItems: CreatePurchaseItem[] = []
        for (const item of items) {
            if (!item.productId) {
                toast.error("Please select a product for all items")
                return
            }
            if (item.quantity <= 0) {
                toast.error("Quantity must be greater than 0")
                return
            }
            if (item.unitCost < 0) {
                toast.error("Cost cannot be negative")
                return
            }
            validItems.push({
                productId: item.productId,
                quantity: item.quantity,
                unitCost: item.unitCost
            })
        }

        setIsLoading(true)
        try {
            const result = await createPurchase(supplierId, warehouseId, validItems)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Purchase recorded successfully")
                router.push("/purchases")
                router.refresh()
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Select value={supplierId} onValueChange={setSupplierId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Supplier" />
                        </SelectTrigger>
                        <SelectContent>
                            {suppliers && suppliers.map((s) => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="warehouse">Receiving Warehouse</Label>
                    <Select value={warehouseId} onValueChange={setWarehouseId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Warehouse" />
                        </SelectTrigger>
                        <SelectContent>
                            {warehouses.map((w) => (
                                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Separator />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Items</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                        <Plus className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                </div>

                {items.map((item, index) => (
                    <Card key={item.tempId}>
                        <CardContent className="p-4 grid gap-4 md:grid-cols-12 items-end">
                            <div className="md:col-span-5 space-y-2">
                                <Label>Product</Label>
                                <Select
                                    value={item.productId}
                                    onValueChange={(val) => updateItem(index, 'productId', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label>Quantity</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                />
                            </div>
                            <div className="md:col-span-3 space-y-2">
                                <Label>Unit Cost (₸)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.unitCost}
                                    onChange={(e) => updateItem(index, 'unitCost', Number(e.target.value))}
                                />
                            </div>
                            <div className="md:col-span-2 flex items-center gap-2">
                                <div className="text-sm font-medium text-muted-foreground pt-6">
                                    Total: ₸{(item.quantity * item.unitCost).toFixed(2)}
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:bg-destructive/10 ml-auto"
                                    onClick={() => removeItem(index)}
                                    disabled={items.length === 1}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex items-center justify-end gap-4 p-4 bg-muted/20 rounded-lg">
                <div className="text-lg font-bold">
                    Total Amount: ₸{calculateTotal().toFixed(2)}
                </div>
                <Button type="submit" disabled={isLoading} size="lg">
                    {isLoading ? "Processing..." : "Create Purchase"}
                </Button>
            </div>
        </form>
    )
}
