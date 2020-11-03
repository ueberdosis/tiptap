# Link
The Link extension adds support for `<a>` tags to the editor. The extension is renderless too, there is no actual UI to add, modify or delete links. The usage example below uses the native JavaScript prompt to show you how that could work.

In a real world application, you would probably add a more sophisticated user interface. [Check out the example](/examples/links) to see how that could look like.

Pasted URLs will be linked automatically.

## Installation
```bash
# with npm
npm install @tiptap/extension-link

# with Yarn
yarn add @tiptap/extension-link
```

## Settings
| Option      | Type    | Default                      | Description                                  |
| ----------- | ------- | ---------------------------- | -------------------------------------------- |
| class       | string  | –                            | Add a custom class to the rendered HTML tag. |
| openOnClick | boolean | true                         | If enabled, links will be opened on click.   |
| rel         | string  | noopener noreferrer nofollow | Configure the `rel` attribute.               |
| target      | string  | _blank                       | Set the default `target` of links.           |

## Commands
| Command | Parameters     | Description                                                 |
| ------- | -------------- | ----------------------------------------------------------- |
| link    | href<br>target | Link the selected text. Removes a link, if `href` is empty. |

## Keyboard shortcuts
:::warning Doesn’t have a keyboard shortcut
This extension doesn’t bind a specific keyboard shortcut. You would probably open your custom UI on `Mod-k` though.
:::

## Source code
[packages/extension-link/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-link/)

## Usage
<demo name="Marks/Link" highlight="3-8,19,38,55" />
