import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Media uploads go through a server action, and the default body cap is
      // 1 MB. Deliberately a literal: the config is compiled in its own module
      // graph, and pulling constant.ts into it as well left the browser holding
      // a half-initialised copy of that module. Keep in step with
      // MEDIA_MAX_BYTES in constant.ts.
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
