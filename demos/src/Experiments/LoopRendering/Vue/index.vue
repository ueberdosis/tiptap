<template>
  <div class="container">
    <div class="item" v-for="(item, i) in items" :key="i">
      <editor :title="item.text" :content="item.content" />
      <div class="controls">
        <button @click="() => removeItem(i)">remove {{ item.text }}</button>
      </div>
    </div>
    <div>
      <button @click="addItem">add item</button>
    </div>
  </div>
</template>

<script>
import Editor from './Editor.vue'

export default {
  components: {
    Editor,
  },
  data() {
    return {
      items: [
        {
          text: 'Initial item',
          content: '<p>Hello world</p>',
        },
        {
          text: 'Second item',
          content: '<p>Hello world</p>',
        },
        {
          text: 'Third item',
          content: '<p>Hello world</p>',
        },
      ],
    }
  },
  methods: {
    addItem() {
      this.items.push({
        text: 'New item',
        content: '<p>Hello world</p>',
      })
    },
    removeItem(index) {
      this.items.splice(index, 1)
    },
  },
}
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100vw;
  padding-inline: 2rem;
  margin: auto;
  max-width: 70rem;
}

.item {
  display: grid;
  grid-template-columns: 1fr max-content;
  gap: 1rem;
}
</style>
