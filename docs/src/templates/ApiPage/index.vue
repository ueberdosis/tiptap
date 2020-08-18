<template>
  <Layout>
    <div>
      <div v-for="(file, i) in this.package.children" :key="i">
        <h2>
          {{ file.name }}
        </h2>
        <div v-for="(bla, j) in file.children" :key="j">
          <template v-if="['Class', 'Method', 'Module'].includes(bla.kindString)">
            <h3>
              {{ bla.name }}
            </h3>
          </template>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script>
export default {
  // props: {
  //   package: {
  //     default: null,
  //     type: Object
  //   }
  // },

  computed: {
    package() {
      console.log(this.$context.package)
      return this.$context.package
    },
  },
}
</script>

<style lang="scss" src="./style.scss" scoped></style>