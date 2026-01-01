/** @type {import('next').NextConfig} */
const url = new URL(`${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: url.hostname,
      },
    ],
  },
  transpilePackages: ["@workspace/ui"],
};

export default nextConfig;
