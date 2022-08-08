const axios = require("axios");
const _ = require("lodash");
const fs = require("fs-extra");
const path = require("path");
const docConfig = require("./docconfig.json");
const existCases = require("./case.json");

async function fetchDocData() {
  const getApi = getGetApi();
  let res = await axios.get(getApi, {
    headers: {
      cookie: docConfig.cookie,
    },
  });
  const downloadUrl = _.get(
    res,
    "data.data.collab_client_vars.fileData.download_url"
  );
  if (!downloadUrl) {
    console.error("请提供正确的腾讯文档登录cookie");
    return null;
  }
  res = await axios.get(downloadUrl);
  const { leftChildren = [], children = [] } = res.data || {};
  return _.concat(leftChildren, children).filter(
    (item) => item.title.indexOf(":") >= 0
  );
}

async function main() {
  try {
    // 获取用例数据
    const childrenItems = await fetchDocData();
    if (!childrenItems) return;

    // 判断需要创建和修改哪些用例文件
    for (let suiteItem of childrenItems) {
      const existOne = _.find(existCases, (item) => item.id === suiteItem.id);
      const [title, fileName] = suiteItem.title.split(":");

      if (existOne) {
        // 处理用例文件的修改

        const [oldTitle, oldFileName] = existOne.title.split(":");
        let oldContent = await fs.readFile(
          path.resolve("tests/", `${transformFileName(oldFileName)}.spec.js`),
          "utf8"
        );

        // 需要修改文件名
        if (oldFileName !== fileName) {
          await fs.rename(
            path.resolve("tests/", `${transformFileName(oldFileName)}.spec.js`),
            path.resolve("tests/", `${transformFileName(fileName)}.spec.js`)
          );
        }

        // 需要修改测试集合名
        if (oldTitle !== title) {
          oldContent = oldContent.replace(
            /test.describe\(['"].*?['"]/,
            `test.describe('${title}'`
          );
        }

        // 判断需要创建和修改哪些用例
        for (let sItem of suiteItem.children) {
          const foundOne = existOne.children.find(
            (eItem) => eItem.id === sItem.id
          );
          if (foundOne) {
            // 需要修改用例名
            const sItemTitle = handleTitle(sItem.title);
            if (sItem.title !== foundOne.title) {
              oldContent = oldContent.replace(
                new RegExp(
                  `// id:${sItem.id}\\n\\s+test(\\.(only|skip))?\\(['"].*?['"],`
                ),
                `// id:${sItem.id}\n    test${
                  sItemTitle.isSkip ? ".skip" : ""
                }('${sItemTitle.title}',`
              );
            }

            // 判断需要创建和修改哪些期望描述
            for (let cItem of sItem.children) {
              const foundChild = foundOne.children.find(
                (eItem) => eItem.id === cItem.id
              );
              if (foundChild) {
                // 修改期望
                oldContent = oldContent.replace(
                  new RegExp(`.*\\[${cItem.id}\\].*`),
                  `    /* ${cItem.title} [${cItem.id}] */`
                );
              } else {
                // 增加期望
                oldContent = oldContent.replace(
                  `// <!-- Don't touch me - add case code - ${sItem.id} -->`,
                  `${getTestInnerCode(cItem)}
    // <!-- Don't touch me - add case code - ${sItem.id} -->`
                );
              }

              // 删除期望 - 暂时不实现
            }
          } else {
            // 需要增加用例
            oldContent = oldContent.replace(
              "// <!-- Don't touch me - add test case -->",
              `${getTestCode(sItem)}

  // <!-- Don't touch me - add test case -->`
            );
          }
        }

        // 是否需要删除用例 - 暂时不实现

        await fs.writeFile(
          path.resolve("tests/", `${transformFileName(fileName)}.spec.js`),
          oldContent,
          "utf8"
        );
      } else {
        // 增加用例文件
        const caseCodes = suiteItem.children.map((cItem) => {
          return getTestCode(cItem);
        });

        await fs.writeFile(
          path.resolve("tests/", `${transformFileName(fileName)}.spec.js`),
          getSuiteCode(title, caseCodes),
          "utf8"
        );
      }
    }

    // 删除用例文件。暂时不实现

    // 保存用例
    await fs.writeFile(
      path.resolve("./case.json"),
      JSON.stringify(childrenItems, null, 2),
      "utf8"
    );

    console.info("同步成功，已自动生成用例相关文件和测试代码");
  } catch (e) {
    console.error(e);
    console.error(
      "大概率是腾讯文档登录 cookie 失效，请重新访问腾讯文档获取 cookie，更新到 doccookie.json"
    );
  }
}

function getGetApi() {
  const { doc_url, cookie } = docConfig;
  const [, tok] = cookie.match(/TOK=(.*?);/);
  const [, id, urlQuery] = doc_url.match(/^.*\/([^\/]*?)\?(.*)$/);
  return `https://doc.weixin.qq.com/dop-api/mind/data/get?id=${id}&normal=1&xsrf=${tok}&${urlQuery}`;
}

function handleTitle(title) {
  const isSkip = title.indexOf("[TODO]") === 0;
  return {
    isSkip,
    title: isSkip ? title.replace("[TODO]", "") : title,
  };
}

function transformFileName(fileName) {
  return _.chain(fileName).words().join(" ").kebabCase().value();
}

function getSuiteCode(title, caseCodes) {
  return `
const { test, expect } = require("@playwright/test");
const utils = require("../utils");

test.use({ storageState: "state.json" });

test.describe('${title}', () => {
  test.beforeEach(async ({ page }) => {
    utils.extendPage(page);
  });
  ${caseCodes.join("")}

  // <!-- Don't touch me - add test case -->
});`;
}

function getTestCode(item) {
  const codes = item.children.map((cItem) => {
    return getTestInnerCode(cItem);
  });

  const titleRes = handleTitle(item.title);

  return `
  // id:${item.id}
  test${titleRes.isSkip ? ".skip" : ""}('${
    titleRes.title
  }', async ({ page }) => {
    expect("请编写 ${
      titleRes.title
    } 测试用例代码").toBe("用例代码编写后，记得把我删掉");
    ${codes.join("\n")}

    // <!-- Don't touch me - add case code - ${item.id} -->
  });`;
}

function getTestInnerCode(item) {
  return `
    /* ${item.title} [${item.id}] */
    
    /* 步骤 */
    // 在这里编写操作步骤的代码
    
    /* 断言 */
    // 在这里编写断言的代码
    
    /* --------------------------------------- */`;
}

main();
