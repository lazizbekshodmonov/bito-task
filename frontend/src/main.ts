import { createApp } from "vue";
import { createPinia } from "pinia";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { queryClient } from "./utils/query-client";
import router from "./router";
import App from "./App.vue";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(VueQueryPlugin, { queryClient });

app.mount("#app");
