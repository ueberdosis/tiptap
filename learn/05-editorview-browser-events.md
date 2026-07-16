# EditorView 与浏览器事件

## 1. EditorView 的职责

`EditorView` 是 ProseMirror 状态和浏览器 DOM 之间的桥梁：

- 根据 State 渲染文档 DOM；
- 维护 `contenteditable`；
- 监听键盘、鼠标、输入法、剪贴板、拖放；
- 监控 DOM mutation；
- 在 DOM Selection 与模型 Selection 之间转换；
- 调用 Plugin Props；
- 通过 `dispatchTransaction` 把变化交回状态层；
- 管理 NodeView、Decoration 和 Plugin View。

Tiptap 的 `packages/pm/view/index.ts` 直接再导出 `prosemirror-view`，说明底层输入引擎仍在 ProseMirror 中。

## 2. 创建 View

Tiptap 入口：`packages/core/src/Editor.ts` 的 `createView()`。

主要配置：

- 初始 `state`；
- `dispatchTransaction`；
- 用户 `editorProps`；
- `transformPastedHTML`；
- `nodeViews`；
- `markViews`；
- 默认 role 和 CSS class。

创建后，Tiptap 再通过 `state.reconfigure({ plugins })` 安装完整扩展 Plugin 集合。

## 3. EditorProps 与 Plugin Props

常见 Props：

- `editable`；
- `attributes`；
- `handleDOMEvents`；
- `handleKeyDown`；
- `handleTextInput`；
- `handlePaste`；
- `handleDrop`；
- `decorations`；
- `nodeViews`；
- `transformPastedHTML`；
- `clipboardTextSerializer`。

View 会通过直接 Props 和 Plugins 查找处理器。顺序具有语义：前面的 handler 返回 `true` 后，后续处理器通常不再执行。

Tiptap Extension priority 因此会间接影响浏览器行为优先级。

## 4. DOM 事件到 Transaction

### Keydown

```text
keydown
→ NodeView.stopEvent
→ handleDOMEvents.keydown
→ handleKeyDown
→ keymap plugin
→ Tiptap shortcut
→ command
→ dispatch(transaction)
```

命令返回 `true` 表示已处理，通常会阻止浏览器默认行为并截断 fallback。

### 文本输入

```text
beforeinput / composition / DOM mutation
→ EditorView input handling
→ handleTextInput 或 DOM Observer
→ parse changed DOM range
→ create transaction
→ dispatch
```

### Selection

```text
mousedown / selectionchange
→ DOM position or posAtCoords
→ model Selection
→ tr.setSelection
→ dispatch
```

### Paste

```text
ClipboardEvent
→ transform pasted data
→ DOMParser.parseSlice
→ handlePaste
→ default replaceSelection
→ uiEvent='paste'
→ dispatch
```

### Drop

```text
dragstart stores Slice
→ drop coordinates
→ posAtCoords / dropPoint
→ handleDrop
→ move or replace transaction
→ uiEvent='drop'
```

## 5. `handleDOMEvents` 与专用 Handler

`handleDOMEvents` 暴露原生 DOM 事件，适合特殊补丁和自定义事件。

`handleKeyDown`、`handlePaste` 等专用 Props 更贴近 ProseMirror 处理链，通常更适合编辑行为。

注意：接管 `handleDOMEvents` 中的原生默认行为时，应明确调用 `event.preventDefault()`，不要只依赖返回值推断浏览器行为。

## 6. Keymap 的 fallback

Core keymap 源码：`packages/core/src/extensions/keymap.ts`。

典型 Backspace 顺序：

```text
undoInputRule
→ 清理特殊空块
→ deleteSelection
→ joinBackward
→ selectNodeBackward
```

典型 Enter：

```text
newlineInCode
→ createParagraphNear
→ liftEmptyBlock
→ splitBlock
```

这是一种责任链：前一个命令不适用时返回 false，后一个继续尝试。

## 7. Input Rule

Tiptap 有自己的规则封装：`packages/core/src/InputRule.ts`。

```text
addInputRules()
→ ExtensionManager.plugins
→ inputRulesPlugin
→ handleTextInput
→ 收集光标前文本并匹配
→ rule handler 使用 chainable transaction
→ 有 Step 时 dispatch
```

