import React, { memo, useState } from 'react';
import { ShoppingCart, HelpCircle, X, Clock } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ cartItemsCount, onCartClick }) => {
  const { siteSettings, loading } = useSiteSettings();
  const [showHowToOrder, setShowHowToOrder] = useState(false);

  return (
    <>
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
                onClick={() => setShowHowToOrder(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-white text-black border-2 border-black hover:bg-black/90 rounded-full transition-all duration-300 font-bold text-xs uppercase tracking-widest border border-black hover:scale-105 active:scale-95 shadow-lg shadow-black/20"
              >
                <HelpCircle className="h-4 w-4" />
                <span>How to Order</span>
              </button>

              <button
                onClick={onCartClick}
                className="relative p-3 bg-white text-black border-2 border-black hover:bg-black/90 border border-black rounded-full transition-all duration-300 group hover:scale-110 active:scale-90 shadow-lg"
                title="Cart"
              >
                <ShoppingCart className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-100 text-red-600 border border-red-600 text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce-gentle border-2 border-teamax-surface shadow-lg">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* How to Order Modal */}
      {showHowToOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowHowToOrder(false)}>
          <div className="bg-teamax-surface rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-teamax-border" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-teamax-dark p-6 border-b border-teamax-border flex justify-between items-center z-10">
              <h2 className="text-2xl font-serif font-bold text-teamax-primary">How to Order</h2>
              <button
                onClick={() => setShowHowToOrder(false)}
                className="p-2 hover:bg-teamax-light rounded-full transition-all duration-200 hover:rotate-90 text-teamax-primary"
                title="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Step 1 */}
              <div className="flex gap-6 group hover:translate-x-1 transition-transform">
                <div className="flex-shrink-0 w-12 h-12 bg-teamax-accent rounded-2xl flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-teamax-accent/20 rotate-3 group-hover:rotate-0 transition-transform">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-bold text-teamax-primary mb-2">Browse Our Menu</h3>
                  <p className="text-teamax-secondary leading-relaxed">
                    Explore our delicious menu items by scrolling through the page or selecting a category from the navigation bar.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6 group hover:translate-x-1 transition-transform">
                <div className="flex-shrink-0 w-12 h-12 bg-teamax-accent rounded-2xl flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-teamax-accent/20 -rotate-3 group-hover:rotate-0 transition-transform">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-bold text-teamax-primary mb-2">Add Items to Cart</h3>
                  <p className="text-teamax-secondary leading-relaxed">
                    Click on any menu item to view details. Select your preferred size (if available), add any extras, and click "Add to Cart".
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6 group hover:translate-x-1 transition-transform">
                <div className="flex-shrink-0 w-12 h-12 bg-teamax-accent rounded-2xl flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-teamax-accent/20 rotate-1 group-hover:rotate-0 transition-transform">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-bold text-teamax-primary mb-2">Review Your Cart</h3>
                  <p className="text-teamax-secondary leading-relaxed">
                    Click the floating cart button or header cart icon to review your items. You can adjust quantities or remove items before checkout.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-6 group hover:translate-x-1 transition-transform">
                <div className="flex-shrink-0 w-12 h-12 bg-teamax-accent rounded-2xl flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-teamax-accent/20 -rotate-2 group-hover:rotate-0 transition-transform">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-bold text-teamax-primary mb-2">Choose Service Type</h3>
                  <p className="text-teamax-secondary leading-relaxed mb-3">
                    Select your preferred service type:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-teamax-dark border border-teamax-border rounded-xl text-center">
                      <span className="text-teamax-accent font-bold block mb-1">Delivery</span>
                      <span className="text-[10px] text-teamax-secondary uppercase tracking-widest font-bold">To your door</span>
                    </div>
                    <div className="p-3 bg-teamax-dark border border-teamax-border rounded-xl text-center">
                      <span className="text-teamax-accent font-bold block mb-1">Pickup</span>
                      <span className="text-[10px] text-teamax-secondary uppercase tracking-widest font-bold">At restaurant</span>
                    </div>
                    <div className="p-3 bg-teamax-dark border border-teamax-border rounded-xl text-center">
                      <span className="text-teamax-accent font-bold block mb-1">Dine-in</span>
                      <span className="text-[10px] text-teamax-secondary uppercase tracking-widest font-bold">In house</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-6 group hover:translate-x-1 transition-transform">
                <div className="flex-shrink-0 w-12 h-12 bg-teamax-accent rounded-2xl flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-teamax-accent/20 rotate-2 group-hover:rotate-0 transition-transform">
                  5
                </div>
                <div>
                  <h3 className="text-lg font-bold text-teamax-primary mb-2">Fill in Your Details</h3>
                  <p className="text-teamax-secondary leading-relaxed">
                    Provide your name, contact number, and delivery address (if applicable). Select your preferred time.
                  </p>
                </div>
              </div>

              {/* Step 6 */}
              <div className="flex gap-6 group hover:translate-x-1 transition-transform">
                <div className="flex-shrink-0 w-12 h-12 bg-teamax-accent rounded-2xl flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-teamax-accent/20 -rotate-1 group-hover:rotate-0 transition-transform">
                  6
                </div>
                <div>
                  <h3 className="text-lg font-bold text-teamax-primary mb-2">Select Payment Method</h3>
                  <p className="text-teamax-secondary leading-relaxed">
                    Choose your payment method (GCash or Cash on Delivery). For GCash payments, scan the QR code and send your payment proof.
                  </p>
                </div>
              </div>

              {/* Step 7 */}
              <div className="flex gap-6 group hover:translate-x-1 transition-transform">
                <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-green-600/20 rotate-3 group-hover:rotate-0 transition-transform">
                  7
                </div>
                <div>
                  <h3 className="text-lg font-bold text-teamax-primary mb-2">Send Order via Messenger</h3>
                  <p className="text-teamax-secondary leading-relaxed mb-4">
                    Click "Send Order" to open Facebook Messenger with your order details. Send the message along with your payment proof (for GCash).
                  </p>
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                    <p className="text-sm font-medium text-green-400">
                      ✅ That's it! We'll confirm your order and get it ready for you.
                    </p>
                  </div>
                </div>
              </div>

              {/* Operating Hours Reminder */}
              <div className="mt-8 p-6 bg-teamax-dark border border-teamax-border rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                  <Clock className="w-24 h-24" />
                </div>
                <h3 className="text-lg font-serif font-bold text-teamax-primary mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teamax-accent" />
                  Operating Hours
                </h3>
                <div className="space-y-2 relative z-10">
                  <p className="text-teamax-primary font-bold">Open Daily: <span className="text-teamax-accent">{siteSettings?.store_hours || '6:00 AM - 10:00 PM'}</span></p>
                  <p className="text-xs text-teamax-secondary uppercase tracking-widest font-bold opacity-60">
                    Your favorite beverages, always fresh.
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowHowToOrder(false)}
                className="w-full py-5 bg-white text-black border-2 border-teamax-accent rounded-2xl hover:brightness-110 transition-all duration-300 font-bold uppercase tracking-widest text-sm shadow-xl shadow-teamax-accent/20 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(Header);
