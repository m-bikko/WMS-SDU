"use client"

import { ProductSheet } from "@/components/inventory/product-sheet"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Trash } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteProduct, type Product } from "@/lib/api/products"
import { type Category } from "@/lib/api/categories"
import { useRouter } from "next/navigation"

interface ProductActionsProps {
    product: Product
    categories: Category[]
}

export function ProductActions({ product, categories }: ProductActionsProps) {
    const router = useRouter()

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this product?")) {
            await deleteProduct(product.id)
            router.refresh()
        }
    }

    return (
        <div className="flex items-center">
            <ProductSheet product={product} categories={categories}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <span className="sr-only">Edit</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </ProductSheet>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleDelete}>
                <Trash className="h-4 w-4" />
            </Button>
        </div>
    )
}
