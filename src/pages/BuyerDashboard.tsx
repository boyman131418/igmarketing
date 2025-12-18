import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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

export default function BuyerDashboard() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showSellerInfo, setShowSellerInfo] = useState(false);
  const [confirmingCompletion, setConfirmingCompletion] = useState(false);

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
      .update({
        phone: contactInfo.phone,
        email: contactInfo.email,
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Updated',
        description: 'Contact information saved.',
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

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Transaction Completed',
        description: 'Thank you! The seller will receive payment shortly.',
      });
      fetchOrders();
      setSelectedOrder(null);
      setShowSellerInfo(false);
    }
    setConfirmingCompletion(false);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending_payment':
        return <span className="badge-pending">Pending Payment</span>;
      case 'awaiting_confirmation':
        return <span className="badge-pending">Awaiting Confirmation</span>;
      case 'payment_confirmed':
        return <span className="badge-confirmed">Payment Confirmed</span>;
      case 'completed':
        return <span className="badge-completed">Completed</span>;
      case 'refunded':
        return <span className="badge-refunded">Refunded</span>;
      case 'cancelled':
        return <span className="badge-refunded">Cancelled</span>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending_payment':
      case 'awaiting_confirmation':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'payment_confirmed':
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'refunded':
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-400" />;
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
          <h1 className="text-3xl font-display font-bold mb-2">Buyer Dashboard</h1>
          <p className="text-muted-foreground">Manage your purchases and track orders</p>
        </div>

        {/* Contact Info Section */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buyer_phone">Phone Number</Label>
              <Input
                id="buyer_phone"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                placeholder="+852 XXXX XXXX"
                className="input-dark"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyer_email">Email</Label>
              <Input
                id="buyer_email"
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                placeholder="your@email.com"
                className="input-dark"
              />
            </div>
          </div>
          <Button onClick={updateContactInfo} className="mt-4 btn-gold">
            Save Contact Info
          </Button>
        </div>

        {/* Browse CTA */}
        <div className="glass-card rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Looking for accounts?</h3>
            <p className="text-muted-foreground">Browse our marketplace to find verified Instagram accounts.</p>
          </div>
          <Link to="/">
            <Button className="btn-gold">
              <ExternalLink className="w-4 h-4 mr-2" />
              Browse Marketplace
            </Button>
          </Link>
        </div>

        {/* Orders */}
        <h2 className="text-2xl font-display font-bold mb-6">Your Orders</h2>
        
        {fetchLoading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
            <p className="text-muted-foreground mb-6">Browse the marketplace to purchase your first account.</p>
            <Link to="/">
              <Button className="btn-gold">Browse Accounts</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="glass-card rounded-2xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-gold-dark p-[2px]">
                      <div className="w-full h-full rounded-full bg-card overflow-hidden flex items-center justify-center">
                        {order.ig_accounts?.ig_avatar_url ? (
                          <img src={order.ig_accounts.ig_avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl font-bold text-muted-foreground">
                            {order.ig_accounts?.ig_username?.[0]?.toUpperCase() || '?'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold">@{order.ig_accounts?.ig_username || 'Unknown'}</h3>
                      <p className="text-sm text-muted-foreground">
                        Order placed {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(order.status)}
                    <p className="text-xl font-display font-bold text-primary mt-2">
                      HKD {order.listing_price.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span className="text-sm text-muted-foreground">
                      {order.status === 'pending_payment' && 'Please complete payment'}
                      {order.status === 'awaiting_confirmation' && 'Waiting for admin confirmation'}
                      {order.status === 'payment_confirmed' && 'Contact seller to complete transfer'}
                      {order.status === 'completed' && 'Transaction completed'}
                      {order.status === 'refunded' && 'Payment has been refunded'}
                    </span>
                  </div>
                  
                  {order.status === 'pending_payment' && (
                    <Button
                      onClick={() => setSelectedOrder(order)}
                      className="btn-gold"
                    >
                      View Payment Info
                    </Button>
                  )}
                  
                  {order.status === 'payment_confirmed' && (
                    <Button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowSellerInfo(true);
                      }}
                      className="btn-gold"
                    >
                      View Seller Contact
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Payment Info Dialog */}
      <Dialog open={!!selectedOrder && !showSellerInfo} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Payment Instructions</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
              <p className="text-3xl font-display font-bold text-primary">
                HKD {selectedOrder?.listing_price.toLocaleString()}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">FPS Number</p>
                  <p className="text-muted-foreground">87925469</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-muted-foreground">boyman131418@gmail.com</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-sm font-medium mb-2">After payment:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Take a screenshot of the payment</li>
                <li>Email the screenshot to boyman131418@gmail.com</li>
                <li>Wait for admin confirmation (within 24 hours)</li>
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
              I've Made the Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Seller Info Dialog */}
      <Dialog open={showSellerInfo} onOpenChange={(open) => { if (!open) { setShowSellerInfo(false); setSelectedOrder(null); } }}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Seller Contact Information</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-green-400 font-medium">✓ Payment Confirmed</p>
              <p className="text-xs text-muted-foreground mt-1">
                Contact the seller to complete the account transfer
              </p>
            </div>

            <div className="space-y-4">
              {selectedOrder?.ig_accounts?.contact_phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">Phone</p>
                    <p className="text-muted-foreground">{selectedOrder.ig_accounts.contact_phone}</p>
                  </div>
                </div>
              )}
              
              {selectedOrder?.ig_accounts?.contact_email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">Email</p>
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
              Confirm Transaction Complete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
