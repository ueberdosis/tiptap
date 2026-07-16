# 扩展系统、命令、规则与插件

## 1. 三类扩展

### `Extension`

适合不直接定义文档节点的能力：

- commands；
- keymap；
- ProseMirror plugins；
- storage；
- 生命周期；
- 全局 attributes；
- 组合子扩展；
- 修改其他 Node/Mark Schema。

### `Node`

映射为 NodeSpec/NodeType，适合块、行内实体和结构容器。

### `Mark`

映射为 MarkSpec/MarkType，适合作用于行内范围的格式或语义。

三者都继承 `Extendable`。

## 2. `configure()` 与 `extend()`

### `configure(options)`

- 返回新扩展实例；
- 合并 Options；
- 不原地修改共享扩展模板。

### `extend(config)`

- 返回同类型子扩展；
- 可以覆盖更广泛配置；
- 父字段沿 parent 链解析；
- 覆盖方法可通过 `this.parent` 调父实现。

字段解析：`packages/core/src/helpers/getExtensionField.ts`。

这种设计类似配置原型链。好处是模板可复用，代价是 parent/child 引用要在销毁时清理。

## 3. Options 与 Storage

- Options：配置输入，通常视为不可变；
- Storage：每个 Editor 实例的运行期可变状态；
- `editor.storage[name]` / `editor.extensionStorage` 是运行期 Storage；
- 不要把模块级 Extension 单例的 getter 结果误当实例唯一存储。

适合 Storage：

- 非文档缓存；
- 外部客户端；
- 运行统计；
- 可重建索引。

不适合 Storage：

- 需要进入协作和 Undo 的文档语义；
- 必须序列化的持久化属性。

## 4. 扩展解析

```text
base extensions
→ flatten addExtensions()
→ sort by priority descending
→ warn duplicate names
→ split Extension / Node / Mark
```

Priority 可能同时影响：

- parse rule；
- Plugin 和 keymap 顺序；
- command 覆盖；
- transaction middleware；
- Schema 字段扩展。

调整 priority 要做针对性回归，不要只验证一个行为。

## 5. 命令模型

扩展通过 `addCommands()` 返回命令工厂。

CommandProps：

- `editor`；
- `state`；
- `tr`；
- `dispatch`；
- `view`；
- `commands`；
- `chain`；
- `can`。

建议命令：

- 先检查 Schema 和 Selection；
- 无 dispatch 时只返回可执行性；
- 有 dispatch 时只修改传入 `tr`；
- 不绕过链式状态；
- 不产生网络或 DOM 副作用；
- 返回是否处理成功。

## 6. 单命令、Chain、Can

### 单命令

```text
editor.commands.foo()
→ create tr
→ execute command
→ dispatch tr
```

### Chain

```text
editor.chain().foo().bar().run()
→ shared tr
→ execute all
→ dispatch once
```

优点：

- 原子操作；
- 一个历史事件；
- 减少 View 更新；
- 后续命令看到前面变更后的状态。

### Can

```text
editor.can().foo()
→ same command
→ dispatch undefined
→ no commit
```

命令如果在 dry-run 中有副作用，就是实现错误。

## 7. 包装原生 PM 命令

Tiptap 很多命令最终复用：

- `@tiptap/pm/commands`；
- `@tiptap/pm/schema-list`；
- `@tiptap/pm/history`；
- `@tiptap/pm/tables`。

Tiptap 主要增加：

- 字符串名称解析为 NodeType/MarkType；
- chain/can；
- attrs 合并；
- 类型声明扩展；
- 统一 dispatch；
- 业务 fallback。

参考：

- `packages/core/src/commands/setNode.ts`
- `packages/core/src/commands/wrapInList.ts`

## 8. TypeScript Command 扩展

Tiptap 使用声明合并让扩展为 Commands 增加类型。学习时要区分：

- 运行时 `addCommands()` 返回对象；
- TypeScript 模块声明描述命令签名；
- ExtensionManager 最终合并运行时命令表。

扩展的命令 name 冲突可能被对象展开顺序覆盖，重复扩展 name 也只会 warning。因此命名空间和唯一名称很重要。

## 9. Keyboard Shortcuts

```text
addKeyboardShortcuts()
→ ExtensionManager wraps methods
→ prosemirror-keymap keymap(bindings)
→ Plugin.handleKeyDown
```

`Mod` 抽象平台：macOS/iOS 为 Meta，其他平台通常为 Ctrl。

Shortcut handler 返回：

- true：已处理，停止；
- false：继续 fallback。

`keyboardShortcut()` 命令还能程序化触发 View 的 handleKeyDown，并捕获 handler 生成的 steps，映射到当前 chain Transaction。

## 10. Input Rules

适合输入模式转换：

- `# ` → Heading；
- `**text**` → Bold；
- `- ` → List。

规则应考虑：

- 光标前上下文；
- code block 跳过；
- composition；
- 删除匹配文本后的 position mapping；
- undoInputRule。

Helper：

- `markInputRule`；
- `nodeInputRule`；
- `textblockTypeInputRule`。

## 11. Paste Rules

适合：

- 粘贴 URL 自动 Link；
- 批量识别 Mark；
- 粘贴文本结构转换。

应考虑：

- 内部 `data-pm-slice` 是否跳过；
- paste 与 drop；
- 多个 changed ranges；
- code node；
- handler 使用的是映射后的范围；
- appendTransaction 循环。

## 12. ProseMirror Plugins

`addProseMirrorPlugins()` 适合需要：

- Plugin State；
- Decoration；
- DOM Props；
- append/filter transaction；
- Plugin View 生命周期；
- 复杂输入与异步 UI。

不要把所有逻辑都塞进一个 Plugin：

- 纯文档变换可做 command；
- 简单输入模式可做 rule；
- 可持久化数据应进入 doc；
- 临时 UI 状态才适合 Decoration/Plugin State。

## 13. 一个扩展的设计清单

### Schema

- Node、Mark 还是纯 Extension？
- content/group/inline/atom？
- defining/isolating？
- attrs 默认值和校验？
- HTML/Markdown 往返？

### Command

- 无 dispatch 是否无副作用？
- 是否支持 chain？
- 是否使用传入 `state/tr`？
- 是否正确映射位置？

### Browser

- composition？
- paste/drop？
- focus/selection？
- mobile keyboard？

### Lifecycle

- listeners/timers/requests 是否销毁？
- 多 Editor 是否共享全局状态？
- NodeView 是否可能拿到过期 getPos？

### Test

- Schema 单测；
- command/can/chain；
- HTML/JSON/Markdown round-trip；
- Plugin state 和 meta；
- 浏览器 E2E；
- teardown 和内存。

## 14. 推荐范例

- 简单 Mark：`packages/extension-bold/src/bold.tsx`
- Node + attrs + commands：`packages/extension-heading/src/heading.ts`
- 安全与多插件：`packages/extension-link/src/link.ts`
- Plugin State/Decoration/异步：`packages/suggestion/src/`
- 复杂结构：`packages/extension-table/src/`
- NodeView：`packages/extension-image/src/image.ts`
- 协作：`packages/extension-collaboration/src/collaboration.ts`

## 15. 面试检查点

- Extension、Node、Mark 如何选择？
- configure 与 extend 有什么不同？
- Options 和 Storage 的边界是什么？
- Priority 为什么可能引发跨功能副作用？
- 命令如何正确支持 can 和 chain？
- Input Rule、Paste Rule、Command、Plugin 如何选型？
- 为什么全局 registry 在多 Editor 场景有风险？