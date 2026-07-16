# 复杂扩展、历史与协作

## 1. 为什么阅读复杂扩展

Core 告诉你机制，复杂扩展展示机制如何组合：

- Schema 约束；
- Commands；
- Plugin State；
- browser events；
- NodeView；
- async lifecycle；
- serialization；
- collaboration mapping；
- memory cleanup。

## 2. Table

主要目录：`packages/extension-table/src/`。

### Schema

- Table：`tableRow+`、isolating；
- Row：Cell/Header 序列；
- Cell：`block+`、isolating；
- attrs：colspan、rowspan、colwidth、align；
- `tableRole` 通过 `extendNodeSchema()` 注入相关类型。

### Commands

多数包装 `@tiptap/pm/tables`：

- add/delete row/column；
- merge/split cell；
- toggle header；
- setCellSelection；
- fixTables；
- goToNextCell。

### Plugins 与 View

- `tableEditing()`；
- 可编辑且 resizable 时使用 `columnResizing()`；
- TableView 维护 table、colgroup、tbody；
- Tab 在最后一个 Cell 可新增 Row。

### 学习点

- 复杂结构必须由 Schema 和专用命令共同保护；
- isolating 防止普通编辑命令穿越边界；
- CellSelection 不是 TextSelection；
- clipboard、column width、Markdown 都要独立测试。

## 3. List

主要目录：`packages/extension-list/src/`。

ListItem 常用 `content: 'paragraph block*'`、`defining: true`。

基础键位：

- Enter → splitListItem；
- Tab → sinkListItem；
- Shift-Tab → liftListItem。

真正困难的是 Backspace/Delete：

- 合并相邻 Item；
- 提升嵌套层级；
- 分支嵌套列表；
- 普通 List 与 TaskList；
- Wrapper 和 Item Type 匹配；
- 光标在首个 paragraph 边界时的行为。

阅读：

- `packages/extension-list/src/keymap/list-keymap.ts`
- `packages/extension-list/src/keymap/listHelpers/`
- `packages/extension-list/src/helpers/`

## 4. Suggestion

主要目录：`packages/suggestion/src/`。

### State

维护：

- active；
- range；
- query/text；
- composing；
- decorationId；
- dismissedRange。

每个 Transaction 都重新判断：

- 当前光标是否匹配触发字符；
- 是否允许显示；
- 旧 range 如何 mapping；
- Escape 后是否仍在同一范围。

### Props

处理：

- keydown；
- Escape；
- Decoration；
- decoration DOM attrs。

Escape 常通过 Plugin Meta-only Transaction 退出，不必修改文档。

### View 与异步

生命周期：

- onBeforeStart；
- onStart；
- onBeforeUpdate；
- onUpdate；
- onExit。

异步请求防竞态：

- debounce；
- AbortController；
- 当前 controller 身份检查；
- 返回后再次读取 Plugin State；
- destroy/exit 时取消。

这是学习“Plugin State + Decoration + async floating UI”的最佳范例。

## 5. Mention

源码：`packages/extension-mention/src/mention.ts`。

Mention 是 inline atom Node，而非 Mark：

- 有结构化 id/label；
- 应整体导航和删除；
- 不希望光标进入内部；
- 可保存触发字符；
- 可配置多个 Suggestion，例如 `@` 和 `#`。

设计问题：Mention 的显示文本是持久化 label，还是运行时根据 id 查询？两种方式在离线、更新名称、序列化和协作中权衡不同。

## 6. Link

源码：

- `packages/extension-link/src/link.ts`
- `packages/extension-link/src/helpers/autolink.ts`
- `packages/extension-link/src/helpers/pasteHandler.ts`
- `packages/extension-link/src/helpers/clickHandler.ts`

Link 同时组合：

- Mark Schema；
- commands；
- input/paste rules；
- autolink appendTransaction；
- click handler；
- custom protocols；
- URL 安全校验。

安全应在多个入口防御：

- parseHTML；
- renderHTML；
- command；
- click/open。

全局 protocol registry 需要关注多 Editor 共享和 destroy 互相影响。

