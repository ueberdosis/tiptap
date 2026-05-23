# Demos

Tiptap uses demos for manual verification, end-to-end testing & as a playground for development.

* Demos live in a Vite app located inside the `demos/` repository.
* The demo package uses a custom vite setup for routing. All demos are listed in the `demos/src` directory.
* The folder structure for demos follow this pattern: `demos/src/<Category>/<DemoName>/<Variant>`.
  * `<Category>` is a broad grouping (e.g., "Commands", "Extensions", "Integrations").
    * Categories can also have subcategories, e.g., `demos/src/Commands/Formatting/Bold Command/React`.
  * `<DemoName>` is a specific feature or use case (e.g., "Bold Command", "Collaboration Extension", "React Integration").
  * `<Variant>` is the framework variant (e.g., "React", "Vue", "Svelte") or "Vanilla" for framework-agnostic demos.
* Demos always need an empty `index.html` file to be recognized by vite's filesystem-based routing.
* The demos come with auto-injected setups that you can find in `demos/setup`

## Predefined Styles

* Our demos come with default styles that are injected globally. Never invent custom CSS if there are existing classes you can reuse. If you need to add styles, use the provided classes and extend them in a separate CSS file imported by the demo's `index.tsx`/`index.vue`.
  * Styles are written in SCSS and support nesting. Variables and mixins from `demos/setup/style.scss` are available globally in all demo stylesheets.
  * You can find the default styles in `demos/setup/style.scss`
    * the `:root` element includes CSS variables for colors, spacing, and other design tokens. Read `demos/setup/style.scss[2-21]` for details on available variables.
    * The `.tiptap` class should not be used as it is for the editor content area.
    * For horizontal button arrangements, use the `.button-group` class on a container element around the buttons.
    * For control toolbars, wrap `.button-group` and other controls in a `.control-group` element. You can make it sticky by adding `.sticky` to the `.control-group`.
    * `.output-group` is a container for demo outputs (e.g., editor content, logs). It has a default style with a light background and padding.

## Important `@tiptap/*` imports

We use the demos `tsconfig.json` to alias imports from `@tiptap/*` to the local packages `src` directories. This allows us to test the actual published package APIs in the demos, without needing to build and publish them first. When adding a demo, make sure to import from `@tiptap/core`, `@tiptap/react`, etc., instead of relative paths.

## Starting Demos and opening them

Start in dev mode:

```bash
pnpm dev
```

Build static output and serve locally:

```bash
pnpm serve
```
