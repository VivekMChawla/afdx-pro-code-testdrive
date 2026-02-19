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
sf data query --query "SELECT Id, Username, Profile.Name, Profile.UserLicense.Name FROM User WHERE IsActive = true" --target-org <default-org> --json
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
