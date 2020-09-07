import { NodeSpec } from "prosemirror-model";
import deepmerge from 'deepmerge'
import collect from 'collect.js'
import { Editor, CommandSpec } from '@tiptap/core'
import cloneDeep from 'clone-deep'

// type RecursivePartial<T> = {
//   [P in keyof T]?:
//     T[P] extends (infer U)[] ? RecursivePartial<U>[] :
//     T[P] extends object ? RecursivePartial<T[P]> :
//     T[P];
// }

// type Extension<Options = any> = {
//   name: string
//   defaultOptions?: Options | (() => Options)
//   bla?: number[] | ((this: ExtensionOptions<Options>) => number[])
//   blub?: number[] | (() => number[])
//   schema?: () => NodeSpec
// }

// type ExtensionOptions<T> = {
//   options: T
// }

// function Extension<Options>(config: Extension<Options>) {
//   const instance = (options: Options) => {
//     const extensionInstance = {
//       ...config,
//       options,
//     }

//     if (typeof extensionInstance.name === 'function') {
//       // @ts-ignore
//       extensionInstance.name()
//     }

//     return extensionInstance
//   }

//   instance.extend = (extendConfig: RecursivePartial<Extension>) => {
//     return Extension<Options>(deepmerge({...config}, {...extendConfig}) as Extension)
//   }

//   return instance
// }

// type HeadingOptions = {
//   levels?: number[]
// }

// const Heading = Extension<HeadingOptions>({
//   name: 'heading',
//   defaultOptions: {
//     levels: [1, 2, 3, 4, 5, 6],
//   },
//   schema() {
//     return {
//       defining: true
//     }
//   }
// })

// // Heading
// const h = Heading.extend({
//   name: '123',
// })({
//   levels: [1, 2]
// })

// console.log({h})











// const bla = Extension(options => {
//   name: 'heading',
//   bla: () => {
//     return [1, 2]
//   },
// })

// const Heading1 = Heading.extend({
//   name: 'heading 1'
// })

// console.log(Heading(1), Heading1(2))




// interface ExtenstionClass<T> {
//   new (options?: T): ExtenstionClass<T>
//   name?: string
//   bla?: number[] | (() => number[])
// }

// // class ExtenstionClass implements ExtenstionClass {
// class ExtenstionClass<T> {
//   // name: '124'

//   // bla() {
//   //   return [1, 2]
//   // }
// }

// class Whatever extends ExtenstionClass<HeadingOptions> {
//   name: '1243'
// }

// new Whatever({
//   bla: 124,
// })





// interface ExxxtensionConstructor<T> {
//   new (options: Partial<T>): any
// }

// interface Exxxtension {
//   name: string
// }

// const Exxxtension: ExxxtensionConstructor<HeadingOptions> = class Exxxtension implements Exxxtension {
//   name = '1'
// };

// new Exxxtension({
//   levels: [1, 2],
//   // test: 'bla',
// })




// interface ExxxtensionConstructor<T> {
//   new (options: Partial<T>): any
// }

// interface Exxxtension {
//   name: string
// }

// interface NodeExtension extends Exxxtension {
//   schema(): NodeSpec
//   what: number
// }

// class Exxxtension implements Exxxtension {
//   // public topNode = false
// }

// class NodeExtension implements NodeExtension {
//   // public topNode = false
// }

// const HeadingNode: ExxxtensionConstructor<HeadingOptions> = class HeadingNode extends NodeExtension implements NodeExtension {
//   name = 'heading'

//   // what = 's'

//   schema() {
//     return {
//       defining: true
//     }
//   }
// }

// new HeadingNode({
//   levels: [1, 2],
//   // test: 'bla',
// })




// interface ExtenstionClass {
//   // new (options?: T): ExtenstionClass<T>
//   name?: string
//   schema?: () => NodeSpec
// }










// type ExtensionConfig<Options = any> = {
//   name: string
//   defaultOptions: Options
// }

