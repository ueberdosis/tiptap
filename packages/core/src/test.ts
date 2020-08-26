import { NodeSpec } from "prosemirror-model";
import deepmerge from 'deepmerge'

type RecursivePartial<T> = {
  [P in keyof T]?:
    T[P] extends (infer U)[] ? RecursivePartial<U>[] :
    T[P] extends object ? RecursivePartial<T[P]> :
    T[P];
}

type Extension<Options = any> = {
  name: string
  defaultOptions?: Options | (() => Options)
  bla?: number[] | ((this: ExtensionOptions<Options>) => number[])
  blub?: number[] | (() => number[])
  schema?: () => NodeSpec
}

type ExtensionOptions<T> = {
  options: T
}

function Extension<Options>(config: Extension<Options>) {
  const instance = (options: Options) => {
    const extensionInstance = {
      ...config,
      options,
    }

    if (typeof extensionInstance.name === 'function') {
      // @ts-ignore
      extensionInstance.name()
    }

    return extensionInstance
  }

  instance.extend = (extendConfig: RecursivePartial<Extension>) => {
    return Extension<Options>(deepmerge({...config}, {...extendConfig}) as Extension)
  }

  return instance
}

type HeadingOptions = {
  levels?: number[]
}

const Heading = Extension<HeadingOptions>({
  name: 'heading',
  defaultOptions: {
    levels: [1, 2, 3, 4, 5, 6],
  },
  schema() {
    return {
      defining: true
    }
  }
})

// Heading
const h = Heading.extend({
  name: '123',
})({
  levels: [1, 2]
})

console.log({h})

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
