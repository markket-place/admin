import { strapiClient } from '@/markket/api.strapi';
import { notFound } from 'next/navigation';
import { markketColors } from '@/markket/colors.config';
import { generateSEOMetadata } from '@/markket/metadata';
import { markketplace } from '@/markket/config';
import { Store } from "@/markket/store.d";
import { Metadata } from "next";
import { extractRichTextImageUrl, richTextToPlainText, } from '@/markket/richtext.utils';
import type { Product } from '@/markket/product';
import type { Article } from '@/markket/article';
import type { Event } from '@/markket/event';
import type { Page } from '@/markket/page';
import { cache } from 'react';
import './storefront-rails.css';
import StorefrontHome from '@/app/components/storefront.home.page';

const getStoreCached = cache((slug: string) => strapiClient.getStore(slug));
const getHomePageCached = cache((slug: string) => strapiClient.getPage('home', slug));

interface PageProps {
  params: Promise<{ slug: string }>;
}

type SectionPreviewCard = {
  key: string;
  title: string;
  href: string;
  color: string;
  bg: string;
  countLabel: string;
  headline: string;
  description: string;
  imageUrl?: string;
  show: boolean;
  hasContent: boolean;
};

function compact(value?: string | null, max = 96) {
  if (!value) return '';
  const clean = value.trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}...` : clean;
}

// Simple fallback helper for rich text content
function compactRich(value?: any, max = 96) {
  if (!value) return '';
  const plainText = richTextToPlainText(value) || '';
  return compact(plainText, max);
}

function imageOrFallback(...candidates: Array<string | undefined | null>): string | undefined {
  return candidates.find((item): item is string => typeof item === 'string' && item.length > 0);
}

function mediaImageUrl(media?: {
  formats?: {
    large?: { url?: string | null };
    medium?: { url?: string | null };
    small?: { url?: string | null };
    thumbnail?: { url?: string | null };
  };
  url?: string | null;
} | null): string | undefined {
  if (!media) return undefined;

  return imageOrFallback(
    media.formats?.large?.url,
    media.formats?.medium?.url,
    media.formats?.small?.url,
    media.formats?.thumbnail?.url,
    media.url,
  );
}

function toAbsoluteUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const base = (process.env.NEXT_PUBLIC_MARKKETPLACE_URL || markketplace.markket_url || '').replace(/\/$/, '');
  if (!base) return path;
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

function isPublishedEntry(entry: {
  publishedAt?: string | null;
  tiendaPublication?: { visibleStatus?: string | null };
} | null | undefined) {
  const visibleStatus = entry?.tiendaPublication?.visibleStatus;

  if (visibleStatus) {
    return visibleStatus === 'published';
  }

  if (typeof entry?.publishedAt === 'string') {
    return entry.publishedAt.length > 0;
  }

  return true;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const response = await getStoreCached(slug);
  const store = response?.data?.[0] as Store;
  const slides = store?.slides || [];
  const siteUrl = (process.env.NEXT_PUBLIC_MARKKETPLACE_URL || markketplace.markket_url || '').replace(/\/$/, '');
  const storefrontUrl = siteUrl ? `${siteUrl}/${slug}` : `/${slug}`;
  const homepageUrl = siteUrl || '/';
  const structuredImage = toAbsoluteUrl(imageOrFallback(slides[0]?.url, store?.seo?.socialImage?.url, store?.logo?.url));
  const structuredLogo = toAbsoluteUrl(imageOrFallback(store?.logo?.url, store?.seo?.socialImage?.url));
  const structuredDescription = compact(
    store?.seo?.metaDescription
    || `Discover ${store?.title || slug}`,
    200
  );

  const storefrontJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${storefrontUrl}#webpage`,
        url: storefrontUrl,
        name: store?.title || slug,
        description: structuredDescription,
        isPartOf: {
          '@id': `${homepageUrl}#website`,
        },
        about: {
          '@id': `${storefrontUrl}#store`,
        },
        primaryImageOfPage: structuredImage ? { '@type': 'ImageObject', url: structuredImage } : undefined,
      },
      {
        '@type': 'Store',
        '@id': `${storefrontUrl}#store`,
        name: store?.title || slug,
        url: storefrontUrl,
        description: structuredDescription,
        image: structuredImage,
        logo: structuredLogo,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: homepageUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: store?.title || slug,
            item: storefrontUrl,
          },
        ],
      },
    ],
  };

  const seoMetadata = await generateSEOMetadata({
    slug,
    entity: {
      seo: store?.seo,
      description: store?.description || undefined,
      logo: store?.logo,
      id: store?.id?.toString(),
      url: `/${slug}`,
    },
    type: 'website',
    defaultDescription: `Welcome to ${store?.title || 'our store'}`,
    keywords: ['homepage', 'stores', 'products', 'events', 'marketplace'],
  });

  return {
    ...seoMetadata,
    other: {
      ...seoMetadata.other,
      'jsonld': JSON.stringify(storefrontJsonLd),
    }
  };
}

