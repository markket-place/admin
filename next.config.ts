const path = require('path');
/** @type {import('next').NextConfig} */

const isProd = (process.env.NODE_ENV === 'production') as Boolean;

const nextConfig = {
  basePath: '',
  async headers() {
    const baseHeaders = [
      {
        source: '/.well-known/apple-app-site-association',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300',
          },
        ],
      },
      {
        source: '/apple-app-site-association',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300',
          },
        ],
      },
      {
        source: '/.well-known/assetlinks.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300',
          },
        ],
      },
      {
        source: '/loaderio-59f9e32c73cd0e393774d04dd5f263f1.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain',
          },
        ],
      },
    ];

    const staticAssetHeaders = [
      {
        // Long-lived cache for Next.js static assets (hashed filenames are content-addressed)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache Next.js optimized images for 30 days
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
    ];

    return isProd ? [...baseHeaders, ...staticAssetHeaders] : baseHeaders;
  },

  async rewrites() {
    return {
      beforeFiles: [
        // 1. Subdomain root: tigerlily.markket.place -> /store/tigerlily
        {
          source: '/',
          has: [
            {
              type: 'host',
              value: '(?<slug>[^.]+)\\.markket\\.place',
            },
          ],
          destination: '/store/:slug',
        },
        // 2. Subdomain subpaths: tigerlily.markket.place/events -> /store/tigerlily/events
        {
          source: '/:path((?!_next|api).*)',
          has: [
            {
              type: 'host',
              value: '(?<slug>[^.]+)\\.markket\\.place',
            },
          ],
          destination: '/store/:slug/:path*',
        },
      ],
      afterFiles: [
        {
          source: '/:slug((?!dashboard|tienda|me|api|docs|stores|auth|about|newsletter|_next|\\.well-known|apple-app-site-association).*)',
          destination: '/store/:slug',
        },
        {
          source: '/:slug((?!dashboard|tienda|me|api|docs|stores|auth|about|newsletter|_next|\\.well-known|apple-app-site-association).*)/:path*',
          destination: '/store/:slug/:path*',
        },
      ],
    };
  },

  async redirects() {
    return [
      // Strip duplicate /:slug when already on slug.markket.place
      // e.g. tigerlily.markket.place/tigerlily/events -> tigerlily.markket.place/events
      {
        source: '/:slug',
        has: [
          {
            type: 'host',
            value: '(?<slug>[^.]+)\\.markket\\.place',
          },
        ],
        destination: '/',
        permanent: false,
      },
      {
        source: '/:slug/:path*',
        has: [
          {
            type: 'host',
            value: '(?<slug>[^.]+)\\.markket\\.place',
          },
        ],
        destination: '/:path*',
        permanent: false,
      },

      // Existing path redirects
      {
        source: '/me/tienda',
        destination: '/tienda',
        permanent: true,
      },
      {
        source: '/me/tienda/:path*',
        destination: '/tienda/:path*',
        permanent: true,
      },
      {
        source: '/store/:slug',
        destination: '/:slug',
        permanent: true,
      },
      {
        source: '/store/:slug/:path*',
        destination: '/:slug/:path*',
        permanent: true,
      },
    ];
  },

  images: {
    minimumCacheTTL: 2592000,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'objects.markket.place',
        port: '',
        pathname: '/**',
        search: '',
      },
      {
        protocol: 'https',
        hostname: 'markketplace.nyc3.cdn.digitaloceanspaces.com',
        port: '',
        pathname: '/**',
        search: '',
      },
      {
        protocol: 'https',
        hostname: 'markketplace.nyc3.digitaloceanspaces.com',
        port: '',
        pathname: '/**',
        search: '',
      },
      {
        protocol: 'https',
        hostname: 'markket-storage-yz8z7g6wj.t3.storageapi.dev',
        port: '',
        pathname: '/**',
        search: '',
      },
    ],
  },
  turbopack: {
    root: path.join(__dirname, '../../'),
  },
};

export default nextConfig;
