/**
 * DOM Helper Utilities
 * Collection of utility functions for common DOM manipulations
 * and browser compatibility helpers
 */

// Helper to safely query DOM elements with null checks
export const querySelector = <T extends HTMLElement = HTMLElement>(
  selector: string,
  parent: HTMLElement | Document = document
): T | null => {
  return parent.querySelector<T>(selector);
};

// Helper to safely query multiple DOM elements
export const querySelectorAll = <T extends HTMLElement = HTMLElement>(
  selector: string,
  parent: HTMLElement | Document = document
): NodeListOf<T> => {
  return parent.querySelectorAll<T>(selector);
};

// Add multiple classes to an element
export const addClasses = (element: HTMLElement | null, ...classes: string[]): void => {
  if (!element) return;
  element.classList.add(...classes);
};

// Remove multiple classes from an element
export const removeClasses = (element: HTMLElement | null, ...classes: string[]): void => {
  if (!element) return;
  element.classList.remove(...classes);
};

// Toggle classes on an element
export const toggleClasses = (element: HTMLElement | null, ...classes: string[]): void => {
  if (!element) return;
  classes.forEach(cls => element.classList.toggle(cls));
};

// Check if element has all specified classes
export const hasClasses = (element: HTMLElement | null, ...classes: string[]): boolean => {
  if (!element) return false;
  return classes.every(cls => element.classList.contains(cls));
};

// Get or set data attribute
export const data = (element: HTMLElement | null, name: string, value?: string): string | null | undefined => {
  if (!element) return undefined;
  if (value !== undefined) {
    element.setAttribute(`data-${name}`, value);
    return value;
  }
  return element.getAttribute(`data-${name}`);
};

// Check if element is in viewport
export const isInViewport = (element: HTMLElement | null): boolean => {
  if (!element) return false;

  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// Smooth scroll to element or position
export const smoothScroll = (
  target: HTMLElement | string | number,
  options: ScrollToOptions = { behavior: 'smooth' }
): void => {
  if (typeof target === 'number') {
    window.scrollTo({ top: target, ...options });
  } else if (typeof target === 'string') {
    const element = querySelector<HTMLElement>(target);
    if (element) {
      const offset = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: offset, ...options });
    }
  } else if (target instanceof HTMLElement) {
    const offset = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: offset, ...options });
  }
};

// Create element with attributes and children
export const createElement = <T extends HTMLElement = HTMLElement>(
  tag: string,
  attributes: Record<string, string> = {},
  children: (HTMLElement | string)[] = []
): T => {
  const element = document.createElement(tag) as T;

  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  // Append children
  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  });

  return element;
};

// Insert element after another element
export const insertAfter = (newElement: HTMLElement, referenceElement: HTMLElement): void => {
  if (referenceElement.nextSibling) {
    referenceElement.parentNode?.insertBefore(newElement, referenceElement.nextSibling);
  } else {
    referenceElement.parentNode?.appendChild(newElement);
  }
};

// Remove all children from an element
export const emptyElement = (element: HTMLElement | null): void => {
  if (!element) return;
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
};

// Get scroll position
export const getScrollPosition = (): { x: number; y: number } => {
  return {
    x: window.pageXOffset || document.documentElement.scrollLeft,
    y: window.pageYOffset || document.documentElement.scrollTop
  };
};

// Set scroll position
export const setScrollPosition = (x: number, y: number): void => {
  window.scrollTo(x, y);
};

// Get viewport dimensions
export const getViewportDimensions = (): { width: number; height: number } => {
  return {
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight
  };
};

// Check if element has a specific parent
export const hasParent = (element: HTMLElement | null, parentSelector: string): boolean => {
  if (!element) return false;

  let current = element.parentElement;
  while (current) {
    if (current.matches(parentSelector)) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
};

// Trigger custom event
export const triggerEvent = (element: HTMLElement | null, eventName: string, detail?: any): void => {
  if (!element) return;

  let event;
  try {
    event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      cancelable: true
    });
  } catch (e) {
    // Fallback for older browsers
    event = document.createEvent('CustomEvent');
    (event as any).initCustomEvent(eventName, true, true, detail);
  }

  element.dispatchEvent(event);
};

// Debounce function
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  wait: number
): ((...args: Parameters<F>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function(...args: Parameters<F>): void {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => func(...args), wait);
  };
};

// Throttle function
export const throttle = <F extends (...args: any[]) => any>(
  func: F,
  limit: number
): ((...args: Parameters<F>) => void) => {
  let lastFunc: ReturnType<typeof setTimeout> | null = null;
  let lastRan = 0;

  return function(...args: Parameters<F>): void {
    if (!lastRan) {
      func(...args);
      lastRan = Date.now();
    } else {
      if (lastFunc) {
        clearTimeout(lastFunc);
      }
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

// Get all siblings of an element
export const getSiblings = (element: HTMLElement | null): HTMLElement[] => {
  if (!element || !element.parentNode) return [];

  return Array.from(element.parentNode.children).filter(
    (child) => child !== element
  ) as HTMLElement[];
};

// Check if element is visible (display !== 'none' and visibility !== 'hidden')
export const isVisible = (element: HTMLElement | null): boolean => {
  if (!element) return false;

  const style = window.getComputedStyle(element);
  return style.display !== 'none' &&
         style.visibility !== 'hidden' &&
         style.opacity !== '0';
};

// Get the closest scrollable parent
export const getScrollableParent = (element: HTMLElement | null): HTMLElement | null => {
  if (!element) return null;

  let current: HTMLElement | null = element;
  while (current && current !== document.body) {
    const style = window.getComputedStyle(current);
    if (style.overflowY === 'scroll' || style.overflowY === 'auto') {
      return current;
    }
    current = current.parentElement;
  }

  return document.scrollingElement as HTMLElement || document.documentElement;
};

// Check if element is focused or contains focus
export const hasFocus = (element: HTMLElement | null): boolean => {
  if (!element) return false;

  return element === document.activeElement ||
         element.contains(document.activeElement);
};

// Get all elements that match selector up the DOM tree
export const getParents = (element: HTMLElement | null, selector: string): HTMLElement[] => {
  if (!element) return [];

  const parents: HTMLElement[] = [];
  let current: HTMLElement | null = element.parentElement;

  while (current && current !== document.body) {
    if (current.matches(selector)) {
      parents.push(current);
    }
    current = current.parentElement;
  }

  return parents;
};

// Export all functions as named exports
export {
  querySelector as q,
  querySelectorAll as qa,
  addClasses as add,
  removeClasses as remove,
  toggleClasses as toggle,
  hasClasses as has,
  data as attr,
  isInViewport as inViewport,
  smoothScroll as scrollTo,
  createElement as create,
  insertAfter as after,
  emptyElement as empty,
  getScrollPosition as scrollPos,
  setScrollPosition as setScroll,
  getViewportDimensions as viewport,
  hasParent as parent,
  triggerEvent as trigger,
  debounce,
  throttle,
  getSiblings as siblings,
  isVisible,
  getScrollableParent as scrollParent,
  hasFocus,
  getParents as parents
};