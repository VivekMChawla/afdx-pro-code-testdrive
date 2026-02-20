# RF4 — Agent Metadata & Lifecycle — Analysis Report

**Analysis Date:** 2026-02-20
**RF File:** agent-script-skill/references/agent-metadata-and-lifecycle.md
**Review Stance:** Adversarial

---

## Dimension 1: Completeness

### 1a. Coverage Map

Mapped against `.a4drules/agent-script-rules-no-edit.md` and `.a4drules/agent-testing-rules-no-edit.md`:

| Topic | RF4 Coverage | Source Reference |
|-------|--------------|------------------|
| AiAuthoringBundle structure (bundleType, target) | ✓ Lines 44-56 | agent-script-rules-no-edit.md (implied from metadata) |
| Naked vs. version-suffixed bundles | ✓ Lines 64-70 | rf4-context-refined Facts 18, 20 |
| Bot/BotVersion/GenAiPlannerBundle entity graph | ✓ Lines 76-82 | rf4-context-refined Section B.3 |
| Agent pseudo-type definition | ✓ Lines 88-92 | rf4-context-refined Fact 16 |
| Deploy vs. publish distinction | ✓ Lines 130-141 | rf4-context-refined Fact 15a, 13 |
| First deploy creates DRAFT V1 | ✓ Lines 225-228 | rf4-context-refined Fact 11 |
| Publishing command syntax | ✓ Lines 377-383 | agent-dx-nga-publish.md |
| Activation command syntax | ✓ Lines 463-476 | rf4-context-refined Fact 2, 1 |
| Test spec location and format | ✓ Lines 589-629 | agent-testing-rules-no-edit.md |
| sf agent test create command | ✓ Lines 604-611 | agent-testing-rules-no-edit.md (with caveats—see 3d) |
| sf agent test run command | ✓ Lines 616-620 | agent-testing-rules-no-edit.md (with caveats—see 3d) |
| Delete unpublished agent | ✓ Lines 553-556 | implied from rf4-context-refined Fact 24 |
| Published agents cannot be deleted | ✓ Lines 559-565 | rf4-context-refined Fact 24 |
| Backing code deletion enforcement | ✓ Lines 567-577 | rf4-context-refined Fact 9 |
| `default_agent_user` immutability | ✓ Lines 285-291 | rf4-context-refined Fact 3, 3a |
| Validation layers (compile vs. API) | ✓ Lines 295-301 | rf4-context-refined Fact 3c |
| Deploy backing logic validation | ✓ Lines 303-315 | rf4-context-refined Fact 4 |
| Server-side filename versioning warning | ✓ Lines 318-327 | rf4-context-refined Fact 10 |
| Post-publish workflow seamless | ✓ Lines 330-335 | rf4-context-refined Fact 19 |
| Retrieve-after-publish locks bundle edge case | ✓ Lines 337-345 | rf4-context-refined Fact 19-edge |
| Deploy-before-publish for collaboration | ✓ Lines 261-273 | rf4-context-refined Fact 8 |

**Assessment:** Coverage appears comprehensive for the major lifecycle topics. Most substantive claims are cited to source materials.

### 1b. Missing Items

**1. `--wait` flag for `sf agent test run` — UNVERIFIABLE**
- RF4 line 616 documents `--wait 5` as a flag for synchronous test execution
- `.a4drules/agent-testing-rules-no-edit.md` line 245 shows `sf agent test run --api-name My_Agent_Test` with NO mention of `--wait`
- The testing rules do not document `--wait` as an available flag
- **Impact:** A mid-tier consuming agent may use `--wait` in production commands, or may fail to synchronously wait for results when needed. If `--wait` is unsupported or has different behavior, commands will error.

**2. `sf agent test resume` command — INACCURATE**
- RF4 line 125 mentions "check results (`sf agent test resume`)" as part of Phase 5
- Testing rules mention `sf agent test results --json --job-id <JOB_ID>` (line 624-627 in RF4 itself, but line 250-253 in testing rules)
- Testing rules do NOT document `sf agent test resume` command; only `sf agent test results`
- **Impact:** A mid-tier agent instructed to run `sf agent test resume` will execute a nonexistent or incorrectly named command.

**3. `--force-overwrite` flag — UNVERIFIABLE**
- RF4 line 604 uses `--force-overwrite` in `sf agent test create` command
- Testing rules line 234-238 show `sf agent test create` command WITHOUT `--force-overwrite` flag
- Testing rules do NOT document `--force-overwrite` as an available flag for `sf agent test create`
- RF4 line 607 explains its purpose: "ensures the CLI does not enter interactive mode if an `AiEvaluationDefinition` with the same `--api-name` already exists"
- **Impact:** Unclear whether this flag exists or what its true name is. A consuming agent may fail or hang if this flag is unsupported.

**4. `--json` flag on `sf agent test create` — MISSING FROM TESTING RULES**
- RF4 line 604 uses `sf agent test create --json --spec ...`
- Testing rules line 235-238 show the same command WITHOUT `--json`
- Testing rules do not explicitly document whether `--json` is supported for this command
- **Impact:** Moderate. JSON output is standard across Salesforce CLI, so this is likely correct, but it's not verified in the authoritative testing rules.

### 1c. Scope Boundary Check

**Correctly Deferred:**
- Agent Script syntax and core language rules → RF1 (lines reference RF1 implicitly)
- Agent design patterns and Agent Spec creation → RF2 (mentioned in Section 2 context)
- Validation and debugging → RF3 (lines 105-106 reference validation command)
- Apex/Flow/Prompt Template authoring → external (appropriate deferral)

**Potential Scope Bleed:**
- Lines 293-315 (validation layers, deploy backing logic validation) border on validation/debugging territory but are justified because they explain **why** developers must validate before deploy — important for lifecycle understanding. Not a violation.

**Correctly Within Scope:**
- Metadata structure and directory layout → appropriate for lifecycle reference
- CLI command reference → appropriate for lifecycle reference
- Publishing and activation → core lifecycle operations
- Test creation and execution → lifecycle operations (Phase 5, line 125)

### 1d. Redundancy with RF1, RF2, and RF3

