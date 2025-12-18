import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingBag, Store } from 'lucide-react';

export default function RoleSelect() {
  const { user, profile, updateRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
    if (!loading && profile?.role) {
      if (profile.role === 'admin') {
        navigate('/admin');
      } else if (profile.role === 'seller') {
        navigate('/seller');
      } else {
        navigate('/buyer');
      }
    }
  }, [user, profile, loading, navigate]);

  const handleRoleSelect = async (role: 'buyer' | 'seller') => {
    await updateRole(role);
    navigate(role === 'seller' ? '/seller' : '/buyer');
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
      
      <div className="max-w-2xl w-full relative z-10">
        <div className="text-center mb-12 animate-fade-up">
          <h1 className="text-4xl font-display font-bold mb-4">Choose Your Role</h1>
          <p className="text-muted-foreground text-lg">
            Are you here to buy or sell Instagram accounts?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => handleRoleSelect('buyer')}
            className="glass-card rounded-3xl p-8 text-left hover-lift group animate-fade-up stagger-1 opacity-0"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <ShoppingBag className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-3">I'm a Buyer</h2>
            <p className="text-muted-foreground mb-6">
              Browse and purchase verified Instagram accounts from trusted sellers.
            </p>
            <div className="flex items-center text-primary font-semibold">
              <span>Start Buying</span>
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </button>

          <button
            onClick={() => handleRoleSelect('seller')}
            className="glass-card rounded-3xl p-8 text-left hover-lift group animate-fade-up stagger-2 opacity-0"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <Store className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-3">I'm a Seller</h2>
            <p className="text-muted-foreground mb-6">
              List your Instagram accounts for sale and reach thousands of potential buyers.
            </p>
            <div className="flex items-center text-primary font-semibold">
              <span>Start Selling</span>
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
