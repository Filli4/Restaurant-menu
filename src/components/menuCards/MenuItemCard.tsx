// src/components/menuCards/MenuItemCard.tsx
'use client';

import React from 'react';
import { useCartStore, MenuItem } from '@/store/cartStore';
import ItemImageDisplay from '../ItemImageDisplay'; // Adjust path if needed

interface MenuItemCardProps {
  item: MenuItem;
}

// Optional: Define specific placeholders for MenuItemCard if they differ significantly
// from ItemImageDisplay's defaults. For now, we'll rely on ItemImageDisplay's defaults
// or pass custom ones if needed.

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const addToCart = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addToCart(item);
  };

  // Determine the correct 'sizes' prop based on your grid layout
  // Example: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  const imageSizes = "(max-width: 639px) 90vw, (max-width: 1023px) 45vw, (max-width: 1279px) 30vw, 22vw";
  // Adjust these values:
  // - 90vw: Almost full width on small screens (minus padding/margins)
  // - 45vw: Roughly half width for 2 columns (minus gaps)
  // - 30vw: Roughly third width for 3 columns
  // - 22vw: Roughly quarter width for 4 columns

  return (
    <div className="h-full w-full bg-white rounded-xl shadow-lg overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-300 ease-in-out">
      {/* This div is the sized, relative parent for ItemImageDisplay */}
      <div className="relative w-full h-48 sm:h-56 overflow-hidden rounded-t-xl bg-gray-200"> {/* Added bg for loading state */}
        <ItemImageDisplay
          imagePath={item.imageUrl}
          altText={item.name}
          sizes={imageSizes} // Pass the calculated sizes
          imageClassName="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
          priority={parseInt(item.id) < 200} // Assuming item.id is numeric string
          // You can pass custom loading/error components here if needed:
          // loadingComponent={<YourCardLoadingPlaceholder />}
          // errorComponent={<YourCardErrorPlaceholder />}
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
}