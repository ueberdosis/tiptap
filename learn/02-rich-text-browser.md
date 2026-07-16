# 浏览器富文本编辑基础

## 1. 为什么富文本比普通输入框难

`<textarea>` 的核心状态近似一个字符串和选区，而富文本包含：

- 嵌套块结构；
- 行内 Mark；
- 原子节点、表格、列表；
- 多种 Selection；
- 浏览器自动修改 DOM；
- IME 组合输入；
- Clipboard 和 Drag/Drop 中的 HTML、纯文本、文件；
- Undo/Redo、协作和位置映射。

如果直接把 `innerHTML` 当状态，就很难稳定表达 Schema 约束、历史 Step、协作位置和插件状态。

## 2. `contenteditable` 提供了什么

浏览器提供：

- 可编辑 DOM；
- 光标和原生文本选区；
- 键盘、输入法、剪贴板与拖放；
- 拼写检查、自动纠错；
- `beforeinput`、`input`、composition、selectionchange；
- DOM mutation。

但不同浏览器可能为同一操作生成不同 DOM。按 Backspace、粘贴列表或在空块按 Enter 时，产生的节点和事件顺序并不完全一致。

所以成熟编辑器通常将 `contenteditable` 当作输入设备和视图，而不是规范数据模型。

## 3. ProseMirror 的解决方案

```text
Browser DOM and events
  ↕
EditorView
  ↕ dispatch / updateState
EditorState
  ├─ doc
  ├─ selection
  ├─ storedMarks
  └─ plugin states
```

- 浏览器可以先改变 DOM；
- EditorView 通过事件和 DOM Observer 识别变化；
- 变化被归一化成 Transaction；
- Transaction 应用到旧 State 产生新 State；
- View 再让 DOM 与新 State 对齐。

业务逻辑应观察 Transaction 和 State，而不是只观察 `input` 事件或 `innerHTML`。

## 4. 输入并不总是 `keydown → command`

### 桌面快捷键

典型链路：

```text
keydown
→ handleKeyDown
→ keymap plugin
→ command
→ transaction
```

### 普通输入和移动端

可能是：

```text
beforeinput / composition
→ 浏览器修改 DOM
→ MutationObserver
→ ProseMirror 解析变化范围
→ transaction
```

软键盘、自动纠错和语音输入可能没有可靠的传统 `keydown`。因此只监听键盘事件无法构建完整编辑器。

## 5. IME 与 composition

中文、日文、韩文等输入法会经历：

```text
compositionstart
→ 多次 compositionupdate / 临时 DOM
→ compositionend
→ 最终文本与 Selection 稳定
```

组合阶段的文本是候选中间状态。如果扩展此时执行正则替换、重设 Selection 或重建 NodeView，可能造成：

- 候选框关闭；
- 重复文字；
- 光标跳动；
- 丢字；
- 菜单闪烁。

Tiptap 中的重要防御：

- `packages/core/src/InputRule.ts` 在 `view.composing` 时不执行 input rule；
- compositionend 后异步重新尝试规则；
- Bubble/Floating menu 在 composition 中暂停更新；
- 部分扩展在 composition 中不纠正 Selection；
- NodeView/MarkView 对移动端 mutation 有特殊判断。

原则：**composition 中优先让浏览器和 ProseMirror 完成同步，不要主动抢 Selection 和 DOM 所有权。**

## 6. 模型 Selection 与 DOM Selection

### 模型 Selection

位于 `EditorState`：

- `TextSelection`：文本范围或光标；
- `NodeSelection`：选择一个节点；
- `AllSelection`：整个文档；
- Table 的 `CellSelection`；
- Gap Cursor、自定义 NodeRangeSelection。

### DOM Selection

浏览器的 `window.getSelection()`，由 DOM Node 和 offset 表示。

二者不能混用：

- 模型 Selection 用文档 position；
- DOM Selection 用 DOM position；
- EditorView 负责转换；
- blur 后 DOM ranges 可以被清理，但模型 Selection 仍可保留。

业务中的“当前是否为粗体”“菜单锚定范围”“协作光标”通常应从模型 State 出发。

## 7. Focus 与 Blur

Tiptap 的 FocusEvents 扩展不会只直接调用回调，而是 dispatch 带 meta 的 Transaction：

- `focus` 或 `blur` meta；
- `addToHistory: false`。

然后 `Editor.dispatchTransaction()` 统一发出 focus/blur 事件。

好处：

- 焦点状态与 transaction 顺序一致；
- 插件可以观察；
- 不污染 Undo 历史；
- appended transaction 的焦点变化也可被统一处理。

