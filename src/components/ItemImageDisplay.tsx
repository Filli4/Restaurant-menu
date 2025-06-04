// src/components/ItemImageDisplay.tsx
'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image'; // Import ImageProps if you want to type the event
import { useFirebaseImage } from '@/hooks/useFirebaseImage';

const DefaultLoadingPlaceholder: React.FC = () => (
  <div className="w-full h-full animate-pulse bg-gray-200 flex items-center justify-center rounded-inherit">
    <p className="text-gray-500 text-xs">Loading...</p>
  </div>
);

const DefaultErrorPlaceholder: React.FC<{ message?: string }> = ({ message }) => (
  <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-center text-gray-400 rounded-inherit">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1/3 w-1/3 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10m0-9l5.5 5.5L14.5 9l5.5 5.5m-1.086-1.086A2 2 0 1016.5 13H14a2 2 0 00-4 0H7.5a2 2 0 00-1.586.814L4 17" />
    </svg>
    <p className="text-xs text-gray-500 px-1">{message || "Image not available"}</p>
  </div>
);

interface ItemImageDisplayProps {
  imagePath: string | null | undefined;
  altText: string;
  sizes: string;
  imageClassName?: string;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  priority?: boolean;
}

const ItemImageDisplay: React.FC<ItemImageDisplayProps> = ({
  imagePath,
  altText,
  sizes,
  imageClassName = "object-cover",
  loadingComponent,
  errorComponent,
  priority = false,
}) => {
  const { imageUrl: firebaseImageUrl, isLoading: loadingImage, error: fetchError } = useFirebaseImage(imagePath);
  const [nextImageLoadError, setNextImageLoadError] = useState(false);

  useEffect(() => {
    setNextImageLoadError(false);
  }, [imagePath]);

  if (loadingImage) {
    return <>{loadingComponent || <DefaultLoadingPlaceholder />}</>;
  }

  if (fetchError || !firebaseImageUrl || nextImageLoadError) {
    let errorMessage = "Image not available";
    if (nextImageLoadError) {
        errorMessage = `Failed to load image: ${altText}`;
    } else if (fetchError) {
        errorMessage = fetchError.message || "Firebase image load failed";
    } else if (imagePath && !firebaseImageUrl) {
        errorMessage = "Image URL not found";
    } else if (!imagePath) {
        errorMessage = "No image path provided";
    }
    return <>{errorComponent || <DefaultErrorPlaceholder message={errorMessage} />}</>;
  }

  return (
    <Image
      src={firebaseImageUrl}
      alt={altText}
      fill
      sizes={sizes}
      className={imageClassName}
      priority={priority}
      // Replace onLoadingComplete with onLoad
      onLoad={(event) => {
        // event is of type React.SyntheticEvent<HTMLImageElement, Event>
        // You might not need the event object for your current logic
        // For example, to get natural dimensions:
        // const { naturalWidth, naturalHeight } = event.currentTarget;
        // console.log(`Image ${altText} loaded with dimensions: ${naturalWidth}x${naturalHeight}`);
        setNextImageLoadError(false); // Reset error if a subsequent load is successful
      }}
      onError={(e) => {
        console.error(`ItemImageDisplay: Next/Image error for ${altText} (URL: ${firebaseImageUrl}):`, (e.target as HTMLImageElement).src);
        setNextImageLoadError(true);
      }}
    />
  );
};

export default ItemImageDisplay;