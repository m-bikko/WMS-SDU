import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { SUPER_ADMIN_EMAIL } from "@/lib/auth/roles"

export const dynamic = "force-dynamic"

export async function POST() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const password = "WmsAdmin2026!"

    // Try to find existing user first
    const { data: existing } = await supabase.auth.admin.listUsers()
    const found = existing?.users.find((u) => u.email?.toLowerCase() === SUPER_ADMIN_EMAIL)

    if (found) {
        return NextResponse.json({
            success: true,
            message: "Super-admin already exists",
            credentials: { email: SUPER_ADMIN_EMAIL, password, userId: found.id },
        })
    }

    const { data, error } = await supabase.auth.admin.createUser({
        email: SUPER_ADMIN_EMAIL,
        password,
        email_confirm: true,
        user_metadata: { name: "Super Admin", role: "super_admin" },
    })

    if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
        success: true,
        message: "Super-admin created",
        credentials: { email: SUPER_ADMIN_EMAIL, password, userId: data.user?.id },
    })
}
