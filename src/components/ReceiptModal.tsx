import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import {
  X,
  Printer,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const {
    isReceiptModalOpen,
    closeReceiptModal,
    currentReceipt,
    settings,
    formatIDR,
    setActiveTab,
  } = usePOS();

  const [copied, setCopied] = useState(false);

  if (!isReceiptModalOpen || !currentReceipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    if (!currentReceipt) return;

    const receiptText = `
========================================
${settings.storeName}
${settings.storeTagline}
${settings.storeAddress}
Telp: ${settings.storePhone}
========================================
No. Invoice : ${currentReceipt.invoiceNumber}
Waktu       : ${new Date(currentReceipt.timestamp).toLocaleString('id-ID')}
Kasir       : ${currentReceipt.cashierName}
Pelanggan   : ${currentReceipt.customerName || 'Umum'} (${currentReceipt.tableNumber || '-'})
----------------------------------------
ITEM:
${currentReceipt.items
  .map(
    (item) =>
      `${item.name} (${item.quantity}x @${formatIDR(item.price)})\n` +
      (item.notes ? `  Catatan: ${item.notes}\n` : '') +
      `  = ${formatIDR(item.total)}`
  )
  .join('\n')}
----------------------------------------
Subtotal    : ${formatIDR(currentReceipt.subtotal)}
${currentReceipt.discountAmount > 0 ? `Diskon      : -${formatIDR(currentReceipt.discountAmount)}\n` : ''}${
      currentReceipt.taxAmount > 0 ? `PPN (${currentReceipt.taxRate}%)  : ${formatIDR(currentReceipt.taxAmount)}\n` : ''
    }TOTAL       : ${formatIDR(currentReceipt.total)}
----------------------------------------
Metode Bayar: ${currentReceipt.paymentMethod.toUpperCase()}
${currentReceipt.cashGiven ? `Uang Diterima: ${formatIDR(currentReceipt.cashGiven)}\n` : ''}${
      currentReceipt.changeAmount !== undefined ? `Kembalian    : ${formatIDR(currentReceipt.changeAmount)}\n` : ''
    }========================================
${settings.receiptFooter}
========================================
    `.trim();

    navigator.clipboard.writeText(receiptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNewTransaction = () => {
    closeReceiptModal();
    setActiveTab('pos');
  };

  const formattedDate = new Date(currentReceipt.timestamp).toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = new Date(currentReceipt.timestamp).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative max-w-md w-full my-6 flex flex-col items-center">
        {/* Floating Top Controls */}
        <div className="w-full flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
            <Check className="w-4 h-4 bg-cyan-500/20 rounded-full p-0.5" />
            <span>Transaksi Berhasil Disimpan</span>
          </div>
          <button
            onClick={closeReceiptModal}
            className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* THERMAL RECEIPT CONTAINER */}
        <div
          id="thermal-receipt-printable"
          className="w-full bg-[#fdfdfd] text-slate-900 rounded-2xl shadow-2xl p-6 font-mono text-[12px] leading-relaxed border-t-8 border-cyan-500 relative select-text"
        >
          {/* Header */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <h1 className="font-sans font-black text-base text-slate-950 uppercase tracking-wider">
              {settings.storeName}
            </h1>
            <p className="text-[11px] text-slate-600 mt-0.5">{settings.storeTagline}</p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{settings.storeAddress}</p>
            <p className="text-[10px] text-slate-500">Telp: {settings.storePhone}</p>
          </div>

          {/* Invoice Info */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">No. Invoice</span>
              <span className="font-bold text-slate-950">{currentReceipt.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Waktu</span>
              <span>
                {formattedDate}, {formattedTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kasir</span>
              <span>{currentReceipt.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Pelanggan</span>
              <span className="font-semibold">{currentReceipt.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tipe / Meja</span>
              <span className="font-semibold">{currentReceipt.tableNumber}</span>
            </div>
          </div>

          {/* Items breakdown */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-2">
            {currentReceipt.items.map((item, idx) => (
              <div key={idx} className="flex flex-col">
                <div className="flex justify-between font-bold text-slate-950 text-[11.5px]">
                  <span className="truncate pr-2">{item.name}</span>
                  <span className="tabular-nums shrink-0">{formatIDR(item.total)}</span>
                </div>
                <div className="flex justify-between text-[10.5px] text-slate-600">
                  <span>
                    {item.quantity} x {formatIDR(item.price)}
                  </span>
                  {item.notes && (
                    <span className="italic text-slate-500 text-[10px] truncate max-w-[160px]">
                      *{item.notes}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal</span>
              <span className="tabular-nums font-medium">{formatIDR(currentReceipt.subtotal)}</span>
            </div>

            {currentReceipt.discountAmount > 0 && (
              <div className="flex justify-between text-cyan-800">
                <span>Diskon Promo</span>
                <span className="tabular-nums font-semibold">
                  -{formatIDR(currentReceipt.discountAmount)}
                </span>
              </div>
            )}

            {currentReceipt.taxAmount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>PPN ({currentReceipt.taxRate}%)</span>
                <span className="tabular-nums font-medium">{formatIDR(currentReceipt.taxAmount)}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-2 border-t border-slate-400 font-sans font-bold text-[14px] text-slate-950">
              <span>TOTAL</span>
              <span className="font-mono text-base tabular-nums">
                {formatIDR(currentReceipt.total)}
              </span>
            </div>
          </div>

          {/* Payment Details */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-600">Metode Bayar</span>
              <span className="font-bold text-slate-950 uppercase">
                {currentReceipt.paymentMethod === 'cash'
                  ? 'TUNAI (CASH)'
                  : currentReceipt.paymentMethod === 'qris'
                  ? 'QRIS DYNAMIC'
                  : 'E-WALLET / KARTU'}
              </span>
            </div>

            {currentReceipt.cashGiven !== undefined && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-600">Uang Diterima</span>
                  <span className="tabular-nums font-medium">{formatIDR(currentReceipt.cashGiven)}</span>
                </div>
                <div className="flex justify-between text-slate-950 font-bold">
                  <span>Kembalian</span>
                  <span className="tabular-nums text-[13px]">
                    {formatIDR(currentReceipt.changeAmount || 0)}
                  </span>
                </div>
              </>
            )}

            {currentReceipt.status === 'voided' && (
              <div className="mt-2 text-center py-1 bg-rose-100 text-rose-700 font-bold rounded">
                TRANSAKSI DIBATALKAN / VOID
              </div>
            )}
          </div>

          {/* Barcode Graphic & Footer Note */}
          <div className="pt-4 text-center">
            {/* Simulated Clean Barcode */}
            <div className="flex items-center justify-center gap-[2.5px] h-9 mb-2 opacity-85">
              {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 3, 1, 2, 1, 3, 4, 2, 1, 2, 3, 1, 4].map(
                (w, i) => (
                  <div
                    key={i}
                    className="h-full bg-slate-900"
                    style={{ width: `${w * 1.5}px` }}
                  />
                )
              )}
            </div>
            <p className="text-[9.5px] text-slate-500 font-mono tracking-widest uppercase">
              {currentReceipt.invoiceNumber}
            </p>

            <p className="text-[10px] text-slate-600 whitespace-pre-line mt-3 leading-tight">
              {settings.receiptFooter}
            </p>
          </div>
        </div>

        {/* Action Buttons (Excluded from print) */}
        <div className="w-full grid grid-cols-3 gap-2 mt-4 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk</span>
          </button>

          <button
            onClick={handleCopyText}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-900 border border-slate-800 text-slate-200 font-medium text-xs rounded-xl hover:bg-slate-800 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-cyan-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
          </button>

          <button
            onClick={handleNewTransaction}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-800 border border-slate-700 text-white font-medium text-xs rounded-xl hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Transaksi Baru</span>
          </button>
        </div>
      </div>
    </div>
  );
};
