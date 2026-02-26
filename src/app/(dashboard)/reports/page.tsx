import { getDashboardData } from "@/lib/api/reports"
import { ReportsClient } from "./reports-client"

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
    const data = await getDashboardData()

    return <ReportsClient data={data} />
}
