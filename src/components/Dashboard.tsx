import React, { useState, useMemo } from 'react';
import { usePOS } from '../context/POSContext';
import {
  TrendingUp,
  CreditCard,
  Banknote,
  QrCode,
  DollarSign,
  ShoppingBag,
  Award,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { transactions, formatIDR } = usePOS();
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | 'all'>('today');

  // Filter valid transactions (exclude voided)
  const activeTransactions = useMemo(() => {
    const valid = transactions.filter((t) => t.status !== 'voided');
    const now = new Date();

    if (timeFilter === 'today') {
      const todayDateStr = now.toISOString().slice(0, 10);
      return valid.filter((t) => t.timestamp.startsWith(todayDateStr));
    }
    if (timeFilter === '7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return valid.filter((t) => new Date(t.timestamp) >= sevenDaysAgo);
    }
    return valid;
  }, [transactions, timeFilter]);

  // Aggregate Key Metrics
  const totalRevenue = activeTransactions.reduce((acc, t) => acc + t.total, 0);
  const totalOrders = activeTransactions.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Calculate gross profit
  const totalCost = activeTransactions.reduce((acc, t) => {
    const txCost = t.items.reduce((sum, item) => sum + (item.costPrice || 0) * item.quantity, 0);
    return acc + txCost;
  }, 0);
  const estimatedGrossProfit = Math.max(0, totalRevenue - totalCost);
  const profitMargin = totalRevenue > 0 ? Math.round((estimatedGrossProfit / totalRevenue) * 100) : 0;

  // Breakdown by Payment Method
  const paymentBreakdown = useMemo(() => {
    const counts = { cash: 0, qris: 0, ewallet: 0, debit: 0 };
    const amounts = { cash: 0, qris: 0, ewallet: 0, debit: 0 };

    activeTransactions.forEach((t) => {
      counts[t.paymentMethod] = (counts[t.paymentMethod] || 0) + 1;
      amounts[t.paymentMethod] = (amounts[t.paymentMethod] || 0) + t.total;
    });

    return [
      {
        id: 'qris',
        label: 'QRIS',
        count: counts.qris,
        amount: amounts.qris,
        icon: QrCode,
        color: 'from-cyan-500 to-blue-500',
        textColor: 'text-cyan-400',
      },
      {
        id: 'cash',
        label: 'Tunai (Cash)',
        count: counts.cash,
        amount: amounts.cash,
        icon: Banknote,
        color: 'from-emerald-500 to-teal-600',
        textColor: 'text-emerald-400',
      },
      {
        id: 'ewallet',
        label: 'E-Wallet / Kartu',
        count: counts.ewallet + counts.debit,
        amount: amounts.ewallet + amounts.debit,
        icon: CreditCard,
        color: 'from-purple-500 to-indigo-600',
        textColor: 'text-purple-400',
      },
    ];
  }, [activeTransactions]);

  // Top Selling Products
  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; category: string; quantity: number; revenue: number }> = {};

    activeTransactions.forEach((t) => {
      t.items.forEach((item) => {
        if (!map[item.productId]) {
          map[item.productId] = {
            name: item.name,
            category: item.category,
            quantity: 0,
            revenue: 0,
          };
        }
        map[item.productId].quantity += item.quantity;
        map[item.productId].revenue += item.total;
      });
    });

    return Object.values(map)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [activeTransactions]);

  // Sales trend by hour (for today) or by day
  const salesTrend = useMemo(() => {
    // Generate buckets
    const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
    const buckets: Record<string, number> = {};
    hours.forEach((h) => (buckets[h] = 0));

    activeTransactions.forEach((t) => {
      const date = new Date(t.timestamp);
      const hour = date.getHours();
      // map to nearest bucket
      let nearest = '08:00';
      if (hour >= 21) nearest = '22:00';
      else if (hour >= 19) nearest = '20:00';
      else if (hour >= 17) nearest = '18:00';
      else if (hour >= 15) nearest = '16:00';
      else if (hour >= 13) nearest = '14:00';
      else if (hour >= 11) nearest = '12:00';
      else if (hour >= 9) nearest = '10:00';
      else nearest = '08:00';

      buckets[nearest] = (buckets[nearest] || 0) + t.total;
    });

    const maxVal = Math.max(...Object.values(buckets), 100000);
    return hours.map((h) => ({
      hour: h,
      amount: buckets[h] || 0,
      percentage: Math.round(((buckets[h] || 0) / maxVal) * 100),
    }));
  }, [activeTransactions]);

  return (
    <div className="space-y-6">
      {/* Top Header & Range Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white tracking-tight">Dashboard Penjualan</h1>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-full">
              Live POS Metrics
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pantau arus transaksi kasir, omzet penjualan, dan performa produk secara langsung
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
          {(
            [
              { id: 'today', label: 'Hari Ini' },
              { id: '7days', label: '7 Hari Terakhir' },
              { id: 'all', label: 'Semua Periode' },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setTimeFilter(filter.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                timeFilter === filter.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 PRIMARY KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Omzet */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Total Omzet Penjualan</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-black text-white tabular-nums tracking-tight">
            {formatIDR(totalRevenue)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Pendapatan kotor terverifikasi</span>
          </div>
        </div>

        {/* Metric 2: Total Transaksi */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Total Transaksi Selesai</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-black text-white tabular-nums tracking-tight">
            {totalOrders}{' '}
            <span className="text-sm font-sans font-normal text-slate-400">struk</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Semua pembayaran berhasil
          </div>
        </div>

        {/* Metric 3: Average Order Value */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Rata-rata Transaksi (AOV)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-black text-white tabular-nums tracking-tight">
            {formatIDR(avgOrderValue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Rata-rata belanja per pelanggan
          </div>
        </div>

        {/* Metric 4: Estimasi Margin Kotor */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Estimasi Laba Kotor</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-black text-white tabular-nums tracking-tight">
            {formatIDR(estimatedGrossProfit)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-purple-400 mt-2 font-mono">
            <span>Margin: ~{profitMargin}% dari omzet</span>
          </div>
        </div>
      </div>

      {/* ANALYTICS SECTION: Charts & Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly Sales Trend Bar Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Tren Penjualan Menurut Jam
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Aktivitas jam sibuk (peak hours) pesanan masuk
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">IDR</span>
          </div>

          {/* Interactive CSS Bar Chart */}
          <div className="pt-6 pb-2">
            <div className="h-44 flex items-end justify-between gap-2 border-b border-slate-800 px-2">
              {salesTrend.map((item) => (
                <div key={item.hour} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -translate-y-12 bg-slate-950 border border-cyan-500/40 text-[10px] text-cyan-300 font-mono px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-10">
                    {formatIDR(item.amount)}
                  </div>
                  {/* Bar */}
                  <div
                    className="w-full max-w-[32px] rounded-t-lg bg-gradient-to-t from-cyan-600/60 to-cyan-400 group-hover:from-cyan-500 group-hover:to-cyan-300 transition-all duration-300 shadow-sm shadow-cyan-500/20"
                    style={{ height: `${Math.max(item.percentage, 8)}%` }}
                  />
                  {/* Label */}
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-cyan-300 transition-colors">
                    {item.hour}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Methods Breakdown (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Metode Pembayaran</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Proporsi transaksi non-tunai vs tunai di kasir
            </p>

            <div className="space-y-4 mt-5">
              {paymentBreakdown.map((item) => {
                const Icon = item.icon;
                const percentage = totalRevenue > 0 ? Math.round((item.amount / totalRevenue) * 100) : 0;
                return (
                  <div key={item.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${item.textColor}`} />
                        <span className="text-slate-200 font-medium">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-slate-400 text-[11px]">({item.count}x)</span>
                        <span className="font-semibold text-white tabular-nums">
                          {formatIDR(item.amount)}
                        </span>
                        <span className="text-cyan-400 text-xs font-bold tabular-nums">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full bg-gradient-to-r ${item.color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Metode paling populer:</span>
            <span className="text-cyan-400 font-semibold">QRIS (Gen Z Favorite)</span>
          </div>
        </div>
      </div>

      {/* TOP 5 PRODUCTS TABLE */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Produk Terlaris (Top Sellers)</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Menu yang paling sering dipesan dalam periode ini
            </p>
          </div>
        </div>

        {topProducts.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Belum ada transaksi di periode ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">#</th>
                  <th className="pb-3 font-semibold">Nama Menu</th>
                  <th className="pb-3 font-semibold">Kategori</th>
                  <th className="pb-3 font-semibold text-right">Terjual</th>
                  <th className="pb-3 font-semibold text-right">Total Penjualan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {topProducts.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 text-cyan-400 font-bold">{idx + 1}</td>
                    <td className="py-3 font-sans font-semibold text-white">{p.name}</td>
                    <td className="py-3 font-sans text-slate-400">{p.category}</td>
                    <td className="py-3 text-right text-slate-200 tabular-nums">
                      {p.quantity} cup/porsi
                    </td>
                    <td className="py-3 text-right text-cyan-400 font-bold tabular-nums">
                      {formatIDR(p.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