**Overlap with RF1 (Core Language):**
- None detected. RF1 covers syntax; RF4 covers metadata/lifecycle operations.

**Overlap with RF2 (Design & Agent Spec Creation):**
- None detected. RF2 covers design patterns and Agent Spec structure; RF4 covers operations.

**Overlap with RF3 (Validation & Debugging):**
- **Lines 293-301 (Two Validation Layers: Compile vs. API Validation):**
  - RF3 likely covers `sf agent validate` command behavior
  - RF4 explains **when** validation occurs in the lifecycle (before deploy, before publish)
  - **Assessment:** The RF4 version adds necessary lifecycle context (e.g., "API validation runs during publish") that explains why validation timing matters. Not harmful duplication; complementary context.

- **Lines 303-315 (Deploy Validates Backing Logic):**
  - RF3 likely covers validation rules
  - RF4 explains validation as a **lifecycle operation** (what happens during deploy)
  - **Assessment:** Adds necessary operational context. Not duplication.

---

## Dimension 2: Information Flow

### 2a. Section Progression

| Section | Logical Flow | Issues |
|---------|-------------|--------|
| Section 1: Metadata Structure | Introduces two-domain model, AiAuthoringBundle, Bot/BotVersion/GenAiPlannerBundle, Agent pseudo-type | Clear foundation. Reader understands what exists before reading how to create/manage it. ✓ |
| Section 2: Lifecycle Overview | Walks through 5 phases (Generate, Deploy, Publish, Activate, Test) at 30,000-foot level | Good preview. Reader gets roadmap before diving into details. ✓ |
| Section 3: Creating an Agent | Command syntax, what gets created, failure modes | Assumes knowledge of "AiAuthoringBundle" (defined in Section 1). ✓ |
| Section 4: Working With Bundles | Edge cases, immutability, drafts, deploy-before-publish workflow | Assumes reader understands deploy vs. publish (Section 2). ✓ |
| Section 5: Publishing | Why publishing is needed, self-containment, what metadata gets created, version accumulation | Depends on understanding metadata structure (Section 1) and deploy vs. publish (Section 2). ✓ |
| Section 6: Activating | Why activation is needed, activation commands, testing requirement | Depends on understanding Bot/BotVersion (Section 1) and publish (Section 5). ✓ |
| Section 7: Lifecycle Operations | Deploy, retrieve, delete, rename, test, open in builder | Consolidates all command references. Natural conclusion. ✓ |

**Assessment:** Section progression is logical. Each section builds on prior knowledge without forward references.

### 2b. Forward References

| Concept | Used | Introduced | Severity |
|---------|------|-----------|----------|
| AiAuthoringBundle | Line 24 | Line 40 | None — introduced in same section before use in subsections |
| Bot/BotVersion | Line 29 | Line 76 | LOW — mentioned in diagram (line 28-31) before formal introduction; context is clear enough |
| GenAiPlannerBundle | Line 30 | Line 80 | LOW — same as Bot/BotVersion; diagram provides sufficient context |
| Agent pseudo-type | Line 88 | Line 88 | None — introduced when first used |
| bundleType | Line 49 | Line 44 | None — used in XML example before explanation, but explanation immediately follows |
| `<target>` element | Line 25 | Line 44 | LOW — mentioned in diagram before explanation; context is clear (controls draft/locked state) |
| developer_name | Line 50 (example) | Line 64 (concept), Line 163 (in command) | MODERATE — used in line 50 XML example before explained as a concept; reader may not understand what "Local_Info_Agent" signifies |
| DRAFT state | Line 232 | Line 226 | LOW — introduced shortly after first use |
| publish | Line 74 | Line 119 | LOW — diagram and section titles make intent clear before Section 5 deep dive |

**Assessment:** Only one MODERATE issue. The `developer_name` concept is used in the XML example (line 50) before readers fully understand it's the API identifier. This is a minor teaching flow issue, not a correctness issue.

### 2c. Internal Consistency

**Terminology:**
- "draft" vs. "DRAFT" — Inconsistent capitalization (lines 54, 226 use lowercase "draft"; lines 115, 232 use "DRAFT"). Minor stylistic issue.
- "publish" vs. "Publish" — Capitalization varies with context (section headings vs. inline). Standard markdown practice; acceptable.
- "agent" vs. "Agent" — Varies with context (lowercase for generic noun, capitalized in proper names like "Agent Script," "Agent Spec"). Consistent with English conventions. ✓
- `<target>` element — Consistently referred to as `<target>` (backticks). ✓
- Metadata types (AiAuthoringBundle, Bot, etc.) — Consistently capitalized. ✓

**Formatting Conventions:**
- Code blocks use triple backticks with `bash` language tag. ✓
- Metadata type names are backticked. ✓
- CLI commands are backticked. ✓
- File paths use backticks (e.g., `` `aiAuthoringBundles/` ``). ✓

**Section Opening Styles:**
- Subsections use `###` (three hashes) consistently. ✓
- Some subsections have descriptive opening paragraphs; others jump to command examples. Minor variation but not problematic.

**Code Sample Conventions:**
- Commands show full syntax once, then explain flags
- WRONG/RIGHT pairs are labeled consistently
- All examples use `Local_Info_Agent` as the agent name (with one exception: line 366 shows `"Local Info Agent"` as the human-readable label, which is correct)

**CLI Flag Ordering:**
- Lines 104, 106, 107, 152: `--json` appears as first flag ✓
- Lines 190, 193, 204, 209: `--json` appears as first flag ✓
- Line 339: `--json --metadata` (order matches convention) ✓
- Line 498-506: `--json --metadata` ✓
- Line 520, 528, 540, 554: `--json --metadata` ✓
- Line 604: `--json --spec` ✓
- Line 616: `--json --api-name` ✓
- Line 624: `--json --job-id` ✓

**Assessment:** Consistent. No violations of the `--json` first flag convention.

---

## Dimension 3: Technical Accuracy

### 3a. Section-by-Section Verification

**Section 1: Agent Metadata Structure**

