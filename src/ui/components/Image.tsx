import { AppsIcon } from '../misc/Icons';
import React from 'react';

interface ImgHTMLAttributes {
  alt?: string;
  crossOrigin?: 'anonymous' | 'use-credentials' | '';
  decoding?: 'async' | 'auto' | 'sync';
  height?: number | string;
  loading?: 'eager' | 'lazy';
  sizes?: string;
  src?: string;
  srcSet?: string;
  useMap?: string;
  width?: number | string;
  className?: string;
}

export default (props: ImgHTMLAttributes) => {
  return (
    <img
      {...props}
      onError={(e) => {
        (e.target as HTMLImageElement).onerror = null;
        (e.target as HTMLImageElement).src = AppsIcon;
      }}
    />
  );
};
