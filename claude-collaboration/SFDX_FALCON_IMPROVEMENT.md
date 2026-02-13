# sfdx-falcon Library Improvement — Context Document

> **Purpose**: Provide a future AI agent (or human developer) with the context needed to
> systematically improve the sfdx-falcon library. Read this document in full before
> making any changes.
>
> **Author**: Vivek Chawla (framework creator) + Claude (analyst)
> **Created**: February 2026
> **Delete when**: The improvement work described here is complete.

---

## 1. What is sfdx-falcon?

A JavaScript (ESM) utility library that wraps the Salesforce CLI and the `listr2` task
runner into a higher-level abstraction for building automated org setup scripts. It lives
at `scripts/js/sfdx-falcon/` and is consumed by build scripts in `scripts/js/`.

**Design philosophy**: Provide a "pit of success" for developers writing Salesforce CLI
automation. A developer should be able to define a task with a title, a CLI command, and
optional handlers — and get error rendering, debug logging, JSON parsing, and conditional
suppression for free.

---

## 2. Current Architecture

```
scripts/js/sfdx-falcon/
├── debug/index.mjs          # SfdxFalconDebug — namespace-gated diagnostic logging
├── error/index.mjs          # SfdxFalconError, SfdxCliError, ShellError — error hierarchy
├── task-runner/
│   ├── index.mjs            # TaskRunner — singleton Listr orchestrator
│   └── sfdx-task.mjs        # SfdxTask — wraps a single SF CLI command as a Listr task
├── utilities/
│   ├── general.mjs          # Stub (empty, marked for deletion)
│   ├── json.mjs             # JSON parsing, type coercion, ANSI stripping
│   └── sfdx.mjs             # SFDX-specific utilities (ID validation, project config, etc.)
└── validators/
    └── type-validator.mjs   # 1500+ line type validation module (100+ functions)
```

### Dependency flow (top → bottom = high → low abstraction)

```
Build scripts (setup.mjs, build-org-env.mjs, build-scratch-env.mjs)
  └─→ TaskRunner (singleton, owns Listr instance)
        └─→ SfdxTask (builds individual Listr tasks)
              ├─→ SfdxFalconError (error wrapping and rendering)
              │     └─→ json utilities (findJson for CLI output parsing)
              ├─→ SfdxFalconDebug (diagnostic logging)
              └─→ sfdx utilities (ID validation, conditional suppressors)
                    └─→ type-validator (input validation)
```

### External dependencies

| Package | Used by | Purpose |
|---------|---------|---------|
| `zx` | SfdxTask, TaskRunner | Shell command execution |
| `listr2` | TaskRunner | Task runner framework with terminal UI |
| `debug` | SfdxFalconDebug | Namespace-filtered debug output |
| `chalk` / `chalk-template` | Debug, Error | Terminal styling |
| `lodash-es` | Error, JSON, Validators | `isEmpty` utility |
| `uuid` | sfdx.mjs | Unique username generation |
| `strip-ansi` | json.mjs | Clean CLI output before JSON parsing |
| `fs-extra` | type-validator | File system path checks |

---

## 3. Design Principles to Apply

These principles are drawn from canonical sources (Ousterhout, Bloch, Meyers) and
validated by patterns in widely-adopted libraries. Apply them **in priority order** —
the first principle is the most important.

### P1: Deep Modules (Ousterhout)

**What it means**: Modules should have simple interfaces but sophisticated implementations.
The ratio of capability to interface complexity should be high.

**How it applies here**: SfdxTask is already a good deep module — simple constructor,
sophisticated execution. But TaskRunner is shallow: it's mostly a thin pass-through to
Listr with minimal added value. The type-validator module is the opposite problem — deep
implementation but a sprawling interface (100+ exported functions).

### P2: Pit of Success (Microsoft)

**What it means**: The easiest thing to do should also be the correct thing. Incorrect
usage should require deliberate effort.

**How it applies here**: SfdxTask already does this well (auto-appends `--json`, parses
output, wraps errors). But raw Listr tasks bypass all of these protections. Consumers
who add raw tasks get none of the framework's benefits.

### P3: Progressive Disclosure of Complexity

**What it means**: Simple use cases should require simple code. Complexity should only
appear when the user's needs are genuinely complex.

**Layers for sfdx-falcon**:
- **Simple**: `new SfdxTask(title, command)` — just works with defaults
- **Intermediate**: `new SfdxTask(title, command, {suppressErrors, onSuccess})` — handlers
- **Advanced**: Raw Listr task with full access to ctx/task objects

### P4: Hyrum's Law

**What it means**: Every observable behavior will be depended upon, regardless of docs.

**How it applies here**: The automatic `--json` appending, the `stdoutJson`/`stderrJson`
property names on processError, the singleton TaskRunner pattern — these are all implicit
contracts now. Changes to any of them are breaking changes.

### P5: Easy to Use Correctly, Hard to Use Incorrectly (Meyers)

**What it means**: API design should make misuse syntactically difficult or impossible.

