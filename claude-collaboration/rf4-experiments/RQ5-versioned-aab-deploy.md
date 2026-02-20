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
