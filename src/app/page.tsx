'use client';

import { useState } from 'react';

// ─── Inline SVG Icons (no dependency needed) ──────────
const Icons = {
  LayoutDashboard: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>,
  Package: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>,
  ShoppingCart: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>,
  DollarSign: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Settings: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  TrendingUp: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  TrendingDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  AlertTriangle: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  RefreshCw: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
};

// ─── Mock Data ───────────────────────────────────────
const stats = [
  { label: '今日GMV', value: '$12,458', change: '+12.5%', up: true, icon: 'DollarSign' as const },
  { label: '订单数', value: '156', change: '+8.3%', up: true, icon: 'ShoppingCart' as const },
  { label: '利润', value: '$3,240', change: '-2.1%', up: false, icon: 'TrendingUp' as const },
  { label: '库存预警', value: '23', change: '', up: null, icon: 'AlertTriangle' as const, warn: true },
];

const topProducts = [
  { name: '蓝牙耳机 Pro', sales: 89, revenue: '$2,669', stock: 45 },
  { name: '快充数据线', sales: 67, revenue: '$669', stock: 120 },
  { name: '手机壳 透明', sales: 54, revenue: '$486', stock: 8 },
  { name: '无线充电器', sales: 43, revenue: '$1,075', stock: 0 },
];

const tabs = [
  { id: 'dashboard', label: '首页', icon: 'LayoutDashboard' as const },
  { id: 'products', label: '商品', icon: 'Package' as const },
  { id: 'orders', label: '订单', icon: 'ShoppingCart' as const },
  { id: 'finance', label: '财务', icon: 'DollarSign' as const },
  { id: 'settings', label: '设置', icon: 'Settings' as const },
];

// ─── Dashboard ────────────────────────────────────────
function DashboardPage() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">TK Shop ERP</h1>
          <p className="text-sm text-gray-500">今日概览 · 7月10日</p>
        </div>
        <button className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200">
          <Icons.RefreshCw />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.warn ? 'bg-amber-50 border border-amber-200' : 'bg-white shadow-sm border border-gray-100'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${s.warn ? 'bg-amber-100' : 'bg-blue-50'}`}>
                {(() => { const I = Icons[s.icon as keyof typeof Icons]; return <I />; })()}
              </div>
              <span className="text-xs text-gray-500">{s.label}</span>
            </div>
            <p className="text-lg font-bold">{s.value}</p>
            {s.change && (
              <span className={`text-xs ${s.up ? 'text-green-600' : 'text-red-600'} flex items-center gap-0.5`}>
                {s.up ? <Icons.TrendingUp /> : <Icons.TrendingDown />}
                {s.change}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h2 className="font-semibold mb-3">热销商品 TOP 4</h2>
        {topProducts.map((p, i) => (
          <div key={p.name} className={`flex items-center justify-between py-2.5 ${i < 3 ? 'border-b border-gray-50' : ''}`}>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-400 w-5">#{i + 1}</span>
              <div>
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-gray-400">售 {p.sales} 件 · {p.revenue}</p>
              </div>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${p.stock === 0 ? 'bg-red-50 text-red-600' : p.stock < 10 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
              {p.stock === 0 ? '售罄' : p.stock < 10 ? `仅剩${p.stock}` : `库存${p.stock}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Products ─────────────────────────────────────────
