import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { getProxiedImageUrl } from '@/lib/imageProxy';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, Clock, CheckCircle, XCircle, RefreshCw, ExternalLink, Phone, Mail, CreditCard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type OrderStatus = 'pending_payment' | 'awaiting_confirmation' | 'payment_confirmed' | 'completed' | 'refunded' | 'cancelled';

interface Order {
  id: string;
  ig_account_id: string;
  listing_price: number;
  platform_fee: number;
  seller_payout: number;
  status: OrderStatus;
  buyer_phone: string | null;
  buyer_email: string | null;
  created_at: string;
  confirmed_at: string | null;
  completed_at: string | null;
  ig_accounts: {
    ig_username: string;
    ig_avatar_url: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    payment_details: string | null;
  } | null;
}

interface PlatformSettings {
  fpsNumber: string;
  paymentEmail: string;
  paymentMethods: string;
}

export default function BuyerDashboard() {
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showSellerInfo, setShowSellerInfo] = useState(false);
  const [confirmingCompletion, setConfirmingCompletion] = useState(false);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    fpsNumber: '',
    paymentEmail: '',
    paymentMethods: '',
  });

  const [contactInfo, setContactInfo] = useState({
    phone: profile?.phone || '',
    email: profile?.email || '',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
    if (!loading && profile && profile.role !== 'buyer' && profile.role !== 'admin') {
      navigate('/');
    }
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchPlatformSettings();
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setContactInfo({
        phone: profile.phone || '',
        email: profile.email || '',
      });
    }
  }, [profile]);

  const fetchPlatformSettings = async () => {
    const { data } = await supabase
      .from('platform_settings')
      .select('key, value');
    
    if (data) {
      const settings: Record<string, string> = {};
      data.forEach(item => {
        settings[item.key] = item.value || '';
      });
      setPlatformSettings({
        fpsNumber: settings['payment_fps_number'] || '87925469',
        paymentEmail: settings['payment_email'] || 'boyman131418@gmail.com',
        paymentMethods: settings['payment_methods'] || 'FPS, PayMe',
      });
    }
  };

  const fetchOrders = async () => {
    setFetchLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        ig_accounts (
          ig_username,
          ig_avatar_url,
          contact_phone,
          contact_email,
          payment_details
        )
      `)
      .eq('buyer_id', user?.id)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setOrders(data as Order[]);
    }
    setFetchLoading(false);
  };

  const updateContactInfo = async () => {
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ phone: contactInfo.phone, email: contactInfo.email })
      .eq('id', user.id);

    if (!error) {
      toast({
        title: 'Contact Updated',
        description: 'Your contact information has been saved.',
      });
    }
  };

  const confirmCompletion = async (order: Order) => {
    setConfirmingCompletion(true);
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    if (!error) {
      toast({
        title: t('orderCompleted'),
        description: t('transactionCompleted'),
      });
      fetchOrders();
      setShowSellerInfo(false);
      setSelectedOrder(null);
    }
    setConfirmingCompletion(false);
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
      default:
        return null;
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending_payment':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'awaiting_confirmation':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'payment_confirmed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'refunded':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  if (loading) {
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
          <h1 className="text-3xl font-display font-bold mb-2">{t('buyer')} {t('dashboard')}</h1>
          <p className="text-muted-foreground">Manage your purchases and track orders</p>
        </div>

        {/* Contact Info Section */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-display font-semibold mb-4">Contact Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">{t('phone')}</Label>
              <Input
                id="phone"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                className="input-dark"
                placeholder="Enter your phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                className="input-dark"
                placeholder="Enter your email"
              />
            </div>
          </div>
          <Button onClick={updateContactInfo} className="mt-4 btn-gold">
            Save Contact Info
          </Button>
        </div>

        {/* Browse CTA */}
        <div className="glass-card rounded-2xl p-6 mb-8 text-center">
          <ShoppingBag className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-display font-semibold mb-2">Browse Marketplace</h2>
          <p className="text-muted-foreground mb-4">Find your next Instagram account</p>
          <Link to="/">
            <Button className="btn-gold">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Listings
            </Button>
          </Link>
        </div>

        {/* Orders */}
        <div className="space-y-4">
          <h2 className="text-2xl font-display font-semibold">{t('orders')}</h2>
          
          {fetchLoading ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold">{t('noOrdersYet')}</h3>
              <p className="text-muted-foreground">Start browsing to find your perfect account</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="glass-card rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-gold-dark p-[2px]">
                      <div className="w-full h-full rounded-full bg-card overflow-hidden flex items-center justify-center">
                        {order.ig_accounts?.ig_avatar_url ? (
                          <img src={getProxiedImageUrl(order.ig_accounts.ig_avatar_url) || ''} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl font-bold text-muted-foreground">
                            {order.ig_accounts?.ig_username?.[0]?.toUpperCase() || '?'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-lg">@{order.ig_accounts?.ig_username || 'Unknown'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(order.status)}
                        <p className="text-xl font-display font-bold text-primary mt-1">
                          HKD {order.listing_price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3">
                      {getStatusIcon(order.status)}
                      <span className="text-sm text-muted-foreground">
                        {order.status === 'pending_payment' && t('pleaseCompletePayment')}
                        {order.status === 'awaiting_confirmation' && t('waitingForAdminConfirmation')}
                        {order.status === 'payment_confirmed' && t('paymentConfirmedContactSeller')}
                        {order.status === 'completed' && t('transactionCompleted')}
                        {order.status === 'refunded' && t('paymentRefunded')}
                      </span>
                    </div>
                    
                    {order.status === 'pending_payment' && (
                      <Button
                        onClick={() => setSelectedOrder(order)}
                        className="btn-gold mt-3"
                      >
                        {t('viewPaymentInfo')}
                      </Button>
                    )}
                    
                    {order.status === 'payment_confirmed' && (
                      <Button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowSellerInfo(true);
                        }}
                        className="btn-gold mt-3"
                      >
                        {t('viewSellerContact')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Payment Info Dialog - Uses Platform Settings */}
      <Dialog open={!!selectedOrder && !showSellerInfo} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{t('paymentInstructions')}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">{t('amountToPay')}</p>
              <p className="text-3xl font-display font-bold text-primary">
                HKD {selectedOrder?.listing_price.toLocaleString()}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">{t('fpsNumber')}</p>
                  <p className="text-muted-foreground">{platformSettings.fpsNumber}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">{t('email')}</p>
                  <p className="text-muted-foreground">{platformSettings.paymentEmail}</p>
                </div>
              </div>

              {platformSettings.paymentMethods && (
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">{t('paymentMethods')}</p>
                    <p className="text-muted-foreground">{platformSettings.paymentMethods}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-sm font-medium mb-2">{t('afterPayment')}</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>{t('step1Screenshot')}</li>
                <li>{t('step2Email')} {platformSettings.paymentEmail}</li>
                <li>{t('step3Wait')}</li>
              </ol>
            </div>

            <Button
              onClick={async () => {
                if (selectedOrder) {
                  await supabase
                    .from('orders')
                    .update({ status: 'awaiting_confirmation' })
                    .eq('id', selectedOrder.id);
                  toast({
                    title: 'Payment Submitted',
                    description: 'Please email your payment screenshot. We will confirm within 24 hours.',
                  });
                  fetchOrders();
                  setSelectedOrder(null);
                }
              }}
              className="w-full btn-gold"
            >
              {t('iveMadePayment')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Seller Info Dialog */}
      <Dialog open={showSellerInfo} onOpenChange={(open) => { if (!open) { setShowSellerInfo(false); setSelectedOrder(null); } }}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{t('sellerContactInfo')}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-green-400 font-medium">✓ {t('paymentConfirmed')}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Contact the seller to complete the account transfer
              </p>
            </div>

            <div className="space-y-4">
              {selectedOrder?.ig_accounts?.contact_phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">{t('phone')}</p>
                    <p className="text-muted-foreground">{selectedOrder.ig_accounts.contact_phone}</p>
                  </div>
                </div>
              )}
              
              {selectedOrder?.ig_accounts?.contact_email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">{t('email')}</p>
                    <p className="text-muted-foreground">{selectedOrder.ig_accounts.contact_email}</p>
                  </div>
                </div>
              )}

              {selectedOrder?.ig_accounts?.payment_details && (
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">Payment Details</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">{selectedOrder.ig_accounts.payment_details}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-sm font-medium mb-2">Important:</p>
              <p className="text-sm text-muted-foreground">
                Once you have received the Instagram account credentials and verified ownership, 
                click the button below to confirm the transaction.
              </p>
            </div>

            <Button
              onClick={() => selectedOrder && confirmCompletion(selectedOrder)}
              className="w-full btn-gold"
              disabled={confirmingCompletion}
            >
              {confirmingCompletion ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {t('confirmTransactionComplete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
