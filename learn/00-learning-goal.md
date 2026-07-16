# 学习目标与阶段计划

## 目标定义

本目录的目标不是整理一份 API 抄录，而是建立一套可验证的源码能力。

### 总目标

通过 4 个阶段完成 Tiptap 源码学习，并产出可在面试中清晰表达的架构、原理和工程实践知识。

### 可衡量的完成标准

完成后应能独立做到：

- 15 分钟内画出浏览器、ProseMirror、Tiptap Core、扩展和 React/Vue 的架构图。
- 10 分钟内讲清一次输入到 `Transaction`、`EditorState` 和 DOM 更新的链路。
- 不查文档写出一个包含 Attribute、Command、Shortcut、InputRule 和 HTML 往返的扩展骨架。
- 正确解释 `Schema`、`NodeSpec`、`MarkSpec`、`Slice`、`ResolvedPos`、`Step`、`Mapping`、`PluginKey`。
- 说明为什么 NodeView 需要 `dom`、`contentDOM`、`stopEvent()`、`ignoreMutation()`。
- 设计 IME、Paste、Drop、SSR、协作和异步 Suggestion 的测试方案。
- 对 `learn/13-interview-guide.md` 中至少 80% 的题目进行无稿回答。

## 阶段一：全局架构与基础模型

建议用时：2～3 天。

学习内容：

- monorepo 包职责和依赖方向；
- `contenteditable` 的能力与问题；
- ProseMirror 文档树、Schema、Node、Mark；
- position、selection、transaction 的基本含义。

验收任务：

1. 画出静态分层图和运行时数据流图。
2. 手工计算一个 `doc(paragraph("abc"))` 中常见 position。
3. 说明为什么 HTML 不能直接作为协作和历史记录的真源。
4. 找到 Paragraph、Bold、Document 三个扩展如何进入 Schema。

## 阶段二：编辑运行链路

建议用时：3～4 天。

学习内容：

- `EditorView` 事件、DOM Observer 和 Selection 同步；
- Tiptap `Editor` 创建、挂载、Transaction 分发和销毁；
- `ExtensionManager`、`CommandManager`；
- keymap、input rules、paste rules、plugins。

验收任务：

1. 跟踪 `editor.chain().focus().toggleBold().run()`。
2. 对比单命令、chain 和 `can()` 的 dispatch 行为。
3. 解释 `applyTransaction()` 为什么不仅返回一个新 State。
4. 给一个自定义 Plugin 添加 State、Decoration 和销毁逻辑。

## 阶段三：浏览器与框架边界

建议用时：3～4 天。

学习内容：

- IME、移动端软键盘、Selection、Clipboard、Drag/Drop；
- NodeView 与 MarkView；
- React Portal、`useSyncExternalStore`；
- Vue 响应式包装；
- Bubble/Floating/Suggestion 定位。

验收任务：

1. 解释为什么不能在 composition 中频繁重设 Selection。
2. 解释 NodeView 外壳与 `contentDOM` 的所有权边界。
3. 给复杂 NodeView 列出事件和 Mutation 处理矩阵。
4. 为浮层的异步位置计算设计过期结果保护。

## 阶段四：复杂扩展与工程实践

建议用时：3～5 天。

学习内容：

- Table、List、Link、Mention、Image；
- Collaboration、Yjs Relative Position 与 UndoManager；
- HTML/JSON/Markdown/Static Renderer；
- 单元测试、E2E、真机兼容性和性能。

验收任务：

1. 对比普通 History 与协作 Undo。
2. 解释为什么 Decoration 不会进入 `getJSON()` 和 `getHTML()`。
3. 写出复杂扩展的测试金字塔。
4. 完成一次 45 分钟模拟面试。

## 每日学习模板

### 1. 概念复述

不用源码，回答：它解决了什么问题？输入输出是什么？不变量是什么？

### 2. 源码定位

每个主题只选少量主干文件，先看调用链，再看 helper。避免从 `index.ts` 无目标跳转。

### 3. 最小实验

实验必须能观察结果，例如：

- 打印 transaction 的 `steps`、`mapping` 和 `meta`；
- 改变 Extension priority，观察 keymap/plugin 顺序；
- 故意错误处理 NodeView mutation，观察状态不同步；
- 模拟异步 Suggestion 乱序响应。

### 4. 面试表达

采用“定义 → 数据流 → 源码证据 → 设计权衡 → 常见坑”结构回答。

## 完成度记录

可以按以下清单自行维护：

- [ ] 能画架构图
- [ ] 能解释 Schema
- [ ] 能计算 position
- [ ] 能解释 State 与 Transaction
- [ ] 能解释 Plugin 生命周期
- [ ] 能跟踪命令链
- [ ] 能解释 input/paste rules
- [ ] 能解释 IME 与移动端输入
- [ ] 能实现 NodeView
- [ ] 能说明 React/Vue 集成
- [ ] 能说明协作与历史
- [ ] 能设计测试矩阵
- [ ] 能完成模拟面试

## 范围说明

这套资料专注开源仓库当前能验证的内容，不把商业云服务、后端协作部署或未出现在仓库中的产品架构当作源码事实。涉及浏览器底层时，Tiptap 仓库只包含适配和补丁；完整输入引擎应继续阅读 `prosemirror-view`。