"use client"

import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"

export function ProductSearch() {
    const searchParams = useSearchParams()
    const { replace } = useRouter()

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set("query", term)
        } else {
            params.delete("query")
        }
        replace(`${window.location.pathname}?${params.toString()}`)
    }, 300)

    return (
        <Input
            placeholder="Search products..."
            className="h-8 w-[150px] lg:w-[250px]"
            defaultValue={searchParams.get("query")?.toString()}
            onChange={(e) => handleSearch(e.target.value)}
        />
    )
}
