'use client';

import { Container, Title, Text, Stack, Image } from "@mantine/core";
import { strapiClient } from '@/markket/api.strapi';
import { useRouter } from 'next/navigation';
import PageContent from "@/app/components/ui/page.content";
import { Article } from "@/markket/article.d";
import { useEffect, useState } from 'react';
import { LoadingOverlay } from '@mantine/core';
import { notFound } from 'next/navigation';

interface BlogPostDetailsProps {
  params: {
    article_slug: string;
    slug: string;
  };
}

/**
 * Uses id and slug to fetch a blog post from Strapi
 *
 * @param param0
 * @returns
 */
export default function BlogPostPage({
  params: { article_slug, slug }
}: BlogPostDetailsProps) {
  const [post, setPost] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await strapiClient.getPost(article_slug, slug);
        const post = response?.data?.[0];

        if (!post) {
          return notFound();
        }

        setPost(post as Article);
      } catch (error) {
        console.error('Failed to fetch post:', error);
        // notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [article_slug, slug, router]);

  if (loading) {
    return <LoadingOverlay visible />;
  }

  if (!post) {
    return null;
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {post.cover && (
          <Image
            src={post.cover.url}
            alt={post.title}
            radius="md"
            className="w-full"
          />
        )}

        <div>
          <Title order={1}>{post.title}</Title>
          {post.tags && (
            <div className="flex gap-2 mt-2">
              {post.tags.map((tag) => (
                <Text
                  key={tag.id}
                  size="sm"
                  c={tag.color?.toLowerCase() || 'blue'}
                >
                  #{tag.label}
                </Text>
              ))}
            </div>
          )}
        </div>

        <PageContent params={{ post }} />
      </Stack>
    </Container>
  );
};
