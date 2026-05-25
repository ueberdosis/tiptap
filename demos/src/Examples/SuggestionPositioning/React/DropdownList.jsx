import React, { useEffect, useImperativeHandle, useState } from 'react'

export default props => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = index => {
    const item = props.items[index]

    if (item) {
      props.command(item)
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(props.ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  return (
    <div className="dropdown-menu">
      {props.items.length === 0 && <div>No items found</div>}
      {props.items.map((item, index) => (
        <button
          className={index === selectedIndex ? 'is-selected' : ''}
          key={item.id}
          onMouseDown={event => event.preventDefault()}
          onClick={() => selectItem(index)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
