# RQ4: Can you publish an AAB that has never been manually deployed?

## Context

We know that `sf agent publish authoring-bundle` deploys the AAB to
the org as part of the publish process. But does this work for a
brand-new AAB that has never existed in the org, or does the org need
to have a pre-existing draft?

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

Record: What files were created? Where?

### Step 2: Add minimal content to the agent

The generated `.agent` file will have boilerplate. Make sure it has:
- A valid `default_agent_user` (copy from `Local_Info_Agent.agent`):
  `"afdx-agent@testdrive.org05e7916a-ce7e-4015-b412-20ce15bdc091"`
- At least one topic with minimal content (no actions needed — we
  just need it to be a valid Agent Script file that can pass validation)

A minimal agent might look like:
```yaml
system:
    agent_label: "Publish Test Agent"
    developer_name: "Publish_Test_Agent"
    role: "You are a test agent."
    company: "Test Company"

config:
    default_agent_user: "afdx-agent@testdrive.org05e7916a-ce7e-4015-b412-20ce15bdc091"

start_agent:
    instructions: ->
        | Greet the user.

topics:
    greeting:
        description: "Handles greetings"
        instructions: ->
            | Say hello to the user.
```

### Step 3: Validate the agent locally

```
sf agent validate authoring-bundle --api-name Publish_Test_Agent --json
```

Record: Does validation pass? If not, fix issues and retry.

### Step 4: Test `sf project deploy start` on a fresh AAB (no prior org state)

**IMPORTANT**: This step explicitly tests whether `sf project deploy start`
works for an AAB that has never been in the org. Do NOT skip this step
or substitute `sf agent publish`. We need direct evidence.

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

### Step 5: Attempt to publish WITHOUT prior deploy (if Step 4 failed)

If Step 4 succeeded, delete the test agent from the org first so we
test publish from a clean slate:
```
sf project delete source --metadata Agent:Publish_Test_Agent --json --no-prompt
```

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
4. Any error messages — capture the EXACT text

## Expected Outcome

For Step 4 (`sf project deploy start` on fresh AAB):
- **A**: Deploy succeeds, creates DRAFT V1 → confirms Vivek's experience, deploy works independently
- **B**: Deploy fails → record exact error, investigate why

For Step 5 (`sf agent publish` without prior deploy):
- **C**: Publish-without-deploy works → publish handles initial deploy internally
- **D**: Publish-without-deploy fails with clear error → skill must document
- **E**: Publish-without-deploy fails with confusing error → add to Bad Error Message Inventory
