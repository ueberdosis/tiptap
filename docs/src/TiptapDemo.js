import iframeResize from 'iframe-resizer/js/iframeResizer'

if (typeof window === 'object' && !window.process) {
  class TiptapDemo extends HTMLElement {
    url = 'https://embed.tiptap.dev'

    connectedCallback() {
      const wrapper = document.createElement('div')
      const iframe = document.createElement('iframe')
      const shadow = this.attachShadow({ mode: 'closed' })
      const name = this.getAttribute('name')
      const inline = this.getAttribute('inline') === ''
      const hideSource = this.getAttribute('hideSource') === ''

      iframe.src = `${this.url}/preview/${name}?inline=${inline}&hideSource=${hideSource}`
      iframe.width = '100%'
      iframe.height = '0'
      iframe.frameBorder = '0'

      wrapper.innerHTML = `
        <style>
          div {
            position: relative;
            background: #00000008;
            min-height: 5rem;
            border-radius: 0.75rem;
            transition: all 0.2s ease;
          }

          div.has-loaded {
            background: transparent;
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          svg {
            position: absolute;
            top: 50%;
            left: 50%;
            margin-top: -0.625rem;
            margin-left: -0.625rem;
            pointer-events: none;
            width: 1.25rem;
            height: 1.25rem;
            animation: spin 1s linear infinite;
            transition: all 0.2s ease;
          }

          div.has-loaded svg {
            opacity: 0;
          }

          circle {
            opacity: 0.25;
          }

          path {
            opacity: 0.75;
          }
        </style>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      `

      shadow.appendChild(wrapper)

      iframe.addEventListener('load', () => {
        iframeResize({}, iframe)
        wrapper.classList.add('has-loaded')
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
