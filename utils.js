module.exports = {
  genId(num) {
    if (!num) num = 5;
    if (num > 10) num = 10;
    return Math.random()
      .toString(36)
      .substring(2, num + 1);
  },

  extendPage(page) {
    /**
     * 等待异步请求完成和UI更新
     */
    page.waitReqAndUI = async () => {
      await page.waitForEvent("requestfinished");
      await page.waitForTimeout(1500);
    };
    /**
     * 点击在指定 Element 内匹配的 Selector 的元素
     */
    page.clickInElement = async (selector, element) => {
      const matchElement = await element.$(selector);
      await matchElement.click();
    };
  },
};
