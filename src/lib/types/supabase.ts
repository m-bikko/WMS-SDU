export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "14.1"
    }
    public: {
        Tables: {
            categories: {
                Row: {
                    created_at: string | null
                    description: string | null
                    id: string
                    name: string
                    parent_id: string | null
                    path: string[] | null
                    slug: string
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    name: string
                    parent_id?: string | null
                    path?: string[] | null
                    slug: string
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    name?: string
                    parent_id?: string | null
                    path?: string[] | null
                    slug?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "categories_parent_id_fkey"
                        columns: ["parent_id"]
                        isOneToOne: false
                        referencedRelation: "categories"
                        referencedColumns: ["id"]
                    },
                ]
            }
            locations: {
                Row: {
                    code: string
                    created_at: string | null
                    description: string | null
                    id: string
                    type: string | null
                    warehouse_id: string
                }
                Insert: {
                    code: string
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    type?: string | null
                    warehouse_id: string
                }
                Update: {
                    code?: string
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    type?: string | null
                    warehouse_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "locations_warehouse_id_fkey"
                        columns: ["warehouse_id"]
                        isOneToOne: false
                        referencedRelation: "warehouses"
                        referencedColumns: ["id"]
                    },
                ]
            }
            products: {
                Row: {
                    attributes: Json | null
                    barcode_type: string | null
                    barcode_value: string | null
                    category_id: string | null
                    cost_price: number | null
                    created_at: string | null
                    description: string | null
                    discount_price: number | null
                    external_code: string | null
                    id: string
                    images: string[] | null
                    low_stock_threshold: number | null
                    name: string
                    sales_price: number | null
                    sku: string
                    tax_rate: number | null
                    total_stock: number | null
                    updated_at: string | null
                }
                Insert: {
                    attributes?: Json | null
                    barcode_type?: string | null
                    barcode_value?: string | null
                    category_id?: string | null
                    cost_price?: number | null
                    created_at?: string | null
                    description?: string | null
                    discount_price?: number | null
                    external_code?: string | null
                    id?: string
                    images?: string[] | null
                    low_stock_threshold?: number | null
                    name: string
                    sales_price?: number | null
                    sku: string
                    tax_rate?: number | null
                    total_stock?: number | null
                    updated_at?: string | null
                }
                Update: {
                    attributes?: Json | null
                    barcode_type?: string | null
                    barcode_value?: string | null
                    category_id?: string | null
                    cost_price?: number | null
                    created_at?: string | null
                    description?: string | null
                    discount_price?: number | null
                    external_code?: string | null
                    id?: string
                    images?: string[] | null
                    low_stock_threshold?: number | null
                    name?: string
                    sales_price?: number | null
                    sku?: string
                    tax_rate?: number | null
                    total_stock?: number | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "products_category_id_fkey"
                        columns: ["category_id"]
                        isOneToOne: false
                        referencedRelation: "categories"
                        referencedColumns: ["id"]
                    },
                ]
            }
            stock_movements: {
                Row: {
                    created_at: string | null
                    created_by: string | null
                    id: string
                    location_id: string | null
                    product_id: string
                    quantity: number
                    reference_id: string | null
                    type: Database["public"]["Enums"]["stock_movement_type"]
                    warehouse_id: string
                }
                Insert: {
                    created_at?: string | null
                    created_by?: string | null
                    id?: string
                    location_id?: string | null
                    product_id: string
                    quantity: number
                    reference_id?: string | null
                    type: Database["public"]["Enums"]["stock_movement_type"]
                    warehouse_id: string
                }
                Update: {
                    created_at?: string | null
                    created_by?: string | null
                    id?: string
                    location_id?: string | null
                    product_id?: string
                    quantity?: number
                    reference_id?: string | null
                    type?: Database["public"]["Enums"]["stock_movement_type"]
                    warehouse_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "stock_movements_location_id_fkey"
                        columns: ["location_id"]
                        isOneToOne: false
                        referencedRelation: "locations"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "stock_movements_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "stock_movements_warehouse_id_fkey"
                        columns: ["warehouse_id"]
                        isOneToOne: false
                        referencedRelation: "warehouses"
                        referencedColumns: ["id"]
                    },
                ]
            }
            warehouses: {
                Row: {
                    address: string | null
                    created_at: string | null
                    id: string
                    name: string
                }
                Insert: {
                    address?: string | null
                    created_at?: string | null
                    id?: string
                    name: string
                }
                Update: {
                    address?: string | null
                    created_at?: string | null
                    id?: string
                    name?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            stock_movement_type: "inbound" | "outbound" | "adjustment" | "transfer"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
    DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
    public: {
        Enums: {
            stock_movement_type: ["inbound", "outbound", "adjustment", "transfer"],
        },
    },
} as const