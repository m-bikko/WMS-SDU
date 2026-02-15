import { getProducts, deleteProduct } from "@/lib/api/products"
import { getCategories } from "@/lib/api/categories"
import { getWarehouses } from "@/lib/api/warehouses"
import { ProductSheet } from "@/components/inventory/product-sheet"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ProductActions } from "./actions"
import { ProductSearch } from "@/components/inventory/product-search"
import { CategoryFilter } from "@/components/inventory/category-filter"
import { WarehouseFilter } from "@/components/inventory/warehouse-filter"

interface ProductsPageProps {
    searchParams?: Promise<{
        query?: string
        category?: string
        warehouseId?: string
    }>
}

export default async function ProductsPage(props: ProductsPageProps) {
    const searchParams = await props.searchParams
    const query = searchParams?.query || ""
    const categoryId = searchParams?.category || ""
    const warehouseId = searchParams?.warehouseId || ""

    const products = await getProducts(query, categoryId, warehouseId)
    const categories = await getCategories()
    const warehouses = await getWarehouses()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Products</h2>
                <ProductSheet categories={categories} warehouses={warehouses}>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                </ProductSheet>
            </div>

            <div className="flex items-center gap-4">
                <ProductSearch />
                <CategoryFilter categories={categories} />
                <WarehouseFilter warehouses={warehouses} />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Price (₸)</TableHead>
                            <TableHead className="text-right">Stock</TableHead>
                            <TableHead className="w-[70px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products?.map((product: any) => (
                            <TableRow key={product.id} className="h-16">
                                <TableCell>
                                    <div className="relative h-10 w-10 overflow-hidden rounded-md border bg-muted">
                                        {product.images && product.images[0] ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-muted-foreground bg-muted/50">
                                                <span className="text-[10px]">No Img</span>
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">{product.sku}</TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.categories?.name || "-"}</TableCell>
                                <TableCell className="text-right">₸{product.sales_price}</TableCell>
                                <TableCell className="text-right">
                                    {warehouseId ? (
                                        <span>
                                            {(product.stocks?.find((s: any) => s.warehouse_id === warehouseId)?.quantity || 0)}
                                        </span>
                                    ) : (
                                        <span>{product.total_stock || 0}</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <ProductActions product={product} categories={categories} warehouses={warehouses} />
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!products || products.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
