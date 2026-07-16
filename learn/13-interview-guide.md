# Tiptap 与富文本编辑器面试指南

## 回答模板

高质量回答建议采用：

1. **定义**：概念是什么；
2. **职责边界**：它不负责什么；
3. **数据流**：输入如何变成输出；
4. **源码证据**：Tiptap 中对应入口；
5. **设计权衡**：为什么这样做；
6. **常见坑**：错误实现会怎样。

下面答案是要点，不建议逐字背诵。

## 一、架构题

### 1. Tiptap 和 ProseMirror 是什么关系？

- ProseMirror 提供 Schema、Node、EditorState、Transaction、Plugin、EditorView。
- Tiptap 提供 Extension DSL、命令链、生命周期、框架绑定和功能扩展。
- Tiptap 没有重写底层浏览器输入内核。
- `packages/pm` 统一再导出 PM 模块和版本。

### 2. 为什么说 Tiptap 是 headless？

- Core 不规定工具栏和产品 UI。
- EditorView 仍管理 contenteditable DOM。
- React/Vue 只适配生命周期、外部 UI 与 NodeView。
- 同一编辑内核可适配不同设计系统。

### 3. ExtensionManager 为什么像编译器？

- 输入是 Extension/Node/Mark 声明。
- 先展平、排序、检查冲突。
- 输出 Schema、commands、keymaps、rules、plugins、NodeViews 和生命周期绑定。
- 它把高层 DSL 编译为 PM 运行时配置。

### 4. StarterKit 为什么不需要 Core 特判？

- 它是普通 Extension。
- `addExtensions()` 返回子扩展。
- flattenExtensions 递归展开。
- 用户可用同一机制创建自定义 Kit。

### 5. `@tiptap/pm` 的价值是什么？

- 统一 PM 子包版本；
- 稳定导入路径；
- 降低重复 PM 实例风险；
- 简化扩展依赖；
- 代价是多一层发布和升级边界。

## 二、浏览器题

### 6. 为什么不能把 `innerHTML` 当编辑器真源？

- 浏览器会产生临时和不一致 DOM；
- IME/composition DOM 不是最终内容；
- HTML 不表达 Plugin State、Selection、History Step；
- Schema、协作和位置映射需要结构化模型；
- 真源应是 `EditorState.doc`。

### 7. 浏览器输入如何变成 Transaction？

- 快捷键可走 keymap/command；
- 普通输入可走 handleTextInput；
- IME/移动端常先修改 DOM；
- DOM Observer 解析最小变化；
- EditorView 创建并 dispatch Transaction；
- State 应用后 View 再同步 DOM。

### 8. 为什么移动端不能只依赖 keydown？

- 软键盘可能没有完整 keydown；
- keyCode 229 常见；
- 自动纠错和候选词只表现为 DOM mutation；
- Enter/Backspace 时序因平台而异；
- 必须依赖 composition、beforeinput/input、DOM Observer 和最终 Transaction。

### 9. composition 中为什么要暂停规则和菜单？

- 文本是候选中间状态；
- 改写 DOM 或 Selection 会破坏 IME；
- 可能导致丢字、重复、候选框关闭；
- Tiptap 检查 `view.composing`，结束后异步重新处理。

### 10. 模型 Selection 和 DOM Selection 有什么区别？

- 模型 Selection 用 PM 文档 position 和类型；
- DOM Selection 用 Node + offset；
- View 负责双向映射；
- blur 后 DOM ranges 可消失，模型 Selection 仍保留；
- 业务逻辑应以模型 Selection 为准。

### 11. `data-pm-slice` 有什么用？

- 保存 Slice 的 openStart/openEnd 和上下文；
- 让嵌套结构跨编辑器粘贴仍正确；
- 标识 PM 内部复制；
- Tiptap 可避免内部内容被 paste rule 二次转换。

### 12. Bubble Menu 点击为什么不能在 blur 时立即隐藏？

