/** @type {import('next').NextConfig} */
const url = new URL(`${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
const nextConfig = {
  // reactStrictMode: false,
  // webpack: (config) => {
  //   config.ignoreWarnings = [{ module: /node_modules/, message: /source map/ }];
  //   return config;
  // },

  // To be removed if necessecary
  skipTrailingSlashRedirect: true,
  skipProxyUrlNormalize: true,
  cacheComponents: true,

  transpilePackages: ["@workspace/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: url.hostname,
      },
    ],
  },
};

export default nextConfig;