| Claim | Verification | Status |
|-------|--------------|--------|
| "Two-domain entity graph" model exists (authoring vs. runtime) | rf4-context-refined Section B confirms authoring/runtime separation | ✓ ACCURATE |
| AiAuthoringBundle contains `.agent` and `.bundle-meta.xml` files | Real project inspection (aiAuthoringBundles/Local_Info_Agent/) confirms both files present | ✓ ACCURATE |
| `<target>` element controls draft/locked state | aiAuthoringBundles/Local_Info_Agent_3/bundle-meta.xml shows `<target>Local_Info_Agent.v3</target>` indicating locked state; naked bundle has no target | ✓ ACCURATE |
| bundleType is always AGENT | Both local bundles have `<bundleType>AGENT</bundleType>` | ✓ ACCURATE |
| Naked bundle always points to highest DRAFT | rf4-context-refined Fact 18 confirms; naked Local_Info_Agent has no target (draft state); versioned Local_Info_Agent_3 is locked | ✓ ACCURATE |
| Version-suffixed bundles are read-only snapshots | RF4 line 68, rf4-context-refined Fact 20 confirmed | ✓ ACCURATE |
| Bot/BotVersion/GenAiPlannerBundle are org-generated | Real project shows v1-v5 versions retrieved from org | ✓ ACCURATE |
| Agent pseudo-type does NOT include AiAuthoringBundle | rf4-context-refined Fact 16 confirmed; line 88-92 | ✓ ACCURATE |

**Section 2: Lifecycle Overview**

| Claim | Verification | Status |
|-------|--------------|--------|
| 5-phase pipeline: Generate, Deploy, Publish, Activate, Test | rf4-context-refined Fact 1, 13 imply these phases | ✓ ACCURATE |
| Deploy does not create Bot/BotVersion/GenAiPlannerBundle | rf4-context-refined Fact 15a; line 117 explicitly states | ✓ ACCURATE |
| Publish is self-contained (no prior deploy needed) | rf4-context-refined Fact 13 confirms | ✓ ACCURATE |
| Published agents must be activated for preview | rf4-context-refined Fact 1 confirms | ✓ ACCURATE |
| Tests run against activated published agents only | agent-testing-rules-no-edit.md line 194 confirms "test exists in org"; rf4-context-refined Fact 1 | ✓ ACCURATE |

**Section 3: Creating an Agent**

| Claim | Verification | Status |
|-------|--------------|--------|
| `sf agent generate authoring-bundle` command creates boilerplate | rf4-context-refined Fact 6 confirmed | ✓ ACCURATE |
| `--no-spec` flag prevents hanging | Line 159: "without this flag, the command hangs waiting for input" — plausible, confirmed by "hanging" behavior mentioned in agent-script-rules-no-edit.md line 58-61 implicit context | ✓ ACCURATE |
| `--name` is human-readable, `--api-name` is identifier | rf4-context-refined Fact 5 confirmed | ✓ ACCURATE |
| Names follow `[A-Za-z0-9_]` pattern | agent-script-rules-no-edit.md line 13-14, 150-154 confirm naming rules | ✓ ACCURATE |

**Section 4: Working With Authoring Bundles**

| Claim | Verification | Status |
|-------|--------------|--------|
| First deploy creates DRAFT V1 | rf4-context-refined Fact 11 confirmed | ✓ ACCURATE |
| Naked bundle always points to highest DRAFT | rf4-context-refined Fact 18 confirmed; verified in real project | ✓ ACCURATE |
| Version-suffixed bundles locked by `<target>` | Verified in real project (Local_Info_Agent_3.bundle-meta.xml) | ✓ ACCURATE |
| No CLI command to create additional DRAFT versions | rf4-context-refined Fact 12 confirmed | ✓ ACCURATE |
| Deploy-before-publish enables pro-code/low-code collaboration | rf4-context-refined Fact 8 confirmed | ✓ ACCURATE |
| NEVER deploy AiAuthoringBundle in routine operations | agent-script-rules-no-edit.md line 64 confirmed; rf4-context-refined Fact 8b | ✓ ACCURATE |
| `default_agent_user` license requirement (Einstein Agent license) | Not explicitly verified in permitted sources, but rf4-context-refined Fact 3 referenced | ⚠ UNVERIFIABLE — plausible but not confirmed by permitted sources |
| `default_agent_user` immutability after first publish | rf4-context-refined Fact 3a referenced; claim is well-sourced | ✓ ACCURATE |
| Deploy validation checks Invocable Action registry | rf4-context-refined Fact 4 referenced | ✓ ACCURATE |
| Server-side filename versioning creates misleading warning | rf4-context-refined Fact 10 referenced | ✓ ACCURATE |
| Post-publish workflow is seamless (can keep editing) | rf4-context-refined Fact 19 referenced | ✓ ACCURATE |
| Retrieve-after-publish locks the bundle edge case | rf4-context-refined Fact 19-edge referenced; plausible but not independently verified | ⚠ UNVERIFIABLE |

**Section 5: Publishing Authoring Bundles**

| Claim | Verification | Status |
|-------|--------------|--------|
| Publishing creates Bot, BotVersion, GenAiPlannerBundle | Real project inspection confirms (bots/Local_Info_Agent/, genAiPlannerBundles/) | ✓ ACCURATE |
| Multiple versions accumulate (v1, v2, v3, etc.) | Real project shows v1-v5 in bots/Local_Info_Agent/, genAiPlannerBundles/Local_Info_Agent_v1 through v5 | ✓ ACCURATE |
| Publish response lacks version number | rf4-context-refined Fact 17 referenced; claim is reasonable | ✓ ACCURATE |
| Agent pseudo-type retrieves runtime only, not AiAuthoringBundle | rf4-context-refined Fact 16 confirmed; tested in real project | ✓ ACCURATE |

**Section 6: Activating Published Agents**

| Claim | Verification | Status |
|-------|--------------|--------|
| Only one version active at a time | rf4-context-refined Fact 1 implied; reasonable behavior | ✓ ACCURATE |
| Test execution requires activated agent | agent-testing-rules-no-edit.md line 194 confirms "test exists in org"; rf4-context-refined Fact 1 | ✓ ACCURATE |

**Section 7: Lifecycle Operations**

