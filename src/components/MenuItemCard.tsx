import React, { useState, memo } from 'react';
import { Plus, Minus, X, ShoppingCart } from 'lucide-react';
import { MenuItem, Variation, AddOn } from '../types';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity?: number, variation?: Variation, addOns?: AddOn[]) => void;
  quantity: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onAddToCart,
  quantity,
  onUpdateQuantity
}) => {
  const [showCustomization, setShowCustomization] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<Variation | undefined>(
    item.variations?.[0]
  );
  const [selectedAddOns, setSelectedAddOns] = useState<(AddOn & { quantity: number })[]>([]);

  const calculatePrice = () => {
    // Use effective price (discounted or regular) as base
    let price = item.effectivePrice || item.basePrice;
    if (selectedVariation) {
      price = (item.effectivePrice || item.basePrice) + selectedVariation.price;
    }
    selectedAddOns.forEach(addOn => {
      price += addOn.price * addOn.quantity;
    });
    return price;
  };

  const handleAddToCart = () => {
    if (item.variations?.length || item.addOns?.length) {
      setShowCustomization(true);
    } else {
      onAddToCart(item, 1);
    }
  };

  const handleCustomizedAddToCart = () => {
    // Convert selectedAddOns back to regular AddOn array for cart
    const addOnsForCart: AddOn[] = selectedAddOns.flatMap(addOn =>
      Array(addOn.quantity).fill({ ...addOn, quantity: undefined })
    );
    onAddToCart(item, 1, selectedVariation, addOnsForCart);
    setShowCustomization(false);
    setSelectedAddOns([]);
  };

  const handleIncrement = () => {
    onUpdateQuantity(item.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      onUpdateQuantity(item.id, quantity - 1);
    }
  };

  const updateAddOnQuantity = (addOn: AddOn, quantity: number) => {
    setSelectedAddOns(prev => {
      const existingIndex = prev.findIndex(a => a.id === addOn.id);

      if (quantity === 0) {
        // Remove add-on if quantity is 0
        return prev.filter(a => a.id !== addOn.id);
      }

      if (existingIndex >= 0) {
        // Update existing add-on quantity
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity };
        return updated;
      } else {
        // Add new add-on with quantity
        return [...prev, { ...addOn, quantity }];
      }
    });
  };

  const groupedAddOns = item.addOns?.reduce((groups, addOn) => {
    const category = addOn.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(addOn);
    return groups;
  }, {} as Record<string, AddOn[]>);

  return (
    <>
      <div className={`bg-teamax-surface rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group animate-scale-in border border-teamax-border ${!item.available ? 'opacity-60' : ''}`}>
        {/* Image Container with Badges */}
        <div className="relative h-48 bg-teamax-dark overflow-hidden">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">☕</div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {item.isOnDiscount && item.discountPrice && (
              <div className="bg-red-100 text-red-600 border border-red-600 text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                SALE
              </div>
            )}
            {item.popular && (
              <div className="bg-white text-black border-2 border-teamax-accent text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                ⭐ POPULAR
              </div>
            )}
          </div>

          {!item.available && (
            <div className="absolute top-3 right-3 bg-red-100 text-red-500 border border-red-500 text-[10px] font-bold px-3 py-1 rounded-full">
              UNAVAILABLE
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-lg font-serif font-bold text-black leading-tight flex-1 pr-2">{item.name}</h4>
            {item.variations && item.variations.length > 0 && (
              <div className="text-[10px] text-teamax-secondary border border-teamax-border px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                {item.variations.length} sizes
              </div>
            )}
          </div>

          <p className={`text-sm mb-6 leading-relaxed line-clamp-2 ${!item.available ? 'text-gray-600' : 'text-teamax-secondary'}`}>
            {!item.available ? 'Currently Unavailable' : item.description}
          </p>

          {/* Pricing Section */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {item.isOnDiscount && item.discountPrice ? (
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-teamax-accent">
                    ₱{item.discountPrice.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-600 line-through">
                    ₱{item.basePrice.toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="text-xl font-bold text-black">
                  ₱{item.basePrice.toFixed(2)}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0">
              {!item.available ? (
                <button
                  disabled
                  className="bg-teamax-light text-gray-500 px-4 py-2 rounded-xl cursor-not-allowed font-bold text-xs uppercase"
                >
                  Sold Out
                </button>
              ) : quantity === 0 ? (
                <button
                  onClick={handleAddToCart}
                  className="bg-white text-black border-2 border-black px-6 py-2.5 rounded-xl hover:bg-black/90 transition-all duration-200 transform hover:scale-105 font-bold text-xs uppercase tracking-widest shadow-lg shadow-black/20"
                >
                  {item.variations?.length || item.addOns?.length ? 'Customize' : 'Add to Cart'}
                </button>
              ) : (
                <div className="flex items-center space-x-3 bg-teamax-dark rounded-xl p-1 border border-teamax-border">
                  <button
                    onClick={handleDecrement}
                    className="p-2 hover:bg-teamax-light rounded-lg transition-colors text-black"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-bold text-black min-w-[20px] text-center">{quantity}</span>
                  <button
                    onClick={handleIncrement}
                    className="p-2 hover:bg-teamax-light rounded-lg transition-colors text-black"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customization Modal */}
      {showCustomization && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-teamax-surface rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl border border-teamax-border">
            <div className="p-6 border-b border-teamax-border flex items-center justify-between">
              <div>
                <h3 className="text-xl font-serif font-bold text-black">Customize {item.name}</h3>
                <p className="text-sm text-teamax-secondary mt-0.5 font-sans">Choose your preferences</p>
              </div>
              <button
                onClick={() => setShowCustomization(false)}
                className="p-2 hover:bg-teamax-light rounded-full transition-colors"
                title="Close"
              >
                <X className="h-6 w-6 text-teamax-secondary" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] custom-scrollbar">
              {/* Size Variations */}
              {item.variations && item.variations.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-xs font-bold text-teamax-secondary uppercase tracking-widest mb-4">Choose Size</h4>
                  <div className="space-y-2">
                    {item.variations.map((variation) => (
                      <label
                        key={variation.id}
                        className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all duration-200 ${selectedVariation?.id === variation.id
                          ? 'border-teamax-accent bg-teamax-accent/10'
                          : 'border-teamax-border hover:border-teamax-secondary bg-teamax-dark/50'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="variation"
                            checked={selectedVariation?.id === variation.id}
                            onChange={() => setSelectedVariation(variation)}
                            className="w-4 h-4 accent-teamax-accent"
                          />
                          <span className="font-medium text-black">{variation.name}</span>
                        </div>
                        <span className="text-teamax-accent font-bold">
                          +₱{variation.price.toFixed(2)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-ons */}
              {groupedAddOns && Object.keys(groupedAddOns).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-teamax-secondary uppercase tracking-widest mb-4">Add-ons</h4>
                  {Object.entries(groupedAddOns).map(([category, addOns]) => (
                    <div key={category} className="mb-4">
                      <h5 className="text-[10px] font-bold text-teamax-secondary mb-3 uppercase tracking-wider opacity-70">
                        {category.replace('-', ' ')}
                      </h5>
                      <div className="space-y-2">
                        {addOns.map((addOn) => {
                          const existing = selectedAddOns.find(a => a.id === addOn.id);
                          return (
                            <div
                              key={addOn.id}
                              className={`flex items-center justify-between p-3 border rounded-2xl transition-all ${existing ? 'border-teamax-accent bg-teamax-accent/5' : 'border-teamax-border bg-teamax-dark/30'
                                }`}
                            >
                              <div className="flex-1">
                                <span className="font-medium text-black text-sm">{addOn.name}</span>
                                {addOn.price > 0 && (
                                  <div className="text-xs text-teamax-accent font-bold">
                                    +₱{addOn.price.toFixed(2)}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center">
                                {existing ? (
                                  <div className="flex items-center space-x-3 bg-teamax-dark rounded-xl p-1 border border-teamax-border">
                                    <button
                                      type="button"
                                      onClick={() => updateAddOnQuantity(addOn, existing.quantity - 1)}
                                      className="p-1 hover:bg-teamax-light rounded-lg text-black"
                                    >
                                      <Minus className="h-3.5 w-3.5" />
                                    </button>
                                    <span className="font-bold text-black text-xs min-w-[16px] text-center">
                                      {existing.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => updateAddOnQuantity(addOn, existing.quantity + 1)}
                                      className="p-1 hover:bg-teamax-light rounded-lg text-black"
                                    >
                                      <Plus className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => updateAddOnQuantity(addOn, 1)}
                                    className="p-2 border border-teamax-border hover:border-teamax-accent rounded-xl text-teamax-secondary hover:text-teamax-accent transition-all"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-teamax-border bg-teamax-dark/50">
              <button
                onClick={handleCustomizedAddToCart}
                className="w-full bg-white text-black border-2 border-black py-4 rounded-2xl hover:bg-black/90 transition-all font-bold flex items-center justify-center space-x-3 shadow-xl transform hover:scale-[1.02] shadow-black/20"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="uppercase tracking-widest text-sm">Add to Cart • ₱{calculatePrice().toFixed(2)}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(MenuItemCard, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.quantity === nextProps.quantity &&
    prevProps.item.available === nextProps.item.available &&
    prevProps.item.basePrice === nextProps.item.basePrice &&
    prevProps.item.effectivePrice === nextProps.item.effectivePrice
  );
});
