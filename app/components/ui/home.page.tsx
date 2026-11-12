'use client';

import Link from "next/link";
import {
  IconRocket, IconBuildingStore,
  IconSparkles, IconArrowRight,
  IconCalendar,
} from "@tabler/icons-react";
import { Store, Page, Article, Event, Product } from "@/markket";
import PageContent from '@/app/components/ui/page.content';
import { markketColors } from "@/markket/colors.config";
import { extractRichTextImageUrl, stripMarkdown } from '@/markket/richtext.utils';
import { StorefrontCarousel } from '@/app/components/ui/storefront.carousel';
import { FeatureCard } from '@/app/components/ui/feature.card';

const features = [
  {
    icon: IconRocket,
    title: "Launch Your Stores in Minutes",
    description: "Sell digital or physical products with secure, payments powered by Stripe",
    color: markketColors.sections.events.main,
  },
  {
    icon: IconBuildingStore,
    title: "Explore your Brands",
    description: "Build without invasive trackers or platform interference",
    color: markketColors.sections.shop.main,
  },
  {
    icon: IconSparkles,
    title: "Headless Flexibility & Control",
    description: "Customize with open standards, dev tools, and templates",
    color: markketColors.rosa.main,
  },
];

const pickBestImage = (...values: Array<string | undefined | null>) => {
  return values.find((value): value is string => Boolean(value));
};

const createFallbackCoverUrl = (seed: string, width: number, height: number) => {
  const safeSeed = encodeURIComponent(seed || 'markket');
  return `https://picsum.photos/seed/${safeSeed}/${width}/${height}?grayscale&blur=1`;
};

const hasValidTimeZone = (value?: string) => {
  if (!value) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
  }
};

const formatEventDate = (value?: string, timeZone?: string) => {
  if (!value) return 'TBD';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'TBD';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...(hasValidTimeZone(timeZone) ? { timeZone } : {}),
  }).format(parsed);
};

type HomePageProps = {
  store?: Store;
  page?: Page;
  communityPosts?: Article[];
  featuredStores?: Store[];
  communityPages?: Page[];
  communityEvents?: Event[];
  communityProducts?: Product[];
};

const SectionLabel = ({ num, label, color }: { num: string; label: string; color?: string }) => (
  <span
    className="block text-xs font-semibold uppercase tracking-widest font-mono mb-1"
    style={{ color: color || markketColors.neutral.mediumGray }}
  >
    {num} — {label}
  </span>
);

