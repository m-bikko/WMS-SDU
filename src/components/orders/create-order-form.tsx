"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createOrder } from "@/lib/api/orders"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Database } from "@/lib/types/supabase"
import { Trash2, Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

type Product = Database["public"]["Tables"]["products"]["Row"]
type Customer = Database["public"]["Tables"]["customers"]["Row"]

const formSchema = z.object({
    customer_id: z.string().min(1, "Customer is required"),
    items: z.array(z.object({
        product_id: z.string().min(1, "Product is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        unit_price: z.number().min(0),
    })).min(1, "Order must have at least one item"),
})

export function CreateOrderForm({ products, customers }: { products: Product[], customers: Customer[] }) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            customer_id: "",
            items: [{ product_id: "", quantity: 1, unit_price: 0 }],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    })

    const watchItems = form.watch("items")
    const totalAmount = watchItems.reduce((acc, item) => {
        return acc + (item.quantity * item.unit_price)
    }, 0)

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            await createOrder(values)
            toast.success("Order created successfully")
            router.push("/orders")
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Failed to create order")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardContent className="pt-6">
                        <FormField
                            control={form.control}
                            name="customer_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Customer</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a customer" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {customers.length === 0 ? (
                                                <div className="p-2 text-sm text-muted-foreground text-center">
                                                    No customers. <Link href="/customers" className="underline">Create one first.</Link>
                                                </div>
                                            ) : (
                                                customers.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Order Items</h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append({ product_id: "", quantity: 1, unit_price: 0 })}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Item
                        </Button>
                    </div>

                    {fields.map((field, index) => (
                        <Card key={field.id}>
                            <CardContent className="pt-6 grid gap-4 md:grid-cols-4 items-end">
                                <FormField
                                    control={form.control}
                                    name={`items.${index}.product_id`}
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>Product</FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value)
                                                    const product = products.find((p) => p.id === value)
                                                    if (product) {
                                                        form.setValue(`items.${index}.unit_price`, product.sales_price || 0)
                                                    }
                                                }}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a product" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {products.map((product) => (
                                                        <SelectItem key={product.id} value={product.id}>
                                                            {product.name} (₸{product.sales_price})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`items.${index}.quantity`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Quantity</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium">
                                        Subtotal: ₸{(form.watch(`items.${index}.quantity`) * form.watch(`items.${index}.unit_price`)).toFixed(2)}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => remove(index)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                    <div className="text-xl font-bold">
                        Total: ₸{totalAmount.toFixed(2)}
                    </div>
                    <div className="flex gap-4">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Creating..." : "Create Order"}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}
