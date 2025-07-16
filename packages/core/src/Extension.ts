import type { Editor } from './Editor.js'
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

  /**
   * Create a new Extension instance
   * @param config - Extension configuration object or a function that returns a configuration object
   */
  static create<O = any, S = any>(
    config: Partial<ExtensionConfig<O, S>> | (() => Partial<ExtensionConfig<O, S>>) = {},
  ) {
    // If the config is a function, execute it to get the configuration object
    const resolvedConfig = typeof config === 'function' ? config() : config
    return new Extension<O, S>(resolvedConfig)
  }

  configure(options?: Partial<Options>) {
    return super.configure(options) as Extension<Options, Storage>
  }

  extend<
    ExtendedOptions = Options,
    ExtendedStorage = Storage,
    ExtendedConfig = ExtensionConfig<ExtendedOptions, ExtendedStorage>,
  >(
    extendedConfig?:
      | (() => Partial<ExtendedConfig>)
      | (Partial<ExtendedConfig> &
          ThisType<{
            name: string
            options: ExtendedOptions
            storage: ExtendedStorage
            editor: Editor
            type: null
          }>),
  ): Extension<ExtendedOptions, ExtendedStorage> {
    // If the extended config is a function, execute it to get the configuration object
    const resolvedConfig = typeof extendedConfig === 'function' ? extendedConfig() : extendedConfig
    return super.extend(resolvedConfig) as Extension<ExtendedOptions, ExtendedStorage>
  }
}
