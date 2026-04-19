export const API_ENDPOINTS = {
  HEALTH: '/api/v1/health',
  FORM_SUBMIT: '/api/v1/forms/submit',
  FORM_SUBMISSIONS: '/api/v1/forms/submissions',
};

export const APP_CONFIG = {
  APP_NAME: 'Self-Contained Landing Page',
  APP_DESCRIPTION: 'A single-file HTML landing page with embedded CSS and JavaScript, designed for portability, easy deployment, and no external dependencies.',
  DEFAULT_LOCALE: 'en_US',
};

export const FORM_CONFIG = {
  EMAIL_FIELD_NAME: 'email',
  SUBMIT_BUTTON_TEXT: 'Subscribe',
  SUBMITTING_BUTTON_TEXT: 'Submitting...',
  SUCCESS_MESSAGE: 'Subscription successful!',
  ERROR_MESSAGE: 'An error occurred. Please try again.',
};

export const ANIMATION_CONFIG = {
  INTERSECTION_THRESHOLD: 0.1,
  TRANSITION_DURATION: '0.3s',
  TRANSITION_TIMING: 'ease-in-out',
};

export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  XXL: '1536px',
};

export const SOCIAL_LINKS = [
  { id: 1, name: 'GitHub', href: 'https://github.com', icon: 'github' },
  { id: 2, name: 'Twitter', href: 'https://twitter.com', icon: 'twitter' },
  { id: 3, name: 'LinkedIn', href: 'https://linkedin.com', icon: 'linkedin' },
];

export const NAV_LINKS = [
  { id: 1, name: 'Features', href: '#features' },
  { id: 2, name: 'Pricing', href: '#pricing' },
  { id: 3, name: 'Documentation', href: '#docs' },
  { id: 4, name: 'Contact', href: '#contact' },
];

export const FEATURES_DATA = [
  {
    id: 1,
    title: 'Semantic HTML5',
    description: 'Built with clean, accessible markup following modern web standards.',
  },
  {
    id: 2,
    title: 'Embedded CSS',
    description: 'Modern layouts with Flexbox and Grid, all contained in a single file.',
  },
  {
    id: 3,
    title: 'Responsive Design',
    description: 'Adapts seamlessly to all devices with media queries and relative units.',
  },
  {
    id: 4,
    title: 'JavaScript Interactivity',
    description: 'Basic form handling and animations for enhanced user experience.',
  },
  {
    id: 5,
    title: 'Optimized Assets',
    description: 'Inline SVGs and minified resources for maximum performance.',
  },
  {
    id: 6,
    title: 'Accessibility Compliant',
    description: 'ARIA labels, semantic HTML, and keyboard navigation support.',
  },
];