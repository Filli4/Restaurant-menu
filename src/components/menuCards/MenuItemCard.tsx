'use client';

import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import Image from 'next/image';
import { useCartStore, MenuItem } from '@/store/cartStore';
// Import Storage functions and your initialized storage instance
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase'; // Adjust this path if your firebase config is elsewhere

interface MenuItemCardProps {
  item: MenuItem;
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const addToCart = useCartStore((state) => state.addItem);

  // State to hold the fetched image URL from Firebase Storage
  const [firebaseImageUrl, setFirebaseImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Effect to fetch the image URL from Firebase Storage when the item.imageUrl changes
  useEffect(() => {
    // If there's no imageUrl path provided in the item, stop loading and don't fetch
    if (!item.imageUrl) {
      setLoadingImage(false);
      setImageError(true); // Or handle as "no image" case
      return;
    }

    const fetchImage = async () => {
      setLoadingImage(true); // Start loading
      setImageError(false); // Reset error
      setFirebaseImageUrl(null); // Clear previous URL

      try {
        // Create a reference to the file in Firebase Storage using the path from Firestore
        const imageRef = ref(storage, item.imageUrl);

        // Get the download URL for the image
        const url = await getDownloadURL(imageRef);

        // Update the state with the fetched URL
        setFirebaseImageUrl(url);

      } catch (error) {
        console.error(`Error fetching image for path: ${item.imageUrl}`, error);
        setImageError(true); // Indicate that there was an error fetching the image
      } finally {
        setLoadingImage(false); // Finish loading regardless of success or failure
      }
    };

    fetchImage(); // Call the async function to fetch the image

  }, [item.imageUrl]); // Dependency array: re-run this effect whenever item.imageUrl changes

  const handleAddToCart = () => {
    addToCart(item);
    // console.log(`Added ${item.name} to cart`);
  };

  return (
    <div className="h-full w-full bg-white rounded-xl shadow-lg overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-300 ease-in-out">
      {/* Conditionally render based on loading/error/success */}
      {loadingImage ? (
        // Show a loading indicator or placeholder while fetching the URL
        <div className="w-full h-48 sm:h-56 bg-gray-200 animate-pulse flex items-center justify-center rounded-t-xl">
             <p className="text-gray-500 text-sm">Loading Image...</p>
        </div>
      ) : imageError || !firebaseImageUrl ? (
        // Show a fallback if there's an error or no image URL is available
        <div className="w-full h-48 sm:h-56 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center rounded-t-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10m0-9l5.5 5.5L14.5 9l5.5 5.5m-1.086-1.086A2 2 0 1016.5 13H14a2 2 0 00-4 0H7.5a2 2 0 00-1.586.814L4 17" />
          </svg>
        </div>
      ) : (
        // Once firebaseImageUrl is available, use it in the Image component
        <div className="relative w-full h-48 sm:h-56 overflow-hidden rounded-t-xl">
          <Image
            src={firebaseImageUrl} // <-- Use the fetched Download URL here!
            alt={item.name}
            width={500} // Set appropriate dimensions
            height={300} // Set appropriate dimensions
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={parseInt(item.id) < 200} // Example: Prioritize first few images
          />
        </div>
      )}

      {/* ... rest of your card content (name, description, price, button) ... */}
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
