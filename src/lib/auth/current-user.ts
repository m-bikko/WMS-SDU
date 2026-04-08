import { createClient } from "@/lib/supabase/server"
import { isSuperAdminEmail } from "./roles"

export type UserContext = {
    userId: string
    email: string | null
    isSuperAdmin: boolean
}

export async function getCurrentUserContext(): Promise<UserContext> {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        throw new Error("Unauthorized")
    }

    return {
        userId: user.id,
        email: user.email ?? null,
        isSuperAdmin: isSuperAdminEmail(user.email),
    }
}
