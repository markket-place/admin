import { NextRequest } from 'next/server';
import { fetchUserStores,  validators,  } from '@/markket/helpers.api';

export const contentTypeConfig = {
  // -- article -- //
  article: {
    validate: (data: any) => {
      if (!data?.title || !data?.content || !data?.slug) {
        return { valid: false, error: 'Missing min required fields for article[title,content,slug]' };
      }

      if (!validators.slug(data?.slug)) {
        return { valid: false, error: 'Invalid slug format' };
      }

      return { valid: true };
    },
    transform: (data: any, userId: string | number, storeId: string | number) => ({
      title: data.title,
      content: data.content,
      slug: data.slug,
      tags: data.tags,
      seo: data.seo ? {
        metaTitle: data.seo?.metaTitle,
        metaDescription: data.seo?.metaDescription,
        metaKeywords: data.seo?.metaKeywords,
        socialImage: data.seo?.socialImage?.id,
      } : undefined,
      store: [storeId],
      cover: data.cover,
      slides: data.slides,
    }),
    linkToStore: true,
    propLimit: 50,
  },
  // -- page -- //
  page: {
    validate: (data: any) => {
      if (!data?.title || !data?.content || !data?.slug) {
        return { valid: false, error: 'Missing min required fields for page[title,content,slug]' };
      }

      if (!validators.short_slug(data?.slug)) {
        return { valid: false, error: 'Invalid slug format' };
      }

      return { valid: true };
    },
    transform: (data: any, userId: string | number, storeId: string | number) => ({
      title: data.title,
      content: data.content,
      slug: data.slug,
      seo: data.seo ? {
        metaTitle: data.seo?.metaTitle,
        metaDescription: data.seo?.metaDescription,
        metaKeywords: data.seo?.metaKeywords,
        socialImage: data.seo?.socialImage?.id,
      } : undefined,
      store: [storeId],
    }),
    linkToStore: true,
    propLimit: 50,
  },
  // -- product -- //
  product: {
    validate: (data: any) => {
      if (!data?.name || !data?.description || !data?.slug) {
        return { valid: false, error: 'Missing min required fields for product[name,desc,slug]' };
      }

      if (!validators.slug(data?.slug)) {
        return { valid: false, error: 'Invalid slug format' };
      }

      return { valid: true };
    },
    transform: (data: any, userId: string | number, storeId: string | number) => ({
      name: data.name,
      description: data.description,
      slug: data.slug,
      sku: data.sku,
      thumbnail: data.thumbnail,
      slides: data.slides,
      prices: data.prices?.map((p: any) => ({
        currency: p.currency,
        description: p.description,
        name: p.name,
        price: p.price,
        stripe_id: p.stripe_id,
      })),
      seo: data.seo ? {
        metaTitle: data.seo?.metaTitle,
        metaDescription: data.seo?.metaDescription,
        metaKeywords: data.seo?.metaKeywords,
        socialImage: data.seo?.socialImage?.id,
      } : undefined,
      stores: [storeId],
      creator: [userId],
    }),
    linkToStore: true,
    propLimit: 24,
  },
  track: {
    validate: (data: any) => {
      if (!data?.title || !data?.slug) {
        return { valid: false, error: 'Missing required fields for track' };
      }

      if (!validators.short_slug(data?.slug)) {
        return { valid: false, error: 'Invalid slug format' };
      }

      return { valid: true };
    },
    transform: (data: any, userId: string | number, storeId: string | number) => ({
      title: data.title,
      description: data.description,
      content: data.content,
      slug: data.slug,
      media: data.media,
      urls: data.urls?.map(({ URL, Label }: { URL: string, Label: string }) => ({ URL, Label })),
      seo: data.seo ? {
        metaTitle: data.seo?.metaTitle,
        metaDescription: data.seo?.metaDescription,
        metaKeywords: data.seo?.metaKeywords,
        socialImage: data.seo?.socialImage?.id,
      } : undefined,
      store: storeId,
    }),
    linkToStore: true,
    propLimit: 100,
  },
  album: {
    validate: (data: any) => {
      if (!data?.title || !data?.slug) {
        return { valid: false, error: 'Missing required fields for album' };
      }

      if (!validators.short_slug(data?.slug)) {
        return { valid: false, error: 'Invalid slug format' };
      }

      return { valid: true };
    },
    transform: (data: any, userId: string | number, storeId: string | number) => ({
      title: data.title,
      description: data.description,
      content: data.content,
      slug: data.slug,
      cover: data.cover,
      seo: data.seo ? {
        metaTitle: data.SEO?.metaTitle,
        metaDescription: data.SEO?.metaDescription,
        metaKeywords: data.SEO?.metaKeywords,
        socialImage: data.SEO?.socialImage?.id,
      } : undefined,
      store: storeId,
    }),
    linkToStore: true,
    propLimit: 50,
  },
  event: {
    validate: (data: any) => {
      if (!data?.Name || !data?.slug) {
        return { valid: false, error: 'Missing required fields for event' };
      }

      if (!validators.slug(data?.slug)) {
        return { valid: false, error: 'Invalid slug format' };
      }

      return { valid: true };
    },
    transform: (data: any, userId: string | number, storeId: string | number) => ({
      name: data.name,
      description: data.description,
      slug: data.slug,
      startDate: data.startDate,
      endDate: data.endDate,
      // location: data.location,
      thumbnail: data.thumbnail,
      slides: data.slides,
      creator: [userId],
      prices: data.prices?.map((p: any) => ({
        currency: p.currency,
        description: p.description,
        name: p.name,
        price: p.price,
        stripe_id: p.stripe_id,
      })),
      seo: data.seo ? {
        metaTitle: data.seo?.metaTitle,
        metaDescription: data.seo?.metaDescription,
        metaKeywords: data.seo?.metaKeywords,
        socialImage: data.seo?.socialImage?.id,
      } : undefined,
      stores: [storeId],
    }),
    linkToStore: true,
    propLimit: 50,
  },
};

// Get content types from URL and validate against config
export const getContentType = (request: NextRequest) => {
  const contentType = request.nextUrl?.searchParams.get('contentType');

  if (!contentType || !contentTypeConfig[contentType as keyof typeof contentTypeConfig]) {
    return { valid: false, error: 'Invalid or missing content type' };
  }

  return { valid: true, contentType };
};

// Check if user has permission to modify content in this store
export async function validateStoreAccess(storeId: string) {
  if (!storeId) return false;

  try {
    const stores = await fetchUserStores();
    return stores.data.some((store: any) => store.documentId === storeId || store.id === storeId);
  } catch (error) {
    console.error('Error validating store access:', error);
    return false;
  }
}
