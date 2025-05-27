// src/components/ItemImageDisplay.tsx
'use client';

import React, { ReactNode } from 'react';
import Image from 'next/image';
import { useFirebaseImage } from '@/hooks/useFirebaseImage';

// Define Default Placeholders (can be overridden by props)
const DefaultLoadingPlaceholder: React.FC = () => (
  <div className="w-full h-full animate-pulse bg-gray-200 flex items-center justify-center rounded-inherit"> {/* Inherit border-radius */}
    <p className="text-gray-500 text-xs">Loading...</p>
  </div>
);

const DefaultErrorPlaceholder: React.FC<{ message?: string }> = ({ message }) => (
  <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-center text-gray-400 rounded-inherit"> {/* Inherit border-radius */}
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1/3 w-1/3 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10m0-9l5.5 5.5L14.5 9l5.5 5.5m-1.086-1.086A2 2 0 1016.5 13H14a2 2 0 00-4 0H7.5a2 2 0 00-1.586.814L4 17" />
    </svg>
    <p className="text-xs text-gray-500 px-1">{message || "Image not available"}</p>
  </div>
);

interface ItemImageDisplayProps {
  imagePath: string | null | undefined;
  altText: string;
  sizes: string; // REQUIRED: For Next/Image optimization with fill
  imageClassName?: string; // Class for the Next/Image component itself (e.g., object-fit, transitions)
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  priority?: boolean;
  // Note: The parent component is responsible for creating a sized, relatively positioned container.
}

const ItemImageDisplay: React.FC<ItemImageDisplayProps> = ({
  imagePath,
  altText,
  sizes,
  imageClassName = "object-cover", // Default to object-cover
  loadingComponent,
  errorComponent,
  priority = false,
}) => {
  const { imageUrl: firebaseImageUrl, isLoading: loadingImage, error: fetchError } = useFirebaseImage(imagePath);

  if (loadingImage) {
    return <>{loadingComponent || <DefaultLoadingPlaceholder />}</>;
  }

  if (fetchError || !firebaseImageUrl) {
    const errorMessage = fetchError ? (fetchError.message || "Image load failed") : (imagePath ? "Image not found" : "No image path");
    return <>{errorComponent || <DefaultErrorPlaceholder message={errorMessage} />}</>;
  }

  return (
    <Image
      src={firebaseImageUrl}
      alt={altText}
      fill // Use boolean fill prop
      sizes={sizes} // Pass the sizes prop here
      className={imageClassName} // Apply provided class names for object-fit, transitions, etc.
      priority={priority}
      onError={(e) => {
        console.error(`ItemImageDisplay: Next/Image error for ${altText} (URL: ${firebaseImageUrl}):`, (e.target as HTMLImageElement).src);
        // If Next/Image itself fails after URL is fetched, you might want to re-render the error component.
        // This would require adding a local state to ItemImageDisplay to track Next/Image specific errors.
      }}
    />
  );
};

export default ItemImageDisplay;