const { chromium } = require("@playwright/test");
const envConfig = require("./env.js");

module.exports = async () => {
  if (process.env.GLOBAL_LOGIN !== '0') {
    // 全局登录，保证运行用例的时候不再登录
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`${envConfig.domain}/user/login`);
    await page.fill('[placeholder="手机号码/用户名"]', envConfig.user);
    await page.fill('[placeholder="密码"]', envConfig.password);
    await Promise.all([
      page.waitForNavigation(),
      page.click('button:has-text("登 录")'),
    ]);
    await page.context().storageState({ path: "state.json" });
    await browser.close();
  }
};
