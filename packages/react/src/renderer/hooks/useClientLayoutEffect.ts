/** `useLayoutEffect` on the client, `useEffect` during SSR (avoids React warnings). */

import { useEffect, useLayoutEffect } from 'react'

export const useClientLayoutEffect: typeof useLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
