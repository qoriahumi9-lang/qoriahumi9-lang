export type ProductCategory = 
  | 'Coffee'
  | 'Non-Coffee'
  | 'Signature'
  | 'Bakery & Snack'
  | 'Food & Meal';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  price: number;
  costPrice: number;
  stock: number;
  imageUrl: string;
  description: string;
  badge?: 'Best Seller' | 'New' | 'Signature' | 'Favorite';
  isAvailable: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
  discountPercentage?: number;
}

export type PaymentMethod = 'cash' | 'qris' | 'debit' | 'ewallet';

export interface TransactionItem {
  productId: string;
  name: string;
  category: ProductCategory;
  price: number;
  costPrice: number;
  quantity: number;
  notes?: string;
  total: number;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  timestamp: string; // ISO String
  items: TransactionItem[];
  subtotal: number;
  discountAmount: number;
  discountNote?: string;
  taxAmount: number;
  taxRate: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashGiven?: number;
  changeAmount?: number;
  cashierName: string;
  customerName?: string;
  tableNumber?: string;
  status: 'completed' | 'voided';
}

export interface POSSettings {
  storeName: string;
  storeTagline: string;
  storeAddress: string;
  storePhone: string;
  taxRate: number;
  taxEnabled: boolean;
  receiptFooter: string;
  cashierName: string;
}
