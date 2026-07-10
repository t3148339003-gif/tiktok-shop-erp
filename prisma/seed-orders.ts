import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const orders = [
    { id: '#TK-1001', buyer: 'John D.', items: [{ n: '蓝牙耳机 Pro Max', code: 'BT-001', qty: 1, price: 29.99 }], amount: 29.99, status: 'paid' },
    { id: '#TK-1002', buyer: 'Sarah M.', items: [{ n: '快充数据线 Type-C', code: 'CB-001', qty: 2, price: 9.99 }], amount: 19.98, status: 'shipped' },
    { id: '#TK-1003', buyer: 'Mike R.', items: [{ n: '无线充电器 15W', code: 'WC-001', qty: 1, price: 24.99 }, { n: 'USB-C Hub 7合1', code: 'HB-001', qty: 1, price: 34.99 }], amount: 59.98, status: 'delivered' },
    { id: '#TK-1004', buyer: 'Lisa K.', items: [{ n: '透明手机壳 防摔', code: 'CS-001', qty: 1, price: 8.99 }], amount: 8.99, status: 'cancelled' },
    { id: '#TK-1005', buyer: 'Tom H.', items: [{ n: 'LED台灯 触控', code: 'LT-001', qty: 2, price: 19.99 }], amount: 39.98, status: 'paid' },
    { id: '#TK-1006', buyer: 'Emma W.', items: [{ n: '便携蓝牙音箱', code: 'SP-001', qty: 1, price: 15.99 }], amount: 15.99, status: 'paid' },
    { id: '#TK-1007', buyer: 'Alex C.', items: [{ n: '车载手机支架', code: 'CH-001', qty: 3, price: 12.99 }], amount: 38.97, status: 'shipped' },
    { id: '#TK-1008', buyer: 'David P.', items: [{ n: '蓝牙耳机 Pro Max', code: 'BT-001', qty: 1, price: 29.99 }, { n: '快充数据线 Type-C', code: 'CB-001', qty: 1, price: 9.99 }], amount: 39.98, status: 'paid' },
  ];

  const times = ['10分钟前', '1小时前', '2小时前', '3小时前', '5小时前', '8小时前', '昨天', '昨天'];

  for (let i = 0; i < orders.length; i++) {
    const o = orders[i];
    await prisma.order.create({
      data: {
        shopId: 'default',
        tiktokId: o.id,
        status: o.status,
        buyerName: o.buyer,
        buyerPhone: '',
        shippingAddr: '123 Main St, New York, NY 10001',
        totalAmount: o.amount,
        currency: 'USD',
        paidAt: o.status !== 'cancelled' ? new Date(Date.now() - (i + 1) * 3600000) : null,
        shippedAt: ['shipped', 'delivered'].includes(o.status) ? new Date(Date.now() - i * 1800000) : null,
        deliveredAt: o.status === 'delivered' ? new Date(Date.now() - i * 900000) : null,
        items: {
          create: o.items.map((it) => ({
            productId: '',
            skuName: it.n,
            skuCode: it.code,
            quantity: it.qty,
            price: it.price,
          })),
        },
      },
    });
    console.log(`  Order: ${o.id} - ${o.buyer} $${o.amount} [${o.status}]`);
  }

  console.log(`\nSeeded ${orders.length} orders.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
