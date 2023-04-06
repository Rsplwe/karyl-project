import axios from "axios";
import { ticket } from "./ticket";

export async function translate(
  text: string,
  signal: AbortController
): Promise<string> {
  const postData = "q=" + encodeURIComponent(text);
  const requestUrl = "/google-api/single?client=t&sl=ja&dt=rm&tk=" + ticket(text);
  return axios
    .post(requestUrl, postData, {
      headers: { "content-type": "application/x-www-form-urlencoded" },
      signal: signal.signal,
    })
    .then((resp) => {
      console.log(resp.status);
      if (resp.status != 200) {
        throw `Server returned status code ${resp.status}`;
      }
      return resp.data;
    })
    .then((json) => {
      let elem0 = json[0];
      if (elem0 != null) {
        return elem0[0][3];
      } else {
        throw "Not Japanese";
      }
    });
}
