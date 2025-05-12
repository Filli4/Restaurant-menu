// src/components/MenuCategorySection.tsx
import { MenuCategory } from '@/types/menu';
import MenuItemCard from './MenuItemCard';

interface MenuCategorySectionProps {
  category: MenuCategory;
}

export default function MenuCategorySection({ category }: MenuCategorySectionProps) {
  return (
    <section className="mb-12 sm:mb-16">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 border-b-2 border-orange-500 pb-2">
        {category.name}
      </h2>
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Responsive gap might also be good: gap-4 sm:gap-6 md:gap-8 */}
        {category.items.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
        {/* Optional: Add empty divs to fill last row if you want perfect alignment and don't have enough items
            Only useful if you care about the last row items stretching if fewer than grid columns.
            Usually not needed for a dynamic list.
        */}
      </div>
    </section>
  );
}