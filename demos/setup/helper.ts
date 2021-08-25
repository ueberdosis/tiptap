const waitUntilElementExists = (selector: any, callback: (element: Element) => void) => {
  const element = document.querySelector(selector)

  if (element) {
    return callback(element)
  }

  setTimeout(() => waitUntilElementExists(selector, callback), 500)
}

const sendData = (eventName: string, data: any) => {
  const event = new CustomEvent(eventName, { detail: data })

  window.parent.document.dispatchEvent(event)
}

export function splitName(name: string) {
  const parts = name.split('/')

  if (parts.length !== 2) {
    throw Error('Demos must always be within exactly one category. Nested categories are not supported.')
  }

  return parts
}

export function debug() {
  sendData('editor', null)
  // @ts-ignore
  sendData('source', window.source)

  waitUntilElementExists('.ProseMirror', element => {
    // @ts-ignore
    const editor = element.editor

    sendData('editor', editor)
  })
}
