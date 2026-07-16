# NodeView、MarkView 与 React/Vue 集成

## 1. 为什么需要 NodeView

Schema `toDOM` 适合静态、确定性的文档 DOM。NodeView 适合：

- React/Vue 组件；
- 图片 resize；
- 拖拽手柄；
- 内部按钮和表单；
- 异步媒体状态；
- 特殊 Selection 或事件处理。

NodeView 是交互式编辑视图，不是持久化格式。因此仍应保留 `renderHTML()`。

## 2. NodeView 接口

核心概念：

- `dom`：节点外层 DOM；
- `contentDOM`：ProseMirror 管理子文档的 DOM 容器；
- `update(node, decorations, innerDecorations)`；
- `selectNode()` / `deselectNode()`；
- `stopEvent(event)`；
- `ignoreMutation(mutation)`；
- `destroy()`；
- `getPos()`：当前节点位置回调。

Tiptap 基类：`packages/core/src/NodeView.ts`。

## 3. 最重要的所有权边界

```text
Framework owns:
  NodeView wrapper, controls, non-document UI

ProseMirror owns:
  contentDOM children, text editing, selection, mutations
```

React/Vue 不能同时 reconciliation `contentDOM` 里的文档子节点，否则会与 ProseMirror 的 ViewDesc、DOM Observer 和 Selection 冲突。

对叶子或 atom Node，没有 contentDOM 时，NodeView 可以完全管理内部 UI。

## 4. NodeView 创建链

```text
Node extension.addNodeView()
→ ExtensionManager.nodeViews
→ PM NodeViewConstructor map
→ EditorView renders matching NodeType
→ ReactNodeViewRenderer / VueNodeViewRenderer
→ framework component mounted
```

注入参数通常包括：

- node；
- view；
- getPos；
- decorations；
- innerDecorations；
- editor；
- extension；
- HTMLAttributes；
- updateAttributes；
- deleteNode。

## 5. `getPos()` 为什么不能缓存

任何前序 Transaction 都可能移动该节点。NodeView 在执行操作时应重新调用 `getPos()`。

错误方式：mount 时保存数字 position，之后一直用。

正确方式：点击、resize commit、删除或更新 attrs 时调用最新 `getPos()`，并处理它不可用的情况。

协作或异步操作中，仅靠数字 position 更危险，可能还需要 Mapping 或 CRDT Relative Position。

## 6. `update()`

NodeView 的 update 返回：

- true：当前实例可以复用；
- false：ProseMirror 应销毁并重建。

常见规则：

1. NodeType 不同 → false；
2. 同类型 attrs/content 变化 → 更新 props 并 true；
3. Node 引用相同 → 通常可以跳过大部分框架更新；
4. 自定义 update option → 由扩展判断。

利用 ProseMirror Node 不可变性做引用比较，是重要性能优化。

## 7. `stopEvent()`

决定 DOM 事件是否继续交给 ProseMirror。

常见策略：

- contentDOM 内事件 → 交给 ProseMirror；
- NodeView 自定义 button/input/select/textarea → 组件自己处理；
- copy/cut/paste/drop/drag、用于 NodeSelection 的 mousedown → 视语义交给 ProseMirror；
- drag handle → 需要协调 NodeSelection 和 dragging 状态。

返回 true 表示“不要由 ProseMirror继续处理”，不是业务操作一定成功。

## 8. `ignoreMutation()`

决定 DOM mutation 是否需要 ProseMirror重新读取。

常见策略：

- Selection mutation → 不忽略；
- contentDOM 内 child/text 变化 → 不忽略；
- NodeView 外壳 class/style/UI 变化 → 通常忽略；
- leaf/atom 内部自管 UI → 通常忽略；
- 移动端 Enter/composition 特殊 mutation → 按兼容逻辑处理。

总是 true 会让模型和 DOM 失步；总是 false 会造成无意义解析、抖动和组件重建。

## 9. React 集成

### `useEditor`

源码：`packages/react/src/useEditor.ts`。

`EditorInstanceManager` 负责：

- 创建和更新 Editor；
- 依赖变化时重建；
- 保持最新回调；
- SSR 时延迟创建；
- React Strict Mode 下延迟销毁，避免 effect 重放误销毁。

### `useEditorState`

源码：`packages/react/src/useEditorState.ts`。

