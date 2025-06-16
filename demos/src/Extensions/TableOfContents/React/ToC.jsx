import { TextSelection } from '@tiptap/pm/state'

export const ToCItem = ({ item, onItemClick }) => {
  return (
    <div className={`${item.isActive && !item.isScrolledOver ? 'is-active' : ''} ${item.isScrolledOver ? 'is-scrolled-over' : ''}`} style={{
      '--level': item.level,
    }}>
      <a href={`#${item.id}`} onClick={e => onItemClick(e, item.id)} data-item-index={item.itemIndex}>{item.textContent}</a>
    </div>
  )
}

export const ToCEmptyState = () => {
  return (
    <div className="empty-state">
      <p>Start editing your document to see the outline.</p>
    </div>
  )
}

export const ToC = ({
  items = [],
  editor,
}) => {
  if (items.length === 0) {
    return <ToCEmptyState />
  }

  const onItemClick = (e, id) => {
    e.preventDefault()

    if (editor) {
      const element = editor.view.dom.querySelector(`[data-toc-id="${id}"`)
      const pos = editor.view.posAtDOM(element, 0)

      // set focus
      const tr = editor.view.state.tr

      tr.setSelection(new TextSelection(tr.doc.resolve(pos)))

      editor.view.dispatch(tr)

      editor.view.focus()

      if (history.pushState) { // eslint-disable-line
        history.pushState(null, null, `#${id}`) // eslint-disable-line
      }

      window.scrollTo({
        top: element.getBoundingClientRect().top + window.scrollY,
        behavior: 'smooth',
      })
    }
  }

  return (
    <>
      {items.map((item, i) => (
        <ToCItem onItemClick={onItemClick} key={item.id} item={item} index={i + 1} />
      ))}
    </>
  )
}
