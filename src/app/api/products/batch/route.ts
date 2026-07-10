import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/products/batch — batch status change (online/offline/delete)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids, action } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Product IDs are required' }, { status: 400 });
    }

    let newStatus = '';
    switch (action) {
      case 'publish': newStatus = 'online'; break;
      case 'delist': newStatus = 'offline'; break;
      case 'delete': newStatus = 'deleted'; break;
      default: return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const result = await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { status: newStatus },
    });

    const { EventBus } = await import('@/core/event-bus');
    EventBus.emit('product.batch.' + action, { ids, count: result.count });

    return NextResponse.json({ affected: result.count, action });
  } catch (err) {
    console.error('Batch operation error:', err);
    return NextResponse.json({ error: 'Batch operation failed' }, { status: 500 });
  }
}
