// src/components/menuCards/MenuItemCard.tsx
'use client';

import React from 'react'; // Import React
import { useCartStore, MenuItem } from '@/store/cartStore';
import ItemImageDisplay from '../ItemImageDisplay';

interface MenuItemCardProps {
  item: MenuItem;
  itemIndexInCategory: number; // Index of the item within its category
  categoryId: string;         // ID of the category (e.g., 'Appetizers')
}

// Using React.memo for MenuItemCard as it's rendered in a list
// and can prevent re-renders if individual item props haven't changed.
const MenuItemCard = React.memo(function MenuItemCard({ item, itemIndexInCategory, categoryId }: MenuItemCardProps) {
  const addToCart = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addToCart(item);
  };

  const imageSizes = "(max-width: 639px) 90vw, (max-width: 1023px) 45vw, (max-width: 1279px) 30vw, 22vw";

  // Determine image priority:
  // Example: Prioritize the first 1-2 items in the very first category shown.
  // This is a heuristic and might need adjustment based on your typical first category.
  // Assumes categories are rendered in a somewhat stable order.
  const isPriorityImage = categoryId === "Appetizers" && itemIndexInCategory < 2; // Prioritize first 2 appetizers


  return (
    <div className="h-full w-full bg-white rounded-xl shadow-lg overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-300 ease-in-out">
      <div className="relative w-full h-48 sm:h-56 overflow-hidden rounded-t-xl bg-gray-200">
        <ItemImageDisplay
          imagePath={item.imageUrl}
          altText={item.name}
          sizes={imageSizes}
          imageClassName="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
          priority={isPriorityImage}
        />
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1 truncate" title={item.name}>
          {item.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3 flex-grow line-clamp-3 sm:line-clamp-4 leading-relaxed">
          {item.description}
        </p>
        <div className="mt-auto flex justify-between items-center pt-2">
          <p className="text-lg sm:text-xl font-bold text-emerald-600">
            ${item.price.toFixed(2)}
          </p>
          <button
            onClick={handleAddToCart}
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 active:bg-orange-700"
            aria-label={`Add ${item.name} to cart`}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
});

export default MenuItemCard;