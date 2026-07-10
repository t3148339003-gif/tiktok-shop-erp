import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST — analyze and suggest
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, context } = body;

    // Gather data for AI analysis
    const [products, orders, lowStock] = await Promise.all([
      prisma.product.findMany({ where: { status: 'online' }, take: 20, orderBy: { updatedAt: 'desc' } }),
      prisma.order.findMany({ where: { status: { not: 'cancelled' } }, take: 50, orderBy: { createdAt: 'desc' } }),
      prisma.product.findMany({ where: { stock: { lt: 10 }, status: 'online' } }),
    ]);

    const totalGmv = orders.reduce((s, o) => s + o.totalAmount, 0);
    const orderCount = orders.length;

    // Simple rule-based AI (would call DeepSeek in production)
    const suggestions: string[] = [];
    const actions: Array<{ type: string; target: string; reason: string }> = [];

    // Check low stock
    if (lowStock.length > 0) {
      suggestions.push(`⚠️ ${lowStock.length}个商品库存不足10件，建议补货`);
      actions.push({ type: 'restock', target: lowStock.map(p => p.title).join(', '), reason: '库存低于10件' });
    }

    // Check best sellers
    const bestSeller = products.sort((a, b) => b.stock - a.stock)[0];
    if (bestSeller) {
      suggestions.push(`📈 库存最多: ${bestSeller.title} (${bestSeller.stock}件)，建议加大推广`);
    }

    // Check zero stock
    const outOfStock = products.filter(p => p.stock === 0 && p.status === 'online');
    if (outOfStock.length > 0) {
      suggestions.push(`🚫 ${outOfStock.length}个在线商品已售罄，建议下架或补货`);
      actions.push({ type: 'delist', target: outOfStock.map(p => p.title).join(', '), reason: '售罄' });
    }

    // Check price optimization
    const lowPrice = products.filter(p => p.price < 5);
    if (lowPrice.length > 0) {
      suggestions.push(`💡 ${lowPrice.length}个商品价格低于$5，考虑调价提高利润`);
    }

    // Revenue summary
    suggestions.push(`📊 近50单总GMV: $${totalGmv.toFixed(0)}，共${orderCount}单`);

    // Log the decision
    const log = await prisma.automationLog.create({
      data: {
        trigger: question || 'manual_ai_query',
        action: 'analyze',
        decision: JSON.stringify({ suggestions, actions, metrics: { totalGmv, orderCount, lowStockCount: lowStock.length } }),
        executed: false,
      },
    });

    return NextResponse.json({
      suggestions,
      actions,
      metrics: { totalGmv: totalGmv.toFixed(0), orderCount, lowStockCount: lowStock.length, outOfStockCount: outOfStock.length },
      logId: log.id,
      note: '(Rule-based analysis. Connect DeepSeek for full AI decision making.)',
    });
  } catch (err) {
    console.error('AI Decision error:', err);
    return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 });
  }
}
