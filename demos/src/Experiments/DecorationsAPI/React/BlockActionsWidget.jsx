export const BlockActionsWidget = ({ editor, pos, getPos }) => {
  const handleDuplicate = e => {
    e.preventDefault()
    e.stopPropagation()

    try {
      // Use getPos() to get the current position instead of stale pos
      const currentPos = typeof getPos === 'function' ? getPos() : pos
      if (currentPos === undefined) {
        return
      }

      const node = editor.state.doc.nodeAt(currentPos)
      if (node) {
        const { tr } = editor.state
        tr.insert(currentPos + node.nodeSize, node)
        editor.view.dispatch(tr)
        editor.view.focus()
      }
    } catch (error) {
      console.error('Error duplicating block:', error)
    }
  }

  const handleDelete = e => {
    e.preventDefault()
    e.stopPropagation()

    try {
      // Use getPos() to get the current position instead of stale pos
      const currentPos = typeof getPos === 'function' ? getPos() : pos
      if (currentPos === undefined) {
        return
      }

      const node = editor.state.doc.nodeAt(currentPos)
      if (node) {
        const { tr } = editor.state
        tr.delete(currentPos, currentPos + node.nodeSize)
        editor.view.dispatch(tr)
        editor.view.focus()
      }
    } catch (error) {
      console.error('Error deleting block:', error)
    }
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        gap: '4px',
        marginLeft: '8px',
        verticalAlign: 'middle',
        opacity: 0.6,
        pointerEvents: 'auto',
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
    >
      <button
        onMouseDown={handleDuplicate}
        title="Duplicate this block"
        style={{
          padding: '4px 8px',
          fontSize: '12px',
          backgroundColor: '#f0f0f0',
          border: '1px solid #ddd',
          borderRadius: '3px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          pointerEvents: 'auto',
        }}
        onMouseEnter={e => {
          e.target.style.backgroundColor = '#e0e0e0'
        }}
        onMouseLeave={e => {
          e.target.style.backgroundColor = '#f0f0f0'
        }}
      >
        📋 Duplicate
      </button>
      <button
        onMouseDown={handleDelete}
        title="Delete this block"
        style={{
          padding: '4px 8px',
          fontSize: '12px',
          backgroundColor: '#ffe6e6',
          border: '1px solid #ffcccc',
          borderRadius: '3px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          pointerEvents: 'auto',
        }}
        onMouseEnter={e => {
          e.target.style.backgroundColor = '#ffcccc'
        }}
        onMouseLeave={e => {
          e.target.style.backgroundColor = '#ffe6e6'
        }}
      >
        🗑️ Delete
      </button>
    </div>
  )
}
