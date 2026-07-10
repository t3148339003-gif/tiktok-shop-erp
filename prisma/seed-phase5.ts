import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const rules = [
    { name: '库存不足自动告警', trigger: 'stock_low', action: 'notify', config: { threshold: 10 }, enabled: true, useAI: false },
    { name: '订单付款自动生成采购单', trigger: 'order_paid', action: 'create_purchase', config: { autoCreate: true }, enabled: false, useAI: true },
    { name: '竞品降价自动调价', trigger: 'price_drop', action: 'adjust_price', config: { maxDrop: 20 }, enabled: false, useAI: true },
    { name: '差评自动创建售后工单', trigger: 'negative_review', action: 'create_ticket', config: {}, enabled: true, useAI: false },
    { name: 'AI每日选品推荐', trigger: 'daily_cron', action: 'analyze', config: { time: '09:00' }, enabled: true, useAI: true },
  ];

  for (const r of rules) {
    await prisma.automationRule.create({ data: { ...r, config: JSON.stringify(r.config) } });
  }
  console.log(`Created ${rules.length} automation rules`);

  // Create some automation logs
  await prisma.automationLog.create({
    data: { ruleId: (await prisma.automationRule.findFirst())?.id || '', trigger: 'stock_low', action: 'notify', decision: '蓝牙耳机库存仅剩8件，低于阈值10', executed: true, result: '已发送微信告警' },
  });
  console.log('Automation logs created');
}

main().catch(console.error).finally(() => prisma.$disconnect());
