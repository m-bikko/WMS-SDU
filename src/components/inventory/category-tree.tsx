"use client"

import * as React from "react"
import { ChevronRight, Folder, MoreHorizontal, Trash, Package } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { CategoryDialog } from "@/components/inventory/category-dialog"
import { deleteCategory, type Category } from "@/lib/api/categories"
import { type Product } from "@/lib/api/products"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

interface CategoryTreeProps {
    categories: Category[]
    products?: Product[]
    parentId?: string | null
    level?: number
}

export function CategoryTree({ categories, products = [], parentId = null, level = 0 }: CategoryTreeProps) {
    const router = useRouter()
    const currentCategories = categories.filter((c) => c.parent_id === parentId)
    const currentProducts = products.filter((p) => p.category_id === parentId)

    if (currentCategories.length === 0 && currentProducts.length === 0) return null

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this category?")) {
            await deleteCategory(id)
            router.refresh()
        }
    }

    return (
        <div className={cn("space-y-1", level > 0 && "pl-4")}>
            {currentCategories.map((category) => {
                const hasChildren = categories.some((c) => c.parent_id === category.id) || products.some(p => p.category_id === category.id)

                return (
                    <Collapsible key={category.id}>
                        <div className="flex items-center justify-between rounded-md border p-2 hover:bg-muted/50">
                            <div className="flex items-center gap-2">
                                {hasChildren ? (
                                    <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                            <ChevronRight className="h-4 w-4" />
                                            <span className="sr-only">Toggle</span>
                                        </Button>
                                    </CollapsibleTrigger>
                                ) : (
                                    <div className="w-6" />
                                )}
                                <Folder className="h-4 w-4 text-blue-500 fill-blue-500/20" />
                                <span className="font-medium">{category.name}</span>
                                {category.description && (
                                    <span className="ml-2 text-sm text-muted-foreground hidden sm:inline-block">
                                        - {category.description}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <CategoryDialog category={category} categories={categories} />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">More</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => handleDelete(category.id)}
                                        >
                                            <Trash className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <CollapsibleContent>
                            <CategoryTree categories={categories} products={products} parentId={category.id} level={level + 1} />
                        </CollapsibleContent>
                    </Collapsible>
                )
            })}

            {currentProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-md border p-2 ml-6 hover:bg-muted/50 bg-muted/20">
                    <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{product.name}</span>
                        <span className="text-xs text-muted-foreground">({product.sku})</span>
                    </div>
                </div>
            ))}
        </div>
    )
}
