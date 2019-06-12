export default function (css) {
  const style = document.createElement('style')
  style.type = 'text/css'
  style.textContent = css
  const { head } = document
  const { firstChild } = head

  if (firstChild) {
    head.insertBefore(style, firstChild)
  } else {
    head.appendChild(style)
  }
}