// type NodeConfig<Options = any> = ExtensionConfig<Options> & {
//   schema?: () => NodeSpec
// }

// class BaseExtension<Options, Config> {
//   // config: Config 
//   options!: Options

//   // config = {
//   //   name: 'extension',
//   //   defaultOptions: {},
//   // }

//   // defaultConfig = {
//   //   name: 'extension',
//   //   defaultOptions: {},
//   // }

//   // get defaultConfig(): Config {
//   //   return {
//   //     name: 'extension',
//   //     // defaultOptions: {},
//   //   }
//   // }

//   config: Config

//   constructor(config: Config) {
//     this.config = {
//       // ...this.defaultConfig,
//       ...{
//         name: 'extension',
//         defaultOptions: {},
//       },
//       ...config,
//     }
//     this.options = this.config.defaultOptions
//   }

//   set(options: Partial<Options>) {
//     console.log(this.config.defaultOptions)
//     this.options = {
//       ...this.config.defaultOptions,
//       ...options,
//     } as Options

//     console.log(this)
//   }
// }

// // class Extension<Options> extends BaseExtension<Options, ExtensionConfig<Options>> {
// //   defaultConfig: ExtensionConfig<Options> = {
// //     name: 'extension',
// //     defaultOptions: {},
// //   }
// // }

// class Node<Options> extends BaseExtension<Options, NodeConfig<Options>> {
//   // defaultConfig: NodeConfig<Options> = {
//   //   name: 'extension',
//   //   defaultOptions: {},
//   //   schema() {
//   //     return {}
//   //   }
//   // }
// }

// type HeadingOptions = {
//   levels: number[]
// }

// const Headingg = new Node<HeadingOptions>({
//   name: 'heading',
//   defaultOptions: {
//     levels: [1, 2, 3, 4, 5, 6]
//   },
// })

// Headingg.set({
//   levels: [1, 2]
// })




type RecursivePartial<T> = {
  [P in keyof T]?:
    T[P] extends (infer U)[] ? RecursivePartial<U>[] :
    T[P] extends object ? RecursivePartial<T[P]> :
    T[P];
}

type AnyObject = {
  [key: string]: any
}

type ExtensionConfig<Options = AnyObject> = {
  name: string
  defaultOptions: Options | (() => Options)
}

type NodeConfig<Options = AnyObject> = ExtensionConfig<Options> & {
  schema?: () => NodeSpec
}



class BaseExtension<Options, Config> {
  options!: Partial<Options>

  defaultConfig = {
    name: 'extension',
    defaultOptions: {},
  }

  configs: AnyObject = {}

  constructor(config: AnyObject) {
    this.storeConfig({
      ...this.defaultConfig,
      ...config,
    }, 'overwrite')
  }

  storeConfig(config: AnyObject, stategy: ('extend' | 'overwrite')) {
    Object.entries(config).forEach(([key, value]) => {
      const item = {
        stategy,
        value,
      }

      if (this.configs[key]) {
        this.configs[key].push(item)
      } else {
        this.configs[key] = [item]
      }
    })
  }

  set(options: Partial<Options>) {
    this.options = options
  }

  extend(config: RecursivePartial<Config>) {
    this.storeConfig(config, 'extend')

    return this
  }

  overwrite(config: Partial<Config>) {
    this.storeConfig(config, 'overwrite')

    return this
  }
}

// class Extension<Options> extends BaseExtension<Options> {
//   defaultConfig: ExtensionConfig = {
//     name: 'extension',
//     defaultOptions: {},
//   }

//   constructor(config: ExtensionConfig<Options>) {
//     super(config)
//   }
// }

class Node<Options> extends BaseExtension<Options, NodeConfig<Options>> {
  defaultConfig: NodeConfig = {
    name: 'extension',
    defaultOptions: {},
    schema() {
      return {}
    }
  }

