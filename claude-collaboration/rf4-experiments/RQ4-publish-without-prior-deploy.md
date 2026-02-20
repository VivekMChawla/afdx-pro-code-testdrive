# RQ4: Can you publish an AAB that has never been manually deployed?

## Context

We know that `sf agent publish authoring-bundle` deploys the AAB to
the org as part of the publish process. But does this work for a
brand-new AAB that has never existed in the org, or does the org need
to have a pre-existing draft?

**Key context from RQ1/RQ2/RQ3 findings:**
- `sf agent validate authoring-bundle` only checks Agent Script
  syntax/compilation — it does NOT validate backing logic or agent user.
- Deploy validates backing logic via Invocable Action registry lookup
  (class must exist AND have `@InvocableMethod`). This test agent has
  no actions, so backing logic validation is not exercised here — and
  that's intentional. We're testing the deploy/publish mechanics, not
  backing logic validation.
- The server uses a version-suffixed filename (e.g.,
  `Publish_Test_Agent_1.agent`) even though the local filename has no
  suffix. This triggers a CLI warning — it is expected, not an error.
- `default_agent_user` must have "Einstein Agent" license (NOT standard
  Salesforce license). Wrong license → misleading "Internal Error."
  Immutable after first publish.
- After publishing, local source is NOT updated with `<target>`. If
  you retrieve after publish, `<target>` will appear in `bundle-meta.xml`
  — this is expected behavior, not an error.
- **IMPORTANT: Steps 4 and 5 test different commands. Do NOT substitute
  one for the other. Step 4 tests `sf project deploy start`. Step 5
  tests `sf agent publish authoring-bundle`. They are different
  operations with different behavior.**

## Project Location

This experiment uses the project at the current working directory.
We'll create a NEW agent specifically for this test, then clean it up.

## Important

This experiment creates new metadata in the org. Clean up steps are
included at the end.

## Experiment Steps

### Step 1: Generate a fresh test agent

```
sf agent generate authoring-bundle --no-spec --name "Publish Test Agent" --api-name Publish_Test_Agent
```

Record: What files were created? Where? Inspect the generated `.agent`
file to see the boilerplate format — you'll modify it in Step 2.

### Step 2: Add minimal content to the agent

Edit the generated `.agent` file. Do NOT replace the entire file —
work with the boilerplate structure that `generate` produced and fill
in the required fields:

- Set `default_agent_user` to the same value used in
  `Local_Info_Agent.agent` (read that file to get the exact username).
  This user MUST have the "Einstein Agent" license — do not guess or
  use a different user.
- Ensure there is at least one topic with minimal content (no actions
  needed — we just need a valid Agent Script file that passes
  validation).
- Set `role`, `company`, and `instructions` to simple placeholder text.

Use the structure from `Local_Info_Agent.agent` as a reference for
the correct field format if needed.

### Step 3: Validate the agent locally

```
sf agent validate authoring-bundle --api-name Publish_Test_Agent --json
```

Record: Does validation pass? If not, fix issues and retry. Remember
that validate only checks syntax — it won't catch agent user or
backing logic issues.

### Step 4: Test `sf project deploy start` on a fresh AAB (no prior org state)

**IMPORTANT**: This step explicitly tests whether `sf project deploy
start` works for an AAB that has never been in the org. Do NOT skip
this step or substitute `sf agent publish`. We need direct evidence.

```
sf project deploy start --source-dir force-app/main/default/aiAuthoringBundles/Publish_Test_Agent --json
```

Record: Does it succeed or fail?
- If it **succeeds**: `sf project deploy start` can deploy a fresh AAB.
  Record the output. Check if a DRAFT V1 was created in the org by
  trying to open it in Builder:
  ```
  sf org open agent --api-name Publish_Test_Agent
  ```
- If it **fails**: Record the EXACT error message. What does it say?

### Step 5: Attempt to publish WITHOUT prior deploy

If Step 4 succeeded, we need to delete the test agent from the org
first so we test publish from a clean slate:
```
sf project delete source --metadata Agent:Publish_Test_Agent --json --no-prompt
```

**After deleting from the org, verify the local AAB files still exist:**
```
ls force-app/main/default/aiAuthoringBundles/Publish_Test_Agent/
```
If the delete command removed local files, re-generate the AAB
(repeat Steps 1-2) before proceeding.

**IMPORTANT**: This step tests `sf agent publish authoring-bundle`
specifically. Do NOT substitute `sf project deploy start`.

Now attempt publish on a fresh AAB with no org state:
```
sf agent publish authoring-bundle --api-name Publish_Test_Agent --json
```

Record: Does it succeed or fail?
- If it **succeeds**: The publish command handles initial deploy
  internally. Record the output, then check what metadata was created.
- If it **fails**: Record the EXACT error message. Does it say
  the agent must be deployed first? Does it give a different error?

### Step 6: If publish succeeded, inspect the results

```
sf project retrieve start --metadata Agent:Publish_Test_Agent --json
```

Note: This retrieve will set `<target>` in `bundle-meta.xml` if
publish created a published version. This is expected behavior
(per RQ3 findings) — not an error.

Check what was created:
```
ls force-app/main/default/bots/Publish_Test_Agent/ 2>/dev/null
ls force-app/main/default/genAiPlannerBundles/ 2>/dev/null | grep Publish
ls force-app/main/default/aiAuthoringBundles/ | grep Publish
```

Read the `bundle-meta.xml`:
```
cat force-app/main/default/aiAuthoringBundles/Publish_Test_Agent/Publish_Test_Agent.bundle-meta.xml
```

### Step 7: Clean up — delete the test agent from the org

```
sf project delete source --metadata AiAuthoringBundle:Publish_Test_Agent --json --no-prompt
```

If that doesn't clean up everything:
```
sf project delete source --metadata Agent:Publish_Test_Agent --json --no-prompt
```

### Step 8: Clean up — remove local files

Remove the generated directories:
```
rm -rf force-app/main/default/aiAuthoringBundles/Publish_Test_Agent
rm -rf force-app/main/default/bots/Publish_Test_Agent
rm -rf force-app/main/default/genAiPlannerBundles/Publish_Test_Agent*
```

Verify clean state:
```
git status
```

## What to Record

For each step, capture:
1. The exact command run
2. The full JSON output
3. Success/failure status
4. Any error messages — capture the EXACT text. If any error message
   is vague or misleading (e.g., "Internal Error, try again later"),
   flag it explicitly. We are maintaining an inventory of bad error
   messages for the engineering team.

## Expected Outcome

For Step 4 (`sf project deploy start` on fresh AAB):
- **A**: Deploy succeeds, creates DRAFT V1 → confirms Vivek's experience, deploy works independently
- **B**: Deploy fails → record exact error, investigate why

For Step 5 (`sf agent publish` without prior deploy):
- **C**: Publish-without-deploy works → publish handles initial deploy internally
- **D**: Publish-without-deploy fails with clear error → skill must document
- **E**: Publish-without-deploy fails with confusing error → add to Bad Error Message Inventory
