import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET — stock list + low stock alert
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: { id: true, title: true, stock: true, price: true, status: true },
      orderBy: { stock: 'asc' },
    });
    const lowStock = products.filter(p => p.stock < 10 && p.status === 'online');
    return NextResponse.json({ products, lowStock: lowStock.length, items: lowStock.slice(0, 10) });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// POST — update stock for a product
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, quantity, operation } = body; // operation: 'set', 'add', 'subtract'
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    let newStock = product.stock;
    if (operation === 'set') newStock = quantity;
    else if (operation === 'add') newStock += quantity;
    else if (operation === 'subtract') newStock -= quantity;

    await prisma.product.update({ where: { id: productId }, data: { stock: Math.max(0, newStock) } });

    const { EventBus } = await import('@/core/event-bus');
    EventBus.emit('stock.updated', { productId, oldStock: product.stock, newStock: Math.max(0, newStock) });

    return NextResponse.json({ productId, stock: Math.max(0, newStock) });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
