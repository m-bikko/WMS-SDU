"use client"

import dynamic from "next/dynamic"
import "swagger-ui-react/swagger-ui.css"

import React, { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false })

export default function ApiDocsPage() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    // Use our Next.js API route as a proxy to securely fetch the spec using the service role key
    const specUrl = "/api/swagger-spec"

    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function checkAuth() {
            const { data: { session } } = await supabase.auth.getSession()

            // Only allow wms-admin@gmail.com to view this page
            if (session?.user?.email === "wms-admin@gmail.com") {
                setIsAuthorized(true)
            } else {
                setIsAuthorized(false)
                router.push("/dashboard")
            }
        }
        checkAuth()
    }, [supabase, router])

    if (isAuthorized === null) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[500px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (isAuthorized === false) {
        return null // Will redirect
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2 mb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">API Documentation</h2>
                    <p className="text-muted-foreground w-full sm:w-2/3 mt-2">
                        Interactive REST API documentation generated automatically directly from your database schema by Supabase.
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-lg shadow border p-4 sm:p-6 overflow-hidden">
                <style jsx global>{`
                  /* Swagger UI Specific Overrides for dark mode and styling harmony */
                  .swagger-ui {
                      font-family: inherit;
                  }
                  .dark .swagger-ui {
                      filter: invert(88%) hue-rotate(180deg);
                  }
                  .dark .swagger-ui .opblock .opblock-summary-method {
                      color: #1a1a1a !important; 
                  }
                  .swagger-ui .info {
                      margin: 0 0 20px 0;
                  }
                  .swagger-ui .info .title {
                      color: inherit;
                  }
                  .swagger-ui .scheme-container {
                      background: transparent;
                      box-shadow: none;
                      padding: 0;
                      margin-bottom: 20px;
                  }
                `}</style>
                <SwaggerUI url={specUrl} />
            </div>
        </div>
    )
}
