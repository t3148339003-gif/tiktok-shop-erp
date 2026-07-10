import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || '';
  const where = status && status !== 'all' ? { status } : {};
  const videos = await prisma.aiVideo.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return NextResponse.json({ videos });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.productId || !body.title) {
      return NextResponse.json({ error: 'Product ID and title required' }, { status: 400 });
    }
    const video = await prisma.aiVideo.create({
      data: {
        productId: body.productId,
        title: body.title,
        script: body.script || '',
        status: 'pending',
        platform: body.platform || 'tiktok',
      },
    });

    const { EventBus } = await import('@/core/event-bus');
    EventBus.emit('ai-video.created', { videoId: video.id, productId: body.productId });

    return NextResponse.json(video, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