**How it applies here**: The `suppressErrors` option accepting both boolean and function
is a good example of this done well — but there's no type enforcement preventing someone
from passing a string. Validation at construction time would catch this.

---

## 4. Known Issues — Ordered by Impact

These are specific, confirmed issues found through code analysis. Fix them in this order.

### 4.1 BUGS (fix immediately)

**B1. `errMsgNullInvalidObject()` references undefined `excludeArray`**
- File: `validators/type-validator.mjs`, around line 342
- The function signature doesn't include `excludeArray` but the template string references it.
- Impact: Will produce `undefined` in error messages instead of the intended text.
- Fix: Add `excludeArray` parameter or hardcode the conditional.

**B2. `convertPropertyToNumber()` has incorrect type check**
- File: `utilities/json.mjs`, around line 143
- Code: `targetObject[targetKey] === 'boolean'` — compares value to the string `'boolean'`
- Should be: `typeof targetObject[targetKey] === 'boolean'`
- Impact: Boolean values won't be properly detected and converted.

**B3. `getIdFromPackageAlias()` throws `Error` instead of `SfdxFalconError`**
- File: `utilities/sfdx.mjs`, line 235
- All other functions throw `SfdxFalconError`. This one throws bare `Error`.
- Impact: Error rendering will not work properly for this case.

**B4. Typo in `errMsgEmptyNullInvalidString`**
- File: `validators/type-validator.mjs`, around line 101
- Says "by got" instead of "but got".

### 4.2 INCONSISTENCIES (fix for coherence)

**I1. Debug module has two parallel APIs with unclear guidance**
- `debugMessage()` / `debugString()` / `debugObject()` — always output (unconditional)
- `msg()` / `str()` / `obj()` — only output when namespace is enabled (conditional)
- Problem: No documentation tells consumers which to use when. Build scripts and internal
  code mix both patterns inconsistently.
- Recommendation: Document the distinction clearly in JSDoc. The unconditional methods
  are for "always show" diagnostics (error contexts, startup messages). The conditional
  methods are for verbose tracing. Consider renaming for clarity:
  `alwaysMsg()` / `msg()` or similar.

**I2. `TaskRunner.addTask()` returns inconsistent types**
- Returns a Listr task object for SfdxTask inputs, returns the raw object for Listr tasks.
- Recommendation: Return a consistent type (or void) regardless of input.

**I3. Silent parameter coercion in validators**
- `throwOnEmptyNullInvalidObject()` silently coerces wrong-typed parameters instead of
  failing fast.
- Recommendation: Validate the validator's own parameters. The existing
  `validateTheValidator()` helper suggests this was intended but not fully implemented.

### 4.3 STRUCTURAL IMPROVEMENTS (refactor for maintainability)

**S1. Split `type-validator.mjs` (1514 lines) into focused modules**

This is the single highest-impact structural change. The module has three distinct
concerns that should be separate files:

| New module | Contains | Approx. lines |
|------------|----------|---------------|
| `validators/predicates.mjs` | All `is*` functions (return boolean) | ~400 |
| `validators/assertions.mjs` | All `throwOn*` functions (throw on failure) | ~600 |
| `validators/messages.mjs` | All `errMsg*` functions (error message generators) | ~300 |
| `validators/index.mjs` | Re-exports everything for backward compatibility | ~20 |

**Why**: The current monolithic file violates the single-responsibility principle and is
difficult to navigate. The three concerns have different consumers: predicates are used
in conditionals, assertions are used at function entry, messages are internal to assertions.

**Backward compatibility**: The barrel `index.mjs` re-exports everything, so existing
`import { throwOnX } from '../validators/type-validator.mjs'` paths continue to work.
Migrate imports gradually.

**S2. Introduce a base `Task` class**

Currently, `SfdxTask` handles SF CLI commands and raw Listr tasks bypass the framework
entirely. A base `Task` class would let both paths benefit from the framework:

```javascript
// Base class — provides debug logging, error wrapping, context access
class Task {
  constructor(title, options) { ... }
  buildListrTask() { /* subclass responsibility */ }
}

// SF CLI commands — existing behavior
class SfdxTask extends Task {
  constructor(title, commandString, options) { ... }
}

// General shell commands — new capability
class ShellTask extends Task {
  constructor(title, shellCommand, options) { ... }
}

// Pure JS tasks — replaces raw Listr tasks with framework benefits
class ScriptTask extends Task {
  constructor(title, taskFunction, options) { ... }
}
```

**Why**: Build scripts currently mix `SfdxTask` with raw Listr tasks for things like
JSON file updates. The raw tasks get none of the framework's error handling, debug
logging, or stdio rendering. A `ScriptTask` would bring them into the framework.

**S3. Remove dead code**

- `utilities/general.mjs` — empty stub with TODO to delete. Delete it.
- `TaskRunner.zx` static member — set to `null`, never used. Remove it.
- `CliTask` commented code in TaskRunner — dead code referencing unimplemented class. Remove.

**S4. Strengthen `findJson()` parsing**

Current implementation uses `indexOf('{')` and `lastIndexOf('}')` which is fragile.
It will fail on:
- CLI output with JSON-like log messages before the actual response
- Nested objects where the first `{` isn't the start of the response
- Escaped braces in string values