function ProductsPage() {
  const products = [
    { title: '蓝牙耳机 Pro Max', price: 29.99, skus: 3, stock: 45, status: 'online', emoji: '🎧' },
    { title: '快充数据线 Type-C', price: 9.99, skus: 2, stock: 120, status: 'online', emoji: '🔌' },
    { title: '透明手机壳 iPhone', price: 8.99, skus: 5, stock: 8, status: 'online', emoji: '📱' },
    { title: '无线充电器 15W', price: 24.99, skus: 1, stock: 0, status: 'offline', emoji: '⚡' },
    { title: '车载手机支架', price: 12.99, skus: 2, stock: 67, status: 'draft', emoji: '🚗' },
  ];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">商品管理</h1>
        <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-xl font-medium active:bg-blue-700">+ 新增</button>
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {['全部', '在线', '已下架', '草稿'].map((f) => (
          <button key={f} className={`text-sm px-3 py-1.5 rounded-full whitespace-nowrap ${f === '全部' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-600'}`}>
            {f}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {products.map((p) => (
          <div key={p.title} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 active:bg-gray-50">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">{p.emoji}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{p.title}</p>
              <p className="text-xs text-gray-400">SKU: {p.skus} · 库存: {p.stock}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold">${p.price}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded ${p.status === 'online' ? 'bg-green-50 text-green-600' : p.status === 'offline' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                {p.status === 'online' ? '在线' : p.status === 'offline' ? '已下架' : '草稿'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Orders ───────────────────────────────────────────
function OrdersPage() {
  const orders = [
    { id: '#TK-0892', buyer: 'John D.', items: 2, amount: 59.98, status: 'paid', time: '10分钟前' },
    { id: '#TK-0891', buyer: 'Sarah M.', items: 1, amount: 29.99, status: 'shipped', time: '1小时前' },
    { id: '#TK-0890', buyer: 'Mike R.', items: 3, amount: 87.50, status: 'delivered', time: '2小时前' },
    { id: '#TK-0889', buyer: 'Lisa K.', items: 1, amount: 9.99, status: 'cancelled', time: '3小时前' },
    { id: '#TK-0888', buyer: 'Tom H.', items: 2, amount: 44.98, status: 'paid', time: '5小时前' },
  ];

  const sm: Record<string, { label: string; color: string }> = {
    paid: { label: '待发货', color: 'bg-blue-50 text-blue-600' },
    shipped: { label: '已发货', color: 'bg-purple-50 text-purple-600' },
    delivered: { label: '已签收', color: 'bg-green-50 text-green-600' },
    cancelled: { label: '已取消', color: 'bg-red-50 text-red-600' },
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">订单管理</h1>
        <button className="text-sm text-blue-600 font-medium flex items-center gap-1"><Icons.RefreshCw /> 同步</button>
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {['全部', '待发货', '已发货', '已签收', '已取消'].map((f) => (
          <button key={f} className={`text-sm px-3 py-1.5 rounded-full whitespace-nowrap ${f === '全部' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-600'}`}>{f}</button>
        ))}
      </div>
      <div className="space-y-2">
        {orders.map((o) => {
          const s = sm[o.status];
          return (
            <div key={o.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{o.id}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{o.buyer} · {o.items}件</span>
                <span>{o.time}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between">
                <span className="text-lg font-bold">${o.amount}</span>
                {o.status === 'paid' && <button className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium active:bg-blue-700">发货</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Finance ──────────────────────────────────────────
function FinancePage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">财务管理</h1>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
        <div className="w-12 h-12 mx-auto mb-3 text-gray-300"><Icons.DollarSign /></div>
        <p className="text-gray-500">连接 TikTok 店铺后自动同步</p>
      </div>
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────
function SettingsPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">设置</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
        {[
          ['连接 TikTok 店铺', '未连接'],
          ['语言', '中文'],
          ['版本', 'v0.1.0 Phase 1'],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm">{label}</span>
            <span className="text-xs text-gray-400">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────
export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="h-full flex flex-col max-w-lg mx-auto bg-gray-50 relative">
      {/* Content */}
      <div className="flex-1 overflow-auto pb-16">
        {activeTab === 'dashboard' && <DashboardPage />}
        {activeTab === 'products' && <ProductsPage />}
        {activeTab === 'orders' && <OrdersPage />}
        {activeTab === 'finance' && <FinancePage />}
        {activeTab === 'settings' && <SettingsPage />}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-100 z-50">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const IconComp = Icons[tab.icon as keyof typeof Icons];
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 flex-1 py-1 transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div className={isActive ? 'text-blue-600' : 'text-gray-400'}>
                  <IconComp />
                </div>
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
