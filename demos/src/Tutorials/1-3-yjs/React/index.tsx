import './styles.scss'

import React from 'react'

import Note from './Note.jsx'
import { TNote } from './types.js'

const notes: TNote[] = [
  {
    id: 'note-1',
    defaultContent: 'Some random note text',
  },
  {
    id: 'note-2',
    defaultContent: 'Some really random note text',
  },
]

export default () => {
  return (
    <>
      {notes.map(note => <Note note={note} key={note.id}/>)}
    </>
  )
}
