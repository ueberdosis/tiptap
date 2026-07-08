import type { RefObject } from 'react'
import { useLayoutEffect } from 'react'

import type { ViewDesc } from '../viewdesc.js'

/**
 * Clears a desc's DOM registration when its component unmounts, unless the
 * DOM was already claimed by a newer desc.
 */
export const useDescCleanup = (descRef: RefObject<ViewDesc | undefined>): void => {
  useLayoutEffect(
    () => () => {
      const desc = descRef.current

      if (desc && desc.dom.pmViewDesc === desc) {
        desc.dom.pmViewDesc = undefined
      }
    },
    [descRef],
  )
}