- mousedown 菜单通常先让 Editor blur；
- 立即删除菜单会让 click 无法发生；
- 应识别菜单自身 focus/relatedTarget，或在 mousedown 设置 preventHide；
- 还要保护 Selection 和异步定位结果。

## 三、模型与 Schema 题

### 13. Schema 是什么？

- 运行时文档语言定义，不只是 TypeScript 类型；
- 定义 Node/Mark、attrs、content expression、DOM parse/render；
- Node 创建、命令、粘贴和校验都受它约束。

### 14. NodeSpec、NodeType、Node 有何区别？

- NodeSpec：Schema 声明；
- NodeType：Schema 编译后的类型与约束方法；
- Node：具体不可变文档值；
- NodeType 属于具体 Schema，不能跨 Editor 混用。

### 15. Node 和 Mark 如何选择？

- 独立结构、attrs、整体 Selection 语义用 Node；
- 连续行内范围格式用 Mark；
- Mention 是 atom Node；Link 是 Mark。

### 16. Atom 和 Leaf 相同吗？

- Leaf 没有子内容；
- Atom 表示 View/Selection 当作整体；
- Atom 理论上可有内容；
- 两者是不同维度。

### 17. `defining` 与 `isolating` 有什么作用？

- defining 让替换、粘贴时结构边界更稳定；
- isolating 阻止普通 join/lift/delete 跨越边界；
- Heading/ListItem 常 defining；Table/Cell 常 isolating。

### 18. Fragment 和 Slice 有什么区别？

- Fragment 是子节点序列；
- Slice 额外有 openStart/openEnd；
- Slice 表示可插入的开放片段，适合 Selection 和 Clipboard。

### 19. 为什么 NodeView 不能替代 `renderHTML()`？

- NodeView 只属于交互式 EditorView；
- `getHTML()` 使用 Schema DOMSerializer；
- SSR、Static Render、Clipboard 需要持久化 DOM 规则；
- NodeView UI 不应自动进入存储格式。

### 20. Schema 变更为什么可能是 breaking change？

- JSON 中保存 type 和 attrs；
- required/default/content expression 变化会让旧文档失效；
- 协作文档和历史数据需要迁移；
- 不能只看编译期 API 是否兼容。

## 四、State 与 Transaction 题

### 21. 为什么 EditorState 要不可变？

- 明确状态边界；
- 支持历史和协作；
- Plugin 可纯函数更新；
- View 可增量比较；
- 框架可利用引用相等。

### 22. Transaction 与 Step 的关系？

- Transaction 继承 Transform；
- 一个 Transaction 可含多个 Steps；
- 还携带 Selection、storedMarks、Meta；
- Step 是可应用、反转和映射的原子文档变换。

### 23. 为什么要用 Mapping？

- 前一个 Step 会移动后续位置；
- Mapping 组合所有 StepMap；
- 旧 position 必须映射到当前 `tr.doc`；
- mapResult 还能判断目标是否被删除。

### 24. `map()` 与 `mapResult()` 有何不同？

- map 只返回新位置；
- mapResult 返回删除信息和边界语义；
- 长期锚点、异步范围和删除场景更适合 mapResult。

### 25. storedMarks 解决什么问题？

- 空光标没有实际范围可加 Mark；
- storedMarks 表示下一次输入的格式；
- 非空 Selection 则直接 addMark 到文档范围。

### 26. `apply()` 和 `applyTransaction()` 有何差异？

- apply 应用单个 Transaction；
- applyTransaction 执行 filter 和 append hooks；
- 返回最终 State 与全部实际 Transactions；
- PasteRule、Autolink 等依赖后者。

### 27. `filterTransaction` 与 `appendTransaction` 怎么选？

- filter 在应用前拒绝；
- append 在应用后补充变换；
- 结构修复/自动格式常用 append；
- 已提交到外部 CRDT 的更新不能简单 filter 回滚。

### 28. Transaction Meta 有什么价值？

