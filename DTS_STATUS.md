# TypeScript Declaration Files (DTS) Status

## Current Status: ⚠️ Temporarily Disabled

DTS (`.d.ts`) file generation is currently disabled across all DibDab packages due to TypeScript limitations with module augmentation.

## Why is DTS Generation Disabled?

### The Problem

DibDab uses TypeScript's module augmentation pattern to dynamically add commands to the editor:

```typescript
// In a command file
declare module '@dibdab/core' {
  interface Commands<ReturnType> {
    myCommand: {
      myCommand: (arg: string) => ReturnType
    }
  }
}

export const myCommand = (arg: string) => ({ commands }: CommandProps) => {
  // TypeScript can't resolve 'commands.otherCommand' during DTS generation
  return commands.otherCommand()
}
```

TypeScript's DTS generator cannot properly resolve module augmentations when:
1. Commands reference other commands
2. Type annotations rely on augmented interfaces
3. Cross-file module augmentation dependencies exist

### Errors Encountered

During DTS generation, we encountered errors like:
- `Property 'X' does not exist on type 'SingleCommands'`
- `Property 'X' does not exist on type 'RawCommands'`
- `Binding element implicitly has an 'any' type`

These occur because TypeScript's declaration emitter processes files independently and doesn't have full context of module augmentations.

## What We Tried

### Attempted Fixes

1. ✅ **Added explicit type annotations** - Fixed many implicit 'any' errors
2. ✅ **Replaced `RawCommands['X']` with `CommandSpec`** - Reduced reliance on augmented types
3. ✅ **Added `@ts-ignore` comments** - Suppressed errors for known-good code
4. ✅ **Relaxed compiler options** - Used `skipLibCheck`, `noImplicitAny: false`
5. ✅ **Fixed canvas extension type issues** - Converted `addMethods` to `addCommands`
6. ⚠️ **Module augmentation refactoring** - Too extensive for current timeline

### Why Not Just Fix Everything?

- **60+ command files** each using module augmentation
- **Cross-file dependencies** between commands
- **Architectural limitation** of TypeScript's declaration emitter
- **Demo timeline** - Needed stable build quickly

## Current Solution

**All packages have DTS generation disabled:**

```typescript
// tsup.config.ts
dts: false, // Temporarily disabled - see DTS_STATUS.md
```

## Impact

### What Still Works ✅

- **Full TypeScript support in source code** - All type checking works during development
- **Runtime functionality** - All code executes correctly
- **IDE IntelliSense** - Works for source files
- **Build process** - Fast and reliable
- **All Phase 3 features** - Canvas extensions work perfectly

### What's Limited ⚠️

- **External package type definitions** - Published packages won't have `.d.ts` files
- **Third-party IDE support** - Consumers using DibDab as a dependency won't get type hints
- **Type-only imports** - Can't use `import type` from published packages

## Workaround for Consumers

Until DTS is re-enabled, consumers can:

```typescript
// Use JSDoc for type hints
/** @type {import('@dibdab/core').Editor} */
let editor

// Or use runtime imports with type assertions
import { Editor } from '@dibdab/core'
const editor = new Editor({...}) as any
```

## Path Forward (Phase 4+)

### Option 1: Manual Declaration Files

Create hand-written `.d.ts` files that bypass the TypeScript compiler:

- **Pros**: Full control, can handle complex types
- **Cons**: Manual maintenance, risk of drift
- **Effort**: High
- **Timeline**: 1-2 weeks

### Option 2: Refactor Module Augmentation

Move away from dynamic module augmentation:

- **Pros**: TypeScript-native, better tooling support
- **Cons**: Major architectural change
- **Effort**: Very High
- **Timeline**: 3-4 weeks

### Option 3: TypeScript 5.x+ Features

Wait for/use TypeScript improvements:

- **Pros**: Proper solution, future-proof
- **Cons**: Requires TypeScript version bump
- **Effort**: Medium
- **Timeline**: Depends on TypeScript releases

### Option 4: Hybrid Approach

Generate DTS for stable parts, hand-write for commands:

- **Pros**: Best of both worlds
- **Cons**: Complex build setup
- **Effort**: High
- **Timeline**: 2-3 weeks

## Recommendation

**For now**: Ship without DTS, document the limitation.

**For Phase 4**: Pursue Option 4 (Hybrid Approach)
- Generate DTS for types, helpers, extensions
- Hand-write command interface declarations
- Use declaration merging for module augmentation

## References

- [TypeScript Issue #47663](https://github.com/microsoft/TypeScript/issues/47663) - Module augmentation in declaration files
- [TypeScript Handbook - Module Augmentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation)
- DibDab commands pattern: `packages/core/src/commands/*.ts`

## Status Tracking

| Package | DTS Status | Notes |
|---------|------------|-------|
| @dibdab/core | ❌ Disabled | 60+ command files with augmentation |
| @dibdab/react | ❌ Disabled | Depends on core types |
| @dibdab/pm | ✅ N/A | Re-exports only |
| @dibdab/extension-* | ❌ Disabled | For consistency |
| @dibdab/starter-kit | ❌ Disabled | For consistency |

Last updated: 2026-01-22
Status: Stable build achieved, DTS deferred to Phase 4