## 7. Image

源码：

- `packages/extension-image/src/image.ts`
- `packages/core/src/ResizableNodeView.ts`

Image 展示：

- block/inline 动态 Schema；
- src/alt/title/width/height attrs；
- base64 策略；
- draggable Node；
- Markdown；
- 可选 resize NodeView。

Resize 的好设计：拖动时先更新视觉尺寸，commit 时用 Transaction 更新 attrs，避免每个 pointermove 都写文档和历史。

## 8. 普通 History

源码：`packages/extensions/src/undo-redo/undo-redo.ts`。

它包装 `@tiptap/pm/history`：

- history plugin；
- undo/redo commands；
- depth；
- newGroupDelay；
- Mod-z/Shift-Mod-z/Mod-y。

History 记录的是本地 ProseMirror Steps 和 Selection bookmark，并根据时间与映射分组。

## 9. Collaboration

源码：`packages/extension-collaboration/src/collaboration.ts`。

组合：

- Y.Doc / XmlFragment；
- `ySyncPlugin`；
- `yUndoPlugin`；
- Provider；
- Yjs UndoManager；
- Relative Position。

### 为什么不能同时用普通 History

普通 History 理解本地 PM Step；协作 Undo 需要理解 CRDT origin 和共享变更。如果两套历史同时启用，可能重复或错误撤销。

Collaboration 提供自己的 undo/redo，并使用 `preventDispatch`，因为实际状态变化由 Yjs UndoManager 产生。

## 10. Absolute Position 与 Relative Position

普通本地 Transaction 可以通过 StepMap 映射数字 position。

远端 CRDT 修改可能不对应当前客户端的一条简单本地 Mapping。Yjs Relative Position 绑定到 CRDT 结构，可在合并远端变化后重新解析为绝对 PM position。

用途：

- 评论锚点；
- 协作 Selection；
- 远端 Cursor；
- 跨异步更新范围；
- DragHandle 当前节点。

源码：

- `packages/extension-collaboration/src/helpers/CollaborationMappablePosition.ts`
- `packages/extension-collaboration/src/helpers/yRelativePosition.ts`

## 11. 协作中的非法内容

当远端 Yjs 更新产生不符合当前 Schema 的内容：

- Transaction 对外部真源而言已经发生；
- 直接 filter 掉会让 Yjs 和 PM State 不一致；
- Collaboration 扩展会检测并标记禁用协作；
- 发出 contentError 和恢复/销毁选项；
- 维持当前同步边界的一致性。

这体现“外部真源已经提交后，不能把 filterTransaction 当回滚机制”。

## 12. 内存管理

长期 Y.Doc/Provider 会比 Editor 活得更久。必须清理：

- Yjs listeners；
- UndoManager；
- awareness listeners；
- plugin views；
- provider callbacks；
- editor references。

参考测试：

- `packages/extension-collaboration/__tests__/memoryLeak.spec.ts`
- `packages/extension-collaboration/__tests__/filterInvalidContent.spec.ts`

## 13. 复杂扩展的通用分析框架

阅读每个扩展时回答：

1. 文档持久化数据是什么？
2. 临时 UI 状态在哪里？
3. Schema 如何保证结构？
4. Command 如何支持 can/chain？
5. Plugin 观察哪些 Transaction？
6. Position 如何映射？
7. 浏览器事件由谁处理？
8. HTML/JSON/Markdown 如何往返？
9. 多 Editor/协作是否共享外部状态？
10. destroy 清理什么？
11. 单元测试和 E2E 各验证什么？

## 14. 面试检查点

- Table 为什么需要 isolating 和专用 Selection？
- List 的 Backspace 为什么比 splitListItem 更难？
- Suggestion 如何防止异步结果乱序？
- Mention 为什么是 atom Node？
- Link 安全为何要多入口校验？
- Image resize 为什么不应每帧 dispatch？
- 普通 History 与协作 Undo 有何本质区别？
- Relative Position 解决了什么？
- 为什么已发生的协作非法更新不能简单 filter？