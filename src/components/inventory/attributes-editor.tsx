"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"

interface AttributesEditorProps {
    initialAttributes: Record<string, string>
    onChange: (attributes: Record<string, string>) => void
}

export function AttributesEditor({ initialAttributes, onChange }: AttributesEditorProps) {
    const [attributes, setAttributes] = useState<{ key: string; value: string }[]>(
        Object.entries(initialAttributes || {}).map(([key, value]) => ({ key, value }))
    )

    useEffect(() => {
        const newAttributesOb: Record<string, string> = {}
        attributes.forEach((attr) => {
            if (attr.key) newAttributesOb[attr.key] = attr.value
        })
        onChange(newAttributesOb)
    }, [attributes, onChange])

    const addAttribute = () => {
        setAttributes([...attributes, { key: "", value: "" }])
    }

    const removeAttribute = (index: number) => {
        const newAttrs = [...attributes]
        newAttrs.splice(index, 1)
        setAttributes(newAttrs)
    }

    const updateAttribute = (index: number, field: "key" | "value", value: string) => {
        const newAttrs = [...attributes]
        newAttrs[index][field] = value
        setAttributes(newAttrs)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label>Dynamic Attributes</Label>
                <Button type="button" variant="outline" size="sm" onClick={addAttribute}>
                    <Plus className="mr-2 h-4 w-4" /> Add Attribute
                </Button>
            </div>

            {attributes.length === 0 && (
                <p className="text-sm text-muted-foreground">No attributes defined.</p>
            )}

            {attributes.map((attr, index) => (
                <div key={index} className="flex items-center gap-2">
                    <Input
                        placeholder="Key (e.g. Color)"
                        value={attr.key}
                        onChange={(e) => updateAttribute(index, "key", e.target.value)}
                        className="flex-1"
                    />
                    <Input
                        placeholder="Value (e.g. Red)"
                        value={attr.value}
                        onChange={(e) => updateAttribute(index, "value", e.target.value)}
                        className="flex-1"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAttribute(index)}
                    >
                        <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            ))}
        </div>
    )
}
