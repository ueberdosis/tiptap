import type { VueConstructor } from 'vue'
import VueDefault from 'vue'

// With nodenext module resolution, TypeScript treats the default import as the module type.
// We need to explicitly type it as VueConstructor to access static methods like extend and observable.
// This is necessary because Vue 2's type definitions export Vue as VueConstructor, but nodenext
// doesn't correctly infer the default export type.
export const Vue: VueConstructor = VueDefault as unknown as VueConstructor