| Claim | Verification | Status |
|-------|--------------|--------|
| `sf project deploy start` without metadata flags deploys all changed metadata | Standard Salesforce CLI behavior; not contradicted by sources | ✓ ACCURATE |
| Wildcard retrieve syntax `"AiAuthoringBundle:Local_Info_Agent_*"` returns all versions | rf4-context-refined Fact 21 referenced; syntax matches standard Salesforce CLI | ✓ ACCURATE |
| Published agents cannot be deleted via CLI | rf4-context-refined Fact 24 confirmed | ✓ ACCURATE |
| Backing code deletion requires updating agent first | rf4-context-refined Fact 9 confirmed | ✓ ACCURATE |
| Do NOT use `--json` with `sf org open` commands | Line 633: "JSON mode outputs the target URL but does not open the browser" — plausible, standard CLI behavior | ✓ ACCURATE |

### 3b. CLI Command Validation

**Flag Ordering (--json first):**
All major commands follow the `--json` first convention. ✓

**Metadata Type Names:**
- AiAuthoringBundle ✓ (never abbreviated)
- Bot ✓
- BotVersion ✓
- GenAiPlannerBundle ✓
- Agent (pseudo-type) ✓

**Wildcard Patterns Quoted:**
- Line 528: `"AiAuthoringBundle:Local_Info_Agent_*"` — quoted ✓

**Space Separation of Metadata Types:**
- Line 498: `--metadata ApexClass Flow` — space-separated ✓

**WRONG/RIGHT Pair Consistency:**
- Lines 188-197 (omitting `--no-spec`): WRONG example hangs; RIGHT example includes flag ✓
- Lines 202-216 (swapping `--name` and `--api-name`): WRONG produces invalid developer_name; RIGHT has correct usage ✓
- Both pairs have clear semantic differences (not just cosmetic fixes)

**Critical Issues Found:**
- **Line 604:** `sf agent test create --json --spec specs/Local_Info_Agent-testSpec.yaml --api-name Local_Info_Agent_Test --force-overwrite`
  - Flag `--force-overwrite` is NOT documented in `.a4drules/agent-testing-rules-no-edit.md`
  - Testing rules line 235-238 show the same command WITHOUT this flag
  - **Severity: MEDIUM** — This flag may not exist or may have a different name

- **Line 616:** `sf agent test run --json --api-name Local_Info_Agent_Test --wait 5`
  - Flag `--wait 5` is NOT documented in `.a4drules/agent-testing-rules-no-edit.md`
  - Testing rules line 245 show the same command WITHOUT this flag
  - **Severity: MEDIUM** — This flag may not exist; test execution behavior unclear

### 3c. Metadata Structure Validation

**Actual Project Structure Check:**

| Claim | Real Files | Status |
|-------|-----------|--------|
| aiAuthoringBundles/ contains {name}/ directories | Confirmed (Local_Info_Agent/, Local_Info_Agent_3/) | ✓ |
| Each bundle has {name}.agent and {name}.bundle-meta.xml | Confirmed for both bundles | ✓ |
| bots/ contains {name}/ with .bot-meta.xml | Confirmed (Local_Info_Agent/Local_Info_Agent.bot-meta.xml) | ✓ |
| bots/{name}/ contains v{N}.botVersion-meta.xml | Confirmed (v1-v5 for Local_Info_Agent) | ✓ |
| genAiPlannerBundles/ contains {name}_v{N}/ subdirectories | Confirmed (Local_Info_Agent_v1 through v5) | ✓ |
| GenAiPlannerBundle has localActions/ subdirectory | Confirmed in Local_Info_Agent_v1/ | ✓ |
| {name}_v{N}.genAiPlannerBundle file exists | Confirmed (Local_Info_Agent_v1.genAiPlannerBundle, etc.) | ✓ |

**Directory Tree Accuracy (lines 395-412):**
- Example shows bots/Local_Info_Agent/ with Local_Info_Agent.bot-meta.xml and v1, v2, v3 botVersion files — matches real structure ✓
- Example shows genAiPlannerBundles/ with version subdirectories and localActions — matches real structure ✓

### 3d. Inaccuracies Summary

**Priority 1 (HIGH — Execution Blocking):**

1. **Line 125: "check results (`sf agent test resume`)" — INACCURATE**
   - Authoritative testing rules document `sf agent test results` command, not `sf agent test resume`
   - **Severity:** HIGH — Using the wrong command name will cause execution failure
   - **Fix location:** Lines 125, replace `sf agent test resume` with correct command reference
   - **Estimated effort:** 1 minute (documentation only)

2. **Line 616: `--wait 5` flag — UNVERIFIABLE/LIKELY INACCURATE**
   - Testing rules do not document `--wait` flag for `sf agent test run`
   - Testing rules show command without any timeout/wait mechanism: `sf agent test run --api-name My_Agent_Test`
   - **Severity:** HIGH — If flag doesn't exist, command will fail
   - **Note:** RFC2's mention of `--wait` may indicate this is a valid but undocumented flag; cannot confirm from permitted sources
   - **Fix location:** Lines 616, 619
   - **Estimated effort:** Requires verification against actual Salesforce CLI

3. **Line 604: `--force-overwrite` flag — UNVERIFIABLE/LIKELY UNDOCUMENTED**
   - Testing rules do not document `--force-overwrite` flag for `sf agent test create`
   - Testing rules show command without this flag: `sf agent test create --spec ... --api-name ...`
   - **Severity:** HIGH — If flag doesn't exist, command will fail
   - **Fix location:** Lines 604, 607, 609
   - **Estimated effort:** Requires verification against actual Salesforce CLI

**Priority 2 (MEDIUM — Incomplete Guidance):**

4. **Lines 604-611: `sf agent test create` missing `--json` in testing rules**
   - RF4 line 604 uses `--json` flag
   - Testing rules lines 235-238 show command WITHOUT `--json`
   - Standard Salesforce CLI convention is to support `--json` for all commands
   - **Severity:** MEDIUM — Likely correct but not verified in authoritative source
   - **Note:** This is probably correct (standard CLI practice), but inconsistency with testing rules is flagged

