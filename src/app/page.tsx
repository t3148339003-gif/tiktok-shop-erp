'use client';

import { useState, useEffect, useCallback } from 'react';

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

const tabs = [
  { id: 'dashboard', label: '首页', icon: 'LayoutDashboard' as const },
  { id: 'products', label: '商品', icon: 'Package' as const },
  { id: 'orders', label: '订单', icon: 'ShoppingCart' as const },
  { id: 'live', label: '直播', icon: 'DollarSign' as const },
  { id: 'creators', label: '达人', icon: 'Settings' as const },
];

// ─── Dashboard ────────────────────────────────────────
function DashboardPage() {
  const [stats, setStats] = useState({ gmv: 0, orderCount: 0, profit: 0, lowStock: 0, topProducts: [] as Array<{id:string;title:string;stock:number;price:number}> });

  useEffect(() => {
    (async () => {
      try {
        const [prodRes, orderRes] = await Promise.all([
          fetch('/api/products?limit=100'),
          fetch('/api/orders?limit=100'),
        ]);
        const prods = (await prodRes.json()).products || [];
        const orders = (await orderRes.json()).orders || [];

        const gmv = orders.reduce((s: number, o: {totalAmount:number}) => s + o.totalAmount, 0);
        const profit = gmv * 0.35;
        const lowStock = prods.filter((p: {stock:number}) => p.stock < 10 && p.stock > 0).length;
        const top = [...prods].sort((a, b) => (b.stock || 0) - (a.stock || 0)).slice(0, 4);

        setStats({ gmv, orderCount: orders.length, profit, lowStock, topProducts: top });
      } catch {}
    })();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">TK Shop ERP</h1>
          <p className="text-sm text-gray-500">今日概览 · 7月10日</p>
        </div>
        <button className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200" onClick={() => window.location.reload()}>
          <Icons.RefreshCw />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: '今日GMV', value: `$${stats.gmv.toFixed(0)}`, icon: 'DollarSign' as const },
          { label: '订单数', value: String(stats.orderCount), icon: 'ShoppingCart' as const },
          { label: '预估利润', value: `$${stats.profit.toFixed(0)}`, icon: 'TrendingUp' as const },
          { label: '库存预警', value: String(stats.lowStock), icon: 'AlertTriangle' as const, warn: stats.lowStock > 0 },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.warn ? 'bg-amber-50 border border-amber-200' : 'bg-white shadow-sm border border-gray-100'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${s.warn ? 'bg-amber-100' : 'bg-blue-50'}`}>
                {(() => { const I = Icons[s.icon]; return <I />; })()}
              </div>
              <span className="text-xs text-gray-500">{s.label}</span>
            </div>
            <p className="text-lg font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h2 className="font-semibold mb-3">库存概览</h2>
        {stats.topProducts.map((p, i) => (
          <div key={p.id} className={`flex items-center justify-between py-2.5 ${i < 3 ? 'border-b border-gray-50' : ''}`}>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-400 w-5">#{i + 1}</span>
              <div>
                <p className="text-sm font-medium truncate max-w-40">{p.title}</p>
                <p className="text-xs text-gray-400">${p.price?.toFixed(2)}</p>
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

// ─── Products (Real API) ──────────────────────────────
function ProductsPage() {
  const [products, setProducts] = useState<Array<{id:string;title:string;price:number;status:string;stock:number;skus:Array<{id:string}>;images:string;source?:string}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);
      if (search) params.set('search', search);
      const res = await fetch('/api/products?' + params.toString());
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setProducts(data.products || []);
      setError('');
    } catch {
      setError('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleBatch = async (action: string) => {
    const ids = products.filter(p => p.status === 'online' || p.status === 'draft').map(p => p.id);
    if (!ids.length) return;
    await fetch('/api/products/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, action }),
    });
    fetchProducts();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await fetch('/api/products/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除？')) return;
    await fetch('/api/products/' + id, { method: 'DELETE' });
    fetchProducts();
  };

  const statusLabel = (s: string) =>
    s === 'online' ? '在线' : s === 'offline' ? '已下架' : s === 'deleted' ? '已删除' : '草稿';
  const statusColor = (s: string) =>
    s === 'online' ? 'bg-green-50 text-green-600' : s === 'offline' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500';

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">商品管理</h1>
        <div className="flex gap-2">
          <button onClick={() => handleBatch('publish')} className="text-xs bg-green-50 text-green-700 px-2 py-1.5 rounded-lg active:bg-green-100">批量上架</button>
          <button onClick={() => handleBatch('delist')} className="text-xs bg-red-50 text-red-700 px-2 py-1.5 rounded-lg active:bg-red-100">批量下架</button>
          <a href="/api/products/export" className="text-xs bg-gray-50 text-gray-600 px-2 py-1.5 rounded-lg">CSV导出</a>
        </div>
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {['all','online','offline','draft'].map((f) => (
          <button key={f} onClick={() => { setFilter(f); setTimeout(fetchProducts, 50); }}
            className={`text-sm px-3 py-1.5 rounded-full whitespace-nowrap ${filter === f ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-600'}`}>
            {f === 'all' ? '全部' : f === 'online' ? '在线' : f === 'offline' ? '已下架' : '草稿'}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-10 text-gray-400">加载中...</div>}
      {error && <div className="text-center py-10 text-red-500">{error} <button onClick={fetchProducts} className="text-blue-600 underline ml-2">重试</button></div>}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">📦</div>
          <p className="text-gray-400">还没有商品</p>
          <p className="text-sm text-gray-300 mt-1">点击上方按钮添加</p>
        </div>
      )}

      <div className="space-y-2">
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">📦</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.title}</p>
                <p className="text-xs text-gray-400">
                  SKU: {p.skus?.length || 0} · 库存: {p.stock}
                  {p.source && <span className="ml-2 text-blue-400">来自{p.source}</span>}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold">${p.price.toFixed(2)}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded ${statusColor(p.status)}`}>{statusLabel(p.status)}</span>
              </div>
            </div>
            {/* Swipe actions */}
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
              {p.status === 'online' && (
                <button onClick={() => handleStatusChange(p.id, 'offline')} className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">下架</button>
              )}
              {p.status === 'offline' && (
                <button onClick={() => handleStatusChange(p.id, 'online')} className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">上架</button>
              )}
              {p.status === 'draft' && (
                <button onClick={() => handleStatusChange(p.id, 'online')} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">发布上线</button>
              )}
              <button onClick={() => handleDelete(p.id)} className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded ml-auto">删除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Orders ───────────────────────────────────────────
function OrdersPage() {
  const [orders, setOrders] = useState<Array<{id:string;tiktokId:string;buyerName:string;totalAmount:number;status:string;items:Array<{quantity:number}>;createdAt:string}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const sm: Record<string, { label: string; color: string }> = {
    paid: { label: '待发货', color: 'bg-blue-50 text-blue-600' },
    shipped: { label: '已发货', color: 'bg-purple-50 text-purple-600' },
    delivered: { label: '已签收', color: 'bg-green-50 text-green-600' },
    cancelled: { label: '已取消', color: 'bg-red-50 text-red-600' },
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);
      const res = await fetch('/api/orders?' + params.toString());
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setOrders(data.orders || []);
      setError('');
    } catch {
      setError('加载失败');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleShip = async (id: string) => {
    await fetch('/api/orders/' + id, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'shipped' }),
    });
    fetchOrders();
  };

  const handleBatchShip = async () => {
    const ids = orders.filter(o => o.status === 'paid').map(o => o.id);
    if (!ids.length) return;
    await fetch('/api/orders/batch', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, action: 'ship' }),
    });
    fetchOrders();
  };

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}分钟前`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}小时前`;
    return `${Math.floor(hrs / 24)}天前`;
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">订单管理</h1>
        <div className="flex gap-2">
          <button onClick={fetchOrders} className="text-sm text-blue-600 font-medium flex items-center gap-1"><Icons.RefreshCw /> 刷新</button>
          <button onClick={handleBatchShip} className="text-xs bg-blue-600 text-white px-2 py-1 rounded-lg active:bg-blue-700">批量发货</button>
          <button onClick={() => { const ids = orders.filter(o => o.status === 'paid' || o.status === 'shipped').map(o => o.id).join(','); if (ids) window.open('/api/orders/label?ids=' + ids); }} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-lg">打印面单</button>
        </div>
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {['all','paid','shipped','delivered','cancelled'].map((f) => (
          <button key={f} onClick={() => { setFilter(f); setTimeout(fetchOrders, 50); }}
            className={`text-sm px-3 py-1.5 rounded-full whitespace-nowrap ${filter === f ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-600'}`}>
            {f === 'all' ? '全部' : f === 'paid' ? '待发货' : f === 'shipped' ? '已发货' : f === 'delivered' ? '已签收' : '已取消'}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-10 text-gray-400">加载中...</div>}
      {error && <div className="text-center py-10 text-red-500">{error} <button onClick={fetchOrders} className="text-blue-600 underline ml-2">重试</button></div>}
      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-16"><div className="text-5xl mb-3">📋</div><p className="text-gray-400">暂无订单</p></div>
      )}

      <div className="space-y-2">
        {orders.map((o) => {
          const s = sm[o.status] || { label: o.status, color: 'bg-gray-50 text-gray-600' };
          return (
            <div key={o.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{o.tiktokId || o.id.slice(0,8)}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{o.buyerName || '未知买家'} · {o.items?.reduce((s,i) => s + i.quantity, 0) || 0}件</span>
                <span>{timeAgo(o.createdAt)}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between">
                <span className="text-lg font-bold">${o.totalAmount.toFixed(2)}</span>
                {o.status === 'paid' && (
                  <button onClick={() => handleShip(o.id)} className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium active:bg-blue-700">发货</button>
                )}
                {o.status === 'shipped' && (
                  <span className="text-xs text-purple-500">运输中</span>
                )}
                {o.status === 'delivered' && (
                  <span className="text-xs text-green-500">✓</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Finance (Real Data) ──────────────────────────────
function FinancePage() {
  const [data, setData] = useState<{summary:{revenue:number;costs:number;profit:number;orderCount:number;inventoryValue:number;estimatedMargin:string};records:Array<{id:string;type:string;amount:number;note:string;date:string}>} | null>(null);

  useEffect(() => {
    fetch('/api/finance').then(r => r.json()).then(setData).catch(() => {});
  }, []);

  const typeLabel = (t: string) => {
    const m: Record<string,string> = { revenue: '收入', cost: '成本', shipping: '物流', ads: '广告', refund: '退款' };
    return m[t] || t;
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">财务管理</h1>

      {data ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '总收入', value: `$${data.summary.revenue.toFixed(0)}` },
              { label: '总支出', value: `$${data.summary.costs.toFixed(0)}` },
              { label: '净利润', value: `$${data.summary.profit.toFixed(0)}`, hl: data.summary.profit >= 0 },
              { label: '库存价值', value: `$${data.summary.inventoryValue.toFixed(0)}` },
            ].map((s) => (
              <div key={s.label} className={`rounded-2xl p-4 ${s.hl !== undefined ? (s.hl ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200') : 'bg-white shadow-sm border border-gray-100'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Icons.DollarSign />
                  <span className="text-xs text-gray-500">{s.label}</span>
                </div>
                <p className="text-lg font-bold">{s.value}</p>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-400 text-center">
            订单: {data.summary.orderCount} · 利润率: {data.summary.estimatedMargin}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h2 className="font-semibold mb-3">最近收支</h2>
            {data.records.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">暂无记录</p>
            ) : (
              data.records.slice(0, 10).map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <span className={`text-xs px-1.5 py-0.5 rounded mr-2 ${r.type === 'revenue' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{typeLabel(r.type)}</span>
                    <span className="text-sm">{r.note || '-'}</span>
                  </div>
                  <span className={`text-sm font-medium ${r.type === 'revenue' ? 'text-green-600' : 'text-red-500'}`}>
                    {r.type === 'revenue' ? '+' : '-'}${r.amount.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-10 text-gray-400">加载中...</div>
      )}
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────
function SettingsPage() {
  const [user, setUser] = useState<{id:string;email:string|null;name:string;role:string} | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => {
      if (d?.user) setUser(d.user);
    }).catch(() => {});
  }, []);

  const handleAuth = async () => {
    setMsg('');
    const url = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = authMode === 'login' ? { email, password } : { email, password, name };
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await res.json();
    if (!res.ok) { setMsg(d.error || 'Failed'); return; }
    setUser(d.user);
    setEmail(''); setPassword(''); setName('');
  };

  const handleLogout = async () => {
    await fetch('/api/auth/me', { method: 'DELETE' });
    setUser(null);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">设置</h1>

      {/* Auth Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <h2 className="font-semibold mb-3">账号</h2>
        {user ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email} · {user.role === 'owner' ? '店主' : user.role === 'manager' ? '运营' : user.role === 'finance' ? '财务' : '客服'}</p>
              </div>
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">已登录</span>
            </div>
            <button onClick={handleLogout} className="text-sm text-red-500 mt-2">退出登录</button>
          </div>
        ) : (
          <div>
            <div className="flex gap-2 mb-3">
              <button onClick={() => setAuthMode('login')} className={`text-sm px-3 py-1 rounded-full ${authMode === 'login' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>登录</button>
              <button onClick={() => setAuthMode('register')} className={`text-sm px-3 py-1 rounded-full ${authMode === 'register' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>注册</button>
            </div>
            {authMode === 'register' && (
              <input value={name} onChange={e => setName(e.target.value)} placeholder="姓名" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-2" />
            )}
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="邮箱" type="email" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-2" />
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="密码" type="password" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-2" />
            {msg && <p className="text-xs text-red-500 mb-2">{msg}</p>}
            <button onClick={handleAuth} className="w-full bg-blue-600 text-white text-sm py-2 rounded-lg font-medium active:bg-blue-700">
              {authMode === 'login' ? '登录' : '注册'}
            </button>
          </div>
        )}
      </div>

      {/* System Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
        {[
          ['连接 TikTok 店铺', '未连接'],
          ['版本', 'v0.2.0 Phase 2'],
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

// ─── Livestream ────────────────────────────────────────
function LivePage() {
  const [streams, setStreams] = useState<Array<{id:string;title:string;status:string;scheduledAt:string;startedAt?:string;endedAt?:string;metrics?:{peakViewers:number;totalGmv:number;totalOrders:number};products:Array<{productId:string}>}>>([]);

  useEffect(() => { fetch('/api/livestream').then(r=>r.json()).then(d=>setStreams(d.streams||[])).catch(()=>{}); }, []);

  const statusLabel = (s:string) => s==='scheduled'?'排期中':s==='live'?'🔴直播中':s==='ended'?'已结束':s;

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between"><h1 className="text-xl font-bold">直播管理</h1><button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-xl">+ 新建直播</button></div>
      {streams.map(s => (
        <div key={s.id} className={`bg-white rounded-2xl p-4 shadow-sm border ${s.status==='live'?'border-red-200 bg-red-50/30':'border-gray-100'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">{s.title}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${s.status==='live'?'bg-red-100 text-red-600':s.status==='scheduled'?'bg-blue-50 text-blue-600':'bg-gray-100 text-gray-500'}`}>{statusLabel(s.status)}</span>
          </div>
          <p className="text-xs text-gray-400">{new Date(s.scheduledAt).toLocaleString('zh-CN')}</p>
          {s.metrics && (
            <div className="flex gap-4 mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
              <span>👁 {s.metrics.peakViewers.toLocaleString()}</span><span>📦 {s.metrics.totalOrders}单</span><span>💰 ${s.metrics.totalGmv.toFixed(0)}</span>
            </div>
          )}
        </div>
      ))}
      {streams.length===0 && <div className="text-center py-10 text-gray-400">还没有直播排期</div>}
    </div>
  );
}

// ─── Creators (Influencers) ───────────────────────────
function CreatorsPage() {
  const [influencers, setInfluencers] = useState<Array<{id:string;name:string;tiktokId:string;followers:number;status:string;category:string;campaigns:Array<{gmv:number;ordersCount:number}>}>>([]);

  useEffect(() => { fetch('/api/influencers').then(r=>r.json()).then(d=>setInfluencers(d.influencers||[])).catch(()=>{}); }, []);

  const sLabel = (s:string) => s==='active'?'合作中':s==='sampling'?'寄样中':s==='contacted'?'已联系':'新发现';

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between"><h1 className="text-xl font-bold">达人管理</h1><button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-xl">+ 添加达人</button></div>
      {influencers.map(inf => (
        <div key={inf.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold">{inf.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600">{sLabel(inf.status)}</span>
          </div>
          <p className="text-xs text-gray-400">{inf.tiktokId} · {inf.followers?.(inf.followers/1000).toFixed(0)+'K'||0}粉丝 · {inf.category}</p>
          {inf.campaigns?.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-50 text-xs text-gray-500">
              {inf.campaigns.map((c,i) => <span key={i} className="mr-3">GMV ${c.gmv.toFixed(0)} · {c.ordersCount}单</span>)}
            </div>
          )}
        </div>
      ))}
      {influencers.length===0 && <div className="text-center py-10 text-gray-400">还没有达人</div>}
    </div>
  );
}

// ─── App Shell (updated tabs) ─────────────────────────
export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="h-full flex flex-col max-w-lg mx-auto bg-gray-50 relative">
      {/* Content */}
      <div className="flex-1 overflow-auto pb-16">
        {activeTab === 'dashboard' && <DashboardPage />}
        {activeTab === 'products' && <ProductsPage />}
        {activeTab === 'orders' && <OrdersPage />}
        {activeTab === 'live' && <LivePage />}
        {activeTab === 'creators' && <CreatorsPage />}
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
