export function getComputedStyle(node: Element, property: keyof CSSStyleDeclaration): any {
  const style = window.getComputedStyle(node)

  return style[property]
}
