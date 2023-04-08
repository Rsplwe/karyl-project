import { createApp } from "vue";
import { router } from "./router";
import App from "./App.vue";
import VueMatomo from 'vue-matomo'
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
    VueMatomo, {
      // Configure your matomo server and site by providing
      host: 'https://analytics.rsplwe.com',
      siteId: 1,
      trackerFileName: 'matomo',
      router: router,
      enableLinkTracking: true,
      requireConsent: false,
      trackInitialView: true,
      disableCookies: false,
      requireCookieConsent: false,
      enableHeartBeatTimer: true,
      heartBeatTimerInterval: 15,
      debug: false,
      userId: undefined,
      cookieDomain: undefined,
      domains: undefined,
      preInitActions: [],
      trackSiteSearch: false,
      crossOrigin: undefined,
    },
    router
  )
  .mount("#app");
