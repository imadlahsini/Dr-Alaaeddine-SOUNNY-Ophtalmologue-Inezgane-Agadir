
import { useState, useEffect } from 'react';

/**
 * Custom hook for handling image loading with optional error fallback
 */
export const useImageLoader = (src: string, fallbackSrc?: string) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
      setHasError(false);
    };
    
    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
      if (fallbackSrc) {
        setImageSrc(fallbackSrc);
      }
      console.error(`Failed to load image: ${src}`);
    };
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fallbackSrc]);

  return { imageSrc, isLoading, hasError };
};

/**
 * Helper to construct a proper image path that works in both dev and production
 */
export const getImagePath = (relativePath: string): string => {
  // For assets imported directly in components (works in both dev and prod)
  if (relativePath.startsWith('data:') || relativePath.startsWith('http')) {
    return relativePath;
  }
  
  // For public folder assets (note: this is less reliable across environments)
  if (relativePath.startsWith('/')) {
    return relativePath;
  }
  
  // For relative paths, try to resolve them
  try {
    // This will work for imported assets
    const importedImage = new URL(`../assets/images/${relativePath}`, import.meta.url).href;
    return importedImage;
  } catch (error) {
    console.error(`Error resolving image path: ${relativePath}`, error);
    return relativePath;
  }
};
