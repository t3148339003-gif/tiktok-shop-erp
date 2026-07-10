# ERP Product Management Skill

## When to use
When the user asks to manage products via WeChat: list products, check stock, delist items, find low stock, optimize prices.

## How to use
Call the ERP REST API at `http://localhost:3000/api/products` (local) or the production URL.

### Available actions

**List products:**
`GET /api/products?status=online&search=keyword`

**Check stock:**
`GET /api/warehouse` → look at `lowStock` count and `items` array

**Delist product:**
`PUT /api/products/[id]` with `{"status": "offline"}`

**Batch delist low stock:**
`POST /api/products/batch` with `{"ids": [...], "action": "delist"}`

**Get finance summary:**
`GET /api/finance` → summary.revenue, summary.profit, summary.inventoryValue

**AI analysis:**
`POST /api/ai-decision` with `{"question": "user's natural language request"}`

### Response format (to user via WeChat)
Keep it concise:
- Product list: show name, price, stock status
- Stock alert: highlight items with stock < 10
- Actions: confirm before executing batch operations

### Examples
- User: "库存不足的商品有哪些" → GET /api/warehouse → list lowStock items
- User: "帮我把蓝牙耳机下架" → GET /api/products?search=蓝牙耳机 → PUT /api/products/[id] {"status":"offline"}
- User: "今天卖了多少" → GET /api/finance → reply with revenue and order count
