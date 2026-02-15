"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProductSheet } from "@/components/inventory/product-sheet"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Trash } from "lucide-react"
import { deleteProduct, type Product } from "@/lib/api/products"
import { type Category } from "@/lib/api/categories"
import { type Database } from "@/lib/types/supabase"
import { toast } from "sonner"

type Warehouse = Database["public"]["Tables"]["warehouses"]["Row"]

interface ProductActionsProps {
    product: Product
    categories: Category[]
    warehouses: Warehouse[]
}

export function ProductActions({ product, categories, warehouses }: ProductActionsProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this product?")) return

        try {
            setIsLoading(true)
            const result = await deleteProduct(product.id)
            if (result && result.error) {
                toast.error(result.error)
            } else {
                toast.success("Product deleted successfully")
                router.refresh()
            }
        } catch (error) {
            toast.error("Failed to delete product")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center gap-1">
            <ProductSheet product={product} categories={categories} warehouses={warehouses}>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                    <span className="sr-only">Edit</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </ProductSheet>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
                disabled={isLoading}
            >
                <span className="sr-only">Delete</span>
                <Trash className="h-4 w-4" />
            </Button>
        </div>
    )
}
