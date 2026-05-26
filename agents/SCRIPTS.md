# Runnable scripts from package.json

The following scripts are defined at the repo root and can be run via `pnpm <script-name>`:

- **development and build**
  - `pnpm dev` - start the demos on port 3000
  - `pnpm build` - build all packages via Turborepo
  - `pnpm reset` - remove caches, build artifacts, and reinstall deps
- **linting and formatting**
  - `pnpm lint` - run eslint checks
  - `pnpm lint:fix` - run prettier + eslint fix
- **testing**
  - `pnpm test` - run all tests, including unit & e2e - also builds the packages first
  - **e2e tests with Playwright**
    - `pnpm test:e2e` - run Playwright e2e tests headlessly in Chromium
    - `pnpm test:e2e:firefox` - same, in Firefox
    - `pnpm test:e2e:all` - same, in both browsers
    - `pnpm test:e2e:open` - run Playwright in UI mode (Chromium tests)
    - `pnpm test:e2e:open:firefox` - UI mode, Firefox tests
    - `pnpm test:e2e:open:all` - UI mode, both browsers selectable
    - `pnpm test:e2e:report` - open the HTML report from the last run
      **unit tests with Vitest**
  - `pnpm test:unit` - run Vitest unit tests in `packages/**/__tests__/`
- **publishing & serving**
  - `pnpm serve` - build and serve the demos on port 3000
  - `pnpm publish` - build and publish with Changesets