  constructor(config: NodeConfig<Options>) {
    super(config)
  }
}

type HeadingOptions = {
  levels: number[]
  bla: string
}

const Headingg = new Node<HeadingOptions>({
  name: 'heading',
  defaultOptions: {
    bla: 'hey',
    levels: [1, 2, 3, 4, 5, 6]
  },
})

// Headingg.set({
//   levels: [1, 2]
// })

const h2 = Headingg.extend({
  name: 'headliiiine',
  defaultOptions() {
    console.log('this:', this)
    return {
      levels: [5, 6]
    }
  },
})

const h3 = h2.extend({
  name: 'wtf',
})

h3.set({
  levels: [1, 2]
})

// const entries = Object
//   .entries(h3.configs)
//   .map(([key, value]) => {

//     const mergedValue = value.reduce((acc: any, item: any) => {
//       const { stategy, value } = item
//       const called = typeof value === 'function' ? value() : value
//       const isObject = called !== null && typeof called === 'object'

//       if (isObject && stategy === 'extend') {
//         return deepmerge(acc, called, {
//           arrayMerge: (destinationArray, sourceArray, options) => sourceArray
//         })
//       }

//       return called
//     }, {})

//     return [key, mergedValue]
//   })

//   console.log(entries)

// const bla = Object.fromEntries(entries)

// console.log(h3, bla)

// interface Testi {
//   name: string
//   defaultOptions: {
//     levels: number
//   }
// }

// class Test implements Testi {

//   name = '12'

//   defaultOptions = {
//     le
//   }

// }






















// const Heading = Extension(options => ({
//   defaultOptions: {
//     name: 'heading',
//   },
//   schema: {
//     parseDOM: options.levels
//       .map(level => ({
//         tag: `h${level}`,
//         attrs: { level },
//       })),
//   },
// }))

// const Heading = new Node()
//   .name('heading')
//   .options({
//     levels: [1, 2, 3]
//   })
//   .config(({ options }) => ({
//     schema: {
//       parseDOM: options.levels
//         .map(level => ({
//           tag: `h${level}`,
//           attrs: { level },
//         })),
//       toDOM: node => [`h${node.attrs.level}`, 0],
//     },
//     plugins: {
//       get() {


//       },
//     },
//   }))

// Heading
//   .extendOptions({
//     class: 'my-heading'
//   })
//   .extendConfig(({ options }) => ({
//     schema: {
//       toDOM: node => [`h${node.attrs.level}`, { class: options.class }, 0],
//     },
//   }))

// @ts-ignore
function copyProperties(target, source) {
  Object.getOwnPropertyNames(source).forEach(name => {
      Object.defineProperty(
          target,
          name,
          // @ts-ignore
          Object.getOwnPropertyDescriptor(source, name)
      );
  });
  return target;
}

// @ts-ignore
// function mix (...sources) {
//   const result = {}
//   for (const source of sources) {
//     const props = Object.keys(source)
//     for (const prop of props) {
//       const descriptor = Object.getOwnPropertyDescriptor(source, prop)
//       // @ts-ignore
//       Object.defineProperty(result, prop, descriptor)
//     }
//   }
//   return result
// }

let one = {
  count: 1,
  // arr: [1],
  get multiply() {
    // console.log(this.count)
    return this.count * 2
  },
  // nested: {
  //   foo: 'bar',
  // },
  // get nested() {
  //   return {
  //     foo: 'bar'
  //   }
  // }
}

let two = {
  count: 2,
  // arr: [2],
  get multiply() {
    // console.log(this.count)
    return this.count * 3
  },
}

// let three = {
//   ...one,
//   ...two
// }

// let three = copyProperties(one, two)
let three = copyProperties(one, two)
// let three = deepmerge(one, two, {clone: false})
// let three = merge(one, two)
// console.log(three)



// class Test {
//   constructor() {
//     // this.op = config
//     // @ts-ignore
//     this.name = 'test'
//   }

