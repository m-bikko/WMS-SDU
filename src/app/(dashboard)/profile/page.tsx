import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfileForm } from "@/components/profile/profile-form"
import { Separator } from "@/components/ui/separator"

export default async function ProfilePage() {
    const supabase = await createClient()

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    if (error || !user) {
        redirect("/login")
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2 mb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
                    <p className="text-muted-foreground w-full mt-2">
                        Manage your account settings and personal information.
                    </p>
                </div>
            </div>

            <Separator className="my-6" />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="lg:w-1/5">
                    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
                        <span className="bg-muted hover:bg-muted justify-start text-sm font-medium px-4 py-2 rounded-md transition-colors">
                            Personal Details
                        </span>
                    </nav>
                </aside>
                <div className="flex-1 lg:max-w-2xl bg-white dark:bg-slate-950 p-6 rounded-lg shadow border">
                    <div className="mb-6">
                        <h3 className="text-lg font-medium">Personal Details</h3>
                        <p className="text-sm text-muted-foreground">
                            Update your name and view your active email address.
                        </p>
                    </div>
                    <ProfileForm user={user} />
                </div>
            </div>
        </div>
    )
}
