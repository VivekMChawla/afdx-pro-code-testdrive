# RQ3: What happens after publishing when the current AAB has no draft to point to?

## Context

After publishing an AAB, the `<target>` element in `bundle-meta.xml`
points to the published version. We need to understand what happens
next — does the platform auto-create a new draft, throw an error when
you try to deploy, or something else?

## Project Location

This experiment uses the project at the current working directory.
The agent `Local_Info_Agent` has already been published twice (v1, v2).

## Important

This experiment modifies org state. Take note of the starting state
so it can be restored if needed.

## Experiment Steps

### Step 1: Record current state

Check what AAB versions exist in the local project:
```
ls force-app/main/default/aiAuthoringBundles/
```

Read the current `bundle-meta.xml`:
```
cat force-app/main/default/aiAuthoringBundles/Local_Info_Agent/Local_Info_Agent.bundle-meta.xml
```

Record the current `<target>` value.

### Step 2: Make a trivial change to the agent

Add a harmless comment to `Local_Info_Agent.agent`, such as adding
a comment line to the system instructions. This ensures we're deploying
a modified version.

### Step 3: Deploy the modified AAB

```
sf project deploy start --source-dir force-app/main/default/aiAuthoringBundles/Local_Info_Agent --json
```

Record: Does it succeed or fail? If it succeeds, what version does
the org consider this to be? If it fails, what's the error?

### Step 4: Check org state after deploy

Retrieve the AAB to see if the org's version tracking changed:
```
sf project retrieve start --metadata AiAuthoringBundle:Local_Info_Agent --json
```

Re-read `bundle-meta.xml`:
```
cat force-app/main/default/aiAuthoringBundles/Local_Info_Agent/Local_Info_Agent.bundle-meta.xml
```

Did `<target>` change? Is there a new draft version?

### Step 5: Check for new version-suffixed AABs

```
ls force-app/main/default/aiAuthoringBundles/
```

Are there any new version-suffixed directories (e.g.,
`Local_Info_Agent_2`, `Local_Info_Agent_3`)?

### Step 6: Try publishing again

```
sf agent publish authoring-bundle --api-name Local_Info_Agent --json
```

Record: Does it succeed? What version number does the new published
version get? Did a new draft get auto-created?

### Step 7: Retrieve and inspect final state

```
sf project retrieve start --metadata AiAuthoringBundle:Local_Info_Agent --json
```

```
ls force-app/main/default/aiAuthoringBundles/
```

Record the final state of all AAB directories and `bundle-meta.xml`.

### Step 8: Restore original state

Revert the trivial comment change made in Step 2. Use `git checkout`
to restore the original file if needed:
```
git checkout -- force-app/main/default/aiAuthoringBundles/Local_Info_Agent/Local_Info_Agent.agent
```

## What to Record

For each step, capture:
1. The exact command run
2. The full JSON output
3. The contents of `bundle-meta.xml` after each state change
4. The list of AAB directories after each state change
5. Any error messages — capture the EXACT text

## Expected Outcome

One of:
- **A**: Deploy after publish auto-creates a new draft version → the platform handles versioning seamlessly
- **B**: Deploy after publish succeeds but overwrites the published version's draft → dangerous behavior to document
- **C**: Deploy after publish fails with an error → skill must warn about post-publish workflow
- **D**: Something else entirely → document whatever happens
