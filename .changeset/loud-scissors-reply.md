---
'@tiptap/react': minor
---

Fixed BubbleMenu and FloatingMenu components to properly apply style, className, and other HTML attributes directly to the actual menu element. This resolves issue #6551 where developers needed ref + useEffect workarounds to style these components.

Users can now directly apply props without workarounds:
```jsx
<BubbleMenu style={{zIndex: 9999}} className="my-menu" data-testid="menu" />
```
