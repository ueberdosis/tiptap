declare module '*.svelte' {
  import { type Component } from 'svelte'

  const component: Component

  // @ts-expect-error — for .svelte.ts runes modules, which export the component as default
  export default component
}
