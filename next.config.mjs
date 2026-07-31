/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const basePath = process.env.BASE_PATH ?? (isProd ? '/sumura-sake' : '');

const nextConfig = {
  output: 'export',
  trailingSlash: false,
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_ASSET_BASE: process.env.ASSET_BASE ?? basePath,
  },
};

export default nextConfig;
