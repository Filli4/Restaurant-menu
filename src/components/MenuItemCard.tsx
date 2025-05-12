// src/components/MenuItemCard.tsx
import Image from 'next/image';
import { MenuItem } from '@/types/menu';

interface MenuItemCardProps {
  item: MenuItem;
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-300 ease-in-out">
      {item.imageUrl ? (
        <div className="relative w-full h-48 sm:h-56 overflow-hidden"> {/* Responsive height for image container */}
          <Image
            src={item.imageUrl}
            alt={item.name}
            width={500} // Provide a base width for quality, actual size controlled by CSS & sizes
            height={300} // Provide a base height for quality, actual size controlled by CSS & sizes
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={item.id < 200} // Prioritize LCP images
          />
        </div>
      ) : (
        <div className="w-full h-48 sm:h-56 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center rounded-t-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10m0-9l5.5 5.5L14.5 9l5.5 5.5m-1.086-1.086A2 2 0 1016.5 13H14a2 2 0 00-4 0H7.5a2 2 0 00-1.586.814L4 17" />
          </svg>
        </div>
      )}
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1 truncate" title={item.name}>
          {item.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3 flex-grow line-clamp-3 sm:line-clamp-2">
          {/* line-clamp might need a plugin: npm install -D @tailwindcss/line-clamp, then add require('@tailwindcss/line-clamp') to tailwind.config.js plugins */}
          {item.description}
        </p>
        <div className="mt-auto flex justify-between items-center">
          <p className="text-lg sm:text-xl font-bold text-emerald-600">
            ${item.price.toFixed(2)}
          </p>
          {/* Optional: Add to cart button or other actions */}
          {/* <button className="bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors">
            Add
          </button> */}
        </div>
      </div>
    </div>
  );
}