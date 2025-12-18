import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getProxiedImageUrl } from '@/lib/imageProxy';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, RefreshCw, Instagram, Users, DollarSign } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface IGAccount {
  id: string;
  ig_username: string;
  ig_avatar_url: string | null;
  follower_count: number;
  contact_phone: string | null;
  contact_email: string | null;
  payment_details: string | null;
  pricing_type: string | null;
  fixed_price: number | null;
  percentage_rate: number | null;
  is_published: boolean;
  last_synced_at: string | null;
}

export default function SellerDashboard() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<IGAccount[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<IGAccount | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    ig_username: '',
    contact_phone: '',
    contact_email: '',
    payment_details: '',
    pricing_type: 'fixed',
    fixed_price: '',
    percentage_rate: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
    if (!loading && profile && profile.role !== 'seller' && profile.role !== 'admin') {
      navigate('/');
    }
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAccounts();
    }
  }, [user]);

  const fetchAccounts = async () => {
    const { data, error } = await supabase
      .from('ig_accounts')
      .select('*')
      .eq('seller_id', user?.id)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setAccounts(data);
    }
  };

  const resetForm = () => {
    setFormData({
      ig_username: '',
      contact_phone: '',
      contact_email: '',
      payment_details: '',
      pricing_type: 'fixed',
      fixed_price: '',
      percentage_rate: '',
    });
    setEditingAccount(null);
  };

  const openEditDialog = (account: IGAccount) => {
    setEditingAccount(account);
    setFormData({
      ig_username: account.ig_username,
      contact_phone: account.contact_phone || '',
      contact_email: account.contact_email || '',
      payment_details: account.payment_details || '',
      pricing_type: account.pricing_type || 'fixed',
      fixed_price: account.fixed_price?.toString() || '',
      percentage_rate: account.percentage_rate?.toString() || '',
    });
    setIsDialogOpen(true);
  };

  const fetchIGData = async (username: string, accountId?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-ig-data', {
        body: { username, accountId },
      });

      if (error) {
        console.error('Error fetching IG data:', error);
        return { followerCount: 0, avatarUrl: null };
      }

      return {
        followerCount: data?.followerCount || 0,
        avatarUrl: data?.avatarUrl || null,
      };
    } catch (err) {
      console.error('Error invoking fetch-ig-data:', err);
      return { followerCount: 0, avatarUrl: null };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    // First, fetch IG data
    toast({
      title: '正在讀取 Instagram 資料...',
      description: `正在獲取 @${formData.ig_username} 的頭像和粉絲數`,
    });

    const igData = await fetchIGData(formData.ig_username);

    const accountData = {
      seller_id: user?.id,
      ig_username: formData.ig_username,
      contact_phone: formData.contact_phone || null,
      contact_email: formData.contact_email || null,
      payment_details: formData.payment_details || null,
      pricing_type: formData.pricing_type,
      fixed_price: formData.pricing_type === 'fixed' ? parseFloat(formData.fixed_price) || null : null,
      percentage_rate: formData.pricing_type === 'percentage' ? parseFloat(formData.percentage_rate) || null : null,
      follower_count: igData.followerCount,
      ig_avatar_url: igData.avatarUrl,
      last_synced_at: new Date().toISOString(),
    };

    let error;
    if (editingAccount) {
      const result = await supabase
        .from('ig_accounts')
        .update(accountData)
        .eq('id', editingAccount.id);
      error = result.error;
    } else {
      const result = await supabase
        .from('ig_accounts')
        .insert(accountData);
      error = result.error;
    }

    setFormLoading(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: editingAccount ? '帳號已更新' : '帳號已新增',
        description: `@${formData.ig_username} 已成功${editingAccount ? '更新' : '新增'}。粉絲數：${igData.followerCount.toLocaleString()}`,
      });
      resetForm();
      setIsDialogOpen(false);
      fetchAccounts();
    }
  };

  const syncAccount = async (account: IGAccount) => {
    toast({
      title: '正在同步...',
      description: `正在更新 @${account.ig_username} 的資料`,
    });

    const igData = await fetchIGData(account.ig_username, account.id);

    toast({
      title: '同步完成',
      description: `@${account.ig_username} - 粉絲數：${igData.followerCount.toLocaleString()}`,
    });

    fetchAccounts();
  };

  const togglePublish = async (account: IGAccount) => {
    const { error } = await supabase
      .from('ig_accounts')
      .update({ is_published: !account.is_published })
      .eq('id', account.id);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: account.is_published ? 'Unpublished' : 'Published',
        description: `@${account.ig_username} is now ${account.is_published ? 'hidden' : 'visible'} on the marketplace.`,
      });
      fetchAccounts();
    }
  };

  const deleteAccount = async (account: IGAccount) => {
    if (!confirm('Are you sure you want to delete this account?')) return;

    const { error } = await supabase
      .from('ig_accounts')
      .delete()
      .eq('id', account.id);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Deleted',
        description: `@${account.ig_username} has been removed.`,
      });
      fetchAccounts();
    }
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

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Seller Dashboard</h1>
            <p className="text-muted-foreground">Manage your Instagram accounts for sale</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="btn-gold">
                <Plus className="w-4 h-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  {editingAccount ? 'Edit Account' : 'Add New Account'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="ig_username">Instagram Username</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                    <Input
                      id="ig_username"
                      value={formData.ig_username}
                      onChange={(e) => setFormData({ ...formData, ig_username: e.target.value })}
                      placeholder="username"
                      className="pl-8 input-dark"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input
                      id="contact_phone"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      placeholder="+852 XXXX XXXX"
                      className="input-dark"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      placeholder="email@example.com"
                      className="input-dark"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_details">Payment Details (Bank/FPS/Payme)</Label>
                  <Textarea
                    id="payment_details"
                    value={formData.payment_details}
                    onChange={(e) => setFormData({ ...formData, payment_details: e.target.value })}
                    placeholder="Enter your payment receiving details..."
                    className="input-dark resize-none"
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Pricing Method</Label>
                  <RadioGroup
                    value={formData.pricing_type}
                    onValueChange={(value) => setFormData({ ...formData, pricing_type: value })}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className={`flex items-center space-x-3 p-4 rounded-xl border ${formData.pricing_type === 'fixed' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                      <RadioGroupItem value="fixed" id="fixed" />
                      <Label htmlFor="fixed" className="cursor-pointer">Fixed Price</Label>
                    </div>
                    <div className={`flex items-center space-x-3 p-4 rounded-xl border ${formData.pricing_type === 'percentage' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                      <RadioGroupItem value="percentage" id="percentage" />
                      <Label htmlFor="percentage" className="cursor-pointer">% of Followers</Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.pricing_type === 'fixed' ? (
                  <div className="space-y-2">
                    <Label htmlFor="fixed_price">Price (HKD)</Label>
                    <Input
                      id="fixed_price"
                      type="number"
                      value={formData.fixed_price}
                      onChange={(e) => setFormData({ ...formData, fixed_price: e.target.value })}
                      placeholder="10000"
                      className="input-dark"
                      min="0"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="percentage_rate">Percentage Rate (%)</Label>
                    <Input
                      id="percentage_rate"
                      type="number"
                      value={formData.percentage_rate}
                      onChange={(e) => setFormData({ ...formData, percentage_rate: e.target.value })}
                      placeholder="50"
                      className="input-dark"
                      min="0"
                      max="100"
                    />
                    <p className="text-xs text-muted-foreground">
                      Price = Follower Count × (Percentage / 100)
                    </p>
                  </div>
                )}

                <Button type="submit" className="w-full btn-gold" disabled={formLoading}>
                  {formLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  {editingAccount ? 'Update Account' : 'Add Account'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {accounts.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Instagram className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Accounts Yet</h3>
            <p className="text-muted-foreground mb-6">Add your first Instagram account to start selling.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <div key={account.id} className="glass-card rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-gold-dark p-[2px]">
                      <div className="w-full h-full rounded-full bg-card overflow-hidden flex items-center justify-center">
                        {account.ig_avatar_url ? (
                          <img src={getProxiedImageUrl(account.ig_avatar_url) || ''} alt={account.ig_username} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl font-bold text-muted-foreground">
                            {account.ig_username[0]?.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold">@{account.ig_username}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-3 h-3" />
                        {formatFollowers(account.follower_count)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={account.is_published}
                      onCheckedChange={() => togglePublish(account)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-border/50">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">Price</span>
                  </div>
                  <span className="text-xl font-display font-bold text-primary">
                    HKD {calculatePrice(account).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => syncAccount(account)}
                    title="同步 IG 資料"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(account)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => deleteAccount(account)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <p className={`text-xs mt-3 text-center ${account.is_published ? 'text-green-400' : 'text-muted-foreground'}`}>
                  {account.is_published ? '● Listed on marketplace' : '○ Not listed'}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
