import { useState, useCallback, useLayoutEffect, useRef } from 'react';

interface Size {
  width: number;
  height: number;
}

export function useElementSize<T extends HTMLElement = HTMLDivElement>() {
  const [ref, setRef] = useState<T | null>(null);
  const [size, setSize] = useState<Size>({
    width: 0,
    height: 0,
  });

  const rafRef = useRef<number | null>(null);

  const handleSize = useCallback(() => {
    if (ref) {
      const { offsetWidth, offsetHeight } = ref;
      
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        setSize((prev) => {
          const nextWidth = Math.floor(offsetWidth);
          const nextHeight = Math.floor(offsetHeight);
          
          if (prev.width === nextWidth && prev.height === nextHeight) {
            return prev;
          }
          
          return {
            width: nextWidth,
            height: nextHeight,
          };
        });
        rafRef.current = null;
      });
    }
  }, [ref]);

  useLayoutEffect(() => {
    if (!ref) return;

    const observer = new ResizeObserver(handleSize);
    observer.observe(ref);

    return () => {
      observer.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [ref, handleSize]);

  return { setRef, size };
}
