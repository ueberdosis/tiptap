import '@babel/polyfill'
import Vue from 'vue'
import VueRouter from 'vue-router'
import svgSpriteLoader from 'helpers/svg-sprite-loader'
import App from 'Components/App'
import RouteDefault from 'Components/Routes/Default'
import RouteMenuBubble from 'Components/Routes/MenuBubble'
import RouteLinks from 'Components/Routes/Links'

const __svg__ = { path: './assets/images/icons/*.svg', name: 'assets/images/[hash].sprite.svg' }
svgSpriteLoader(__svg__.filename)

Vue.config.productionTip = false

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: RouteDefault,
  },
  {
    path: '/menu-bubble',
    component: RouteMenuBubble,
  },
  {
    path: '/links',
    component: RouteLinks,
  },
]

const router = new VueRouter({
  routes,
  linkActiveClass: 'is-active',
  linkExactActiveClass: 'is-exact-active',
})

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
