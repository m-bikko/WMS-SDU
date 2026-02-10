import { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { UserAuthForm } from "@/components/auth/user-auth-form"

export const metadata: Metadata = {
    title: "Authentication",
    description: "Authentication forms built using the components.",
}

export default function LoginPage() {
    return (
        <>
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Login to your account
                </h1>
                <p className="text-sm text-muted-foreground">
                    Enter your email below to login to your account
                </p>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
                <UserAuthForm />
            </Suspense>
            <p className="px-8 text-center text-sm text-muted-foreground">
                <Link
                    href="/signup"
                    className="hover:text-brand underline underline-offset-4"
                >
                    Don&apos;t have an account? Sign Up
                </Link>
            </p>
        </>
    )
}
