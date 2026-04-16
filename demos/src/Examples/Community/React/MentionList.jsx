import './MentionList.scss'

import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

export const MentionList = forwardRef((props, ref) => {
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

  useImperativeHandle(ref, () => ({
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

  const renderContent = () => {
    if (props.loading) {
      return <div className="item">Loading...</div>
    }
    if (props.queryTooShort) {
      return <div className="item">Keep typing (min 1 character)...</div>
    }
    if (props.items.length) {
      return props.items.map((item, index) => (
        <button className={index === selectedIndex ? 'is-selected' : ''} key={index} onClick={() => selectItem(index)}>
          {item}
        </button>
      ))
    }
    return <div className="item">No result</div>
  }

  return <div className="dropdown-menu">{renderContent()}</div>
})
