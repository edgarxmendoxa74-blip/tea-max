import React, { memo, useState } from 'react';
import { ShoppingCart, HelpCircle, X } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ cartItemsCount, onCartClick, onMenuClick }) => {
  const { siteSettings, loading } = useSiteSettings();
  const [showHowToOrder, setShowHowToOrder] = useState(false);

  return (
    <>
    <header className="sticky top-0 z-50 bg-gradient-to-r from-natalna-primary via-natalna-wood to-natalna-primary backdrop-blur-md border-b border-natalna-wood shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <button 
            onClick={onMenuClick}
            className="flex items-center space-x-3 text-natalna-cream hover:text-white transition-colors duration-200"
          >
            {loading ? (
              <div className="w-14 h-14 bg-natalna-secondary/30 rounded-full animate-pulse" />
            ) : (
              <img 
                src={siteSettings?.site_logo || "/logo.jpg"} 
                alt={siteSettings?.site_name || "Natalna's Restaurant"}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-natalna-gold shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = "/logo.jpg";
                }}
              />
            )}
            <div className="flex flex-col items-start">
              <h1 className="text-2xl font-serif font-bold text-natalna-gold">
              {loading ? (
                  <div className="w-32 h-7 bg-natalna-secondary/30 rounded animate-pulse" />
              ) : (
                  "Natalna's"
              )}
            </h1>
              <span className="text-sm text-natalna-cream font-sans">Restaurant</span>
            </div>
          </button>

          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowHowToOrder(true)}
              className="px-4 py-2 bg-natalna-gold text-natalna-dark hover:bg-yellow-500 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              <HelpCircle className="h-5 w-5" />
              <span className="font-medium hidden sm:inline">How to Order</span>
            </button>
            <button 
              onClick={onCartClick}
              className="relative px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="font-medium">Cart</span>
              {cartItemsCount > 0 && (
                <span className="bg-white text-green-700 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce-gentle">
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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowHowToOrder(false)}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-gradient-to-r from-natalna-primary to-natalna-wood p-6 border-b border-natalna-beige flex justify-between items-center">
            <h2 className="text-2xl font-serif font-bold text-white">How to Order</h2>
            <button
              onClick={() => setShowHowToOrder(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-natalna-gold rounded-full flex items-center justify-center text-natalna-dark font-bold text-lg">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold text-natalna-dark mb-2">Browse Our Menu</h3>
                <p className="text-gray-600">
                  Explore our delicious menu items by scrolling through the page or selecting a category from the navigation bar.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-natalna-gold rounded-full flex items-center justify-center text-natalna-dark font-bold text-lg">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold text-natalna-dark mb-2">Add Items to Cart</h3>
                <p className="text-gray-600">
                  Click on any menu item to view details. Select your preferred size (if available), add any extras, and click "Add to Cart".
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-natalna-gold rounded-full flex items-center justify-center text-natalna-dark font-bold text-lg">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold text-natalna-dark mb-2">Review Your Cart</h3>
                <p className="text-gray-600">
                  Click the green "Cart" button to review your items. You can adjust quantities or remove items before checkout.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-natalna-gold rounded-full flex items-center justify-center text-natalna-dark font-bold text-lg">
                4
              </div>
              <div>
                <h3 className="text-lg font-semibold text-natalna-dark mb-2">Choose Service Type</h3>
                <p className="text-gray-600 mb-2">
                  Select your preferred service type:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li><strong>Delivery</strong> - We'll bring it to your doorstep</li>
                  <li><strong>Pickup</strong> - Grab your order at our restaurant</li>
                  <li><strong>Dine-in</strong> - Enjoy your meal at our place</li>
                </ul>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-natalna-gold rounded-full flex items-center justify-center text-natalna-dark font-bold text-lg">
                5
              </div>
              <div>
                <h3 className="text-lg font-semibold text-natalna-dark mb-2">Fill in Your Details</h3>
                <p className="text-gray-600">
                  Provide your name, contact number, and delivery address (if applicable). Select your preferred time.
                </p>
              </div>
            </div>

            {/* Step 6 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-natalna-gold rounded-full flex items-center justify-center text-natalna-dark font-bold text-lg">
                6
              </div>
              <div>
                <h3 className="text-lg font-semibold text-natalna-dark mb-2">Select Payment Method</h3>
                <p className="text-gray-600">
                  Choose your payment method (GCash or Cash on Delivery). For GCash payments, scan the QR code and send your payment proof.
                </p>
              </div>
            </div>

            {/* Step 7 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-natalna-gold rounded-full flex items-center justify-center text-natalna-dark font-bold text-lg">
                7
              </div>
              <div>
                <h3 className="text-lg font-semibold text-natalna-dark mb-2">Send Order via Messenger</h3>
                <p className="text-gray-600 mb-2">
                  Click "Send Order" to open Facebook Messenger with your order details. Send the message along with your payment proof (for GCash).
                </p>
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✅ <strong>That's it!</strong> We'll confirm your order and get it ready for you.
                  </p>
                </div>
              </div>
            </div>

            {/* Operating Hours Reminder */}
            <div className="mt-6 p-4 bg-natalna-cream border-2 border-natalna-gold rounded-lg">
              <h3 className="text-lg font-serif font-semibold text-natalna-dark mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-natalna-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Operating Hours
              </h3>
              <p className="text-natalna-dark">
                <strong>Open Daily:</strong> 6:00 AM - 10:00 PM
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Breakfast (6-10 AM) • Lunch (11 AM-2 PM) • Dinner (5-10 PM)
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowHowToOrder(false)}
              className="w-full py-3 bg-gradient-to-r from-natalna-primary to-natalna-wood text-white rounded-lg hover:from-natalna-wood hover:to-natalna-wood transition-all duration-200 font-medium shadow-md"
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