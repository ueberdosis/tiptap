# Repository layout

```
.
├─ packages/                 # Core and all first-party extensions
│  ├─ core/                  # Editor core (@tiptap/core)
│  ├─ extension-*/           # Individual extensions
│  ├─ pm/                    # ProseMirror related internals and helpers
│  └─ ...                    # Shared utilities, framework bindings, etc.
├─ demos/                    # Vite app for live examples and colocated e2e specs
│  ├─ src/
│  │  ├─ react/              # React demos
│  │  └─ vue/                # Vue demos
│  └─ test/                  # Playwright helpers (getEditor, setEditorContent, ...)
├─ .changeset/               # Changesets for versioning and changelogs
└─ .github/                  # Workflows and GitHub-related config/docs
```

Notes:

* All packages we publish or use live under `packages/*`.
* The `demos/` folder contains a Vite app. It automatically discovers and parses React and Vue demos so they appear in the UI without manual wiring.
* Playwright e2e specs live alongside their demos as `demos/src/**/index.spec.ts`. `playwright.config.ts` auto-starts the Vite dev server on `http://127.0.0.1:4080` — no need to launch it manually.
