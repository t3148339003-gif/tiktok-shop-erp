import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products/export — export products as CSV
export async function GET(req: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      include: { skus: true },
      orderBy: { updatedAt: 'desc' },
    });

    const headers = ['Title', 'Price', 'Cost', 'Stock', 'Status', 'SKUs', 'Source', 'Created'];
    const rows = products.map((p) => [
      `"${(p.title || '').replace(/"/g, '""')}"`,
      p.price.toFixed(2),
      (p.costPrice || 0).toFixed(2),
      String(p.stock),
      p.status,
      String(p.skus.length),
      p.source || 'manual',
      p.createdAt.toISOString().split('T')[0],
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    // Add BOM for Excel UTF-8 compatibility
    const bom = '﻿';

    return new NextResponse(bom + csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="products_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (err) {
    console.error('Export error:', err);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
