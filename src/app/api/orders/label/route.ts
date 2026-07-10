import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/orders/label?ids=id1,id2 — generate printable shipping labels as HTML
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];

    if (!ids.length) {
      return NextResponse.json({ error: 'Order IDs are required (comma-separated)' }, { status: 400 });
    }

    const orders = await prisma.order.findMany({
      where: { id: { in: ids } },
      include: { items: true },
    });

    const html = `<!DOCTYPE html>
<html lang="zh">
<head><meta charset="UTF-8"><title>Shipping Labels</title>
<style>
  @page { size: 100mm 150mm; margin: 5mm; }
  body { font-family: Arial, sans-serif; margin: 0; }
  .label { width: 90mm; height: 140mm; border: 2px dashed #000; padding: 5mm; margin: 3mm; page-break-after: always; display: inline-block; vertical-align: top; }
  .label h3 { margin: 0 0 3mm; font-size: 14px; }
  .label p { margin: 1mm 0; font-size: 11px; }
  .label .items { border-top: 1px solid #ccc; margin-top: 3mm; padding-top: 2mm; font-size: 10px; }
  .barcode { text-align: center; font-family: monospace; font-size: 12px; letter-spacing: 2px; margin: 4mm 0; }
  @media print { .label { border: 1px solid #000; page-break-after: always; } }
</style></head>
<body>
${orders.map((o) => `
<div class="label">
  <h3>TK Shop - Shipping Label</h3>
  <p><strong>Order:</strong> ${o.tiktokId}</p>
  <p><strong>To:</strong> ${o.buyerName}</p>
  <p><strong>Addr:</strong> ${o.shippingAddr || 'N/A'}</p>
  <p><strong>Phone:</strong> ${o.buyerPhone || 'N/A'}</p>
  <div class="items">
    ${o.items.map((i) => `<p>${i.skuName} × ${i.quantity}</p>`).join('')}
  </div>
  <div class="barcode">|| ||| |||| || ||| ||||| ||</div>
  <p style="text-align:center;font-size:9px;color:#999">${new Date().toLocaleDateString('zh-CN')}</p>
</div>
`).join('')}
</body></html>`;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (err) {
    console.error('Label error:', err);
    return NextResponse.json({ error: 'Label generation failed' }, { status: 500 });
  }
}
