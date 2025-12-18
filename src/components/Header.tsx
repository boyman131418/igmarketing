import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { Instagram, User, LogOut, LayoutDashboard, Settings, Globe, UserCog, ShoppingCart, Store, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function Header() {
  const { user, profile, signOut, updateRole, isAdmin } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (profile?.role === 'admin') return '/admin';
    if (profile?.role === 'seller') return '/seller';
    if (profile?.role === 'buyer') return '/buyer';
    return '/role-select';
  };

  const handleRoleSwitch = async (role: 'buyer' | 'seller' | 'admin') => {
    await updateRole(role);
    toast.success(language === 'zh' ? `已切換至${role === 'buyer' ? '買家' : role === 'seller' ? '賣家' : '管理員'}模式` : `Switched to ${role} mode`);
    
    // Navigate to appropriate dashboard
    if (role === 'admin') navigate('/admin');
    else if (role === 'seller') navigate('/seller');
    else if (role === 'buyer') navigate('/buyer');
  };

  const getRoleLabel = () => {
    if (!profile?.role) return t('noRoleSelected');
    return t(profile.role);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Instagram className="w-6 h-6 text-primary" />
            <span className="font-display text-xl font-bold">IG Market</span>
          </Link>

          <nav className="flex items-center gap-2">
            {/* Language Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Globe className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border">
                <DropdownMenuItem 
                  onClick={() => setLanguage('zh')}
                  className={language === 'zh' ? 'bg-primary/10' : ''}
                >
                  繁體中文
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('en')}
                  className={language === 'en' ? 'bg-primary/10' : ''}
                >
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-10 px-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">
                      {profile?.email?.split('@')[0] || t('account')}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{profile?.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {getRoleLabel()}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => navigate(getDashboardLink())}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    {t('dashboard')}
                  </DropdownMenuItem>
                  
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Settings className="w-4 h-4 mr-2" />
                      {t('adminPanel')}
                    </DropdownMenuItem>
                  )}

                  {/* Role Switching - Only for Admin */}
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <UserCog className="w-4 h-4 mr-2" />
                          {t('switchRole')}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="bg-card border-border">
                          <DropdownMenuItem 
                            onClick={() => handleRoleSwitch('buyer')}
                            className={profile?.role === 'buyer' ? 'bg-primary/10' : ''}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {t('buyer')}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleRoleSwitch('seller')}
                            className={profile?.role === 'seller' ? 'bg-primary/10' : ''}
                          >
                            <Store className="w-4 h-4 mr-2" />
                            {t('seller')}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleRoleSwitch('admin')}
                            className={profile?.role === 'admin' ? 'bg-primary/10' : ''}
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            {t('admin')}
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                  {t('signIn')}
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
