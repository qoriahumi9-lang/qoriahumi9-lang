import React, { useState, useMemo } from 'react';
import { usePOS } from '../context/POSContext';
import { PaymentMethod, Transaction } from '../types/pos';
import {
  Search,
  Receipt,
  Download,
  Printer,
  RotateCcw,
  Ban,
  CheckCircle,
  Clock,
  Filter,
  Eye,
  AlertTriangle,
} from 'lucide-react';

export const TransactionHistory: React.FC = () => {
  const { transactions, showReceipt, voidTransaction, formatIDR } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<'all' | PaymentMethod>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'voided'>('all');
  const [confirmVoidId, setConfirmVoidId] = useState<string | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        t.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.customerName && t.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchMethod = methodFilter === 'all' || t.paymentMethod === methodFilter;
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;

      return matchSearch && matchMethod && matchStatus;
    });
  }, [transactions, searchQuery, methodFilter, statusFilter]);

  const handleExportCSV = () => {
    if (transactions.length === 0) return;

    const headers = [
      'No Invoice',
      'Waktu',
      'Pelanggan',
      'No Meja',
      'Metode Bayar',
      'Subtotal',
      'Diskon',
      'Pajak PPN',
      'Total',
      'Status',
      'Daftar Item',
    ];

    const rows = filteredTransactions.map((t) => {
      const itemsSummary = t.items.map((i) => `${i.name} (${i.quantity}x)`).join('; ');
      return [
        `"${t.invoiceNumber}"`,
        `"${new Date(t.timestamp).toLocaleString('id-ID')}"`,
        `"${t.customerName || 'Umum'}"`,
        `"${t.tableNumber || '-'}"`,
        `"${t.paymentMethod}"`,
        t.subtotal,
        t.discountAmount,
        t.taxAmount,
        t.total,
        `"${t.status}"`,
        `"${itemsSummary}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Transaksi_NEON_POS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Riwayat Transaksi</h1>
          <p className="text-xs text-slate-400 mt-1">
            Daftar seluruh penjualan kasir, cetak ulang struk, dan ekspor laporan
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={transactions.length === 0}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all disabled:opacity-40"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Ekspor CSV (Excel)</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor invoice (NP-...), nama pelanggan, atau menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Method filter buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
          {(
            [
              { id: 'all', label: 'Semua Metode' },
              { id: 'cash', label: 'Tunai' },
              { id: 'qris', label: 'QRIS' },
              { id: 'ewallet', label: 'E-Wallet' },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => setMethodFilter(m.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                methodFilter === m.id
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Status filter buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
          {(
            [
              { id: 'all', label: 'Semua Status' },
              { id: 'completed', label: 'Lunas' },
              { id: 'voided', label: 'Void' },
            ] as const
          ).map((s) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === s.id
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Receipt className="w-12 h-12 mx-auto text-slate-700 mb-3 stroke-1" />
            <p className="text-sm font-medium text-slate-300">Tidak ada riwayat transaksi</p>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery ? 'Coba sesuaikan kata kunci pencarian Anda.' : 'Lakukan penjualan pertama di menu Kasir.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10.5px]">
                  <th className="py-3 px-4">Invoice</th>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Pelanggan</th>
                  <th className="py-3 px-4">Metode</th>
                  <th className="py-3 px-4">Ringkasan Item</th>
                  <th className="py-3 px-4 text-right">Total Bayar</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredTransactions.map((tx) => {
                  const isVoided = tx.status === 'voided';
                  const date = new Date(tx.timestamp);
                  const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                  const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-slate-800/40 transition-colors ${isVoided ? 'opacity-60 bg-rose-950/10' : ''}`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">{tx.invoiceNumber}</td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                        {dateStr}, {timeStr}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{tx.customerName || 'Pelanggan Umum'}</div>
                        <div className="text-[10.5px] text-slate-500 font-mono">{tx.tableNumber || '-'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono uppercase text-[11px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-[200px] truncate">
                        {tx.items.map((i) => `${i.name} (${i.quantity}x)`).join(', ')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white tabular-nums text-sm">
                        {formatIDR(tx.total)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            isVoided
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {isVoided ? 'Voided' : 'Lunas'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => showReceipt(tx)}
                            className="p-1.5 rounded-lg bg-cyan-950/50 text-cyan-300 border border-cyan-800/50 hover:bg-cyan-900/60 transition-colors"
                            title="Lihat / Cetak Struk"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {!isVoided && (
                            <button
                              onClick={() => setConfirmVoidId(tx.id)}
                              className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-800/40 hover:bg-rose-900/50 transition-colors"
                              title="Batalkan Transaksi (Void)"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Void */}
      {confirmVoidId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-400 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Konfirmasi Void Transaksi</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Apakah Anda yakin ingin membatalkan transaksi ini? Transaksi yang dibatalkan tidak akan dihitung ke omzet harian.
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setConfirmVoidId(null)}
                className="px-3.5 py-2 text-xs text-slate-400 hover:text-white"
              >
                Kembali
              </button>
              <button
                onClick={() => {
                  voidTransaction(confirmVoidId);
                  setConfirmVoidId(null);
                }}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-xl hover:bg-rose-500 transition-colors"
              >
                Ya, Batalkan Transaksi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
