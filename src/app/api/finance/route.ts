import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET — finance summary + records
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || '';

    const where = type && type !== 'all' ? { type } : {};
    const records = await prisma.financeRecord.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 100,
    });

    // Calculate summary
    const revenue = records.filter(r => r.type === 'revenue').reduce((s, r) => s + r.amount, 0);
    const costs = records.filter(r => ['cost', 'shipping', 'ads', 'refund'].includes(r.type)).reduce((s, r) => s + r.amount, 0);

    // Also aggregate from orders for real-time revenue
    const orders = await prisma.order.findMany({
      where: { status: { not: 'cancelled' } },
      select: { totalAmount: true, status: true },
    });
    const orderRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);

    // Products cost estimate (40% of product price)
    const products = await prisma.product.findMany({ select: { price: true, stock: true } });
    const inventoryValue = products.reduce((s, p) => s + p.price * p.stock, 0);

    return NextResponse.json({
      records,
      summary: {
        revenue: revenue || orderRevenue,
        costs,
        profit: (revenue || orderRevenue) - costs,
        orderCount: orders.length,
        inventoryValue,
        estimatedMargin: orderRevenue > 0 ? (((orderRevenue - costs) / orderRevenue) * 100).toFixed(1) + '%' : 'N/A',
      },
    });
  } catch (err) {
    console.error('Finance error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// POST — add finance record
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const record = await prisma.financeRecord.create({
      data: {
        shopId: body.shopId || 'default',
        type: body.type, // revenue, cost, shipping, ads, refund, other
        amount: body.amount,
        currency: body.currency || 'USD',
        orderId: body.orderId || '',
        note: body.note || '',
        date: body.date ? new Date(body.date) : new Date(),
      },
    });
    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
