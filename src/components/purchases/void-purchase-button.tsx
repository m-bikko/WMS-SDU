"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Ban, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { voidPurchase } from "@/lib/api/purchases"

interface VoidPurchaseButtonProps {
    purchaseId: string
}

export function VoidPurchaseButton({ purchaseId }: VoidPurchaseButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isConfirming, setIsConfirming] = useState(false)
    const router = useRouter()

    const handleVoid = async () => {
        if (!isConfirming) {
            setIsConfirming(true)
            // Auto-reset confirmation after 3 seconds
            setTimeout(() => setIsConfirming(false), 3000)
            return
        }

        setIsLoading(true)
        try {
            const result = await voidPurchase(purchaseId)
            if (result && result.error) {
                toast.error(result.error)
            } else {
                toast.success("Purchase voided successfully")
                router.refresh()
            }
        } catch (error) {
            toast.error("Failed to void purchase")
            console.error(error)
        } finally {
            setIsLoading(false)
            setIsConfirming(false)
        }
    }

    return (
        <Button
            onClick={handleVoid}
            disabled={isLoading}
            variant={isConfirming ? "destructive" : "outline"}
            className={isConfirming ? "animate-pulse" : ""}
        >
            {isConfirming ? (
                <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Confirm Void?
                </>
            ) : (
                <>
                    <Ban className="mr-2 h-4 w-4" />
                    Void Purchase
                </>
            )}
        </Button>
    )
}
