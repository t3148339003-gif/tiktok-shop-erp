import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || '';
  const where = status && status !== 'all' ? { status } : {};
  const campaigns = await prisma.campaign.findMany({
    where,
    include: { influencer: true, shop: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ campaigns });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.influencerId) return NextResponse.json({ error: 'Influencer ID required' }, { status: 400 });
    const campaign = await prisma.campaign.create({
      data: {
        shopId: body.shopId || 'default',
        influencerId: body.influencerId,
        productId: body.productId || '',
        type: body.type || 'affiliate',
        status: 'pending',
        commission: body.commission || null,
        sampleSent: false,
      },
      include: { influencer: true },
    });
    return NextResponse.json(campaign, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
