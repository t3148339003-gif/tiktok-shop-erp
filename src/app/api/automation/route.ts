import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET — list all rules
export async function GET() {
  const rules = await prisma.automationRule.findMany({
    include: { logs: { take: 5, orderBy: { createdAt: 'desc' } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ rules });
}

// POST — create rule
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rule = await prisma.automationRule.create({
      data: {
        name: body.name,
        trigger: body.trigger,
        action: body.action,
        config: JSON.stringify(body.config || {}),
        enabled: body.enabled !== false,
        useAI: body.useAI || false,
      },
    });

    const { EventBus } = await import('@/core/event-bus');
    EventBus.emit('automation.rule.created', { ruleId: rule.id, name: rule.name });

    return NextResponse.json(rule, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// PUT — toggle rule
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const rule = await prisma.automationRule.update({
      where: { id: body.id },
      data: { enabled: body.enabled },
    });
    return NextResponse.json(rule);
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
