import { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { UserAuthForm } from "@/components/auth/user-auth-form"

export const metadata: Metadata = {
    title: "Signup",
    description: "Create an account",
}

export default function SignupPage() {
    return (
        <>
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Create an account
                </h1>
                <p className="text-sm text-muted-foreground">
                    Enter your email below to create your account
                </p>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
                <UserAuthForm type="signup" />
            </Suspense>
            <p className="px-8 text-center text-sm text-muted-foreground">
                <Link
                    href="/login"
                    className="hover:text-brand underline underline-offset-4"
                >
                    Already have an account? Sign In
                </Link>
            </p>
        </>
    )
}
