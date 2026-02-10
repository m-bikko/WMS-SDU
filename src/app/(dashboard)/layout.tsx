import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex flex-1">
                <aside className="hidden w-64 border-r bg-muted/40 md:block">
                    <Sidebar />
                </aside>
                <main className="flex w-full flex-1 flex-col overflow-hidden">
                    <Header />
                    <div className="flex-1 overflow-y-auto p-8 md:p-12">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
