import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Server, Database, Code, Layout, Shield, Box } from "lucide-react"

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Technical details and project configuration.
                </p>
            </div>
            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Code className="h-5 w-5" />
                            Tech Stack
                        </CardTitle>
                        <CardDescription>Core technologies used in this project</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-center justify-between rounded-md border p-3">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Framework</p>
                                    <p className="text-sm text-muted-foreground">Next.js 15 (App Router)</p>
                                </div>
                                <Badge variant="secondary">Frontend</Badge>
                            </div>
                            <div className="flex items-center justify-between rounded-md border p-3">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Language</p>
                                    <p className="text-sm text-muted-foreground">TypeScript</p>
                                </div>
                                <Badge variant="secondary">Language</Badge>
                            </div>
                            <div className="flex items-center justify-between rounded-md border p-3">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Database & Auth</p>
                                    <p className="text-sm text-muted-foreground">Supabase (PostgreSQL)</p>
                                </div>
                                <Badge>Backend</Badge>
                            </div>
                            <div className="flex items-center justify-between rounded-md border p-3">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Styling</p>
                                    <p className="text-sm text-muted-foreground">Tailwind CSS 4 + shadcn/ui</p>
                                </div>
                                <Badge variant="outline">UI</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Box className="h-5 w-5" />
                                Project Features
                            </CardTitle>
                            <CardDescription>Key functionalities implemented</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc pl-4 space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <span className="font-medium text-foreground">Inventory Management:</span> Full CRUD for Products and Categories.
                                </li>
                                <li>
                                    <span className="font-medium text-foreground">Hierarchy:</span> Recursive Category Tree with nested products.
                                </li>
                                <li>
                                    <span className="font-medium text-foreground">Media:</span> Image uploads via Supabase Storage.
                                </li>
                                <li>
                                    <span className="font-medium text-foreground">Security:</span> Role-Based Access Control (RBAC).
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                System Health
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Status</span>
                                <Badge className="bg-green-500 hover:bg-green-600">Operational</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Environment</span>
                                <span className="font-medium capitalize">{process.env.NODE_ENV}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
