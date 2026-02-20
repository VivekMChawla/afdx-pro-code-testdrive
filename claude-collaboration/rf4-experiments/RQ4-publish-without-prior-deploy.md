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

---

## Experiment Results

**Date:** 2026-02-19
**Org:** efficiency-drive-5179-dev-ed.scratch.my.salesforce.com

### Step 1 Results: Generate a fresh test agent

**Command:**
```
sf agent generate authoring-bundle --no-spec --name "Publish Test Agent" --api-name Publish_Test_Agent
```

**Result: SUCCESS**

Files created in `force-app/main/default/aiAuthoringBundles/Publish_Test_Agent/`:
- `Publish_Test_Agent.agent` — boilerplate with `default_agent_user: "NEW AGENT USER"` placeholder, 3 default topics (escalation, off_topic, ambiguous_question), linked messaging variables (EndUserId, RoutableId, ContactId, EndUserLanguage, VerifiedCustomerId)
- `Publish_Test_Agent.bundle-meta.xml` — minimal XML with just `<bundleType>AGENT</bundleType>`, no `<target>`

### Step 2 Results: Add minimal content

Edited `Publish_Test_Agent.agent` to set:
- `default_agent_user: "afdx-agent@testdrive.org05e7916a-ce7e-4015-b412-20ce15bdc091"` (from Local_Info_Agent.agent — confirmed Einstein Agent license holder)
- Kept the 3 boilerplate topics and placeholder instructions as-is (sufficient for validation)

### Step 3 Results: Validate the agent locally

**Command:**
```
sf agent validate authoring-bundle --api-name Publish_Test_Agent --json
```

**Result: SUCCESS**
```json
{
  "status": 0,
  "result": { "success": true },
  "warnings": []
}
```

Validation passed on first attempt. Confirms the boilerplate structure
with the correct agent user is syntactically valid Agent Script.

### Step 4 Results: Deploy fresh AAB with `sf project deploy start`

**Command:**
```
sf project deploy start --source-dir force-app/main/default/aiAuthoringBundles/Publish_Test_Agent --json
```

**Result: OUTCOME A — Deploy succeeded**
```json
{
  "status": 0,
  "result": {
    "status": "Succeeded",
    "success": true,
    "numberComponentsDeployed": 1,
    "numberComponentErrors": 0,
    "files": [
      {
        "fullName": "Publish_Test_Agent",
        "type": "AiAuthoringBundle",
        "state": "Created"
      }
    ]
  },
  "warnings": [
    "Polling for 1 SourceMembers timed out after 6 attempts (last 6 were empty).\n\nMissing SourceMembers:\n  - AiAuthoringBundle: Publish_Test_Agent"
  ]
}
```

**Key observations:**
- Component state was `"Created"` — confirms the AAB was newly created
  in the org (not an update to a pre-existing component).
- Source tracking warning about polling timeout — this is a source
  tracking infrastructure issue, not a deploy failure.
- Deploy ID: `0AfDL00003C8JPr0AN`

**Follow-up — Does deploy create a Bot/draft in Agent Builder?**

Ran `sf org open agent --api-name Publish_Test_Agent` to check for a
BotDefinition:
```
Error (SingleRecordQuery_NoRecords): No record found for SELECT id
FROM BotDefinition WHERE DeveloperName='Publish_Test_Agent'
```

**Finding:** `sf project deploy start` successfully deploys the
AiAuthoringBundle metadata to the org, but does NOT create a
Bot/BotDefinition entity. The AAB exists as metadata in the org, but
there is no "agent" visible in Agent Builder. Deploy and publish are
fundamentally different operations — deploy puts the AAB source in the
org; publish compiles the Agent Script and creates the full agent
entity (Bot, BotVersion, GenAiPlannerBundle, GenAiPlugins).

**Note:** The experiment instructions specified `sf org open agent`
for this check. The correct command to view NGA agents is
`sf org open authoring-bundle`, which opens the Agentforce Studio list
view. However, `sf org open authoring-bundle` does not accept an
`--api-name` flag — it opens the full agent list, so it can't
programmatically confirm the presence of a specific agent.

### Step 5 Results: Publish WITHOUT prior deploy

**Pre-step cleanup:** Deleted the deployed AAB from the org to test
publish from a clean slate:
```
sf project delete source --metadata AiAuthoringBundle:Publish_Test_Agent --json --no-prompt
```
Delete succeeded. **The delete command also removed local files** —
both `.agent` and `.bundle-meta.xml` were deleted locally (state:
`"Deleted"`). This required re-running Steps 1-2 (generate + set
agent user) before proceeding.

**Command:**
```
sf agent publish authoring-bundle --api-name Publish_Test_Agent --json
```

