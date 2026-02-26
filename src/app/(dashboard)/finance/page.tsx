import { getWallets, getTransactions, createWallet } from "@/lib/api/finance"
import { WalletManager } from "@/components/finance/wallet-manager"
import { TransactionList } from "@/components/finance/transaction-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function FinancePage() {
    let wallets = await getWallets()

    // Auto-create default wallet if none exists
    if (!wallets || wallets.length === 0) {
        const { data } = await createWallet("Main Wallet")
        if (data) {
            wallets = [data]
        }
    }

    // Prefer the wallet with the most balance/activity for demonstration
    const mainWallet = wallets && wallets.length > 0
        ? wallets.reduce((prev: any, current: any) => (prev.balance > current.balance) ? prev : current)
        : null
    const transactions = mainWallet ? await getTransactions(mainWallet.id) : []

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Finance</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {mainWallet && <WalletManager wallet={mainWallet} />}

                {/* Placeholder for future widgets */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">+₸0.00</div>
                        <p className="text-xs text-muted-foreground">Calculated from transactions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">-₸0.00</div>
                        <p className="text-xs text-muted-foreground">Calculated from transactions</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold tracking-tight">Recent Transactions</h3>
                <TransactionList transactions={transactions || []} />
            </div>
        </div>
    )
}
