import { getProducts } from "@/lib/api/products"
import { getCustomers } from "@/lib/api/customers"
import { CreateOrderForm } from "@/components/orders/create-order-form"

export default async function NewOrderPage() {
    // Parallel fetching
    const [products, customers] = await Promise.all([
        getProducts(),
        getCustomers().catch(() => []) // Handle missing table gracefully
    ])

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Create Order</h2>
                <p className="text-muted-foreground">
                    Add products and details for a new sales order.
                </p>
            </div>

            <div className="max-w-3xl">
                <CreateOrderForm products={products} customers={customers} />
            </div>
        </div>
    )
}
