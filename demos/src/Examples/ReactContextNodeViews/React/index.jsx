import './styles.scss'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useState } from 'react'

import { CounterContext, ThemeContext } from './contexts.js'
import { ContainerNode, ThemedCard } from './Extension.jsx'

export default () => {
  // State living OUTSIDE the editor
  const [theme, setTheme] = useState('light')
  const [primaryColor, setPrimaryColor] = useState('#3b82f6')
  const [count, setCount] = useState(0)

  const editor = useEditor({
    extensions: [StarterKit, ContainerNode, ThemedCard],
    content: `
      <h2>React Context with Nested NodeViews Demo</h2>
      <p>
        This demo shows how React Context works with nested custom NodeViews in Tiptap.
        The state lives <strong>outside the editor</strong> and is provided via Context,
        then consumed by NodeViews <strong>inside the editor</strong>.
      </p>
      <container>
        <themed-card title="Card 1">This card uses theme context</themed-card>
        <themed-card title="Card 2">This card also uses the same theme</themed-card>
      </container>
      <p>
        Try changing the theme and colors using the controls above. Watch how the nested
        NodeViews react to the state changes!
      </p>
    `,
  })

  const themeContextValue = {
    theme,
    primaryColor,
  }

  const counterContextValue = {
    count,
    increment: () => setCount(c => c + 1),
    decrement: () => setCount(c => c - 1),
  }

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <button onClick={() => setTheme('light')} className={theme === 'light' ? 'active' : ''}>
            Light
          </button>
          <button onClick={() => setTheme('dark')} className={theme === 'dark' ? 'active' : ''}>
            Dark
          </button>
        </div>

        <div className="button-group">
          <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} />
        </div>

        <div className="button-group">
          <button onClick={counterContextValue.decrement}>-</button>
          <button onClick={counterContextValue.increment}>+</button>
          <span>Count: {count}</span>
        </div>
      </div>

      <ThemeContext.Provider value={themeContextValue}>
        <CounterContext.Provider value={counterContextValue}>
          <EditorContent editor={editor} />
        </CounterContext.Provider>
      </ThemeContext.Provider>
    </>
  )
}
