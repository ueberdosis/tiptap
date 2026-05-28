import { writable } from 'svelte/store'

export const appContext = writable({
  value: 'this is the default value which should not show up',
})
