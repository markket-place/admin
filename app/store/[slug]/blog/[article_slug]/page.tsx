import { cache } from 'react';
import { Container, Stack, Text, Title } from '@mantine/core';
import { Metadata } from 'next';
import { strapiClient } from '@/markket/api.strapi';
import { Article } from '@/markket/article';
import { generateSEOMetadata } from '@/markket/metadata';
import PageContent from '@/app/components/ui/page.content';
import StoreCrosslinks from '@/app/components/ui/store.crosslinks';
import { notFound } from 'next/navigation';
import LightboxImage from '@/app/components/ui/lightbox.image';

const getPost = cache((article_slug: string, slug: string) =>
  strapiClient.getPost(article_slug, slug)
);

export interface BlogPageProps {
  params: Promise<{
    slug: string;
    article_slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { article_slug, slug } = await params;

  const response = await getPost(article_slug, slug);

  const post = response?.data?.[0] as Article;

  const articleTitle = post?.title || 'Blog Post';
  const description = post?.seo?.metaDescription;

  return generateSEOMetadata({
    slug,
    entity: {
      seo: post?.seo,
      title: post?.title,  // Pass real value, not fallback
      description,
      id: post?.id?.toString(),
      url: `/${slug}/blog/${article_slug}`,
    },
    type: 'article',
    defaultTitle: 'Blog Post',
    keywords: [
      'blog',
      'article',
      articleTitle,
      ...(post?.tags?.map(t => t.label) || []),
    ],
  });
};

/**
 * Too much truth puts sadness in your heart and madness in your mind
 *
 * @param param0
 * @returns
 */
export default async function BlogPostPageContainer({
  params
}: BlogPageProps) {
  const { article_slug, slug } = await params;

  const [postResponse, storeResponse, postsResponse] = await Promise.all([
    getPost(article_slug, slug),
    strapiClient.getStore(slug),
    strapiClient.getPosts({ page: 1, pageSize: 5 }, { sort: 'updatedAt:desc' }, slug),
  ]);

  const post = postResponse?.data?.[0] as Article | undefined;
  const store = storeResponse?.data?.[0];

  if (!post) {
    notFound();
  }

  const relatedPosts = ((postsResponse?.data || []) as Article[])
    .filter((item) => item.slug !== article_slug)
    .slice(0, 4)
    .map((item) => ({
      href: `/${slug}/blog/${item.slug}`,
      label: item.title || item.slug,
    }));

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {post.cover?.url && (
          <LightboxImage
            src={post.cover.url}
            alt={post.title}
            radius="md"
            className="w-full"
          />
        )}

        <div>
          <Title order={1}>{post.title}</Title>
          {post.tags && (
            <div className="mt-2 flex gap-2">
              {post.tags.map((tag) => (
                <Text key={tag.id} size="sm" c={tag.color?.toLowerCase() || 'blue'}>
                  #{tag.label}
                </Text>
              ))}
            </div>
          )}
        </div>

        <PageContent params={{ post }} />

        <StoreCrosslinks
          slug={slug}
          store={store}
          currentSection="blog"
          items={relatedPosts}
        />
      </Stack>
    </Container>
  );
};
