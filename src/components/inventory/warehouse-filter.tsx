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
import { Warehouse } from "@/lib/api/warehouses"

interface WarehouseFilterProps {
    warehouses: Warehouse[]
}

export function WarehouseFilter({ warehouses }: WarehouseFilterProps) {
    const [open, setOpen] = React.useState(false)
    const searchParams = useSearchParams()
    const { replace } = useRouter()

    // Get current warehouse from URL
    const currentWarehouseId = searchParams.get("warehouseId")
    const [value, setValue] = React.useState(currentWarehouseId || "")

    const onSelect = (currentValue: string) => {
        // Toggle selection
        const newValue = currentValue === value ? "" : currentValue
        setValue(newValue)
        setOpen(false)

        const params = new URLSearchParams(searchParams)
        if (newValue) {
            params.set("warehouseId", newValue)
        } else {
            params.delete("warehouseId")
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
                    <span className="truncate">
                        {value
                            ? warehouses.find((w) => w.id === value)?.name
                            : "Filter by warehouse..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search warehouse..." />
                    <CommandEmpty>No warehouse found.</CommandEmpty>
                    <CommandList>
                        <CommandGroup>
                            {warehouses.map((warehouse) => (
                                <CommandItem
                                    key={warehouse.id}
                                    value={warehouse.id}
                                    onSelect={onSelect}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === warehouse.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {warehouse.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
