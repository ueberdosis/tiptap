# Example pull requests

These examples use public Tiptap PRs. Evidence comes from the diffs and the original authors' reports.

## Small documentation fix

[Source PR #4871](https://github.com/ueberdosis/tiptap/pull/4871)

### Correct the Next.js example filename

#### Why

- The Next.js guide gives the wrong filename for the JSX example.

#### Expected Behavior

- Readers following step 3 save the example as `components/Tiptap.jsx`.

#### Verification

- The diff changes the extension in step 3 to match the JSX example.

This PR was created by an AI Agent. AI drafted the description.

## Package build change

[Source PR #8771](https://github.com/ueberdosis/tiptap/pull/8771)

### Reduce package size by targeting ES2022

#### Why

- Package consumers download extra JavaScript when the build rewrites newer syntax for older runtimes.

#### Expected Behavior

- The build targets ES2022 for both published module formats. Consumers that need older JavaScript transpile the packages.

#### Review

- [`pack.config.mts:L26-L27`](https://github.com/ueberdosis/tiptap/blob/643792f65e8ea5506fc2591cfd140fc3aec6d29b/pack.config.mts#L26-L27). Does the smaller output justify requiring older-runtime consumers to transpile the packages? That choice sets the JavaScript syntax consumers must support.

#### Verification

- The original author reported smaller output and shared the [measurement setup and results](https://gist.github.com/nperez0111/fce48bf791fee4c9bc8494425208b762).
- The measurements cover bundle size. Test a consumer build separately if older-runtime compatibility affects the decision.
- The changeset records the new target.

This PR was created by an AI Agent. AI drafted the description.
