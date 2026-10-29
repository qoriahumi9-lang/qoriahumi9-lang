import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import {
  Settings,
  Store,
  Receipt,
  User,
  Percent,
  RotateCcw,
  Save,
  Check,
  ShieldCheck,
  Sparkles,
  Info,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetToDemo } = usePOS();
  const [formData, setFormData] = useState(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    resetToDemo();
    setFormData(settings);
    setConfirmReset(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white tracking-tight">Pengaturan Sistem POS</h1>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-full">
              Konfigurasi Toko & Kasir
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ubah identitas outlet, format informasi struk transaksi, dan tarif pajak
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Profil Toko */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-3">
            <Store className="w-4 h-4 text-cyan-400" />
            <span>Identitas Outlet / Toko</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nama Toko / Brand</label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tagline Outlet</label>
              <input
                type="text"
                value={formData.storeTagline}
                onChange={(e) => setFormData({ ...formData, storeTagline: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Alamat Lengkap</label>
              <input
                type="text"
                value={formData.storeAddress}
                onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">No. Kontak / WhatsApp Toko</label>
              <input
                type="text"
                value={formData.storePhone}
                onChange={(e) => setFormData({ ...formData, storePhone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nama Kasir Bertugas</label>
              <input
                type="text"
                value={formData.cashierName}
                onChange={(e) => setFormData({ ...formData, cashierName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Pajak & Struk */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-3">
            <Receipt className="w-4 h-4 text-cyan-400" />
            <span>Pajak (PPN) & Format Struk</span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <span className="font-semibold text-white block">Aktifkan Pajak Otomatis (PPN)</span>
                <span className="text-slate-400 text-[11px]">
                  Tambahkan persentase pajak secara otomatis pada setiap transaksi kasir
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.taxEnabled}
                onChange={(e) => setFormData({ ...formData, taxEnabled: e.target.checked })}
                className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
              />
            </div>

            {formData.taxEnabled && (
              <div className="max-w-xs">
                <label className="block text-slate-300 font-semibold mb-1">Tarif Pajak PPN (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={formData.taxRate}
                    onChange={(e) =>
                      setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">
                    %
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Pesan Footer Struk</label>
              <textarea
                rows={3}
                value={formData.receiptFooter}
                onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
                placeholder="Tulis pesan ucapan terima kasih atau info sosial media untuk pelanggan..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl border border-rose-900/40 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ke Demo Awal</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 rounded-xl hover:brightness-110 shadow-lg shadow-cyan-500/25 transition-all"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                <span>Pengaturan Tersimpan!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Information Box for SI Coursework / Project Background */}
      <div className="p-5 bg-gradient-to-br from-cyan-950/30 to-slate-950 border border-cyan-800/40 rounded-2xl flex items-start gap-3.5">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1.5 leading-relaxed">
          <span className="font-bold text-white block">
            Catatan Konsep: NEON POS untuk Sistem Informasi & Retail Gen Z
          </span>
          <p className="text-slate-300">
            Aplikasi ini dirancang dengan standar arsitektur POS modern: kalkulasi otomatis kembalian tunai,
            simulasi dinamis QRIS, struk thermal siap cetak, dan analitik penjualan real-time.
          </p>
          <p className="text-slate-400 text-[11px]">
            Data disimpan secara lokal di peramban (localStorage) dan siap dikembangkan lebih lanjut dengan backend database
            seperti PostgreSQL atau Firebase untuk sinkronisasi multi-kasir.
          </p>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl">
            <h3 className="text-sm font-bold text-white">Reset Semua Data ke Demo?</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Tindakan ini akan mengembalikan daftar produk, transaksi sampel, dan pengaturan toko ke kondisi awal aplikasi.
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setConfirmReset(false)}
                className="px-3.5 py-2 text-xs text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-xl hover:bg-rose-500 transition-colors"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
