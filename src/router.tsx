import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Matches Vite's `base` config (import.meta.env.BASE_URL) so routing still
    // works when the app is served from a subpath, e.g. GitHub Pages project sites.
    basepath: import.meta.env.BASE_URL,
  });

  return router;
};
