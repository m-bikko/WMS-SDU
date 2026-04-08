"use client"

import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/layout/sidebar"
import { UserNav } from "@/components/layout/user-nav"

export function Header({ isSuperAdmin = false }: { isSuperAdmin?: boolean }) {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-8 md:px-12">
                {/* Mobile Menu */}
                <div className="mr-4 md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 pt-6">
                            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                            <Sidebar isSuperAdmin={isSuperAdmin} />
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Desktop Logo / Breadcrumbs could go here */}
                <div className="mr-4 hidden md:flex">
                    <a className="mr-6 flex items-center space-x-2" href="/">
                        <span className="hidden font-bold sm:inline-block">
                            {isSuperAdmin ? "WMS · Super Admin" : "WMS"}
                        </span>
                    </a>
                </div>

                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* Search Input Placeholder */}
                    </div>
                    <UserNav />
                </div>
            </div>
        </header>
    )
}