- 不改文档也可驱动 Plugin State；
- 协调 focus、history、autolink、UI；
- 使用 PluginKey 可避免冲突；
- Meta 不会自动持久化到 doc。

## 五、命令与扩展题

### 29. commands、chain、can 的区别？

- commands：执行单命令并 dispatch；
- chain：共享一个 Transaction，run 时一次 dispatch；
- can：相同命令但 dispatch undefined，不提交；
- 三者复用同一 RawCommands。

### 30. chain 后续命令如何看到前序修改？

- 所有命令共享同一 `tr`；
- createChainableState 的 getters 指向 `tr.doc/selection/storedMarks`；
- 直接读 `editor.state` 可能读旧 State。

### 31. 自定义命令如何正确支持 `can()`？

- 无 dispatch 时只判断；
- 不改 DOM、不发请求；
- 不直接调用 view.dispatch；
- 使用传入 state/tr；
- 返回准确 Boolean。

### 32. configure 和 extend 有何区别？

- configure 主要合并 Options；
- extend 可覆盖任意 Extension Config；
- 二者返回新实例；
- parent 方法通过 `this.parent` 访问。

### 33. Options 和 Storage 如何区分？

- Options 是配置；
- Storage 是每个 Editor 的运行期可变数据；
- 文档持久化和协作语义不应只放 Storage；
- 外部缓存或客户端可放 Storage。

### 34. Input Rule 和 Paste Rule 的区别？

- Input Rule 常在 handleTextInput 阶段匹配光标前文本；
- Paste Rule 常在粘贴文档变更后 appendTransaction；
- 前者有专用 undoInputRule；
- 后者可扫描多个 changed ranges。

### 35. 什么时候用 Plugin 而不是 Command？

- 需要 StateField、Decoration、DOM handlers、append/filter、Plugin View 生命周期时；
- 单次明确用户操作优先 Command；
- 简单输入模式优先 Rule。

### 36. Extension priority 为什么危险？

- 同时影响 plugins、keymap、parse、commands 和 middleware；
- 调整一个冲突可能改变其他行为；
- 必须用顺序测试固定语义。

## 六、NodeView 与框架题

### 37. NodeView 的 `dom` 和 `contentDOM` 有何区别？

- dom 是外层；
- contentDOM 是 PM 管理子文档的容器；
- 框架拥有外壳，PM 拥有 contentDOM children；
- 双方同时管理会破坏 Selection 和 DOM Observer。

### 38. `getPos()` 为什么不能缓存？

- 任意前序 Transaction 都可能移动节点；
- 它是获取当前位置的回调；
- 异步和协作场景还需 Mapping/Relative Position。

### 39. NodeView `update()` 返回 false 会怎样？

- 表示实例不能复用；
- PM 销毁并重建；
- NodeType 变化通常 false；
- 同类型 attrs 变化通常更新 props 后 true。

### 40. `stopEvent()` 和 `ignoreMutation()` 有何区别？

- stopEvent 管 DOM Event 是否交给 PM；
- ignoreMutation 管 DOM Mutation 是否重读；
- 自定义按钮常 stop；
- contentDOM mutation 通常不能 ignore。

### 41. React 为什么用 Portal？

- DOM 插入位置由 PM 决定；
- 组件仍需处于 React 树和 Context；
- Portal 渲染到 NodeView host；
- EditorContent registry 管理 Portal 生命周期。

### 42. React 为什么使用 external store/selector？

- Editor 是 React 外部状态机；
- 并发渲染需要稳定订阅协议；
- selector 减少每次 Transaction 的无关 rerender；
- 不复制完整 PM State。

### 43. Vue 为什么使用 `markRaw` 和延迟响应式刷新？

- 避免深层代理 PM/Editor 对象；
- PM View 必须立即更新；
- Vue UI 可合并到后续帧；
- 降低同步事务引发的组件重绘。

## 七、复杂扩展与协作题

