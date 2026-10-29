import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import { PaymentMethod } from '../types/pos';
import {
  X,
  Banknote,
  QrCode,
  CreditCard,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  User,
  Coffee,
  Sparkles,
} from 'lucide-react';

export const PaymentModal: React.FC = () => {
  const {
    isPaymentModalOpen,
    closePaymentModal,
    cartTotal,
    cartSubtotal,
    cartDiscount,
    cartTax,
    cart,
    processPayment,
    formatIDR,
    settings,
  } = usePOS();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashGiven, setCashGiven] = useState<number>(cartTotal);
  const [cashInputString, setCashInputString] = useState<string>(String(cartTotal));
  const [customerName, setCustomerName] = useState<string>('');
  const [tableNumber, setTableNumber] = useState<string>('Dine-In');
  const [qrisCountdown, setQrisCountdown] = useState<number>(900); // 15 mins
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Sync cash input when cart total changes or modal opens
  useEffect(() => {
    if (isPaymentModalOpen) {
      setCashGiven(cartTotal);
      setCashInputString(String(cartTotal));
      setIsProcessing(false);
    }
  }, [isPaymentModalOpen, cartTotal]);

  // QRIS Countdown timer simulation
  useEffect(() => {
    if (!isPaymentModalOpen || paymentMethod !== 'qris') return;
    const interval = setInterval(() => {
      setQrisCountdown((prev) => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaymentModalOpen, paymentMethod]);

  if (!isPaymentModalOpen) return null;

  const handleCashChange = (valStr: string) => {
    const numericOnly = valStr.replace(/[^0-9]/g, '');
    setCashInputString(numericOnly);
    const parsed = parseInt(numericOnly, 10) || 0;
    setCashGiven(parsed);
  };

  const handleQuickCash = (amount: number) => {
    setCashGiven(amount);
    setCashInputString(String(amount));
  };

  const changeAmount = cashGiven - cartTotal;
  const isCashInsufficient = paymentMethod === 'cash' && changeAmount < 0;

  const handleConfirmPayment = () => {
    if (isCashInsufficient) return;
    setIsProcessing(true);

    setTimeout(() => {
      processPayment({
        paymentMethod,
        cashGiven: paymentMethod === 'cash' ? cashGiven : undefined,
        customerName: customerName.trim() || undefined,
        tableNumber: tableNumber.trim() || undefined,
      });
      setIsProcessing(false);
    }, 400);
  };

  const minutes = Math.floor(qrisCountdown / 60);
  const seconds = qrisCountdown % 60;
  const formattedTimer = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative bg-[#0c101c] border border-cyan-950/60 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Selesaikan Pembayaran</h2>
              <p className="text-[11px] text-slate-400">Pilih metode bayar dan verifikasi rincian transaksi</p>
            </div>
          </div>
          <button
            onClick={closePaymentModal}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Big Amount Banner */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl p-4 text-center">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Total Tagihan
            </span>
            <div className="font-mono text-3xl font-black text-cyan-400 tracking-tight mt-1 tabular-nums drop-shadow-[0_0_12px_rgba(34,211,238,0.3)]">
              {formatIDR(cartTotal)}
            </div>
            <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 mt-2">
              <span>{cart.reduce((sum, i) => sum + i.quantity, 0)} Item</span>
              <span>·</span>
              <span>Subtotal: {formatIDR(cartSubtotal)}</span>
              {cartDiscount.amount > 0 && (
                <>
                  <span>·</span>
                  <span className="text-cyan-400">Hemat {formatIDR(cartDiscount.amount)}</span>
                </>
              )}
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setPaymentMethod('cash')}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                paymentMethod === 'cash'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>Tunai (Cash)</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('qris')}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                paymentMethod === 'qris'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>QRIS</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('ewallet')}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                paymentMethod === 'ewallet'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>E-Wallet / Card</span>
            </button>
          </div>

          {/* TAB 1: CASH PAYMENT DETAILS */}
          {paymentMethod === 'cash' && (
            <div className="space-y-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nominal Uang Diterima (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-400 font-bold">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={cashInputString}
                    onChange={(e) => handleCashChange(e.target.value)}
                    placeholder="Masukkan nominal uang..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-base font-mono font-bold text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-2">Pilihan Cepat Nominal:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickCash(cartTotal)}
                    className="px-2.5 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 hover:bg-cyan-900/60 text-xs font-mono font-semibold transition-colors"
                  >
                    Uang Pas
                  </button>
                  {[50000, 100000, 200000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleQuickCash(amt)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-mono tabular-nums transition-colors"
                    >
                      {formatIDR(amt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Automatic Kembalian Box */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  isCashInsufficient
                    ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                    : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                }`}
              >
                <div className="flex items-center gap-2 text-xs">
                  {isCashInsufficient ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <span className="font-medium">
                    {isCashInsufficient ? 'Uang Belum Cukup:' : 'Kembalian Pelanggan:'}
                  </span>
                </div>
                <span className="font-mono text-base font-bold tabular-nums">
                  {formatIDR(Math.abs(changeAmount))}
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: QRIS PAYMENT */}
          {paymentMethod === 'qris' && (
            <div className="flex flex-col items-center justify-center p-5 bg-slate-900/50 rounded-2xl border border-slate-800/80 text-center">
              <div className="p-3 bg-white rounded-2xl shadow-xl shadow-cyan-500/10 mb-3 border border-slate-200">
                {/* Clean geometric SVG QR simulation */}
                <svg
                  className="w-44 h-44"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="100" height="100" fill="white" />
                  {/* Outer corner markers */}
                  <rect x="10" y="10" width="24" height="24" fill="black" />
                  <rect x="14" y="14" width="16" height="16" fill="white" />
                  <rect x="18" y="18" width="8" height="8" fill="black" />

                  <rect x="66" y="10" width="24" height="24" fill="black" />
                  <rect x="70" y="14" width="16" height="16" fill="white" />
                  <rect x="74" y="18" width="8" height="8" fill="black" />

                  <rect x="10" y="66" width="24" height="24" fill="black" />
                  <rect x="14" y="70" width="16" height="16" fill="white" />
                  <rect x="18" y="74" width="8" height="8" fill="black" />

                  {/* Random simulated QR matrix cells */}
                  <rect x="38" y="12" width="6" height="6" fill="black" />
                  <rect x="48" y="12" width="6" height="6" fill="black" />
                  <rect x="42" y="22" width="6" height="6" fill="black" />
                  <rect x="52" y="24" width="6" height="6" fill="black" />
                  <rect x="38" y="34" width="8" height="8" fill="black" />
                  <rect x="50" y="36" width="10" height="6" fill="black" />

                  <rect x="14" y="38" width="8" height="6" fill="black" />
                  <rect x="24" y="44" width="6" height="10" fill="black" />
                  <rect x="12" y="52" width="6" height="6" fill="black" />

                  <rect x="66" y="38" width="8" height="6" fill="black" />
                  <rect x="76" y="46" width="12" height="6" fill="black" />
                  <rect x="68" y="56" width="8" height="6" fill="black" />

                  <rect x="38" y="50" width="6" height="12" fill="black" />
                  <rect x="48" y="48" width="12" height="8" fill="black" />
                  <rect x="42" y="66" width="16" height="6" fill="black" />
                  <rect x="40" y="76" width="8" height="12" fill="black" />
                  <rect x="52" y="80" width="8" height="8" fill="black" />

                  <rect x="66" y="68" width="6" height="8" fill="black" />
                  <rect x="76" y="72" width="12" height="6" fill="black" />
                  <rect x="68" y="82" width="16" height="6" fill="black" />

                  {/* Center QRIS logo badge */}
                  <rect x="38" y="38" width="24" height="24" rx="4" fill="#000000" />
                  <text
                    x="50"
                    y="53"
                    textAnchor="middle"
                    fill="#00f0ff"
                    fontSize="7"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    QRIS
                  </text>
                </svg>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <span>{settings.storeName}</span>
                <span className="text-cyan-400">·</span>
                <span className="text-slate-400">NMID: ID1029482811</span>
              </div>

              <p className="text-[11px] text-slate-400 mt-1">
                Scan menggunakan BCA, Mandiri, GoPay, OVO, ShopeePay, atau m-Banking
              </p>

              <div className="mt-3 flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1 rounded-full">
                <span>Berlaku dalam:</span>
                <span className="font-bold">{formattedTimer}</span>
              </div>
            </div>
          )}

          {/* TAB 3: E-WALLET / DEBIT */}
          {paymentMethod === 'ewallet' && (
            <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/80 space-y-3">
              <span className="text-xs font-semibold text-slate-300 block">Pilih Channel Pembayaran:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['GoPay', 'ShopeePay', 'OVO / Dana', 'EDC / Kartu Debit'].map((wallet) => (
                  <div
                    key={wallet}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-slate-200"
                  >
                    <span>{wallet}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400">
                Pilih channel dan minta pelanggan menunjukkan bukti pembayaran atau gesek kartu pada mesin EDC.
              </p>
            </div>
          )}

          {/* Customer Metadata (Name & Table) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Nama Pelanggan (Opsional)</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Budi, Sarah"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Tipe Pesanan / No. Meja</label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Contoh: Meja 03, Takeaway"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Confirm Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isCashInsufficient || isProcessing}
              onClick={handleConfirmPayment}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                isCashInsufficient || isProcessing
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
                  : 'bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/25 active:scale-[0.99] cursor-pointer'
              }`}
            >
              {isProcessing ? (
                <span>Memproses Pembayaran...</span>
              ) : (
                <>
                  <span>Konfirmasi Pembayaran ({formatIDR(cartTotal)})</span>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                </>
              )}
            </button>
            {isCashInsufficient && (
              <p className="text-center text-[11px] text-rose-400 mt-2 font-medium">
                Nominal uang yang diberikan masih kurang dari total tagihan
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
