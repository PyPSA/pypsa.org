import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // Cloudflare Workers: every route is prerendered and shipped as a static
    // asset via the ASSETS binding. The worker only serves those assets.
    adapter: adapter(),
    paths: {
      base: process.env.BASE_PATH || "",
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
