import type { NextConfig } from "next";
import { withPayload } from '@payloadcms/next/withPayload';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default withPayload(nextConfig);
