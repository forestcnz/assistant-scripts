# 雕雕助手脚本市场

在雕雕助手中打开「任务 → 脚本市场」，搜索并导入公开任务。也可以在 `scripts/` 中查看每个版本的脚本、流程和素材。

## 投稿

1. 从雕雕助手导出一个单任务 ZIP，在 `scripts/应用名/任务名/` 里提交解包后的 `task.js`、必要的 `config.json`、可选的 `flow.json` 和该任务用到的 `images/`。
2. 参考现有任务填写 `release.json`。`targetApp` 填应用名称，`scriptId` 填稳定的脚本 ID。请写清起始页面、操作、预期结果和实际验证过的适配环境。通用任务放在 `scripts/通用/`，可以省略 `targetApp` 和 `targetPackage`。
3. 发 PR。维护者审阅源码、流程和素材，复现后合并。请确认你有权公开分发所提交的内容，并去除截图和脚本中的个人信息。
4. 更新脚本时直接修改任务目录里的文件，沿用原脚本 ID。下架时删除该任务目录，再发布市场目录。

## 打包

运行 `python3 tools/build_catalog.py --output dist`。它从当前 Git 提交生成 `catalog.json` 和单任务 ZIP，输出包仅包含任务文件。合并到 `main` 后，维护者在最新提交上使用已登录的 GitHub CLI 运行 `python3 tools/publish.py`，把目录和 ZIP 一起发布为 Release。App 读取最新 Release 的 `catalog.json`，并从该目录指定的提交快照下载 ZIP。
