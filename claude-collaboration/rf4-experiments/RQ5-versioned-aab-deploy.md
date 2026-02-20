# RQ5: Can version-suffixed AABs be deployed independently?

## Context

When a low-code user creates new draft versions in Agent Builder,
those drafts can be retrieved to a pro-code project as version-suffixed
AABs (e.g., `Local_Info_Agent_3`). We need to know if a pro-code
developer can modify these version-suffixed AABs and deploy them back.
This determines whether the pro-code/low-code collaboration loop is
truly bidirectional at the version level, or only at the "naked" AAB
level.

## What Prior Experiments Established (READ THIS FIRST)

**From RQ1:** The project contains `Local_Info_Agent` (the "naked" AAB)
and may contain `Local_Info_Agent_1` (a version-suffixed AAB from a
prior retrieve). The server-side AAB filename includes a version suffix
(e.g., `Local_Info_Agent_4.agent`) even though the local file is just
`Local_Info_Agent.agent`.

**From RQ2:** `sf project deploy start` validates AAB source against the
org's Invocable Action registry. It checks that referenced Apex classes
exist AND have `@InvocableMethod`, but does NOT check parameter types,
return types, or `@InvocableVariable` names.

**From RQ3:** After publishing, the local source stays clean (no
`<target>` set). `<target>` only appears in local `bundle-meta.xml` if
the developer explicitly retrieves a published version. If `<target>` IS
present and points to a published version, deploys with content changes
fail. Removing `<target>` allows deployment to create/update a DRAFT.

**From RQ4:** Deploy and publish are fundamentally different operations.
`sf project deploy start` creates AiAuthoringBundle metadata in the org
but does NOT create Bot/BotVersion/GenAi* entities. The deployed AAB IS
visible and editable in Agent Builder (Agentforce Studio). `sf agent
publish authoring-bundle` is self-contained — it deploys, compiles Agent
Script to Agent DSL, and creates the full entity graph.

**From RQ4:** `default_agent_user` cannot be changed once an agent has
been published. If a version-suffixed AAB has a different
`default_agent_user` than what the org expects, deploy or publish may
fail for reasons unrelated to versioning. Do NOT change
`default_agent_user` during this experiment.

## Project Location

This experiment uses the project at the current working directory.

## CRITICAL INSTRUCTIONS

- Run commands EXACTLY as written. Do NOT substitute `sf agent publish`
  for `sf project deploy start` — they are fundamentally different
  operations and this experiment specifically tests deploy behavior.
- Always use `--json` for machine-readable output.
- Do NOT change `default_agent_user` in any file.
- Capture ALL error messages with their EXACT text — do not paraphrase.
  If an error message seems vague, misleading, or says something
  different from what actually happened, flag it explicitly as a "BAD
  ERROR MESSAGE" and explain why it's misleading.

## Experiment Steps

### Step 1: Establish ground truth from the org

First, check what versions actually exist in the org:
```
sf project retrieve start --metadata AiAuthoringBundle:Local_Info_Agent --json
```

Then list what's in the local project AFTER the retrieve:
```
ls -la force-app/main/default/aiAuthoringBundles/
```

For EACH directory found under `aiAuthoringBundles/`, list its contents
and read all files:
```
ls -la force-app/main/default/aiAuthoringBundles/<dirname>/
cat force-app/main/default/aiAuthoringBundles/<dirname>/*.xml
cat force-app/main/default/aiAuthoringBundles/<dirname>/*.agent 2>/dev/null
```

Record:
- How many AAB directories exist (naked + version-suffixed)
- Which directories have `.agent` files vs. only `bundle-meta.xml`
- What `<target>` values are set (if any)
- What `<status>` values are set (Draft vs. Published)

### Step 2: Determine version-suffixed AAB structure

Based on Step 1 findings:

**If version-suffixed directories have `.agent` files:** They contain
actual Agent Script — proceed to Step 3.

**If version-suffixed directories have ONLY `bundle-meta.xml`:** They
are metadata pointers without editable Agent Script content. Record this
as a key finding. Still proceed to Step 3 to test deploy behavior on
metadata-only AABs.

