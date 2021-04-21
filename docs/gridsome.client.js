export default function (Vue, options, context) {

  Vue.mixin({
    data() {
      return {
        cwd: options.cwd,
      }
    },
  })

  context.router.afterEach(to => {
    if (to.hash) {
      setTimeout(() => {
        const element = document.getElementById(to.hash.substr(1))
        const top = element.offsetTop
        const offset = parseFloat(
          getComputedStyle(element).scrollMarginTop
          || getComputedStyle(element).scrollSnapMarginTop,
        )

        window.scrollTo(0, top - offset)
      }, 0)
    }
  })

}
