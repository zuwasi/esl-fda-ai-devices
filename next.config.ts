/** @type {import('next').NextConfig} */
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@huggingface/transformers'],
};

export default nextConfig;
