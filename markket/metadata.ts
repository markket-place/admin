import { Metadata } from 'next';
import { strapiClient } from '@/markket/api.strapi';

const BASE_URL = process.env.NEXT_PUBLIC_MARKKETPLACE_URL || 'https://markket.place';

interface SEOProps {
  url?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    excludeFromSearch?: boolean;
    metaUrl?: string;
    socialImage?: {
      url: string;
      width?: number;
      height?: number;
    };
  };
  title?: string;
  logo?: {
    url: string;
  };
  name?: string;
  description?: string;
  id?: string;
};

export async function generateSEOMetadata({
  slug,
  entity,
  type = 'website',
  defaultTitle,
  defaultDescription,
  keywords: additionalKeywords,
}: {
  slug: string;
  entity?: SEOProps;
  type?: 'website' | 'article';
  defaultTitle?: string;
  defaultDescription?: string;
  keywords?: string[];
}): Promise<Metadata> {

  const storeResponse = await strapiClient.getStore(slug);
  const store = storeResponse?.data?.[0];

  const storeName = store?.title || store?.SEO?.metaTitle || 'Store';

  // Build descriptive title with context - filter out empty strings
  const baseTitle = (entity?.seo?.metaTitle?.trim()) ||
    (entity?.title?.trim()) ||
    (defaultTitle?.trim());

  const title = baseTitle && baseTitle !== storeName
    ? `${baseTitle} | ${storeName}`
    : storeName;

  const baseDescription = (entity?.seo?.metaDescription?.trim()) ||
    (entity?.description?.trim()) ||
    defaultDescription ||
    (store?.seo?.metaDescription?.trim()) ||
    (store?.description?.trim());

  const description = baseDescription || `Discover ${storeName} - Open ecommerce ecosystem`;

  const image_url = entity?.seo?.socialImage?.url ||
    entity?.logo?.url ||
    store?.seo?.socialImage?.url ||
    store?.logo?.url;

  const baseKeywords = (entity?.seo?.metaKeywords?.trim()) ||
    (store?.seo?.metaKeywords?.trim()) ||
    '';

  const keywordsList = [
    ...baseKeywords.split(',').map(k => k.trim()).filter(Boolean),
    ...(additionalKeywords || []),
    storeName,
    'shop',
    'ecommerce',
    'markket.next'
  ].filter((v, i, a) => a.indexOf(v) === i);

  const keywords = keywordsList.join(', ');

  const canonical = entity?.url || entity?.seo?.metaUrl || `/${slug}`;

  return {
    title,
    description,
    keywords,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: storeName,
      images: image_url ? [
        {
          url: image_url,
          width: entity?.seo?.socialImage?.width || 1200,
          height: entity?.seo?.socialImage?.height || 630,
          alt: `${title} - ${description}`,
        }
      ] : undefined,
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image_url ? [image_url] : undefined,
    },
    robots: {
      index: !entity?.seo?.excludeFromSearch,
      follow: !entity?.seo?.excludeFromSearch,
    }
  };
};
