"use strict";
const merge = require("webpack-merge");
const prodEnv = require("./prod.env");

module.exports = {
  NODE_ENV: '"development"',
  ENV_CONFIG: "'dev'",
  BASE_API: "''" //知行易通
   //BASE_API:"'http://39.99.185.176:8001/Service.svc'"   //齐畅
  //BASE_API:"'http://192.168.137.1:8001/Service.svc'", // 恒嘉
};
