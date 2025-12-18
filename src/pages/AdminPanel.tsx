import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
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
  AlertTriangle
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [accounts, setAccounts] = useState<IGAccount[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    if (!loading && profile) {
      // Check if user is admin (has admin role or is the admin email)
      if (profile.role !== 'admin' && profile.email !== ADMIN_EMAIL) {
        navigate('/');
        return;
      }
      // Auto-set admin role if email matches
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
    }
  }, [user, profile]);

  const fetchData = async () => {
    setFetchLoading(true);
    
    // Fetch orders
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

    // Fetch users
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersData) {
      setUsers(usersData as Profile[]);
    }

    // Fetch accounts
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
      toast({ title: 'Payment Confirmed', description: 'Buyer can now access seller contact info.' });
      fetchData();
      setSelectedOrder(null);
      setAdminNotes('');
    }
    setActionLoading(false);
  };

  const refundOrder = async (order: Order) => {
    if (!confirm('Are you sure you want to refund this order?')) return;
    
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
      toast({ title: 'Order Refunded', description: 'The order has been marked as refunded.' });
      fetchData();
      setSelectedOrder(null);
      setAdminNotes('');
    }
    setActionLoading(false);
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
          <h1 className="text-3xl font-display font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage orders, users, and platform settings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground text-sm">Total Orders</span>
            </div>
            <p className="text-3xl font-display font-bold">{stats.totalOrders}</p>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="text-muted-foreground text-sm">Pending</span>
            </div>
            <p className="text-3xl font-display font-bold">{stats.pendingConfirmation}</p>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-muted-foreground text-sm">Completed</span>
            </div>
            <p className="text-3xl font-display font-bold">{stats.completedOrders}</p>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground text-sm">Revenue</span>
            </div>
            <p className="text-3xl font-display font-bold">HKD {stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="accounts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Instagram className="w-4 h-4 mr-2" />
              Accounts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {orders.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold">No Orders Yet</h3>
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
                      <p className="text-sm text-muted-foreground">Buyer</p>
                      <p className="font-medium">{order.buyer?.email || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">{order.buyer_phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Seller</p>
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
                          Confirm Payment
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
                          Refund
                        </Button>
                      </>
                    )}
                    {(order.status === 'payment_confirmed' || order.status === 'completed') && (
                      <Button
                        variant="outline"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View Details
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
                      <th className="text-left p-4 font-medium">Email</th>
                      <th className="text-left p-4 font-medium">Phone</th>
                      <th className="text-left p-4 font-medium">Role</th>
                      <th className="text-left p-4 font-medium">Joined</th>
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
                            {user.role || 'None'}
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
                      <th className="text-left p-4 font-medium">Username</th>
                      <th className="text-left p-4 font-medium">Followers</th>
                      <th className="text-left p-4 font-medium">Seller</th>
                      <th className="text-left p-4 font-medium">Status</th>
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
                            {account.is_published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Order Details</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6 mt-4">
              <div className="p-4 rounded-xl bg-muted/50">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Account</span>
                  <span className="font-medium">@{selectedOrder.ig_accounts?.ig_username}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-medium">HKD {selectedOrder.listing_price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Platform Fee (10%)</span>
                  <span className="font-medium text-primary">HKD {selectedOrder.platform_fee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seller Payout</span>
                  <span className="font-medium">HKD {selectedOrder.seller_payout.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Buyer Contact</p>
                <p className="font-medium">{selectedOrder.buyer_email}</p>
                <p className="text-sm text-muted-foreground">{selectedOrder.buyer_phone}</p>
              </div>

              {selectedOrder.ig_accounts && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Seller Contact</p>
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
                    <label className="text-sm font-medium">Admin Notes</label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about this order..."
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
                      Confirm Payment
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
                    <span className="font-medium">Transaction Completed</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Completed on {selectedOrder.completed_at ? new Date(selectedOrder.completed_at).toLocaleDateString() : 'N/A'}
                  </p>
                  <div className="mt-3 p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm font-medium text-primary">
                      Seller payout due: HKD {selectedOrder.seller_payout.toLocaleString()}
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
