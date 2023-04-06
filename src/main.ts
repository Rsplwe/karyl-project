import { createApp } from "vue";
import { router } from "./router";
import App from "./App.vue";
import VueGtag from "vue-gtag";
import mdui from "mdui";

mdui
  .$("body")
  .addClass(
    "mdui-drawer-body-left mdui-theme-primary-blue-indigo mdui-theme-accent-pink"
  );

router.afterEach((to) => {
  const baseTitle = " - 哔哩哔哩工具箱";
  if (to.name === undefined) {
    window.document.title = "404";
    return;
  }
  window.document.title = `${to.meta.pageTitle}${baseTitle}`;
});

createApp(App)
  .use(router)
  .use(
    VueGtag,
    {
      pageTrackerScreenviewEnabled: true,
      config: { id: "G-SMXPN2V2GY" },
    },
    router
  )
  .mount("#app");
