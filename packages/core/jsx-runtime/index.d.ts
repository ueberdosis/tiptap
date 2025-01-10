export type * from '../dist/jsx-runtime/jsx-runtime.d.ts'

declare global {
  namespace JSX {
    // @ts-ignore - conflict with React typings
    type Element = [string, ...any[]]
    // @ts-ignore - conflict with React typings
    interface IntrinsicElements {
      // @ts-ignore - conflict with React typings
      [key: string]: any
    }
  }
}
