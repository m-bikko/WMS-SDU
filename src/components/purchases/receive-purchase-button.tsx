"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BoxSelect } from "lucide-react"
import { toast } from "sonner"
import { receivePurchase } from "@/lib/api/purchases"

interface ReceivePurchaseButtonProps {
    purchaseId: string
}

export function ReceivePurchaseButton({ purchaseId }: ReceivePurchaseButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleReceive = async () => {
        setIsLoading(true)
        try {
            const result = await receivePurchase(purchaseId)
            if (result && result.error) {
                toast.error(result.error)
            } else {
                toast.success("Purchase received successfully")
                router.refresh()
            }
        } catch (error) {
            toast.error("Failed to receive purchase")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button onClick={handleReceive} disabled={isLoading}>
            <BoxSelect className="mr-2 h-4 w-4" />
            {isLoading ? "Receiving..." : "Receive Goods"}
        </Button>
    )
}
