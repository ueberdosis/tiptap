export function elementFromString(value: string): HTMLElement {
  if (typeof window === 'undefined') {
    throw new Error('[tiptap error]: there is no window object available, so this function cannot be used')
  }
  // add a wrapper to preserve leading and trailing whitespace
  const wrappedValue = `<body>${value}</body>`

  return new window.DOMParser().parseFromString(wrappedValue, 'text/html').body
}
