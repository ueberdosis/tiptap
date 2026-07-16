# ProseMirror 文档模型与 Schema

## 1. Schema 是什么

`Schema` 定义一门文档语言：有哪些 Node 和 Mark，它们有哪些属性，哪些嵌套关系合法，以及如何与 DOM 互相转换。

它不是只用于 TypeScript 类型检查，而是运行时约束：

- Node 创建时；
- HTML 解析时；
- Transaction 替换内容时；
- 命令判断可执行性时；
- 文档校验和序列化时。

参考：[ProseMirror Schema 中文手册](https://prosemirror.xheldon.com/docs/ref/#model.Schema)。

## 2. 文档是一棵持久化树

典型 JSON：

```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "hello",
          "marks": [{ "type": "bold" }]
        }
      ]
    }
  ]
}
```

- `doc`、paragraph、heading、image、table 是 Node；
- `bold`、italic、link 是 Mark；
- Node/Mark 是不可变值；
- 变更不会原地修改旧节点，而是通过 Step 产生共享未变子树的新文档。

这类持久化数据结构支持：

- 旧 State 可安全保留；
- 文档比较和增量更新；
- Undo/Redo；
- Transaction mapping；
- 框架用引用相等判断是否需要更新。

## 3. Node、NodeType、NodeSpec

### `NodeSpec`

Schema 的声明：内容表达式、group、attributes、DOM 规则等。

### `NodeType`

Schema 编译后得到的节点类型，属于某个具体 Schema。可用于：

- `create()`；
- `createAndFill()`；
- `validContent()`；
- `allowsMarkType()`；
- `contentMatch`。

### `Node`

具体文档值，包含 type、attrs、content、marks 或 text。

注意：`NodeType` 属于创建它的 Schema。不要把另一个 Editor Schema 的 NodeType 用到当前文档。

## 4. Mark、MarkType、MarkSpec

Mark 表示附着在行内内容范围上的格式或语义，例如 bold 和 link。

与 Node 的差异：

- Mark 不作为普通子节点占据树层级；
- text node 的 `marks` 数组携带 Mark；
- Mark 可以通过 `inclusive` 控制边界输入行为；
- `excludes` 控制互斥；
- 空 Selection 时常通过 `storedMarks` 影响之后输入。

什么时候用 Node 而不是 Mark？

- Mention 有 id、label、整体删除和原子导航语义，适合 atom Node；
- Link 作用于连续文本范围，适合 Mark。

## 5. Content Expression

常见表达式：

- `block+`：一个或多个 block；
- `inline*`：零个或多个 inline；
- `text*`：零个或多个 text；
- `paragraph block*`：先一个 paragraph，再零个或多个 block；
- `tableRow+`：一个或多个 table row。

源码实例：

- `packages/extension-document/src/document.ts`：`block+`
- `packages/extension-paragraph/src/paragraph.ts`：`inline*`
- `packages/extension-code-block/src/code-block.ts`：`text*`
- `packages/extension-list/src/item/list-item.ts`：`paragraph block*`
- `packages/extension-table/src/table/table.ts`：`tableRow+`

Schema 约束比工具栏状态更可靠。隐藏按钮不等于禁止非法结构，content expression 才是最终约束。

## 6. NodeSpec 关键字段

- `content`：子内容表达式；
- `marks`：允许的 Mark，空字符串表示不允许；
- `group`：用于 content expression 的分组；
- `inline`：是否为行内 Node；
- `atom`：View/Selection 是否把它当一个单元；
- `selectable`：能否被 NodeSelection 选择；
- `draggable`：是否可拖；
- `code`：是否为代码语义；
- `whitespace`：空白解析策略；
- `defining`：替换内容时是否保留结构边界；
- `isolating`：常规编辑命令是否应跨越边界；
- `attrs`：属性规则；
- `parseDOM`：DOM → Node；
- `toDOM`：Node → DOMOutputSpec。

### Atom 不等于 Leaf

- Leaf 没有子内容；
- Atom 表示编辑视图把节点当整体；
- Atom 理论上仍可有内容。

### `defining` 与 `isolating`

- Heading、ListItem 常使用 `defining`，使替换时结构更稳定；
- Table Cell 常使用 `isolating`，防止普通 join/lift/delete 跨越表格边界破坏结构。

## 7. Attributes

ProseMirror AttributeSpec 主要包含 default 和 validate。Tiptap 在此之上增加：

- `isRequired`；
- `rendered`；
- `parseHTML`；
- `renderHTML`；
- `keepOnSplit`；
- 全局属性。

转换路径：

```text
addAttributes / addGlobalAttributes
→ getAttributesFromExtensions
→ NodeSpec/MarkSpec.attrs
→ 注入 parseDOM.getAttrs
→ getRenderedAttributes
→ renderHTML
```

关键源码：

- `packages/core/src/helpers/getAttributesFromExtensions.ts`
- `packages/core/src/helpers/injectExtensionAttributesToParseRule.ts`
- `packages/core/src/helpers/getRenderedAttributes.ts`
- `packages/core/src/helpers/getSchemaByResolvedExtensions.ts`

`rendered: false` 表示属性仍可存在于文档 JSON，但不自动输出到 HTML。

## 8. Tiptap 如何编译 Schema

主入口：`packages/core/src/helpers/getSchemaByResolvedExtensions.ts`。

```text
resolved extensions
→ collect local/global attributes
→ split Node and Mark extensions
→ find topNode
→ build NodeSpec map
→ build MarkSpec map
→ apply extendNodeSchema / extendMarkSchema
→ new Schema({ topNode, nodes, marks })
```

Tiptap 映射：

- Node 扩展字段 → `NodeSpec`；
- Mark 扩展字段 → `MarkSpec`；
- `parseHTML()` → `parseDOM`；
- `renderHTML()` → `toDOM`；
- `renderText()` → Tiptap 的 `toText` 扩展字段。

扩展不是包装一个已经存在的 Schema，而是 Schema 的声明来源。

## 9. DOM 解析

HTML 初始化大致经过：

```text
createDocument
→ createNodeFromContent
→ elementFromString
→ DOMParser.fromSchema(schema).parse
```

插入片段常用 `parseSlice()`，因为片段边界可以是开放的，不必是完整 doc。

ParseRule 可能按：

- tag；
- style；
- attributes；
- context；
- priority；
- `getAttrs` 返回值

决定如何生成文档节点。

`getAttrs` 返回 `false` 表示该规则不匹配；返回 `null/undefined` 常表示匹配但不附加属性。不要混淆。

## 10. DOM 序列化

`editor.getHTML()` 并不是读取当前 View 的 `innerHTML`，而是：

```text
state.doc.content
→ DOMSerializer.fromSchema(schema)
→ serializeFragment
→ HTML
```

因此：

- NodeView 组件 UI 不会自动出现在 HTML；
- Decoration 不会进入 HTML；
- Selection class 不会进入 HTML；
- 持久化输出来自扩展 `renderHTML()` 对应的 Schema `toDOM`。

NodeView 扩展仍应定义 `renderHTML()`，否则静态序列化和 SSR 没有可靠输出。

## 11. Fragment 与 Slice

### Fragment

一个不可变的子节点序列，不包含外部父节点。

### Slice

包含：

- `content: Fragment`；
- `openStart`；
- `openEnd`。

开放深度让复制的一段嵌套内容可以在新上下文中合理拼接。例如从列表项内部复制文字时，Slice 不必携带完整 doc→list→listItem 封闭结构。

Clipboard 和 `replaceSelection()` 经常使用 Slice。

## 12. Position 与 `nodeSize`

ProseMirror position 是树边界坐标，不是字符串下标。

规律：

- text node 的 `nodeSize` 等于文本长度；
- 非叶 Node 通常包含开始与结束 token，所以 `nodeSize = content.size + 2`；
- doc 顶层常使用 `doc.content.size` 表示可用内容边界；
- 一个节点之前的位置和它内部第一个内容位置不同。

因此对嵌套结构不能简单用字符串 offset 推导 position。应使用：

- `doc.resolve(pos)`；
- `$pos.depth`、`node(depth)`、`start(depth)`、`before(depth)`；
- `nodesBetween()`、`descendants()`。

## 13. Schema 演进风险

Schema 是持久化数据格式的一部分。修改公开节点的：

- name；
- attributes；
- required/default；
- content expression；
- parse/render 规则

可能让历史 JSON、剪贴板内容或协作文档不兼容。公开 Schema 变更需要迁移策略，而不是只改 TypeScript 类型。

## 14. 源码阅读任务

1. 比较 Document、Paragraph、Text 的最小 Schema。
2. 阅读 Heading 如何把 `level` 放入 attrs。
3. 阅读 CodeBlock 的 `marks: ''`、`code` 与 whitespace。
4. 阅读 Image 的 leaf、draggable、attrs 和 NodeView。
5. 阅读 Link 的 inclusive、excludes、URL 校验和 DOM 往返。
6. 从 `getSchemaByResolvedExtensions()` 找出每个字段如何进入 NodeSpec/MarkSpec。

## 15. 面试检查点

- Schema 是静态类型还是运行时约束？
- NodeSpec、NodeType、Node 分别是什么？
- Mark 为什么不作为普通子节点？
- Atom 与 leaf 有什么区别？
- `defining` 与 `isolating` 解决什么问题？
- Fragment 和 Slice 有什么差异？
- `parse()` 和 `parseSlice()` 如何选择？
- 为什么 `getHTML()` 不等于 View 的 `innerHTML`？
- Schema 变更为什么可能是破坏性变更？