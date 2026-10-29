import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import { ShoppingCart, LayoutGrid, BarChart3, History, Package, Settings, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, cart, openPaymentModal, cartTotal, formatIDR } = usePOS();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB'
      );
      setCurrentDate(
        now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'pos', label: 'Kasir', icon: LayoutGrid },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'history', label: 'Riwayat Transaksi', icon: History },
    { id: 'inventory', label: 'Kelola Produk', icon: Package },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/95 backdrop-blur-md border-b border-cyan-950/40 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-slate-950 font-black tracking-wider text-base">
            <Sparkles className="w-5 h-5 text-slate-950 fill-current" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">NEON</span>
              <span className="text-lg font-bold tracking-tight text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                POS
              </span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline-block">Modern Cashier & Smart Store</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Clean Single-Line Controls) */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Live Telemetry */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Clock & Date */}
          <div className="hidden lg:flex flex-col text-right text-xs">
            <span className="font-mono text-cyan-400 font-semibold tabular-nums tracking-wide">
              {currentTime}
            </span>
            <span className="text-slate-400 text-[11px]">{currentDate}</span>
          </div>

          {/* Quick Cart Trigger (Mobile or when cart has items) */}
          {activeTab === 'pos' ? (
            <button
              onClick={openPaymentModal}
              disabled={cart.length === 0}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 whitespace-nowrap shrink-0 ${
                cart.length > 0
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/25 active:scale-[0.98]'
                  : 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-slate-800'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Bayar</span>
              {cartItemCount > 0 && (
                <span className="bg-slate-950 text-cyan-300 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold">
                  {cartItemCount}
                </span>
              )}
              {cartTotal > 0 && (
                <span className="font-mono hidden sm:inline-block ml-1 font-bold">
                  {formatIDR(cartTotal)}
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('pos')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all whitespace-nowrap shrink-0"
            >
              <LayoutGrid className="w-4 h-4 text-cyan-400" />
              <span>Buka Mesin Kasir</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Nav Drawer Bar */}
      <div className="flex md:hidden items-center justify-around gap-1 mt-2.5 pt-2.5 border-t border-slate-800/60 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 text-[10px] font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                isActive ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
