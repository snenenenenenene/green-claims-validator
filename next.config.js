/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["lh3.googleusercontent.com", "vercel.com"],
  },
  async redirects() {
    return [
      {
        source: "/github",
        //TODO: Add github link
        destination: "https://github.com",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
