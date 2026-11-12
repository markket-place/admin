import { type SEO, type ImageData } from './seo.d';
import { type Tag } from './tag.d';
import type { ContentBlock } from './page.d';
import type { Store } from './store';

export interface Article {
  id: number;
  slug: string;
  title: string;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  tiendaPublication?: { visibleStatus?: 'published' | 'draft' | 'unpublished'; publishedAt?: string | null };
  tags?: Tag[];
  content: ContentBlock[];
  store?: Store;
  seo: SEO,
  cover?: ImageData;
};
