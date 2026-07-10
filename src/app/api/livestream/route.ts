import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || '';
  const where = status && status !== 'all' ? { status } : {};
  const streams = await prisma.livestream.findMany({
    where,
    include: { products: true, metrics: true },
    orderBy: { scheduledAt: 'desc' },
  });
  return NextResponse.json({ streams });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title) return NextResponse.json({ error: 'Title required' }, { status: 400 });
    const stream = await prisma.livestream.create({
      data: {
        shopId: body.shopId || 'default',
        title: body.title,
        status: 'scheduled',
        scheduledAt: new Date(body.scheduledAt || Date.now()),
        products: body.productIds ? {
          create: body.productIds.map((pid: string, i: number) => ({ productId: pid, sortOrder: i })),
        } : undefined,
      },
      include: { products: true },
    });
    const { EventBus } = await import('@/core/event-bus');
    EventBus.emit('livestream.created', { streamId: stream.id, title: stream.title });
    return NextResponse.json(stream, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
