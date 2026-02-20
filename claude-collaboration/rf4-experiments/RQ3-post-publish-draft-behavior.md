# RQ3: What happens after publishing when the current AAB has no draft to point to?

## Context

After publishing an AAB, the `<target>` element in `bundle-meta.xml`
points to the published version. We need to understand what happens
next — does the platform auto-create a new draft, throw an error when
you try to deploy, or something else?

**Key context from RQ1/RQ2 findings:**
- `sf agent validate authoring-bundle` only checks Agent Script
  syntax/compilation — it does NOT validate backing logic or agent user.
- Deploy validates backing logic via Invocable Action registry lookup
  (class must exist AND have `@InvocableMethod`). Does NOT check
  parameter names, types, or return types.
- The server uses a version-suffixed filename (e.g.,
  `Local_Info_Agent_4.agent`) even though the local filename has no
  suffix. This triggers a CLI warning — it is expected, not an error.
- `default_agent_user` is immutable after first publish. Do NOT change
  it during this experiment.
- **IMPORTANT: This experiment tests `sf project deploy start` for
  deploy steps and `sf agent publish authoring-bundle` for publish
  steps. Do NOT substitute one for the other — they are different
  operations with different validation behavior.**

## Project Location

This experiment uses the project at the current working directory.
The agent `Local_Info_Agent` has already been published (at least v1
and v2 exist).

## Important

This experiment modifies org state. Take note of the starting state
so it can be restored if needed.

## Experiment Steps

### Step 1: Record current state (local AND org)

First, retrieve the latest AAB state from the org to establish ground
truth (the local project may be stale):
```
sf project retrieve start --metadata AiAuthoringBundle:Local_Info_Agent --json
```

Then record the local state:
```
ls force-app/main/default/aiAuthoringBundles/
```

Read the current `bundle-meta.xml`:
```
cat force-app/main/default/aiAuthoringBundles/Local_Info_Agent/Local_Info_Agent.bundle-meta.xml
```

Record the current `<target>` value and all AAB directories present.

### Step 2: Publish the current AAB

Publish the current state to create a new published version. This
establishes a clean "just published" state for the rest of the
experiment.

```
sf agent publish authoring-bundle --api-name Local_Info_Agent --json
```

Record: What version number was created? Did it succeed?

### Step 3: Retrieve and inspect post-publish state

```
sf project retrieve start --metadata AiAuthoringBundle:Local_Info_Agent --json
```

```
ls force-app/main/default/aiAuthoringBundles/
```

```
cat force-app/main/default/aiAuthoringBundles/Local_Info_Agent/Local_Info_Agent.bundle-meta.xml
```

Record:
- What does `<target>` now point to?
- Are there any new version-suffixed AAB directories?
- Is there still a "naked" (unsuffixed) `Local_Info_Agent` directory?

### Step 4: Make a trivial change to the agent

Add a harmless comment to `Local_Info_Agent.agent`, such as adding
a comment line to the system instructions. This ensures we're deploying
a modified version.

### Step 5: Deploy the modified AAB

```
sf project deploy start --source-dir force-app/main/default/aiAuthoringBundles/Local_Info_Agent --json
```

Record: Does it succeed or fail? If it succeeds, what version does
the org consider this to be? If it fails, what's the exact error
message?

### Step 6: Inspect org state after deploy

```
sf project retrieve start --metadata AiAuthoringBundle:Local_Info_Agent --json
```

```
ls force-app/main/default/aiAuthoringBundles/
```

```
cat force-app/main/default/aiAuthoringBundles/Local_Info_Agent/Local_Info_Agent.bundle-meta.xml
```

Record:
- Did `<target>` change?
- Is there a new draft version?
- Are there any new version-suffixed directories?

### Step 7: Publish again

```
sf agent publish authoring-bundle --api-name Local_Info_Agent --json
```

Record: Does it succeed? What version number does the new published
version get? What is the relationship between the deploy in Step 5
and this publish?

### Step 8: Retrieve and inspect final state

```
sf project retrieve start --metadata AiAuthoringBundle:Local_Info_Agent --json
```

```
ls force-app/main/default/aiAuthoringBundles/
```

```
cat force-app/main/default/aiAuthoringBundles/Local_Info_Agent/Local_Info_Agent.bundle-meta.xml
```

Record the final state of all AAB directories and `bundle-meta.xml`.

### Step 9: Restore original state

Revert ALL local changes — both the `.agent` file and any files
modified by retrieve operations:

```
git checkout -- force-app/main/default/aiAuthoringBundles/Local_Info_Agent/
```

If retrieve created new version-suffixed directories that weren't
there before, clean them up:
```
git clean -fd force-app/main/default/aiAuthoringBundles/
```