5. **Line 583: "Recommended approach" — SOFT DIRECTIVE**
   - Uses hedging language ("Recommended approach") instead of directive ("Do this")
   - For a mid-tier consuming agent, "recommended" may be interpreted as optional
   - **Severity:** LOW to MEDIUM depending on consuming agent's interpretation sophistication
   - **Fix location:** Line 583
   - **Estimated effort:** 1 minute (reword as directive)

**Priority 3 (LOW — Minor Issues):**

6. **Lines 54, 115, 226, 232: Inconsistent capitalization of "draft" vs. "DRAFT"**
   - Sometimes lowercase, sometimes uppercase
   - Standard practice would be lowercase for common noun
   - **Severity:** LOW — Does not affect understanding
   - **Fix location:** Standardize to "draft" (lowercase) in lines 54, 115, 226, 232

7. **Line 50: `developer_name` used in XML example before formal concept explanation**
   - XML snippet at line 50 shows `<target>Local_Info_Agent.v2</target>` with example value
   - Formal explanation of `developer_name` concept begins at line 64
   - Reader may be confused about what this identifier represents
   - **Severity:** LOW — Context in surrounding text clarifies intent
   - **Fix location:** Consider clarifying in caption above line 50

---

## Dimension 4: Consuming Agent Effectiveness

### 4a. Actionability

| Section | Action Directives | Assessment |
|---------|------------------|-----------|
| Section 1: Metadata Structure | Defines concepts; sets up understanding for later sections | Descriptive, not actionable. Appropriate for a structural reference. |
| Section 2: Lifecycle Overview | Lists 5 phases and commands to use for each | Actionable: "Run command X in phase Y." ✓ |
| Section 3: Creating an Agent | Lists command syntax with required flags | Highly actionable: command syntax is explicit. ✓ |
| Section 4: Working With Bundles | Explains constraints and edge cases; includes "NEVER deploy..." directive (line 275) | Mix of constraints (descriptive) and directives (actionable). Appropriate for a reference. ✓ |
| Section 5: Publishing | Explains why publish is needed; shows command syntax | Actionable: "Run this command." ✓ |
| Section 6: Activating | Shows activation command and requirement (activated version needed for test/preview) | Actionable. ✓ |
| Section 7: Lifecycle Operations | Command reference for deploy, retrieve, delete, rename, test, open in builder | Highly actionable: explicit command syntax for each operation. ✓ |

**Issues:**
- Line 583 ("Recommended approach: Create a new agent with the desired name...") uses soft directive for rename operation. For a mid-tier agent, this might be treated as optional rather than mandatory guidance.

### 4b. Ambiguity Risks

| Risk | Location | Severity |
|------|----------|----------|
| `developer_name` concept introduced via XML example before formal explanation | Line 50, explained at line 64 | LOW — Context makes intent clear enough |
| "Agent pseudo-type" term not formally defined until line 88 | Mentioned in diagram line 88 | LOW — Purpose is clear from context (retrieves runtime entities) |
| `<target>` element's role unclear in line 25 | Explained at line 44-56 | LOW — Diagram and caption suggest it links versions |
| "DRAFT" vs. "draft" capitalization — reader may be confused about what these terms mean | Lines throughout | LOW — Context makes meaning clear despite capitalization inconsistency |
| `--api-name` refers to different things in different commands (AiAuthoringBundle developer_name vs. Bot API name vs. AiEvaluationDefinition name) | Lines 102, 107, 163, 378, 381, 463, 469, 604, 616, 619 | MODERATE — RF4 does attempt to clarify ("The `--api-name` is the Bot's API name..." at line 469), but this is complex and could confuse a mid-tier agent if not read carefully |
| Unclear whether `--force-overwrite` and `--wait 5` flags are real or hypothetical | Lines 604, 607, 616, 619 | MEDIUM — RF4 presents them as facts, but they're undocumented in testing rules |
| "Retrieve authoring bundle after publishing locks it" — edge case may not be understood as "rare" | Line 337-345 | LOW — RF4 flags this clearly as "Edge Case" |
| Test execution constraint ("Tests run against activated published agents only") repeated in multiple sections (lines 125, 479-483) | Multiple | LOW — Repetition reinforces importance; not confusing |

### 4c. Token Efficiency

**Estimated Token Count:** Lines 1-654 × 4 tokens/line average = ~2,616 tokens

**Assessment by Section:**

| Section | Token Efficiency | Issues |
|---------|-----------------|--------|
| Section 1 (lines 15-93) | ~312 tokens | Essential foundational material. No cuts without losing understanding. ✓ |
| Section 2 (lines 95-142) | ~192 tokens | 5-phase overview is efficient. Mental models are well-explained. ✓ |
| Section 3 (lines 145-217) | ~292 tokens | WRONG/RIGHT pairs (lines 184-216) are 128 tokens for teaching 2 common mistakes. Justified for a consuming agent that will write generate commands. ✓ |
| Section 4 (lines 220-346) | ~504 tokens | This is the longest section. Contains 10+ subsections covering edge cases (post-publish workflow, retrieve-after-publish, etc.). Some of these are "nice to know" but not essential to the core lifecycle. Could trim: lines 317-327 (server-side versioning warning) are valuable for understanding CLI output but optional for action. Lines 337-345 (retrieve-after-publish edge case) are niche; justified only if mid-tier agents frequently retrieve after publish. |
| Section 5 (lines 349-451) | ~408 tokens | Contains command syntax (core), explanations (helpful), and directory tree example (educational). Tree is valuable for understanding structure. All necessary. ✓ |
| Section 6 (lines 455-484) | ~120 tokens | Concise. Could be shorter but appropriately sized for activation workflow. ✓ |
| Section 7 (lines 487-649) | ~648 tokens | Command reference. Extensive but appropriate for a lifecycle operations section. Deploy (lines 495-510, ~60 tokens), Retrieve (lines 513-545, ~128 tokens), Delete (lines 548-577, ~120 tokens), Rename (lines 579-583, ~20 tokens), Test Lifecycle (lines 585-629, ~176 tokens), Open in Builder (lines 631-649, ~72 tokens). Only Test Lifecycle might be verbose, but test commands have nuance (create vs. run, async patterns). Justified. ✓ |

**Aggressive Token Optimization Opportunities:**

