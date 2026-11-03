import type { CSSProperties } from 'react';

export interface SkeletonProps {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  className?: string;
}

export function Skeleton({ width = '100%', height = 16, className = '' }: SkeletonProps) {
  return <span aria-hidden="true" className={`skeleton ${className}`.trim()} style={{ width, height }} />;
}
