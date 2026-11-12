// import { createSwaggerSpec } from 'next-swagger-doc';
// import dynamic from 'next/dynamic';
// import 'swagger-ui-react/swagger-ui.css';

import { Container, Title, Text, Stack, Image } from "@mantine/core";
import { strapiClient } from '@/markket/api.strapi';
import { notFound } from 'next/navigation';
import { Article } from "@/markket/article.d";
import { generateSEOMetadata } from '@/markket/metadata';
import { Metadata } from "next";
import PageContent from "@/app/components/ui/page.content";
import PreviewRequest from '@/app/components/ui/api.requests';

export const dynamic = 'force-dynamic';

interface DocsPageProps {
  params: Promise<{ article_slug: string }>;
}

export async function generateMetadata({ }: DocsPageProps): Promise<Metadata> {

  const { data: [_post] } = await strapiClient.getPost('api');
  const post = _post as Article;

  return generateSEOMetadata({
    slug: process.env.NEXT_PUBLIC_MARKKET_STORE_SLUG as string,
    entity: {
      url: `/docs/api`,
      seo: post?.seo,
      title: post?.title,
    },
    type: 'article',
  });
};

export default async function DocsPage({ params }: DocsPageProps) {
  const { article_slug } = await params;

  const response = await strapiClient.getPost(article_slug);
  const post = response?.data?.[0] as Article;

  if (!post) {
    notFound();
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
      <PreviewRequest />
    </Container>
  );
};

