# RQ2: How deep is deploy validation of backing logic?

## Context

Deploying an `AiAuthoringBundle` fails when backing logic (Apex classes,
Flows) referenced by actions is invalid or missing. We need to determine
whether validation checks only referential integrity (does the class
exist?) or also validates method/property signatures.

**Key context from RQ1 findings:**
- `sf agent validate authoring-bundle` only checks Agent Script
  syntax/compilation. It does NOT validate backing logic references.
- Deploy-time validation is a separate, deeper layer. This experiment
  specifically tests how deep deploy-time validation goes.
- **IMPORTANT: This experiment tests `sf project deploy start`
  specifically. Do NOT substitute `sf agent publish` for any deploy
  step. They are different operations with different validation
  behavior.**

## Project Location

This experiment uses the project at the current working directory.
The agent `Local_Info_Agent` references two backing components:
- `apex://CheckWeather` (Apex class)
- `flow://Get_Resort_Hours` (Flow)

The Apex class is at `force-app/main/default/classes/CheckWeather.cls`.

## Experiment Steps

### Step 1: Baseline — deploy AAB with correct backing logic

Ensure the current AAB deploys successfully. Deploy ONLY the AAB
directory (not the entire `force-app` — the project contains other
unrelated metadata that could interfere):
```
sf project deploy start --source-dir force-app/main/default/aiAuthoringBundles/Local_Info_Agent --json
```

This assumes backing code (`CheckWeather`, `Get_Resort_Hours`) is
already deployed to the org. If this step fails because backing code
is missing, deploy the backing code first:
```
sf project deploy start --source-dir force-app/main/default/classes/CheckWeather.cls force-app/main/default/classes/CheckWeather.cls-meta.xml --json
```
Then retry the AAB deploy above.

Record: success/failure.

### Step 2a: Test with non-existent Apex class reference

Create a temporary copy of `Local_Info_Agent.agent`. In the copy,
change the action target from `apex://CheckWeather` to
`apex://NonExistentClass` (a class that does not exist in the org).

Deploy ONLY the AAB (not the classes):
```
sf project deploy start --source-dir force-app/main/default/aiAuthoringBundles/Local_Info_Agent --json
```

Record: the exact error message. Does it mention the missing class?
What does it say?

**Restore `Local_Info_Agent.agent` to its original state before
proceeding to Step 2b.**

### Step 2b: Test with non-existent Flow reference

In a temporary copy of `Local_Info_Agent.agent`, change the action
target from `flow://Get_Resort_Hours` to `flow://NonExistentFlow`
(a Flow that does not exist in the org).

Deploy ONLY the AAB:
```
sf project deploy start --source-dir force-app/main/default/aiAuthoringBundles/Local_Info_Agent --json
```

Record: the exact error message. Does it mention the missing Flow?
Is the error format the same as Step 2a, or different?

**Restore `Local_Info_Agent.agent` to its original state before
proceeding to Step 3.**

### Step 3: Test with existing class but wrong method signature

Create a minimal Apex class that exists but has the WRONG method
signature. Create a file
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
4. The EXACT error message text — if any error message is vague or
   misleading (e.g., "Internal Error, try again later"), flag it
   explicitly. We are maintaining an inventory of bad error messages
   for the engineering team.

## Expected Outcome

One of:
- **A**: Only referential integrity (class exists) → skill can advise deploying stub classes
- **B**: Also validates method signatures → skill must advise deploying fully implemented classes
- **C**: Validates even deeper (parameter types, return types) → skill needs detailed guidance

---

## Results (2026-02-19)

### Step 1: Baseline — deploy AAB with correct backing logic

**Command:**
```
sf project deploy start --source-dir force-app/main/default/aiAuthoringBundles/Local_Info_Agent --json
```

**Result: SUCCESS**

- Status: `Succeeded`
- Components deployed: 1 (AiAuthoringBundle: Local_Info_Agent)
- Component errors: 0
- Deploy ID: `0AfDL00003C8JEU0A3`
- Note: Received a warning about SourceMember polling timeout, but the deploy itself succeeded.

---

### Step 2a: Test with non-existent Apex class reference

**Modification:** Changed `target: "apex://CheckWeather"` → `target: "apex://NonExistentClass"` (line 127)

**Command:**
```
sf project deploy start --source-dir force-app/main/default/aiAuthoringBundles/Local_Info_Agent --json
```

**Result: FAILED**

- Status: `Failed`
- Error line number: **127** (correct — the `target:` line)
- Error component: `Local_Info_Agent_4.agent` (server-side versioned name)
- **Exact error message:**
  > `We couldn't find the flow, prompt, or apex class: apex://NonExistentClass. Verify the name and ensure it exists.`
- Deploy ID: `0AfDL00003C8JE60AN`

