import { $, component$, useStore, useTask$ } from '@builder.io/qwik';
import {
  Image,
  type ImageTransformerProps,
  useImageProvider,
} from 'qwik-image';
import type * as Contract from '~/contract';

export interface SanityImageProps {
  image: Contract.Image,
  width?: number,
  height?: number,
  maxDim?: number,
  alt: string,
  resolutionsOverride?: number[],
  placeholderColor?: string,
  className?: string;
  fit?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down' | 'inherit' | 'initial';
  layout?: 'fixed' | 'constrained' | 'fullWidth';
}

type Dims = {
  width?: number;
  height?: number;
}

const SanityImage = component$<SanityImageProps>((props) => {

  const store = useStore<Dims>({
    width: props.width,
    height: props.height,
  });

  useTask$((/*{ track }*/) => {
    if (props.maxDim) {
      if (props.image.origWidth > props.image.origHeight) {
        store.width = props.maxDim;
        store.height = props.maxDim * (props.image.origHeight / props.image.origWidth);
      } else {
        store.height = props.maxDim;
        store.width = props.maxDim * (props.image.origWidth / props.image.origHeight);
      }
    }
    // track(() => [props.image]); For some reason, this line causes the dev server to crash with "Missing Object ID for captured object"
  });

  const imageTransformer$ = $(
    ({ /*src,*/ width, height }: ImageTransformerProps): string => {
      return `${props.image.url}?fit=${props.fit || "fill"}${width ? `&w=${Math.round(width)}` : ""}${height ? `&h=${Math.round(height)}` : ""}${props.maxDim ? `&max-w=${props.maxDim}&maxh=${props.maxDim}` : ""}&auto=format`;
    }
  );

  // Global Provider (required)
  useImageProvider({
    // You can set this prop to overwrite default values [3840, 1920, 1280, 960, 640]
    // resolutions: [640],
    imageTransformer$,
    ...(props.resolutionsOverride ? { resolutions: props.resolutionsOverride } : {})
  });

  return (store.width || store.height) ? (
    <Image
      layout={props.layout || 'fixed'} // Note: default is "fixed", which produces an image with fixed, non-responsive resolution
      objectFit={props.objectFit || "cover"}
      width={store.width}
      height={store.height}
      alt={props.alt}
      placeholder={props.placeholderColor}
      class={props.className || ""}
    />
  ) : (
    <div></div>
  );
});


export default SanityImage;