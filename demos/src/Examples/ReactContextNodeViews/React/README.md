# React Context with Nested NodeViews Demo

This demo showcases how React Context works seamlessly with nested custom NodeViews in Tiptap, demonstrating that state can live **outside** the editor and be consumed by NodeViews **inside** the editor.

## What This Demo Shows

### 1. **External State Management**
- Theme state (`light`/`dark`)
- Primary color selection
- Global counter

All state lives in the parent component, **outside** the Tiptap editor.

### 2. **Context Propagation Through Nested NodeViews**

The demo includes two custom NodeViews:

- **Container Node** - A parent NodeView that:
  - Contains other NodeViews (via `content: 'block+'`)
  - Consumes `ThemeContext` and `CounterContext`
  - Displays the current count in a badge
  - Styles itself based on the current theme

- **Themed Card Node** - A child NodeView (nested inside Container) that:
  - Also consumes both contexts
  - Displays and can modify the counter
  - Styles itself with the current theme and primary color
  - Shows the active theme in a badge

### 3. **Real-Time Updates**

When you interact with the controls outside the editor:
- **Theme toggle**: All NodeViews instantly switch between light/dark themes
- **Color picker**: All NodeViews update their accent colors
- **Counter buttons**: The count updates in all NodeViews simultaneously

When you interact with buttons **inside** the NodeViews:
- Counter changes propagate back up and update the external state
- All other NodeViews reflecting the same context also update

## Key Technical Points

### Why This Works

React Context propagation follows the **React component tree hierarchy**, not the DOM tree. Even though portals render NodeViews into different DOM locations, the Context flow is preserved when portals are nested correctly in the React component tree.

### Code Structure

```tsx
// State lives outside the editor
const [theme, setTheme] = useState('light')
const [count, setCount] = useState(0)

return (
  <ThemeContext.Provider value={{ theme, ... }}>
    <CounterContext.Provider value={{ count, ... }}>
      <EditorContent editor={editor} />
    </CounterContext.Provider>
  </ThemeContext.Provider>
)
```

Inside the NodeViews:

```tsx
const ContainerComponent = () => {
  // ✅ Context works in parent NodeView
  const { theme, primaryColor } = useContext(ThemeContext)
  const { count } = useContext(CounterContext)

  return (
    <NodeViewWrapper>
      <NodeViewContent /> {/* Children rendered here */}
    </NodeViewWrapper>
  )
}

const ThemedCardComponent = () => {
  // ✅ Context also works in nested child NodeView!
  const { theme, primaryColor } = useContext(ThemeContext)
  const { increment, decrement } = useContext(CounterContext)

  return <NodeViewWrapper>{/* ... */}</NodeViewWrapper>
}
```

## Real-World Use Cases

This pattern enables many powerful use cases:

### UI Library Integration
```tsx
import { ThemeProvider } from '@mui/material'
import { Button, Card } from '@mui/material'

// Wrap the editor
<ThemeProvider theme={customTheme}>
  <EditorContent editor={editor} />
</ThemeProvider>

// Use in NodeViews
const MyNode = () => {
  const theme = useTheme() // ✅ Works!
  return <NodeViewWrapper><Button>Click me</Button></NodeViewWrapper>
}
```

### State Management
```tsx
import { Provider } from 'react-redux'

<Provider store={store}>
  <EditorContent editor={editor} />
</Provider>

// Access Redux in NodeViews
const MyNode = () => {
  const user = useSelector(state => state.user) // ✅ Works!
  return <NodeViewWrapper>{user.name}</NodeViewWrapper>
}
```

### Form Context
```tsx
import { FormProvider, useFormContext } from 'react-hook-form'

<FormProvider {...methods}>
  <EditorContent editor={editor} />
</FormProvider>

// Access form context in NodeViews
const FormFieldNode = () => {
  const { register } = useFormContext() // ✅ Works!
  return <NodeViewWrapper><input {...register('field')} /></NodeViewWrapper>
}
```

### Localization
```tsx
import { I18nextProvider, useTranslation } from 'react-i18next'

<I18nextProvider i18n={i18n}>
  <EditorContent editor={editor} />
</I18nextProvider>

// Use translations in NodeViews
const MyNode = () => {
  const { t } = useTranslation() // ✅ Works!
  return <NodeViewWrapper>{t('welcome')}</NodeViewWrapper>
}
```

## Architecture

This demo was created to showcase the fix for [GitHub Issue #6547](https://github.com/ueberdosis/tiptap/issues/6547), which resolved React Context propagation in nested NodeViews by implementing hierarchical portal rendering.

**Before the fix**: Context didn't work because all NodeView portals were rendered as flat siblings in the React component tree.

**After the fix**: Context works correctly because child NodeView portals are rendered as React children of their parent NodeView portals, maintaining the proper component hierarchy.

## Try It Out

1. **Change the theme** - Watch all NodeViews update instantly
2. **Pick a color** - See the accent color change throughout
3. **Increment/decrement** - Use buttons inside or outside NodeViews
4. **Edit the content** - The rich text editor still works normally

## Files

- `index.jsx` - Main demo component with Context providers and controls
- `Extension.js` - Custom NodeView extensions (Container and ThemedCard)
- `styles.scss` - Styling for the demo and NodeViews
- `index.spec.js` - Cypress tests for the demo

## Learn More

- [React Context Documentation](https://react.dev/reference/react/createContext)
- [Tiptap NodeViews Guide](https://tiptap.dev/guide/node-views)
- [React Portals](https://react.dev/reference/react-dom/createPortal)
