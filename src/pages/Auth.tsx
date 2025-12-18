import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Instagram, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type AuthMode = 'login' | 'signup' | 'forgot';

export default function Auth() {
  const { user, profile, loading, signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (profile?.role) {
        if (profile.role === 'admin') {
          navigate('/admin');
        } else if (profile.role === 'seller') {
          navigate('/seller');
        } else {
          navigate('/buyer');
        }
      } else {
        navigate('/role-select');
      }
    }
  }, [user, profile, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'forgot') {
      if (!email) {
        toast.error(t('pleaseEnterEmail'));
        return;
      }
      setIsSubmitting(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) {
          toast.error(error.message);
        } else {
          toast.success(t('resetEmailSent'));
          setMode('login');
        }
      } catch (err) {
        toast.error(t('errorOccurred'));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!email || !password) {
      toast.error(t('pleaseEnterEmailAndPassword'));
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error(t('wrongCredentials'));
          } else {
            toast.error(error.message);
          }
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error(t('emailAlreadyRegistered'));
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success(t('signupSuccess'));
        }
      }
    } catch (err) {
      toast.error(t('errorOccurred'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const getTitle = () => {
    switch (mode) {
      case 'login': return t('loginTitle');
      case 'signup': return t('signupTitle');
      case 'forgot': return t('resetPasswordTitle');
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'login': return t('loginSubtitle');
      case 'signup': return t('signupSubtitle');
      case 'forgot': return t('resetPasswordSubtitle');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      
      <div className="glass-card rounded-3xl p-10 max-w-md w-full relative z-10 animate-scale-in">
        {mode === 'forgot' && (
          <button
            type="button"
            onClick={() => setMode('login')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backToLogin')}
          </button>
        )}

        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 gold-glow">
            <Instagram className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-3">{getTitle()}</h1>
          <p className="text-muted-foreground">{getSubtitle()}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('emailLabel')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 bg-card border-border"
              />
            </div>
          </div>
          
          {mode !== 'forgot' && (
            <div className="space-y-2">
              <Label htmlFor="password">{t('passwordLabel')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 bg-card border-border"
                />
              </div>
            </div>
          )}

          {mode === 'login' && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-sm text-primary hover:underline"
              >
                {t('forgotPassword')}
              </button>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-lg rounded-xl transition-all duration-300"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : mode === 'forgot' ? t('sendResetLink') : mode === 'login' ? t('login') : t('signup')}
          </Button>
        </form>

        {mode !== 'forgot' && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-primary hover:underline"
            >
              {mode === 'login' ? t('noAccountYet') : t('alreadyHaveAccount')}
            </button>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground mt-8">
          {t('termsAgreement')}
        </p>
      </div>
    </div>
  );
}