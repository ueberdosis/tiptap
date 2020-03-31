export default function injectCSS(css: string) {
  const style = document.createElement('style')
  style.type = 'text/css'
  style.textContent = css
  const { head } = document
  const { firstChild } = head

  if (firstChild) {
    return head.insertBefore(style, firstChild)
  } else {
    return head.appendChild(style)
  }
}
