import React, { useState } from 'react'

import { TNote } from './types.js'

export default ({ note }: { note: TNote }) => {
  const [modelValue, setModelValue] = useState(note.content)

  return (
    <textarea onChange={e => setModelValue(e.target.value)} value={modelValue}></textarea>
  )
}
