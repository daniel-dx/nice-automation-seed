
const { test, expect } = require("@playwright/test");
const utils = require("../utils");

test.use({ storageState: "state.json" });

test.describe('搜索', () => {
  test.beforeEach(async ({ page }) => {
    utils.extendPage(page);
    // await page.gotoWeda("/admin/project");
  });
  
  // id:94b58acee3c8
  test('搜索“蛋先生dx”', async ({ page }) => {
    expect("请编写 搜索“蛋先生dx” 测试用例代码").toBe("用例代码编写后，记得把我删掉");
    
    /* 期望：显示“蛋先生dx”相关搜索记录 [b387898ac9dc] */
    
    /* 步骤 */
    // 在这里编写操作步骤的代码
    
    /* 断言 */
    // 在这里编写断言的代码
    
    /* --------------------------------------- */

    // <!-- Don't touch me - add case code - 94b58acee3c8 -->
  });

  // <!-- Don't touch me - add test case -->
});