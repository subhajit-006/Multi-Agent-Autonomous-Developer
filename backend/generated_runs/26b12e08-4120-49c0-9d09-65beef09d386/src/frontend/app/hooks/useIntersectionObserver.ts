'use client';

import { useState, useEffect, useCallback } from 'react';

type IntersectionObserverOptions = {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
};

type UseIntersectionObserverReturn = {
  observe: (element: Element | null) => void;
  unobserve: (element: Element | null) => void;
  isIntersecting: boolean;
};

const useIntersectionObserver = (
  options?: IntersectionObserverOptions
): UseIntersectionObserverReturn => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [observer, setObserver] = useState<IntersectionObserver | null>(null);

  const handleIntersect: IntersectionObserverCallback = useCallback(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          setIsIntersecting(true);
        } else {
          entry.target.classList.remove('is-visible');
          setIsIntersecting(false);
        }
      });
    },
    []
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      return;
    }

    const observerInstance = new IntersectionObserver(handleIntersect, options);
    setObserver(observerInstance);

    return () => {
      if (observerInstance) {
        observerInstance.disconnect();
      }
    };
  }, [handleIntersect, options]);

  const observe = useCallback(
    (element: Element | null) => {
      if (!observer || !element) return;

      observer.observe(element);
    },
    [observer]
  );

  const unobserve = useCallback(
    (element: Element | null) => {
      if (!observer || !element) return;

      observer.unobserve(element);
    },
    [observer]
  );

  return { observe, unobserve, isIntersecting };
};

export default useIntersectionObserver;