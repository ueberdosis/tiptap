import { Decoration } from '@tiptap/pm/view'

export const createDecorationWidget = (pos: number, type: string, content?: string) => {
  const createElement = () => {
    const newElement = document.createElement('span')

    newElement.classList.add('tiptap-invisible-character')
    newElement.classList.add(`tiptap-invisible-character--${type}`)

    if (content) {
      newElement.textContent = content
    }

    return newElement
  }

  return Decoration.widget(pos, createElement, {
    key: type,
    marks: [],
    side: 1000,
  })
}

export default createDecorationWidget
