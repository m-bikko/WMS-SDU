import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { getCurrentUserContext } from "@/lib/auth/current-user"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { isSuperAdmin } = await getCurrentUserContext()

    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex flex-1">
                <aside className="hidden w-64 border-r bg-muted/40 md:block">
                    <Sidebar isSuperAdmin={isSuperAdmin} />
                </aside>
                <main className="flex w-full flex-1 flex-col overflow-hidden">
                    <Header isSuperAdmin={isSuperAdmin} />
                    <div className="flex-1 overflow-y-auto p-8 md:p-12">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
