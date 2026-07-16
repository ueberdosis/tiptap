# Tiptap 架构设计

## 1. 一句话定位

Tiptap 是建立在 ProseMirror 上的 headless 富文本编辑器工具包。ProseMirror 提供文档模型、状态机、变换和浏览器视图，Tiptap 提供扩展 DSL、命令系统、生命周期、框架绑定和大量可组合扩展。

## 2. Monorepo 分层

```text
应用与 Demo
├─ demos/                         真实浏览器示例与 E2E
│
框架与输出适配
├─ packages/react                 React hooks、EditorContent、NodeView
├─ packages/vue-3                 Vue 3 绑定
├─ packages/vue-2                 Vue 2 绑定
├─ packages/html                  HTML ↔ JSON
└─ packages/static-renderer       JSON/PM → HTML/React/Markdown
│
功能组合与扩展
├─ packages/starter-kit           常用扩展组合
├─ packages/extensions            通用行为扩展聚合
├─ packages/extension-*           单一 Node/Mark/功能扩展
└─ packages/suggestion            通用 Suggestion 状态机
│
核心抽象
└─ packages/core                  Editor、Extension、Command、Rules
│
依赖门面
└─ packages/pm                    prosemirror-* 统一再导出
```

仓库结构说明见 `agents/REPOSITORY_LAYOUT.md`。

## 3. 依赖方向

理想依赖方向是单向的：

```text
React/Vue/Extensions
        ↓
   @tiptap/core
        ↓
    @tiptap/pm
        ↓
 prosemirror-*
```

Core 不应该依赖具体 React/Vue UI，也不应该依赖所有业务扩展。这样可以保持：

- 框架无关；
- 扩展按需加载；
- 更小的核心包；
- 更容易做 SSR 和静态渲染；
- 单个扩展可独立发布和测试。

## 4. 运行时组件

### `Editor`

源码：`packages/core/src/Editor.ts`

职责：

- 合并配置；
- 创建 ExtensionManager、CommandManager 和 Schema；
- 创建初始文档和 EditorState；
- 挂载 EditorView；
- 分发 Transaction；
- 发出生命周期和内容事件；
- 管理 mount、unmount、destroy。

它是协调器，不是文档数据结构。

### `ExtensionManager`

源码：`packages/core/src/ExtensionManager.ts`

职责：

- 递归展开 `addExtensions()`；
- 按 priority 排序；
- 将 Node/Mark 扩展编译成 Schema；
- 汇总 commands、keymaps、input rules、paste rules 和 plugins；
- 注册 NodeViews/MarkViews；
- 把扩展生命周期绑定到 Editor 事件；
- 构造扩展级 `dispatchTransaction` 中间件。

它可以被理解为“扩展声明的编译器”。

### `CommandManager`

源码：`packages/core/src/CommandManager.ts`

职责：

- 暴露 `editor.commands`；
- 构建共享 Transaction 的 `editor.chain()`；
- 构建不分发的 `editor.can()`；
- 给命令注入 `state`、`tr`、`dispatch`、`view`、`chain`、`can`。

### ProseMirror 三件套

- `Schema`：定义合法文档语言。
- `EditorState`：不可变的编辑状态。
- `EditorView`：DOM、事件、Selection 和 State 的桥梁。

Tiptap 没有复制这三套概念，而是直接组合它们。

## 5. 从配置到可编辑 DOM

```text
new Editor(options)
  → setOptions
  → createExtensionManager
      → resolveExtensions
      → getSchemaByResolvedExtensions
      → setupExtensions
  → createCommandManager
  → createSchema
  → createDoc
  → EditorState.create
  → mount
      → new EditorView
      → state.reconfigure({ plugins })
      → createNodeViews
      → emit('mount')
      → 下一宏任务 emit('create')
```

为什么先创建无插件 State，再创建 View，然后 `reconfigure`？部分扩展在生成 Plugin 时会访问 `editor.view`。先有 View 再安装完整 Plugin 集合，可以满足这一依赖。

