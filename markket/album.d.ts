import { SEO } from './seo';
import { Media, Store } from './store';
import { ContentBlock } from './page';

export interface AlbumTrack {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
  description: string;
  content: ContentBlock[];
  media: Media[];
  urls?: {
    id: number;
    Label: string;
    URL: string;
  }[];
  seo?: SEO;
};

export interface Album {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description: string;
  content: ContentBlock[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
  cover: Media;
  tracks: AlbumTrack[];
  store?: Store;
  displayType: 'grid' | 'list' | 'carousel';
  seo?: SEO;
};

export interface AlbumResponse {
  data: Album[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      pageCount: number;
    };
  };
};
