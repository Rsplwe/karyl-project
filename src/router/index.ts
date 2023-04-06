import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import {
  MATERIAL_ICON_HOME,
  MATERIAL_ICON_TRANSLATE,
  MATERIAL_ICON_SEARCH,
  MATERIAL_ICON_LIVE_TV,
  MATERIAL_ICON_IMAGE,
  MATERIAL_ICON_LOOP,
  MATERIAL_ICON_FAVORIVE,
  MATERIAL_ICON_INFO,
} from "@/utils/MaterialIcons";
import HomeView from "@/views/HomeView.vue";
import JapanesePronunciationView from "@/views/JapanesePronunciationView.vue";
import DanmakuSearchView from "@/views/DanmakuSearchView.vue";
import LiveStreamView from "@/views/LiveStreamView.vue";
import VideoCoverView from "@/views/VideoCoverView.vue";
import BvAvMutualView from "@/views/BvAvMutualView.vue";
import DonateView from "@/views/DonateView.vue";
import AboutView from "@/views/AboutView.vue";

export const routerDefine = [
  {
    path: "/",
    name: "Home",
    meta: {
      pageTitle: "首页",
      pageIcon: MATERIAL_ICON_HOME,
      pageDescription: "",
    },
    component: HomeView,
  },
  {
    path: "/donate",
    name: "Donate",
    meta: {
      pageTitle: " 捐赠",
      pageIcon: MATERIAL_ICON_FAVORIVE,
      pageDescription: "",
    },
    component: DonateView,
  },
  {
    path: "/japanese-pronunciation",
    name: "JapanesePronunciation",
    meta: {
      pageTitle: "日文注音",
      pageIcon: MATERIAL_ICON_TRANSLATE,
      pageDescription: "转换日文为假名&罗马音",
    },
    component: JapanesePronunciationView,
  },
  {
    path: "/video-cover",
    name: "VideoCover",
    meta: {
      pageTitle: "获取视频封面",
      pageIcon: MATERIAL_ICON_IMAGE,
      pageDescription: "好看的封面都到碗里来",
    },
    component: VideoCoverView,
  },
  {
    path: "/live-stream",
    name: "LiveStream",
    meta: {
      pageTitle: "获取b站直播视频流",
      pageIcon: MATERIAL_ICON_LIVE_TV,
      pageDescription: "这才是看直播嘛",
    },
    component: LiveStreamView,
  },
  {
    path: "/bv-av-mutual",
    name: "BvAvMutual",
    meta: {
      pageTitle: "BV & AV互转",
      pageIcon: MATERIAL_ICON_LOOP,
      pageDescription: "BV号和AV号的互转",
    },
    component: BvAvMutualView,
  },
  {
    path: "/danmaku-search",
    name: "DanmakuSearch",
    meta: {
      pageTitle: "查询弹幕发送者",
      pageIcon: MATERIAL_ICON_SEARCH,
      pageDescription: "顾名思义的功能",
    },
    component: DanmakuSearchView,
  },
  {
    path: "/about",
    name: "About",
    meta: {
      pageTitle: "关于",
      pageIcon: MATERIAL_ICON_INFO,
      pageDescription: "",
    },
    component: AboutView,
  },
];
const constantRoutes: Array<RouteRecordRaw> = routerDefine;

export const router = createRouter({
  routes: constantRoutes,
  history: createWebHistory(),
});
