# Tiptap Core 与 Editor 生命周期

## 1. Core 的主要类

- `Editor`：运行时协调器；
- `ExtensionManager`：扩展解析与编译；
- `CommandManager`：命令执行、chain、can；
- `EventEmitter`：同步生命周期和编辑事件；
- `Extendable`：Extension/Node/Mark 的配置继承基础；
- `NodeView` / `MarkView`：框架无关的 View 基类。

## 2. Editor 构造顺序

源码：`packages/core/src/Editor.ts`。

```text
constructor(options)
→ setOptions
→ createExtensionManager
→ createCommandManager
→ createSchema
→ register user callbacks
→ emit beforeCreate
→ createDoc
→ resolve initial selection
→ EditorState.create
→ options.element ? mount(element) : remain unmounted
```

要点：

- ExtensionManager 在初始文档解析前创建；
- Schema 来自扩展；
- 初始 State 可独立于 View 存在；
- `beforeCreate` 发生在 `createDoc()` 前；
- 有 element 才自动 mount。

## 3. Core Extensions

Editor 会注入一组内建扩展，例如：

- Editable；
- ClipboardTextSerializer；
- Commands；
- FocusEvents；
- Keymap；
- Tabindex；
- Drop；
- Paste；
- Delete；
- TextDirection。

源码目录：`packages/core/src/extensions/`。

这些能力仍通过 Extension 实现，说明内建行为和用户扩展尽量共享同一套机制。

## 4. Mount

`Editor.mount(el)`：

1. 检查 `document`；
2. `createView(el)`；
3. 发出 `mount`；
4. 注入 CSS；
5. 下一宏任务 autofocus；
6. 发出 `create`；
7. `isInitialized = true`。

`create` 异步到下一宏任务意味着构造函数返回时，Editor 不一定已经发出 create。

## 5. Unmount 与 Destroy

### `unmount()`

- 销毁 EditorView；
- 移除 DOM 上的 editor 引用；
- 释放样式引用条件；
- 保留 State、Schema 和 Extension 系统；
- 允许以后重新 mount。

### `destroy()`

- 发出 destroy；
- 调用 unmount；
- 移除所有监听器；
- 清理 Extension 引用和继承链；
- 是最终资源释放。

区分“没有可用 View”和“Editor 已最终销毁”。未挂载时公开 `isDestroyed` 的语义偏向 View 可用性，而 Editor 内部还有防止重复最终销毁的状态。

## 6. 未挂载 Editor

未 mount 时 `editor.view` 返回有限 Proxy，支持：

- `state`；
- `updateState`；
- `dispatch`；
- `editable`；
- `composing`；
- `dragging`；
- `isDestroyed`。

依赖真实 DOM 的其他 View API 会抛错。

用途：

- 延迟 mount；
- 某些 SSR/测试场景；
- 在 DOM 容器准备前先持有文档 State。

限制：无 DOM 环境下 HTML 字符串解析仍需要 DOMParser，不能把“无 View”误解为“所有 API 都支持 SSR”。

## 7. ExtensionManager 初始化

```text
new ExtensionManager(baseExtensions, editor)
→ resolveExtensions
    → flattenExtensions
    → sortExtensions
    → duplicate-name warning
→ getSchemaByResolvedExtensions
→ setupExtensions
```

`baseExtensions` 保存未展开集合，`extensions` 保存展平和排序后的集合。

## 8. Extension 生命周期绑定

`setupExtensions()` 将扩展钩子绑定到 Editor EventEmitter，例如：

- onBeforeCreate；
- onCreate；
- onUpdate；
- onSelectionUpdate；
- onTransaction；
- onFocus；
- onBlur；
- onDestroy。

用户回调和扩展生命周期最终共享同一个事件系统。

EventEmitter 是同步的：

- 按注册顺序调用；
- 没有异步队列；
- 没有自动异常隔离；
- 一个监听器抛错可能中断后续处理。