Verify the restore:
```
git status force-app/main/default/aiAuthoringBundles/
```

## What to Record

For each step, capture:
1. The exact command run
2. The full JSON output
3. The contents of `bundle-meta.xml` after each state change
4. The list of AAB directories after each state change
5. Any error messages — capture the EXACT text. If any error message
   is vague or misleading (e.g., "Internal Error, try again later"),
   flag it explicitly. We are maintaining an inventory of bad error
   messages for the engineering team.

## Expected Outcome

One of:
- **A**: Deploy after publish auto-creates a new draft version → the platform handles versioning seamlessly
- **B**: Deploy after publish succeeds but overwrites the published version's draft → dangerous behavior to document
- **C**: Deploy after publish fails with an error → skill must warn about post-publish workflow
- **D**: Something else entirely → document whatever happens

---

## Results

**Date**: 2026-02-19
**Org**: efficiency-drive-5179-dev-ed (scratch)
**Agent**: Local_Info_Agent
**Answer**: **Outcome C** (deploy fails) — **with a workaround** (clearing `<target>` unblocks deploy)

---

### Step 1 Results: Record current state

**Command**: `sf project retrieve start --metadata AiAuthoringBundle:Local_Info_Agent --json`

Retrieve succeeded. Two files retrieved: `.agent` and `.bundle-meta.xml`.

**AAB directories**:
- `Local_Info_Agent` (primary)
- `Local_Info_Agent_1` (pre-existing)
- `MyTest` (pre-existing)

**bundle-meta.xml** (after retrieve):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<AiAuthoringBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <bundleType>AGENT</bundleType>
</AiAuthoringBundle>
```

No `<target>` element present. The org state has a draft (or no
published version pointed to).

---

### Step 2 Results: Publish the current AAB

**Command**: `sf agent publish authoring-bundle --api-name Local_Info_Agent --json`

```json
{
  "status": 0,
  "result": {
    "success": true,
    "botDeveloperName": "Local_Info_Agent"
  },
  "warnings": []
}
```

Publish succeeded. **No version number** returned in the response.

**Flag for engineering**: The publish response should include the
version number that was created.

---

### Step 3 Results: Retrieve and inspect post-publish state

**Command**: `sf project retrieve start --metadata AiAuthoringBundle:Local_Info_Agent --json`

Retrieve succeeded. AAB directories unchanged (same 3 dirs).

**bundle-meta.xml** (after retrieve):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<AiAuthoringBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <bundleType>AGENT</bundleType>
    <target>Local_Info_Agent.v4</target>
</AiAuthoringBundle>
```

**Key observations**:
- `<target>` now points to `Local_Info_Agent.v4` — version 4 was created
- The platform does NOT auto-create a new draft after publishing
- The `<target>` locks the bundle to the published version
- No new version-suffixed directories were created
- The `.agent` file content is unchanged

---

### Step 4 Results: Make a trivial change

Added `# RQ3 experiment: trivial change for post-publish deploy test`
as the first line of `Local_Info_Agent.agent`.

---

### Step 5 Results: Deploy the modified AAB

**Command**: `sf project deploy start --source-dir force-app/main/default/aiAuthoringBundles/Local_Info_Agent --json`

**Result: FAILED** (exit code 1)

**Error message**:
```
aiAuthoringBundles/Local_Info_Agent/Local_Info_Agent.agent : content cannot be changed once the bundle version is published.
```

**Component failure details**:
```json
{
  "changed": false,
  "columnNumber": 0,
  "componentType": "",
  "created": false,
  "deleted": false,
  "fileName": "",
  "fullName": "",
  "lineNumber": 0,
  "problem": "aiAuthoringBundles/Local_Info_Agent/Local_Info_Agent.agent : content cannot be changed once the bundle version is published.",
  "problemType": "Error",
  "success": false
}
```

**Flags for engineering**:
1. `numberComponentErrors: 0` but deploy failed via `componentFailures`
   — the error count is wrong/misleading
2. `componentType: ""` and `fullName: ""` are empty strings in the
   failure entry — should identify the component
3. Warning: `", , returned from org, but not found in the local
   project"` — garbled warning with empty component name/type

---

### Step 6 Results: Inspect org state after failed deploy

**Command**: `sf project retrieve start --metadata AiAuthoringBundle:Local_Info_Agent --json`

Org state unchanged. `<target>` still `Local_Info_Agent.v4`. No new
directories. No new draft created. The failed deploy had no effect
on org state.

The retrieve overwrote our local comment change (`.agent` restored
to org version).

---

### Step 7 Results: Publish again (no content changes)

**Command**: `sf agent publish authoring-bundle --api-name Local_Info_Agent --json`

```json
{
  "status": 0,
  "result": {
    "success": true,
    "botDeveloperName": "Local_Info_Agent"
  },
  "warnings": []
}
```

