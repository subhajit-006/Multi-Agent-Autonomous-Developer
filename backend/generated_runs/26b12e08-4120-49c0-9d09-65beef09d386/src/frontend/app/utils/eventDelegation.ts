/**
 * Event Delegation Utilities
 * Efficient event handling for dynamic elements using event delegation pattern
 * Reduces memory usage and improves performance for large DOM trees
 */

import { querySelector, querySelectorAll } from './domHelpers';

type EventDelegationHandler<T extends Event = Event> = (event: T, target: HTMLElement) => void;
type EventDelegationOptions = {
  selector: string;
  handler: EventDelegationHandler;
  useCapture?: boolean;
};

type DelegatedEventListeners = {
  [key: string]: {
    selector: string;
    handler: EventDelegationHandler;
    useCapture: boolean;
  }[];
};

const delegatedListeners: DelegatedEventListeners = {};

/**
 * Add event listener with delegation
 * @param eventType - The event type to listen for
 * @param options - Delegation options including selector and handler
 * @param parent - The parent element to attach the listener to (defaults to document)
 */
export const addDelegatedEventListener = <T extends Event = Event>(
  eventType: string,
  options: EventDelegationOptions,
  parent: HTMLElement | Document = document
): void => {
  if (!delegatedListeners[eventType]) {
    delegatedListeners[eventType] = [];
    parent.addEventListener(eventType, handleDelegatedEvent, options.useCapture || false);
  }

  delegatedListeners[eventType].push({
    selector: options.selector,
    handler: options.handler,
    useCapture: options.useCapture || false
  });
};

/**
 * Remove event listener with delegation
 * @param eventType - The event type to remove
 * @param options - Delegation options including selector and handler
 * @param parent - The parent element to remove the listener from (defaults to document)
 */
export const removeDelegatedEventListener = <T extends Event = Event>(
  eventType: string,
  options: EventDelegationOptions,
  parent: HTMLElement | Document = document
): void => {
  if (!delegatedListeners[eventType]) return;

  delegatedListeners[eventType] = delegatedListeners[eventType].filter(listener => {
    return !(listener.selector === options.selector &&
             listener.handler === options.handler &&
             listener.useCapture === (options.useCapture || false));
  });

  if (delegatedListeners[eventType].length === 0) {
    delete delegatedListeners[eventType];
    parent.removeEventListener(eventType, handleDelegatedEvent, options.useCapture || false);
  }
};

/**
 * Handle delegated events and dispatch to appropriate handlers
 */
function handleDelegatedEvent(event: Event): void {
  const eventType = event.type;
  if (!delegatedListeners[eventType]) return;

  const target = event.target as HTMLElement;
  const currentTarget = event.currentTarget as HTMLElement | Document;

  delegatedListeners[eventType].forEach(listener => {
    const potentialElements = querySelectorAll<HTMLElement>(listener.selector, currentTarget);
    let matchedElement: HTMLElement | null = null;

    // Find the closest matching element in the event path
    let element: HTMLElement | null = target;
    while (element && element !== currentTarget && !matchedElement) {
      if (potentialElements.some(el => el === element)) {
        matchedElement = element;
      }
      element = element.parentElement;
    }

    if (matchedElement) {
      listener.handler(event as any, matchedElement);
    }
  });
}

/**
 * Add multiple delegated event listeners
 * @param eventConfig - Object mapping event types to their delegation options
 * @param parent - The parent element to attach listeners to
 */
export const addDelegatedEventListeners = (
  eventConfig: Record<string, EventDelegationOptions>,
  parent: HTMLElement | Document = document
): void => {
  Object.entries(eventConfig).forEach(([eventType, options]) => {
    addDelegatedEventListener(eventType, options, parent);
  });
};

/**
 * Remove multiple delegated event listeners
 * @param eventConfig - Object mapping event types to their delegation options
 * @param parent - The parent element to remove listeners from
 */
export const removeDelegatedEventListeners = (
  eventConfig: Record<string, EventDelegationOptions>,
  parent: HTMLElement | Document = document
): void => {
  Object.entries(eventConfig).forEach(([eventType, options]) => {
    removeDelegatedEventListener(eventType, options, parent);
  });
};

/**
 * Clear all delegated event listeners for a specific event type
 * @param eventType - The event type to clear
 * @param parent - The parent element to clear listeners from
 */
export const clearDelegatedEventListeners = (
  eventType: string,
  parent: HTMLElement | Document = document
): void => {
  if (delegatedListeners[eventType]) {
    parent.removeEventListener(eventType, handleDelegatedEvent);
    delete delegatedListeners[eventType];
  }
};

/**
 * Clear all delegated event listeners
 * @param parent - The parent element to clear all listeners from
 */
export const clearAllDelegatedEventListeners = (
  parent: HTMLElement | Document = document
): void => {
  Object.keys(delegatedListeners).forEach(eventType => {
    parent.removeEventListener(eventType, handleDelegatedEvent);
  });
  Object.keys(delegatedListeners).forEach(key => delete delegatedListeners[key]);
};

// Export all functions as named exports
export {
  addDelegatedEventListener as on,
  removeDelegatedEventListener as off,
  addDelegatedEventListeners as onMultiple,
  removeDelegatedEventListeners as offMultiple,
  clearDelegatedEventListeners as clear,
  clearAllDelegatedEventListeners as clearAll
};