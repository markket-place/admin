import { tiendaClient } from '@/markket/api.tienda';
import type { TiendaContentType } from '@/markket/tienda.endpoints';
import type { Article } from '@/markket/article';
import type { Page } from '@/markket/page';
import type { Product } from '@/markket/product';
import type { Event } from '@/markket/event';
import type { Album } from '@/markket/album';

const DEFAULT_CONTENT_POPULATE: Record<TiendaContentType, string[]> = {
  article: ['seo', 'seo.socialImage', 'tags', 'cover', 'store', 'store.logo'],
  page: ['seo', 'seo.socialImage', 'store', 'store.logo', 'albums', 'albums.cover', 'albums.seo', 'albums.tracks'],
  product: ['seo', 'seo.socialImage', 'thumbnail', 'slides', 'prices', 'stores', 'stores.logo', 'extras'],
  event: ['seo', 'seo.socialImage', 'tag', 'thumbnail', 'slides', 'prices', 'stores', 'locations'],
  album: ['seo', 'cover', 'tracks', 'tracks.seo', 'tracks.media', 'store', 'store.logo'],
  track: ['seo', 'media', 'urls', 'store', 'store.logo'],
  category: ['seo'],
  shortner: ['seo'],
  order: ['seo'],
};

export function readTiendaAuthToken() {
  if (typeof window === 'undefined') return '';

  try {
    const raw = localStorage.getItem('markket.auth');
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.jwt || '';
  } catch {
    return '';
  }
}

function getPopulateQuery(contentType: TiendaContentType) {
  const values = DEFAULT_CONTENT_POPULATE[contentType] || [];
  return values.length > 0 ? { 'populate[]': values } : {};
}

function looksLikeDocumentId(value: string) {
  return /^[a-z0-9]{16,}$/i.test(value) && !value.includes('-');
}

async function getContentById<T>(storeSlug: string, contentType: TiendaContentType, itemId: string, token: string) {
  const response = await tiendaClient.getContent(storeSlug, contentType, itemId, {
    token,
    query: {
      status: 'all',
      ...getPopulateQuery(contentType),
    },
  });

  return response?.data as T | undefined;
}

async function getContentBySlug<T>(storeSlug: string, contentType: TiendaContentType, slug: string, token: string) {
  const response = await tiendaClient.listContent(storeSlug, contentType, {
    token,
    query: {
      status: 'all',
      'pagination[page]': 1,
      'pagination[pageSize]': 1,
      'filters[slug][$eq]': slug,
      ...getPopulateQuery(contentType),
    },
  });

  if (Array.isArray(response?.data)) {
    return response.data[0] as T | undefined;
  }

  return undefined;
}

export async function findTiendaContent<T = Article | Page | Product | Event | Album>(
  storeSlug: string,
  contentType: TiendaContentType,
  itemId: string,
  token: string,
) {
  if (!token) return undefined;

  if (looksLikeDocumentId(itemId)) {
    const byId = await getContentById<T>(storeSlug, contentType, itemId, token);
    if (byId) return byId;

    return getContentBySlug<T>(storeSlug, contentType, itemId, token);
  }

  const bySlug = await getContentBySlug<T>(storeSlug, contentType, itemId, token);
  if (bySlug) return bySlug;

  return getContentById<T>(storeSlug, contentType, itemId, token);
}
