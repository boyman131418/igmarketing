// Helper to proxy Instagram images through our edge function
export const getProxiedImageUrl = (originalUrl: string | null): string | null => {
  if (!originalUrl) return null;
  
  // If it's already a proxied URL or not an Instagram URL, return as-is
  if (!originalUrl.includes('instagram') && !originalUrl.includes('cdninstagram')) {
    return originalUrl;
  }
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  return `${supabaseUrl}/functions/v1/proxy-image?url=${encodeURIComponent(originalUrl)}`;
};
