/**
 * Polyfills for cross-browser compatibility
 * This module provides essential polyfills for older browsers
 * while avoiding global namespace pollution
 */

// Polyfill for Element.closest() (IE support)
if (!Element.prototype.closest) {
  Element.prototype.closest = function closest(selector: string): Element | null {
    let el: Element | null = this;
    while (el) {
      if (el.matches(selector)) {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  };
}

// Polyfill for Element.matches() (IE support)
if (!Element.prototype.matches) {
  Element.prototype.matches = (Element.prototype as any).msMatchesSelector ||
    Element.prototype.webkitMatchesSelector;
}

// Polyfill for NodeList.forEach() (IE support)
if (!NodeList.prototype.forEach) {
  NodeList.prototype.forEach = function forEach(callback: (value: Node, index: number, list: NodeList) => void, thisArg?: any): void {
    thisArg = thisArg || window;
    for (let i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}

// Polyfill for Array.from() (IE support)
if (!Array.from) {
  Array.from = (function() {
    const toStr = Object.prototype.toString;
    const isCallable = (fn: any) => typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    const toInteger = (value: any) => {
      const number = Number(value);
      if (isNaN(number)) return 0;
      if (number === 0 || !isFinite(number)) return number;
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    const maxSafeInteger = Math.pow(2, 53) - 1;
    const toLength = (value: any) => Math.min(Math.max(toInteger(value), 0), maxSafeInteger);

    return function from<T>(arrayLike: ArrayLike<T> | Iterable<T>): T[] {
      const C = this;
      const items = Object(arrayLike);
      if (arrayLike == null) {
        throw new TypeError('Array.from requires an array-like object - not null or undefined');
      }

      const mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      let T;
      if (typeof mapFn !== 'undefined') {
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }

        if (arguments.length > 2) {
          T = arguments[2];
        }
      }

      let len = toLength(items.length);
      const A = isCallable(C) ? Object(new C(len)) : new Array(len);
      let k = 0;
      let kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      A.length = len;
      return A;
    };
  })();
}

// Polyfill for Object.entries() (IE support)
if (!Object.entries) {
  Object.entries = function entries<T>(obj: T): [keyof T, T[keyof T]][] {
    const ownProps = Object.keys(obj);
    let i = ownProps.length;
    const resArray = new Array(i);
    while (i--) {
      resArray[i] = [ownProps[i], obj[ownProps[i] as keyof T]];
    }
    return resArray;
  };
}

// Polyfill for Object.values() (IE support)
if (!Object.values) {
  Object.values = function values<T>(obj: T): T[keyof T][] {
    return Object.keys(obj).map(key => obj[key as keyof T]);
  };
}

// Polyfill for String.prototype.startsWith() (IE support)
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function startsWith(search: string, pos?: number): boolean {
    return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
  };
}

// Polyfill for String.prototype.endsWith() (IE support)
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function endsWith(search: string, this_len?: number): boolean {
    if (this_len === undefined || this_len > this.length) {
      this_len = this.length;
    }
    return this.substring(this_len - search.length, this_len) === search;
  };
}

// Polyfill for String.prototype.includes() (IE support)
if (!String.prototype.includes) {
  String.prototype.includes = function includes(search: string, start?: number): boolean {
    if (typeof start !== 'number') {
      start = 0;
    }

    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

// Polyfill for CustomEvent (IE support)
try {
  new CustomEvent('test');
} catch (e) {
  (window as any).CustomEvent = function CustomEvent(event: string, params: CustomEventInit) {
    const evt = document.createEvent('CustomEvent');
    params = params || { bubbles: false, cancelable: false, detail: null };
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  };
  (window as any).CustomEvent.prototype = (window as any).Event.prototype;
}

// Polyfill for IntersectionObserver (with fallback)
let intersectionObserverSupported = false;
try {
  intersectionObserverSupported = 'IntersectionObserver' in window &&
    'IntersectionObserverEntry' in window &&
    'intersectionRatio' in window.IntersectionObserverEntry.prototype;
} catch (e) {
  intersectionObserverSupported = false;
}

if (!intersectionObserverSupported) {
  (window as any).IntersectionObserver = class IntersectionObserver {
    root: Element | null;
    rootMargin: string;
    thresholds: number[];
    callback: IntersectionObserverCallback;
    elements: Array<{ element: Element; callback: IntersectionObserverCallback }>;

    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      this.root = options?.root || null;
      this.rootMargin = options?.rootMargin || '0px';
      this.thresholds = options?.threshold || [0];
      this.callback = callback;
      this.elements = [];

      // Fallback: trigger callback immediately for all observed elements
      this.fallbackCheck = this.fallbackCheck.bind(this);
      window.addEventListener('scroll', this.fallbackCheck);
      window.addEventListener('resize', this.fallbackCheck);
      window.addEventListener('load', this.fallbackCheck);
    }

    observe(element: Element): void {
      this.elements.push({ element, callback: this.callback });
      this.fallbackCheck();
    }

    unobserve(element: Element): void {
      this.elements = this.elements.filter(el => el.element !== element);
    }

    disconnect(): void {
      this.elements = [];
      window.removeEventListener('scroll', this.fallbackCheck);
      window.removeEventListener('resize', this.fallbackCheck);
      window.removeEventListener('load', this.fallbackCheck);
    }

    fallbackCheck(): void {
      this.elements.forEach(({ element, callback }) => {
        const rect = element.getBoundingClientRect();
        const isIntersecting = rect.top < window.innerHeight && rect.bottom > 0;

        callback([{
          target: element,
          intersectionRatio: isIntersecting ? 1 : 0,
          isIntersecting,
          time: Date.now(),
          rootBounds: null,
          boundingClientRect: rect,
          intersectionRect: isIntersecting ? rect : {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          }
        }], this);
      });
    }
  };
}

// Polyfill for requestAnimationFrame
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (function() {
    return window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(callback: FrameRequestCallback) {
        window.setTimeout(callback, 1000 / 60);
      };
  })();
}

// Polyfill for cancelAnimationFrame
if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame = (function() {
    return window.webkitCancelAnimationFrame ||
      window.mozCancelAnimationFrame ||
      window.oCancelAnimationFrame ||
      window.msCancelAnimationFrame ||
      function(id: number) {
        window.clearTimeout(id);
      };
  })();
}

// Polyfill for classList (IE9 support)
if (!('classList' in document.createElement('a'))) {
  (function() {
    const descriptor = {
      get: function() {
        const self = this;
        function update(fn: (classes: string[]) => void) {
          return function(value: string) {
            const classes = self.className.split(/\s+/g);
            fn(classes);
            self.className = classes.join(' ');
          };
        }

        return {
          add: update(function(classes: string[]) {
            const args = Array.prototype.slice.call(arguments);
            args.forEach(function(cls: string) {
              if (classes.indexOf(cls) === -1) {
                classes.push(cls);
              }
            });
          }),
          remove: update(function(classes: string[]) {
            const args = Array.prototype.slice.call(arguments);
            args.forEach(function(cls: string) {
              const index = classes.indexOf(cls);
              if (index !== -1) {
                classes.splice(index, 1);
              }
            });
          }),
          toggle: update(function(classes: string[]) {
            const cls = arguments[0];
            const index = classes.indexOf(cls);
            if (index === -1) {
              classes.push(cls);
            } else {
              classes.splice(index, 1);
            }
          }),
          contains: function(cls: string) {
            return self.className.split(/\s+/g).indexOf(cls) !== -1;
          },
          item: function(index: number) {
            const classes = self.className.split(/\s+/g);
            return classes[index] || null;
          }
        };
      }
    };

    Object.defineProperty(Element.prototype, 'classList', descriptor);
  })();
}

// Export nothing to avoid global pollution
// This file is imported for side effects only