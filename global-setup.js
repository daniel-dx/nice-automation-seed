const { chromium } = require("@playwright/test");
const envConfig = require("./env.js");

module.exports = async () => {
  if (process.env.GLOBAL_LOGIN !== "0") {
    // 全局登录逻辑，保证运行用例的时候不再登录
    // const browser = await chromium.launch();
    // const page = await browser.newPage();
    // await page.goto(`${envConfig.domain}/user/login`);
    // // TODO
    // await page.context().storageState({ path: "state.json" });
    // await browser.close();
  }
};
