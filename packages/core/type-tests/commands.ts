import { type Command, type CommandsOf, Editor, Extension, Mark, Node } from '../src/index.js'

const InferredCommands = Extension.create({
  name: 'inferredCommands',

  addCommands() {
    return {
      setInferredValue:
        (value: string, repeat: number = 1) =>
        () => {
          return value.length >= repeat
        },
    }
  },
})

const inferredEditor = new Editor({
  extensions: [InferredCommands],
})

inferredEditor.commands.setInferredValue('value')
inferredEditor.commands.setInferredValue('value', 2)
inferredEditor.chain().setInferredValue('value', 2).run()
inferredEditor.can().setInferredValue('value')

const inferredExtensions = [InferredCommands]
const inferredArrayEditor = new Editor({
  extensions: inferredExtensions,
})

inferredArrayEditor.commands.setInferredValue('value')

// @ts-expect-error The inferred command requires a string value.
inferredEditor.commands.setInferredValue(1)

// @ts-expect-error The inferred command accepts a numeric repeat count.
inferredEditor.commands.setInferredValue('value', '2')

const InferredNode = Node.create({
  name: 'inferredNode',

  group: 'block',

  addCommands() {
    return {
      setInferredNode: (id: string) => () => {
        return id.length > 0
      },
    }
  },
})

const InferredMark = Mark.create({
  name: 'inferredMark',

  addCommands() {
    return {
      setInferredMark: (id: number) => () => {
        return id > 0
      },
    }
  },
})

const nodeAndMarkEditor = new Editor({
  extensions: [InferredNode, InferredMark],
})

nodeAndMarkEditor.commands.setInferredNode('node')
nodeAndMarkEditor.commands.setInferredMark(1)

// @ts-expect-error The inferred node command requires a string value.
nodeAndMarkEditor.commands.setInferredNode(1)

// @ts-expect-error The inferred mark command requires a numeric value.
nodeAndMarkEditor.commands.setInferredMark('mark')

interface ExplicitCommands {
  setExplicitValue: (value: number) => Command
  setOverloadedValue: {
    (value: string): Command
    (value: number, repeat: number): Command
  }
}

const ExplicitCommands = Extension.create<{}, {}, ExplicitCommands>({
  name: 'explicitCommands',

  addCommands() {
    return {
      setExplicitValue: value => () => {
        return value > 0
      },
      setOverloadedValue: (value: string | number, repeat?: number) => () => {
        return typeof value === 'string' || !!repeat
      },
    }
  },
})

const explicitEditor = new Editor({
  extensions: [ExplicitCommands],
})

explicitEditor.commands.setExplicitValue(1)
explicitEditor.commands.setOverloadedValue('value')
explicitEditor.commands.setOverloadedValue(1, 2)

// @ts-expect-error The explicit command requires a numeric value.
explicitEditor.commands.setExplicitValue('1')

// @ts-expect-error The numeric overload requires a repeat count.
explicitEditor.commands.setOverloadedValue(1)

const configuredEditor = new Editor({
  extensions: [InferredCommands.configure()],
})

configuredEditor.commands.setInferredValue('value')

const FactoryCommands = Extension.create(() => ({
  name: 'factoryCommands',

  addCommands() {
    return {
      setFactoryValue: (value: string) => () => {
        return value.length > 0
      },
    }
  },
}))

const factoryEditor = new Editor({
  extensions: [FactoryCommands],
})

factoryEditor.commands.setFactoryValue('value')

const ExtendedCommands = InferredCommands.extend({
  addCommands() {
    return {
      clearInferredValue: () => () => {
        return true
      },
    }
  },
})

const extendedEditor = new Editor({
  extensions: [ExtendedCommands],
})

extendedEditor.commands.setInferredValue('value')
extendedEditor.commands.clearInferredValue()

const CommandKit = Extension.create<{}, {}, CommandsOf<typeof InferredCommands>>({
  name: 'commandKit',

  addExtensions() {
    return [InferredCommands]
  },
})

const kitEditor = new Editor({
  extensions: [CommandKit],
})

kitEditor.commands.setInferredValue('value')
