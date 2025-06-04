// src/components/menuCards/MenuCategorySection.tsx
import React from 'react'; // Import React
import { MenuCategory, MenuItem } from '@/types/menu';
import MenuItemCard from './MenuItemCard';

interface MenuCategorySectionProps {
  category: MenuCategory;
}

// Using React.memo to prevent re-renders if the category prop hasn't changed.
// This is beneficial if the parent component re-renders for other reasons.
const MenuCategorySection = React.memo(function MenuCategorySection({ category }: MenuCategorySectionProps) {
  console.log(`Rendering Category: ${category.name}`); // For debugging re-renders

  return (
    <section aria-labelledby={`category-title-${category.id}`} className="mb-12 sm:mb-16">
      <h2
        id={`category-title-${category.id}`}
        className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 border-b-2 border-orange-500 pb-2"
      >
        {category.name}
      </h2>
      {category.items.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {category.items.map((item: MenuItem, index: number) => (
            // Pass index to MenuItemCard if you want to set priority based on overall item index
            <MenuItemCard key={item.id} item={item} itemIndexInCategory={index} categoryId={category.id} />
          ))}
        </div>
      ) : (
        <p className="text-gray-600 italic">No items currently available in this category.</p>
      )}
    </section>
  );
});

export default MenuCategorySection;