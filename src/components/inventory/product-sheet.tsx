"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Pencil, Upload, X } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createProduct, updateProduct, type Product } from "@/lib/api/products"
import { type Category } from "@/lib/api/categories"
import { AttributesEditor } from "./attributes-editor"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"

const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    sku: z.string().min(1, { message: "SKU is required." }),
    category_id: z.string().optional(),
    description: z.string().optional(),
    cost_price: z.coerce.number().min(0),
    sales_price: z.coerce.number().min(0),
    attributes: z.record(z.string(), z.string()).optional(),
})

interface ProductSheetProps {
    product?: Product
    categories: Category[]
    children?: React.ReactNode
}

export function ProductSheet({ product, categories, children }: ProductSheetProps) {
    const [open, setOpen] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [images, setImages] = useState<string[]>(product?.images || [])
    const router = useRouter()
    const supabase = createClient()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: product?.name || "",
            sku: product?.sku || "",
            category_id: product?.category_id || "null",
            description: product?.description || "",
            cost_price: product?.cost_price || 0,
            sales_price: product?.sales_price || 0,
            attributes: product?.attributes || {},
        },
    })

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            if (!e.target.files || e.target.files.length === 0) {
                return
            }

            const file = e.target.files[0]
            const fileExt = file.name.split(".").pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from("product-images")
                .upload(filePath, file)

            if (uploadError) {
                if (uploadError.message.includes("Bucket not found")) {
                    toast.error("Storage bucket 'product-images' not found. Please create it in Supabase.")
                } else {
                    toast.error(uploadError.message)
                }
                return
            }

            const { data } = supabase.storage.from("product-images").getPublicUrl(filePath)

            if (data) {
                setImages([...images, data.publicUrl])
                toast.success("Image uploaded")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error uploading image")
        } finally {
            setUploading(false)
            // Clear input
            e.target.value = ""
        }
    }

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index))
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData()
        formData.append("name", values.name)
        formData.append("sku", values.sku)
        formData.append("category_id", values.category_id === "null" ? "" : values.category_id || "")
        formData.append("description", values.description || "")
        formData.append("cost_price", values.cost_price.toString())
        formData.append("sales_price", values.sales_price.toString())
        formData.append("attributes", JSON.stringify(values.attributes || {}))
        formData.append("images", JSON.stringify(images))

        try {
            if (product) {
                await updateProduct(product.id, formData)
                toast.success("Product updated successfully")
            } else {
                await createProduct(formData)
                toast.success("Product created successfully")
            }
            setOpen(false)
            form.reset()
            setImages([])
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Failed to save product")
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {children || (
                    <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle>{product ? "Edit Product" : "Add Product"}</SheetTitle>
                    <SheetDescription>
                        {product ? "Edit existing product details." : "Add a new product to inventory."}
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* ... Existing fields ... */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="iPhone 15" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="sku"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>SKU</FormLabel>
                                            <FormControl>
                                                <Input placeholder="IPH-15-BLK" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="cost_price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cost Price</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="sales_price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sales Price</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="category_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="null">None</SelectItem>
                                                {categories.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.name}
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
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Product description..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Image Upload Section */}
                            <div className="space-y-4">
                                <FormLabel>Images</FormLabel>
                                <div className="grid grid-cols-3 gap-4">
                                    {images.map((url, index) => (
                                        <div key={index} className="relative aspect-square rounded-md border overflow-hidden group">
                                            <Image
                                                src={url}
                                                alt={`Product image ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="flex flex-col items-center justify-center aspect-square rounded-md border border-dashed hover:bg-muted/50 cursor-pointer">
                                        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                                        <span className="text-xs text-muted-foreground">{uploading ? "Uploading..." : "Upload Image"}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="rounded-md border p-4">
                                <AttributesEditor
                                    initialAttributes={form.getValues("attributes") as Record<string, string>}
                                    onChange={(attrs) => form.setValue("attributes", attrs)}
                                />
                            </div>

                            <SheetFooter>
                                <Button type="submit" disabled={uploading}>Save changes</Button>
                            </SheetFooter>
                        </form>
                    </Form>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
