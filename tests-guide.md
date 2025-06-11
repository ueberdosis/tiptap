Testing in the Tiptap Project
Based on the codebase, Tiptap uses Cypress for testing. Here's an overview of the testing setup:

Test Types
Integration Tests: Located in ./tests/cypress/integration/**/\*.spec.{js,ts}
Core functionality tests (e.g., createNodeFromContent, generateHTML, isActive)
Extension-specific tests (e.g., bold.spec.ts)
Demo Tests: Organized by feature categories
Commands: ./demos/src/Commands/**/_.spec.{js,ts}
Examples: ./demos/src/Examples/\*\*/_.spec.{js,ts}
Experiments: ./demos/src/Experiments/**/\*.spec.{js,ts}
Extensions: ./demos/src/Extensions/**/_.spec.{js,ts}
Guide Content: ./demos/src/GuideContent/\*\*/_.spec.{js,ts}
Guide Getting Started: ./demos/src/GuideGettingStarted/\*_/_.spec.{js,ts}
Component Tests: Cypress supports component testing, and there are references to component testing plugins in the documentation.
Testing Setup
Configuration: Tests are configured in tests/cypress.config.js
TypeScript Support: Tests use TypeScript with configuration in tests/cypress/tsconfig.json
CI Integration: Tests run in GitHub Actions as defined in .github/workflows/build.yml
Test Execution
Tests can be run with:

E2E tests: Cypress runs against a local server (pnpm run serve)
The CI pipeline runs tests in a matrix configuration, separating different test categories
Example Test Patterns
Core API Tests: Testing core functionality like generateHTML, generateJSON, etc.
Extension Tests: Testing specific extensions like Bold
Node/Mark Tests: Testing specific node types like Heading
Static Renderer Tests: Testing the static rendering capabilities
The project also has Vitest configuration for some parts, particularly in the codemods directory.

01:41 PM
Are there unit tests?

01:41 PM
Based on the provided codebase information, there don't appear to be dedicated unit tests using a unit testing framework like Jest or Vitest in the main project structure.

The testing approach in Tiptap primarily relies on:

Cypress for integration and E2E testing: The test files with .spec.{js,ts} extensions are primarily Cypress tests that verify functionality through browser interactions.
Vitest configuration exists but limited usage: There is a Vitest configuration file in codemods/tiptap-2-migrate-imports/vitest.config.ts, but this appears to be specifically for testing the codemod tools rather than the core Tiptap functionality.
The project could benefit from dedicated unit tests for:

Individual utility functions
Core classes and methods
Extension logic in isolation
While the Cypress tests do test the functionality of the editor and its extensions, they're more integration-focused rather than true unit tests that would test individual functions and methods in isolation with mocked dependencies.

If you're looking to add unit tests to the project, you might consider:

Setting up Vitest for the entire project (expanding beyond just the codemods)
Creating unit test files alongside the source files or in a dedicated **tests** directory
Writing tests for individual utility functions, classes, and methods
