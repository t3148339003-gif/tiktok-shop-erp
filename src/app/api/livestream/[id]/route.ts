import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const stream = await prisma.livestream.findUnique({
    where: { id },
    include: { products: true, metrics: true },
  });
  if (!stream) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(stream);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const updateData: Record<string, unknown> = {};

  if (body.title) updateData.title = body.title;
  if (body.status) {
    updateData.status = body.status;
    if (body.status === 'live') updateData.startedAt = new Date();
    if (body.status === 'ended') updateData.endedAt = new Date();
  }

  // Update metrics
  if (body.metrics) {
    await prisma.livestreamMetrics.upsert({
      where: { livestreamId: id },
      update: body.metrics,
      create: { livestreamId: id, ...body.metrics },
    });
  }

  // Update product explained/sold status
  if (body.productUpdates) {
    for (const pu of body.productUpdates) {
      await prisma.livestreamProduct.updateMany({
        where: { livestreamId: id, productId: pu.productId },
        data: {
          ...(pu.explained !== undefined && { explained: pu.explained }),
          ...(pu.soldCount !== undefined && { soldCount: pu.soldCount }),
          ...(pu.gmv !== undefined && { gmv: pu.gmv }),
        },
      });
    }
  }

  const stream = await prisma.livestream.update({
    where: { id },
    data: updateData,
    include: { products: true, metrics: true },
  });

  if (body.status) {
    const { EventBus } = await import('@/core/event-bus');
    EventBus.emit('livestream.status.changed', { streamId: id, status: body.status });
  }

  return NextResponse.json(stream);
}
