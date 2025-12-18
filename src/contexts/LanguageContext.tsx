import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'zh' | 'en';

interface Translations {
  [key: string]: {
    zh: string;
    en: string;
  };
}

export const translations: Translations = {
  // Common
  signIn: { zh: '登入', en: 'Sign In' },
  signOut: { zh: '登出', en: 'Sign Out' },
  dashboard: { zh: '控制台', en: 'Dashboard' },
  adminPanel: { zh: '管理員面板', en: 'Admin Panel' },
  account: { zh: '帳戶', en: 'Account' },
  noRoleSelected: { zh: '未選擇角色', en: 'No role selected' },
  
  // Roles
  buyer: { zh: '買家', en: 'Buyer' },
  seller: { zh: '賣家', en: 'Seller' },
  admin: { zh: '管理員', en: 'Admin' },
  switchRole: { zh: '切換角色', en: 'Switch Role' },
  switchToBuyer: { zh: '切換至買家模式', en: 'Switch to Buyer' },
  switchToSeller: { zh: '切換至賣家模式', en: 'Switch to Seller' },
  switchToAdmin: { zh: '切換至管理員模式', en: 'Switch to Admin' },
  
  // Admin Panel
  manageOrdersUsersSettings: { zh: '管理訂單、用戶和平台設定', en: 'Manage orders, users, and platform settings' },
  totalOrders: { zh: '總訂單數', en: 'Total Orders' },
  pending: { zh: '待處理', en: 'Pending' },
  completed: { zh: '已完成', en: 'Completed' },
  revenue: { zh: '收益', en: 'Revenue' },
  orders: { zh: '訂單', en: 'Orders' },
  users: { zh: '用戶', en: 'Users' },
  accounts: { zh: '帳號', en: 'Accounts' },
  settings: { zh: '設定', en: 'Settings' },
  paymentSettings: { zh: '付款設定', en: 'Payment Settings' },
  paymentSettingsDesc: { zh: '所有買家統一使用的付款資訊', en: 'Payment info for all buyers' },
  fpsNumber: { zh: 'FPS 號碼', en: 'FPS Number' },
  paymentEmail: { zh: '收款電郵', en: 'Payment Email' },
  paymentMethods: { zh: '付款方式', en: 'Payment Methods' },
  saveSettings: { zh: '儲存設定', en: 'Save Settings' },
  settingsSaved: { zh: '設定已儲存', en: 'Settings Saved' },
  
  // Order Status
  pendingPayment: { zh: '待付款', en: 'Pending Payment' },
  awaitingConfirmation: { zh: '待確認', en: 'Awaiting Confirmation' },
  paymentConfirmed: { zh: '已確認付款', en: 'Payment Confirmed' },
  orderCompleted: { zh: '已完成', en: 'Completed' },
  refunded: { zh: '已退款', en: 'Refunded' },
  cancelled: { zh: '已取消', en: 'Cancelled' },
  
  // Actions
  confirmPayment: { zh: '確認付款', en: 'Confirm Payment' },
  refund: { zh: '退款', en: 'Refund' },
  viewDetails: { zh: '查看詳情', en: 'View Details' },
  orderDetails: { zh: '訂單詳情', en: 'Order Details' },
  
  // Table headers
  email: { zh: '電郵', en: 'Email' },
  phone: { zh: '電話', en: 'Phone' },
  role: { zh: '角色', en: 'Role' },
  joined: { zh: '加入日期', en: 'Joined' },
  username: { zh: '用戶名', en: 'Username' },
  followers: { zh: '粉絲數', en: 'Followers' },
  status: { zh: '狀態', en: 'Status' },
  published: { zh: '已發佈', en: 'Published' },
  draft: { zh: '草稿', en: 'Draft' },
  none: { zh: '無', en: 'None' },
  
  // Buyer Dashboard
  pleaseCompletePayment: { zh: '請完成付款', en: 'Please complete payment' },
  waitingForAdminConfirmation: { zh: '等待管理員確認付款', en: 'Waiting for admin confirmation' },
  paymentConfirmedContactSeller: { zh: '付款已確認，可查看賣家聯絡資料', en: 'Payment confirmed, contact seller to complete transfer' },
  transactionCompleted: { zh: '交易已完成', en: 'Transaction completed' },
  paymentRefunded: { zh: '已退款', en: 'Payment has been refunded' },
  viewPaymentInfo: { zh: '查看付款資料', en: 'View Payment Info' },
  viewSellerContact: { zh: '查看賣家聯絡資料', en: 'View Seller Contact' },
  paymentInstructions: { zh: '付款說明', en: 'Payment Instructions' },
  amountToPay: { zh: '應付金額', en: 'Amount to Pay' },
  afterPayment: { zh: '付款後：', en: 'After payment:' },
  step1Screenshot: { zh: '截取付款證明截圖', en: 'Take a screenshot of the payment' },
  step2Email: { zh: '將截圖發送至電郵', en: 'Email the screenshot to' },
  step3Wait: { zh: '等待管理員確認（24小時內）', en: 'Wait for admin confirmation (within 24 hours)' },
  iveMadePayment: { zh: '我已完成付款', en: "I've Made the Payment" },
  sellerContactInfo: { zh: '賣家聯絡資料', en: 'Seller Contact Information' },
  confirmTransactionComplete: { zh: '確認交易完成', en: 'Confirm Transaction Complete' },
  
  // Language
  language: { zh: '語言', en: 'Language' },
  chinese: { zh: '繁體中文', en: 'Traditional Chinese' },
  english: { zh: '英文', en: 'English' },
  
  // Misc
  noOrdersYet: { zh: '暫無訂單', en: 'No Orders Yet' },
  buyerContact: { zh: '買家聯絡', en: 'Buyer Contact' },
  sellerContact: { zh: '賣家聯絡', en: 'Seller Contact' },
  platformFee: { zh: '平台費用 (10%)', en: 'Platform Fee (10%)' },
  sellerPayout: { zh: '賣家收款', en: 'Seller Payout' },
  price: { zh: '價格', en: 'Price' },
  adminNotes: { zh: '管理員備註', en: 'Admin Notes' },
  addNotesPlaceholder: { zh: '添加訂單備註...', en: 'Add notes about this order...' },
  transactionCompletedOn: { zh: '完成日期', en: 'Completed on' },
  sellerPayoutDue: { zh: '應付賣家款項', en: 'Seller payout due' },
  confirmRefund: { zh: '確定要退款嗎？', en: 'Are you sure you want to refund this order?' },
  paymentConfirmedMsg: { zh: '買家現可查看賣家聯絡資料', en: 'Buyer can now access seller contact info.' },
  orderRefundedMsg: { zh: '訂單已標記為退款', en: 'The order has been marked as refunded.' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'zh';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
