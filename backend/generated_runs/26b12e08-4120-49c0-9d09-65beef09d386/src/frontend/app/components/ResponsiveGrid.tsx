'use client';

import { ReactNode, useRef } from 'react';
import useIntersectionObserver from '../hooks/useIntersectionObserver';

interface ResponsiveGridProps {
  children: ReactNode;
  columns?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
  className?: string;
  itemClassName?: string;
  observeItems?: boolean;
}

export default function ResponsiveGrid({
  children,
  columns = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 'gap-6',
  className = '',
  itemClassName = '',
  observeItems = false,
}: ResponsiveGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const { observe } = useIntersectionObserver();

  const getGridClasses = () => {
    const baseClasses = `grid ${gap} ${className}`;
    const columnClasses = `grid-cols-${columns.default}`;

    return `${baseClasses} ${columnClasses}
      ${columns.sm ? `sm:grid-cols-${columns.sm}` : ''}
      ${columns.md ? `md:grid-cols-${columns.md}` : ''}
      ${columns.lg ? `lg:grid-cols-${columns.lg}` : ''}
      ${columns.xl ? `xl:grid-cols-${columns.xl}` : ''}`
      .trim();
  };

  const renderChildren = () => {
    return React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return null;

      const childProps = {
        className: `${itemClassName} ${child.props.className || ''}`.trim(),
        key: child.key || `grid-item-${index}`,
      };

      if (observeItems) {
        return React.cloneElement(child, {
          ...childProps,
          ref: (node: HTMLElement) => {
            observe(node);
            if (child.ref) {
              if (typeof child.ref === 'function') {
                child.ref(node);
              } else if (child.ref && 'current' in child.ref) {
                (child.ref as React.MutableRefObject<HTMLElement>).current = node;
              }
            }
          },
        });
      }

      return React.cloneElement(child, childProps);
    });
  };

  return (
    <div
      ref={(node) => {
        observe(node);
        if (node) gridRef.current = node;
      }}
      className={getGridClasses()}
    >
      {renderChildren()}
    </div>
  );
}