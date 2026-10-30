import { InvisibleCharacter } from '../InvisibleCharacter.js'

export class TabCharacter extends InvisibleCharacter {
  constructor() {
    super({
      type: 'tab',
      predicate: (char: string) => char === '\t',
    })
  }
}

export default TabCharacter
