import { useState, useRef, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

/**
 * Lazy-loading image component
 * Only loads image when it enters the viewport
 */
export default function LazyImage({ 
  src, 
  alt, 
  className = '', 
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3C/svg%3E',
  onError 
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px' // Start loading 50px before image enters viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isInView && imageSrc === placeholder) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      img.onerror = () => {
        if (onError && imgRef.current) {
          // Create a synthetic event-like object
          const syntheticEvent = {
            target: imgRef.current,
            currentTarget: imgRef.current,
            preventDefault: () => {},
            stopPropagation: () => {},
            nativeEvent: new Event('error'),
            bubbles: false,
            cancelable: false,
            defaultPrevented: false,
            eventPhase: 0,
            isTrusted: false,
            timeStamp: Date.now(),
            type: 'error'
          } as unknown as React.SyntheticEvent<HTMLImageElement, Event>;
          onError(syntheticEvent);
        }
      };
      img.src = src;
    }
  }, [isInView, src, placeholder, onError, imageSrc]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${!isLoaded ? 'opacity-0 transition-opacity duration-300' : 'opacity-100'}`}
      loading="lazy"
      onError={onError}
    />
  );
}

