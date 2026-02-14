import React from 'react';
import { useCategories } from '../hooks/useCategories';

interface SubNavProps {
  selectedCategory: string;
  onCategoryClick: (categoryId: string) => void;
}

const SubNav: React.FC<SubNavProps> = ({ selectedCategory, onCategoryClick }) => {
  const { categories, loading } = useCategories();

  return (
    <div className="sticky top-20 z-40 bg-teamax-surface/95 backdrop-blur-md border-b border-teamax-border shadow-xl px-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4 overflow-x-auto py-3 scrollbar-hide">
          {loading ? (
            <div className="flex space-x-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-8 w-20 bg-teamax-dark rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <button
                onClick={() => onCategoryClick('all')}
                className={`px-5 py-2 rounded-full text-xs transition-all duration-300 border uppercase tracking-widest font-bold ${selectedCategory === 'all'
                  ? 'bg-white text-black border-2 border-black border-black shadow-lg shadow-black/20 scale-105'
                  : 'bg-teamax-dark text-teamax-secondary border-teamax-border hover:bg-black hover:text-black hover:border-black'
                  }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onCategoryClick(c.id)}
                  className={`px-5 py-2 rounded-full text-xs transition-all duration-300 border flex items-center space-x-2 uppercase tracking-widest font-bold ${selectedCategory === c.id
                    ? 'bg-white text-black border-2 border-black border-black shadow-lg shadow-black/20 scale-105'
                    : 'bg-teamax-dark text-teamax-secondary border-teamax-border hover:bg-black hover:text-black hover:border-black'
                    }`}
                >
                  <span className="text-base">{c.icon}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(SubNav);


