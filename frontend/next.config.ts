import type { NextConfig } from "next";
// const backendUrl = process.env.BACKEND_URL;
// console.log(backendUrl)
const nextConfig: NextConfig = {
  /* config options here */
  // --------------------  //
  // this 3 line automatikly coll UseMemo and UseColbeck 
    reactCompiler: true,
    experimental: {
      turbopackFileSystemCacheForDev: true,
      // transpilePackages: ['three'],

    },
    rewrites () {
      return [
        {
          source: "/backend/:path*",
          destination: `http://localhost:4000/api/:path*`,
        },
      ];
    },
};

export default nextConfig;
