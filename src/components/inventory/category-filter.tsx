"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Category } from "@/lib/api/categories"

interface CategoryFilterProps {
    categories: Category[]
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
    const [open, setOpen] = React.useState(false)
    const searchParams = useSearchParams()
    const { replace } = useRouter()

    // Get current category from URL
    const currentCategoryId = searchParams.get("category")
    const [value, setValue] = React.useState(currentCategoryId || "")

    const onSelect = (currentValue: string) => {
        // Toggle selection
        const newValue = currentValue === value ? "" : currentValue
        setValue(newValue)
        setOpen(false)

        const params = new URLSearchParams(searchParams)
        if (newValue) {
            params.set("category", newValue)
        } else {
            params.delete("category")
        }
        replace(`${window.location.pathname}?${params.toString()}`)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="h-8 w-[200px] justify-between"
                >
                    {value
                        ? categories.find((category) => category.id === value)?.name
                        : "Filter by category..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search category..." />
                    <CommandEmpty>No category found.</CommandEmpty>
                    <CommandList>
                        <CommandGroup>
                            {categories.map((category) => (
                                <CommandItem
                                    key={category.id}
                                    value={category.id}
                                    onSelect={onSelect}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === category.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {category.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
