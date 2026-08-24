import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['192.168.1.11'],
    },
  },
};
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
