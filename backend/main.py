import json
import sys
from typing import Optional, Awaitable

import dm_pb2 as danmaku_proto
import tornado.netutil
import tornado.web
import tornado.process
from tornado.httpclient import AsyncHTTPClient
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop
from tornado.options import define, options
from abc import ABC
from uuid import uuid3, NAMESPACE_DNS
from diskcache import Cache
from decimal import Decimal
from loguru import logger

VERSION = 1
USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.71 Safari/537.36'
RETURN_CODE = 0
AsyncHTTPClient.configure(None, defaults=dict(user_agent=USER_AGENT))
define("port", default=15532, help="run on the given port", type=int)
logger.add("logs/file_{time}.log")


async def get_protobuf_data(url):
    response = await AsyncHTTPClient().fetch(url)
    res = []
    if response.headers.get('Content-Type').find('application/octet-stream') >= 0:
        danmaku_seg = danmaku_proto.DmSegMobileReply()
        danmaku_seg.ParseFromString(response.body)
        for item in danmaku_seg.elems:
            res.append({
                # "id": item.id,
                "progress": item.progress,
                "time": item.ctime,
                "content": item.content,
                "hash": item.midHash
            })
    else:
        return None
    return res


async def get_danmaku_data(cid: int, pack: int):
    length = int(Decimal(pack / 360).quantize(Decimal("1."), rounding="ROUND_UP"))
    res = []
    for index in range(length):
        i = str(index + 1)
        url = 'https://api.bilibili.com/x/v2/dm/web/seg.so?type=1&oid=' + str(cid) + '&segment_index=' + i
        data = await get_protobuf_data(url)
        res.extend(data)
    return res


class CacheHelper:
    def __init__(self, path='./cache'):
        self.cache = Cache(path)

    def set_cid_time_uuid(self, cid: int, duration: int):
        _val = str(cid) + '|' + str(duration)
        _uuid = str(uuid3(NAMESPACE_DNS, _val))
        logger.info('val:{} , uuid: {}'.format(_val, _uuid))
        self.cache.set(key=_uuid, value=_val)
        return _uuid

    def get_cid_time_uuid(self, _uuid):
        return self.cache.get(_uuid)

    def set_cache_danmaku(self, _uuid, value: str):
        self.cache.set(key=_uuid + '_dm', value=value, read=True, expire=300)
        logger.info('Cache Danmaku: {}_dm'.format(_uuid))

    def get_cache_danmaku(self, _uuid):
        return self.cache.get(_uuid + '_dm')


def dump_json(obj):
    return json.dumps(obj, sort_keys=True, ensure_ascii=False, separators=(',', ':'))


def normal_json(data: object):
    return dump_json({
        'code': RETURN_CODE,
        'data': data,
        'message': 'ok'
    })


def error_json(code: int, message: str):
    return dump_json({
        'code': RETURN_CODE + code,
        'message': message
    })


CACHE_INS = CacheHelper()


class BaseHandler(tornado.web.RequestHandler, ABC):

    def set_default_headers(self):
        self.set_header("Content-Type", 'application/json; charset=UTF-8')
        self.set_header("Access-Control-Allow-Origin", "https://tool.rsplwe.com")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    async def options(self, *args):
        self.set_status(204)
        await self.finish()


class MainHandler(BaseHandler, ABC):
    async def get(self):
        self.write(normal_json({"server": "Karyl Server"}))
        await self.finish()


class VideoDanmakuHandler(BaseHandler, ABC):
    TAG = 'VideoDanmakuHandler'

    async def get(self):
        _uuid = self.get_argument("id", None)
        if _uuid is None or _uuid == '':
            self.write(error_json(1, 'Illegal input'))
            await self.finish()
            return

        _val = CACHE_INS.get_cid_time_uuid(_uuid)
        if _val is None:
            self.write(error_json(4, 'ID Not Found'))
            await self.finish()
            return

        _cache = CACHE_INS.get_cache_danmaku(_uuid)
        if _cache is not None:
            logger.info('UUID: {} Return Cached'.format(_uuid))
            self.write(_cache)
            await self.finish()
            return

        cid, _time = _val.split('|')
        try:
            data = await get_danmaku_data(int(cid), int(_time))
        except Exception as e:
            logger.error("({}): {}".format(self.TAG, e))
            self.write(error_json(2, 'Internal Server Error: %s' % e))
            await self.finish()
            return
        else:
            res = normal_json(data)
            CACHE_INS.set_cache_danmaku(_uuid, res)
            self.write(res)
            await self.finish()
            return


class VideoPageListHandler(BaseHandler, ABC):
    TAG = 'VideoPageListHandler'

    async def get(self):
        video_id = self.get_argument("id", None)

        if video_id is None or not video_id.isdigit():
            self.write(error_json(1, 'Illegal input'))
            await self.finish()
            return

        try:
            http_client = AsyncHTTPClient()
            response = await http_client.fetch("https://api.bilibili.com/x/player/pagelist?aid=" + video_id)
        except Exception as e:
            logger.error("({}): {}".format(self.TAG, e))
            self.write(error_json(2, 'Internal Server Error: %s' % e))
            await self.finish()
            return
        else:
            data = json.loads(str(response.body, encoding="utf-8"))

            if data.get('code') == 0 and data.get('data') is not None:
                res = []
                for item in data.get('data'):
                    srt = CACHE_INS.set_cid_time_uuid(item.get('cid'), item.get('duration'))
                    res.append({
                        'name': item.get('part'),
                        'srt': srt
                    })
                self.write(normal_json(res))
                await self.finish()
                return
            else:
                logger.error("({}): (ID: {}) Failed to get data".format(self.TAG, video_id))
                self.write(error_json(3, '(ID: ' + video_id + ') Failed to get data'))
                await self.finish()
                return


