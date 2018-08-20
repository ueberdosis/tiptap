import 'babel-polyfill'
import Vue from 'vue'
import svgSpriteLoader from 'helpers/svg-sprite-loader'
import App from './App.vue'

const __svg__ = { path: './assets/images/icons/*.svg', name: 'assets/images/[hash].sprite.svg' }
svgSpriteLoader(__svg__.filename)

Vue.config.productionTip = false

Vue.mixin({
	methods: {
		modifierClasses(base, modifier = this.modifier) {
			const classList = [modifier].flatten()

			if (classList.length === 0) {
				return null
			}

			return `${base}--${classList.join(` ${base}--`)}`
    },
  },
})

new Vue({
  render: h => h(App),
}).$mount('#app')
