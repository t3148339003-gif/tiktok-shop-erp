import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Livestreams
  const ls1 = await prisma.livestream.create({
    data: {
      shopId: 'default', title: '7月新品首发直播', status: 'scheduled', scheduledAt: new Date('2026-07-11T20:00:00'),
      products: { create: [{ productId: 'cmreh1vqh000mjqfwso542kd2', sortOrder: 0 }, { productId: 'cmreh1vpx000cjqfwtfo1y7hp', sortOrder: 1 }] },
    },
  });
  await prisma.livestreamMetrics.create({ data: { livestreamId: ls1.id, peakViewers: 0, totalViewers: 0, totalOrders: 0, totalGmv: 0, newFollowers: 0 } });

  const ls2 = await prisma.livestream.create({
    data: {
      shopId: 'default', title: '爆款返场直播', status: 'ended', scheduledAt: new Date('2026-07-09T19:00:00'), startedAt: new Date('2026-07-09T19:05:00'), endedAt: new Date('2026-07-09T21:30:00'),
      products: { create: [{ productId: 'cmreh1vpx000cjqfwtfo1y7hp', sortOrder: 0 }] },
    },
  });
  await prisma.livestreamMetrics.create({ data: { livestreamId: ls2.id, peakViewers: 2340, totalViewers: 15200, totalOrders: 89, totalGmv: 2670, avgStayTime: 185, newFollowers: 340 } });
  console.log('Livestreams created');

  // Influencers
  const i1 = await prisma.influencer.create({
    data: { name: 'TechReviewer小王', tiktokId: '@tech_wang', followers: 250000, avgViews: 50000, category: '3C数码', status: 'active', notes: '合作3次，ROI优秀' },
  });
  const i2 = await prisma.influencer.create({
    data: { name: 'Lifestyle达人Lisa', tiktokId: '@lifestyle_lisa', followers: 180000, avgViews: 35000, category: '生活方式', status: 'sampling', notes: '寄样蓝牙耳机，等待反馈' },
  });
  const i3 = await prisma.influencer.create({
    data: { name: '数码控老张', tiktokId: '@digital_zhang', followers: 89000, avgViews: 20000, category: '数码', status: 'contacted' },
  });
  console.log('Influencers:', i1.name, i2.name, i3.name);

  // Campaigns
  await prisma.campaign.create({
    data: { shopId: 'default', influencerId: i1.id, productId: 'cmreh1vqh000mjqfwso542kd2', type: 'affiliate', status: 'active', commission: 15, gmv: 1250, ordersCount: 42, startedAt: new Date('2026-07-01') },
  });
  await prisma.campaign.create({
    data: { shopId: 'default', influencerId: i2.id, productId: 'cmreh1vqh000mjqfwso542kd2', type: 'free_sample', status: 'pending', sampleSent: true },
  });
  console.log('Campaigns created');

  // AI Videos
  await prisma.aiVideo.create({
    data: { productId: 'cmreh1vqh000mjqfwso542kd2', title: '蓝牙耳机 Pro Max 开箱种草', script: '这款蓝牙耳机音质真的好...', status: 'ready', platform: 'tiktok', views: 3400, gmv: 890 },
  });
  await prisma.aiVideo.create({
    data: { productId: 'cmreh1vpx000cjqfwtfo1y7hp', title: '为什么每个人都需要这条数据线', script: '快充+耐用+便宜...', status: 'published', platform: 'tiktok', publishUrl: 'https://tiktok.com/@shop/video/123', views: 12000, gmv: 2100 },
  });
  console.log('AI Videos created');

  // Livestream scripts
  await prisma.livestreamScript.create({
    data: { productId: 'cmreh1vqh000mjqfwso542kd2', content: '大家好，今天给大家带来这款蓝牙耳机，音质真的绝了！ANC主动降噪，续航30小时，原价$49.99，今天直播间只要$29.99！', type: 'selling' },
  });
  console.log('Scripts created');
}

main().catch(console.error).finally(() => prisma.$disconnect());
