import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { lovable } from '@/integrations/lovable';
import { supabase } from '@/integrations/supabase/client';

const ALLOWED_RETURN_ORIGIN = 'https://boyman131418.github.io';
const FALLBACK_RETURN_URL = `${ALLOWED_RETURN_ORIGIN}/igmarketing/auth`;

const getSafeReturnUrl = () => {
  const returnTo = new URLSearchParams(window.location.search).get('return_to');

  if (!returnTo) return FALLBACK_RETURN_URL;

  try {
    const parsed = new URL(returnTo);
    const isAllowedOrigin = parsed.origin === ALLOWED_RETURN_ORIGIN;
    const isAllowedPath = parsed.pathname.startsWith('/igmarketing/');

    if (!isAllowedOrigin || !isAllowedPath) return FALLBACK_RETURN_URL;
    return parsed.toString();
  } catch {
    return FALLBACK_RETURN_URL;
  }
};

export default function OauthBridge() {
  const [status, setStatus] = useState('準備 Google 登入中…');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const safeReturnUrl = useMemo(() => getSafeReturnUrl(), []);

  useEffect(() => {
    let cancelled = false;

    const bridge = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const backUrl = new URL(safeReturnUrl);
        const hash = new URLSearchParams({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
        backUrl.hash = hash.toString();
        window.location.replace(backUrl.toString());
        return;
      }

      setStatus('跳轉到 Google 驗證…');

      const { error } = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.href,
      });

      if (error && !cancelled) {
        setErrorMessage(error.message);
        setStatus('Google 登入失敗');
        toast.error(error.message);
      }
    };

    bridge();

    return () => {
      cancelled = true;
    };
  }, [safeReturnUrl]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="glass-card rounded-3xl p-8 max-w-md w-full text-center space-y-5">
        <Loader2 className="w-7 h-7 animate-spin mx-auto text-primary" />
        <h1 className="text-2xl font-display font-bold">Google Login Bridge</h1>
        <p className="text-muted-foreground text-sm">{status}</p>

        {errorMessage && (
          <>
            <p className="text-sm text-destructive">{errorMessage}</p>
            <Button
              type="button"
              className="w-full"
              onClick={() => window.location.replace(safeReturnUrl)}
            >
              返回登入頁
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
