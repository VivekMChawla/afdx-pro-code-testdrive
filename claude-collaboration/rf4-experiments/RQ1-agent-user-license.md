# RQ1: Which license types qualify for `default_agent_user`?

## Context

When deploying an `AiAuthoringBundle` to a Salesforce org, the Agent
Script `default_agent_user` field must reference a valid agent user.
We need to determine which Salesforce license types qualify.

## Project Location

This experiment uses the project at the current working directory.
The agent we're testing with is `Local_Info_Agent` located at
`force-app/main/default/aiAuthoringBundles/Local_Info_Agent/`.

The current `default_agent_user` value in `Local_Info_Agent.agent` is:
```
default_agent_user: "afdx-agent@testdrive.org05e7916a-ce7e-4015-b412-20ce15bdc091"
```

## Hypothesis

Only users with a specific Agentforce-related license type (not a
standard Salesforce license) can be used as the `default_agent_user`.

## Experiment Steps

### Step 1: Identify available users and their license types

Run:
```
sf data query --query "SELECT Id, Username, Profile.Name, Profile.UserLicense.Name FROM User WHERE IsActive = true" --json
```

Record the output. Identify:
- Users with standard Salesforce licenses (e.g., "Salesforce", "Salesforce Platform")
- Users with Agentforce-specific licenses (look for license names containing "Agent", "Einstein", "Copilot", or similar)
- The current agent user (`afdx-agent@testdrive.org...`) and its license type

### Step 2: Test with the current (known-working) agent user

Verify the baseline works. Deploy the AAB as-is:
```
sf project deploy start --source-dir force-app/main/default/aiAuthoringBundles/Local_Info_Agent --json
```

Record: success or failure, and any error messages.

### Step 3: Test with a SysAdmin user (standard Salesforce license)

Modify `Local_Info_Agent.agent` line 11 to change `default_agent_user`
to a SysAdmin user with a standard Salesforce license (identified in
Step 1). Then deploy:
```
sf project deploy start --source-dir force-app/main/default/aiAuthoringBundles/Local_Info_Agent --json
```

Record: success or failure, and the exact error message if it fails.

### Step 4: Restore the original agent user

After testing, restore `default_agent_user` to its original value:
```
default_agent_user: "afdx-agent@testdrive.org05e7916a-ce7e-4015-b412-20ce15bdc091"
```

## What to Record

For each step, capture:
1. The exact command run
2. The full JSON output (or relevant portions if very long)
3. Success/failure status
4. Any error messages — capture the EXACT text

## Expected Outcome

One of:
- **A**: Only Agentforce-licensed users work → skill must document license requirement
- **B**: Standard Salesforce-licensed SysAdmin users also work → skill can simplify guidance
- **C**: Any active user works → minimal guidance needed

---

## Experiment Results

**Date**: 2026-02-19
**Target Org**: Default scratch org (`test-gq5ju8yg9kzx@example.com`)
**Approach**: Used `sf agent publish authoring-bundle` instead of `sf project deploy start` because deploy requires a pre-existing BotVersion in the org, while publish handles the full lifecycle (validate → compile → create Bot/BotVersion → deploy).

### Step 1: User Inventory

```
sf data query --query "SELECT Id, Username, Profile.Name, Profile.UserLicense.Name FROM User WHERE IsActive = true" --json
```

| Username | Profile | License Type |
|----------|---------|-------------|
| `test-gq5ju8yg9kzx@example.com` | System Administrator | **Salesforce** |
| `afdx-agent@testdrive.org05e7916a-ce7e-4015-b412-20ce15bdc091` | Einstein Agent User | **Einstein Agent** |
| `integration@00ddl00000d5bf52an.com` | Analytics Cloud Integration User | Analytics Cloud Integration User |
| `insightssecurity@00ddl00000d5bf52an.com` | Analytics Cloud Security User | Analytics Cloud Integration User |
| `chatty...@chatter.salesforce.com` | Chatter Free User | Chatter Free |
| (3 system users with null Profile) | — | — |

**Test candidates identified:**
- Einstein Agent user: `afdx-agent@testdrive.org05e7916a-ce7e-4015-b412-20ce15bdc091`
- Salesforce-licensed SysAdmin: `test-gq5ju8yg9kzx@example.com`

### Step 2: Baseline — Einstein Agent license user (existing agent)

```
sf agent publish authoring-bundle --api-name Local_Info_Agent --json
```

