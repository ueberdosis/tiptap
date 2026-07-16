# EditorState、Transaction、Selection 与 Mapping

## 1. EditorState 是不可变状态快照

`EditorState` 主要包含：

- `doc`：当前文档；
- `selection`：当前模型选区；
- `storedMarks`：下一次输入将使用的 marks；
- `schema`；
- `plugins` 及其 StateField。

旧 State 不会被修改：

```text
oldState + transaction → newState
```

这保证了插件、历史、视图和框架订阅可以在明确的状态边界工作。

参考：[EditorState 中文手册](https://prosemirror.xheldon.com/docs/ref/#state.EditorState)。

## 2. Transaction 是什么

`Transaction` 继承 `Transform`，除了文档 Step，还可以包含：

- Selection 更新；
- storedMarks 更新；
- timestamp；
- scrollIntoView；
- metadata。

它是“从一个 State 到下一个 State 的意图与变换集合”。

常见操作：

- `insertText()`；
- `replaceSelection()`；
- `deleteSelection()`；
- `setSelection()`；
- `addMark()` / `removeMark()`；
- `setNodeMarkup()`；
- `setMeta()`。

## 3. Step、StepMap 与 Mapping

### Step

对文档的一次原子变换，例如 ReplaceStep、AddMarkStep、RemoveMarkStep。

Step 具有：

- `apply(doc)`；
- `invert(doc)`；
- `map(mapping)`；
- JSON 序列化。

Undo、协作和重放都建立在可描述、可映射的 Step 上。

### StepMap

描述一个 Step 如何让位置发生变化。

### Mapping

按顺序组合多个 StepMap。Transaction 每增加一个 Step，`tr.mapping` 就记录新的位置变换。

## 4. 为什么必须映射位置

假设 transaction 开始时记录位置 10，然后第一个 Step 在位置 3 插入 5 个字符。第二个操作如果仍使用 10，就会命中错误内容。

正确方式：

```text
originalPosition
→ tr.mapping.map(originalPosition)
→ current position in tr.doc
```

源码实例：

- `packages/core/src/inputRules/nodeInputRule.ts`
- `packages/core/src/commands/clearNodes.ts`
- `packages/core/src/commands/deleteSelection.ts`
- `packages/core/src/commands/keyboardShortcut.ts`
- `packages/core/src/helpers/getChangedRanges.ts`

## 5. `map()`、`mapResult()` 与 bias

- `map(pos)`：只返回新位置；
- `mapResult(pos)`：还返回位置是否被删除及边界信息；
- `assoc`/bias 决定插入恰好发生在该位置时，锚点偏向左侧还是右侧。

追踪评论锚点、装饰、异步请求范围时，单纯 `map()` 可能不够，因为目标内容可能已被删除。

## 6. Selection 类型

### TextSelection

典型文本范围。`anchor === head` 时是光标。

### NodeSelection

选择一个可选节点。`from` 位于节点之前，`to` 位于节点之后。

### AllSelection

选择整个文档。

### 自定义 Selection

ProseMirror 允许扩展 Selection。Tiptap 中可见：

- GapCursor；
- Table CellSelection；
- `packages/extension-node-range/src/helpers/NodeRangeSelection.ts`。

扩展自定义 Selection 需要考虑：

- `map()`；
- `eq()`；
- `toJSON()` / `fromJSON()`；
- bookmark；
- 注册 JSON id；
- DOM 展示和键盘行为。

## 7. Anchor、Head、From、To

- `anchor`：选区固定端；
- `head`：移动端；
- `from`：较小位置；
- `to`：较大位置。

用户从右向左选择时，anchor/head 与 from/to 的方向可能相反。需要保留方向时不能只使用 from/to。

## 8. ResolvedPos

`doc.resolve(pos)` 得到 `$pos`，它缓存该位置沿树路径的信息：

- depth；
- 各层 node；
- parent；
- parentOffset；
- start/end/before/after；
- nodeBefore/nodeAfter；
- marks。

很多结构命令不是检查“当前位置数字”，而是检查 `$from`、`$to` 的父层级和 ContentMatch。

## 9. Stored Marks

空 TextSelection 没有可加 Mark 的实际文档范围。此时 `setMark` 通常调用：

- `tr.addStoredMark(mark)`；
- 或 `tr.removeStoredMark()`。

之后输入的文字继承这些 marks。

非空 Selection 则对范围使用 `tr.addMark(from, to, mark)`。

这解释了为什么光标处点击粗体，旧文本不改变，但后续输入变粗。

## 10. `apply()` 与 `applyTransaction()`

### `state.apply(tr)`

应用一个 Transaction，返回新 State。

### `state.applyTransaction(rootTr)`

完整执行：

- 各 Plugin 的 `filterTransaction`；
- root Transaction；
- Plugin StateField apply；
- `appendTransaction`；
- 可能多轮追加；
- 返回最终 State 和实际应用的全部 Transactions。

Tiptap 使用后者，因为 paste rules、autolink、表格修复等依赖追加事务。

## 11. Plugin Transaction Hooks

### `filterTransaction`

在应用前拒绝 Transaction。使用时要谨慎：

- 拒绝本地非法操作可能合理；
- 已发生的外部协作变更不能简单拒绝，否则外部真源与 EditorState 可能分裂。

### `appendTransaction`

观察一批已应用 Transactions，返回一个补充 Transaction。

常见用途：

- paste rule；
- autolink；
- 结构修复；
- decoration 状态维护；
- selection 恢复。

必须防止无限循环。常见条件：

- 检查 `docChanged`；
- 检查专用 meta；
- 只有存在新 Step 时才返回；
- 识别是否已经处理过。

## 12. Transaction Metadata

Meta 是 Plugin 与命令之间的重要协议：

- `addToHistory: false`；
- `preventUpdate`；
- `preventDispatch`；
- `preventAutolink`；
- `focus` / `blur`；
- `uiEvent: paste/drop/cut`；
- `composition`；
- `pointer`；
- PluginKey 对应的状态动作。

Meta 不会自动成为文档内容。命名应稳定，最好使用 PluginKey 避免字符串冲突。

## 13. Tiptap 的 dispatch 链

`packages/core/src/Editor.ts` 中的主流程：

```text
view.dispatch(transaction)
→ ExtensionManager.dispatchTransaction middleware
→ Editor.dispatchTransaction
→ state.applyTransaction
→ emit beforeTransaction
→ view.updateState
→ emit transaction
→ selection changed: emit selectionUpdate
→ latest focus/blur meta: emit focus/blur
→ real doc changed: emit update
```

重要区别：

- `transaction`：状态变换事件，更宽泛；
- `selectionUpdate`：Selection 变化；
- `update`：文档真正变化；
- `preventUpdate` 可以抑制 update；
- `docChanged` 为真也可能最终文档相等，因此还应比较 `prevState.doc.eq(nextState.doc)`。

## 14. 命令链的共享 Transaction

`CommandManager.createChain()`：

- 只创建一个 `tr`；
- 每个命令向同一 `tr` 添加 Step；
- `createChainableState()` 让后续命令读取 `tr.doc`、`tr.selection`、`tr.storedMarks`；
- `run()` 最终 dispatch 一次。

错误写法是在命令内部直接读取 `editor.state`，它可能是 chain 开始前的旧状态。应优先使用 CommandProps 中的 `state` 和 `tr`。

## 15. `can()` 的契约

`editor.can()` 仍运行同一个命令，但不提供 dispatch，也不提交 transaction。

正确命令应该：

- 在无 dispatch 时只检查可行性；
- 不直接改 DOM；
- 不发送网络请求；
- 不绕过 props 调 `editor.view.dispatch()`；
- 返回准确布尔值。

否则 `can()` 会产生意外副作用。

## 16. 常见错误

- 跨 Transaction 缓存绝对 position；
- 多步修改时不使用 `tr.mapping`；
- 把 `docChanged` 当作唯一业务更新判断；
- appendTransaction 每次都返回空或重复 Transaction；
- 用字符串 offset 理解树 position；
- 在 chain 中读取 `editor.state`；
- can-check 时仍执行外部副作用；
- 把 Selection-only transaction 加入不必要的历史事件。

## 17. 面试检查点

- 为什么 EditorState 要不可变？
- Transaction 与 Transform 有何关系？
- Step、StepMap、Mapping 各自是什么？
- 为什么多步命令必须映射位置？
- TextSelection 和 NodeSelection 有什么差异？
- storedMarks 解决什么问题？
- `applyTransaction` 为什么比 `apply` 复杂？
- `filterTransaction` 和 `appendTransaction` 各适合什么场景？
- chain 为什么只 dispatch 一次？
- `can()` 对自定义命令有什么契约？