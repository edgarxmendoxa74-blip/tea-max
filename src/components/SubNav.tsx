import React from 'react';
import { useCategories } from '../hooks/useCategories';

interface SubNavProps {
  selectedCategory: string;
  onCategoryClick: (categoryId: string) => void;
}

const SubNav: React.FC<SubNavProps> = ({ selectedCategory, onCategoryClick }) => {
  const { categories, loading } = useCategories();

  return (
    <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-md border-b border-natalna-beige shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4 overflow-x-auto py-3 scrollbar-hide">
          {loading ? (
            <div className="flex space-x-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <button
                onClick={() => onCategoryClick('all')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors duration-200 border font-medium ${
                  selectedCategory === 'all'
                    ? 'bg-natalna-primary text-white border-natalna-primary shadow-md'
                    : 'bg-white text-natalna-dark border-natalna-beige hover:border-natalna-primary hover:bg-natalna-cream'
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onCategoryClick(c.id)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors duration-200 border flex items-center space-x-2 font-medium ${
                    selectedCategory === c.id
                      ? 'bg-natalna-primary text-white border-natalna-primary shadow-md'
                      : 'bg-white text-natalna-dark border-natalna-beige hover:border-natalna-primary hover:bg-natalna-cream'
                  }`}
                >
                  <span>{c.icon}</span>
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

export default SubNav;


