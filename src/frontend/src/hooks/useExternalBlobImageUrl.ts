import { useEffect, useState } from 'react';
import { ExternalBlob } from '../backend';

export function useExternalBlobImageUrl(blob: ExternalBlob | undefined | null): string | null {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) {
      setImageUrl(null);
      return;
    }

    // Try to get direct URL first
    const directUrl = blob.getDirectURL();
    if (directUrl) {
      setImageUrl(directUrl);
      return;
    }

    // Fallback to bytes -> Blob -> objectURL
    let objectUrl: string | null = null;
    blob
      .getBytes()
      .then((bytes) => {
        const imageBlob = new Blob([bytes], { type: 'image/jpeg' });
        objectUrl = URL.createObjectURL(imageBlob);
        setImageUrl(objectUrl);
      })
      .catch((error) => {
        console.error('Failed to load image:', error);
        setImageUrl(null);
      });

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [blob]);

  return imageUrl;
}
