import 'iframe-resizer/js/iframeResizer.contentWindow'
import './style.css'

import { demos } from '@demos'
import iframeResize from 'iframe-resizer/js/iframeResizer'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import Demo from './Demo.vue'
import App from './index.vue'

const routes = demos
  .map(({ name, tabs }) => {
    return {
      path: `/${name}`,
      component: Demo,
      props: {
        name,
        tabs,
      },
    }
  })

const router = createRouter({
  history: createWebHistory('preview'),
  routes,
})

createApp(App)
  .directive('resize', {
    beforeMount: (el, { value = {} }) => {
      el.addEventListener('load', () => {
        iframeResize({
          ...value,
          // messageCallback(messageData) {
          //   if (messageData.message.type !== 'resize') {
          //     return
          //   }

          //   const style = window.getComputedStyle(el.parentElement)
          //   const maxHeight = parseInt(style.getPropertyValue('max-height'), 10)

          //   if (messageData.message.height > maxHeight) {
          //     el.setAttribute('scrolling', 'auto')
          //   } else {
          //     el.setAttribute('scrolling', 'no')
          //   }

          //   el?.iFrameResizer?.resize?.()
          // },
        }, el)
      })
    },
    unmounted(el) {
      el?.iFrameResizer?.removeListeners?.()
    },
  })
  .use(router)
  .mount('#app')
