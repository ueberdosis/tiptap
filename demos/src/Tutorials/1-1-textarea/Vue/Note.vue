<script setup lang="ts">

import { ref, watch } from 'vue'

import { TNote } from './types.js'

const props = defineProps<{ note: TNote }>()

const modelValueProxy = ref('')

watch(props, () => modelValueProxy.value = props.note?.content, {
  immediate: true,
})

</script>

<template>
  <textarea v-model="modelValueProxy" />
</template>
