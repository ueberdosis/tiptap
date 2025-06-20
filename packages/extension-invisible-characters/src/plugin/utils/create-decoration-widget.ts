import { Decoration } from '@tiptap/pm/view'

export const createDecorationWidget = (pos: number, type: string, content?: string) => {
  const createElement = () => {
    const newElement = document.createElement('span')

    newElement.classList.add('Tiptap-invisible-character')
    newElement.classList.add(`Tiptap-invisible-character--${type}`)

    if (content) {
      newElement.textContent = content
    }

    return newElement
  }

  // return Decoration.inline(pos - 1, pos, {
  //   class: `Tiptap-invisible-character Tiptap-invisible-character--${type}`,
  // })

  return Decoration.widget(pos, createElement, {
    key: type,
    marks: [],
    side: 1000,
  })
}

export default createDecorationWidget
