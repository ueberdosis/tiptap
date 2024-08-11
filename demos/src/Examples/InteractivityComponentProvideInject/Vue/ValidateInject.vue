<template>
  <div class="validate-inject">
    <p>{{ globalValue }}</p>
    <p>{{ appValue }}  </p>
    <p>{{ indexValue }}</p>
    <p>{{ editorValue }}</p>
  </div>
</template>

<script>
export default {
  inject: ['appValue', 'indexValue', 'editorValue'],
}
</script>

<style lang="scss">
.validate-inject {
  margin-top: 2rem;
}
</style>