### Step 3: Deploy a version-suffixed AAB (unmodified)

Pick one version-suffixed AAB directory from Step 1. Deploy it as-is:
```
sf project deploy start --source-dir force-app/main/default/aiAuthoringBundles/<version-suffixed-dir> --json
```

Record: Does it succeed or fail? Capture the full output.

**If no version-suffixed directories exist:** Try retrieving a specific
version. Based on the naked AAB's `bundle-meta.xml`, look at the
`<target>` value or any version references to guess what versions might
exist. Try:
```
sf project retrieve start --metadata AiAuthoringBundle:Local_Info_Agent_2 --json
```
If that fails, try `_3`, `_4`, etc. Record all attempts and outputs.

### Step 4: Modify and redeploy (if .agent file exists)

**Only if** the version-suffixed AAB has an `.agent` file:
- Make a trivial change to the `.agent` file (e.g., add a word to the
  agent's instructions text)
- Deploy:
  ```
  sf project deploy start --source-dir force-app/main/default/aiAuthoringBundles/<version-suffixed-dir> --json
  ```
- Record: success/failure and exact output

**If the version-suffixed AAB has NO `.agent` file:** Skip this step.
You cannot modify Agent Script that doesn't exist locally.

### Step 5: Check the org state after deploy

If Step 3 or Step 4 succeeded, verify what happened in the org:
```
sf project retrieve start --metadata AiAuthoringBundle:Local_Info_Agent --json
```

List all AAB directories again and compare to Step 1:
```
ls -la force-app/main/default/aiAuthoringBundles/
```

For any changed or new directories, read all files. Record:
- Did the version-suffixed deploy update that specific version?
- Did it create a new version?
- Did it affect the naked AAB?
- Did any `<target>` or `<status>` values change?

### Step 6: Restore original state

Revert ALL changes and remove any newly retrieved directories:
```
git checkout -- force-app/main/default/aiAuthoringBundles/
git clean -fd force-app/main/default/aiAuthoringBundles/
```

Verify restoration:
```
ls -la force-app/main/default/aiAuthoringBundles/
```

## What to Record

For each step, capture:
1. The exact command run
2. The full output (use `--json` for CLI commands)
3. The file listing of each AAB directory
4. Whether version-suffixed AABs contain `.agent` files or only
   `bundle-meta.xml`
5. Any `<target>` and `<status>` values in `bundle-meta.xml`
6. Any error messages — capture the EXACT text. If any error message
   seems vague, misleading, confusing, or doesn't match what actually
   happened, flag it as a **BAD ERROR MESSAGE** and explain specifically
   what's wrong with it. We are building an inventory of these.

## Expected Outcome

One of:
- **A**: Version-suffixed AABs are fully editable and deployable — pro-code/low-code collaboration works bidirectionally on specific versions
- **B**: Version-suffixed AABs are read-only snapshots (deploy fails or is ignored) — pro-code developers must work through the "naked" AAB only
- **C**: Version-suffixed AABs don't even have `.agent` files — they're metadata pointers only, not editable Agent Script
- **D**: Deployment succeeds but creates unexpected side effects (e.g., new version created, naked AAB modified) — document the behavior exactly

---

## Experiment Results

**Date**: 2026-02-19
**Outcome**: **B** — Version-suffixed AABs are read-only snapshots of
published versions. They contain real Agent Script but their content
cannot be changed via deploy. Pro-code developers must work through the
naked AAB only.

### Step 1 Results: Ground Truth

**Command (initial — without wildcard):**
```
sf project retrieve start --metadata AiAuthoringBundle:Local_Info_Agent --json
```

This retrieved ONLY the naked `Local_Info_Agent` — no version-suffixed
variants. The project already had `Local_Info_Agent_1` and `MyTest` from
prior experiments.

**Command (corrected — with wildcard):**
```
sf project retrieve start -m "AiAuthoringBundle:Local_Info_Agent_*" --json
```

This retrieved the naked AAB plus ALL 5 version-suffixed variants:

| Directory | `.agent` file? | Size (bytes) | `<target>` | `<status>` |
|-----------|---------------|-------------|-----------|-----------|
| `Local_Info_Agent` | Yes | 15,701 | None | None |
| `Local_Info_Agent_1` | Yes | 15,609 | `Local_Info_Agent.v1` | None |
| `Local_Info_Agent_2` | Yes | 15,622 | `Local_Info_Agent.v2` | None |
| `Local_Info_Agent_3` | Yes | 15,622 | `Local_Info_Agent.v3` | None |
| `Local_Info_Agent_4` | Yes | 15,622 | `Local_Info_Agent.v4` | None |
| `Local_Info_Agent_5` | Yes | 15,622 | `Local_Info_Agent.v5` | None |

Key observations:
- ALL version-suffixed AABs have `.agent` files with full Agent Script
  (~15.6KB each)
- ALL version-suffixed AABs have `<target>` pointing to their published
  version
- No `<status>` element in any `bundle-meta.xml`
- The naked AAB has no `<target>` — it represents the current working
  draft
- Without the wildcard, `AiAuthoringBundle:Local_Info_Agent` retrieves
  only the naked AAB — version-suffixed variants require explicit
  wildcard or individual naming

### Step 2 Results: Structure Determination

Version-suffixed directories contain **real Agent Script** — they are
NOT metadata-only pointers. Outcome C is ruled out. All version-suffixed
`.agent` files contain complete, valid Agent Script including `system:`,
`config:`, `variables:`, `language:`, and topic definitions.

### Step 3 Results: Unmodified Deploy

**Command:**
```
sf project deploy start --source-dir force-app/main/default/aiAuthoringBundles/Local_Info_Agent_1 --json
```

**Result: SUCCEEDED**

```json
{
  "status": "Succeeded",
  "success": true,
  "numberComponentsDeployed": 1,
  "numberComponentErrors": 0,
  "details": {
    "componentSuccesses": [
      {
        "changed": true,
        "componentType": "AiAuthoringBundle",
        "created": true,
        "fullName": "Local_Info_Agent_1",
        "success": true
      }
    ]
  }
}
```

The deploy reported `created: true` — it treated
`Local_Info_Agent_1` as a new standalone metadata entity in the org.
Since the content was identical to the server-side published version,
there was no "change" to reject.

**Warning:**
```
"Polling for 1 SourceMembers timed out after 6 attempts (last 6 were empty).\n\nMissing SourceMembers:\n  - AiAuthoringBundle: Local_Info_Agent_1"
```
The org's source tracking does not recognize version-suffixed AABs as
tracked source members.

### Step 4 Results: Modified Deploy

**Modification:** Added the word "friendly" to `Local_Info_Agent_3`
instructions (`"You are a helpful..."` → `"You are a friendly
helpful..."`).

**Command:**
```
sf project deploy start --source-dir force-app/main/default/aiAuthoringBundles/Local_Info_Agent_3 --json
```

**Result: FAILED**

```json
{
  "status": "Failed",
  "success": false,
  "numberComponentErrors": 0,
  "details": {
    "componentFailures": [
      {
        "problem": "aiAuthoringBundles/Local_Info_Agent_3/Local_Info_Agent_3.agent : content cannot be changed once the bundle version is published.",
        "problemType": "Error"
      }
    ],
    "componentSuccesses": [
      {
        "changed": true,
        "componentType": "AiAuthoringBundle",
        "created": true,
        "fullName": "Local_Info_Agent_3",
        "success": true
      }
    ]
  }
}
```

The deploy was rejected because `Local_Info_Agent_3` has
`<target>Local_Info_Agent.v3</target>` pointing to a published version.
Content changes to published versions are not allowed. This confirms
RQ3's finding.

**Key contrast with Step 3:** Deploying with identical content
(Step 3) succeeds because the server has nothing to reject. Deploying
with modified content (Step 4) fails because the server enforces
immutability on published bundle versions.

### Step 5 Results: Org State After Deploy

**Command:**
```
sf project retrieve start -m "AiAuthoringBundle:Local_Info_Agent_*" --json
```

Same 6 AABs returned (naked + v1 through v5). No changes:
- The modified `Local_Info_Agent_3.agent` was overwritten by the
  retrieve with the original server-side content (the "friendly" edit
  was not persisted)
- No new versions were created
- No `<target>` or `<status>` values changed
- The naked `Local_Info_Agent` was NOT affected by either deploy attempt

### Step 6 Results: Restore

```
git checkout -- force-app/main/default/aiAuthoringBundles/
git clean -fd force-app/main/default/aiAuthoringBundles/
```

Restored to original state. Only the naked `Local_Info_Agent` directory
remains.

---

## BAD ERROR MESSAGES

### BAD ERROR MESSAGE #1: Contradictory Success/Failure in Deploy Response

**Where:** Step 4 — deploy of modified `Local_Info_Agent_3`

**Exact text:** The JSON response contains the component in BOTH
`componentSuccesses` (with `created: true`, `success: true`) AND
`componentFailures` (with the "content cannot be changed" error). The
overall response shows `status: "Failed"` and `success: false`, but
`numberComponentErrors: 0`.

**Why it's bad:** A developer parsing this JSON gets contradictory
signals. The component is simultaneously reported as successfully
created AND as having failed. The `numberComponentErrors: 0` field is
factually wrong — there IS a component error. Any automation checking
`numberComponentErrors === 0` would incorrectly conclude the deploy had
no component-level issues.

### BAD ERROR MESSAGE #2: Malformed Warning String

**Where:** Step 4 — deploy of modified `Local_Info_Agent_3`

**Exact text:**
```
", , returned from org, but not found in the local project"
```

**Why it's bad:** The warning has empty values where entity identifiers
(type, name, etc.) should appear. The leading ", ," suggests a template
like `"{type}, {name}, returned from org..."` where the type and name
were not populated. A developer seeing this warning cannot determine
what entity it refers to.

---

## Key Findings Summary

1. **Version-suffixed AABs are retrievable with wildcards.** Using
   `-m "AiAuthoringBundle:Local_Info_Agent_*"` retrieves all versions.
   Without the wildcard, only the naked AAB is retrieved.

2. **Version-suffixed AABs contain full Agent Script.** They are NOT
   metadata-only pointers (ruling out Outcome C). Each has a complete
   `.agent` file with all agent definitions.

3. **Version-suffixed AABs are immutable.** Content changes to
   published versions are rejected with `"content cannot be changed once
   the bundle version is published."` The `<target>` field in
   `bundle-meta.xml` locks the AAB to a specific published version.

4. **Unmodified deploys succeed as no-ops.** Deploying a
   version-suffixed AAB without content changes succeeds because the
   server has nothing to reject. This is misleading — it suggests the
   deploy "worked" when it didn't actually change anything.

5. **Deploys to version-suffixed AABs do not affect the naked AAB.**
   The naked AAB (the working draft) is completely isolated from
   version-suffixed deploy attempts.

6. **Source tracking does not cover version-suffixed AABs.** The org's
   source tracking system does not recognize version-suffixed AABs as
   tracked source members, generating timeout warnings.

## Implications for Pro-Code/Low-Code Collaboration

The collaboration loop is **one-directional at the version level:**

- **Retrieve direction works:** Pro-code developers CAN retrieve
  version-suffixed AABs to see exactly what was published at each
  version. This is useful for diffing, auditing, and understanding
  version history.

- **Deploy direction is blocked:** Pro-code developers CANNOT modify
  and redeploy a specific published version. Published versions are
  immutable.

- **The naked AAB is the only writable surface:** All pro-code edits
  must go through the naked (unsuffixed) AAB, which represents the
  current working draft. This is the only AAB that can be modified and
  deployed/published.

- **Workflow implication:** To iterate on a published version, a
  developer must: (1) retrieve the version-suffixed AAB for reference,
  (2) copy desired changes into the naked AAB, (3) deploy/publish
  through the naked AAB. There is no way to "branch" from a specific
  published version directly.
