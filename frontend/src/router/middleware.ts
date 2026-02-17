import type { NavigationGuardNext, RouteLocationNormalized, RouteLocationRaw, Router } from "vue-router";
import { loadingBar } from "@/utils/discrete.ts";

type MiddlewareFn = (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => void | Promise<void>;

export function setupMiddleware(router: Router) {
  const middlewareModules = import.meta.glob<{ default: MiddlewareFn }>("../middleware/*.ts", { eager: true });

  const middlewares: Record<string, MiddlewareFn> = {};

  for (const path in middlewareModules) {
    const name = path.match(/\/(\w+)\.ts$/)?.[1];
    if (name) {
      middlewares[name] = middlewareModules[path].default;
    }
  }

  router.beforeEach(async (to, from, next) => {
    const middlewareList = (to.meta.middleware as string[]) || [];

    if (!middlewareList.length) {
      return next();
    }

    for (const middlewareName of middlewareList) {
      const middleware = middlewares[middlewareName];

      if (!middleware) {
        console.error(`Middleware not found: ${middlewareName}`);
        continue;
      }

      try {
        const result = await new Promise<unknown>((resolve) => {
          middleware(to, from, ((path?: unknown) => {
            resolve(path);
          }) as NavigationGuardNext);
        });

        if (result !== undefined) {
          return next(result as RouteLocationRaw);
        }
      } catch (error) {
        console.error(`Middleware error (${middlewareName}):`, error);
        return next(false);
      }
    }

    next();
  });

  // Loading bar hooks
  router.beforeEach(() => {
    loadingBar?.start();
  });

  router.afterEach(() => {
    loadingBar?.finish();
  });

  router.onError(() => {
    loadingBar?.error();
  });
}
