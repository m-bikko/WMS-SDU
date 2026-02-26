"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Minus, Wallet } from "lucide-react"
import { toast } from "sonner"
import { addFundsAction, withdrawFundsAction } from "@/app/(dashboard)/finance/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type Database } from "@/lib/types/supabase"

type Wallet = Database["public"]["Tables"]["wallets"]["Row"]

interface WalletManagerProps {
    wallet: Wallet
}

export function WalletManager({ wallet }: WalletManagerProps) {
    const [open, setOpen] = useState(false)
    const [mode, setMode] = useState<"add" | "withdraw">("add")
    const [isLoading, setIsLoading] = useState(false)
    const [reason, setReason] = useState("")

    async function onSubmit(formData: FormData) {
        setIsLoading(true)
        try {
            const result = mode === "add"
                ? await addFundsAction(formData)
                : await withdrawFundsAction(formData)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(mode === "add" ? "Funds added successfully" : "Funds withdrawn successfully")
                setOpen(false)
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {Number(wallet.balance).toLocaleString("ru-RU", { style: "currency", currency: wallet.currency || "KZT", maximumFractionDigits: 0 })}
                </div>
                <div className="mt-4 flex flex-col gap-2">
                    <Button size="sm" onClick={() => { setMode("add"); setOpen(true) }} className="w-full">
                        <Plus className="mr-2 h-4 w-4" /> Add Funds
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setMode("withdraw"); setOpen(true) }} className="w-full">
                        <Minus className="mr-2 h-4 w-4" /> Withdraw
                    </Button>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{mode === "add" ? "Add Funds" : "Withdraw Funds"}</DialogTitle>
                                <DialogDescription>
                                    {mode === "add"
                                        ? "Add money to your wallet balance."
                                        : "Withdraw money from your wallet balance."}
                                </DialogDescription>
                            </DialogHeader>
                            <form action={onSubmit} className="grid gap-4 py-4">
                                <input type="hidden" name="wallet_id" value={wallet.id} />
                                <div className="grid gap-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input
                                        id="amount"
                                        name="amount"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="reason">Reason</Label>
                                    <Select name="reason" onValueChange={setReason} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a reason" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mode === "add" ? (
                                                <>
                                                    <SelectItem value="Sales Revenue">Sales Revenue</SelectItem>
                                                    <SelectItem value="Investment">Investment</SelectItem>
                                                    <SelectItem value="Refund">Refund</SelectItem>
                                                </>
                                            ) : (
                                                <>
                                                    <SelectItem value="Procurement">Procurement</SelectItem>
                                                    <SelectItem value="Operational Expense">Operational Expense</SelectItem>
                                                    <SelectItem value="Salary">Salary</SelectItem>
                                                    <SelectItem value="Rent">Rent</SelectItem>
                                                </>
                                            )}
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {reason === "other" && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description (Required for 'Other')</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            placeholder="Please specify..."
                                            required
                                        />
                                    </div>
                                )}
                                <DialogFooter>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? "Processing..." : mode === "add" ? "Add Funds" : "Withdraw"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
    )
}
