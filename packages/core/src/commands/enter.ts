import { Command } from '../types'

/**
 * Press Enter
 */
export const enter = (): Command => ({
  editor,
  view,
  tr,
  dispatch,
}) => {
  const keyCode = 13
  const key = 'Enter'
  const event = document.createEvent('Event')
  event.initEvent('keydown', true, true)
  // @ts-ignore
  event.keyCode = keyCode
  // @ts-ignore
  event.key = key
  // @ts-ignore
  event.code = key

  const capturedTransaction = editor.captureTransaction(() => {
    view.someProp('handleKeyDown', f => f(view, event))
  })

  capturedTransaction?.steps.forEach(step => {
    const newStep = step.map(tr.mapping)

    if (newStep && dispatch) {
      tr.step(newStep)
    }
  })

  return true
}
