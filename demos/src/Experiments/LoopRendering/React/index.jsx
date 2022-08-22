import './styles.scss'

import React from 'react'

import Editor from './Editor'

export default () => {
  const [items, setItems] = React.useState([
    {
      text: 'Initial item',
      content: '<p>Hello world</p>',
    },
    {
      text: 'Second item',
      content: '<p>Hello world</p>',
    },
    {
      text: 'Third item',
      content: '<p>Hello world</p>',
    },
  ])

  const removeItem = index => {
    setItems(items.filter((_, i) => i !== index))
  }

  const addItem = () => {
    setItems([...items, { text: 'New item', content: '<p>Hello world</p>' }])
  }

  return (
    <div className="container">
      {items.map((item, index) => (
        <div className="item" key={index}>
          <Editor title={item.text} content={item.content} />
          <div className="controls">
            <button onClick={() => removeItem(index)}>remove { item.text }</button>
          </div>
        </div>
      ))}
      <div>
        <button onClick={addItem}>add item</button>
      </div>
    </div>
  )
}
