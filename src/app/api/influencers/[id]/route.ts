import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inf = await prisma.influencer.findUnique({ where: { id }, include: { campaigns: true } });
  if (!inf) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(inf);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const inf = await prisma.influencer.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.followers !== undefined && { followers: body.followers }),
      ...(body.avgViews !== undefined && { avgViews: body.avgViews }),
      ...(body.contactInfo !== undefined && { contactInfo: body.contactInfo }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
  });
  return NextResponse.json(inf);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.influencer.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
