import request from "@/utils/Request";

export function fetchLiveStream(id: string) {
  return request({
    url: "/b/live/stream.json",
    method: "GET",
    params: {
      id: id,
    },
  });
}
