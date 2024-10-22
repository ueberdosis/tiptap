<script setup lang="ts">

import { ref } from 'vue'

import ParentComponent from './ParentComponent.vue'

const showEditor = ref(false)

</script>

<template>
  <div>
    <button
      type="button"
      @click="showEditor = !showEditor"
      style="margin-bottom: 1rem;"
      id="toggle-editor"
    >
      {{ showEditor ? 'Hide editor' : 'Show editor' }}
    </button>

    <transition name="fade">
      <div v-if="showEditor" class="tiptap-wrapper">
        <ParentComponent />
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.tiptap-wrapper {
  background-color: var(--purple-light);
  border: 2px solid var(--purple);
  border-radius: 0.5rem;
  margin: 1rem 0;
}
</style>
