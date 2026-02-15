import { CreatePurchaseForm } from "@/components/purchases/create-purchase-form"
import { getProducts } from "@/lib/api/products"
import { getWarehouses } from "@/lib/api/warehouses"

export default async function NewPurchasePage() {
    const products = await getProducts()
    const warehouses = await getWarehouses()

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">New Purchase</h2>
            </div>
            <CreatePurchaseForm products={products} warehouses={warehouses} />
        </div>
    )
}
