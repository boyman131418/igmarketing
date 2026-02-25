import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const { t } = useLanguage();
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
      <section className="relative overflow-hidden pt-24 pb-12 sm:pt-32 sm:pb-20 px-4">
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 sm:mb-8">
              <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              <span className="text-xs sm:text-sm text-primary font-medium">{t('premiumIgMarketplace')}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-display font-bold mb-4 sm:mb-6 leading-tight">
              <span className="text-foreground">{t('buyAndSell')}</span>
              <br />
              <span className="text-gradient-gold">{t('instagramAccounts')}</span>
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto px-2">
              {t('heroDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              {!user ? (
                <Link to="/auth" className="btn-gold text-lg">
                  {t('startTradingNow')}
                </Link>
              ) : !profile?.role ? (
                <Link to="/role-select" className="btn-gold text-lg">
                  {t('chooseYourRole')}
                </Link>
              ) : profile.role === 'seller' ? (
                <Link to="/seller" className="btn-gold text-lg">
                  {t('sellerDashboard')}
                </Link>
              ) : profile.role === 'buyer' ? (
                <Link to="/buyer" className="btn-gold text-lg">
                  {t('buyerDashboard')}
                </Link>
              ) : profile.role === 'admin' ? (
                <Link to="/admin" className="btn-gold text-lg">
                  {t('adminPanel')}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-10 sm:py-16 px-4 border-t border-border/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
            <div className="glass-card rounded-2xl p-5 sm:p-8 animate-fade-up stagger-1 opacity-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{t('secureEscrow')}</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t('secureEscrowDesc')}
              </p>
            </div>
            <div className="glass-card rounded-2xl p-5 sm:p-8 animate-fade-up stagger-2 opacity-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{t('fastVerification')}</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t('fastVerificationDesc')}
              </p>
            </div>
            <div className="glass-card rounded-2xl p-5 sm:p-8 animate-fade-up stagger-3 opacity-0 sm:col-span-2 md:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{t('verifiedAccounts')}</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t('verifiedAccountsDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="py-10 sm:py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6 sm:mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold mb-1 sm:mb-2">{t('availableAccounts')}</h2>
              <p className="text-sm sm:text-base text-muted-foreground">{t('browseVerifiedAccounts')}</p>
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
              <h3 className="text-xl font-semibold mb-2">{t('noAccountsListedYet')}</h3>
              <p className="text-muted-foreground mb-6">{t('beFirstToList')}</p>
              {!user && (
                <Link to="/auth" className="btn-gold">
                  {t('getStarted')}
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
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 border-t border-border/50">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
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