import { strapiClient } from '@/markket/api.strapi';
import { AlbumTrack} from '@/markket/album';
import { generateSEOMetadata } from '@/markket/metadata';
import TrackPageComponent from '@/app/components/ui/track.page';
import { Store } from '@/markket/store.d';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string, track_slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, track_slug } = await params;

  const response = await strapiClient.getTrack(track_slug, slug);
  const track = response?.data?.[0] as AlbumTrack;

  return generateSEOMetadata({
    slug,
    entity: {
      url: `/${slug}/track/${track_slug}`,
      seo: track?.seo,
    },
    type: 'article',
  });
};

export default async function TrackPage({ params }: PageProps) {
  const { slug, track_slug} = await params;
  const storeResponse = await strapiClient.getStore(slug);
  const response = await strapiClient.getTrack(track_slug, slug);

  const store = storeResponse?.data?.[0] as Store;
  const track = response?.data?.[0] as AlbumTrack;

  if (!store || !track) {
    notFound();
  }

  return <TrackPageComponent store={store} track={track} />;
};