**Result: OUTCOME C — Publish-without-deploy succeeded**
```json
{
  "status": 0,
  "result": {
    "success": true,
    "botDeveloperName": "Publish_Test_Agent"
  },
  "warnings": []
}
```

**This is the definitive answer to RQ4: Yes, you can publish an AAB
that has never been manually deployed.** The `sf agent publish
authoring-bundle` command handles the initial deploy internally. No
prior `sf project deploy start` is needed.

### Step 6 Results: Inspect what publish created

**Retrieve attempt 1 — Agent pseudo-type:**
```
sf project retrieve start --metadata Agent:Publish_Test_Agent --json
```
Failed with `SourceConflictError: 2 conflicts detected` (Bot and
BotVersion files). Re-ran with `--ignore-conflicts`:
```
sf project retrieve start --metadata Agent:Publish_Test_Agent --json --ignore-conflicts
```

**Retrieve attempt 2 — AiAuthoringBundle specifically:**

The `Agent:` pseudo-type retrieve pulled down Bot, BotVersion,
GenAiPlannerBundle, and GenAiPlugin metadata — but did NOT include the
AiAuthoringBundle. The local `bundle-meta.xml` still showed no
`<target>`. A separate retrieve was required:
```
sf project retrieve start --metadata AiAuthoringBundle:Publish_Test_Agent --json
```

After this retrieve, `bundle-meta.xml` updated to:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<AiAuthoringBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <bundleType>AGENT</bundleType>
    <target>Publish_Test_Agent.v1</target>
</AiAuthoringBundle>
```

**Finding:** The `Agent:` pseudo-type retrieve does NOT include the
AiAuthoringBundle metadata. To see `<target>` after publish, you must
retrieve using `AiAuthoringBundle:` specifically. This is a gap in the
Agent pseudo-type — it should include the AAB in its composite
retrieve.

**Full inventory of metadata created by publish:**

| Metadata Type | Name | State |
|---|---|---|
| Bot | Publish_Test_Agent | Created |
| BotVersion | Publish_Test_Agent.v1 | Created |
| GenAiPlannerBundle | Publish_Test_Agent_v1 | Created |
| GenAiPlugin | escalation_16jDL000000Cb1a | Created |
| GenAiPlugin | topic_selector_16jDL000000Cb1a | Created |
| GenAiPlugin | off_topic_16jDL000000Cb1a | Created |
| GenAiPlugin | ambiguous_question_16jDL000000Cb1a | Created |
| AiAuthoringBundle | Publish_Test_Agent (updated with `<target>`) | Changed |

Bot details from retrieved `Publish_Test_Agent.bot-meta.xml`:
- `agentDSLEnabled: true`
- `agentType: EinsteinServiceAgent`
- `botSource: None`
- `botUser: afdx-agent@testdrive.org05e7916a-ce7e-4015-b412-20ce15bdc091`
- `type: ExternalCopilot`
- Linked context variables (ContactId, EndUserId, EndUserLanguage, RoutableId) with mappings for 7 messaging channels each

### Step 7 Results: Clean up — delete from org

**Published NGA agents CANNOT be deleted via the Metadata API.** Four
different deletion approaches were attempted, all failed with circular
dependency errors:

**Attempt 1 — Delete AiAuthoringBundle:**
```
sf project delete source --metadata AiAuthoringBundle:Publish_Test_Agent --json --no-prompt
```
```
Error: "Published bundle versions cannot be deleted. :
Authoring Bundle Definition Versions."
```

**Attempt 2 — Delete via Agent pseudo-type:**
```
sf project delete source --metadata Agent:Publish_Test_Agent --json --no-prompt
```
Two errors:
- Bot: `"setup object in use"`
- BotVersion: `"This bot version is referenced elsewhere in Salesforce.
  Remove the usage and try again. : Authoring Bundle Definition
  Version - Publish_Test_Agent_1."`

**Attempt 3 — Delete GenAiPlannerBundle:**
```
sf project delete source --metadata GenAiPlannerBundle:Publish_Test_Agent_v1 --json --no-prompt
```
```
Error: "This generative ai planner definition is referenced elsewhere
in Salesforce. Remove the usage and try again. : Generative AI
Conversation Definition Planner - 12BDL000000Caql."
```

**Circular dependency chain:**
1. AiAuthoringBundle → can't delete (published version)
2. Bot → can't delete (setup object in use)
3. BotVersion → can't delete (referenced by Authoring Bundle Definition Version)
4. GenAiPlannerBundle → can't delete (referenced by Generative AI Conversation Definition Planner)

Every component in the published agent graph references another
component. There is no Metadata API path to delete a published NGA
agent. Cleanup requires either the Salesforce Setup UI or waiting for
scratch org expiration.

