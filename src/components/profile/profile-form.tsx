"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Icons } from "@/components/icons"

interface ProfileFormProps extends React.HTMLAttributes<HTMLDivElement> {
    user: User
}

const profileFormSchema = z.object({
    full_name: z.string().min(2, { message: "Name must be at least 2 characters." }),
})

type ProfileFormData = z.infer<typeof profileFormSchema>

export function ProfileForm({ user, className, ...props }: ProfileFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState<boolean>(false)

    const form = useForm<ProfileFormData>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            full_name: user?.user_metadata?.full_name || "",
        },
    })

    async function onSubmit(data: ProfileFormData) {
        setIsLoading(true)
        const supabase = createClient()

        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: data.full_name }
            })

            if (error) {
                toast.error(error.message || "Failed to update profile")
            } else {
                toast.success("Profile updated successfully")
                router.refresh()
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={user.email || ""}
                            disabled
                            className="bg-muted"
                        />
                        <p className="text-[0.8rem] text-muted-foreground">
                            Your email address is managed by authentication and cannot be changed here.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                            id="full_name"
                            placeholder="John Doe"
                            disabled={isLoading}
                            {...form.register("full_name")}
                        />
                        {form.formState.errors.full_name && (
                            <p className="px-1 text-xs text-red-600">
                                {form.formState.errors.full_name.message}
                            </p>
                        )}
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-fit">
                        {isLoading && (
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    )
}
