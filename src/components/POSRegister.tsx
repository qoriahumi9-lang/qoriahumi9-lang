import React, { useState, useMemo } from 'react';
import { usePOS } from '../context/POSContext';
import { ProductCategory, Product } from '../types/pos';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Percent,
  Receipt,
  Tag,
  Coffee,
  Check,
  Edit3,
  X,
  AlertCircle,
} from 'lucide-react';

const CATEGORIES: ('Semua' | ProductCategory)[] = [
  'Semua',
  'Coffee',
  'Non-Coffee',
  'Signature',
  'Bakery & Snack',
  'Food & Meal',
];

export const POSRegister: React.FC = () => {
  const {
    products,
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateCartNotes,
    clearCart,
    cartDiscount,
    setCartDiscount,
    cartSubtotal,
    cartTax,
    cartTotal,
    openPaymentModal,
    settings,
    formatIDR,
  } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | ProductCategory>('Semua');
  const [editingNoteForId, setEditingNoteForId] = useState<string | null>(null);
  const [noteInputValue, setNoteInputValue] = useState('');
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleOpenNoteModal = (productId: string, currentNote?: string) => {
    setEditingNoteForId(productId);
    setNoteInputValue(currentNote || '');
  };

  const handleSaveNote = () => {
    if (editingNoteForId) {
      updateCartNotes(editingNoteForId, noteInputValue.trim());
      setEditingNoteForId(null);
      setNoteInputValue('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-80px)]">
      {/* LEFT COLUMN: Catalog & Products (7 or 8 columns on desktop) */}
      <div className="lg:col-span-8 flex flex-col gap-5">
        {/* Top Controls: Search Bar & Categories */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari menu, SKU, atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-8 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Counter */}
          <div className="flex items-center gap-2 text-xs text-slate-400 whitespace-nowrap">
            <span>Menampilkan</span>
            <span className="font-mono text-cyan-400 font-semibold">{filteredProducts.length}</span>
            <span>dari {products.length} item</span>
          </div>
        </div>

        {/* Category Segmented Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 text-xs font-medium rounded-xl whitespace-nowrap shrink-0 transition-all duration-150 ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 text-center">
            <Coffee className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-sm font-medium text-slate-300">Tidak ada produk ditemukan</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Coba sesuaikan kata kunci pencarian atau pilih kategori lain.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Semua');
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-800/60 rounded-xl hover:bg-cyan-900/50 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const inCart = cart.find((item) => item.product.id === product.id);
              const isOutOfStock = product.stock <= 0;

              return (
                <div
                  key={product.id}
                  onClick={() => {
                    if (!isOutOfStock) {
                      addToCart(product, 1);
                    }
                  }}
                  className={`group relative flex flex-col justify-between bg-slate-900/70 hover:bg-slate-900 border rounded-2xl p-3.5 transition-all duration-200 select-none ${
                    inCart
                      ? 'border-cyan-500/60 ring-1 ring-cyan-500/40 shadow-lg shadow-cyan-950/40'
                      : 'border-slate-800/80 hover:border-slate-700 hover:shadow-lg hover:shadow-slate-950/50'
                  } ${isOutOfStock ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}`}
                >
                  {/* Top Image or Styled Fallback */}
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-800/60 mb-3">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Resilient fallback if image fails to load
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.parentElement?.querySelector('.fallback-container');
                          if (fallback) (fallback as HTMLElement).style.display = 'flex';
                        }}
                      />
                    ) : null}
                    
                    {/* Fallback container */}
                    <div
                      className="fallback-container absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950"
                      style={{ display: product.imageUrl ? 'none' : 'flex' }}
                    >
                      <Coffee className="w-8 h-8 text-cyan-400/40" />
                    </div>

                    {/* Badge if present */}
                    {product.badge && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-950/90 text-cyan-300 border border-cyan-500/40 backdrop-blur-sm">
                        {product.badge}
                      </span>
                    )}

                    {/* Stock Alert Tag */}
                    <span
                      className={`absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-mono tabular-nums backdrop-blur-sm ${
                        isOutOfStock
                          ? 'bg-rose-950/90 text-rose-300 border border-rose-800'
                          : product.stock <= 5
                          ? 'bg-amber-950/90 text-amber-300 border border-amber-800'
                          : 'bg-slate-950/80 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {isOutOfStock ? 'Habis' : `Stok: ${product.stock}`}
                    </span>

                    {/* In-Cart Quantity Indicator */}
                    {inCart && inCart.quantity > 0 && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-cyan-400 text-slate-950 font-mono font-bold text-xs flex items-center justify-center shadow-md shadow-cyan-500/40">
                        {inCart.quantity}
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>{product.category}</span>
                      <span className="font-mono text-slate-500 text-[10px]">{product.sku}</span>
                    </div>

                    <h3 className="text-xs font-semibold text-white line-clamp-1 group-hover:text-cyan-300 transition-colors">
                      {product.name}
                    </h3>
                    
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {product.description}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="font-mono text-xs sm:text-sm font-bold text-cyan-400 tabular-nums">
                        {formatIDR(product.price)}
                      </span>

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isOutOfStock) addToCart(product, 1);
                        }}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                          isOutOfStock
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            : 'bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-500/30'
                        }`}
                        title="Tambah ke keranjang"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Active Cart / Order Module (4 columns on desktop) */}
      <div className="lg:col-span-4 flex flex-col bg-slate-900/80 rounded-2xl border border-slate-800 p-4 sticky top-20 h-fit max-h-[calc(100vh-100px)]">
        {/* Cart Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">Pesanan Aktif</h2>
            <span className="bg-slate-800 text-cyan-300 text-xs px-2 py-0.5 rounded-full font-mono font-medium">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} item
            </span>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-slate-400 hover:text-rose-400 text-xs flex items-center gap-1 transition-colors"
              title="Kosongkan keranjang"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Batal</span>
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto my-3 pr-1 space-y-3 min-h-[160px] max-h-[320px]">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500">
              <Receipt className="w-10 h-10 text-slate-700 mb-2 stroke-1" />
              <p className="text-xs font-medium text-slate-400">Keranjang masih kosong</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pilih menu di sebelah kiri untuk membuat pesanan baru
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">
                      {item.product.name}
                    </h4>
                    <span className="font-mono text-xs text-cyan-400 font-medium tabular-nums">
                      {formatIDR(item.product.price)}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    title="Hapus item"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Modifiers & Note button */}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-900">
                  <button
                    onClick={() => handleOpenNoteModal(item.product.id, item.notes)}
                    className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors text-[10px]"
                  >
                    <Edit3 className="w-3 h-3 text-cyan-400" />
                    <span>{item.notes ? `Catatan: ${item.notes}` : '+ Catatan khusus'}</span>
                  </button>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-mono text-xs font-bold text-white tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Promo / Discount & Calculations */}
        <div className="pt-3 border-t border-slate-800 flex flex-col gap-2.5">
          {/* Quick Discount Trigger */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsDiscountOpen(!isDiscountOpen)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <Percent className="w-3.5 h-3.5 text-cyan-400" />
              <span>{cartDiscount.percentage > 0 ? `Diskon (${cartDiscount.percentage}%)` : '+ Tambah Diskon'}</span>
            </button>

            {cartDiscount.percentage > 0 && (
              <button
                onClick={() => setCartDiscount(0)}
                className="text-[10px] text-rose-400 hover:underline"
              >
                Hapus Diskon
              </button>
            )}
          </div>

          {/* Discount Selector Dropdown */}
          {isDiscountOpen && (
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-1.5 flex-wrap">
              {[0, 5, 10, 15, 20].map((pct) => (
                <button
                  key={pct}
                  onClick={() => {
                    setCartDiscount(pct);
                    setIsDiscountOpen(false);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-lg font-mono font-medium transition-colors ${
                    cartDiscount.percentage === pct
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {pct === 0 ? '0%' : `${pct}%`}
                </button>
              ))}
            </div>
          )}

          {/* Breakdown Numbers */}
          <div className="space-y-1.5 text-xs pt-1 font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="tabular-nums text-slate-200">{formatIDR(cartSubtotal)}</span>
            </div>

            {cartDiscount.amount > 0 && (
              <div className="flex justify-between text-cyan-400">
                <span>Diskon ({cartDiscount.percentage}%)</span>
                <span className="tabular-nums">-{formatIDR(cartDiscount.amount)}</span>
              </div>
            )}

            {settings.taxEnabled && (
              <div className="flex justify-between text-slate-400">
                <span>PPN ({settings.taxRate}%)</span>
                <span className="tabular-nums text-slate-200">{formatIDR(cartTax)}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-2 border-t border-slate-800 text-sm font-bold">
              <span className="text-white font-sans">Total Bayar</span>
              <span className="text-cyan-400 text-lg tabular-nums">
                {formatIDR(cartTotal)}
              </span>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={openPaymentModal}
            disabled={cart.length === 0}
            className={`w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              cart.length > 0
                ? 'bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/25 active:scale-[0.99] cursor-pointer'
                : 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-slate-800'
            }`}
          >
            <span>Lanjut Pembayaran</span>
            <span className="font-mono text-slate-950 font-black">→</span>
          </button>
        </div>
      </div>

      {/* Note Edit Modal */}
      {editingNoteForId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <span>Catatan Khusus Menu</span>
              </h3>
              <button
                onClick={() => setEditingNoteForId(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Tambahkan preferensi pelanggan (misal: Less Sugar, Extra Shot, Tanpa Es, Saus Dipisah):
            </p>

            <input
              type="text"
              value={noteInputValue}
              onChange={(e) => setNoteInputValue(e.target.value)}
              placeholder="Contoh: Less Sugar 50%, Es Sedikit"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveNote();
              }}
            />

            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setEditingNoteForId(null)}
                className="px-3.5 py-2 text-xs text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 text-xs font-semibold bg-cyan-500 text-slate-950 rounded-xl hover:bg-cyan-400 transition-colors"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
