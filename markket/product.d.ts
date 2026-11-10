import { Store } from "./store";
import { SEO, ImageData } from "./seo";
import { Tag } from "./tag";

export interface Extras {
  key: string;
  content: Record<string, any>;
  meta: Record<string, any>;
  active: boolean;
}

export interface Price {
  id: number;
  price: number;
  currency: string;
  stripe_id: string;
  description: string;
  inventory?: number;
  count: number;
  name: string;
  hidden: boolean;
  ships_to?: string[];
  extensions?: unknown[];
  billing_type?: string;
  billing_interval?: string;
  billing_interval_count?: number;
}

export interface ImageFormat {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path: null | string;
  size: number;
  width: number;
  height: number;
  sizeInBytes: number;
  alternativeText?: string;
}

export interface ImageFormats {
  large?: ImageFormat;
  small?: ImageFormat;
  medium?: ImageFormat;
  thumbnail?: ImageFormat;
}

export interface Slide {
  id: number;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: ImageFormats;
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

export interface Product {
  id: number;
  name: string;
  usd_price: number | null;
  description: string | null;
  quantity: number | null;
  active: boolean | null;
  attributes: any | null;
  sku: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  tiendaPublication?: { visibleStatus?: 'published' | 'draft' | 'unpublished'; publishedAt?: string | null };
  locale: string;
  slug: string;
  documentId: string;
  amountSold: number | null;
  slides: Slide[];
  seo?: SEO;
  prices?: Price[];
  thumbnail?: ImageData;
  stores?: Store[];
  tag: Tag[];
  extras: Extras[];
}

export interface ProductResponse {
  data: Product[];
};
