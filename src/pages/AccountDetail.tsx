import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getProxiedImageUrl } from '@/lib/imageProxy';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Users, Mail, ArrowLeft, ShoppingCart, RefreshCw, Shield, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface IGAccount {
  id: string;
  seller_id: string;
  ig_username: string;
  ig_avatar_url: string | null;
  follower_count: number;
  contact_email: string | null;
  pricing_type: string | null;
  fixed_price: number | null;
  percentage_rate: number | null;
}

export default function AccountDetail() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [account, setAccount] = useState<IGAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [buyerInfo, setBuyerInfo] = useState({
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (id) {
      fetchAccount();
    }
  }, [id]);

  useEffect(() => {
    if (profile) {
      setBuyerInfo({
        phone: profile.phone || '',
        email: profile.email || '',
      });
    }
  }, [profile]);

  const fetchAccount = async () => {
    const { data, error } = await supabase
      .from('ig_accounts')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .single();

    if (data && !error) {
      setAccount(data);
    }
    setLoading(false);
  };

  const calculatePrice = () => {
    if (!account) return 0;
    if (account.pricing_type === 'fixed') {
      return account.fixed_price || 0;
    }
    if (account.pricing_type === 'percentage' && account.percentage_rate) {
      return Math.round(account.follower_count * (account.percentage_rate / 100));
    }
    return 0;
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const maskEmail = (email: string | null) => {
    if (!email) return '******@****.com';
    const [name, domain] = email.split('@');
    return `${name.slice(0, 2)}****@${domain}`;
  };

  const handlePurchase = async () => {
    if (!user || !account) return;

    if (!buyerInfo.phone || !buyerInfo.email) {
      toast({
        title: 'Missing Information',
        description: 'Please provide your phone and email.',
        variant: 'destructive',
      });
      return;
    }

    setPurchaseLoading(true);

    const price = calculatePrice();
    const platformFee = price * 0.1;
    const sellerPayout = price - platformFee;

    // Update buyer profile
    await supabase
      .from('profiles')
      .update({
        phone: buyerInfo.phone,
        email: buyerInfo.email,
      })
      .eq('id', user.id);

    // Create order
    const { error } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        ig_account_id: account.id,
        seller_id: account.seller_id,
        listing_price: price,
        platform_fee: platformFee,
        seller_payout: sellerPayout,
        buyer_phone: buyerInfo.phone,
        buyer_email: buyerInfo.email,
        status: 'pending_payment',
      });

    setPurchaseLoading(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Order Created',
        description: 'Please proceed to payment.',
      });
      setShowPurchaseDialog(false);
      navigate('/buyer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="glass-card rounded-2xl p-12 text-center max-w-lg mx-auto">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold mb-2">Account Not Found</h2>
            <p className="text-muted-foreground mb-6">This account may have been removed or is no longer available.</p>
            <Link to="/">
              <Button className="btn-gold">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Marketplace
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const price = calculatePrice();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Account Info */}
          <div className="glass-card rounded-3xl p-8 animate-fade-up">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-gold-dark p-[3px] gold-glow">
                <div className="w-full h-full rounded-full bg-card overflow-hidden">
                  {account.ig_avatar_url ? (
                    <img src={getProxiedImageUrl(account.ig_avatar_url) || ''} alt={account.ig_username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <span className="text-4xl font-bold text-muted-foreground">
                        {account.ig_username[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold">@{account.ig_username}</h1>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{formatFollowers(account.follower_count)} followers</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Contact Email</p>
                  <p className="font-medium">{maskEmail(account.contact_email)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Verified Account</p>
                  <p className="font-medium">Follower count verified</p>
                </div>
              </div>
            </div>
          </div>

          {/* Purchase Card */}
          <div className="glass-card rounded-3xl p-8 animate-fade-up stagger-2 opacity-0 h-fit">
            <h2 className="text-xl font-semibold mb-6">Purchase This Account</h2>
            
            <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
              <p className="text-sm text-muted-foreground mb-1">Sale Price</p>
              <p className="text-4xl font-display font-bold text-primary">
                HKD {price.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Platform fee (10%) included in final settlement
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">1</div>
                <p className="text-sm">Complete payment via FPS</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">2</div>
                <p className="text-sm">Admin verifies your payment</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">3</div>
                <p className="text-sm">Receive seller contact info</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">4</div>
                <p className="text-sm">Complete transfer & confirm</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border mb-6">
              <p className="text-xs text-muted-foreground">
                <strong>Money-back guarantee:</strong> If the transaction is not completed within 30 days, 
                you will receive a full refund.
              </p>
            </div>

            {!user ? (
              <Link to="/auth" className="block">
                <Button className="w-full h-14 btn-gold text-lg">
                  Sign In to Purchase
                </Button>
              </Link>
            ) : profile?.role === 'seller' ? (
              <Button className="w-full h-14" disabled>
                Sellers cannot purchase accounts
              </Button>
            ) : (
              <Button
                className="w-full h-14 btn-gold text-lg"
                onClick={() => setShowPurchaseDialog(true)}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Buy Now
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Purchase Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Complete Your Purchase</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-gold-dark p-[2px]">
                <div className="w-full h-full rounded-full bg-card overflow-hidden flex items-center justify-center">
                  {account.ig_avatar_url ? (
                    <img src={getProxiedImageUrl(account.ig_avatar_url) || ''} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-muted-foreground">
                      {account.ig_username[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <p className="font-semibold">@{account.ig_username}</p>
                <p className="text-xl font-display font-bold text-primary">
                  HKD {price.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={buyerInfo.phone}
                  onChange={(e) => setBuyerInfo({ ...buyerInfo, phone: e.target.value })}
                  placeholder="+852 XXXX XXXX"
                  className="input-dark"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={buyerInfo.email}
                  onChange={(e) => setBuyerInfo({ ...buyerInfo, email: e.target.value })}
                  placeholder="your@email.com"
                  className="input-dark"
                  required
                />
              </div>
            </div>

            <Button
              onClick={handlePurchase}
              className="w-full btn-gold"
              disabled={purchaseLoading}
            >
              {purchaseLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4 mr-2" />
              )}
              Proceed to Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
