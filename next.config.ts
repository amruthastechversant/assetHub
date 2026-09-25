import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

export default withSerwist(nextConfig);