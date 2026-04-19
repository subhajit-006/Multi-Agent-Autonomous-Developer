'use client';

import { useState, useEffect, useRef } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number;
  root?: null | Element;
  rootMargin?: string;
}

interface UseIntersectionObserverReturn {
  ref: (node: HTMLElement | null) => void;
  isVisible: boolean;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn {
  const { threshold = 0, root = null, rootMargin = '0px' } = options;
  const [isVisible, setIsVisible] = useState(false);
  const [node, setNode] = useState<HTMLElement | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!node) return;

    observer.current = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold,
        root,
        rootMargin,
      }
    );

    observer.current.observe(node);

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [node, threshold, root, rootMargin]);

  const ref = (newNode: HTMLElement | null) => {
    setNode(newNode);
  };

  return { ref, isVisible };
}