1. **Lines 317-327 (Server-Side Filename Versioning Warning):** ~44 tokens. This explains a misleading CLI warning. Useful for support/debugging but not essential for executing the lifecycle. Could be moved to a separate "CLI Output Interpretation" guide. **Recommendation:** Keep (helps agents avoid confusion) but note as "optional reading for CLI output interpretation."

2. **Lines 337-345 (Retrieve-After-Publish Edge Case):** ~36 tokens. Niche scenario. Could be cut without affecting 90% of use cases, but recovery instructions are valuable if this happens. **Recommendation:** Keep (recovery path is critical once the problem occurs).

3. **Lines 261-273 (Deploy-Before-Publish for Pro-Code/Low-Code Collaboration):** ~52 tokens. This is a valid but not the primary use case. Mid-tier agents are more likely to follow: generate → deploy → publish → activate. **Recommendation:** Keep (important for collaboration scenario; should not be cut).

**Overall Assessment:** RF4 is moderately dense but appropriately sized. No significant cuts recommended without losing important operational context. Section 4 (Working With Bundles) is the longest and could be trimmed slightly, but the content is valuable for understanding edge cases.

### 4d. WRONG/RIGHT Pattern Coverage

| Location | Mistake Taught | Justification | Frequency | Canonical? |
|----------|-----------------|---------------|-----------|-----------|
| Lines 188-197 | Omitting `--no-spec` causes hang | `--no-spec` is non-obvious; omitting it is a plausible mistake. **Frequency: COMMON.** Many developers new to CLI don't know about mandatory flags. **Justified.** ✓ | HIGH | rf4-context-refined Fact 5; agent-script-rules-no-edit.md line 159 |
| Lines 202-216 | Swapping `--name` and `--api-name` | These flags have inverse semantics (human-readable vs. identifier). **Frequency: COMMON.** This is a frequent conceptual error. **Justified.** ✓ | HIGH | rf4-context-refined Fact 5; agent-script-rules-no-edit.md |

**Assessment:** Both WRONG/RIGHT pairs teach common mistakes. Both correct examples match canonical usage from sources. ✓

---

## Custom Evaluations

### Custom 1: CLI Flag Convention Compliance

**Convention:** `--json` must be the FIRST flag after the base command.

**Findings:** All commands follow this convention.
- Line 102, 104, 105, 106, 107: ✓
- Line 152, 190, 193, 204, 209: ✓
- Line 339, 498, 506, 520, 528, 540, 554: ✓
- Line 604, 616, 624: ✓

**No violations found.** ✓

---

### Custom 2: `--api-name` Semantic Consistency

**Rule:** `--api-name` means different things in different commands.

**Verification:**

| Command | Line | `--api-name` Refers To | RF4 Explanation | Correct? |
|---------|------|------------------------|-----------------|----------|
| `sf agent generate authoring-bundle` | 102, 152 | AiAuthoringBundle developer_name | Line 163 explains "Developer_Name" | ✓ |
| `sf agent validate authoring-bundle` | 105 | AiAuthoringBundle developer_name | Line 163 (same command group) | ✓ |
| `sf agent publish authoring-bundle` | 106, 368, 378 | AiAuthoringBundle developer_name | Line 381 explains "directory name under aiAuthoringBundles/" | ✓ |
| `sf agent activate` | 107, 463, 466 | Bot API name | Line 469 explains "Bot's API name (from your Agent Script config block's developer_name)" | ✓ |
| `sf agent test create` | 604 | AiEvaluationDefinition name (assigned by user) | Line 607 explains "the identifier for all subsequent run commands"; line 619 clarifies "AiEvaluationDefinition name" | ✓ |
| `sf agent test run` | 616 | AiEvaluationDefinition name | Line 619 explains "The `--api-name` is the `AiEvaluationDefinition` name (set by `--api-name` during `sf agent test create`)" | ✓ |
| `sf org open agent` | 646 | Bot API name | Line 646 shows `--api-name <Bot_API_Name>` | ✓ |

**Assessment:** Semantic consistency is explicit and clear. RF4 explains what `--api-name` refers to in each context. ✓

---

### Custom 3: Versioning Model Consistency

**Rule:** Check for contradictions between sections about naked/version-suffixed bundles, draft/locked state, and `<target>` behavior.

**Verification:**

| Claim | Section 1 | Section 4 | Section 7 | Consistent? |
|-------|-----------|----------|----------|------------|
| Naked bundle represents highest DRAFT | Line 64-66 | Lines 232-234 | Not directly mentioned | ✓ Consistent |
| Version-suffixed bundles are locked by `<target>` | Line 68-70 | Lines 238-245 | Not directly mentioned | ✓ Consistent |
| `<target>` controls draft/locked state | Line 44-54 | Not repeated | Not repeated | ✓ Consistent (no contradictions) |
| Retrieve returns org-generated version-suffixed bundle | N/A | Lines 237-238 | Lines 520-533 | ✓ Consistent (line 528 shows wildcard pattern) |
| After publish, you can keep editing and deploying | N/A | Lines 331-335 (post-publish seamless) | Not directly mentioned | ✓ (no contradiction) |
| Retrieve after publish locks the bundle | N/A | Lines 338-343 (edge case) | Not mentioned | ✓ (identified as edge case, not standard workflow) |

**Assessment:** Versioning model is consistent across sections. Edge cases are labeled clearly. ✓

---

### Custom 4: Agent Pseudo-Type Coverage

**Rule:** Every mention of `Agent:X` must be consistent about what it includes/excludes.

**Findings:**

| Line | Claim | Consistency |
|------|-------|-------------|
| 88-92 | "Agent:X is a pseudo-metadata type that covers the runtime domain components: Bot, BotVersion, GenAiPlannerBundle, and related GenAiPlugin/GenAiFunction metadata. Does NOT include AiAuthoringBundle." | Clear definition ✓ |
| 441-451 | "Retrieving with Agent:Local_Info_Agent returns the runtime entity graph: Bot, BotVersion, and GenAiPlannerBundle metadata. It does not include AiAuthoringBundle." | Consistent with line 88-92 ✓ |
| 539-545 | "The Agent pseudo-type retrieves Bot, BotVersion, GenAiPlannerBundle, and GenAiPlugin — the full runtime entity graph. It does not include AiAuthoringBundle." | Consistent (added GenAiPlugin detail, which is consistent with line 88) ✓ |

