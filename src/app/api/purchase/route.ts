import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || '';
  const where = status && status !== 'all' ? { status } : {};
  const orders = await prisma.purchaseOrder.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.items || !body.items.length) {
      return NextResponse.json({ error: 'Items are required' }, { status: 400 });
    }
    const order = await prisma.purchaseOrder.create({
      data: {
        supplierId: body.supplierId || '',
        supplierUrl: body.supplierUrl || '',
        status: 'pending',
        totalAmount: body.items.reduce((s: number, i: {unitPrice:number;quantity:number}) => s + i.unitPrice * i.quantity, 0),
        items: {
          create: body.items.map((i: {skuName:string;quantity:number;unitPrice:number;sourceUrl?:string;productId?:string}) => ({
            productId: i.productId || '', skuName: i.skuName, quantity: i.quantity, unitPrice: i.unitPrice, sourceUrl: i.sourceUrl || '',
          })),
        },
      },
      include: { items: true },
    });
    const { EventBus } = await import('@/core/event-bus');
    EventBus.emit('purchase.created', { orderId: order.id, amount: order.totalAmount });
    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error('Purchase error:', err);
    return NextResponse.json({ error: 'Failed to create purchase order' }, { status: 500 });
  }
}
