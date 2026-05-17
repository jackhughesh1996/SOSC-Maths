import { useCallback, useEffect, useRef, useState } from "react";

export function useFullscreen<T extends HTMLElement>() {
  const containerRef = useRef<T | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState<string | null>(null);

  useEffect(() => {
    function syncFullscreenState() {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    }

    document.addEventListener("fullscreenchange", syncFullscreenState);

    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenState);
    };
  }, []);

  const enterFullscreen = useCallback(async () => {
    const element = containerRef.current;
    if (!element) return;

    if (!document.fullscreenEnabled) {
      setFullscreenError("Fullscreen is not enabled in this browser context.");
      return;
    }

    try {
      setFullscreenError(null);
      await element.requestFullscreen({ navigationUI: "hide" });
    } catch (error) {
      setFullscreenError(error instanceof Error ? error.message : "Could not enter fullscreen.");
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) return;

    try {
      setFullscreenError(null);
      await document.exitFullscreen();
    } catch (error) {
      setFullscreenError(error instanceof Error ? error.message : "Could not exit fullscreen.");
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement === containerRef.current) {
      void exitFullscreen();
    } else {
      void enterFullscreen();
    }
  }, [enterFullscreen, exitFullscreen]);

  return {
    containerRef,
    isFullscreen,
    fullscreenError,
    toggleFullscreen,
    enterFullscreen,
    exitFullscreen,
  };
}
