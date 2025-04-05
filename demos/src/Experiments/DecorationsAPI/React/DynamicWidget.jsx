import { useCallback } from 'react'

export const DynamicWidget = props => {
  const { editor, pos } = props
  const onRemove = useCallback(() => {
    editor.chain().deleteRange({ from: pos.from, to: pos.to }).focus(pos.from).run()
  }, [editor, pos])

  return (
    <>
      <button onClick={onRemove}>Remove</button>
    </>
  )
}
