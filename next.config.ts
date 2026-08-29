/** @type {import('next').NextConfig} */
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@huggingface/transformers', 'pdf-parse', 'xlsx'],
};

export default nextConfig;
