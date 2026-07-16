# 测试、调试、性能与兼容性

## 1. 测试分层

### 单元测试

工具：Vitest + happy-dom。

位置：`packages/**/__tests__/` 或包内 `*.spec.ts`。

适合：

- Schema；
- commands、can、chain；
- Transaction steps/meta/mapping；
- Plugin State；
- input/paste rules；
- HTML/JSON/Markdown；
- Extension priority；
- teardown；
- 安全规则。

### E2E

工具：Playwright。

位置：`demos/src/**/index.spec.ts`。

适合：

- 真实 DOM Selection；
- focus/blur；
- keyboard；
- clipboard；
- drag/drop；
- NodeView；
- menus 和坐标；
- React/Vue lifecycle。

### 真机

适合：

- iOS Safari；
- Android Chrome/Gboard；
- 系统中文/日文/韩文 IME；
- 自动纠错；
- 软键盘；
- 原生 Clipboard 和拖动。

## 2. 仓库命令

```bash
pnpm lint
pnpm build
pnpm test:unit
pnpm test:e2e
pnpm fallow:audit
```

针对浏览器：

```bash
pnpm test:e2e:firefox
pnpm test:e2e:all
pnpm test:e2e:open
pnpm test:e2e:report
```

Playwright 会按配置自动启动 Demo 服务，无需额外启动。

## 3. 测试一个 Command

至少验证：

1. 适用时返回 true；
2. 不适用时返回 false；
3. `can()` 不修改 Editor；
4. chain 中能读取前一命令变更；
5. Step 和最终 doc 正确；
6. Selection/storedMarks 正确；
7. history grouping；
8. 映射后的 position 正确。

不要只断言最终 HTML，HTML 可能掩盖 Step、Selection 和 Meta 错误。

## 4. 测试 Plugin

分开验证：

- State `init/apply`；
- PluginKey 读取；
- Meta action；
- Props handler；
- filter/append transaction；
- Decoration mapping；
- Plugin View update；
- destroy 清理；
- 异步结果失效。

对 appendTransaction 要加“不重复追加”和“不无限循环”测试。

## 5. IME 测试矩阵

自动测试应覆盖：

- composing 时 input rule 不触发；
- compositionend 后只触发一次；
- menu 不闪动；
- Selection 不被自动修复破坏；
- NodeView 不因临时 mutation 重建；
- composition meta 不被通用修复逻辑误处理。

真机矩阵至少包括：

- macOS Safari + 中文/日文；
- Windows Chrome/Edge + 微软拼音；
- iPhone Safari + 中文输入；
- Android Chrome + Gboard；
- 硬件键盘与软键盘；
- Enter、Backspace、候选词确认、自动纠错。

人工 dispatch composition events 不能模拟系统候选窗和真实 DOM 时序。

## 6. Clipboard/Drop 测试矩阵

- HTML + plain text；
- plain text only；
- code block paste；
- 内部 `data-pm-slice`；
- 外部 HTML；
- 多 URL；
- files + HTML；
- same-editor move；
- copy modifier；
- cross-editor move；
- drop outside editor；
- Safari drag image；
- Firefox drop 后 caret；
- source editor 在异步清理前销毁。

## 7. 浮层测试矩阵

Unit mock：

- coordsAtPos；
- nodeDOM；
- getBoundingClientRect；
- selection types；
- view detached；
- Promise 在 hide/destroy 后返回；
- 多 PluginKey 隔离。

E2E：

- 页面滚动和容器滚动；
- CSS transform/zoom；
- portal/dialog；
- RTL；
- 跨行 Selection；
- CellSelection；
- menu mousedown 导致 editor blur；
- 快速 Selection 变化；
- resize/reposition。

## 8. 调试 Transaction

建议记录：

- `tr.steps` 及 step JSON；
- `tr.docChanged`；
- `tr.selection`；
- `tr.mapping.maps`；
- 关键 Meta；
- root 与 appended transactions；
- old/new doc equality；
- Plugin State 前后值。

调试顺序：

```text
事件是否到达 handler？
→ handler 是否返回 true？
→ command 是否产生 Step？
→ transaction 是否被 filter？
→ 是否产生 appended transaction？
→ View 是否 updateState？
→ DOM/Selection 是否被浏览器再次修改？
```

## 9. 调试 Position

遇到位置错误时输出：

- 原始 pos；
- `$pos.depth`；
- 各层 node/type/start/end；
- Step 前后 doc；
- `tr.mapping.mapResult(pos)`；
- deleted flags；
- assoc/bias；
- Selection anchor/head/from/to。

不要只打印一个数字。

## 10. 性能热点

- 每次 Transaction 让整个 React 树重渲染；
- selector 返回整个 State 或大对象；
- 大文档频繁 `getHTML()`；
- Decoration 每次全量扫描；
- 每个 NodeView 监听全局事件；
- NodeView update 无条件重渲染；
- updateMarkViewAttributes 全文遍历；
- pointermove 每次 dispatch；
- Suggestion 请求无 debounce/abort；
- Table/Collaboration 重插件无条件启用；
- destroy 遗漏导致内存累积。

## 11. 性能原则

- ProseMirror State 作为唯一真源；
- 用 changed ranges 和 Mapping 做增量更新；
- DecorationSet 先 map 再局部重建；
- React 使用 selector/equality；
- Vue 合并响应式刷新；
- 同 Node 引用跳过 NodeView 更新；
- pointermove 只做视觉更新，结束时 commit；
- 异步请求取消旧任务；
- 插件按需启用；
- 所有外部资源有 destroy。

## 12. 内存泄漏检查

高风险引用链：

```text
window listener
→ callback closure
→ plugin/nodeview/editor
→ editor.view.dom
```

```text
long-lived Y.Doc
→ listener / UndoManager
→ plugin
→ editor
```

```text
React portal registry
→ renderer
→ nodeview
→ editor
```

检查：

- 多次创建/销毁 Editor 后 listener 数量；
- DOM 是否仍挂 editor 属性；
- Timer/RAF 是否取消；
- AbortController 是否 abort；
- Provider/Y.Doc 是否仍持有插件；
- Portal/VNode 是否 unmount。

## 13. 典型测试入口

Core：

- `packages/core/__tests__/dispatchTransaction.spec.ts`
- `packages/core/__tests__/pluginOrder.spec.ts`
- `packages/core/__tests__/unmounted.spec.ts`
- `packages/core/__tests__/can.spec.ts`
- `packages/core/__tests__/transformPastedHTML.spec.ts`

复杂功能：

- `packages/extension-table/__tests__/`
- `packages/extension-drag-handle/__tests__/`
- `packages/extension-collaboration/__tests__/memoryLeak.spec.ts`
- `packages/extension-bubble-menu/__tests__/`
- `packages/extension-floating-menu/__tests__/`
- `packages/suggestion/src/__tests__/`

E2E：

- `demos/src/Examples/Menus/index.spec.ts`
- `demos/src/Examples/SuggestionPositioning/index.spec.ts`
- `demos/src/Marks/Link/index.spec.ts`
- `demos/src/Extensions/ListKeymap/index.spec.ts`

## 14. 面试检查点

- happy-dom 为什么不能证明 IME 正确？
- Command 测试为什么不能只断言最终 HTML？
- 如何测试 appendTransaction 不会死循环？
- 浮层异步定位需要哪些竞态测试？
- 如何定位 position mapping 错误？
- 富文本编辑器的常见性能热点是什么？
- 如何证明 Editor destroy 后没有泄漏？