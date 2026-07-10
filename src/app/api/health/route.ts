import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const checks: Record<string, { status: 'ok' | 'error'; message?: string }> = {};

  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'ok' };
  } catch (err) {
    checks.database = { status: 'error', message: String(err) };
  }

  // TikTok API check (mock)
  checks.tiktokApi = { status: 'ok', message: '(mock — not connected in dev)' };

  // System stats
  const [productCount, orderCount, userCount] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
  ]);

  return NextResponse.json({
    status: Object.values(checks).some(c => c.status === 'error') ? 'degraded' : 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
    stats: { productCount, orderCount, userCount, nodeVersion: process.version },
  });
}
