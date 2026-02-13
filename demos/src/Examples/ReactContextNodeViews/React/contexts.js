import { createContext } from 'react'

// Create a theme context
export const ThemeContext = createContext({
  theme: 'light',
  primaryColor: '#3b82f6',
})

// Create a counter context
export const CounterContext = createContext({
  count: 0,
  increment: () => {},
  decrement: () => {},
})
