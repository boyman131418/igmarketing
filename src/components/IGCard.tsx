import { Link } from 'react-router-dom';
import { Users, Mail } from 'lucide-react';

interface IGCardProps {
  id: string;
  username: string;
  avatarUrl: string | null;
  followerCount: number;
  price: number;
  maskedEmail: string;
  index?: number;
}

export default function IGCard({
  id,
  username,
  avatarUrl,
  followerCount,
  price,
  maskedEmail,
  index = 0,
}: IGCardProps) {
  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <Link
      to={`/account/${id}`}
      className={`ig-card block animate-fade-up stagger-${(index % 5) + 1} opacity-0`}
    >
      <div className="flex items-start gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-gold-dark p-[2px]">
            <div className="w-full h-full rounded-full bg-card overflow-hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-2xl font-bold text-muted-foreground">
                    {username[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">@{username}</h3>
          <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
            <Users className="w-4 h-4" />
            <span>{formatFollowers(followerCount)} followers</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
            <Mail className="w-4 h-4" />
            <span className="truncate">{maskedEmail}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Price</span>
        <span className="text-2xl font-display font-bold text-primary">
          HKD {price.toLocaleString()}
        </span>
      </div>
    </Link>
  );
}