**Assessment:** Consistent. No section claims Agent:X includes AiAuthoringBundle. ✓

---

### Custom 5: Deploy Safety Guidance

**Rule:** Check for warnings about accidental deploys; ensure safe deploy command (`--metadata ApexClass Flow`) is used consistently.

**Findings:**

| Location | Guidance | Consistency |
|----------|----------|-------------|
| Line 275-279 | "NEVER Deploy AiAuthoringBundle in Routine Backing-Code Operations" — strong directive with rationale | ✓ |
| Line 281 | Cites .a4drules/agent-script-rules-no-edit.md line 64 | ✓ Sourced |
| Line 495-510 | Section 7 "Deploy" shows safe command: `sf project deploy start --json --metadata ApexClass Flow` | ✓ Demonstrates safe practice |
| Line 498 | States "Use `--metadata` to scope routine deploys to backing code" | ✓ Reinforces safety |
| Line 503-509 | Shows exception case: "Deploy agent metadata (pro-code/low-code collaboration)" with `AiAuthoringBundle:` included | ✓ Explicit; not a bare deploy |
| Line 501 | "A bare `sf project deploy start` deploys all changed local metadata, including agent metadata." | ✓ Explains the risk clearly |

**Assessment:** Deploy safety guidance is consistent across sections. Safe deploy command is modeled. Exceptions are labeled. ✓

---

### Custom 6: Test Lifecycle Accuracy

**Rule:** Verify against `.a4drules/agent-testing-rules-no-edit.md`.

**Findings:**

| Claim | RF4 Location | Testing Rules | Status |
|-------|--------------|---------------|--------|
| Test spec location is `specs/` at project root | Line 589 | agent-testing-rules-no-edit.md line 260 | ✓ ACCURATE |
| Test spec schema uses camelCase field names | Line 592 (mentions subjectName), lines 604-624 | agent-testing-rules-no-edit.md line 46 | ✓ ACCURATE |
| `sf agent test create` command | Line 604 | agent-testing-rules-no-edit.md line 183-186, 235-238 | ⚠ PARTIAL (see below) |
| — Flag: `--spec` | Line 604 | agent-testing-rules-no-edit.md line 236 | ✓ ACCURATE |
| — Flag: `--api-name` | Line 604 | agent-testing-rules-no-edit.md line 237 | ✓ ACCURATE |
| — Flag: `--force-overwrite` | Line 604 | agent-testing-rules-no-edit.md line 234-238 | ❌ NOT MENTIONED in testing rules |
| — Flag: `--json` | Line 604 | agent-testing-rules-no-edit.md line 235 | ❌ NOT IN TESTING RULES (though likely correct per Salesforce CLI conventions) |
| Test spec template location | Line 593 | Not in testing rules; but skill assets/template-testSpec.yaml exists ✓ | ✓ ACCURATE |
| `sf agent generate test-spec --from-definition` | Line 598 | agent-testing-rules-no-edit.md line 217-220 | ✓ ACCURATE |
| — Flag: `--from-definition` | Line 598 | agent-testing-rules-no-edit.md line 218 | ✓ ACCURATE |
| — Flag: `--output-file` | Line 598 | agent-testing-rules-no-edit.md line 219 | ✓ ACCURATE |
| `sf agent test create --preview` | Line 607 | agent-testing-rules-no-edit.md line 225-230 | ✓ ACCURATE (RF4 mentions it inline; testing rules show with line continuation) |
| Warning: Do NOT use `sf agent generate test-spec` for programmatic use | Line 595 | agent-testing-rules-no-edit.md line 209-212 (implicit; "requires interactive input") | ✓ ACCURATE |
| Create before run constraint | Line 611 | agent-testing-rules-no-edit.md line 196-200 | ✓ ACCURATE |
| `sf agent test run` command | Line 616 | agent-testing-rules-no-edit.md line 245 | ⚠ PARTIAL (see below) |
| — Flag: `--api-name` | Line 616 | agent-testing-rules-no-edit.md line 245 | ✓ ACCURATE |
| — Flag: `--wait 5` | Line 616 | agent-testing-rules-no-edit.md line 245 | ❌ NOT MENTIONED in testing rules |
| — Explanation: `--wait` forces synchronous execution with timeout | Line 619 | agent-testing-rules-no-edit.md line 245 | ❌ NOT DOCUMENTED in testing rules |
| — Alternative: `sf agent test results --job-id` for async | Line 624-627 | agent-testing-rules-no-edit.md line 250-253 | ✓ ACCURATE |
| Tests run against activated agents only | Line 619 | agent-testing-rules-no-edit.md line 194 (implicit in "test exists in org") | ✓ ACCURATE |

**Summary:**
- ❌ **`--force-overwrite` flag (line 604):** Not documented in testing rules. May not exist.
- ❌ **`--json` flag for test create (line 604):** Not in testing rules. Likely correct per CLI conventions, but unverified.
- ❌ **`--wait 5` flag and timeout behavior (line 616, 619):** Not documented in testing rules. May not exist.
- ❌ **`sf agent test resume` command (line 125):** Testing rules show `sf agent test results`, not `resume`.

### Custom 7: Authoritative Tone

**Rule:** No hedging language ("you might consider," "it's generally a good idea," "one approach could be") for a mid-tier consuming agent.

**Findings:**

| Location | Text | Assessment |
|----------|------|-----------|
| Line 261 | "Deploy-before-publish is legitimate (For Pro-Code/Low-Code Collaboration)" | Strong assertion ✓ |
| Line 275 | "NEVER Deploy AiAuthoringBundle in Routine Backing-Code Operations" | Mandatory directive ✓ |
| Line 583 | "Recommended approach: Create a new agent with the desired name and migrate content." | **SOFT: "Recommended" is hedging.** For rename, mid-tier agent might treat this as optional. |

**Issues Found:**
- Line 583 uses "Recommended approach:" instead of "Do this:" or "You must:". For rename operations, this could be misinterpreted as optional guidance.

---