源码：`packages/core/src/extensions/focusEvents.ts`。

## 8. Clipboard

剪贴板至少有三类数据：

- `text/html`；
- `text/plain`；
- files。

### Copy/Cut

ProseMirror 一般会：

1. 从 Selection 得到 `Slice`；
2. 使用 Schema DOMSerializer 生成 HTML；
3. 添加 `data-pm-slice` 保存开放深度和上下文；
4. 生成纯文本；
5. 写入 clipboard；
6. cut 再通过 Transaction 删除 Selection。

`data-pm-slice` 让嵌套列表或跨块内容粘贴后保留结构上下文。

Tiptap 的纯文本序列化器会逐个处理 Selection ranges，这对表格 CellSelection 很重要。源码：`packages/core/src/extensions/clipboardTextSerializer.ts`。

### Paste

```text
ClipboardEvent
→ transformPastedHTML / transformPastedText
→ DOMParser.parseSlice
→ handlePaste
→ replaceSelection transaction
→ paste-rule appendTransaction
```

内部 ProseMirror 内容通常带 `data-pm-slice`。Tiptap paste rules 可据此避免内部复制时重复格式化。

## 9. Drag and Drop

拖放既可能是：

- 编辑器内部移动；
- 跨编辑器移动；
- 按修饰键复制；
- 外部文件拖入；
- NodeView drag handle。

常见流程：

```text
dragstart
→ 选择并序列化 Slice
→ setDragImage
→ drop coordinates
→ posAtCoords
→ handleDrop
→ replace/move transaction
```

NodeView drag handle 的关键点：

- `data-drag-handle` 标识手柄；
- 通常先创建 NodeSelection；
- Safari 要求 drag image 临时位于真实 DOM；
- drop 后要清理临时 DOM 和 dragging 状态；
- 跨编辑器移动需要考虑源编辑器 Selection 已变化或已销毁。

相关源码：

- `packages/core/src/NodeView.ts`
- `packages/extension-drag-handle/src/drag-handle-plugin.ts`
- `packages/extension-file-handler/src/FileHandlePlugin.ts`

## 10. 四种“位置”

1. **文档 position**：ProseMirror 树坐标。
2. **DOM position**：DOM Node + offset。
3. **viewport coordinate**：`clientX/clientY`、`DOMRect`。
4. **页面/容器 coordinate**：叠加滚动、定位上下文、transform。

EditorView 提供：

- `coordsAtPos(pos)`：文档位置到屏幕矩形；
- `posAtCoords({ left, top })`：屏幕坐标到文档位置；
- `posAtDOM(node, offset)`：DOM position 到文档位置；
- `domAtPos(pos)`：文档位置到 DOM position；
- `nodeDOM(pos)`：获取节点 DOM。

坐标调用可能失败或过期：

- View 已销毁；
- DOM 已 detached；
- 坐标在编辑器外；
- 没有真实布局的测试环境；
- CSS transform、缩放、滚动容器；
- RTL、跨行 Selection、atom 节点。

## 11. 浮层交互

Bubble Menu、Floating Menu 和 Suggestion 都依赖虚拟锚点与异步位置计算。

必须处理：

- 编辑器 blur 到菜单本身；
- mousedown 先于 click；
- composition 中不移动；
- selection 快速变化；
- scroll/resize；
- Promise 返回时菜单已经隐藏或 Editor 已销毁；
- portal/appendTo 造成的定位上下文变化。

异步位置计算返回前后，应再次检查当前状态，防止旧结果让已关闭菜单重新出现。

## 12. 跨浏览器重点

### Safari / iOS

- focus 和滚动顺序；
- detached drag image；
- blur 后 caret；
- iOS 首次 focus 与软键盘；
- composition 和表格 DOM；
- iPadOS 可能伪装成 macOS。

### Android Chrome

- Enter/Backspace 不可靠地表现为 keydown；
- `keyCode 229`；
- 自动纠错与 Mutation 顺序；
- composition 与 selection 同步。

### Firefox

- drop 后 caret；
- Selection/BR/列表删除细节；
- 某些 DOM Selection 访问异常。

自动化测试不能完全替代真实 IME 和真机。

## 13. 面试检查点

- 为什么不能把 `innerHTML` 当编辑器状态？
- 移动端输入为什么不能只监听 keydown？
- composition 中为什么要暂停 input rule？
- 模型 Selection 和 DOM Selection 有何区别？
- `data-pm-slice` 解决什么问题？
- paste rule 为什么适合使用 `appendTransaction`？
- `coordsAtPos()` 和 `posAtCoords()` 有什么边界？
- 菜单为什么不能在 editor blur 时无条件立即隐藏？