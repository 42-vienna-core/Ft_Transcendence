import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // --------------------  //
  // this 3 line automatikly coll UseMemo and UseColbeck 
    reactCompiler: true,
    experimental: {
      turbopackFileSystemCacheForDev: true,
      // transpilePackages: ['three'],

    }
  // ---------------------------------------
}

export default nextConfig;
