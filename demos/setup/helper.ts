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

  if (parts.length !== 3) {
    throw Error(
      'Demos must always be within exactly one category. Nested categories are not supported.',
    )
  }

  return parts
}

export function debug() {
  sendData('editor', null)
  // @ts-ignore
  sendData('source', window.source)

  waitUntilElementExists('.tiptap', element => {
    // @ts-ignore
    const editor = element.editor

    sendData('editor', editor)
  })
}

/** Shows a demo light or dark: `?theme=dark` on its address, or a message from the page around it. */
export function applyTheme(doc: Document | null | undefined, theme: unknown, editor?: any) {
  // A frame that is still loading has no document element yet; it reads `?theme` itself
  const root = doc?.documentElement

  if (!root || (theme !== 'light' && theme !== 'dark')) {
    return
  }

  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
  editor?.storage?.diagrams?.refresh?.()
}
