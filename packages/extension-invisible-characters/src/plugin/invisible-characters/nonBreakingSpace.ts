import { InvisibleCharacter } from '../InvisibleCharacter.js'

export class NonBreakingSpaceCharacter extends InvisibleCharacter {
  constructor() {
    super({
      type: 'non-breaking-space',
      predicate: (char: string) => char === '\u00a0',
    })
  }
}

export default NonBreakingSpaceCharacter
