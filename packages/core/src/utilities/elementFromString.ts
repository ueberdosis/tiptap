import type { BrowserEnvironmentManager } from '../BrowserEnvironment.js'

const removeWhitespaces = (node: HTMLElement) => {
  const children = node.childNodes

  for (let i = children.length - 1; i >= 0; i -= 1) {
    const child = children[i]

    if (child.nodeType === 3 && child.nodeValue && /^(\n\s\s|\n)$/.test(child.nodeValue)) {
      node.removeChild(child)
    } else if (child.nodeType === 1) {
      removeWhitespaces(child as HTMLElement)
    }
  }

  return node
}

export function elementFromString(value: string, browserEnv?: BrowserEnvironmentManager): HTMLElement {
  const DOMParserClass = browserEnv?.DOMParser ?? (typeof window !== 'undefined' ? window.DOMParser : undefined)

  if (!DOMParserClass) {
    throw new Error(
      '[tiptap error]: No DOMParser available. For server-side usage, provide a DOMParser implementation via the environment option.',
    )
  }

  // add a wrapper to preserve leading and trailing whitespace
  const wrappedValue = `<body>${value}</body>`

  const html = new DOMParserClass().parseFromString(wrappedValue, 'text/html').body

  return removeWhitespaces(html)
}