它还处理：

- compositionend 后重试；
- Enter 触发；
- `insertContentAt(..., { applyInputRules: true })`；
- undoInputRule 所需的 transform、范围和原始文本。

输入规则通常在文字实际插入前或输入阶段处理局部文本。

## 8. Paste Rule

源码：`packages/core/src/PasteRule.ts`。

```text
paste/drop transaction applied
→ appendTransaction
→ compare oldDoc and newDoc
→ find changed ranges
→ run regex and handler
→ return appended transaction
```

它适合：

- 粘贴多个 URL 后批量加 Link；
- 把粘贴文本转换为 Mark/Node；
- 在 Schema 已解析后的真实文档范围上操作。

与 Input Rule 的区别：Paste Rule 通常处理已写入文档的变更范围，而不是只看光标前字符串。

## 9. Decorations

Decoration 是 View 层表现，不属于文档：

- inline decoration；
- node decoration；
- widget decoration；
- DecorationSet 通常存于 Plugin State。

用途：

- placeholder；
- 搜索高亮；
- 协作光标；
- suggestion 标记；
- 失焦 Selection；
- 临时错误提示。

Decoration 不会自动进入：

- `doc.toJSON()`；
- `editor.getJSON()`；
- Schema DOMSerializer 输出。

文档变化后应使用 `DecorationSet.map(tr.mapping, tr.doc)`，再按 changed ranges 局部更新，避免全量扫描。

参考：`packages/extensions/src/placeholder/utils/placeholderStateField.ts`。

## 10. Plugin 与 PluginKey

Plugin 可以定义：

- `state.init/apply`；
- `props`；
- `filterTransaction`；
- `appendTransaction`；
- `view()` 生命周期。

PluginKey 用于：

- 唯一标识 Plugin；
- 读取 Plugin State；
- 作为 Transaction Meta key；
- 动态注册与卸载；
- 避免字符串冲突。

标准结构：

```text
Plugin State: 纯状态与 apply
Plugin Props: DOM/View 行为
Plugin View: 外部 DOM、监听器、异步资源生命周期
```

## 11. Plugin View 生命周期

`view(editorView)` 可以返回：

- `update(view, previousState)`；
- `destroy()`。

凡是创建：

- window/document listener；
- Floating UI autoUpdate；
- MutationObserver；
- ResizeObserver；
- Timer/RAF；
- AbortController；
- 外部订阅

都必须在 destroy 中成对清理。

## 12. Composition 防御

扩展应在这些操作前考虑 `view.composing`：

- 改写文本；
- 自动修复 Selection；
- 重建 NodeView；
- 更新菜单位置；
- 删除空节点；
- 应用输入规则。

不要把人工触发 composition events 的单元测试当作真机证明。真实输入法还涉及 DOM mutation、系统候选窗和软键盘。

## 13. View 销毁与异步竞态

异步回调执行时，View 可能已经：

- destroy；
- unmount；
- DOM detached；
- selection 改变；
- plugin 被 unregister。

所以位置计算、异步 suggestion、图片加载和定时器回调应检查：

- editor/view 是否仍有效；
- DOM 是否 `isConnected`；
- 当前 request 是否仍为最新；
- Plugin State 是否仍 active；
- 当前 node/getPos 是否仍有效。

## 14. 测试边界

happy-dom 适合：

- transaction；
- plugin state；
- handler 顺序；
- decoration；
- meta；
- teardown。

真实浏览器 E2E 适合：

- Selection；
- focus/blur；
- clipboard；
- drag/drop；
- 坐标和浮层；
- NodeView DOM。

真机适合：

- iOS/Android IME；
- 软键盘；
- 自动纠错；
- Safari 特殊 Selection；
- 原生 Clipboard 权限。

## 15. 面试检查点

- EditorView 为什么不是简单 React 组件？
- Plugin 顺序为什么会改变编辑行为？
- `handleDOMEvents` 与 `handleKeyDown` 如何选择？
- Input Rule 和 Paste Rule 的执行时机有何差异？
- Decoration 为什么不应存进文档？
- Plugin State、Props、View 如何分工？
- composition 和异步 teardown 应如何防御？