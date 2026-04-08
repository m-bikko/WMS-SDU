import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const ipUsers = [
        { email: "abdrakhmanov.ak@gmail.com", password: "Abdrakhmanov2026!", name: "ИП Абдрахманов А.К." },
        { email: "bekova.gm@mail.kz", password: "Bekova2026!", name: "ИП Бекова Г.М." },
        { email: "suleimenov.db@bk.ru", password: "Suleimenov2026!", name: "ИП Сулейменов Д.Б." },
    ];

    const results: Array<{ email: string; status: string; userId?: string; error?: string }> = [];

    for (const u of ipUsers) {
        const { data, error } = await supabase.auth.admin.createUser({
            email: u.email,
            password: u.password,
            email_confirm: true,
            user_metadata: { name: u.name },
        });

        if (error) {
            results.push({ email: u.email, status: "error", error: error.message });
        } else {
            results.push({ email: u.email, status: "created", userId: data.user?.id });
        }
    }

    return NextResponse.json({ success: true, results });
}
