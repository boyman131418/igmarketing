import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import IGCard from '@/components/IGCard';
import { Instagram, Shield, Zap, Users } from 'lucide-react';

interface IGAccount {
  id: string;
  ig_username: string;
  ig_avatar_url: string | null;
  follower_count: number;
  pricing_type: string | null;
  fixed_price: number | null;
  percentage_rate: number | null;
  contact_email: string | null;
}

export default function Index() {
  const { user, profile } = useAuth();
  const [accounts, setAccounts] = useState<IGAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublishedAccounts();
  }, []);

  const fetchPublishedAccounts = async () => {
    const { data, error } = await supabase
      .from('ig_accounts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setAccounts(data);
    }
    setLoading(false);
  };

  const calculatePrice = (account: IGAccount) => {
    if (account.pricing_type === 'fixed') {
      return account.fixed_price || 0;
    }
    if (account.pricing_type === 'percentage' && account.percentage_rate) {
      return Math.round(account.follower_count * (account.percentage_rate / 100));
    }
    return 0;
  };

  const maskEmail = (email: string | null) => {
    if (!email) return '******@****.com';
    const [name, domain] = email.split('@');
    return `${name.slice(0, 2)}****@${domain}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 px-4">
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Instagram className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Premium IG Marketplace</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
              <span className="text-foreground">Buy & Sell</span>
              <br />
              <span className="text-gradient-gold">Instagram Accounts</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              The most trusted platform for trading verified Instagram accounts. 
              Secure transactions, verified sellers, and guaranteed delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <Link to="/auth" className="btn-gold text-lg">
                  Start Trading Now
                </Link>
              ) : !profile?.role ? (
                <Link to="/role-select" className="btn-gold text-lg">
                  Choose Your Role
                </Link>
              ) : profile.role === 'seller' ? (
                <Link to="/seller" className="btn-gold text-lg">
                  Seller Dashboard
                </Link>
              ) : profile.role === 'buyer' ? (
                <Link to="/buyer" className="btn-gold text-lg">
                  Buyer Dashboard
                </Link>
              ) : profile.role === 'admin' ? (
                <Link to="/admin" className="btn-gold text-lg">
                  Admin Panel
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 border-t border-border/50">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card rounded-2xl p-8 animate-fade-up stagger-1 opacity-0">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Escrow</h3>
              <p className="text-muted-foreground">
                Your payment is held safely until the transaction is verified and completed.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-8 animate-fade-up stagger-2 opacity-0">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Fast Verification</h3>
              <p className="text-muted-foreground">
                Admin verification within 24 hours. Quick and hassle-free process.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-8 animate-fade-up stagger-3 opacity-0">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Verified Accounts</h3>
              <p className="text-muted-foreground">
                All accounts are verified with real follower data updated daily.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-display font-bold mb-2">Available Accounts</h2>
              <p className="text-muted-foreground">Browse verified Instagram accounts for sale</p>
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-muted" />
                    <div className="flex-1">
                      <div className="h-5 bg-muted rounded w-32 mb-2" />
                      <div className="h-4 bg-muted rounded w-24" />
                    </div>
                  </div>
                  <div className="h-8 bg-muted rounded w-28 mt-4" />
                </div>
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Instagram className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Accounts Listed Yet</h3>
              <p className="text-muted-foreground mb-6">Be the first to list your account on our platform.</p>
              {!user && (
                <Link to="/auth" className="btn-gold">
                  Get Started
                </Link>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map((account, index) => (
                <IGCard
                  key={account.id}
                  id={account.id}
                  username={account.ig_username}
                  avatarUrl={account.ig_avatar_url}
                  followerCount={account.follower_count}
                  price={calculatePrice(account)}
                  maskedEmail={maskEmail(account.contact_email)}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/50">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Instagram className="w-6 h-6 text-primary" />
              <span className="font-display text-xl font-bold">IG Market</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2024 IG Market. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