**Observations:**
- Error correctly identifies the missing reference with full URI (`apex://NonExistentClass`)
- Error includes correct line number (127)
- The server-side filename `Local_Info_Agent_4.agent` differs from the local filename, which could confuse developers
- CLI warning: `"AiAuthoringBundle, Local_Info_Agent_4.agent, returned from org, but not found in the local project"`

---

### Step 2b: Test with non-existent Flow reference

**Modification:** Changed `target: "flow://Get_Resort_Hours"` → `target: "flow://NonExistentFlow"` (line 240)

**Command:**
```
sf project deploy start --source-dir force-app/main/default/aiAuthoringBundles/Local_Info_Agent --json
```

**Result: FAILED**

- Status: `Failed`
- Error line number: **240** (correct — the flow `target:` line)
- Error component: `Local_Info_Agent_4.agent`
- **Exact error message:**
  > `We couldn't find the flow, prompt, or apex class: flow://NonExistentFlow. Verify the name and ensure it exists.`
- Deploy ID: `0AfDL00003C8JEZ0A3`

**Observations:**
- **Identical error format** to Step 2a — same template, different target URI
- Consistent validation behavior across Apex and Flow references

---

### Step 3: Test with existing class but wrong method signature

**Setup:**
1. Created `WrongSignature.cls` — a plain Apex class with NO `@InvocableMethod` annotation:
   ```apex
   public class WrongSignature {
       public static String doSomething() {
           return 'hello';
       }
   }
   ```
2. Deployed `WrongSignature` to org — **deploy succeeded** (class exists in org, ID: `01pDL00000tZYGxYAO`)
3. Modified agent: `target: "apex://CheckWeather"` → `target: "apex://WrongSignature"`

**Command:**
```
sf project deploy start --source-dir force-app/main/default/aiAuthoringBundles/Local_Info_Agent --json
```

**Result: FAILED**

- Status: `Failed`
- Error line number: **127**
- Error component: `Local_Info_Agent_4.agent`
- **Exact error message:**
  > `We couldn't find the flow, prompt, or apex class: apex://WrongSignature. Verify the name and ensure it exists.`
- Deploy ID: `0AfDL00003C8JEj0AN`

**KEY FINDING: The class WrongSignature EXISTS in the org (confirmed
by successful deploy in the setup step), yet the error message says
"we couldn't find" it. This means deploy validation goes DEEPER than
simple referential integrity — it requires the class to have the
correct structure (specifically, an `@InvocableMethod` annotation).**

**BAD ERROR MESSAGE FLAG:** The error message is **misleading**. It
uses the exact same "couldn't find" wording whether the class truly
doesn't exist (Step 2a) or exists but lacks `@InvocableMethod`
(Step 3). A developer seeing this error for `WrongSignature` would
reasonably conclude the class isn't deployed, wasting time
investigating a non-issue. The error should differentiate between:
- Class does not exist → "couldn't find"
- Class exists but lacks @InvocableMethod → "found the class but it
  does not have an @InvocableMethod-annotated method"

---

### Step 4: Clean up

- Agent file restored to original state (verified: `apex://CheckWeather` and `flow://Get_Resort_Hours` targets confirmed)
- `WrongSignature` class deleted from org via `sf project delete source` (success)
- Local `WrongSignature.cls` and `WrongSignature.cls-meta.xml` removed (handled by `delete source` command)

---

## Follow-Up Experiments (2026-02-19)

Steps 3b–3e use a duplicate of `CheckWeather` (`CheckWeatherDupe`)
to isolate what deploy validation actually checks.

### Step 3b: Exact duplicate of CheckWeather (control)

**Purpose:** Rule out permission/access issues as the cause of Step 3 failure.

**Setup:** Created `CheckWeatherDupe` — identical to `CheckWeather`
(same `@InvocableMethod`, same inner classes, same variable names).
Deployed class, then pointed AAB at `apex://CheckWeatherDupe`.

**Result: SUCCESS** — AAB deployed without errors. Confirms the
Step 3 failure was not a permissions issue. Any newly-created class
with `@InvocableMethod` works.

---

### Step 3c: Wrong invocable variable names

**Purpose:** Test if deploy validates that `@InvocableVariable` names
match the AAB's `inputs:` and `outputs:` definitions.

**Setup:** Mutated `CheckWeatherDupe` to use completely different
variable names:
- Input: `wrongInputName` (AAB expects `dateToCheck`)
- Outputs: `wrongOutputAlpha`, `wrongOutputBeta`, `wrongOutputGamma`
  (AAB expects `maxTemperature`, `minTemperature`, `temperatureDescription`)

Deployed mutated class, then deployed AAB.

**Result: SUCCESS** — Deploy does NOT validate parameter name matching.
The AAB deployed despite every single variable name being wrong.

---

### Step 3d: @InvocableMethod with no parameters

**Purpose:** Test the absolute minimum viable class — `@InvocableMethod`
annotation on a void method with zero parameters.

