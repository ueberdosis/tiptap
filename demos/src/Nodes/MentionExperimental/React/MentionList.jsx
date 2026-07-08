import './MentionList.scss'

import React, { useEffect, useImperativeHandle, useState } from 'react'

export default props => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = index => {
    const item = props.items[index]

    if (item) {
      props.command({ id: item })
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

  let content

  if (props.loading) {
    content = (
      <div className="item loading">
        <span className="loading-dot" />
        Loading…
      </div>
    )
  } else if (props.items.length) {
    content = props.items.map((item, index) => (
      <button
        className={index === selectedIndex ? 'is-selected' : ''}
        key={index}
        onClick={() => selectItem(index)}
      >
        {item}
      </button>
    ))
  } else {
    content = <div className="item">No result</div>
  }

  return <div className="dropdown-menu">{content}</div>
}
