import iframeResize from 'iframe-resizer/js/iframeResizer'

if (typeof window === 'object' && !window.process) {
  class TiptapDemo extends HTMLElement {
    url = 'https://embed.tiptap.dev'

    connectedCallback() {
      const wrapper = document.createElement('div')
      const iframe = document.createElement('iframe')
      const shadow = this.attachShadow({ mode: 'open' })
      const name = this.getAttribute('name')
      const inline = this.getAttribute('inline') === ''
      const hideSource = this.getAttribute('hideSource') === ''

      iframe.src = `${this.url}/preview/${name}?inline=${inline}&hideSource=${hideSource}`
      iframe.width = '100%'
      iframe.height = '0'
      iframe.frameBorder = '0'

      shadow.appendChild(wrapper)

      iframe.addEventListener('load', () => {
        iframeResize({}, iframe)
      }, { once: true })

      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          observer.unobserve(wrapper)
          wrapper.appendChild(iframe)
        }
      })

      observer.observe(wrapper)
    }
  }

  window.customElements.define('tiptap-demo', TiptapDemo)
}
