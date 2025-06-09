// src/hooks/useFirebaseImage.ts
import { useState, useEffect } from 'react';
import { getDownloadURL, ref, StorageError } from 'firebase/storage';
import { storage } from '@/lib/firebase'; 


const imageCache = new Map<string, string>();

interface UseFirebaseImageResult {
  imageUrl: string | null;
  isLoading: boolean;
  error: StorageError | Error | null; 
}

export function useFirebaseImage(imagePath: string | null | undefined): UseFirebaseImageResult {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<StorageError | Error | null>(null);

  useEffect(() => {
    // If there's no imagePath, or it's an empty string, don't attempt to fetch.
    if (!imagePath) {
      setImageUrl(null);
      setIsLoading(false);
      setError(new Error("No image path provided.")); 
      return;
    }

    // Check cache first
    if (imageCache.has(imagePath)) {
      setImageUrl(imageCache.get(imagePath)!);
      setIsLoading(false);
      setError(null);
      return;
    }

    let isMounted = true; 

    const fetchImage = async () => {
      if (!isMounted) return;

      setIsLoading(true);
      setError(null);
      setImageUrl(null); 

      try {
        const imageRef = ref(storage, imagePath);
        const url = await getDownloadURL(imageRef);

        if (isMounted) {
          setImageUrl(url);
          imageCache.set(imagePath, url); 
        }
      } catch (err) {
        console.error(`useFirebaseImage: Error fetching image for path: ${imagePath}`, err);
        if (isMounted) {
          if (err instanceof Error) { 
            setError(err);
          } else {
            setError(new Error('An unknown error occurred while fetching the image.'));
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false; 
    };
  }, [imagePath]); 

  return { imageUrl, isLoading, error };
}