Publish succeeded even though **no content changed** since the last
publish. The platform creates a new version with identical content.

**Flag for engineering**: Publishing identical content should either
warn or be a no-op. Silent version inflation is confusing.

---

### Step 8 Results: Retrieve and inspect final state

**Command**: `sf project retrieve start --metadata AiAuthoringBundle:Local_Info_Agent --json`

**bundle-meta.xml**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<AiAuthoringBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <bundleType>AGENT</bundleType>
    <target>Local_Info_Agent.v5</target>
</AiAuthoringBundle>
```

Version incremented from v4 to v5 with identical content. No new
directories.

---

### Bonus Experiment: Deploy with CLEARED target

After Step 8, we tested whether clearing `<target>` unblocks deploy.

**Setup**:
1. Removed `<target>Local_Info_Agent.v5</target>` from bundle-meta.xml
2. Added comment to `.agent` file

**Command**: `sf project deploy start --source-dir force-app/main/default/aiAuthoringBundles/Local_Info_Agent --json`

**Result: SUCCEEDED**

```json
{
  "status": 0,
  "result": {
    "status": "Succeeded",
    "success": true,
    "numberComponentsDeployed": 1,
    "numberComponentErrors": 0
  }
}
```

**Warning**: `"Polling for 1 SourceMembers timed out after 6 attempts
(last 6 were empty).\n\nMissing SourceMembers:\n  - AiAuthoringBundle:
Local_Info_Agent"` — source tracking polling timed out.

**Post-deploy retrieve**:
- `<target>` remains absent (org does not auto-set target after deploy)
- `.agent` file retained the deployed comment — content was deployed
- No new directories created

**Conclusion**: Clearing `<target>` unblocks deploy by treating the
bundle as a draft instead of a published version.

---

### Step 9 Results: Restore original state

```
git checkout -- force-app/main/default/aiAuthoringBundles/Local_Info_Agent/
```

Verified with `git status`: Local_Info_Agent is clean. Only
pre-existing untracked directories remain (`Local_Info_Agent_1`,
`MyTest`).

---

## Summary of Findings

### Primary Finding

**After publishing, the platform locks the AAB by setting `<target>`
in `bundle-meta.xml` to the published version.** Any subsequent deploy
that includes content changes will fail with: _"content cannot be
changed once the bundle version is published."_

The platform does NOT auto-create a new draft version after publish.
The developer is stuck until they clear the `<target>` field.

### The Workaround

**Clearing the `<target>` field** from `bundle-meta.xml` before
deploying unblocks the deploy. The platform treats the bundle as a
new draft. After the deploy, the org does not auto-set `<target>`,
so subsequent deploys continue to work.

### Implications for AFDX Tooling

1. **Post-publish workflow must clear `<target>`** — any "publish then
   continue editing" workflow needs to remove the target from
   bundle-meta.xml before the next deploy
2. **The `sf agent publish` command should auto-clear `<target>`** after
   a successful publish, or at minimum warn the developer
3. **Retrieve after publish creates a local trap** — the retrieved
   `bundle-meta.xml` has `<target>` set, so the next deploy will fail
   unless the developer knows to clear it
4. **No-op publishes waste version numbers** — publishing identical
   content creates a new version with no guard or warning

### Error Messages to Flag

| Error/Warning | Issue |
|---------------|-------|
| `content cannot be changed once the bundle version is published.` | Error is clear but doesn't mention the root cause (`<target>` field) or the fix (remove it). Should say "remove the `<target>` element to create a new draft." |
| `numberComponentErrors: 0` on a failed deploy | Error count is wrong — should be 1 |
| `componentType: ""`, `fullName: ""` in componentFailures | Component identity missing from failure entry |
| `", , returned from org, but not found in the local project"` | Garbled warning with empty component name and type |
| No version number in publish response | Publish API should return the version that was created |
| No warning when publishing identical content | Silent version inflation is confusing |
| `Polling for 1 SourceMembers timed out` after cleared-target deploy | Source tracking doesn't handle the cleared-target deploy pattern |

### Version History Observed

| Step | Action | `<target>` after | Notes |
|------|--------|-------------------|-------|
| 1 | Retrieve | (absent) | Starting state — no target |
| 2 | Publish | — | Not retrieved yet |
| 3 | Retrieve | `Local_Info_Agent.v4` | Publish created v4 |
| 5 | Deploy (with target) | unchanged | **FAILED** — published version locked |
| 7 | Publish (no changes) | — | Not retrieved yet |
| 8 | Retrieve | `Local_Info_Agent.v5` | Published v5 with identical content |
| 5b | Deploy (cleared target) | (absent) | **SUCCEEDED** — treated as draft |