### Step 8 Results: Local file cleanup

Removed all local files:
```
rm -rf force-app/main/default/aiAuthoringBundles/Publish_Test_Agent
rm -rf force-app/main/default/bots/Publish_Test_Agent
rm -rf force-app/main/default/genAiPlannerBundles/Publish_Test_Agent*
rm -rf force-app/main/default/genAiPlugins/*16jDL000000Cb1a*
```

`git status` confirmed clean state (matching pre-experiment baseline).

**Note:** The published Publish_Test_Agent remains in the scratch org
and cannot be deleted via CLI. It will be cleaned up when the org
expires.

---

## Summary of Findings

### Primary Answer: RQ4

**Yes, you can publish an AAB that has never been manually deployed.**
`sf agent publish authoring-bundle` handles the initial deploy
internally. The developer workflow does NOT require a preceding
`sf project deploy start`.

### Outcome Classification

- **Step 4:** Outcome **A** — `sf project deploy start` succeeds on
  a fresh AAB, creating the AiAuthoringBundle metadata in the org.
  However, deploy alone does NOT create a Bot entity.
- **Step 5:** Outcome **C** — `sf agent publish authoring-bundle`
  succeeds on a fresh AAB with no prior org state. Publish handles
  initial deploy + compilation + agent entity creation in one step.

### Key Insights

1. **Deploy vs. Publish are fundamentally different operations:**
   - `sf project deploy start` puts the AAB source file into the org
     as metadata. No Bot, BotVersion, or GenAiPlanner is created. The
     agent is not usable or visible in Agent Builder.
   - `sf agent publish authoring-bundle` deploys the AAB, compiles
     Agent Script to Agent DSL, and creates the full agent entity
     graph (Bot + BotVersion + GenAiPlannerBundle + GenAiPlugins). The
     agent becomes usable and visible.

2. **Publish is a self-contained operation:** No prior deploy, no
   prior org state needed. A developer can go directly from local
   Agent Script to a published, functional agent in one command.

3. **`sf project delete source` removes local files:** When deleting
   org metadata via `sf project delete source`, the command also
   deletes the corresponding local source files. This is a behavioral
   gotcha — developers who expect "delete from org only" will lose
   their local files and need to re-create them.

4. **Agent pseudo-type retrieve gap:** `Agent:` retrieve does not
   include the AiAuthoringBundle metadata. A separate
   `AiAuthoringBundle:` retrieve is needed to see the `<target>`
   element after publish.

5. **Published NGA agents cannot be deleted via Metadata API:** A
   circular reference chain between AiAuthoringBundle, Bot, BotVersion,
   GenAiPlannerBundle, and GenAiConversationDefinitionPlanner prevents
   deletion of any individual component. This has implications for
   scratch org hygiene and testing workflows.

### New Bad Error Messages (for Engineering Team Inventory)

| # | Command | Error Message | Problem |
|---|---------|---------------|---------|
| 1 | `sf project delete source --metadata AiAuthoringBundle:...` | `"Published bundle versions cannot be deleted. : Authoring Bundle Definition Versions."` | Doesn't explain HOW to delete a published agent. Doesn't mention that the entire agent graph must be deleted together, or that Setup UI is required. |
| 2 | `sf project delete source --metadata Agent:...` (Bot) | `"setup object in use"` | Extremely vague. Doesn't identify WHAT is using the Bot or how to resolve it. |
| 3 | `sf project delete source --metadata Agent:...` (BotVersion) | `"This bot version is referenced elsewhere in Salesforce. Remove the usage and try again. : Authoring Bundle Definition Version - Publish_Test_Agent_1."` | References an internal object name (`Authoring Bundle Definition Version`) that developers cannot directly interact with via CLI. No actionable guidance. |
| 4 | `sf project delete source --metadata GenAiPlannerBundle:...` | `"This generative ai planner definition is referenced elsewhere in Salesforce. Remove the usage and try again. : Generative AI Conversation Definition Planner - 12BDL000000Caql."` | References an internal object with a Salesforce ID. Developers cannot resolve this reference via CLI. |

### Implications for Developer Workflow

- **Agent creation workflow is streamlined:** Validate locally →
  publish directly. No intermediate deploy step needed.
- **Testing workflows need caution:** Published agents in scratch orgs
  cannot be deleted via CLI. Test agents will accumulate until org
  expiration. Consider using uniquely-named test agents to avoid
  name collisions.
- **DevOps/CI pipelines:** `sf agent publish authoring-bundle` is the
  correct single command for deploying agents. `sf project deploy start`
  alone is insufficient — it puts the AAB in the org but doesn't
  create a functional agent.