//   config(fn: any) {
//     this.config = fn.bind(this)()

//     return this
//   }

//   extend(fn: any) {
//     this.config = deepmerge(this.config, fn.bind(this)())

//     return this
//   }
// }


// const bla = new Test()
//   .config(function() {
//     //@ts-ignore
//     // console.log(this)
//     return {
//       schema: {
//         one: 1,
//         //@ts-ignore
//         foo: this.name + ' bar',
//       },
//     }
//   })
//   .extend(function() {
//     //@ts-ignore
//     // console.log(this)
//     return {
//       schema: {
//         two: 2,
//         //@ts-ignore
//         foo: this.name + ' barrrrr',
//       },
//     }
//   })
//   // .extend(() => ({
//   //   schema: {
//   //     two: 2,
//   //     //@ts-ignore
//   //     foo: this.name + ' barrrrr',
//   //   },
//   // }))

// console.log(bla.config)




// const Heading = new Node()
//   .name('heading')
//   .options({
//     levels: [1, 2, 3]
//   })
//   .config(({ name, options }) => ({
//     schema: {
//       parseDOM: options.levels.map(level => ({
//         tag: `h${level}`,
//         attrs: { level },
//       })),
//       toDOM: node => [`h${node.attrs.level}`, 0],
//     },
//   }))

// const CustomHeading = Heading.extend(({ name, options }) => ({
//   schema: {
//     toDOM: node => [`h${node.attrs.level}`, { class: 'custom-class' }, 0],
//   },
// }))


// const Heading = new Node()
//   .name('heading')
//   .options({
//     levels: [1, 2, 3]
//   })
//   .schema(options => ({
//     parseDOM: options.levels.map(level => ({
//       tag: `h${level}`,
//       attrs: { level },
//     })),
//     toDOM: node => [`h${node.attrs.level}`, 0],
//   }))

// const CustomHeading = Heading.extend('schema', options => ({
//   toDOM: node => [`h${node.attrs.level}`, { class: 'custom-class' }, 0],
// }))


















// type Bla = {
//   name: string
//   options: any
// }

// type TypeName = "name" | "schema"; 

// type ObjectType<T> = 
//   T extends "name" ? string :
//   T extends "schema" ? (bla: Bla) => NodeSpec :
//   never;

// class Test {
//   configs: any = {}

//   storeConfig(key: string, value: any, stategy: ('extend' | 'overwrite')) {
//     const item = {
//       stategy,
//       value,
//     }

//     if (this.configs[key]) {
//       this.configs[key].push(item)
//     } else {
//       this.configs[key] = [item]
//     }
//   }

//   name(value: string) {
//     this.storeConfig('name', value, 'overwrite')
//     return this
//   }

//   schema(value: (bla: Bla) => NodeSpec) {
//     this.storeConfig('schema', value, 'overwrite')
//     return this
//   }

//   extend<T extends TypeName>(key: T, value: ObjectType<T>) {
//     this.storeConfig(key, value, 'extend')
//     return this
//   }

//   clone() {
//     return Object.assign(
//       Object.create(
//         // Set the prototype of the new object to the prototype of the instance.
//         // Used to allow new object behave like class instance.
//         Object.getPrototypeOf(this),
//       ),
//       // Prevent shallow copies of nested structures like arrays, etc
//       JSON.parse(JSON.stringify(this)),
//     )
//   }
// }

// const Bla = new Test()
//   .name('hey')
  
// const Bla2 = Bla
//   .clone()
//   .name('ho')

// console.log(Bla, Bla2)




type NoInfer<T> = [T][T extends any ? 0 : never];

interface ExtensionCallback {
  editor: Editor
  name: string
}

type ExtensionExtends = {
  name: string
  options: AnyObject
  commands: (params: ExtensionCallback) => CommandSpec
}

