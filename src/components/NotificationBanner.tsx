import React from 'react';
import { Bell, ArrowRight, Sparkles } from 'lucide-react';

interface NotificationBannerProps {
  text: string;
  onActionClick?: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ text, onActionClick }) => {
  if (!text) return null;

  return (
    <div className="bg-[#FFFFFF] text-[#171717] text-xs py-2.5 px-4 shadow-[0_2px_12px_rgba(212,175,55,0.12)] border-b border-[#D4AF37]/30 flex items-center justify-between z-40 relative">
      <div className="flex items-center gap-2.5 max-w-7xl mx-auto w-full justify-center text-center">
        <div className="w-5 h-5 rounded-full bg-[#D4AF37]/15 flex items-center justify-center shrink-0">
          <Sparkles className="w-3 h-3 text-[#C9A227] animate-pulse" />
        </div>
        <span className="font-semibold tracking-wide text-[#171717] truncate">{text}</span>
        {onActionClick && (
          <button
            onClick={onActionClick}
            className="hidden sm:inline-flex items-center gap-1 ml-3 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white font-bold text-[11px] hover:shadow-[0_2px_10px_rgba(212,175,55,0.4)] transition-all shrink-0 cursor-pointer"
          >
            <span>Register Now</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
