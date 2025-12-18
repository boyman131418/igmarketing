import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Instagram, Mail, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Auth() {
  const { user, profile, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
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
    if (!email || !password) {
      toast.error('請填寫電郵和密碼');
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('電郵或密碼錯誤');
          } else {
            toast.error(error.message);
          }
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('此電郵已註冊，請登入');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('註冊成功！');
        }
      }
    } catch (err) {
      toast.error('發生錯誤，請稍後再試');
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      
      <div className="glass-card rounded-3xl p-10 max-w-md w-full relative z-10 animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 gold-glow">
            <Instagram className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-3">
            {isLogin ? '登入 IG Market' : '註冊 IG Market'}
          </h1>
          <p className="text-muted-foreground">
            {isLogin ? '登入以開始買賣 Instagram 帳號' : '建立帳號以開始買賣 Instagram 帳號'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">電郵</Label>
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
          
          <div className="space-y-2">
            <Label htmlFor="password">密碼</Label>
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

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-lg rounded-xl transition-all duration-300"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              isLogin ? '登入' : '註冊'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline"
          >
            {isLogin ? '還沒有帳號？立即註冊' : '已有帳號？立即登入'}
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          登入即表示你同意我們的服務條款和私隱政策
        </p>
      </div>
    </div>
  );
}
