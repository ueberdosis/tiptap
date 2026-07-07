/**
 * Browser flags used by the selection kludges in `viewdesc.ts`. Derived from
 * prosemirror-view 1.41.9's `src/browser.ts` (MIT) so the derived selection
 * code behaves identically to its origin.
 */
const agent = typeof navigator !== 'undefined' ? navigator.userAgent : ''
const vendor = typeof navigator !== 'undefined' ? navigator.vendor : ''

const ie = /Edge\/(\d+)/.test(agent) || /MSIE \d/.test(agent) || /Trident\//.test(agent)

export const gecko = !ie && /gecko\/(\d+)/i.test(agent)
export const safari = !ie && /Apple Computer/.test(vendor)
