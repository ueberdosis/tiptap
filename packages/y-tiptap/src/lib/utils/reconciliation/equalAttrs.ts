import { isObject } from './isObject.js'

export const equalAttrs = (pattrs: Record<string, unknown>, yattrs: Record<string, unknown>) => {
  const keys = Object.keys(pattrs).filter(key => pattrs[key] !== null)
  let eq = keys.length === Object.keys(yattrs).filter(key => yattrs[key] !== null).length
  for (let i = 0; i < keys.length && eq; i++) {
    const key = keys[i]
    const l = pattrs[key]
    const r = yattrs[key]
    eq = key === 'ychange' || l === r || (isObject(l) && isObject(r) && equalAttrs(l, r))
  }
  return eq
}
