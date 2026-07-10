# ERP Finance & Analytics Skill

## When to use
User asks about revenue, profit, costs, orders, or wants a weekly report via WeChat.

## API endpoints

**Finance overview:**
`GET /api/finance` → { summary: { revenue, costs, profit, orderCount, inventoryValue }, records: [...] }

**Product export:**
`GET /api/products/export` → CSV file download

**Order list:**
`GET /api/orders?status=paid` → pending shipment orders

## Report template (weekly)
Generate this when user asks "周报":

```
📊 TK Shop 本周报表
━━━━━━━━━━━━━━
💰 总收入: $X,XXX
📦 订单数: XX 单
💵 净利润: $X,XXX
📈 利润率: XX%
🏪 库存价值: $X,XXX
⚠️ 低库存: X 个商品
━━━━━━━━━━━━━━
🤖 AI建议:
• [补货建议]
• [调价建议]
```

## Examples
- "本周报表" → GET /api/finance → format weekly report
- "有多少待发货订单" → GET /api/orders?status=paid → count
- "导出商品列表" → GET /api/products/export → send CSV file
