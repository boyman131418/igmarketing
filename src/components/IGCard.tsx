import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { getProxiedImageUrl } from '@/lib/imageProxy';
import { useLanguage } from '@/contexts/LanguageContext';

interface IGCardProps {
  id: string;
  username: string;
  avatarUrl: string | null;
  followerCount: number;
  price: number;
  index?: number;
}

export default function IGCard({
  id,
  username,
  avatarUrl,
  followerCount,
  price,
  index = 0,
}: IGCardProps) {
  const { t } = useLanguage();
  const [imageError, setImageError] = useState(false);
  
  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const proxiedAvatarUrl = getProxiedImageUrl(avatarUrl);
  const showFallback = !proxiedAvatarUrl || imageError;

  return (
    <Link
      to={`/account/${id}`}
      className={`ig-card block animate-fade-up stagger-${(index % 5) + 1} opacity-0`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="relative">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-gold-dark p-[2px]">
            <div className="w-full h-full rounded-full bg-card overflow-hidden">
              {showFallback ? (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-lg sm:text-2xl font-bold text-muted-foreground">
                    {username[0]?.toUpperCase()}
                  </span>
                </div>
              ) : (
                <img
                  src={proxiedAvatarUrl}
                  alt={username}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              )}
            </div>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base sm:text-lg truncate">@{username}</h3>
          <div className="flex items-center gap-1 text-muted-foreground text-xs sm:text-sm mt-1">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{formatFollowers(followerCount)} {t('followers')}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border/50 flex items-center justify-between">
        <span className="text-xs sm:text-sm text-muted-foreground">{t('price')}</span>
        <span className="text-xl sm:text-2xl font-display font-bold text-primary">
          HKD {price.toLocaleString()}
        </span>
      </div>
    </Link>
  );
}