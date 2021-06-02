import { AppsIcon, DefaultCoin } from '../misc/Icons';
import React, { CSSProperties, ReactEventHandler } from 'react';

interface ImgHTMLAttributes {
  alt?: string;
  id?: string;
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
  defaultType?: 'app' | 'nft';
  onLoad?: ReactEventHandler<HTMLImageElement>;
  style?: CSSProperties;
}

export default (props: ImgHTMLAttributes) => {
  const imgProps = { ...props };
  delete imgProps.defaultType;

  return (
    <img
      {...imgProps}
      onError={(e) => {
        (e.target as HTMLImageElement).onerror = null;
        (e.target as HTMLImageElement).src = props.defaultType === 'nft' ? DefaultCoin : AppsIcon;
      }}
    />
  );
};
