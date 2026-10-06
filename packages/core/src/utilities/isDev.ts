// Core has no node types and can run unbundled in the browser, where `process`
// is missing. The `typeof` check keeps that case from throwing, and the inline
// `process.env.NODE_ENV` lets bundlers fold this to `false` and strip dev-only
// warnings from production builds.
declare const process: { env: { NODE_ENV?: string } } | undefined

/**
 * Whether the editor runs in a development build. Use it to guard warnings so
 * bundlers can drop them from production output.
 */
export const isDev: boolean =
  typeof process !== 'undefined' && process.env.NODE_ENV !== 'production'
