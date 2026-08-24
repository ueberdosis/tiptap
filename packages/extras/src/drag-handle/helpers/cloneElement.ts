function getCSSText(element: Element, properties?: string[]) {
  const style = getComputedStyle(element)

  if (properties) {
    return properties
      .map(property => property.trim())
      .filter(property => property.length > 0)
      .map(property => `${property}:${style.getPropertyValue(property)};`)
      .join('')
  }

  let value = ''

  for (let i = 0; i < style.length; i += 1) {
    value += `${style[i]}:${style.getPropertyValue(style[i])};`
  }

  return value
}

export function cloneElement(node: HTMLElement, properties?: string[]) {
  const clonedNode = node.cloneNode(true) as HTMLElement
  const sourceElements = [node, ...Array.from(node.getElementsByTagName('*'))] as HTMLElement[]
  const targetElements = [
    clonedNode,
    ...Array.from(clonedNode.getElementsByTagName('*')),
  ] as HTMLElement[]

  sourceElements.forEach((sourceElement, index) => {
    targetElements[index].style.cssText = getCSSText(sourceElement, properties)
  })

  return clonedNode
}
