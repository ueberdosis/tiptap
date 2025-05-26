import { useCallback,useState  } from 'react'

export const DynamicWidget = props => {
  console.log('render')
  const { editor, pos } = props
  const [count, setCount] = useState(0)
  const onRemove = useCallback(() => {
    editor.chain().deleteRange({ from: pos.from, to: pos.to }).focus(pos.from).run()
  }, [editor, pos])

  return (
    <>
      <span>Count: {count}</span>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
      <button onClick={onRemove}>Remove</button>
    </>
  )
}
