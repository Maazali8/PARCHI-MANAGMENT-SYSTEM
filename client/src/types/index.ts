// ===== User Types =====
export interface User {
  id: string;
  name: string;
  username: string;
  role: 'ADMIN' | 'EMPLOYEE';
  phone?: string;
  isActive?: boolean;
  createdAt?: string;
}

// ===== Shopkeeper Types =====
export interface Shopkeeper {
  id: string;
  shopName: string;
  ownerName: string;
  phone?: string;
  address?: string;
  notes?: string;
  hasKhata: boolean;
  isActive: boolean;
  khataBalance?: number;
  createdAt?: string;
}

// ===== Parchi Types =====
export type ParchiStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'ADDED_TO_KHATA' | 'RETURNED';

export interface Parchi {
  id: string;
  date: string;
  amount: number;
  status: ParchiStatus;
  shopkeeperId: string;
  shopkeeper: { id: string; shopName: string; ownerName: string; hasKhata?: boolean };
  employeeId: string;
  employee: { id: string; name: string };
  collection?: CollectionSummary | null;
  returnReason?: string | null;
  returnedAt?: string | null;
  createdAt: string;
}

export interface CollectionSummary {
  id: string;
  cashPayment: number;
  onlinePayment: number;
  onlineVerified: boolean;
  addedToKhata: number;
  netParchiAmount: number;
}

// ===== Collection Types =====
export interface Collection {
  id: string;
  date: string;
  parchiAmount: number;
  discount: number;
  discountReason?: string;
  goodsAdjustment: number;
  goodsDescription?: string;
  netParchiAmount: number;
  cashPayment: number;
  onlinePayment: number;
  onlineMethod?: string;
  onlineVerified: boolean;
  addedToKhata: number;
  khataPayment: number;
  khataPaymentCash: number;
  khataPaymentOnline: number;
  khataOnlineMethod?: string;
  khataOnlineVerified: boolean;
  notes?: string;
  parchiId: string;
  parchi: { id: string; amount: number; date: string; status: ParchiStatus };
  shopkeeperId: string;
  shopkeeper: { id: string; shopName: string; ownerName: string };
  collectedById: string;
  collectedBy: { id: string; name: string };
  createdAt: string;
}

export interface CollectionFormData {
  parchiId: string;
  discount?: number;
  discountReason?: string;
  goodsAdjustment?: number;
  goodsDescription?: string;
  cashPayment?: number;
  onlinePayment?: number;
  onlineMethod?: string;
  khataPayment?: number;
  khataPaymentCash?: number;
  khataPaymentOnline?: number;
  khataOnlineMethod?: string;
  notes?: string;
}

// ===== Khata Types =====
export type KhataType = 'PARCHI_ADDED' | 'KHATA_PAYMENT';

export interface KhataEntry {
  id: string;
  date: string;
  amount: number;
  type: KhataType;
  description?: string;
  balanceAfter: number;
  shopkeeperId: string;
  collectionId?: string;
  createdAt: string;
}

export interface KhataBalance {
  id: string;
  shopName: string;
  ownerName: string;
  phone?: string;
  balance: number;
  lastUpdated?: string;
}

// ===== Dashboard Types =====
export interface AdminDashboard {
  todayTotal: number;
  yesterdayTotal: number;
  monthTotal: number;
  totalKhata: number;
  pendingVerifications: number;
  todayParchis: number;
  recentCollections: Collection[];
}

export interface EmployeeDashboard {
  totalAssigned: number;
  totalCollected: number;
  remaining: number;
  parchis: Parchi[];
  todayCollections: Collection[];
  totalParchis: number;
  collectedCount: number;
}

// ===== Report Types =====
export interface DailyReport {
  date: string;
  collections: Collection[];
  uncollectedParchis: Parchi[];
  summary: {
    totalParchi: number;
    totalDiscount: number;
    totalGoodsAdj: number;
    totalCash: number;
    totalOnline: number;
    totalKhataAdded: number;
    totalKhataPayment: number;
    totalCollection: number;
  };
}

export interface WhatsAppMessage {
  message: string;
  whatsappUrl?: string;
  phone?: string;
}