class BangumiPageListHandler(BaseHandler, ABC):
    TAG = 'BangumiPageListHandler'

    async def get(self):
        video_id = self.get_argument("id", None)
        _type = self.get_argument("type", None)
        api_url = 'http://api.bilibili.com/pgc/view/web/season?'

        if video_id is None or not video_id.isdigit():
            self.write(error_json(1, 'Illegal input'))
            await self.finish()
            return

        if _type == 'ep':
            api_url = api_url + 'ep_id='
        elif _type == 'ss':
            api_url = api_url + 'season_id='
        else:
            self.write(error_json(1, '(Bangumi ID) Illegal input'))
            await self.finish()
            return

        try:
            http_client = AsyncHTTPClient()
            response = await http_client.fetch(api_url + video_id)
        except Exception as e:
            logger.error("({}): {}".format(self.TAG, e))
            self.write(error_json(2, 'Internal Server Error: %s' % e))
            await self.finish()
            return
        else:
            data = json.loads(str(response.body, encoding="utf-8"))
            if data.get('code') == 0 and data.get('result') is not None:
                res = []
                for item in data.get('result').get('episodes'):
                    dur = int(Decimal(item.get('duration') / 1000).quantize(Decimal("1."), rounding="ROUND_UP"))
                    srt = CACHE_INS.set_cid_time_uuid(item.get('cid'), dur)
                    res.append({
                        'name': item.get('long_title'),
                        'srt': srt
                    })
                if data.get('result').get('section') is not None:
                    for item in data.get('result').get('section'):
                        for ep in item.get('episodes'):
                            dur = int(Decimal(ep.get('duration') / 1000).quantize(Decimal("1."), rounding="ROUND_UP"))
                            srt = CACHE_INS.set_cid_time_uuid(ep.get('cid'), dur)
                            res.append({
                                'name': ep.get('title'),
                                'srt': srt
                            })

                self.write(normal_json(res))
                await self.finish()
                return
            else:
                logger.error("({}): (ID: {}) Failed to get data".format(self.TAG, video_id))
                self.write(error_json(3, '(Bangumi ID: ' + video_id + ') Failed to get data'))
                await self.finish()
                return


class VideoCoverHandler(BaseHandler, ABC):
    TAG = 'VideoCoverHandler'

    async def get(self):
        video_id = self.get_argument("id", None)

        if video_id is None or not video_id.isdigit():
            self.write(error_json(1, 'Illegal input'))
            await self.finish()
            return

        try:
            http_client = AsyncHTTPClient()
            response = await http_client.fetch("https://api.bilibili.com/x/web-interface/view?aid=" + video_id)
        except Exception as e:
            logger.error("({}): {}".format(self.TAG, e))
            self.write(error_json(2, 'Internal Server Error: %s' % e))
            await self.finish()
            return
        else:
            data = json.loads(str(response.body, encoding="utf-8"))

            if data.get('code') == 0 and data.get('data') is not None:
                res = {
                    'pic': data.get('data').get('pic')
                }
                self.write(normal_json(res))
                await self.finish()
                return
            else:
                logger.error("({}): (ID: {}) Failed to get data".format(self.TAG, video_id))
                self.write(error_json(3, '(ID: ' + video_id + ') Failed to get data'))
                await self.finish()
                return


class LiveStreamHandler(BaseHandler, ABC):
    TAG = 'LiveStreamHandler'

    async def get(self):
        live_id = self.get_argument("id", None)

        if live_id is None or not live_id.isdigit():
            self.write(error_json(1, 'Illegal input'))
            await self.finish()
            return

        try:
            http_client = AsyncHTTPClient()
            first_response = await http_client.fetch(
                "https://api.live.bilibili.com/room/v1/Room/room_init?id=" + live_id)
            first_data = json.loads(str(first_response.body, encoding="utf-8"))
            if first_data.get('code') == 0 and first_data.get('data') is not None:
                response = await http_client.fetch(
                    "https://api.live.bilibili.com/room/v1/Room/playUrl?platform=h5&qn=10000&cid=" + str(
                        first_data.get('data').get('room_id')))
            else:
                raise Exception('房间号不存在')
        except Exception as e:
            logger.error("({}): {}".format(self.TAG, e))
            self.write(error_json(2, 'Internal Server Error: %s' % e))
            await self.finish()
            return
        else:
            data = json.loads(str(response.body, encoding="utf-8"))

            if data.get('code') == 0 and data.get('data') is not None:
                res = []
                for item in data.get('data').get('durl'):
                    res.append(item.get('url'))
                self.write(normal_json(res))
                await self.finish()
                return
            else:
                logger.error("({}): (ID: {}) Failed to get data".format(self.TAG, live_id))
                self.write(error_json(3, '(ID: ' + live_id + ') Failed to get data'))
                await self.finish()
                return


if __name__ == "__main__":
    app = tornado.web.Application([
        (r"/", MainHandler),
        (r"/b/video/pagelist.json", VideoPageListHandler),
        (r"/b/video/danmaku.json", VideoDanmakuHandler),
        (r"/b/video/cover.json", VideoCoverHandler),
        (r"/b/bangumi/pagelist.json", BangumiPageListHandler),
        (r"/b/live/stream.json", LiveStreamHandler),
    ],
        compress_response=False,
        xheader=True
    )
    sockets = tornado.netutil.bind_sockets(options.port, address='0.0.0.0')
    if sys.platform != 'win32':
        tornado.process.fork_processes(0)
    server = HTTPServer(app)
    server.add_sockets(sockets)
    IOLoop.current().start()
