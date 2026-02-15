export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
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
            customers: {
                Row: {
                    address: string | null
                    created_at: string
                    email: string | null
                    id: string
                    name: string
                    phone: string | null
                    updated_at: string
                }
                Insert: {
                    address?: string | null
                    created_at?: string
                    email?: string | null
                    id?: string
                    name: string
                    phone?: string | null
                    updated_at?: string
                }
                Update: {
                    address?: string | null
                    created_at?: string
                    email?: string | null
                    id?: string
                    name?: string
                    phone?: string | null
                    updated_at?: string
                }
                Relationships: []
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
            order_items: {
                Row: {
                    created_at: string
                    id: string
                    order_id: string
                    product_id: string
                    quantity: number
                    unit_price: number
                }
                Insert: {
                    created_at?: string
                    id?: string
                    order_id: string
                    product_id: string
                    quantity: number
                    unit_price: number
                }
                Update: {
                    created_at?: string
                    id?: string
                    order_id?: string
                    product_id?: string
                    quantity?: number
                    unit_price?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "order_items_order_id_fkey"
                        columns: ["order_id"]
                        isOneToOne: false
                        referencedRelation: "orders"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "order_items_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                ]
            }
            orders: {
                Row: {
                    created_at: string
                    customer_id: string | null
                    id: string
                    status: string
                    total_amount: number
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    customer_id?: string | null
                    id?: string
                    status?: string
                    total_amount?: number
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    customer_id?: string | null
                    id?: string
                    status?: string
                    total_amount?: number
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "orders_customer_id_fkey"
                        columns: ["customer_id"]
                        isOneToOne: false
                        referencedRelation: "customers"
                        referencedColumns: ["id"]
                    },
                ]
            }
            product_stocks: {
                Row: {
                    id: string
                    product_id: string
                    quantity: number
                    updated_at: string
                    warehouse_id: string
                }
                Insert: {
                    id?: string
                    product_id: string
                    quantity?: number
                    updated_at?: string
                    warehouse_id: string
                }
                Update: {
                    id?: string
                    product_id?: string
                    quantity?: number
                    updated_at?: string
                    warehouse_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "product_stocks_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "product_stocks_warehouse_id_fkey"
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
            purchase_items: {
                Row: {
                    created_at: string
                    id: string
                    product_id: string
                    purchase_id: string
                    quantity: number
                    unit_cost: number
                }
                Insert: {
                    created_at?: string
                    id?: string
                    product_id: string
                    purchase_id: string
                    quantity: number
                    unit_cost: number
                }
                Update: {
                    created_at?: string
                    id?: string
                    product_id?: string
                    purchase_id?: string
                    quantity?: number
                    unit_cost?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "purchase_items_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "purchase_items_purchase_id_fkey"
                        columns: ["purchase_id"]
                        isOneToOne: false
                        referencedRelation: "purchases"
                        referencedColumns: ["id"]
                    },
                ]
            }
            purchases: {
                Row: {
                    created_at: string
                    id: string
                    status: Database["public"]["Enums"]["purchase_status"] | null
                    supplier_name: string | null
                    total_amount: number | null
                    updated_at: string
                    warehouse_id: string | null
                }
                Insert: {
                    created_at?: string
                    id?: string
                    status?: Database["public"]["Enums"]["purchase_status"] | null
                    supplier_name?: string | null
                    total_amount?: number | null
                    updated_at?: string
                    warehouse_id?: string | null
                }
                Update: {
                    created_at?: string
                    id?: string
                    status?: Database["public"]["Enums"]["purchase_status"] | null
                    supplier_name?: string | null
                    total_amount?: number | null
                    updated_at?: string
                    warehouse_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "purchases_warehouse_id_fkey"
                        columns: ["warehouse_id"]
                        isOneToOne: false
                        referencedRelation: "warehouses"
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
            transactions: {
                Row: {
                    amount: number
                    created_at: string
                    description: string | null
                    id: string
                    reference_id: string | null
                    reference_type: string | null
                    type: Database["public"]["Enums"]["transaction_type"]
                    wallet_id: string
                }
                Insert: {
                    amount: number
                    created_at?: string
                    description?: string | null
                    id?: string
                    reference_id?: string | null
                    reference_type?: string | null
                    type: Database["public"]["Enums"]["transaction_type"]
                    wallet_id: string
                }
                Update: {
                    amount?: number
                    created_at?: string
                    description?: string | null
                    id?: string
                    reference_id?: string | null
                    reference_type?: string | null
                    type?: Database["public"]["Enums"]["transaction_type"]
                    wallet_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "transactions_wallet_id_fkey"
                        columns: ["wallet_id"]
                        isOneToOne: false
                        referencedRelation: "wallets"
                        referencedColumns: ["id"]
                    },
                ]
            }
            wallets: {
                Row: {
                    balance: number | null
                    created_at: string
                    currency: string | null
                    id: string
                    name: string
                    updated_at: string
                }
                Insert: {
                    balance?: number | null
                    created_at?: string
                    currency?: string | null
                    id?: string
                    name: string
                    updated_at?: string
                }
                Update: {
                    balance?: number | null
                    created_at?: string
                    currency?: string | null
                    id?: string
                    name?: string
                    updated_at?: string
                }
                Relationships: []
            }
            warehouses: {
                Row: {
                    address: string | null
                    created_at: string
                    id: string
                    name: string
                    updated_at: string
                }
                Insert: {
                    address?: string | null
                    created_at?: string
                    id?: string
                    name: string
                    updated_at?: string
                }
                Update: {
                    address?: string | null
                    created_at?: string
                    id?: string
                    name?: string
                    updated_at?: string
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
            purchase_status: "pending" | "completed" | "cancelled"
            stock_movement_type: "inbound" | "outbound" | "adjustment" | "transfer"
            transaction_type: "income" | "expense" | "adjustment"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never