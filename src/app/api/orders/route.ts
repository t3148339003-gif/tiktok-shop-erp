import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/orders — list with pagination, search, status filter
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    const where: Record<string, unknown> = {};
    if (status && status !== 'all') where.status = status;
    if (search) {
      where.OR = [
        { id: { contains: search } },
        { tiktokId: { contains: search } },
        { buyerName: { contains: search } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('GET orders error:', err);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/orders — create order (for manual / webhook)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { shopId, tiktokId, buyerName, buyerPhone, shippingAddr, items, totalAmount, currency } = body;

    if (!tiktokId) return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });

    const order = await prisma.order.create({
      data: {
        shopId: shopId || 'default',
        tiktokId,
        status: 'paid',
        buyerName: buyerName || '',
        buyerPhone: buyerPhone || '',
        shippingAddr: shippingAddr || '',
        totalAmount: totalAmount || 0,
        currency: currency || 'USD',
        items: items ? {
          create: items.map((i: { skuName: string; skuCode: string; quantity: number; price: number; productId?: string }) => ({
            productId: i.productId || '',
            skuName: i.skuName,
            skuCode: i.skuCode,
            quantity: i.quantity || 1,
            price: i.price || 0,
          })),
        } : undefined,
      },
      include: { items: true },
    });

    const { EventBus } = await import('@/core/event-bus');
    EventBus.emit('order.created', { orderId: order.id, amount: order.totalAmount, shopId: order.shopId });

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error('POST order error:', err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
