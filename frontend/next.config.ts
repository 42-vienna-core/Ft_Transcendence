import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
