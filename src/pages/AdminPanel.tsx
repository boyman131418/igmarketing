import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, 
  Users, 
  Instagram, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Clock,
  DollarSign,
  Settings,
  Save
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type OrderStatus = 'pending_payment' | 'awaiting_confirmation' | 'payment_confirmed' | 'completed' | 'refunded' | 'cancelled';

interface Order {
  id: string;
  listing_price: number;
  platform_fee: number;
  seller_payout: number;
  status: OrderStatus;
  buyer_phone: string | null;
  buyer_email: string | null;
  admin_notes: string | null;
  created_at: string;
  confirmed_at: string | null;
  completed_at: string | null;
  refunded_at: string | null;
  buyer: { email: string | null } | null;
  seller: { email: string | null } | null;
  ig_accounts: {
    ig_username: string;
    ig_avatar_url: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    payment_details: string | null;
  } | null;
}

interface Profile {
  id: string;
  email: string | null;
  phone: string | null;
  role: 'buyer' | 'seller' | 'admin' | null;
  created_at: string;
}

interface IGAccount {
  id: string;
  ig_username: string;
  follower_count: number;
  is_published: boolean;
  seller: { email: string | null } | null;
}

const ADMIN_EMAIL = 'boyman131418@gmail.com';

export default function AdminPanel() {
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [accounts, setAccounts] = useState<IGAccount[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Payment settings state
  const [paymentSettings, setPaymentSettings] = useState({
    fpsNumber: '',
    paymentEmail: '',
    paymentMethods: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    if (!loading && profile) {
      if (profile.role !== 'admin' && profile.email !== ADMIN_EMAIL) {
        navigate('/');
        return;
      }
      if (profile.email === ADMIN_EMAIL && profile.role !== 'admin') {
        setAdminRole();
      }
    }
  }, [user, profile, loading, navigate]);

  const setAdminRole = async () => {
    if (!user) return;
    await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', user.id);
  };

  useEffect(() => {
    if (user && (profile?.role === 'admin' || profile?.email === ADMIN_EMAIL)) {
      fetchData();
      fetchPaymentSettings();
    }
  }, [user, profile]);

  const fetchPaymentSettings = async () => {
    const { data } = await supabase
      .from('platform_settings')
      .select('key, value');
    
    if (data) {
      const settings: Record<string, string> = {};
      data.forEach(item => {
        settings[item.key] = item.value || '';
      });
      setPaymentSettings({
        fpsNumber: settings['payment_fps_number'] || '',
        paymentEmail: settings['payment_email'] || '',
        paymentMethods: settings['payment_methods'] || '',
      });
    }
  };

  const savePaymentSettings = async () => {
    setSavingSettings(true);
    
    const updates = [
      { key: 'payment_fps_number', value: paymentSettings.fpsNumber },
      { key: 'payment_email', value: paymentSettings.paymentEmail },
      { key: 'payment_methods', value: paymentSettings.paymentMethods },
    ];

    for (const update of updates) {
      await supabase
        .from('platform_settings')
        .update({ value: update.value, updated_at: new Date().toISOString(), updated_by: user?.id })
        .eq('key', update.key);
    }

    toast({ title: t('settingsSaved') });
    setSavingSettings(false);
  };

  const fetchData = async () => {
    setFetchLoading(true);
    
    const { data: ordersData } = await supabase
      .from('orders')
      .select(`
        *,
        buyer:profiles!orders_buyer_id_fkey(email),
        seller:profiles!orders_seller_id_fkey(email),
        ig_accounts(
          ig_username,
          ig_avatar_url,
          contact_phone,
          contact_email,
          payment_details
        )
      `)
      .order('created_at', { ascending: false });

    if (ordersData) {
      setOrders(ordersData as Order[]);
    }

    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersData) {
      setUsers(usersData as Profile[]);
    }

    const { data: accountsData } = await supabase
      .from('ig_accounts')
      .select(`
        id,
        ig_username,
        follower_count,
        is_published,
        seller:profiles!ig_accounts_seller_id_fkey(email)
      `)
      .order('created_at', { ascending: false });

    if (accountsData) {
      setAccounts(accountsData as IGAccount[]);
    }

    setFetchLoading(false);
  };

  const confirmPayment = async (order: Order) => {
    setActionLoading(true);
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'payment_confirmed',
        confirmed_at: new Date().toISOString(),
        admin_notes: adminNotes || null,
      })
      .eq('id', order.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('paymentConfirmed'), description: t('paymentConfirmedMsg') });
      fetchData();
      setSelectedOrder(null);
      setAdminNotes('');
    }
    setActionLoading(false);
  };

  const refundOrder = async (order: Order) => {
    if (!confirm(t('confirmRefund'))) return;
    
    setActionLoading(true);
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'refunded',
        refunded_at: new Date().toISOString(),
        admin_notes: adminNotes || null,
      })
      .eq('id', order.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('refunded'), description: t('orderRefundedMsg') });
      fetchData();
      setSelectedOrder(null);
      setAdminNotes('');
    }
    setActionLoading(false);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending_payment':
        return <span className="badge-pending">{t('pendingPayment')}</span>;
      case 'awaiting_confirmation':
        return <span className="badge-pending">{t('awaitingConfirmation')}</span>;
      case 'payment_confirmed':
        return <span className="badge-confirmed">{t('paymentConfirmed')}</span>;
      case 'completed':
        return <span className="badge-completed">{t('orderCompleted')}</span>;
      case 'refunded':
        return <span className="badge-refunded">{t('refunded')}</span>;
      case 'cancelled':
        return <span className="badge-refunded">{t('cancelled')}</span>;
    }
  };

  const stats = {
    totalOrders: orders.length,
    pendingConfirmation: orders.filter(o => o.status === 'awaiting_confirmation').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    totalRevenue: orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.platform_fee, 0),
  };

  if (loading || fetchLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">{t('adminPanel')}</h1>
          <p className="text-muted-foreground">{t('manageOrdersUsersSettings')}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground text-sm">{t('totalOrders')}</span>
            </div>
            <p className="text-3xl font-display font-bold">{stats.totalOrders}</p>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="text-muted-foreground text-sm">{t('pending')}</span>
            </div>
            <p className="text-3xl font-display font-bold">{stats.pendingConfirmation}</p>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-muted-foreground text-sm">{t('completed')}</span>
            </div>
            <p className="text-3xl font-display font-bold">{stats.completedOrders}</p>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground text-sm">{t('revenue')}</span>
            </div>
            <p className="text-3xl font-display font-bold">HKD {stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ShoppingCart className="w-4 h-4 mr-2" />
              {t('orders')}
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4 mr-2" />
              {t('users')}
            </TabsTrigger>
            <TabsTrigger value="accounts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Instagram className="w-4 h-4 mr-2" />
              {t('accounts')}
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Settings className="w-4 h-4 mr-2" />
              {t('settings')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {orders.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold">{t('noOrdersYet')}</h3>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="glass-card rounded-2xl p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-gold-dark p-[2px]">
                        <div className="w-full h-full rounded-full bg-card overflow-hidden flex items-center justify-center">
                          <span className="font-bold text-muted-foreground">
                            {order.ig_accounts?.ig_username?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold">@{order.ig_accounts?.ig_username || 'Unknown'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {getStatusBadge(order.status)}
                      <span className="text-xl font-display font-bold text-primary">
                        HKD {order.listing_price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('buyer')}</p>
                      <p className="font-medium">{order.buyer?.email || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">{order.buyer_phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('seller')}</p>
                      <p className="font-medium">{order.seller?.email || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {order.status === 'awaiting_confirmation' && (
                      <>
                        <Button
                          onClick={() => setSelectedOrder(order)}
                          className="btn-gold"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {t('confirmPayment')}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order);
                            refundOrder(order);
                          }}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {t('refund')}
                        </Button>
                      </>
                    )}
                    {(order.status === 'payment_confirmed' || order.status === 'completed') && (
                      <Button
                        variant="outline"
                        onClick={() => setSelectedOrder(order)}
                      >
                        {t('viewDetails')}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">{t('email')}</th>
                      <th className="text-left p-4 font-medium">{t('phone')}</th>
                      <th className="text-left p-4 font-medium">{t('role')}</th>
                      <th className="text-left p-4 font-medium">{t('joined')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-t border-border/50">
                        <td className="p-4">{user.email || 'N/A'}</td>
                        <td className="p-4">{user.phone || 'N/A'}</td>
                        <td className="p-4">
                          <span className={`badge-status ${
                            user.role === 'admin' ? 'bg-primary/20 text-primary' :
                            user.role === 'seller' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {user.role ? t(user.role) : t('none')}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-4">
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">{t('username')}</th>
                      <th className="text-left p-4 font-medium">{t('followers')}</th>
                      <th className="text-left p-4 font-medium">{t('seller')}</th>
                      <th className="text-left p-4 font-medium">{t('status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((account) => (
                      <tr key={account.id} className="border-t border-border/50">
                        <td className="p-4 font-medium">@{account.ig_username}</td>
                        <td className="p-4">{account.follower_count.toLocaleString()}</td>
                        <td className="p-4 text-muted-foreground">{account.seller?.email || 'N/A'}</td>
                        <td className="p-4">
                          <span className={`badge-status ${account.is_published ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'}`}>
                            {account.is_published ? t('published') : t('draft')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-xl font-display font-bold mb-2">{t('paymentSettings')}</h3>
              <p className="text-muted-foreground mb-6">{t('paymentSettingsDesc')}</p>
              
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('fpsNumber')}</label>
                  <Input
                    value={paymentSettings.fpsNumber}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, fpsNumber: e.target.value }))}
                    placeholder="87925469"
                    className="input-dark"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('paymentEmail')}</label>
                  <Input
                    type="email"
                    value={paymentSettings.paymentEmail}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, paymentEmail: e.target.value }))}
                    placeholder="your@email.com"
                    className="input-dark"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('paymentMethods')}</label>
                  <Textarea
                    value={paymentSettings.paymentMethods}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, paymentMethods: e.target.value }))}
                    placeholder="FPS, PayMe, Bank Transfer..."
                    className="input-dark"
                    rows={3}
                  />
                </div>
                
                <Button 
                  onClick={savePaymentSettings} 
                  className="btn-gold"
                  disabled={savingSettings}
                >
                  {savingSettings ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {t('saveSettings')}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{t('orderDetails')}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6 mt-4">
              <div className="p-4 rounded-xl bg-muted/50">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">{t('accounts')}</span>
                  <span className="font-medium">@{selectedOrder.ig_accounts?.ig_username}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">{t('price')}</span>
                  <span className="font-medium">HKD {selectedOrder.listing_price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">{t('platformFee')}</span>
                  <span className="font-medium text-primary">HKD {selectedOrder.platform_fee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('sellerPayout')}</span>
                  <span className="font-medium">HKD {selectedOrder.seller_payout.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{t('buyerContact')}</p>
                <p className="font-medium">{selectedOrder.buyer_email}</p>
                <p className="text-sm text-muted-foreground">{selectedOrder.buyer_phone}</p>
              </div>

              {selectedOrder.ig_accounts && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t('sellerContact')}</p>
                  <p className="font-medium">{selectedOrder.ig_accounts.contact_email}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.ig_accounts.contact_phone}</p>
                  {selectedOrder.ig_accounts.payment_details && (
                    <p className="text-sm bg-muted/50 p-2 rounded">{selectedOrder.ig_accounts.payment_details}</p>
                  )}
                </div>
              )}

              {selectedOrder.status === 'awaiting_confirmation' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('adminNotes')}</label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder={t('addNotesPlaceholder')}
                      className="input-dark"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => confirmPayment(selectedOrder)}
                      className="flex-1 btn-gold"
                      disabled={actionLoading}
                    >
                      {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                      {t('confirmPayment')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => refundOrder(selectedOrder)}
                      className="text-destructive hover:bg-destructive/10"
                      disabled={actionLoading}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}

              {selectedOrder.status === 'completed' && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">{t('orderCompleted')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t('transactionCompletedOn')} {selectedOrder.completed_at ? new Date(selectedOrder.completed_at).toLocaleDateString() : 'N/A'}
                  </p>
                  <div className="mt-3 p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm font-medium text-primary">
                      {t('sellerPayoutDue')}: HKD {selectedOrder.seller_payout.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
