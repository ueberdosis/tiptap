import React from 'react'

export const SelectionIndicatorWidget = ({ selectedText, selectionLength }) => {
  let display = 'Cursor'

  if (selectionLength > 0) {
    display = `${selectionLength} chars selected`
  } else if (selectedText) {
    display = `Word: "${selectedText}"`
  }

  return (
    <div className="selection-indicator" contentEditable={false}>
      <span className="selection-indicator__badge">{display}</span>
    </div>
  )
}

export default SelectionIndicatorWidget
