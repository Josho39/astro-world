/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
            "krc20data.s3.amazonaws.com",
      "krc20data.s3.us-east-1.amazonaws.com"
    ],
  },
}

export default nextConfig