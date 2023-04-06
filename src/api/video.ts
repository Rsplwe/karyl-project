import request from "@/utils/Request";

export function fetchNormalPageList(id: number) {
  return request({
    url: "/b/video/pagelist.json",
    method: "GET",
    params: {
      id: id,
    },
  });
}

export function fetchBangumiPageList(type: string, id: number) {
  return request({
    url: "/b/bangumi/pagelist.json",
    method: "GET",
    params: {
      type: type,
      id: id,
    },
  });
}

export function fetchDanmakuList(id: string) {
  return request({
    url: "/b/video/danmaku.json",
    method: "GET",
    params: {
      id: id,
    },
  });
}

export function fetchVideoCover(id: string) {
  return request({
    url: "/b/video/cover.json",
    method: "GET",
    params: {
      id: id,
    },
  });
}
