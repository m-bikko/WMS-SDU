"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createCustomer, updateCustomer, Customer } from "@/lib/api/customers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Plus } from "lucide-react"

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
})

interface CustomerDialogProps {
    customer?: Customer; // If provided, we are in Edit mode
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
}

export function CustomerDialog({ customer, open: externalOpen, onOpenChange: externalOnOpenChange, trigger }: CustomerDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const isControlled = externalOpen !== undefined && externalOnOpenChange !== undefined
    const open = isControlled ? externalOpen : internalOpen
    const setOpen = isControlled ? externalOnOpenChange : setInternalOpen

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
        },
    })

    // Reset form when opening/closing or when customer changes
    useEffect(() => {
        if (open) {
            if (customer) {
                form.reset({
                    name: customer.name || "",
                    email: customer.email || "",
                    phone: customer.phone || "",
                    address: customer.address || "",
                })
            } else {
                form.reset({
                    name: "",
                    email: "",
                    phone: "",
                    address: "",
                })
            }
        }
    }, [open, customer, form])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            if (customer) {
                await updateCustomer(customer.id, values)
                toast.success("Customer updated")
            } else {
                await createCustomer(values)
                toast.success("Customer created")
            }
            setOpen(false)
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error(`Failed to ${customer ? 'update' : 'create'} customer`)
        } finally {
            setIsLoading(false)
        }
    }

    const defaultTrigger = (
        <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
    )

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger !== null && (
                <DialogTrigger asChild>
                    {trigger || defaultTrigger}
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{customer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
                    <DialogDescription>
                        {customer ? 'Update the details for this customer.' : 'Create a new customer profile.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Acme Corp" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="contact@acme.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+1 234 567 890" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123 Main St" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Saving..." : customer ? "Update Customer" : "Save Customer"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
