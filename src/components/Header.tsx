import React, { memo } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ cartItemsCount, onCartClick }) => {
  const { siteSettings, loading } = useSiteSettings();

  return (
    <header className="sticky top-0 z-50 bg-teamax-surface/90 backdrop-blur-md border-b border-teamax-border shadow-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="relative">
              <img
                src={siteSettings?.site_logo || "/teamax-logo.png"}
                alt={siteSettings?.site_name || "Tea Max Milk Tea Hub"}
                className="w-12 h-12 rounded-full object-cover border border-teamax-border shadow-sm group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = "/teamax-logo.png";
                }}
              />
            </div>
            <div className="flex flex-col items-start">
              <h1 className="text-xl font-serif font-bold text-teamax-primary tracking-tight">
                {loading ? (
                  <div className="w-24 h-6 bg-gray-100 rounded animate-pulse" />
                ) : (
                  siteSettings?.site_name || "Tea Max"
                )}
              </h1>
              <span className="text-xs text-teamax-secondary font-sans uppercase tracking-widest font-semibold tracking-tighter">
                {siteSettings?.site_tagline || "Milk Tea Hub"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onCartClick}
              className="relative p-3 bg-white text-black border-2 border-black hover:bg-black hover:text-white rounded-full transition-all duration-300 group hover:scale-110 active:scale-90 shadow-md"
              title="Cart"
            >
              <ShoppingCart className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-100 text-red-600 border border-red-600 text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce-gentle border-2 border-white shadow-lg">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default memo(Header);