源码：`packages/core/src/EventEmitter.ts`。

## 9. 事件语义

- `beforeCreate`：初始文档创建前；
- `mount`：EditorView 创建后；
- `create`：mount 后下一宏任务；
- `beforeTransaction`：State 已计算、View 更新前；
- `transaction`：View State 更新后；
- `selectionUpdate`：Selection 发生变化；
- `update`：文档真实变化；
- `focus/blur`：从 transaction meta 统一发出；
- `paste/drop/delete`：Core 扩展通知；
- `contentError`：内容不能按 Schema 严格解析；
- `unmount`：View 销毁；
- `destroy`：最终销毁。

## 10. Transaction 中间件

扩展可实现 `dispatchTransaction({ transaction, next })`。

```text
high-priority extension
→ next(transaction)
→ lower-priority extension
→ base dispatch
```

如果扩展不调用 `next()`，Transaction 被截断。

适合：

- 记录；
- 统一变换；
- 调试；
- 特殊外部状态集成。

风险：

- 忘记 next 会吞掉编辑；
- 修改 Transaction 顺序可能影响 Plugin；
- 不应轻易用它代替标准 Plugin hooks。

`enableExtensionDispatchTransaction` 可整体关闭这一层。

## 11. 动态 Options

`setOptions()` 可更新 editorProps、editable 等运行时配置，并更新 View。

但不是所有配置都能安全热更新：

- Schema 由 Node/Mark 扩展集合构建；
- 增删 Schema 类型通常需要重建 Editor；
- Plugin 可以用 `state.reconfigure()` 动态变更；
- React `useEditor` 会根据 deps 和扩展引用决定更新 Options 还是重建实例。

## 12. 动态 Plugin

`registerPlugin()` / `unregisterPlugin()` 使用：

```text
state.reconfigure({ plugins: nextPlugins })
→ view.updateState(nextState)
```

`reconfigure` 会：

- 保留新旧集合中仍存在的 Plugin State；
- 初始化新 Plugin State；
- 丢弃移除的 Plugin State。

Plugin View 自己创建的外部资源仍必须依赖 destroy 清理。

## 13. Content Error

严格内容检查用于发现 HTML/JSON 与 Schema 不兼容。

应区分：

- 解析器可容错地丢弃未知结构；
- 业务是否允许内容被静默修复；
- 协作来源已经发生的非法更新如何处理。

对协作内容，直接拒绝已同步的外部变更可能导致 Yjs 与 ProseMirror 分裂，所以 Collaboration 扩展会保持当前状态一致，同时禁用后续协作并发出 contentError。

## 14. 资源清理清单

扩展和框架集成应检查：

- DOM listeners；
- Editor event listeners；
- Plugin View；
- NodeView/MarkView；
- timers/RAF；
- AbortController；
- React Portal/Vue VNode；
- Yjs listener 和 UndoManager；
- 全局 registry；
- DOM 上对 Editor 的反向引用。

长期存在的 Y.Doc、Provider 或全局对象很容易把已销毁 Editor 保留在内存中。

## 15. 阅读任务

1. 逐行跟踪 Editor constructor。
2. 对照 `mount()`、`unmount()`、`destroy()` 列资源变化。
3. 从 `setupExtensions()` 找生命周期绑定顺序。
4. 找 `dispatchTransaction()` 的事件发出顺序。
5. 阅读 `packages/core/__tests__/unmounted.spec.ts`。
6. 阅读 `packages/core/__tests__/dispatchTransaction.spec.ts`。

## 16. 面试检查点

- 为什么初始 State 可以早于 EditorView？
- `beforeCreate`、`mount`、`create` 顺序是什么？
- unmount 与 destroy 有何区别？
- 未挂载 View Proxy 能做什么、不能做什么？
- 用户回调和扩展生命周期如何统一？
- 动态增删 Plugin 与动态改变 Schema 有何差异？
- Transaction 中间件为什么有吞事务风险？