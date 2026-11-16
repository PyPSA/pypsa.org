import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // Every route is prerendered, Cloudflare serves build/ as static assets.
    adapter: adapter({ pages: "build", assets: "build", strict: true }),
    paths: {
      base: process.env.BASE_PATH || "",
      // Root-absolute asset URLs, so the prerendered 404.html works at any missed depth.
      relative: false,
    },
    prerender: {
      handleHttpError: ({ path, message }) => {
        // Ignore paths that don't start with base path during prerender
        if (path === "/" && process.env.BASE_PATH) {
          return;
        }
        throw new Error(message);
      },
    },
  },
};

export default config;
