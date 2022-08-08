const _ = require("lodash");
const localEnv = require("./local-env");

const env = _.merge(
  // 保持与 localEnv 的环境信息一致
  {
    dev: {},
    test: {},
    production: {},
  },
  localEnv
);

module.exports = env[process.env.NODE_ENV] || env.dev;
