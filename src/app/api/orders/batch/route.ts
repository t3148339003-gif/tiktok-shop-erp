import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/orders/batch — batch ship or batch mark as fulfilled
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids, action } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Order IDs are required' }, { status: 400 });
    }

    let newStatus = '';
    if (action === 'ship') newStatus = 'shipped';
    else if (action === 'mark_delivered') newStatus = 'delivered';
    else return NextResponse.json({ error: 'Invalid action. Use: ship, mark_delivered' }, { status: 400 });

    const updateData: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'shipped') updateData.shippedAt = new Date();
    if (newStatus === 'delivered') updateData.deliveredAt = new Date();

    const result = await prisma.order.updateMany({
      where: { id: { in: ids }, status: newStatus === 'shipped' ? 'paid' : 'shipped' },
      data: updateData,
    });

    const { EventBus } = await import('@/core/event-bus');
    EventBus.emit('order.batch.' + action, { ids, count: result.count });

    return NextResponse.json({ affected: result.count, action, newStatus });
  } catch (err) {
    console.error('Batch order error:', err);
    return NextResponse.json({ error: 'Batch operation failed' }, { status: 500 });
  }
}
