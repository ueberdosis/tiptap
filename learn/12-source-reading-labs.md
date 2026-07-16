# 源码阅读实验

这些实验强调“预测 → 运行/阅读 → 解释”，避免只记 API。每个实验都应记录调用链、关键不变量和一个失败案例。

## 实验 1：从 Extension 到 Schema

### 目标

证明 Tiptap Node/Mark 配置如何变成 ProseMirror NodeSpec/MarkSpec。

### 阅读路径

1. `packages/extension-document/src/document.ts`
2. `packages/extension-paragraph/src/paragraph.ts`
3. `packages/extension-bold/src/bold.tsx`
4. `packages/core/src/helpers/resolveExtensions.ts`
5. `packages/core/src/helpers/getSchemaByResolvedExtensions.ts`

### 任务

- 列出 Document、Paragraph、Bold 最终进入 Schema 的字段。
- 解释 `parseHTML`、`renderHTML` 对应的 PM 字段。
- 找出 topNode 从哪里确定。
- 改变一个 content expression，预测哪些 JSON 将变非法。

### 验收

能从任意简单扩展反向写出其 NodeSpec/MarkSpec 草图。

## 实验 2：手工计算 Position

### 目标

建立树 position 而非字符串 offset 的直觉。

### 文档

```text
doc(
  paragraph("abc"),
  paragraph("de")
)
```

### 任务

- 画出每个 Node 边界和文本字符位置。
- 计算 paragraph 的 `nodeSize`。
- 对多个 position 调 `doc.resolve(pos)`，记录 depth、parentOffset、nodeBefore、nodeAfter。
- 解释第二段首字符位置为什么不是 3。

### 验收

不查资料解释 `doc.content.size`、Node 前位置和 Node 内首位置的区别。

## 实验 3：跟踪命令链

### 目标

理解共享 Transaction 和 chainable State。

### 阅读路径

1. `packages/core/src/CommandManager.ts`
2. `packages/core/src/helpers/createChainableState.ts`
3. `packages/core/src/commands/insertContentAt.ts`
4. `packages/core/src/commands/setMark.ts`

### 任务

跟踪：

```text
editor.chain().focus().insertContent('A').toggleBold().insertContent('B').run()
```

记录每步：

- `tr.steps.length`；
- `tr.doc`；
- `tr.selection`；
- storedMarks；
- 最终 dispatch 次数。

再写一个错误命令，故意读取 `editor.state`，说明它在 chain 中为什么可能读旧值。

## 实验 4：`can()` 无副作用契约

### 目标

区分能力探测与执行。

### 任务

- 阅读 `CommandManager.createCan()`。
- 对同一命令分别调用 commands、chain、can。
- 记录 dispatch 次数和最终文档。
- 设计一个有网络/DOM 副作用的错误命令，解释 `can()` 为什么会暴露问题。

### 验收

能够审查自定义命令是否正确支持 `can()`。

## 实验 5：Plugin State 与 Meta

### 目标

实现一个最小状态机，而不是把临时 UI 状态塞进文档。

### 任务

设计 Plugin：

- `PluginKey` 唯一标识；
- State 保存 `{ active: boolean }`；
- Transaction Meta 控制 show/hide；
- Decoration 显示当前范围；
- Plugin View 注册一个外部 listener；
- destroy 清理 listener。

### 验收

测试 Meta-only Transaction 不改变 doc，但 Plugin State 和 Decoration 更新。

## 实验 6：Input Rule 与 Paste Rule

### 目标

比较执行时机和数据来源。

### 阅读路径

- `packages/core/src/InputRule.ts`
- `packages/core/src/PasteRule.ts`
- `packages/core/src/inputRules/markInputRule.ts`
- `packages/core/src/pasteRules/markPasteRule.ts`
- `packages/extension-link/src/link.ts`

### 任务

- 分别画两条时序图。
- 解释 input rule 的 undo 信息。
- 解释 paste rule 为什么使用 old/new doc diff。
- 验证内部 `data-pm-slice` 的行为。
- 验证 composition 中 input rule 不执行。

## 实验 7：Transaction Mapping

### 目标

观察多个 Step 如何改变位置。

### 任务

1. 记录原始 position。
2. 在它之前插入内容。
3. 删除覆盖该 position 的范围。
4. 分别观察 `map()` 和 `mapResult()`。
5. 改变 assoc/bias。
6. 对一个异步返回的旧 range 进行 mapping 或判定已删除。

### 验收

能解释评论锚点为什么不能只保存一个永不更新的数字。

## 实验 8：NodeView 所有权

### 目标

