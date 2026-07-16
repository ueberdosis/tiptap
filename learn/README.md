# Tiptap 源码学习地图

这套资料面向希望系统学习 Tiptap、ProseMirror 与浏览器富文本编辑原理的开发者。内容以当前仓库源码为准，而不是只解释公开 API。

## 学习目标

完成这套学习后，你应该能够：

1. 画出 Tiptap monorepo、Core、Extension、ProseMirror 与框架绑定的分层图。
2. 解释一次键盘输入、粘贴、命令或协作更新如何变成 Transaction 并更新 DOM。
3. 从零定义 Schema、Node、Mark、Command、Plugin、InputRule、PasteRule 与 NodeView。
4. 分清模型 Selection、DOM Selection、文档 Position 和屏幕坐标。
5. 解释 IME、移动端、剪贴板、拖放、SSR 和异步浮层的主要难点。
6. 阅读复杂扩展，并能设计可测试、可清理、可协作的扩展。
7. 回答富文本编辑器与 Tiptap/ProseMirror 高频面试题。

具体成功标准和阶段安排见 [00-learning-goal.md](./00-learning-goal.md)。

## 推荐顺序

### 第一阶段：建立全局模型

1. [01-architecture.md](./01-architecture.md) — 仓库与运行时架构
2. [02-rich-text-browser.md](./02-rich-text-browser.md) — 浏览器富文本基础
3. [03-prosemirror-model-schema.md](./03-prosemirror-model-schema.md) — 文档模型与 Schema
4. [04-state-transaction-selection.md](./04-state-transaction-selection.md) — State、Transaction、Selection、Mapping

### 第二阶段：理解运行链路

5. [05-editorview-browser-events.md](./05-editorview-browser-events.md) — EditorView 与浏览器事件
6. [06-tiptap-core-lifecycle.md](./06-tiptap-core-lifecycle.md) — Tiptap Editor 生命周期
7. [07-extensions-commands-rules.md](./07-extensions-commands-rules.md) — 扩展、命令、规则与插件
8. [08-nodeview-frameworks.md](./08-nodeview-frameworks.md) — NodeView 与 React/Vue

### 第三阶段：工程与高级能力

9. [09-complex-extensions-collaboration.md](./09-complex-extensions-collaboration.md) — 表格、列表、Suggestion、协作
10. [10-serialization-ssr.md](./10-serialization-ssr.md) — HTML、JSON、SSR、静态渲染
11. [11-testing-debugging.md](./11-testing-debugging.md) — 测试、调试与兼容性
12. [12-source-reading-labs.md](./12-source-reading-labs.md) — 源码阅读实验
13. [13-interview-guide.md](./13-interview-guide.md) — 面试题与回答框架

## 核心心智模型

```text
Browser events / DOM mutations
              │
              ▼
ProseMirror EditorView
              │ dispatch(Transaction)
              ▼
ProseMirror EditorState ── Schema 约束文档合法性
              │
              ▼
Tiptap Editor / ExtensionManager / CommandManager
              │
      ┌───────┴────────┐
      ▼                ▼
React / Vue UI     Extensions / Plugins
```

请始终记住：

- **文档真源是 `EditorState.doc`，不是 `innerHTML`。**
- **修改状态的正规入口是 `Transaction`。**
- **Schema 决定什么文档合法，命令只是在合法空间内变换文档。**
- **ProseMirror 管理可编辑内容 DOM；React/Vue 主要管理外部 UI 和 NodeView 外壳。**
- **Tiptap 是 ProseMirror 的扩展编排与开发体验层，不是另一套编辑内核。**

## 版本与资料边界

本资料基于当前仓库中的：

- `@tiptap/pm`：`3.27.4`
- `prosemirror-model`：`^1.25.9`
- `prosemirror-state`：`^1.4.4`
- `prosemirror-transform`：`^1.12.0`
- `prosemirror-view`：`^1.41.9`
- React：`^19.0.0`
- Node.js：`>=24`

版本以 `packages/pm/package.json` 和根 `package.json` 为准。源码发生变化时，应优先相信当前实现和测试。

## 外部参考

- [ProseMirror 中文参考手册](https://prosemirror.xheldon.com/docs/ref/)
- [Schema 中文参考](https://prosemirror.xheldon.com/docs/ref/#model.Schema)
- [ProseMirror 官方指南](https://prosemirror.net/docs/guide/)
- [ProseMirror 官方参考](https://prosemirror.net/docs/ref/)
- [Tiptap 官方文档](https://tiptap.dev/docs)

中文参考适合快速理解，遇到类型、边界条件或翻译歧义时，请对照英文原文与仓库锁定版本源码。

## 学习方法

每篇建议使用四步：

1. 先不看源码，用自己的话复述概念。
2. 按“源码入口”打开 2～4 个关键文件。
3. 完成文末自测或实验，不只阅读。
4. 用 `13-interview-guide.md` 中的问题做口头表达训练。

不要试图一次记住所有 API。优先掌握不变量、数据流和所有权边界。