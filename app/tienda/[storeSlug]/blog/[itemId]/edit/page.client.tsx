'use client';

import { useEffect, useState } from 'react';
import { Text } from '@mantine/core';
import TiendaItemSkeleton from '@/app/components/ui/tienda.item.skeleton';
import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';
import BlogEditorForm from '../../blog.editor.form';
import { findBlogArticle } from '../../blog.find';
import { readTiendaAuthToken } from '../../../content.find';
import type { Article } from '@/markket/article';

type TiendaBlogEditPageClientProps = {
  storeSlug: string;
  itemId: string;
};

export default function TiendaBlogEditPageClient({ storeSlug, itemId }: TiendaBlogEditPageClientProps) {
  const [post, setPost] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const token = readTiendaAuthToken();

    if (!token) {
      setError('Authentication required to edit this article.');
      setLoading(false);
      return;
    }

    const loadPost = async () => {
      try {
        const data = await findBlogArticle(itemId, storeSlug, token);
        if (!active) return;

        if (!data) {
          setError('This article could not be found.');
          return;
        }

        setPost(data);
      } catch (err) {
        console.error('Tienda blog edit load error', err);
        if (!active) return;
        setError('Unable to load the article. Please refresh.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPost();
    return () => {
      active = false;
    };
  }, [itemId, storeSlug]);

  if (loading) {
    return <TiendaItemSkeleton />;
  }

  if (error || !post) {
    return (
      <TiendaDetailShell
        breadcrumbs={[
          { label: 'Tienda', href: '/tienda' },
          { label: storeSlug, href: `/tienda/${storeSlug}` },
          { label: 'Blog', href: `/tienda/${storeSlug}/blog` },
          { label: itemId },
          { label: 'Edit' },
        ]}
        title="Article not found"
        routePath={`/tienda/${storeSlug}/blog/${itemId}/edit`}
      >
        <Text c="dimmed">{error || 'This article does not exist.'}</Text>
      </TiendaDetailShell>
    );
  }

  return (
    <TiendaDetailShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: storeSlug, href: `/tienda/${storeSlug}` },
        { label: 'Blog', href: `/tienda/${storeSlug}/blog` },
        { label: post.documentId || post.slug || itemId, href: `/tienda/${storeSlug}/blog/${post.documentId || post.slug || itemId}` },
        { label: 'Edit' },
      ]}
      title={`Edit: ${post.title || 'Article'}`}
      routePath={`/tienda/${storeSlug}/blog/${post.documentId || post.slug || itemId}/edit`}
    >
      <BlogEditorForm
        storeSlug={storeSlug}
        mode="edit"
        itemDocumentId={post.documentId || itemId}
        initial={{
          title: post.title,
          slug: post.slug,
          content: post.content,
          seoTitle: post.seo?.metaTitle,
          seoDescription: post.seo?.metaDescription,
          seoSocialImageId: post.seo?.socialImage?.id,
          seoSocialImageDocumentId: post.seo?.socialImage?.documentId,
          coverDocumentId: post.cover?.documentId,
          tagIds: post.tags?.map((t) => t.id).filter(Boolean) ?? [],
          initialSEO: post.seo as Record<string, unknown> | undefined,
        }}
      />
    </TiendaDetailShell>
  );
}
