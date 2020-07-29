"use strict";
// Template version: 1.3.1
// see http://vuejs-templates.github.io/webpack for documentation.

// 测试

//var apiURL = "http://8.129.208.95:8001/Service.svc"; //知行易通
//var apiURL = "http://39.99.185.176:8001/Service.svc";//齐畅
//var apiURL = "http://192.168.137.1:8001/Service.svc"; //恒嘉
var apiURL = "http://8.129.208.95:8004/api"; 


const path = require("path");

module.exports = {
  dev: {
    // Paths
    assetsSubDirectory: "static",
    // assetsPublicPath: "./",
    assetsPublicPath: "/",
    // 设置代理服务器
    proxyTable: {
      "/test": {
        target: apiURL,
        changeOrigin: true,
        pathRewrite: {
          "^/test": "/test"
        }
      }
    },

    // Various Dev Server settings
    host: "localhost",
    // can be overwritten by process.env.HOST
    port: 8080, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    autoOpenBrowser: true,
    errorOverlay: true,
    notifyOnErrors: true,
    poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-

    /**
     * Source Maps
     */

    // https://webpack.js.org/configuration/devtool/#development
    devtool: "cheap-module-eval-source-map",

    // If you have problems debugging vue-files in devtools,
    // set this to false - it *may* help
    // https://vue-loader.vuejs.org/en/options.html#cachebusting
    cacheBusting: true,
    cssSourceMap: true
  },

  build: {
    //新增
    testEnv: require("./test.env"),
    prodEnv: require("./prod.env"),
    devEnv: require("./dev.env"),

    // Template for index.html
    index: path.resolve(__dirname, "../dist/index.html"),

    // Paths
    assetsRoot: path.resolve(__dirname, "../dist"),
    assetsSubDirectory: "static",
    // assetsPublicPath: "/",
    assetsPublicPath: "./",

    /**
     * Source Maps
     */
    // 打包后是否取消map文件
    productionSourceMap: false,
    // https://webpack.js.org/configuration/devtool/#production
    devtool: "#source-map",

    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ["js", "css"],

    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  }
};
