import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create suppliers
  const s1 = await prisma.supplier.create({
    data: { name: '深圳电子批发', platform: '1688', storeUrl: 'https://shop123.1688.com', rating: 4, contact: '张三 138xxxx', notes: '蓝牙耳机、充电器供货商' },
  });
  const s2 = await prisma.supplier.create({
    data: { name: '义乌小商品城', platform: '1688', storeUrl: 'https://shop456.1688.com', rating: 5, contact: '李四 139xxxx', notes: '数据线、手机壳等配件' },
  });
  console.log('Suppliers:', s1.name, s2.name);

  // Create supplier products (price comparison)
  await prisma.supplierProduct.createMany({
    data: [
      { supplierId: s1.id, productId: '', sourceUrl: 'https://detail.1688.com/xxx1', unitPrice: 8.5, minOrder: 10 },
      { supplierId: s1.id, productId: '', sourceUrl: 'https://detail.1688.com/xxx2', unitPrice: 12.0, minOrder: 5 },
      { supplierId: s2.id, productId: '', sourceUrl: 'https://detail.1688.com/yyy1', unitPrice: 1.5, minOrder: 50 },
    ],
  });
  console.log('Supplier products added');

  // Create a purchase order
  const po = await prisma.purchaseOrder.create({
    data: {
      supplierId: s1.id,
      status: 'completed',
      totalAmount: 85 + 60,
      items: {
        create: [
          { productId: '', skuName: '蓝牙耳机 Pro Max', quantity: 10, unitPrice: 8.50, sourceUrl: 'https://detail.1688.com/xxx1' },
          { productId: '', skuName: '无线充电器 15W', quantity: 5, unitPrice: 12.00, sourceUrl: 'https://detail.1688.com/xxx2' },
        ],
      },
    },
  });
  console.log('Purchase order:', po.id);

  // Create finance records
  const records = [
    { type: 'revenue', amount: 59.98, note: '订单收入 #TK-1001', date: new Date() },
    { type: 'cost', amount: 25.50, note: '采购成本 - 蓝牙耳机', date: new Date() },
    { type: 'shipping', amount: 8.00, note: '物流运费', date: new Date() },
    { type: 'ads', amount: 15.00, note: 'TikTok广告投放', date: new Date() },
    { type: 'refund', amount: 9.99, note: '退款 #TK-1004', date: new Date() },
  ];
  for (const r of records) {
    await prisma.financeRecord.create({ data: { shopId: 'default', ...r } });
  }
  console.log('Finance records added');

  // Create warehouse
  await prisma.warehouse.create({ data: { name: '深圳主仓', type: 'self' } });
  console.log('Warehouse created');
}

main().catch(console.error).finally(() => prisma.$disconnect());
