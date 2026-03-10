import { NextResponse } from 'next/server'

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        return new NextResponse('Supabase config missing', { status: 500 })
    }

    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/`, {
            headers: {
                'apikey': serviceRoleKey,
                'Authorization': `Bearer ${serviceRoleKey}`
            }
        })

        if (!res.ok) {
            throw new Error(`Failed to fetch spec: ${res.statusText}`)
        }

        const data = await res.json()

        // Optionally rewrite host/schemes to point to our proxy or directly to supabase
        return NextResponse.json(data)
    } catch (error: unknown) {
        console.error('Swagger spec proxy error:', error)
        return new NextResponse(error instanceof Error ? error.message : 'Error fetching API spec', { status: 500 })
    }
}
