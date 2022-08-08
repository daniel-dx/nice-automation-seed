# nice-automation

非常 Nice 的平台自动化测试

> **注意：**  
> `不要人工在 tests目录 增加测试文件，也不要人工在测试文件中增加测试用例 - 全都是自动生成的`
>
> **务必：**  
> 根据 [【测试用例编写流程】](#测试用例编写流程)来编写测试用例自动化代码

## 初始化

1. 依赖安装

```sh
$ yarn install
```

2. 获取测试用例文档链接

> 如果 docconfig.json 已存在数据则忽略

打开 [平台测试用例模板](https://doc.weixin.qq.com/mind/m3_AAQAnAa_ACksHFfg60qRIyRzFj0Pk?scode=AJEAIQdfAAo3NMGDQhAAQAnAa_ACk)，点击【生成副本】，将副本的链接填写在 docconfig.json 文件中

```json
{
  "doc_url": "...",
}
```

3. 创建 .doccookie.json 文件

在根目录创建 `.doccookie.json` 文件，将登录腾讯文档后的 cookie 粘贴过来，内容如下：

```json
{
  "cookie": "...",
}
```

4. 创建 local-env.js 文件

请根据实际的需要提供一些登录相关的账号信息，可能的内容如下：

```js
module.exports = {
  dev: {
    domain: "xxx",
    user: "xxx",
    password: "xxx",
  },
  test: {
    domain: "xxx",
    user: "xxx",
    password: "xxx",
  },
  production: {
    domain: "xxx",
    user: "xxx",
    password: "xxx",
  },
};
```

## 测试用例编写流程

1. 在 [平台测试用例](https://doc.weixin.qq.com/mind/m3_AAQAnAa_ACksHFfg60qRIyRzFj0Pk?scode=AJEAIQdfAAo3NMGDQhAAQAnAa_ACk) 文档中增加测试用例

2. 运行命令自动生成用例代码

```sh
$ node sync.js
```

3. 编写用例自动化测试代码

   - 录制生成代码

     通过录制生成测试代码，然后将测试代码粘贴到对应的测试用例，根据实际情况进行代码的调整

     如何录制？请参考[【如何录制脚本】](#如何录制脚本)

   - 使用便捷的扩展方法

     - page.waitReqAndUI: 等待异步请求和 UI 变化完成

       如点击搜索，需要等待异步请求完成并且列表数据更新才能进行断言操作。示例如下：

       ```js
       await page.fill('[placeholder="搜索项目"]', "自动化");
       await page.click("button");
       await page.waitReqAndUI();
       ```

     - page.clickInElement: 点击 Element 对象中匹配的元素

       常用于列表中的某一项里的元素的操作

       ```js
       const matchElement = await page.$(".app-item-container");
       await page.clickInElement(".more-area", matchElement);
       ```

   - 常用文档

     - [page 方法](https://playwright.dev/docs/api/class-page/)

     - [element 方法](https://playwright.dev/docs/api/class-elementhandle)

     - [expect 断言](https://playwright.dev/docs/assertions)

4. 调试测试用例代码

   ```sh
   # 第一次运行这个
   $ npm run test:dev

   # 后面运行这个可提高运行效率
   $ npm run test:debug
   ```

   更详细的阅读[【执行测试用例】](#执行测试用例)

## 执行测试用例

- dev 环境测试

```
$ npm run test:dev
```

- test 环境测试

```
$ npm run test:test
```

- production 环境测试

```
$ npm run test:production
```

- ### 如何指定测试文件及用例

  - 指定运行测试文件

    示例如下：

    ```sh
    $ npm run test:dev -- tests/project.spec.js
    ```

  - 指定运行用例

    加个 `only`，示例如下：

    > 注意调试后把 only 去掉，特别是代码提交之前一定要去掉

    ```js
    test.only("搜索项目列表", async ({ page }) => {
      // ...
    });
    ```

- ### 断点调试

  推荐用 VSCode 的方式来断点调试，步骤如下：

  1. 打开 `JavaScript Debug Terminal`

  2. 在测试代码中设置断点

  3. 运行命令：`npm run test:dev`

  > 其它方式参考：https://playwright.dev/docs/debug

- ### 忽略全局登录

  为了保证用例执行时的登录状态，在所有用例执行前会先自动登录然后保存登录状态给接下来的用例执行使用。

  但在用例开发调试过程中，这个自动登录环节会拖慢执行时间，所以只要根目录已经有 `state.json` 文件（如果发现虽然该文件存在，但登录态失效，即去掉 GLOBAL_LOGIN=0 重新执行即可），就可以直接忽略掉这个环节，运行如下：

  ```sh
  $ GLOBAL_LOGIN=0 npm run test:dev
  # 或（如果都是拿 dev 环境来调试的情况）
  $ npm run test:debug
  ```

## 如何录制脚本

1. 运行打开浏览器，登录，关闭（这一步为了保留登录状态，只需执行一次）

```sh
$ npm run record-before -- <login url>
```

2. 运行以下命令进行录制

```sh
$ npm run record -- <url>
```

### 一些最佳实践

- 用例间的顺序

像 CRUD 的用例，保证 C 在最前，D 在最后，这样所有用例跑完后，可以将创建的记录回收掉（请参考 项目管理:project，对应的文件为 tests/project.spec.js）

- 开发调试

给正在开发调试的用例设置 `only`，完成后删除，再给下一个用例增加，避免其它用例的干扰

```js
test.only("删除项目", async ({ page }) => {
  ...
})
```

### Docker run

一般用于 CI

1. 构建镜像

```sh
$ docker build . -t nice-automation
```

2. 创建数据卷用于存储报告 - 只执行一次

```sh
$ docker volume create nice-automation

```

3. 运行服务

```sh
$ docker run -v nice-automation:/app/report --rm nice-automation
```
