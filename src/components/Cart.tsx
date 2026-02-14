import React, { memo } from 'react';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
  cartItems: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  onContinueShopping: () => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({
  cartItems,
  updateQuantity,
  removeFromCart,
  clearCart,
  getTotalPrice,
  onContinueShopping,
  onCheckout
}) => {
  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center py-20 bg-teamax-surface rounded-3xl border border-teamax-border shadow-xl">
          <div className="text-7xl mb-6">🛒</div>
          <h2 className="text-3xl font-serif font-bold text-black mb-2">Your cart is empty</h2>
          <p className="text-teamax-secondary mb-10 max-w-sm mx-auto">Add some delicious items from our menu to get started with your order!</p>
          <button
            onClick={onContinueShopping}
            className="bg-white text-black border-2 border-teamax-accent px-10 py-4 rounded-full hover:brightness-110 transition-all font-bold uppercase tracking-widest text-sm shadow-xl shadow-teamax-accent/20"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 pb-24">
      <div className="flex items-center justify-between mb-10">
        <button
          onClick={onContinueShopping}
          className="flex items-center space-x-2 text-teamax-secondary hover:text-black transition-all group"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          <span className="font-bold uppercase tracking-widest text-xs">Back to Menu</span>
        </button>
        <h1 className="text-4xl font-serif font-bold text-black">Your Cart</h1>
        <button
          onClick={clearCart}
          className="text-red-500 hover:text-red-400 transition-colors font-bold uppercase tracking-widest text-xs"
        >
          Clear All
        </button>
      </div>

      <div className="bg-teamax-surface rounded-3xl shadow-xl overflow-hidden border border-teamax-border mb-8">
        {cartItems.map((item, index) => (
          <div key={item.id} className={`p-8 ${index !== cartItems.length - 1 ? 'border-b border-teamax-border' : ''} hover:bg-white/5 transition-colors`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-serif font-bold text-black mb-2">{item.name}</h3>
                <div className="space-y-1">
                  {item.selectedVariation && (
                    <p className="text-xs text-teamax-secondary font-bold uppercase tracking-wider">Size: <span className="text-teamax-accent">{item.selectedVariation.name}</span></p>
                  )}
                  {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                    <p className="text-xs text-teamax-secondary font-bold uppercase tracking-wider">
                      Add-ons: <span className="text-teamax-accent">{item.selectedAddOns.map(addOn =>
                        addOn.quantity && addOn.quantity > 1
                          ? `${addOn.name} (x${addOn.quantity})`
                          : addOn.name
                      ).join(', ')}</span>
                    </p>
                  )}
                </div>
                <p className="text-lg font-bold text-teamax-accent mt-3">₱{item.totalPrice.toFixed(2)}</p>
              </div>

              <div className="flex items-center justify-between md:justify-end space-x-6">
                <div className="flex items-center space-x-4 bg-teamax-dark rounded-2xl p-1.5 border border-teamax-border">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-2 hover:bg-teamax-light rounded-xl transition-all text-black"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-bold text-black min-w-[32px] text-center text-lg">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-2 hover:bg-teamax-light rounded-xl transition-all text-black"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-right min-w-[100px]">
                  <p className="text-xl font-bold text-black">₱{(item.totalPrice * item.quantity).toFixed(2)}</p>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-3 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                  title="Remove item"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-teamax-surface rounded-3xl shadow-2xl p-8 border border-teamax-border">
        <div className="flex items-center justify-between text-3xl font-serif font-bold text-black mb-8">
          <span>Total:</span>
          <span className="text-teamax-accent">₱{(getTotalPrice() || 0).toFixed(2)}</span>
        </div>

        <button
          onClick={onCheckout}
          className="w-full bg-white text-black border-2 border-teamax-accent py-5 rounded-2xl hover:brightness-110 transition-all font-bold text-lg uppercase tracking-widest shadow-xl shadow-teamax-accent/20"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default memo(Cart);
