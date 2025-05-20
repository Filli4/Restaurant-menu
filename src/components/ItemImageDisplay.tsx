// src/components/ItemImageDisplay.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '@/lib/firebase'; // Your initialized Firebase storage instance

interface ItemImageDisplayProps {
  imagePath: string | null | undefined;
  itemName: string;
  size: number; // The desired square size (e.g., 60 or 70)
  className?: string; // Optional additional classes for the container
}

const ItemImageDisplay: React.FC<ItemImageDisplayProps> = ({
  imagePath,
  itemName,
  size,
  className = '',
}) => {
  const [firebaseImageUrl, setFirebaseImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!imagePath) {
      setLoadingImage(false);
      setImageError(true);
      return;
    }

    let isMounted = true;
    const fetchImage = async () => {
      if (!isMounted) return;
      setLoadingImage(true);
      setImageError(false);
      setFirebaseImageUrl(null);
      try {
        const imageRef = ref(storage, imagePath);
        const url = await getDownloadURL(imageRef);
        if (isMounted) {
          setFirebaseImageUrl(url);
        }
      } catch (error) {
        console.error(`ItemImageDisplay: Error fetching image for ${itemName} (path: ${imagePath})`, error);
        if (isMounted) {
          setImageError(true);
        }
      } finally {
        if (isMounted) {
          setLoadingImage(false);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
    };
  }, [imagePath, itemName]);

  const placeholder = (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-1/2 w-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10m0-9l5.5 5.5L14.5 9l5.5 5.5m-1.086-1.086A2 2 0 1016.5 13H14a2 2 0 00-4 0H7.5a2 2 0 00-1.586.814L4 17" />
      </svg>
    </div>
  );

  return (
    <div
      className={`flex-shrink-0 overflow-hidden rounded-md relative bg-gray-200 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {loadingImage ? (
        <div className="w-full h-full animate-pulse bg-gray-300"></div>
      ) : imageError || !firebaseImageUrl ? (
        placeholder
      ) : (
        <Image
          src={firebaseImageUrl}
          alt={itemName}
          layout="fill"
          objectFit="cover"
          onError={(e) => {
            console.error(`ItemImageDisplay: Next/Image error for ${itemName}: ${firebaseImageUrl}`, (e.target as HTMLImageElement).src);
          }}
        />
      )}
    </div>
  );
};

export default ItemImageDisplay;