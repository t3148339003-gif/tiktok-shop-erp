import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const where = search ? { name: { contains: search } } : {};
  const suppliers = await prisma.supplier.findMany({
    where,
    include: { products: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ suppliers });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supplier = await prisma.supplier.create({
      data: {
        name: body.name,
        platform: body.platform || '1688',
        storeUrl: body.storeUrl || '',
        contact: body.contact || '',
        rating: body.rating || 3,
        notes: body.notes || '',
      },
    });
    return NextResponse.json(supplier, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 });
  }
}
