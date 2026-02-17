import { createRouter, createWebHistory } from "vue-router";
import routes from "~pages";
import { setupMiddleware } from "./middleware";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

setupMiddleware(router);

export default router;
