"use strict";
const merge = require("webpack-merge");
const prodEnv = require("./prod.env");

module.exports = {
  NODE_ENV: '"development"',
  ENV_CONFIG: "'dev'",
  BASE_API: "'http://8.129.208.95:8004/api'" //知行易通
};
