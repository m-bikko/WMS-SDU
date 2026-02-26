const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testPurchases() {
  const { data, error } = await supabase
    .from("purchases")
    .select(`
        *,
        purchase_items (
            *,
            products (name, sku)
        ),
        suppliers (name, contact_name, email, phone),
        warehouses (name)
    `).limit(1)

  console.log("Purchases:", data ? "Success" : error)
}

async function testOrders() {
    const { data, error } = await supabase
        .from("orders")
        .select(`
            *,
            customers (name)
        `).limit(1)
        
    console.log("Orders:", data ? "Success" : error)
}
testPurchases().then(testOrders)
