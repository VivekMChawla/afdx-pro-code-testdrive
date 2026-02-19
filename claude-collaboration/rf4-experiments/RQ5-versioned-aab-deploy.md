# RQ5: Can version-suffixed AABs be deployed independently?

## Context

When a low-code user creates new draft versions in Agent Builder,
those drafts can be retrieved to a pro-code project as version-suffixed
AABs (e.g., `Local_Info_Agent_3`). We need to know if a pro-code
developer can modify these version-suffixed AABs and deploy them back.

## Project Location

This experiment uses the project at the current working directory.
The project already has `Local_Info_Agent_1` (a version-suffixed AAB).

## Experiment Steps

### Step 1: Record current state

```
ls force-app/main/default/aiAuthoringBundles/
```

Read the version-suffixed AAB:
```
cat force-app/main/default/aiAuthoringBundles/Local_Info_Agent_1/Local_Info_Agent_1.bundle-meta.xml
```

If there's an `.agent` file in the version-suffixed directory, read it:
```
ls force-app/main/default/aiAuthoringBundles/Local_Info_Agent_1/
cat force-app/main/default/aiAuthoringBundles/Local_Info_Agent_1/Local_Info_Agent_1.agent 2>/dev/null
```

Record what files exist and their contents.

### Step 2: Check if version-suffixed AAB has an .agent file

If the version-suffixed directory does NOT have an `.agent` file,
that tells us something — version-suffixed AABs may be metadata-only
(just `bundle-meta.xml`) without Agent Script source. Record this
finding.

### Step 3: Attempt to deploy the version-suffixed AAB

```
sf project deploy start --source-dir force-app/main/default/aiAuthoringBundles/Local_Info_Agent_1 --json
```

Record: Does it succeed or fail? What's the output?

### Step 4: If it has an .agent file, modify and redeploy

If the version-suffixed AAB has an `.agent` file:
- Make a trivial change (add a comment to instructions)
- Deploy:
  ```
  sf project deploy start --source-dir force-app/main/default/aiAuthoringBundles/Local_Info_Agent_1 --json
  ```
- Record: success/failure and exact output

### Step 5: Try retrieving a specific version

Attempt to retrieve a specific version that may exist in the org
but not locally:
```
sf project retrieve start --metadata AiAuthoringBundle:Local_Info_Agent_2 --json
```

Record: Does it succeed? What files are retrieved? Does it have an
`.agent` file?

### Step 6: Restore original state

Revert any changes:
```
git checkout -- force-app/main/default/aiAuthoringBundles/Local_Info_Agent_1/
```

Remove any newly retrieved version-suffixed directories:
```
git clean -fd force-app/main/default/aiAuthoringBundles/
```

## What to Record

For each step, capture:
1. The exact command run
2. The full output
3. The file listing of each version-suffixed AAB directory
4. Whether version-suffixed AABs contain `.agent` files or only
   `bundle-meta.xml`
5. Any error messages — capture the EXACT text

## Expected Outcome

One of:
- **A**: Version-suffixed AABs are fully editable and deployable → pro-code/low-code collaboration works bidirectionally on specific versions
- **B**: Version-suffixed AABs are read-only snapshots (deploy fails or is ignored) → pro-code developers must work through the "naked" AAB only
- **C**: Version-suffixed AABs don't even have `.agent` files → they're metadata pointers only, not editable Agent Script
- **D**: Deployment succeeds but creates unexpected side effects → document the behavior
