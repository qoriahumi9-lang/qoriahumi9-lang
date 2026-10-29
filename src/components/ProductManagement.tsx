import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Product, ProductCategory } from '../types/pos';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Package,
  AlertCircle,
  X,
  Check,
  Coffee,
  Sparkles,
} from 'lucide-react';

const CATEGORY_OPTIONS: ProductCategory[] = [
  'Coffee',
  'Non-Coffee',
  'Signature',
  'Bakery & Snack',
  'Food & Meal',
];

const PRESET_IMAGE_OPTIONS = [
  { label: 'Cyber Latte', url: '/src/assets/images/neon_cyber_latte_1793281116129.jpg' },
  { label: 'Galaxy Mocktail', url: '/src/assets/images/neon_galaxy_mocktail_1793281117135.jpg' },
  { label: 'Artisan Pastry', url: '/src/assets/images/neon_artisan_pastry_1793281117128.jpg' },
  { label: 'Matcha Fizz', url: '/src/assets/images/neon_matcha_fizz_1793281117320.jpg' },
];

export const ProductManagement: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, updateStock, formatIDR } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<{
    name: string;
    sku: string;
    category: ProductCategory;
    price: number;
    costPrice: number;
    stock: number;
    description: string;
    imageUrl: string;
    badge?: 'Best Seller' | 'New' | 'Signature' | 'Favorite' | undefined;
  }>({
    name: '',
    sku: '',
    category: 'Coffee',
    price: 25000,
    costPrice: 10000,
    stock: 20,
    description: '',
    imageUrl: PRESET_IMAGE_OPTIONS[0].url,
    badge: undefined,
  });

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `NP-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Coffee',
      price: 25000,
      costPrice: 10000,
      stock: 20,
      description: '',
      imageUrl: PRESET_IMAGE_OPTIONS[0].url,
      badge: undefined,
    });
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      costPrice: product.costPrice,
      stock: product.stock,
      description: product.description,
      imageUrl: product.imageUrl,
      badge: product.badge,
    });
    setIsFormOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        ...formData,
        isAvailable: formData.stock > 0,
      });
    } else {
      addProduct({
        ...formData,
        isAvailable: formData.stock > 0,
      });
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Katalog & Stok Produk</h1>
          <p className="text-xs text-slate-400 mt-1">
            Kelola menu penjualan, sesuaikan harga, pantau ketersediaan stok, dan tambah produk baru
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Menu Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari produk berdasarkan nama atau SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua
          </button>
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Package className="w-12 h-12 mx-auto text-slate-700 mb-3 stroke-1" />
            <p className="text-sm font-medium text-slate-300">Tidak ada produk ditemukan</p>
            <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci atau tambah produk baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono text-[10.5px] uppercase">
                  <th className="py-3 px-4">Menu</th>
                  <th className="py-3 px-4">SKU & Kategori</th>
                  <th className="py-3 px-4 text-right">Harga Jual</th>
                  <th className="py-3 px-4 text-right">Modal (HPP)</th>
                  <th className="py-3 px-4 text-center">Stok</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredProducts.map((p) => {
                  const isLow = p.stock > 0 && p.stock <= 5;
                  const isOut = p.stock <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>{p.name}</span>
                              {p.badge && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
                                  {p.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs mt-0.5">
                              {p.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono text-cyan-400 text-[11px] font-semibold">{p.sku}</div>
                        <div className="text-slate-400 text-[11px]">{p.category}</div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-white tabular-nums">
                        {formatIDR(p.price)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-400 tabular-nums">
                        {formatIDR(p.costPrice)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
                          <button
                            onClick={() => updateStock(p.id, -1)}
                            disabled={p.stock <= 0}
                            className="text-slate-400 hover:text-white disabled:opacity-30"
                            title="Kurang 1"
                          >
                            -
                          </button>
                          <span
                            className={`font-mono font-bold text-xs tabular-nums px-1 ${
                              isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-slate-200'
                            }`}
                          >
                            {p.stock}
                          </span>
                          <button
                            onClick={() => updateStock(p.id, 1)}
                            className="text-slate-400 hover:text-white"
                            title="Tambah 1"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            isOut
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                              : isLow
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {isOut ? 'Habis' : isLow ? 'Menipis' : 'Tersedia'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-cyan-300 hover:bg-slate-700 transition-colors"
                            title="Edit Produk"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="p-1.5 rounded-lg bg-rose-950/30 text-rose-400 hover:bg-rose-900/50 transition-colors"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* ADD / EDIT PRODUCT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#0b0f19] border border-cyan-950/80 rounded-3xl max-w-lg w-full shadow-2xl p-6 my-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>{editingProduct ? 'Edit Menu Produk' : 'Tambah Menu Produk Baru'}</span>
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Menu</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Iced Cyber Caramel Macchiato"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">SKU / Kode Item</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as ProductCategory })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Modal / HPP (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={formData.costPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, costPrice: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Jumlah Stok</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pilih Gambar Preset</label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_IMAGE_OPTIONS.map((img) => (
                    <div
                      key={img.url}
                      onClick={() => setFormData({ ...formData, imageUrl: img.url })}
                      className={`cursor-pointer rounded-xl overflow-hidden border p-1 bg-slate-950 transition-all ${
                        formData.imageUrl === img.url
                          ? 'border-cyan-500 ring-2 ring-cyan-500/30'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.label}
                        referrerPolicy="no-referrer"
                        className="w-full aspect-video object-cover rounded-lg"
                      />
                      <span className="block text-[10px] text-center text-slate-400 mt-1 truncate">
                        {img.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ceritakan racikan bahan atau keunikan rasa menu ini..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Badge Spesial</label>
                <select
                  value={formData.badge || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      badge: (e.target.value as any) || undefined,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Tanpa Badge</option>
                  <option value="Best Seller">Best Seller</option>
                  <option value="Signature">Signature</option>
                  <option value="New">New Drop</option>
                  <option value="Favorite">Favorite</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-xl hover:brightness-110 shadow-lg shadow-cyan-500/25"
                >
                  {editingProduct ? 'Perbarui Menu' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl">
            <h3 className="text-sm font-bold text-white">Hapus Produk Ini?</h3>
            <p className="text-xs text-slate-400 mt-1.5">
              Produk akan dihapus dari katalog kasir. Transaksi sebelumnya tetap tersimpan di riwayat.
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-2 text-xs text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  deleteProduct(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-xl hover:bg-rose-500 transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
