# RQ2: How deep is deploy validation of backing logic?

## Context

Deploying an `AiAuthoringBundle` fails when backing logic (Apex classes,
Flows) referenced by actions is invalid or missing. We need to determine
whether validation checks only referential integrity (does the class
exist?) or also validates method/property signatures.

## Project Location

This experiment uses the project at the current working directory.
The agent `Local_Info_Agent` references two backing components:
- `apex://CheckWeather` (Apex class)
- `flow://Get_Resort_Hours` (Flow)

The Apex class is at `force-app/main/default/classes/CheckWeather.cls`.

## Experiment Steps

### Step 1: Baseline — deploy with correct backing logic

Ensure the current state works. Deploy backing code and AAB together:
```
sf project deploy start --source-dir force-app --json
```

Record: success/failure.

### Step 2: Test with non-existent class reference

Create a temporary copy of `Local_Info_Agent.agent`. In the copy,
change the action target from `apex://CheckWeather` to
`apex://NonExistentClass` (a class that does not exist in the org).

Deploy ONLY the AAB (not the classes):
```
sf project deploy start --source-dir force-app/main/default/aiAuthoringBundles/Local_Info_Agent --json
```

Record: the exact error message. Does it mention the missing class?
What does it say?

### Step 3: Test with existing class but wrong method signature

Create a minimal Apex class that exists but has the WRONG method
signature. For example, create a file
`force-app/main/default/classes/WrongSignature.cls`:
```apex
public class WrongSignature {
    // Deliberately wrong — no @InvocableMethod, wrong parameters
    public static String doSomething() {
        return 'hello';
    }
}
```
And its meta file `WrongSignature.cls-meta.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>65.0</apiVersion>
    <status>Active</status>
</ApexClass>
```

Deploy the class first:
```
sf project deploy start --source-dir force-app/main/default/classes/WrongSignature.cls force-app/main/default/classes/WrongSignature.cls-meta.xml --json
```

Then modify `Local_Info_Agent.agent` to reference
`apex://WrongSignature` instead of `apex://CheckWeather`. Deploy the
AAB:
```
sf project deploy start --source-dir force-app/main/default/aiAuthoringBundles/Local_Info_Agent --json
```

Record: Does deployment succeed or fail? If it fails, what's the
error message? Does it mention the method signature?

### Step 4: Clean up

- Restore `Local_Info_Agent.agent` to its original state
- Delete the `WrongSignature` class from the org:
  ```
  sf project delete source --source-dir force-app/main/default/classes/WrongSignature.cls --json --no-prompt
  ```
- Remove the local `WrongSignature.cls` and `WrongSignature.cls-meta.xml` files

## What to Record

For each step, capture:
1. The exact command run
2. The full JSON output (or relevant error portions)
3. Success/failure status
4. The EXACT error message text

## Expected Outcome

One of:
- **A**: Only referential integrity (class exists) → skill can advise deploying stub classes
- **B**: Also validates method signatures → skill must advise deploying fully implemented classes
- **C**: Validates even deeper (parameter types, return types) → skill needs detailed guidance
