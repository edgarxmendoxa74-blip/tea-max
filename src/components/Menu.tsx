import React, { useEffect, useState, useMemo } from 'react';
import { MenuItem, CartItem } from '../types';
import { useCategories } from '../hooks/useCategories';
import MenuItemCard from './MenuItemCard';

// Preload images for better performance
const preloadImages = (items: MenuItem[]) => {
  items.forEach(item => {
    if (item.image) {
      const img = new Image();
      img.src = item.image;
    }
  });
};

interface MenuProps {
  menuItems: MenuItem[];
  addToCart: (item: MenuItem, quantity?: number, variation?: any, addOns?: any[]) => void;
  cartItems: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
}

const Menu: React.FC<MenuProps> = ({ menuItems, addToCart, cartItems, updateQuantity }) => {
  const { categories } = useCategories();
  const [activeCategory, setActiveCategory] = useState('hot-coffee');

  // Preload images when menu items change
  useEffect(() => {
    if (menuItems.length > 0) {
      // Preload images for visible category first
      const visibleItems = menuItems.filter(item => item.category === activeCategory);
      preloadImages(visibleItems);

      // Then preload other images after a short delay
      setTimeout(() => {
        const otherItems = menuItems.filter(item => item.category !== activeCategory);
        preloadImages(otherItems);
      }, 1000);
    }
  }, [menuItems, activeCategory]);

  useEffect(() => {
    if (categories.length > 0) {
      // Set default to dim-sum if it exists, otherwise first category
      const defaultCategory = categories.find(cat => cat.id === 'dim-sum') || categories[0];
      if (!categories.find(cat => cat.id === activeCategory)) {
        setActiveCategory(defaultCategory.id);
      }
    }
  }, [categories, activeCategory]);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const sections = categories.map(cat => document.getElementById(cat.id)).filter(Boolean);
          const scrollPosition = window.scrollY + 200;

          for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            if (section && section.offsetTop <= scrollPosition) {
              setActiveCategory(categories[i].id);
              break;
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categories]);


  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-teamax-primary mb-4">Our Menu</h2>
        </div>

        <div className="space-y-24">
          {categories.map((category) => {
            const categoryItems = useMemo(() =>
              menuItems.filter(item => item.category === category.id),
              [menuItems, category.id]
            );

            if (categoryItems.length === 0) return null;

            return (
              <section
                key={category.id}
                id={category.id}
                className="scroll-mt-32 transition-all duration-500"
              >
                <div className="flex items-center mb-10 border-b border-teamax-border/10 pb-4">
                  <span className="text-4xl mr-4 drop-shadow-sm">{category.icon}</span>
                  <h3 className="text-3xl font-serif font-bold text-black tracking-tight">{category.name}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categoryItems.map((item, index) => {
                    const cartItem = cartItems.find(cartItem => cartItem.id === item.id);
                    return (
                      <div
                        key={item.id}
                        className="animate-scale-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <MenuItemCard
                          item={item}
                          onAddToCart={addToCart}
                          quantity={cartItem?.quantity || 0}
                          onUpdateQuantity={updateQuantity}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </>
  );
};

export default Menu;
