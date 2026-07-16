# 序列化、SSR 与静态渲染

## 1. 常见内容表示

- ProseMirror Node：运行时结构化文档；
- JSON：持久化和传输；
- HTML：展示、粘贴、导入导出；
- Markdown：文本生态格式；
- EditorView DOM：交互式视图，不是持久化格式；
- Decoration：临时 View 表现，不进入文档。

## 2. JSON

`editor.getJSON()` 本质来自 `state.doc.toJSON()`。

优点：

- 保留 Node/Mark 类型和 attrs；
- 不受浏览器 DOM 规范化影响；
- 更适合 Schema 校验、迁移和协作；
- 可重新用 `schema.nodeFromJSON()` 构建。

风险：

- Schema 名称和 attrs 是持久化协议；
- 扩展移除或 required attr 变化会导致旧数据不兼容；
- Plugin State 不会默认跟随 doc JSON 序列化。

## 3. HTML → JSON

Core 浏览器路径：

```text
HTML string
→ elementFromString
→ DOMParser.fromSchema(schema)
→ PM Node
→ toJSON
```

`packages/html` 提供浏览器与 server 子路径：

- `packages/html/src/generateJSON.ts`
- `packages/html/src/server/generateJSON.ts`

Server 版使用局部 happy-dom Window，并在完成后关闭，避免污染全局和泄漏资源。

## 4. JSON → HTML

Core/HTML 包典型路径：

```text
JSON
→ schema.nodeFromJSON
→ DOMSerializer.fromSchema
→ serializeFragment
→ HTML
```

输出来自 Schema `toDOM`，也就是扩展 `renderHTML()`。

不会自动包含：

- NodeView 的按钮、resize handle；
- React/Vue 组件结构；
- Decoration；
- Placeholder；
- Selection class；
- Plugin 外部 UI。

## 5. Parse 与 Render 不天然互逆

需要显式测试 round-trip：

```text
input HTML
→ parse
→ normalized JSON
→ render
→ normalized HTML
```

差异可能来自：

- 浏览器 DOM 规范化；
- 默认 attrs；
- 未知标签丢弃；
- style 与 tag 规则；
- whitespace；
- URL 安全过滤；
- Schema 不允许的结构自动修复。

目标通常不是字节完全相同，而是语义和规范文档一致。

## 6. Core 无挂载不等于完全 SSR

在没有 element 时，Core 可持有 State 和有限 View Proxy。

但 HTML 字符串解析依赖 DOMParser。真正无 DOM 环境中：

- 使用 JSON content；
- 或 `@tiptap/html/server`；
- 或 Static Renderer。

不要因为 `element: null` 就假设 `new Editor({ content: '<p>x</p>' })` 在所有 server 环境都安全。

## 7. React SSR

`packages/react/src/useEditor.ts`：

- server snapshot 返回 null；
- SSR 时不立即创建 Editor；
- `immediatelyRender: false` 可防 hydration mismatch；
- client effect 中再创建；
- 组件要接受 editor 暂时为 null。

推荐分层：

```text
Server:
  JSON → static HTML

Client hydration:
  static shell
  → create Editor after mount
  → mount EditorView
```

不要让服务端静态 DOM 与客户端 ProseMirror 同时争夺同一个可编辑容器。

## 8. `packages/html` 与 Static Renderer

### `packages/html`

特点：

- 使用 PM DOMParser/DOMSerializer；
- 主要支持 HTML ↔ JSON；
- Server 版用 happy-dom；
- 追求 Schema DOM 解析/序列化语义。

### `packages/static-renderer`

特点：

- 遍历 JSON/PM Tree；
- 目标可为 HTML string、React element、Markdown 或自定义类型；
- 可以不创建完整 Editor；
- 可自定义 node/mark mapping；
- 更适合 SSR 和多目标输出。

## 9. Static Renderer 的限制

它不运行完整编辑器运行时，因此不会自动执行：

- `addProseMirrorPlugins()`；
- onCreate；
- transaction hooks；
- NodeView；
- 插件生成的 Decoration；
- 依赖 Transaction 补齐数据的逻辑。

如果 UniqueID、TableOfContents 等数据依赖 Plugin/Transaction，应先预处理 JSON，再静态渲染。

## 10. Markdown

当前仓库有：

- `packages/markdown`；
- 扩展内的 `parseMarkdown` / `renderMarkdown`；
- Static Renderer 的 Markdown 输出。

Markdown 不是 HTML 的无损替代：

- 自定义 Node/Mark 可能没有语法；
- Table、Task List、代码、换行有方言差异；
- attrs 可能丢失；
- HTML 内嵌策略影响安全和可逆性。

扩展支持 Markdown 时，应单独定义和测试语义，不要假设 `HTML → Markdown` 自动无损。

## 11. 安全边界

Schema 校验不等同于完整 XSS 防御。

应关注：

- URL scheme；
- link target/rel；
- iframe/video/embed attrs；
- 用户自定义 renderHTML；
- server 解析是否加载外部资源；
- 静态输出进入宿主模板时的 escaping；
- raw HTML Markdown。

Link 是安全实现范例：parse、render、command 多入口校验 URI。

## 12. 内容迁移

Schema 版本升级可采用：

1. 为 JSON 增加外部 documentVersion；
2. 载入前执行纯数据迁移；
3. 对 required attrs 提供迁移默认值；
4. 保留旧 parseHTML 兼容规则；
5. 渲染统一输出新格式；
6. 对协作文档设计 CRDT 迁移流程；
7. 使用 fixtures 做旧版本回归。

不要仅依靠 DOMParser 静默丢弃未知内容。

## 13. 测试清单

- JSON → Node → JSON；
- HTML → Node → HTML；
- attrs default/required/validate；
- unknown content；
- whitespace/code block；
- XSS/unsafe URL；
- server resource cleanup；
- React SSR hydration；
- Static Renderer 与 Editor `getHTML()` 语义对比；
- Markdown round-trip；
- 历史版本 fixtures。

## 14. 面试检查点

- JSON 为什么通常比 HTML 更适合编辑器内部持久化？
- `getHTML()` 为什么不读取 View DOM？
- NodeView 为什么不会进入静态 HTML？
- `@tiptap/html/server` 与 Static Renderer 如何选择？
- 未挂载 Editor 为什么仍不等于完整 SSR？
- Static Renderer 为什么不会生成插件数据？
- Schema 校验为何不能代替安全过滤？
- 如何设计 Schema 数据迁移？