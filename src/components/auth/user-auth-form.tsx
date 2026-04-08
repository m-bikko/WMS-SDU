"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { provisionTenant } from "@/lib/api/provision"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
    type?: "login" | "signup"
}

const formSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

type FormData = z.infer<typeof formSchema>

export function UserAuthForm({ className, type = "login", ...props }: UserAuthFormProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [error, setError] = React.useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
    })

    async function onSubmit(data: FormData) {
        setIsLoading(true)
        setError(null)
        const supabase = createClient()

        try {
            if (type === "login") {
                const { error } = await supabase.auth.signInWithPassword({
                    email: data.email,
                    password: data.password,
                })
                if (error) throw error
                router.push("/dashboard")
                router.refresh()
            } else {
                const { data: signUpData, error } = await supabase.auth.signUp({
                    email: data.email,
                    password: data.password,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback`,
                    },
                })
                if (error) throw error
                // If session was created (email confirm off) — provision tenant resources
                if (signUpData.session) {
                    await provisionTenant().catch((e) => console.error("provisionTenant failed:", e))
                    router.push("/dashboard")
                } else {
                    router.push("/dashboard?message=check-email")
                }
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-2">
                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="email">
                            Email
                        </Label>
                        <Input
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isLoading}
                            {...register("email")}
                        />
                        {errors?.email && (
                            <p className="px-1 text-xs text-red-600">
                                {errors.email.message}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="password">
                            Password
                        </Label>
                        <Input
                            id="password"
                            placeholder="Password"
                            type="password"
                            autoCapitalize="none"
                            disabled={isLoading}
                            {...register("password")}
                        />
                        {errors?.password && (
                            <p className="px-1 text-xs text-red-600">
                                {errors.password.message}
                            </p>
                        )}
                    </div>
                    {error && (
                        <div className="text-sm text-red-600">
                            {error}
                        </div>
                    )}
                    <Button disabled={isLoading}>
                        {isLoading && (
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {type === "login" ? "Sign In" : "Sign Up"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
