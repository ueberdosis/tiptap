function getCSSText(element: Element) {
  let value = ''
  const style = getComputedStyle(element)

  for (let i = 0; i < style.length; i += 1) {
    value += `${style[i]}:${style.getPropertyValue(style[i])};`
  }

  return value
}

export function cloneElement(node: HTMLElement) {
  const clonedNode = node.cloneNode(true) as HTMLElement
  const sourceElements = [node, ...Array.from(node.getElementsByTagName('*'))] as HTMLElement[]
  const targetElements = [clonedNode, ...Array.from(clonedNode.getElementsByTagName('*'))] as HTMLElement[]

  sourceElements.forEach((sourceElement, index) => {
    targetElements[index].style.cssText = getCSSText(sourceElement)
  })

  return clonedNode
}