使用 external store + selector：

```text
editor transaction
→ external-store snapshot changes
→ selector computes minimal UI state
→ equality check
→ necessary React rerender only
```

工具栏应选择最小状态，例如 bold active 和 command can，而不是订阅整个 EditorState。

### `EditorContent`

源码：`packages/react/src/EditorContent.tsx`。

职责：

- 将 EditorView DOM 移入 React 容器；
- 管理 NodeView Portal registry；
- Portal 增删时通知 React；
- 宿主准备后重新创建 NodeViews；
- 卸载时清理。

### `ReactRenderer`

源码：`packages/react/src/ReactRenderer.tsx`。

- 创建宿主 DOM；
- 把 React Element 注册成 Portal；
- 更新 props；
- 初次必要时 `flushSync` 保证光标和挂载顺序；
- 用 destroyed 标志防止排队异步渲染在销毁后执行。

## 10. Vue 3 集成

### `useEditor`

`packages/vue-3/src/useEditor.ts`：

- `onMounted` 创建；
- `onBeforeUnmount` 销毁；
- shallowRef 避免深层代理。

### Vue Editor

`packages/vue-3/src/Editor.ts`：

- 继承 Core Editor；
- 暴露 reactive State 和 Storage；
- 在 `beforeTransaction` 获取 nextState；
- 用双 RAF 合并 Vue UI 更新；
- `markRaw(this)` 避免代理 Editor/PM 对象图。

### `EditorContent` 与 `VueRenderer`

- 移动 EditorView DOM；
- 保留 appContext；
- 保留 provides 原型链；
- VueRenderer 使用 reactive props 和 `render(vNode, el)`；
- destroy 时 `render(null, el)`。

## 11. MarkView

MarkView 与 NodeView 相似，但：

- 表示 Mark 的交互式外壳；
- 没有独立 NodeSelection；
- 没有稳定节点位置语义；
- `contentDOM` 中是被 Mark 包裹的行内内容。

更新 Mark attrs 可能需要遍历文档寻找相同 Mark 并重新应用，最坏为 O(N)。不适合高频鼠标移动或输入路径。

源码：

- `packages/core/src/MarkView.ts`
- `packages/react/src/ReactMarkViewRenderer.tsx`
- `packages/vue-3/src/VueMarkViewRenderer.ts`

## 12. NodeView 性能

- 只在复杂 UI 真正需要时使用；
- 同 Node 引用跳过更新；
- selector 不返回整个 State；
- 避免每个 NodeView 都监听全局 transaction；
- `trackNodeViewPosition` 仅按需开启；
- 不高频序列化 `getHTML()`；
- Selection 更新可用 RAF 合并；
- 图片 resize 中先更新视觉，commit 时再发 Transaction；
- destroy 所有监听器和异步任务。

## 13. NodeView 测试矩阵

### 单元测试

- dom/contentDOM 契约；
- update true/false；
- attrs 更新；
- stopEvent；
- ignoreMutation；
- destroy 清理；
- getPos 无效；
- selection class。

### E2E

- 光标进入/离开 contentDOM；
- 中文输入；
- copy/paste；
- drag/drop；
- 点击内部按钮不破坏 Selection；
- React/Vue mount/unmount；
- resize；
- undo/redo；
- 文档前方插入后 getPos 正确。

### 真机

- iOS/Android composition；
- 软键盘 Enter/Backspace；
- Safari drag image；
- 自动纠错。

## 14. 常见错误

- 用 React/Vue 渲染 contentDOM 子内容；
- 缓存 getPos 的返回值；
- 只实现 NodeView、不实现 renderHTML；
- update 永远 true 或永远 false；
- stopEvent 阻止所有剪贴板和 Selection 事件；
- ignoreMutation 永远 true；
- destroy 不清理 Portal、listener、RAF；
- SSR 首屏立即创建 Editor 导致 hydration mismatch。

## 15. 面试检查点

- NodeView 与 Schema `toDOM` 有什么关系？
- dom 与 contentDOM 的所有权如何划分？
- getPos 为什么是函数而不是固定数字？
- update 返回 false 会怎样？
- stopEvent 和 ignoreMutation 有何区别？
- React 为什么使用 Portal 和 external store？
- Vue 为什么 markRaw Editor？
- NodeView 的性能热点有哪些？