// @ts-check
import { defineConfig } from "astro/config";

// الموقع منشور على https://atad-tech.github.io (الجذر).
// لما يبقى فيه دومين خاص: غيّر SITE_URL بس.
const SITE_URL = "https://atad-tech.github.io";
const BASE = "/";

export default defineConfig({
  site: SITE_URL,
  base: BASE,
  trailingSlash: "always",
  build: { format: "directory", inlineStylesheets: "auto" },
  compressHTML: true,
  prefetch: { prefetchAll: false, defaultStrategy: "hover" },
});
