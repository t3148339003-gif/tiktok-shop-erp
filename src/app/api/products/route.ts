import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products — list products with pagination, search, filter
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const where: Record<string, unknown> = {};
    if (search) where.title = { contains: search };
    if (status && status !== 'all') where.status = status;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { skus: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products: products.map((p) => ({
        ...p,
        images: JSON.parse(p.images || '[]'),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('GET /api/products error:', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/products — create a new product
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, mainImage, images, categoryId, brand, price, costPrice, stock, source, sourceUrl, shopId, skus } = body;

    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    const product = await prisma.product.create({
      data: {
        shopId: shopId || 'default',
        title,
        description: description || '',
        mainImage: mainImage || '',
        images: JSON.stringify(images || []),
        categoryId: categoryId || '',
        brand: brand || '',
        price: price || 0,
        costPrice: costPrice || null,
        stock: stock || 0,
        source: source || 'manual',
        sourceUrl: sourceUrl || '',
        status: 'draft',
        skus: skus ? {
          create: skus.map((s: { skuCode: string; price: number; stock: number; attributes: Record<string, string> }) => ({
            skuCode: s.skuCode,
            price: s.price || price || 0,
            stock: s.stock || 0,
            attributes: JSON.stringify(s.attributes || {}),
          })),
        } : undefined,
      },
      include: { skus: true },
    });

    // Publish event
    const { EventBus } = await import('@/core/event-bus');
    EventBus.emit('product.created', { productId: product.id, title: product.title });

    return NextResponse.json({ ...product, images: JSON.parse(product.images || '[]') }, { status: 201 });
  } catch (err) {
    console.error('POST /api/products error:', err);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
