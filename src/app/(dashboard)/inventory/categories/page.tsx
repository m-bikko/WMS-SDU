import { getCategories } from "@/lib/api/categories"
import { getProducts } from "@/lib/api/products"
import { getWarehouses } from "@/lib/api/warehouses"
import { CategoryTree } from "@/components/inventory/category-tree"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CategoryDialog } from "@/components/inventory/category-dialog"

export default async function CategoriesPage() {
    const categories = await getCategories()
    const products = await getProducts()
    const warehouses = await getWarehouses()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Categories & Products</h2>
                <CategoryDialog categories={categories}>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Category
                    </Button>
                </CategoryDialog>
            </div>

            <div className="rounded-md border p-4">
                <CategoryTree categories={categories} products={products} warehouses={warehouses} />
            </div>
        </div>
    )
}
