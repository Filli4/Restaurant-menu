// src/components/menuCards/MenuCategorySection.tsx
import { MenuCategory, MenuItem } from '@/types/menu'; // MenuItem might not be strictly needed here if only passing through
import MenuItemCard from './MenuItemCard';

interface MenuCategorySectionProps {
  category: MenuCategory;
}

export default function MenuCategorySection({ category }: MenuCategorySectionProps) {
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
          {category.items.map((item: MenuItem) => ( // Explicitly type item here if needed
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="text-gray-600 italic">No items currently available in this category.</p>
      )}
    </section>
  );
}