const HomePage = ({
  store,
  page,
  communityPosts = [],
  featuredStores = [],
  communityPages = [],
  communityEvents = [],
  communityProducts = []
}: HomePageProps) => {
  const eventsToDisplay = communityEvents;

  return (
    <main className="min-h-screen bg-white text-gray-900 selection:bg-rose-100 selection:text-rose-900 antialiased">

      {/* ── 00 — STORES ───────────────────────────────────── */}
      <section className="py-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
            <div>
              <SectionLabel num="00" label="Digital Storefronts" color={markketColors.sections.shop.main} />
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950 mt-1">
                Shop Independent Creators
              </h2>
              <p className="text-gray-500 text-sm mt-1">Explore custom, modern shops built by small businesses and digital makers.</p>
            </div>
            <Link
              href="/stores"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-950 transition-colors group"
            >
              /stores <IconArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {featuredStores.length > 0 ? (
            <StorefrontCarousel stores={featuredStores} />
          ) : (
              <div className="flex flex-col items-center justify-center text-center p-16 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50 backdrop-blur-sm">
                <p className="text-gray-500 mb-4 font-medium text-lg">No stores live just yet — jump in and set up shop!</p>
                <Link
                  href="/auth/magic"
                  className="px-6 py-3 text-sm font-bold text-white rounded-xl shadow-md hover:opacity-95 hover:shadow-lg transition-all active:scale-[0.98]"
                  style={{ backgroundColor: markketColors.rosa.main }}
                >
                  Launch Your Custom Storefront
                </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── 01 — PLATFORM / HERO ───────────────────────────── */}
      <section
        className="py-24 border-b border-gray-100 relative overflow-hidden"
        style={{ backgroundColor: markketColors.neutral.offWhite }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <SectionLabel num="01" label="/tienda" />
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-950 mt-2 leading-[1.08]">
                {store?.seo?.metaTitle || 'Markkët Next'}
                <br />
                <span style={{ color: markketColors.rosa.main }}>Content Manager System</span>
              </h1>
            </div>
            <div className="lg:col-span-5 flex flex-col gap-6">
              <p className="text-gray-600 text-lg leading-relaxed font-normal">
                {store?.seo?.metaDescription ||
                  'Create beautiful standalone digital storefronts and blog networks for independent creators, artists, and modern agile brands.'}
              </p>
              <div>
                <Link
                  href="/auth/magic"
                  className="inline-flex items-center gap-2 px-7 py-4 font-bold text-white rounded-2xl shadow-lg shadow-rose-500/10 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0"
                  style={{ backgroundColor: markketColors.rosa.main }}
                >
                  <IconSparkles size={16} /> Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 02 — BLOG ───────────────────────────────────────── */}
      {communityPosts.length > 0 && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
              <div>
                <SectionLabel num="02" label="Creator Ecosystem Journals" color={markketColors.sections.blog.main} />
                <h2 className="text-3xl font-black text-gray-950 mt-1">Latest Insights & Stories</h2>
                <p className="text-gray-500 mt-1">Fresh articles, project diaries, and strategy updates directly from community creators.</p>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 text-sm font-bold text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98] group"
              >
                /blog <IconArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {communityPosts.slice(0, 6).map((post) => {
                const contentImage = extractRichTextImageUrl(post?.content);
                const coverUrl = pickBestImage(
                  contentImage,
                  post?.cover?.formats?.medium?.url,
                  post?.cover?.formats?.small?.url,
                  post?.cover?.formats?.thumbnail?.url,
                  post?.cover?.url,
                  post?.seo?.socialImage?.formats?.medium?.url,
                  post?.seo?.socialImage?.formats?.small?.url,
                  post?.seo?.socialImage?.formats?.thumbnail?.url,
                  post?.seo?.socialImage?.url,
                  post?.store?.logo?.formats?.small?.url,
                  post?.store?.logo?.formats?.thumbnail?.url,
                  post?.store?.logo?.url,
                );
                const storeSlug = post?.store?.slug;
                const href = storeSlug ? `/${storeSlug}/blog/${post.slug}` : '/docs';
                const fallbackCoverUrl = createFallbackCoverUrl(
                  [post.title, post.slug, post.documentId, storeSlug].filter(Boolean).join('-') || post.id?.toString() || 'blog-post',
                  900,
                  520,
                );

                return (
                  <Link
                    key={post.documentId || post.id}
                    href={href}
                    className="group flex flex-col h-full overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    aria-label={`Read fully-optimized article: ${post.title}`}
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          loading="lazy"
                        />
                      ) : (
                          <div
                            className="w-full h-full bg-cover bg-center relative"
                            style={{ backgroundImage: `url(${fallbackCoverUrl})` }}
                          >
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col flex-1 p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">Article</span>
                        {post?.store?.title && (
                          <span className="text-xs text-gray-500 font-medium tracking-wide">{post.store.title}</span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-gray-950 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug mb-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">
                        {post?.seo?.metaDescription || 'Click to dive deep into this featured community insight piece...'}
                      </p>

                      <span
                        className="text-sm font-semibold mt-auto flex items-center gap-1 group-hover:gap-2 transition-all duration-150"
                        style={{ color: markketColors.sections.blog.main }}
                      >
                        Read full post <IconArrowRight size={14} className="stroke-[2.5]" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── 03 — EVENTS ──────────────────────────────────── */}
      {eventsToDisplay.length > 0 && (
        <section
          className="py-24 border-t border-gray-100"
          style={{ backgroundColor: `${markketColors.sections.events.light}25` }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
              <div>
                <SectionLabel num="03" label="Interactive Experiences" color={markketColors.sections.events.main} />
                <h2 className="text-3xl font-black text-gray-950 mt-1">Join Live Marketplace Events</h2>
                <p className="text-gray-500 mt-1">Educational workshops, product drops, and global meetups Hosted by store owners.</p>
              </div>
              <Link
                href="/events"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 bg-white text-sm font-bold text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98] group"
              >
                /events <IconArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {eventsToDisplay.slice(0, 9).map((event: Event) => {
                const thumbnailUrl = pickBestImage(
                  event?.thumbnail?.formats?.medium?.url,
                  event?.thumbnail?.formats?.small?.url,
                  event?.thumbnail?.formats?.thumbnail?.url,
                  event?.thumbnail?.url,
                  event?.slides?.[0]?.formats?.medium?.url,
                  event?.slides?.[0]?.formats?.small?.url,
                  event?.slides?.[0]?.formats?.thumbnail?.url,
                  event?.slides?.[0]?.url,
                  event?.seo?.socialImage?.formats?.medium?.url,
                  event?.seo?.socialImage?.formats?.small?.url,
                  event?.seo?.socialImage?.formats?.thumbnail?.url,
                  event?.seo?.socialImage?.url,
                  (event as any)?.stores?.[0]?.Logo?.formats?.small?.url,
                  (event as any)?.stores?.[0]?.Logo?.formats?.thumbnail?.url,
                  (event as any)?.stores?.[0]?.Logo?.url,
                );
                const storeSlug = (event as any)?.stores?.[0]?.slug;
                const href = storeSlug ? `/${storeSlug}/events/${event.slug}` : '/stores';
                const eventDate = formatEventDate(event.startDate, event.timezone);

                return (
                  <Link
                    key={event.documentId || event.id}
                    href={href}
                    className="group flex flex-col h-full overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    aria-label={`Register for community event: ${event.name}`}
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-gray-50">
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt={event.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          loading="lazy"
                        />
                      ) : (
                          <div
                            className="w-full h-full flex flex-col items-center justify-center p-6 text-center"
                            style={{ backgroundColor: markketColors.sections.events.light, color: markketColors.sections.events.main }}
                          >
                            <IconCalendar size={32} className="mb-1 animate-pulse" />
                            <span className="text-sm font-bold tracking-wide">Live Stream / Meetup</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col flex-1 p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md inline-flex items-center gap-1">
                          <IconCalendar size={12} /> {eventDate}
                        </span>
                        {(event as any)?.stores?.[0]?.title && (
                          <span className="text-xs text-gray-500 font-medium tracking-wide">{(event as any).stores[0].title}</span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-gray-950 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-snug mb-2">
                        {event.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4">
                        {event?.seo?.metaDescription || 'Discover dates, speaker bios, topics, and access details for this collective community run workshop.'}
                      </p>

                      <span
                        className="text-sm font-semibold mt-auto flex items-center gap-1 group-hover:gap-2 transition-all duration-150"
                        style={{ color: markketColors.sections.events.main }}
                      >
                        Details <IconArrowRight size={14} className="stroke-[2.5]" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── 05 — FEATURES ───────────────────────────────── */}
      {communityProducts.length > 0 && (
        <section
          className="py-20 border-b border-gray-100"
          style={{ backgroundColor: markketColors.neutral.offWhite }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <SectionLabel num="05" label="Core Open Architecture Capabilities" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  color={feature.color}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 06 — SHOP ───────────────────────────────────── */}
      {communityProducts.length > 0 && (
        <section
          className="py-24"
          style={{ backgroundColor: `${markketColors.sections.shop.light}25` }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
              <div>
                <SectionLabel num="06" label="Handpicked Commercial Offerings" color={markketColors.sections.shop.main} />
                <h2 className="text-3xl font-black text-gray-950 mt-1">Shop Community Top Picks</h2>
                <p className="text-gray-500 mt-1">Directly purchase digital downloads, visual art templates, physical items, and courses safely.</p>
              </div>
              <Link
                href="/stores"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 bg-white text-sm font-bold text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98] group"
              >
                /stores <IconArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {communityProducts.slice(0, 6).map((product) => {
                const storeSlug = (product as any)?.stores?.[0]?.slug;
                const contentImage = extractRichTextImageUrl(product?.description as string);
                const productImage = pickBestImage(
                  contentImage,
                  product?.thumbnail?.url,
                  product?.slides?.[0]?.formats?.medium?.url,
                  product?.slides?.[0]?.formats?.small?.url,
                  product?.slides?.[0]?.formats?.thumbnail?.url,
                  product?.slides?.[0]?.url,
                );
                const href = storeSlug ? `/${storeSlug}/products/${product.slug}` : '/stores';
                const _price = product.usd_price || product.prices?.[0]?.price;
                const price = _price && _price > 0 ? `$${((_price)).toFixed(2)}` : ' / ';

                return (
                  <Link
                    key={product.documentId || product.id}
                    href={href}
                    className="group flex flex-col h-full overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    aria-label={`Purchase or read specs for: ${product.name}`}
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          loading="lazy"
                        />
                      ) : (
                          <div
                            className="w-full h-full bg-cover bg-center relative"
                            style={{ backgroundImage: `url(${createFallbackCoverUrl([product.name, product.slug, storeSlug].filter(Boolean).join('-') || product.id?.toString() || 'product', 900, 520)})` }}
                          >
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col flex-1 p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-bold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-md">Market Product</span>
                        {(product as any)?.stores?.[0]?.title && (
                          <span className="text-xs text-gray-500 font-medium tracking-wide">{(product as any).stores[0].title}</span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-gray-950 group-hover:text-cyan-600 transition-colors line-clamp-2 leading-snug mb-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4">
                        {product?.seo?.metaDescription || stripMarkdown(product?.description as string) || 'Review sizing, feature sets, technical specifications, and distribution delivery parameters.'}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                        <span className="text-base font-black text-gray-950 tracking-tight">{price}</span>
                        <span
                          className="text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all duration-150"
                          style={{ color: markketColors.sections.shop.main }}
                        >
                          View Details <IconArrowRight size={14} className="stroke-[2.5]" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── CUSTOM PAGE CONTENT ───────────────────────────── */}
      {page?.content && (
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageContent params={{ page }} />
        </section>
      )}

      {/* ── 04 — PAGES ──────────────────────────────────── */}
      {communityPages.length > 0 && (
        <section
          className="py-24 border-t border-gray-100"
          style={{ backgroundColor: markketColors.neutral.offWhite }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <SectionLabel num="04" label="Evergreen Brand Portfolios" color={markketColors.sections.about.main} />
              <h2 className="text-3xl font-black text-gray-950 mt-1">Profiles from the E-commerce Community</h2>
              <p className="text-gray-500 mt-1">Read about pages, mission statements, and brand lookbooks from dynamic network shops.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {communityPages.slice(0, 6).map((p) => {
                const storeSlug = (p as any)?.store?.slug;
                const href = storeSlug ? `/${storeSlug}/about/${p.slug}` : '/stores';
                const logoUrl = pickBestImage(
                  (p as any)?.store?.Logo?.formats?.small?.url,
                  (p as any)?.store?.Logo?.formats?.thumbnail?.url,
                  (p as any)?.store?.Logo?.url,
                );

                return (
                  <Link
                    key={p.documentId || p.id}
                    href={href}
                    className="group flex flex-col p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 h-full"
                    aria-label={`Explore information index: ${p.title}`}
                  >
                    {logoUrl && (
                      <div className="relative h-24 w-full rounded-xl overflow-hidden bg-gray-100 mb-4 border border-gray-50">
                        <img
                          src={logoUrl}
                          alt={(p as any)?.store?.title || storeSlug || 'Creator brand hub logo'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="flex flex-col flex-1 gap-2">
                      {storeSlug && (
                        <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400">
                          {(p as any)?.store?.title || storeSlug}
                        </span>
                      )}
                      <h3 className="text-lg font-bold text-gray-950 group-hover:text-indigo-600 transition-colors leading-snug">
                        {p.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4">
                        {p.seo?.metaDescription || 'Read through official manifestos, custom landing profiles, and local vendor dynamic documentations.'}
                      </p>

                      <span
                        className="text-sm font-semibold mt-auto pt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all duration-150"
                        style={{ color: markketColors.sections.about.main }}
                      >
                        Read directory profile <IconArrowRight size={14} className="stroke-[2.5]" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ─────────────────────────────────────────── */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${markketColors.rosa.main} 0%, ${markketColors.sections.blog.main} 100%)` }}
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Ready to Launch Your Brand?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 font-medium mb-10 max-w-xl mx-auto">
            Join independent creators and modern companies already hosting custom storefronts natively on Markkët.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <Link
              href="/auth/magic"
              className="px-8 py-4 bg-white text-base font-bold rounded-2xl shadow-xl shadow-black/10 hover:shadow-2xl hover:bg-gray-50 active:scale-95 transition-all duration-150"
              style={{ color: markketColors.rosa.main }}
            >
              {
                ['Start a Blog', 'Share your Creations', 'Tell Your Story', 'Build Your Brand'][Math.floor(Math.random() * 4)]
              }
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 border border-white/30 text-base font-bold text-white rounded-2xl hover:bg-white/10 hover:border-white/50 active:scale-95 transition-all duration-150 backdrop-blur-sm"
            >
              /about
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