## 6. 一次命令的数据流

```text
UI button
  → editor.chain().focus().toggleBold().run()
  → CommandManager 使用共享 tr
  → command 添加 Step / Selection / Meta
  → editor.view.dispatch(tr)
  → 扩展 dispatchTransaction 中间件
  → Editor.dispatchTransaction
  → state.applyTransaction(tr)
  → filterTransaction / appendTransaction
  → view.updateState(nextState)
  → transaction / selectionUpdate / update 事件
  → React/Vue selector 更新外部 UI
```

关键点：

- 一个 chain 只在结尾 dispatch 一次；
- `applyTransaction` 可能得到插件追加的事务；
- `transaction` 不等于 `update`；纯 Selection 或 Meta 变化不一定触发内容更新；
- DOM 更新由 EditorView 根据新 State 完成。

## 7. StarterKit 为什么不是特殊机制

源码：`packages/starter-kit/src/starter-kit.ts`

StarterKit 本身就是普通 `Extension.create()`，其 `addExtensions()` 返回 Document、Paragraph、Text、Bold、List、History 等扩展。

`flattenExtensions()` 会递归展开它，所以用户也可以创建自己的 Kit。这个设计采用组合而非特殊继承层：

- Core 不知道 StarterKit；
- Kit 可配置或禁用单个子扩展；
- 自定义 Kit 与官方 Kit 使用同一条路径。

## 8. `packages/pm` 的意义

`packages/pm` 基本直接再导出 `prosemirror-*`，但它仍有架构价值：

1. 统一 ProseMirror 依赖版本；
2. 给所有 Tiptap 包提供稳定子路径；
3. 降低应用装出两套不兼容 ProseMirror 实例的概率；
4. 简化扩展包依赖声明；
5. 形成 Tiptap 控制的底层 API 边界。

它不是新的 ProseMirror 实现。

## 9. Headless 的含义

Headless 不代表没有 DOM，也不代表没有视图。它表示 Core 不提供固定产品 UI：

- EditorView 仍然管理可编辑 DOM；
- 工具栏、菜单、弹层和样式由应用决定；
- React/Vue 绑定负责生命周期和组件桥接；
- 同一 Core 可用于不同设计系统。

## 10. 关键设计权衡

### 扩展驱动而非硬编码

优点：统一、可覆盖、可禁用、可组合。

代价：初始化和行为顺序更抽象，需要理解 priority 和插件顺序。

### 暴露 ProseMirror 而非完全隐藏

优点：高级能力不受上层 API 限制。

代价：要真正掌握 Tiptap，仍必须学习 ProseMirror。

### ProseMirror State 是唯一真源

优点：避免 DOM、React State、Vue State 和协作状态多份真源互相冲突。

代价：框架必须使用订阅而不是受控输入式双向复制整份文档。

### 小包与细粒度扩展

优点：按需、模块化、可独立演进。

代价：包数量多，版本协调、构建和文档导航更复杂。

## 11. 源码阅读入口

建议依次阅读：

1. `packages/core/src/types.ts`
2. `packages/core/src/Editor.ts`
3. `packages/core/src/ExtensionManager.ts`
4. `packages/core/src/CommandManager.ts`
5. `packages/core/src/helpers/resolveExtensions.ts`
6. `packages/core/src/helpers/getSchemaByResolvedExtensions.ts`
7. `packages/starter-kit/src/starter-kit.ts`
8. `packages/react/src/useEditor.ts`
9. `packages/react/src/EditorContent.tsx`

## 12. 面试检查点

- Tiptap 是对 ProseMirror 的替代还是上层编排？
- 为什么 Core 不直接依赖 React？
- ExtensionManager 为什么像编译器？
- 为什么 StarterKit 可以是普通 Extension？
- `@tiptap/pm` 仅仅是“多余包装”吗？
- headless 编辑器是否仍然需要 EditorView？
- 为什么框架 State 不应复制完整 EditorState？