理解框架外壳与 ProseMirror contentDOM 的边界。

### 阅读路径

- `packages/core/src/NodeView.ts`
- `packages/react/src/ReactNodeViewRenderer.tsx`
- `packages/react/src/NodeViewWrapper.tsx`
- `packages/react/src/NodeViewContent.tsx`
- `packages/extension-image/src/image.ts`

### 任务

设计一个含标题、可编辑正文和删除按钮的 NodeView：

- 标题/按钮由框架控制；
- 正文由 contentDOM 控制；
- button mousedown 不破坏编辑器 Selection；
- copy/paste 仍由 PM 处理；
- attrs 通过 Transaction 更新；
- destroy 清理资源。

故意让框架渲染 contentDOM 子文本，观察或推演冲突。

## 实验 9：IME 防御

### 目标

理解 composition 是状态过程，而非单一事件。

### 任务

- 阅读 InputRule 的 compositionend 处理。
- 阅读 Bubble/Floating Menu 的 composing 检查。
- 阅读 NodeView/MarkView mutation 兼容逻辑。
- 列出 composition 期间禁止做的操作。
- 设计桌面、iOS、Android 测试矩阵。

### 验收

能解释为什么 synthetic composition events 不能替代真机输入法测试。

## 实验 10：Clipboard 与 Drag/Drop

### 目标

区分 HTML、plain text、Slice、files 和移动语义。

### 任务

- 复制嵌套列表，观察 `data-pm-slice`。
- 比较 HTML 和 plain text 输出。
- 在 CellSelection 中复制多范围。
- 内部拖动 Node；跨编辑器拖动；外部文件 drop。
- 解释 Safari drag image 补丁。
- 检查 drop 坐标为 null 的路径。

## 实验 11：React/Vue 状态订阅

### 目标

证明框架不应复制完整 EditorState。

### 阅读路径

- `packages/react/src/useEditor.ts`
- `packages/react/src/useEditorState.ts`
- `packages/react/src/EditorContent.tsx`
- `packages/vue-3/src/Editor.ts`
- `packages/vue-3/src/EditorContent.ts`

### 任务

- 实现只订阅 bold active/can 的工具栏。
- 统计每次输入的组件 rerender。
- 对比 selector 与订阅整个 State。
- 解释 React external store 和 Vue 双 RAF 的设计目标。

## 实验 12：异步 Suggestion 竞态

### 目标

处理搜索请求乱序、退出和销毁。

### 阅读路径

- `packages/suggestion/src/plugin/state.ts`
- `packages/suggestion/src/plugin/async.ts`
- `packages/suggestion/src/plugin/view.ts`

### 任务

模拟：

1. 查询 A 很慢；
2. 查询 B 很快；
3. B 先返回；
4. 用户 Escape；
5. A 返回；
6. Editor destroy。

断言旧结果不能重新显示 UI。

## 实验 13：SSR 与静态渲染

### 目标

区分无 View、server HTML parser 和 Static Renderer。

### 任务

- 使用 JSON 创建未挂载 Editor。
- 尝试无 DOM 环境解析 HTML，解释失败边界。
- 用 `@tiptap/html/server` 做 HTML ↔ JSON。
- 用 Static Renderer 输出 HTML string。
- 对比 NodeView、Decoration、插件生成属性是否出现。
- 设计 React hydration 安全流程。

## 实验 14：普通 History 与 Collaboration

### 目标

理解 Step history 与 CRDT undo 的不同真源。

### 阅读路径

- `packages/extensions/src/undo-redo/undo-redo.ts`
- `packages/extension-collaboration/src/collaboration.ts`
- `packages/extension-collaboration/src/helpers/CollaborationMappablePosition.ts`

### 任务

- 解释两种 undo stack 记录什么。
- 设计两个 Editor 同步编辑的撤销场景。
- 比较 transaction mapping 与 Yjs relative position。
- 检查 Editor destroy 后 Y.Doc listener 数量。

## 实验 15：完整扩展设计评审

### 题目

设计一个“可协作的评论锚点”扩展。

必须回答：

- 锚点放文档 Mark、Plugin State 还是外部数据库？
- 评论 id、resolved 状态如何持久化？
- Selection 变更如何创建锚点？
- 本地 Transaction 如何 mapping？
- 远端变更如何使用 Relative Position？
- Decoration 如何渲染？
- SSR 如何展示？
- Undo 应撤销什么？
- 删除被评论内容如何处理？
- 安全、权限和多用户冲突如何处理？
- destroy 清理什么？
- 单元/E2E/协作测试如何分层？

完成此实验，基本能串联整套知识。