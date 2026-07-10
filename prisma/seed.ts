import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a default shop
  const shop = await prisma.shop.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: '我的TikTok店铺',
      platform: 'tiktok',
      site: 'US',
      shopId: 'shop_default',
      status: 'active',
    },
  });
  console.log('Shop:', shop.name);

  // Create sample products
  const products = [
    { title: '蓝牙耳机 Pro Max', price: 29.99, stock: 45, status: 'online', source: '1688' },
    { title: '快充数据线 Type-C', price: 9.99, stock: 120, status: 'online', source: '1688' },
    { title: '透明手机壳 防摔', price: 8.99, stock: 8, status: 'online', source: '1688' },
    { title: '无线充电器 15W', price: 24.99, stock: 0, status: 'offline', source: 'manual' },
    { title: '车载手机支架', price: 12.99, stock: 67, status: 'draft', source: 'manual' },
    { title: 'LED台灯 触控', price: 19.99, stock: 34, status: 'online', source: 'temu' },
    { title: 'USB-C Hub 7合1', price: 34.99, stock: 22, status: 'online', source: '1688' },
    { title: '便携蓝牙音箱', price: 15.99, stock: 56, status: 'online', source: 'manual' },
  ];

  for (const p of products) {
    const product = await prisma.product.create({
      data: {
        shopId: shop.id,
        title: p.title,
        description: `高品质${p.title}`,
        price: p.price,
        costPrice: p.price * 0.4,
        stock: p.stock,
        status: p.status,
        source: p.source,
        images: '[]',
        skus: {
          create: {
            skuCode: 'DEFAULT',
            price: p.price,
            stock: p.stock,
            attributes: '{}',
          },
        },
      },
    });
    console.log('  Product:', product.title);
  }

  console.log(`\nSeeded ${products.length} products.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
