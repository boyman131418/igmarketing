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
  
  // Index page
  premiumIgMarketplace: { zh: '優質 IG 交易平台', en: 'Premium IG Marketplace' },
  buyAndSell: { zh: '買賣', en: 'Buy & Sell' },
  instagramAccounts: { zh: 'Instagram 帳號', en: 'Instagram Accounts' },
  heroDescription: { zh: '最值得信賴的 Instagram 帳號交易平台。安全交易、認證賣家、保證交付。', en: 'The most trusted platform for trading verified Instagram accounts. Secure transactions, verified sellers, and guaranteed delivery.' },
  startTradingNow: { zh: '立即開始交易', en: 'Start Trading Now' },
  chooseYourRole: { zh: '選擇角色', en: 'Choose Your Role' },
  sellerDashboard: { zh: '賣家控制台', en: 'Seller Dashboard' },
  buyerDashboard: { zh: '買家控制台', en: 'Buyer Dashboard' },
  secureEscrow: { zh: '安全託管', en: 'Secure Escrow' },
  secureEscrowDesc: { zh: '您的付款將安全保管，直到交易驗證完成。', en: 'Your payment is held safely until the transaction is verified and completed.' },
  fastVerification: { zh: '快速驗證', en: 'Fast Verification' },
  fastVerificationDesc: { zh: '24小時內管理員驗證。快速便捷的流程。', en: 'Admin verification within 24 hours. Quick and hassle-free process.' },
  verifiedAccounts: { zh: '認證帳號', en: 'Verified Accounts' },
  verifiedAccountsDesc: { zh: '所有帳號均經過驗證，粉絲數據每日更新。', en: 'All accounts are verified with real follower data updated daily.' },
  availableAccounts: { zh: '可購買帳號', en: 'Available Accounts' },
  browseVerifiedAccounts: { zh: '瀏覽認證的 Instagram 帳號', en: 'Browse verified Instagram accounts for sale' },
  noAccountsListedYet: { zh: '暫無上架帳號', en: 'No Accounts Listed Yet' },
  beFirstToList: { zh: '成為第一個在平台上架帳號的人。', en: 'Be the first to list your account on our platform.' },
  getStarted: { zh: '開始使用', en: 'Get Started' },
  
  // Seller Dashboard
  manageYourAccounts: { zh: '管理您的 Instagram 帳號出售', en: 'Manage your Instagram accounts for sale' },
  addAccount: { zh: '新增帳號', en: 'Add Account' },
  editAccount: { zh: '編輯帳號', en: 'Edit Account' },
  addNewAccount: { zh: '新增帳號', en: 'Add New Account' },
  igUsername: { zh: 'Instagram 用戶名', en: 'Instagram Username' },
  contactPhone: { zh: '聯絡電話', en: 'Contact Phone' },
  contactEmail: { zh: '聯絡電郵', en: 'Contact Email' },
  paymentDetails: { zh: '收款資料 (銀行/FPS/Payme)', en: 'Payment Details (Bank/FPS/Payme)' },
  paymentDetailsPlaceholder: { zh: '輸入您的收款資料...', en: 'Enter your payment receiving details...' },
  pricingMethod: { zh: '定價方式', en: 'Pricing Method' },
  fixedPrice: { zh: '固定價格', en: 'Fixed Price' },
  percentageOfFollowers: { zh: '粉絲數百分比', en: '% of Followers' },
  priceHKD: { zh: '價格 (HKD)', en: 'Price (HKD)' },
  percentageRate: { zh: '百分比', en: 'Percentage Rate (%)' },
  percentageFormula: { zh: '價格 = 粉絲數 × (百分比 / 100)', en: 'Price = Follower Count × (Percentage / 100)' },
  updateAccount: { zh: '更新帳號', en: 'Update Account' },
  noAccountsYet: { zh: '暫無帳號', en: 'No Accounts Yet' },
  addFirstAccount: { zh: '新增您的第一個 Instagram 帳號開始出售。', en: 'Add your first Instagram account to start selling.' },
  fetchingIgData: { zh: '正在讀取 Instagram 資料...', en: 'Fetching Instagram data...' },
  fetchingIgDataDesc: { zh: '正在獲取頭像和粉絲數', en: 'Getting avatar and follower count for' },
  accountUpdated: { zh: '帳號已更新', en: 'Account Updated' },
  accountAdded: { zh: '帳號已新增', en: 'Account Added' },
  accountSuccess: { zh: '已成功', en: 'has been successfully' },
  syncing: { zh: '正在同步...', en: 'Syncing...' },
  syncingDesc: { zh: '正在更新資料', en: 'Updating data for' },
  syncComplete: { zh: '同步完成', en: 'Sync Complete' },
  unpublished: { zh: '已下架', en: 'Unpublished' },
  publishedMsg: { zh: '已上架', en: 'Published' },
  nowVisible: { zh: '現已顯示在市場', en: 'is now visible on the marketplace.' },
  nowHidden: { zh: '現已從市場隱藏', en: 'is now hidden from the marketplace.' },
  deleted: { zh: '已刪除', en: 'Deleted' },
  hasBeenRemoved: { zh: '已被移除', en: 'has been removed.' },
  confirmDelete: { zh: '確定要刪除這個帳號嗎？', en: 'Are you sure you want to delete this account?' },
  syncIgData: { zh: '同步 IG 資料', en: 'Sync IG Data' },
  
  // Role Select
  chooseYourRoleTitle: { zh: '選擇您的角色', en: 'Choose Your Role' },
  roleSelectSubtitle: { zh: '您來這裡是要買還是賣 Instagram 帳號？', en: 'Are you here to buy or sell Instagram accounts?' },
  imABuyer: { zh: '我是買家', en: "I'm a Buyer" },
  buyerRoleDesc: { zh: '瀏覽並從可信賣家購買認證的 Instagram 帳號。', en: 'Browse and purchase verified Instagram accounts from trusted sellers.' },
  startBuying: { zh: '開始購買', en: 'Start Buying' },
  imASeller: { zh: '我是賣家', en: "I'm a Seller" },
  sellerRoleDesc: { zh: '上架您的 Instagram 帳號出售，接觸數千潛在買家。', en: 'List your Instagram accounts for sale and reach thousands of potential buyers.' },
  startSelling: { zh: '開始出售', en: 'Start Selling' },
  
  // Auth page
  loginTitle: { zh: '登入 IG Market', en: 'Login to IG Market' },
  signupTitle: { zh: '註冊 IG Market', en: 'Sign up for IG Market' },
  resetPasswordTitle: { zh: '重設密碼', en: 'Reset Password' },
  loginSubtitle: { zh: '登入以開始買賣 Instagram 帳號', en: 'Sign in to start trading Instagram accounts' },
  signupSubtitle: { zh: '建立帳號以開始買賣 Instagram 帳號', en: 'Create an account to start trading Instagram accounts' },
  resetPasswordSubtitle: { zh: '輸入你的電郵，我們會發送重設密碼連結', en: 'Enter your email and we will send you a reset link' },
  emailLabel: { zh: '電郵', en: 'Email' },
  passwordLabel: { zh: '密碼', en: 'Password' },
  forgotPassword: { zh: '忘記密碼？', en: 'Forgot password?' },
  sendResetLink: { zh: '發送重設連結', en: 'Send Reset Link' },
  login: { zh: '登入', en: 'Login' },
  signup: { zh: '註冊', en: 'Sign Up' },
  noAccountYet: { zh: '還沒有帳號？立即註冊', en: "Don't have an account? Sign up" },
  alreadyHaveAccount: { zh: '已有帳號？立即登入', en: 'Already have an account? Login' },
  backToLogin: { zh: '返回登入', en: 'Back to Login' },
  termsAgreement: { zh: '登入即表示你同意我們的服務條款和私隱政策', en: 'By signing in, you agree to our Terms of Service and Privacy Policy' },
  pleaseEnterEmail: { zh: '請填寫電郵', en: 'Please enter your email' },
  pleaseEnterEmailAndPassword: { zh: '請填寫電郵和密碼', en: 'Please enter email and password' },
  resetEmailSent: { zh: '重設密碼郵件已發送，請查看你的電郵', en: 'Password reset email sent, please check your inbox' },
  signupSuccess: { zh: '註冊成功！', en: 'Sign up successful!' },
  wrongCredentials: { zh: '電郵或密碼錯誤', en: 'Invalid email or password' },
  emailAlreadyRegistered: { zh: '此電郵已註冊，請登入', en: 'This email is already registered, please login' },
  errorOccurred: { zh: '發生錯誤，請稍後再試', en: 'An error occurred, please try again later' },
  
  // IGCard
  buyNow: { zh: '立即購買', en: 'Buy Now' },
  loginToBuy: { zh: '登入購買', en: 'Login to Buy' },
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
