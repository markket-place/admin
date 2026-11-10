import { SEO, ImageData } from './seo';
import { StoredRichText } from './richtext';

interface MediaFormats {
  large: ImageFormat;
  small: ImageFormat;
  medium: ImageFormat;
  thumbnail: ImageFormat;
}

export interface Media {
  id: number;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: MediaFormats;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: any | null;
  createdAt: string;
  updatedAt: string;
  documentId: string;
  publishedAt: string;
}

export type URL = {
  id: number;
  label: string;
  url: string;
};

export interface Store {
  id: number;
  title: string;
  slug: string;
  documentId: string;
  description?: StoredRichText;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  stripe_customer_id: string;
  cover: Media;
  logo: ImageData;
  favicon: ImageData;
  urls: URL[],
  seo: SEO;
  slides: ImageData[];
  meta?: {};
  is_headless?: boolean;
};