class ExtensionTest<Options, Extends extends ExtensionExtends = ExtensionExtends> {
  type = 'extension'
  configs: any = {}
  usedOptions: Partial<Options> = {}

  protected storeConfig(key: string, value: any, stategy: 'extend' | 'overwrite') {
    const item = {
      stategy,
      value,
    }

    if (this.configs[key]) {
      this.configs[key].push(item)
    } else {
      this.configs[key] = [item]
    }
  }

  public options(options: Partial<Options>) {
    this.usedOptions = { ...this.usedOptions, ...options }
    return this
  }

  public name(value: Extends['name']) {
    this.storeConfig('name', value, 'overwrite')
    return this
  }

  public defaultOptions(value: Options) {
    this.storeConfig('defaultOptions', value, 'overwrite')
    return this
  }

  public commands(value: Extends['commands']) {
    this.storeConfig('commands', value, 'overwrite')
    return this
  }

  public extend<T extends Extract<keyof Extends, string>>(key: T, value: Extends[T]) {
    this.storeConfig(key, value, 'extend')
    return this
  }
  
  public create() {
    type ParentOptions = Options

    return <Options = ParentOptions>(options?: Partial<NoInfer<Options>>) => {
      return cloneDeep(this, true).options(options as Options)
    }
  }
}

interface NodeExtends extends ExtensionExtends {
  topNode: boolean
  schema: (params: ExtensionCallback) => NodeSpec
}

class NodeTest<Options> extends ExtensionTest<Options, NodeExtends> {
  type = 'node'

  public topNode(value: NodeExtends['topNode'] = true) {
    this.storeConfig('topNode', value, 'overwrite')
    return this
  }

  public schema(value: NodeExtends['schema']) {
    this.storeConfig('schema', value, 'overwrite')
    return this
  }
}

interface TestOptions {
  trigger: string
}

const Suggestion = new NodeTest<TestOptions>()
  .name('suggestion')
  .defaultOptions({
    trigger: '@'
  })
  .schema(() => ({
    toDOM: () => ['div', 0]
  }))
  .commands(({ editor, name }) => ({
    [name]: next => () => {
      editor.toggleMark(name)
      next()
    },
  }))
  .extend('schema', () => ({
    toDOM: () => ['span', 0],
  }))
  .create()

const Blub = new ExtensionTest<TestOptions>()
  .name('bla')
  .create()

console.log(Suggestion(), Suggestion().topNode().options({ trigger: 'jo' }))

// interface MentionOptions {
//   trigger: string
//   foo: string
// }

// const Mention = Suggestion<MentionOptions>()
//   .name('mention')
//   .create({
//     trigger: '@'
//   })

// const Hashtag = Suggestion({
//   trigger: '#'
// })
// .create()

// console.log(Mention(), Hashtag())





// // create extension
// const Suggestion = new Node()
//   .name('suggestion')
//   .options({
//     trigger: '@',
//   })
//   .create()

// // use extension
// new Editor({
//   extensions: [
//     Suggestion(),
//   ],
// })

// // use extension with setting options
// new Editor({
//   extensions: [
//     Suggestion({
//       trigger: '@',
//     }),
//   ],
// })

// // create extended nodes
// const Mention = Suggestion()
//   .name('mention')
//   .create({
//     trigger: '@'
//   })
// const Hashtag = Suggestion()
//   .name('hashtag')
//   .create({
//     trigger: '#'
//   })

// new Editor({
//   extensions: [
//     Mention(),
//     Hashtag(),
//   ],
// })

// // extend nodes
// const Whatever = Suggestion()
//   .extend('options', {
//     foo: 'bar',
//   })
//   .create()

// // btw: this...
// Suggestion({
//   trigger: '@'
// })

// // ...is equivalent to
// Suggestion().create({
//   trigger: '@'
// })

// Suggestion()
//   .name('mention')

// // would be the same
// Suggestion()
//   .override('name', 'mention')


