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
