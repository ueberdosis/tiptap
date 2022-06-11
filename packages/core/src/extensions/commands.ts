import * as commands from '../commands'
import { Extension } from '../Extension'

export * from '../commands'

export const Commands = Extension.create({
  name: 'commands',

  addCommands() {
    return {
      ...commands,
    }
  },
})
