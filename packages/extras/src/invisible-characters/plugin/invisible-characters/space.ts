import { InvisibleCharacter } from '../InvisibleCharacter.js'

export class SpaceCharacter extends InvisibleCharacter {
  constructor() {
    super({
      type: 'space',
      predicate: (char: string) => char === ' ',
    })
  }
}

export default SpaceCharacter
