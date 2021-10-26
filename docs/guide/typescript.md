---
tableOfContents: true
---

# Working with TypeScript

## Introduction
The whole Tiptap is code base is written in TypeScript. If you haven’t heard of it or never used it, no worries. You don’t have to.

TypeScript extends JavaScript by adding types (hence the name). It adds new syntax, which doesn’t exist in Vanilla JavaScript. It’s actually removed before running in the browser, but this step – the compilation – is important to find bugs early. It checks if you passe the right types of data to functions. For a big and complex project, that’s very valuable. It means we’ll get notified of lot of bugs, before shipping code to you.

**Anyway, if you don’t use TypeScript in your project, that’s fine.** You will still be able to use Tiptap and nevertheless get a nice autocomplete for the Tiptap API (if your editor supports it, but most do).

If you are using TypeScript in your project and want to extend Tiptap, there are two types that are good to know about.

## Types

### Options types
To extend or create default options for an extension, you’ll need to define a custom type, here is an example:

```ts
import { Extension } from '@tiptap/core'

export interface CustomExtensionOptions {
  awesomeness: number,
}

const CustomExtension = Extension.create<CustomExtensionOptions>({
  addOptions() {
    return {
      awesomeness: 100,
    }
  },
})
```

### Storage types
To add types for your extension storage, you’ll have to pass that as a second type parameter.

```ts
import { Extension } from '@tiptap/core'

export interface CustomExtensionStorage {
  awesomeness: number,
}

const CustomExtension = Extension.create<{}, CustomExtensionStorage>({
  addStorage() {
    return {
      awesomeness: 100,
    }
  },
})
```

### Command type
The core package also exports a `Command` type, which needs to be added to all commands that you specify in your code. Here is an example:

```ts
import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customExtension: {
      /**
       * Comments will be added to the autocomplete.
       */
      yourCommand: (someProp: any) => ReturnType,
    }
  }
}

const CustomExtension = Extension.create({
  addCommands() {
    return {
      yourCommand: someProp => ({ commands }) => {
        // …
      },
    }
  },
})
```

That’s basically it. We’re doing all the rest automatically.
