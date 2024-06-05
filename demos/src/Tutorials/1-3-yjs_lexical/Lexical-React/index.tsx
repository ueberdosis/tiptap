import './styles.css'

import React from 'react'

import Note from './Note.jsx'
import { TNote } from './types.js'

const notes: TNote[] = [
  {
    id: 'note-1',
    defaultContent: 'some random note text',
  },
  {
    id: 'note-2',
    defaultContent: 'some really random note text',
  },
]

export default () => {
  return (
    <>
      {notes.map(note => <Note note={note} key={note.id}/>)}
    </>
  )
}
