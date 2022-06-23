import { DecoratorCharacter } from '../DecoratorCharacter'

export class SpaceDecorator extends DecoratorCharacter {
  constructor() {
    super({
      type: 'space',
      predicate: (char: string) => char === ' ',
    })
  }
}