export default async function StorePage({
  params
}: PageProps) {
  const { slug } = await params;

  if (slug === 'favicon.ico') {
    notFound();
  }

  const [response, pageQuery] = await Promise.all([
    getStoreCached(slug),
    getHomePageCached(slug),
  ]);
  const homePage = pageQuery?.data?.[0];
  const store = response?.data?.[0];

  if (!store) {
    notFound();
  }

  const visibilityRef = String(store.documentId || store.slug || slug);

  const now = new Date();
  const [visibilityResponse, productsResponse, postsResponse, upcomingEventsResponse, pagesResponse] = await Promise.all([
    strapiClient.getStoreVisibility(visibilityRef),
    strapiClient.getProducts({ page: 1, pageSize: 6 }, { filter: '', sort: 'updatedAt:desc' }, slug),
    strapiClient.getPosts({ page: 1, pageSize: 6 }, { sort: 'updatedAt:desc' }, slug),
    strapiClient.getEvents(slug, {
      filter: { startDate: { $gte: now.toISOString() } },
      sort: 'startDate:asc',
      paginate: { page: 1, pageSize: 6 },
      status: 'published',
    }),
    strapiClient.getPages(slug),
  ]);

  const pastEventsResponse = await (async () => {
    const upcoming = (upcomingEventsResponse?.data || []) as Event[];
    if (upcoming.length > 0) {
      return null;
    }

    return await strapiClient.getEvents(slug, {
      filter: { startDate: { $lt: now.toISOString() } },
      sort: 'startDate:desc',
      paginate: { page: 1, pageSize: 6 },
      status: 'published',
    });
  })();

  const visibility = visibilityResponse;
  const visibilityCounts = visibility?.content_summary;
  const showShop = visibility ? visibility.show_shop : true;
  const showBlog = visibility ? visibility.show_blog : true;
  const showEvents = visibility ? visibility.show_events : true;
  const showAbout = visibility ? visibility.show_about : true;
  const products = (productsResponse?.data || []) as Product[];
  const posts = (postsResponse?.data || []) as Article[];
  const upcomingEvents = (upcomingEventsResponse?.data || []) as Event[];
  const pastEvents = (pastEventsResponse?.data || []) as Event[];
  const eventsToDisplay = upcomingEvents.length > 0 ? upcomingEvents : pastEvents;
  const isShowingPastOnly = upcomingEvents.length === 0 && pastEvents.length > 0;
  const pages = (pagesResponse?.data || []) as Page[];
  const publishedProducts = products.filter((item) => isPublishedEntry(item));
  const publishedPosts = posts.filter((item) => isPublishedEntry(item));
  const publishedPages = pages.filter((item) => isPublishedEntry(item));
  const slides = (store?.slides || [])
    .map((slide) => ({
      src: imageOrFallback(slide?.formats?.large?.url, slide?.formats?.medium?.url, slide?.formats?.small?.url, slide?.url),
      alt: slide?.alternativeText || slide?.caption || store?.title || 'Store slide',
      key: slide?.documentId || slide?.id || slide?.hash || slide?.url || 'slide',
    }))
    .filter((slide): slide is { src: string; alt: string; key: string | number } => !!slide.src);

  const storeImages = slides.length === 0
    ? ([
      imageOrFallback(store?.cover?.formats?.large?.url, store?.cover?.formats?.medium?.url, store?.cover?.formats?.small?.url, store?.cover?.url)
      && {
        src: imageOrFallback(store?.cover?.formats?.large?.url, store?.cover?.formats?.medium?.url, store?.cover?.formats?.small?.url, store?.cover?.url) as string,
        alt: `${store.title} cover`,
        key: 'cover',
      },
      store?.logo?.url && { src: store.logo.url, alt: `${store.title} logo`, key: 'logo' },
      imageOrFallback(store?.seo?.socialImage?.formats?.large?.url, store?.seo?.socialImage?.formats?.medium?.url, store?.seo?.socialImage?.formats?.small?.url, store?.seo?.socialImage?.url)
      && {
        src: imageOrFallback(store?.seo?.socialImage?.formats?.large?.url, store?.seo?.socialImage?.formats?.medium?.url, store?.seo?.socialImage?.formats?.small?.url, store?.seo?.socialImage?.url) as string,
        alt: store.seo?.metaTitle || store.title,
        key: 'social',
      },
    ].filter(Boolean) as { src: string; alt: string; key: string }[])
    : [];

  const descriptionText = richTextToPlainText(store.description);
  const hasStoreDescription = Boolean(descriptionText?.trim());
  const shouldRenderRichDescription = !homePage?.title && hasStoreDescription;
  const storefrontFallbackImage = imageOrFallback(
    store?.cover?.formats?.large?.url,
    store?.cover?.formats?.medium?.url,
    store?.cover?.formats?.small?.url,
    store?.cover?.url,
    store?.seo?.socialImage?.formats?.large?.url,
    store?.seo?.socialImage?.formats?.medium?.url,
    store?.seo?.socialImage?.formats?.small?.url,
    store?.seo?.socialImage?.url,
    slides[0]?.src,
    storeImages[0]?.src,
    store?.logo?.url,
  ) || '';
  const homePageImage = imageOrFallback(
    extractRichTextImageUrl(homePage?.content),
    mediaImageUrl(homePage?.seo?.socialImage as any),
    mediaImageUrl(homePage?.albums?.[0]?.cover as any),
    storefrontFallbackImage,
  );
  const hasHomePageStory = Boolean(
    homePage?.title ||
    homePage?.seo?.metaDescription ||
    homePage?.content?.length ||
    homePageImage ||
    homePage?.albums?.length
  );
  const hasHomePageBlocks = Boolean(homePage?.content?.length);

  const aboutPages = publishedPages.filter((page) => !['home', 'about', 'blog', 'products', 'events', 'newsletter'].includes(page.slug || ''));

  const featuredProduct = publishedProducts[0];
  const featuredPost = publishedPosts[0];
  const featuredEvent = eventsToDisplay[0];
  const featuredAbout = aboutPages[0];
  const heroImage = imageOrFallback(
    extractRichTextImageUrl(homePage?.content),
    mediaImageUrl(store?.cover as any),
    mediaImageUrl(store?.seo?.socialImage as any),
    slides[0]?.src,
    slides[1]?.src,
    slides[2]?.src,
    mediaImageUrl(featuredPost?.cover as any),
    mediaImageUrl(featuredEvent?.thumbnail as any),
    mediaImageUrl(featuredAbout?.seo?.socialImage as any),
    mediaImageUrl(featuredProduct?.thumbnail as any),
    storeImages[0]?.src,
    store?.logo?.url,
  ) || '';

  const signalCards = [
    {
      label: 'Products',
      value: publishedProducts.length,
      color: markketColors.sections.shop.main,
      bg: markketColors.sections.shop.light,
    },
    {
      label: 'Stories',
      value: publishedPosts.length,
      color: markketColors.sections.blog.main,
      bg: markketColors.sections.blog.light,
    },
    {
      label: 'Events',
      value: eventsToDisplay.length,
      color: markketColors.sections.events.main,
      bg: markketColors.sections.events.light,
    },
    {
      label: 'Pages',
      value: aboutPages.length,
      color: markketColors.sections.about.main,
      bg: markketColors.sections.about.light,
    },
  ].filter((card) => card.value > 0);

  const previewCards: SectionPreviewCard[] = [
    {
      key: 'shop',
      title: 'Shop',
      href: `/${slug}/products`,
      show: showShop,
      color: markketColors.sections.shop.main,
      bg: markketColors.sections.shop.light,
      countLabel: `${visibilityCounts?.products_count ?? publishedProducts.length} products`,
      headline: featuredProduct?.name || 'Featured products',
      description: compactRich(featuredProduct?.description, 96) || 'Browse your latest drops and essentials in one place.',
      hasContent: publishedProducts.length > 0,
      imageUrl: imageOrFallback(
        extractRichTextImageUrl(featuredProduct?.description as any),
        mediaImageUrl(featuredProduct?.thumbnail as any),
        mediaImageUrl(featuredProduct?.seo?.socialImage as any),
        storefrontFallbackImage,
      ),
    },
    {
      key: 'blog',
      title: 'Blog',
      href: `/${slug}/blog`,
      show: showBlog,
      color: markketColors.sections.blog.main,
      bg: markketColors.sections.blog.light,
      countLabel: `${visibilityCounts?.articles_count ?? publishedPosts.length} posts`,
      headline: featuredPost?.title || 'Latest stories',
      description: compact(featuredPost?.seo?.metaDescription || 'Read stories, updates, and ideas from this store.'),
      hasContent: publishedPosts.length > 0,
      imageUrl: imageOrFallback(
        extractRichTextImageUrl(featuredPost?.content),
        mediaImageUrl(featuredPost?.cover as any),
        mediaImageUrl(featuredPost?.seo?.socialImage as any),
        storefrontFallbackImage,
      ),
    },
    {
      key: 'events',
      title: 'Events',
      href: `/${slug}/events`,
      show: showEvents,
      color: markketColors.sections.events.main,
      bg: markketColors.sections.events.light,
      countLabel: `${visibilityCounts?.events_count ?? eventsToDisplay.length} events`,
      headline: featuredEvent?.name || 'Upcoming sessions',
      description: compactRich(featuredEvent?.description, 96) || 'Discover upcoming events, launches, and gatherings.',
      hasContent: eventsToDisplay.length > 0,
      imageUrl: imageOrFallback(
        extractRichTextImageUrl(featuredEvent?.description),
        mediaImageUrl(featuredEvent?.thumbnail as any),
        mediaImageUrl(featuredEvent?.seo?.socialImage as any),
        storefrontFallbackImage,
      ),
    },
    {
      key: 'about',
      title: 'About',
      href: `/${slug}/about`,
      show: showAbout,
      color: markketColors.sections.about.main,
      bg: markketColors.sections.about.light,
      countLabel: `${visibilityCounts?.pages_count ?? aboutPages.length} pages`,
      headline: featuredAbout?.title || 'About this store',
      description: compact(featuredAbout?.seo?.metaDescription || store?.seo?.metaDescription || 'Learn the story and explore the world behind this store.'),
      hasContent: aboutPages.length > 0 || hasStoreDescription,
      imageUrl: imageOrFallback(
        extractRichTextImageUrl(featuredAbout?.content),
        mediaImageUrl(featuredAbout?.seo?.socialImage as any),
        mediaImageUrl(store?.cover as any),
        mediaImageUrl(store?.seo?.socialImage as any),
        storefrontFallbackImage,
      ),
    },
  ].filter((card) => card.show && card.hasContent);

  const showSignalSquares = false;
  const showSectionSquares = false;

  const sectionLinks = [
    {
      url: `/${slug}/products`,
      title: 'Shop',
      description: `${visibility?.content_summary?.products_count || 0} products`,
      show: showShop,
      color: markketColors.sections.shop.main,
      bgColor: markketColors.sections.shop.light,
      hasContent: publishedProducts.length > 0,
    },
    {
      url: `/${slug}/blog`,
      title: 'Blog',
      description: `${visibilityCounts?.articles_count ?? publishedPosts.length} articles`,
      show: showBlog,
      color: markketColors.sections.blog.main,
      bgColor: markketColors.sections.blog.light,
      hasContent: publishedPosts.length > 0,
    },
    {
      url: `/${slug}/events`,
      title: 'Events',
      description: (() => {
        const upcoming = visibilityCounts?.upcoming_events_count ?? upcomingEvents.length;
        return upcoming > 0 ? `${upcoming} upcoming` : `${eventsToDisplay.length} events`;
      })(),
      show: showEvents,
      color: markketColors.sections.events.main,
      bgColor: markketColors.sections.events.light,
      hasContent: eventsToDisplay.length > 0,
    },
    {
      url: `/${slug}/about`,
      title: 'About',
      description: `${visibilityCounts?.pages_count ?? aboutPages.length} pages`,
      show: showAbout,
      color: markketColors.sections.about.main,
      bgColor: markketColors.sections.about.light,
      hasContent: aboutPages.length > 0,
    }
  ].filter(link => link.show && link.hasContent);

  const hasPublishedCollections = publishedProducts.length > 0 || publishedPosts.length > 0 || eventsToDisplay.length > 0 || aboutPages.length > 0;
  const hasPresentationContent = hasHomePageStory || hasStoreDescription || slides.length > 0 || storeImages.length > 0;
  const shouldShowEmptyLaunchState = !hasPublishedCollections && !hasPresentationContent;

  return (
    <StorefrontHome
      homePage={homePage}
      store={store}
      slug={slug}
      heroImage={heroImage}
      showSectionSquares={showSectionSquares}
      previewCards={previewCards}
      showSignalSquares={showSignalSquares}
      signalCards={signalCards}
      homePageImage={homePageImage}
      hasHomePageBlocks={hasHomePageBlocks}
      hasHomePageStory={hasHomePageStory}
      shouldRenderRichDescription={shouldRenderRichDescription}
      publishedProducts={publishedProducts}
      publishedPosts={publishedPosts}
      eventsToDisplay={eventsToDisplay}
      aboutPages={aboutPages}
      showShop={showShop}
      showBlog={showBlog}
      showEvents={showEvents}
      showAbout={showAbout}
      isShowingPastOnly={isShowingPastOnly}
      slides={slides}
      storeImages={storeImages}
      shouldShowEmptyLaunchState={shouldShowEmptyLaunchState}
      sectionLinks={sectionLinks}
    />
  );
};