**Setup:** Mutated `CheckWeatherDupe` to:
```apex
public with sharing class CheckWeatherDupe {
    @InvocableMethod(
        label='Check Weather Dupe'
        description='Minimal invocable method with no parameters'
    )
    public static void doNothing() {
        // No parameters, no return value
    }
}
```

Deployed class, then deployed AAB.

**Result: SUCCESS** — Even `void` return with zero parameters passes.
Only the `@InvocableMethod` annotation matters.

---

### Step 3e: @InvocableMethod with wrong return type

**Purpose:** Test with incompatible return/input types
(`List<String>` instead of typed wrapper classes).

**Setup:** Mutated `CheckWeatherDupe` to:
```apex
public with sharing class CheckWeatherDupe {
    @InvocableMethod(...)
    public static List<String> getWeather(List<String> inputs) {
        return new List<String>{ 'hello' };
    }
}
```

Deployed class, then deployed AAB.

**Result: SUCCESS** — Deploy does not validate return types or
parameter types against the AAB definition.

---

### Step 3f: Repro — remove @InvocableMethod from CheckWeatherDupe

**Purpose:** Definitively confirm that removing `@InvocableMethod` from
a class that previously worked causes the AAB deploy to fail.

**Setup:**
1. At this point, `CheckWeatherDupe` was deployed with `@InvocableMethod`
   and AAB was successfully deploying against it (Steps 3b–3e).
2. Pointed AAB at `apex://CheckWeatherDupe`
3. Stripped `@InvocableMethod` from `CheckWeatherDupe`:
   ```apex
   public with sharing class CheckWeatherDupe {
       // NO @InvocableMethod annotation
       public static List<String> getWeather(List<String> inputs) {
           return new List<String>{ 'hello' };
       }
   }
   ```
4. Deployed the modified class (succeeded — class is valid Apex)
5. Deployed the AAB

**Result: FAILED**

- **Exact error message:**
  > `We couldn't find the flow, prompt, or apex class: apex://CheckWeatherDupe. Verify the name and ensure it exists.`
- Line number: 127

**This is the definitive proof.** Same class name, same org,
same AAB — the ONLY change was removing `@InvocableMethod`.
The failure is 100% reproducible and caused specifically by
the absence of the `@InvocableMethod` annotation.

---

### Bonus finding: Authoring Bundle Version Content Dependency

During cleanup, attempting to delete `CheckWeatherDupe` from the
org while the AAB still referenced it produced:

> `This apex class is referenced elsewhere in Salesforce. Remove the
> usage and try again. : Authoring Bundle Version Content Dependency
> - 1bpDL000000CaSO.`

**Implication:** The org tracks hard dependencies between AAB
versions and their backing Apex classes. You cannot delete a backing
class while any AAB version references it. This is the expected
referential integrity enforcement at the *deletion* layer (as
opposed to the *deploy* layer we've been testing).

To clean up, we had to first redeploy the AAB pointing back to
`CheckWeather`, which broke the dependency, then delete `CheckWeatherDupe`.

---

## Conclusion

**Answer: B-minus — Validation checks `@InvocableMethod` annotation
presence but NOTHING else about the method signature.**

Deploy validation checks:
1. The referenced class/flow/prompt **exists** in the org
2. For Apex classes, the class has an **`@InvocableMethod`-annotated
   method** (not just that the class exists)

Deploy validation does **NOT** check:
- Input/output variable names (Step 3c)
- Whether the method has any parameters at all (Step 3d)
- Parameter or return types (Step 3e)

This means the validation is essentially: "Is there a registered
Invocable Action with this name?" — not a structural contract check.

However, the error reporting conflates both failure modes into a
single "couldn't find" message, making it impossible for developers
to distinguish between a truly missing class and a class with the
wrong structure.

### Practical implications for AFDX tooling:

- **Stub classes WILL work** — but only if they include
  `@InvocableMethod`. A minimal stub like this is sufficient to
  unblock AAB deployment:
  ```apex
  public class MyStubAction {
      @InvocableMethod(label='Stub' description='Stub for AAB deploy')
      public static void stub() {}
  }
  ```
- **Parameter/type mismatches are NOT caught at deploy time.** This
  means a developer could deploy an AAB with mismatched I/O
  definitions and only discover the problem at runtime (during
  preview or conversation). The skill should warn about this gap.
- **Error message inventory item:** The `"We couldn't find the flow,
  prompt, or apex class"` message should be split into distinct
  messages for "not found" vs. "found but no @InvocableMethod." This
  has been flagged for the Bad Error Message Inventory (entry #3).
- **Deletion dependency:** The org enforces referential integrity
  when deleting backing classes — you must remove the AAB reference
  first. This affects cleanup workflows and should be documented.

### Additional observations:

- The server uses a versioned filename (`Local_Info_Agent_4.agent`)
  that differs from the local filename (`Local_Info_Agent.agent`),
  which triggers a CLI warning. This could confuse developers.
- Validation is consistent across Apex and Flow reference types
  (same error format)
- Line numbers in errors are accurate and point to the correct
  `target:` line