Recommendation: Use a more robust approach — try `JSON.parse()` on progressively larger
substrings, or use a streaming JSON parser that can extract the first complete object.

---

## 5. Improvement Roadmap

Execute these phases in order. Each phase should be a complete, testable unit of work.

### Phase 1: Bug Fixes (no API changes)

1. Fix B1 (`errMsgNullInvalidObject` undefined variable)
2. Fix B2 (`convertPropertyToNumber` type check)
3. Fix B3 (`getIdFromPackageAlias` bare Error throw)
4. Fix B4 (typo in error message)
5. Verify: Run build scripts against a test org to confirm no regressions.

### Phase 2: Documentation & Consistency (no API changes)

1. Fix I1: Add clear JSDoc to debug module explaining unconditional vs. conditional methods.
   Include usage guidance in the module-level comment block.
2. Fix I2: Make `TaskRunner.addTask()` return type consistent.
3. Fix I3: Add self-validation to validators where parameter coercion is happening silently.
4. Review ALL JSDoc across the library. Ensure every exported function has:
   - `@param` with type and description
   - `@returns` with type and description
   - `@throws` if applicable
   - `@example` with realistic usage
5. Verify: Existing build scripts still work without changes.

### Phase 3: Dead Code Removal (minor API changes)

1. Delete `utilities/general.mjs`
2. Remove `TaskRunner.zx` static member
3. Remove commented `CliTask` code from TaskRunner
4. Update any imports that reference removed code.
5. Verify: Build scripts still work.

### Phase 4: Structural Refactoring (internal, backward-compatible)

1. Split `type-validator.mjs` into `predicates.mjs`, `assertions.mjs`, `messages.mjs`
   with a barrel `index.mjs` that re-exports everything.
2. Update internal imports within sfdx-falcon to use the new paths.
3. Keep the original `type-validator.mjs` path working via re-export (backward compat).
4. Verify: Build scripts work without import changes.

### Phase 5: New Abstractions (API additions)

1. Introduce base `Task` class.
2. Refactor `SfdxTask` to extend `Task`.
3. Create `ScriptTask` for pure JS tasks (replaces raw Listr task objects).
4. Migrate raw Listr tasks in build scripts to `ScriptTask`.
5. Strengthen `findJson()` parsing logic.
6. Verify: Build scripts produce identical behavior with new task types.

---

## 6. Constraints & Non-Goals

**Constraints the agent must respect**:
- This is ESM JavaScript (`.mjs`), not TypeScript. Don't convert to TypeScript.
- The library uses `zx` for shell execution. Don't replace it.
- The library uses `listr2` for task rendering. Don't replace it.
- Vivek is the sole author and reviewer. Match his coding style: comprehensive JSDoc with
  decorative comment borders, `camelCase` functions, `PascalCase` classes, hierarchical
  debug namespaces with `:` separators.
- Build scripts (`setup.mjs`, `build-org-env.mjs`, `build-scratch-env.mjs`) are the
  primary consumers. Changes must not break them.

**Non-goals (don't do these)**:
- Don't add TypeScript type definitions (`.d.ts` files).
- Don't add a test framework or test files (testing is manual via build script execution).
- Don't restructure the directory layout beyond what's specified in Phase 4.
- Don't add new external dependencies without explicit approval.
- Don't refactor the error rendering system (it's complex but stable and working).

---

## 7. How to Validate Changes

After each phase:

1. **Syntax check**: `node --check scripts/js/sfdx-falcon/<modified-file>.mjs`
2. **Import check**: `node -e "import('./scripts/js/setup.mjs')"` from project root
   (verifies the full import tree resolves)
3. **Functional check**: Run `npm run setup` against a connected Salesforce org.
   The script should execute all tasks without errors (or with only expected/suppressed
   errors like duplicate perm set assignments).
4. **Regression check**: Compare task output before and after changes. The Listr terminal
   output (task titles, success/failure indicators) should be identical.

---

## 8. Style Guide Reference

Match these patterns exactly when writing new code:

**File header**:
```javascript
//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          sfdx-falcon/<path>/<filename>.mjs
 * @copyright     Vivek M. Chawla - 2023
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       One-line summary.
 * @description   Longer description.
 * @version       1.0.0
 * @license       BSD-3-Clause
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Debug namespace initialization**:
```javascript
const dbgNs = 'MODULE:SUBMODULE';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);
```

**Function documentation**:
```javascript
//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    functionName
 * @param       {Type} paramName  Description of param.
 * @returns     {Type}  Description of return value.
 * @summary     One-line summary.
 * @description Detailed description. Include behavior for edge cases.
 * @public
 * @example
 * ```
 * const result = functionName(arg);
 * ```
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Import organization** (external first, then internal, aligned with whitespace):
```javascript
import   * as path                        from 'path';
import { v4 as uuid }                     from 'uuid';

import { SfdxFalconDebug }                from '../debug/index.mjs';
import { SfdxFalconError }                from '../error/index.mjs';
```