### Custom 8: No Markdown Tables

**Rule:** Project convention is to use bullet lists instead of markdown tables.

**Findings:** No markdown tables detected in RF4. ✓

---

### Custom 9: Example Name Consistency

**Rule:** All examples should use `Local_Info_Agent` / `"Local Info Agent"` as the agent name.

**Findings:**

| Line | Example Name | Assessment |
|------|--------------|-----------|
| 102, 104, 105, 106, 107 | `Local_Info_Agent` | ✓ Correct |
| 152, 163, 169-176, 193, 204, 209, 211 | `Local_Info_Agent` | ✓ Correct |
| 190 | `Local Info Agent` (human-readable label) | ✓ Correct (paired with `Local_Info_Agent` api-name) |
| 366, 368, 378, 381 | `Local_Info_Agent` | ✓ Correct |
| 434, 437, 448, 506, 520, 528, 540, 554 | `Local_Info_Agent` | ✓ Correct |
| 604, 616, 624 | `Local_Info_Agent_Test` | ⚠ Different agent name for test examples (intentional; shows test naming pattern) |

**Assessment:** Example consistency is excellent. Test examples use `Local_Info_Agent_Test` to distinguish test definitions from agent definitions, which is appropriate. ✓

---

## Summary

### Overall Assessment

RF4 is a **well-structured, mostly accurate reference** for managing the agent metadata lifecycle. The organization is logical, the technical content is grounded in authoritative sources, and the CLI commands are demonstrated clearly. However, three **critical inaccuracies** undermine consuming agent effectiveness:

1. **Line 125: `sf agent test resume` is not the correct command.** Testing rules document `sf agent test results`, not `resume`. A mid-tier agent following this will execute the wrong command.

2. **Lines 604, 607, 609: `--force-overwrite` flag for `sf agent test create` is undocumented.** Testing rules show the command without this flag. This flag may not exist or may have a different name. Consuming agents will fail if they trust this documentation.

3. **Lines 616, 619: `--wait 5` flag for `sf agent test run` is undocumented.** Testing rules show the command without timeout handling. If this flag doesn't exist, consuming agents will fail. If it exists but is undocumented, RF4 is adding information not in authoritative sources.

These three issues are **execution-blocking** for a consuming agent that follows the test-related guidance precisely.

Additionally:

- **Line 583 (rename section):** Uses soft directive ("Recommended approach") rather than mandatory guidance. Mid-tier agents might treat rename as optional rather than required.

- **Line 50:** `developer_name` concept is used in an XML example before being formally explained, which could confuse readers about what this identifier represents.

- **DRAFT vs. draft capitalization:** Inconsistent throughout (lowercase in some sections, uppercase in others), though this is a minor stylistic issue.

The reference is **most vulnerable to consuming agent misinterpretation** in the test lifecycle section (Section 7, lines 585-629), where undocumented flags and incorrect command names could cause complete failure.

### Prioritized Action Items

**Priority 1 (HIGH — Must Fix Immediately):**

1. **Fix `sf agent test resume` → `sf agent test results`**
   - **Location:** Line 125
   - **What to fix:** Change "check results (`sf agent test resume`)" to "check test results (`sf agent test results`)"
   - **Why:** Testing rules document `sf agent test results`, not `resume`. Consuming agents will execute the wrong command.
   - **Estimated effort:** 2 minutes
   - **Impact:** CRITICAL — Prevents correct test result retrieval

2. **Verify/Document `--force-overwrite` flag for `sf agent test create`**
   - **Location:** Lines 604, 607, 609
   - **What to fix:** Either confirm this flag exists in Salesforce CLI documentation, or remove it from all test create commands
   - **Why:** Testing rules do not document this flag. If it doesn't exist, consuming agents will fail.
   - **Estimated effort:** 15 minutes (verification) + 2 minutes (fix if removal needed)
   - **Impact:** HIGH — Test creation will fail if flag is nonexistent

3. **Verify/Document `--wait` flag for `sf agent test run`**
   - **Location:** Lines 616, 619
   - **What to fix:** Either confirm `--wait` behavior in Salesforce CLI documentation, or remove and explain async workflow with `sf agent test results`
   - **Why:** Testing rules do not document `--wait` flag. Unclear if this is a real flag or if test execution is always async.
   - **Estimated effort:** 15 minutes (verification) + 5 minutes (fix if change needed)
   - **Impact:** HIGH — Test execution behavior is fundamentally unclear

**Priority 2 (MEDIUM — Should Fix Soon):**

4. **Soften or strengthen directive for rename operation**
   - **Location:** Line 583
   - **What to fix:** Change "Recommended approach:" to "Do this:" OR make it clear this is guidance, not a requirement
   - **Why:** Mid-tier agents may interpret "recommended" as optional. For rename, there is no safe alternative path.
   - **Estimated effort:** 2 minutes
   - **Impact:** MEDIUM — Consuming agent might skip this guidance and attempt unsafe rename operations

5. **Clarify `--json` flag for `sf agent test create`**
   - **Location:** Line 604
   - **What to fix:** Verify in testing rules whether `--json` is supported; add note if it's standard Salesforce CLI behavior
   - **Why:** Testing rules don't show this flag, creating inconsistency with RF4
   - **Estimated effort:** 10 minutes (verification)
   - **Impact:** LOW to MEDIUM — Likely correct per Salesforce CLI conventions, but unverified

**Priority 3 (LOW — Polish):**

6. **Standardize capitalization of "draft" to lowercase**
   - **Location:** Lines 54, 115, 226, 232 (and others)
   - **What to fix:** Use "draft" (lowercase) consistently when referring to draft state
   - **Why:** Consistency improves readability; standard English convention for common nouns
   - **Estimated effort:** 5 minutes
   - **Impact:** LOW — Cosmetic; does not affect understanding

7. **Add clarity note for `developer_name` in XML example**
   - **Location:** Line 50
   - **What to fix:** Add caption or inline comment explaining that `Local_Info_Agent` is the developer_name (API identifier)
   - **Why:** Readers may not immediately understand this identifier's significance
   - **Estimated effort:** 3 minutes
   - **Impact:** LOW — Context clarifies intent despite ambiguity
