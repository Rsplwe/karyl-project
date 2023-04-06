<div align="center">

[![logo](https://github.com/Rsplwe/karyl-project/raw/main/public/img/icons/android-chrome-192x192.png)](https://github.com/Rsplwe/karyl-project)

# 哔哩哔哩工具箱

[![GitHub License](https://img.shields.io/github/license/Rsplwe/karyl-project?style=flat-square)](https://github.com/Rsplwe/karyl-project/blob/main/LICENSE) [![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/Rsplwe/karyl-project/vue.js.yml?branch=main&style=flat-square)](https://github.com/Rsplwe/karyl-project/actions/workflows/vue.js.yml) 

</div>

提供弹幕发送者查询、视频封面提取、BV号转AV号、获取直播视频流及日文注音等功能

如果有更好的想法，欢迎提交 issue 或者 pr

## 在线访问

**[tool.rsplwe.com](https://tool.rsplwe.com)**

## 推荐使用的开发工具

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)


## 构建步骤

需要 Node.js 版本 >= 14.18.0

### 获取项目文件

通过 Git 克隆本项目的文件（需要安装：[Git](https://git-scm.com/)）：

```bash
git clone https://github.com/Lytsu/lowlight.git
```

### 安装项目依赖

```bash
npm install
```

### 本地调试

```bash
npm run dev
```

这条命令会启动一个用于调试的本地服务器，请复制终端输出的Url到浏览器打开。

对源码的更改都是实时反映在页面上的，除非遇到问题，您不需要手动重启这个本地服务器。

对于默认请求的 API 地址会受到浏览器 CORS 的跨域限制，请安装可以禁用掉CORS的扩展或手动设置浏览器 Flag 以禁用跨域限制。

### 构建站点

```bash
npm run build
```

这条命令会在 `dist` 目录生成静态内容。

## 引用的项目

- **[yescallop/janotator](https://github.com/yescallop/janotator)**
- **[zdhxiong/mdui](https://github.com/zdhxiong/mdui)**
- **[beatgammit/crc32](https://github.com/beatgammit/crc32)**
- **[fancyapps/ui](https://github.com/fancyapps/ui)**
- **[zenorocha/clipboard.js](https://github.com/zenorocha/clipboard.js)**
- **[lodash](https://github.com/lodash/lodash)**
- **[MatteoGabriele/vue-gtag](https://github.com/MatteoGabriele/vue-gtag)**
- **[vuejs/vue](https://github.com/vuejs/vue)**
- **[axios](https://github.com/axios/axios)**
