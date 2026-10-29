import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CartItem,
  Transaction,
  POSSettings,
  PaymentMethod,
} from '../types/pos';
import {
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  INITIAL_TRANSACTIONS,
} from '../data/initialData';

interface POSContextType {
  products: Product[];
  cart: CartItem[];
  transactions: Transaction[];
  settings: POSSettings;
  activeTab: 'pos' | 'dashboard' | 'history' | 'inventory' | 'settings';
  setActiveTab: (tab: 'pos' | 'dashboard' | 'history' | 'inventory' | 'settings') => void;
  // Cart Actions
  addToCart: (product: Product, quantity?: number, notes?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateCartNotes: (productId: string, notes: string) => void;
  clearCart: () => void;
  cartDiscount: { percentage: number; amount: number; note: string };
  setCartDiscount: (percentage: number, note?: string) => void;
  cartSubtotal: number;
  cartTax: number;
  cartTotal: number;
  // Checkout & Payment
  isPaymentModalOpen: boolean;
  openPaymentModal: () => void;
  closePaymentModal: () => void;
  processPayment: (params: {
    paymentMethod: PaymentMethod;
    cashGiven?: number;
    customerName?: string;
    tableNumber?: string;
  }) => Transaction;
  // Receipt
  currentReceipt: Transaction | null;
  isReceiptModalOpen: boolean;
  showReceipt: (transaction: Transaction) => void;
  closeReceiptModal: () => void;
  // Inventory Actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateStock: (id: string, delta: number) => void;
  // Transaction History
  voidTransaction: (id: string) => void;
  // Settings & Reset
  updateSettings: (newSettings: POSSettings) => void;
  resetToDemo: () => void;
  // Utils
  formatIDR: (amount: number) => string;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'neon_pos_products_v1',
  TRANSACTIONS: 'neon_pos_transactions_v1',
  SETTINGS: 'neon_pos_settings_v1',
};

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'pos' | 'dashboard' | 'history' | 'inventory' | 'settings'>('pos');

  // Load from localStorage or defaults
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [settings, setSettings] = useState<POSSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartDiscount, setCartDiscountState] = useState<{ percentage: number; amount: number; note: string }>({
    percentage: 0,
    amount: 0,
    note: '',
  });

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<Transaction | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Cart Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  
  const discountAmount = Math.round((cartSubtotal * cartDiscount.percentage) / 100);
  const taxableBase = Math.max(0, cartSubtotal - discountAmount);
  const cartTax = settings.taxEnabled ? Math.round((taxableBase * settings.taxRate) / 100) : 0;
  const cartTotal = taxableBase + cartTax;

  const addToCart = (product: Product, quantity = 1, notes = '') => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = next[existingIndex].quantity + quantity;
        // Don't exceed stock
        if (newQty > product.stock) {
          next[existingIndex].quantity = product.stock;
        } else {
          next[existingIndex].quantity = newQty;
        }
        if (notes) next[existingIndex].notes = notes;
        return next;
      } else {
        const initialQty = Math.min(quantity, product.stock > 0 ? product.stock : 1);
        return [...prev, { product, quantity: initialQty, notes }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const maxQty = Math.min(quantity, item.product.stock > 0 ? item.product.stock : 999);
          return { ...item, quantity: maxQty };
        }
        return item;
      })
    );
  };

  const updateCartNotes = (productId: string, notes: string) => {
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, notes } : item))
    );
  };

  const setCartDiscount = (percentage: number, note = '') => {
    setCartDiscountState({
      percentage,
      amount: Math.round((cartSubtotal * percentage) / 100),
      note: note || (percentage > 0 ? `Diskon ${percentage}%` : ''),
    });
  };

  const clearCart = () => {
    setCart([]);
    setCartDiscountState({ percentage: 0, amount: 0, note: '' });
  };

  const openPaymentModal = () => {
    if (cart.length > 0) {
      setIsPaymentModalOpen(true);
    }
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
  };

  const showReceipt = (transaction: Transaction) => {
    setCurrentReceipt(transaction);
    setIsReceiptModalOpen(true);
  };

  const closeReceiptModal = () => {
    setIsReceiptModalOpen(false);
  };

  // Process checkout transaction
  const processPayment = ({
    paymentMethod,
    cashGiven,
    customerName,
    tableNumber,
  }: {
    paymentMethod: PaymentMethod;
    cashGiven?: number;
    customerName?: string;
    tableNumber?: string;
  }): Transaction => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const countToday = transactions.filter((t) => t.timestamp.startsWith(today.toISOString().slice(0, 10))).length + 1;
    const invoiceNumber = `NP-${dateStr}-${String(countToday).padStart(3, '0')}`;
    const txId = `tx-${Date.now()}`;

    const items = cart.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      category: item.product.category,
      price: item.product.price,
      costPrice: item.product.costPrice,
      quantity: item.quantity,
      notes: item.notes,
      total: item.product.price * item.quantity,
    }));

    const finalChange = cashGiven && cashGiven >= cartTotal ? cashGiven - cartTotal : 0;

    const newTx: Transaction = {
      id: txId,
      invoiceNumber,
      timestamp: today.toISOString(),
      items,
      subtotal: cartSubtotal,
      discountAmount,
      discountNote: cartDiscount.note,
      taxAmount: cartTax,
      taxRate: settings.taxRate,
      total: cartTotal,
      paymentMethod,
      cashGiven: paymentMethod === 'cash' ? cashGiven : undefined,
      changeAmount: paymentMethod === 'cash' ? finalChange : undefined,
      cashierName: settings.cashierName,
      customerName: customerName || 'Pelanggan Umum',
      tableNumber: tableNumber || 'Dine-In',
      status: 'completed',
    };

    // Deduct stock for products
    setProducts((prev) =>
      prev.map((prod) => {
        const cartItem = cart.find((c) => c.product.id === prod.id);
        if (cartItem) {
          const newStock = Math.max(0, prod.stock - cartItem.quantity);
          return { ...prod, stock: newStock, isAvailable: newStock > 0 };
        }
        return prod;
      })
    );

    // Save transaction
    setTransactions((prev) => [newTx, ...prev]);

    // Clear cart and show receipt
    clearCart();
    closePaymentModal();
    showReceipt(newTx);

    return newTx;
  };

  const voidTransaction = (id: string) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, status: 'voided' } : tx))
    );
  };

  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const id = `prod-${Date.now()}`;
    const product: Product = { ...newProd, id };
    setProducts((prev) => [product, ...prev]);
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCart((prev) => prev.filter((item) => item.product.id !== id));
  };

  const updateStock = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newStock = Math.max(0, p.stock + delta);
          return { ...p, stock: newStock, isAvailable: newStock > 0 };
        }
        return p;
      })
    );
  };

  const updateSettings = (newSettings: POSSettings) => {
    setSettings(newSettings);
  };

  const resetToDemo = () => {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    setProducts(INITIAL_PRODUCTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setSettings(INITIAL_SETTINGS);
    clearCart();
  };

  const formatIDR = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <POSContext.Provider
      value={{
        products,
        cart,
        transactions,
        settings,
        activeTab,
        setActiveTab,
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
        isPaymentModalOpen,
        openPaymentModal,
        closePaymentModal,
        processPayment,
        currentReceipt,
        isReceiptModalOpen,
        showReceipt,
        closeReceiptModal,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        voidTransaction,
        updateSettings,
        resetToDemo,
        formatIDR,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
