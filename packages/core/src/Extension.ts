import { type ExtendableConfig, Extendable } from './Extendable.js'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ExtensionConfig<Options = any, Storage = any>
  extends ExtendableConfig<Options, Storage, ExtensionConfig<Options, Storage>, null> {}

/**
 * The Extension class is the base class for all extensions.
 * @see https://tiptap.dev/api/extensions#create-a-new-extension
 */
export class Extension<Options = any, Storage = any> extends Extendable<
  Options,
  Storage,
  ExtensionConfig<Options, Storage>
> {
  type = 'extension'

  static create<O = any, S = any>(config: Partial<ExtensionConfig<O, S>> = {}) {
    return new Extension<O, S>(config)
  }
}
