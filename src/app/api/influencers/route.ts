import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || '';
  const where = status && status !== 'all' ? { status } : {};
  const influencers = await prisma.influencer.findMany({
    where,
    include: { campaigns: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ influencers });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    const inf = await prisma.influencer.create({
      data: {
        name: body.name,
        tiktokId: body.tiktokId || '',
        followers: body.followers || 0,
        avgViews: body.avgViews || 0,
        category: body.category || '',
        contactInfo: body.contactInfo || '',
        status: 'new',
        notes: body.notes || '',
      },
    });
    return NextResponse.json(inf, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