### 44. Suggestion 如何避免异步乱序？

- debounce；
- AbortController；
- controller 身份；
- 返回后检查 Plugin State；
- exit/destroy 取消；
- 旧请求不能重开 UI。

### 45. Mention 为什么是 Atom Node？

- 有结构化 id/label；
- 需要整体导航删除；
- 不希望光标进入；
- 可独立序列化和渲染。

### 46. Table 为什么需要专用 Selection 和 Commands？

- 表格是二维结构；
- CellSelection 可有多范围；
- 普通文本命令不能保证 rowspan/colspan 和矩形语义；
- tableEditing/fixTables 维护结构。

### 47. 普通 History 为什么不能与 Collaboration 同时启用？

- 普通 History 记录本地 PM Steps；
- 协作 Undo 基于 Yjs Origin/UndoManager；
- 两套真源会重复或错误撤销；
- Collaboration 提供自己的命令。

### 48. Relative Position 解决什么问题？

- 数字 position 会因远端 CRDT 修改失效；
- Relative Position 绑定到 CRDT 结构；
- 合并后可重新解析为 PM position；
- 适合评论和协作光标。

### 49. 为什么协作非法更新不能简单 filter？

- Yjs 变更已经在外部真源提交；
- PM 拒绝会造成两边状态分裂；
- 应保持同步边界一致，报告错误并禁用/恢复协作。

## 八、序列化与工程题

### 50. `@tiptap/html/server` 与 Static Renderer 如何选择？

- 需要 HTML ↔ JSON 和 PM DOM 语义：html/server；
- 只需 JSON/PM → HTML/React/Markdown：Static Renderer；
- Static Renderer 不运行 Plugin 和生命周期。

### 51. Decoration 为什么不进入 JSON/HTML？

- 它属于 Plugin/View State，不属于 doc；
- JSON 来自 `doc.toJSON()`；
- HTML 来自 Schema DOMSerializer；
- 临时 UI 不应污染持久化内容。

### 52. 如何设计富文本测试金字塔？

- 单元：Schema、Transaction、Plugin、序列化；
- E2E：真实 Selection、DOM、clipboard、drag、menus；
- 真机：IME、软键盘、Safari/iOS/Android；
- teardown/内存单独覆盖。

### 53. 常见性能热点是什么？

- 框架订阅所有 Transactions；
- Decoration 全文扫描；
- 大文档高频 getHTML；
- NodeView 全量重渲染；
- pointermove dispatch；
- 异步请求不取消；
- 重 Plugin 无条件启用；
- listener 泄漏。

### 54. 如何判断 Editor destroy 是否完整？

- DOM editor 反向引用移除；
- Plugin/NodeView/Renderer destroy；
- listeners/timers/RAF/requests 清理；
- Portal/VNode unmount；
- Y.Doc listener/UndoManager 不累积；
- 重复创建销毁后引用数量稳定。

## 九、系统设计题

### 55. 设计一个多人评论系统

回答应覆盖：

- 评论内容与锚点的数据模型；
- 文档 Mark vs 外部数据库；
- 本地 StepMap 与 Yjs Relative Position；
- Decoration 展示；
- 删除/拆分范围；
- 权限和并发；
- Undo 边界；
- SSR；
- 离线同步；
- 测试与迁移。

### 56. 设计一个可扩展富文本编辑器

回答应覆盖：

- Schema 与扩展协议；
- State/Transaction 不可变模型；
- Plugin 优先级与冲突；
- 浏览器输入归一化；
- framework ownership；
- serialization/versioning；
- history/collaboration；
- security；
- test matrix；
- performance and cleanup。

## 模拟面试评分

每题 0～3 分：

- 0：不知道；
- 1：只给定义；
- 2：能讲数据流和常见坑；
- 3：能结合源码、权衡和测试。

建议目标：

- 基础题平均至少 2 分；
- 核心架构/State/NodeView 题至少 2.5 分；
- 能完整回答一个系统设计题。