**Result: SUCCESS**

```json
{
  "status": 0,
  "result": {
    "success": true,
    "botDeveloperName": "Local_Info_Agent"
  }
}
```

### Step 3a: Change `default_agent_user` on existing published agent to SysAdmin

Changed `Local_Info_Agent.agent` line 11 to `default_agent_user: "test-gq5ju8yg9kzx@example.com"`, then published.

```
sf agent publish authoring-bundle --api-name Local_Info_Agent --json
```

**Result: FAILED** — User mismatch error (not license-related)

```
"Default Agent user [005DL00000JbL1S] does not match the existing Default Agent user [005DL00000JbLoZ]"
```

**Finding**: The platform prevents changing `default_agent_user` on an already-published agent. This is a separate constraint from license type and prevented a direct comparison on the same agent. Pivoted to creating fresh test agents.

### Step 3b: New agent with SysAdmin user (Salesforce license)

Created minimal `License_Test_Agent` with `default_agent_user: "test-gq5ju8yg9kzx@example.com"`. Validated syntax first:

```
sf agent validate authoring-bundle --api-name License_Test_Agent --json
```

**Validation: PASSED** (confirms Agent Script syntax is valid)

```
sf agent publish authoring-bundle --api-name License_Test_Agent --json
```

**Result: FAILED** — "Internal Error, try again later"

```json
{
  "name": "Error",
  "message": "Failed to publish agent with the following errors:\nInternal Error, try again later",
  "exitCode": 2,
  "context": "AgentPublishAuthoringBundle"
}
```

**Reproduced 3 times** across 2 different agents (`License_Test_Agent` and `License_Test_Agent_2`). All consistently failed with the same "Internal Error" message.

### Step 3c: Control — same new agent with Einstein Agent user

Changed `License_Test_Agent` to use `default_agent_user: "afdx-agent@testdrive.org05e7916a-ce7e-4015-b412-20ce15bdc091"`, then published.

```
sf agent publish authoring-bundle --api-name License_Test_Agent --json
```

**Result: SUCCESS**

```json
{
  "status": 0,
  "result": {
    "success": true,
    "botDeveloperName": "License_Test_Agent"
  }
}
```

### Step 4: Restore and clean up

- Restored `Local_Info_Agent.agent` to original `default_agent_user` value
- Removed test agent directories (`License_Test_Agent`, `License_Test_Agent_2`)
- Removed retrieved test metadata (`bots/License_Test_Agent`, `genAiPlannerBundles/License_Test_Agent_v1`)

---

## Summary of Results

| Test | User License | Agent State | Result |
|------|-------------|-------------|--------|
| Publish existing agent | Einstein Agent | Published | **SUCCESS** |
| Change user on existing agent | Salesforce (SysAdmin) | Published | **FAIL** — user mismatch |
| Publish new agent | Salesforce (SysAdmin) | Never published | **FAIL** — Internal Error |
| Publish new agent (control) | Einstein Agent | Never published | **SUCCESS** |

## Conclusion: **Outcome A** — Only Einstein Agent-licensed users qualify

The `default_agent_user` field requires a user with the **"Einstein Agent"** license type (profile: "Einstein Agent User"). Standard "Salesforce"-licensed users — even with System Administrator privileges — cannot be used.

### Additional Findings

1. **The error for invalid license is misleading.** The platform returns a generic `"Internal Error, try again later"` instead of a descriptive license-related error. This is a significant DX issue that should be reported to the Copilot Runtime & Gateway team.

2. **`default_agent_user` is immutable after first publish.** Attempting to change it returns: `"Default Agent user [X] does not match the existing Default Agent user [Y]"`. This means the agent user is permanently bound at first publish.

3. **`sf agent validate` does NOT validate `default_agent_user`.** Validation only checks Agent Script syntax/compilation. User validity is only checked during `sf agent publish`, at the publish step (not the compile step).

4. **`sf project deploy start` cannot test this independently** because deploying an AAB requires a pre-existing BotVersion in the org. `sf agent publish` is the correct command for the full agent lifecycle, including initial creation.

### Implications for Tooling/Skills

- Skills and documentation **must** instruct users to create an Einstein Agent-licensed user before authoring agents.
- AI coding assistants should query for Einstein Agent-licensed users when setting `default_agent_user`, not just any active user.
- The immutability of `default_agent_user` after publish means getting this right on the first publish is critical.
