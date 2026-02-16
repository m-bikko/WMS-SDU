"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, ClipboardList, Home, LayoutDashboard, Package, Settings, ShoppingCart, Users, ShoppingBag, Banknote, Truck, Layers } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname()

    const routes = [
        {
            label: "Dashboard",
            icon: Home,
            href: "/dashboard",
            active: pathname === "/dashboard",
        },
        {
            label: "Inventory",
            icon: ClipboardList,
            href: "/inventory",
            active: pathname === "/inventory",
        },
        {
            label: "Products",
            icon: Package,
            href: "/inventory/products",
            active: pathname.startsWith("/inventory/products"),
        },
        {
            label: "Categories",
            icon: Layers,
            href: "/inventory/categories",
            active: pathname.startsWith("/inventory/categories"),
        },
        {
            label: "Orders",
            icon: ShoppingCart,
            href: "/orders",
            active: pathname.startsWith("/orders"),
        },
        {
            label: "Purchases",
            icon: ShoppingBag,
            href: "/purchases",
            active: pathname.startsWith("/purchases"),
        },
        {
            label: "Warehouses",
            icon: Truck,
            href: "/warehouses",
            active: pathname.startsWith("/warehouses"),
        },
        {
            label: "Reports",
            icon: BarChart3,
            href: "/reports",
            active: pathname === "/reports",
        },
        {
            label: "Customers",
            icon: Users,
            href: "/customers",
            active: pathname.startsWith("/customers"),
        },
        {
            label: "Finance",
            icon: Banknote,
            href: "/finance",
            active: pathname === "/finance",
        },
        {
            label: "Settings",
            icon: Settings,
            href: "/settings",
            active: pathname === "/settings",
        },
    ]

    return (
        <div className={cn("pb-12", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        WMS Project
                    </h2>
                    <div className="space-y-1">
                        {routes.map((route) => (
                            <Button
                                key={route.href}
                                variant={route.active ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                asChild
                            >
                                <Link href={route.href}>
                                    <route.icon className="mr-2 h-4 w-4" />
                                    {route.label}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
