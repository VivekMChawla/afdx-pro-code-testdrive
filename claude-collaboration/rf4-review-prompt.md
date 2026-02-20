# Review Prompt: RF4 — Agent Metadata & Lifecycle

> **Purpose**: This prompt drives an adversarial sub-agent analysis of
> RF4 (Agent Metadata & Lifecycle). The sub-agent's job is to find
> every flaw, inaccuracy, inconsistency, and weakness in this file. It
> produces a detailed report. It does NOT make any edits.
>
> **Based on**: `rf-review-prompt.md` (generic framework) with RF4-specific
> inputs and custom evaluations merged in.

---

## Input Variables

- **RF under review**: `afdx-pro-code-testdrive/agent-script-skill/references/agent-metadata-and-lifecycle.md`
- **RF label**: RF4 — Agent Metadata & Lifecycle
- **Authoritative sources for Agent Script metadata, lifecycle, and testing**:
  - `.a4drules/agent-script-rules-no-edit.md` (metadata structure, deploy/publish rules, CLI commands)
  - `.a4drules/agent-testing-rules-no-edit.md` (test spec format, test workflow, CLI test commands, AiEvaluationDefinition)
  - `salesforcedocs/genai-main/content/en-us/agentforce/guides/agentforce/agent-dx/` (official Salesforce DX documentation for agent metadata operations)
- **Source files for verifying real-world metadata structure**:
  - `afdx-pro-code-testdrive/force-app/main/default/aiAuthoringBundles/` (real authoring bundles)
  - `afdx-pro-code-testdrive/force-app/main/default/bots/Local_Info_Agent/` (real Bot/BotVersion metadata)
  - `afdx-pro-code-testdrive/force-app/main/default/genAiPlannerBundles/` (real GenAiPlannerBundle structure)
  - `afdx-pro-code-testdrive/specs/Local_Info_Agent-testSpec.yaml` (real test spec)
  - `afdx-pro-code-testdrive/force-app/main/default/aiEvaluationDefinitions/` (real AiEvaluationDefinition metadata if present)
- **Sibling RFs for cross-reference**:
  - `afdx-pro-code-testdrive/agent-script-skill/references/agent-script-core-language.md` (RF1 — Core Language)
  - `afdx-pro-code-testdrive/agent-script-skill/references/agent-design-and-spec-creation.md` (RF2 — Design & Agent Spec Creation)
  - `afdx-pro-code-testdrive/agent-script-skill/references/agent-validation-and-debugging.md` (RF3 — Validation & Debugging)
- **SKILL.md (router)**: `afdx-pro-code-testdrive/agent-script-skill/SKILL.md`

---

## Instructions to the Sub-Agent

You are an adversarial reviewer. Your job is to attack this reference
file and find every problem. Assume the authors made mistakes. Assume
code samples have bugs. Assume claims are wrong until you verify them
against source material. A "clean" report with no findings is a failed
review — it means you weren't thorough enough.

You are reviewing a reference file that is part of a Claude Skill. This
file will be read by a mid-tier AI agent (the "consuming agent") to learn
how to manage agent metadata through the full lifecycle: generate, deploy,
publish, activate, test, retrieve, and delete. The consuming agent already
knows syntax (RF1), design patterns (RF2), and validation/debugging (RF3).
If this file contains errors, the consuming agent will execute wrong CLI
commands, corrupt metadata, or misunderstand versioning behavior.

**Critical rules:**

- Do NOT edit any files. Report only.
- Do NOT read any collaboration context, working context, or prompt
  files. You must evaluate this RF with fresh eyes, as an outsider
  would. You have no knowledge of the authors' intent, decisions, or
  design rationale. Judge the file purely on what it says and whether
  what it says is correct and useful.
- **Permitted sources for technical accuracy verification:**
  - `.a4drules/agent-script-rules-no-edit.md` (authoritative script rules)
  - `.a4drules/agent-testing-rules-no-edit.md` (authoritative testing rules)
  - `salesforcedocs/` directory (official Salesforce documentation)
  - `force-app/main/default/` directories (real metadata for structural verification)
  - `specs/` directory (real test spec files)
  - RF1, RF2, RF3 (sibling reference files, for cross-reference only)
  - SKILL.md (router, for understanding how this file is loaded)
- **NOT permitted as sources for technical accuracy:**
  - Any file in `claude-collaboration/` — these are internal working
    documents and must not be used to verify or justify RF content.
  - Your own training data about Salesforce or Agentforce — Agent Script
    is a proprietary DSL that your training data may not cover accurately.
- When you find an issue, cite the specific line number(s) in the RF.
- When you verify a claim, cite the specific source file and line.
- If you cannot verify a claim from permitted sources, mark it
  UNVERIFIABLE — do not infer correctness from plausibility.
- Distinguish between "confirmed wrong" and "unverifiable."
- Structure your report using the exact dimension headings below.
- Write the final report to:
  `afdx-pro-code-testdrive/claude-collaboration/rf4-analysis-report.md`

---

## Dimension 1: Completeness

Determine whether the RF covers everything it should — and nothing it
shouldn't.

### 1a. Coverage Map

For every substantive metadata, lifecycle, or CLI rule in the
authoritative rules files (`.a4drules`) that falls within RF4's scope,
confirm it is covered in the RF. Present as a list with:
- Topic name
- RF line coverage (or "MISSING")
- Source reference (file and line)

### 1b. Missing Items

List anything within RF4's scope that is not covered. For each:
- What is missing
- Where the authoritative source documents it
- Impact assessment (how would the consuming agent be affected)

### 1c. Scope Boundary Check

List items that are correctly deferred to sibling RFs or future files.
Also flag any content in this RF that belongs elsewhere (scope bleed).
Cite specific lines.

### 1d. Redundancy with RF1, RF2, and RF3

Identify content that overlaps with RF1, RF2, or RF3. For each instance:
- What overlaps
- Lines in RF4 and in the sibling RF
- Assessment: does the RF4 version add necessary lifecycle context
  beyond what the sibling teaches, or is it harmful duplication that
  could confuse a consuming agent seeing the same concept explained
  two different ways?

---

## Dimension 2: Information Flow

Evaluate whether the RF reads coherently from top to bottom.

### 2a. Section Progression

For each section, assess whether it logically follows the previous one.
Flag any section that assumes knowledge not yet introduced in this file
or in RF1/RF2/RF3.

### 2b. Forward References

Identify every instance where the RF uses a concept before it is formally
introduced. For each:
- What concept is referenced
- Where it is used (line number)
- Where it is formally introduced (line number or "not introduced")
- Severity: LOW, MODERATE, or HIGH

### 2c. Internal Consistency

Check that terminology, formatting conventions, and structural patterns
are consistent throughout the file. Flag every inconsistency with line
numbers. Check for:
- Terms used differently in different sections
- Formatting patterns that change mid-file
- Section opening styles that vary
- Code sample conventions that shift
- CLI flag ordering (--json must be first flag after base command)

---

## Dimension 3: Technical Accuracy

Verify every technical claim against permitted source materials ONLY.

### 3a. Section-by-Section Verification

For each section, list every verifiable technical claim and its source
verification status. Use:
- ✓ ACCURATE — cite the specific source file and line that confirms it
- ❌ INACCURATE — cite the source that contradicts it, explain the
  discrepancy
- ⚠ UNVERIFIABLE — you cannot find this claim in any permitted source.
  State whether it seems plausible but be clear that it is unverified.

### 3b. CLI Command Validation

For every CLI command in the RF:
- Is the command syntax correct per `.a4drules` and `salesforcedocs`?
- Is `--json` the first flag after the base command?
- Are metadata type names correct (e.g., `AiAuthoringBundle` not `AAB`)?
- Are wildcard patterns quoted?
- Are multiple metadata types space-separated (not comma-separated)?
- Do WRONG examples use a different error than the CORRECT examples?

### 3c. Metadata Structure Validation

For every directory tree or metadata path shown in the RF:
- Verify against actual files in `force-app/main/default/`
- Check file naming conventions match reality
- Verify parent-child relationships are accurate

### 3d. Inaccuracies Summary

Collect all confirmed inaccuracies and unverifiable claims into a single
prioritized list with line numbers.

---

## Dimension 4: Consuming Agent Effectiveness

Evaluate whether a cold mid-tier AI agent would produce correct output
after reading this RF. Be pessimistic — assume the agent will take the
most literal, least charitable interpretation of every instruction.

### 4a. Actionability

For each section, assess: does the content tell the consuming agent what
to DO, or does it merely describe concepts? A mid-tier agent needs
explicit directives, not descriptions. Flag sections that inform without
directing.

### 4b. Ambiguity Risks

Identify content that a mid-tier model is likely to misinterpret. Focus
on:
- Implicit knowledge the authors assume but never state
- Terms used without definition
- Distinctions that require careful reasoning to understand
- Instructions that could be followed literally in a harmful way
- Places where `--api-name` refers to different things in different commands

### 4c. Token Efficiency

Estimate the total token count of the RF (use ~4 tokens per line as a
rough heuristic for mixed prose and code). Assess whether every section
earns its tokens. Flag any content that could be cut without reducing
the agent's capability. Be aggressive — every token in context competes
with the user's actual task.

### 4d. WRONG/RIGHT Pattern Coverage

List all WRONG/RIGHT pairs. For each:
- What mistake does the pair teach the agent to avoid?
- Is the mistake common enough to warrant the token cost?
- Is the RIGHT example the canonical way to do it per `.a4drules`?
- Could the WRONG example be misread despite its label?

---

## Custom Evaluations

### Custom 1: CLI Flag Convention Compliance

Every CLI command in the RF must follow these conventions:
- `--json` appears as the FIRST flag after the base command
- Multiple metadata types are space-separated, NOT comma-separated
- Wildcard patterns are quoted (e.g., `"AiAuthoringBundle:Local_Info_Agent_*"`)
- `AiAuthoringBundle` is never abbreviated to "AAB"

Flag every violation with line number.

### Custom 2: `--api-name` Semantic Consistency

The `--api-name` flag means different things in different commands:
- `sf agent activate/deactivate`: Bot API name
- `sf agent publish/validate authoring-bundle`: AiAuthoringBundle developer_name
- `sf agent test run`: AiEvaluationDefinition name
- `sf agent test create`: Name to assign to the new AiEvaluationDefinition

Check that the RF correctly identifies what `--api-name` refers to in
every command where it appears. Flag any ambiguity or incorrect labeling.

### Custom 3: Versioning Model Consistency

The RF describes a complex versioning model (naked vs. version-suffixed
authoring bundles, draft vs. locked states, `<target>` element behavior).
Check that the versioning model is described consistently across all
sections. Flag any contradictions between:
- Section 1 (structure) and Section 4 (working with bundles)
- Section 4 (post-publish) and Section 5 (publishing)
- Section 4 (edge cases) and Section 7 (retrieve operations)

### Custom 4: Agent Pseudo-Type Coverage

The `Agent:X` pseudo-type is mentioned in multiple sections. Check that:
- Every mention is consistent about what it includes/excludes
- No section claims `Agent:X` includes `AiAuthoringBundle`
- The distinction between `Agent:X` and `AiAuthoringBundle:X` is clear

### Custom 5: Deploy Safety Guidance

Accidental deploys are a major risk documented in the RF. Check that:
- The warning about accidental deploys is consistent across all sections
- The recommended safe deploy command (`--metadata ApexClass Flow`) is
  used consistently
- No section shows a bare `sf project deploy start` as a recommended
  routine practice

### Custom 6: Test Lifecycle Accuracy

Verify every test-related claim against `.a4drules/agent-testing-rules-no-edit.md`:
- Test spec location (`specs/` at project root, not package directory)
- `sf agent test create` flags and behavior
- `sf agent test run` flags (especially: no `--name` flag, `--api-name`
  refers to AiEvaluationDefinition, `--wait` for synchronous execution)
- Warning against `sf agent generate test-spec` for programmatic use
- The create-before-run constraint

### Custom 7: Authoritative Tone

The consuming agent is mid-tier. Flag any hedging language ("you might
consider," "it's generally a good idea," "one approach could be") that
the agent might treat as optional rather than directive.

### Custom 8: No Markdown Tables

The project convention is to use bullet lists instead of markdown tables.
Flag any markdown tables in the RF.

### Custom 9: Example Name Consistency

All examples should use `Local_Info_Agent` / `"Local Info Agent"` as the
agent name. Flag any instances of `Coral_Cloud_Resort_Agent`, `My_Agent`,
`My_Test`, or other inconsistent names.

---

## Report Format

Write the report to
`afdx-pro-code-testdrive/claude-collaboration/rf4-analysis-report.md`

Structure your report as follows:

```
# RF4 — Agent Metadata & Lifecycle — Analysis Report

**Analysis Date:** [date]
**RF File:** agent-script-skill/references/agent-metadata-and-lifecycle.md
**Review Stance:** Adversarial

---

## Dimension 1: Completeness
[findings per 1a, 1b, 1c, 1d]

## Dimension 2: Information Flow
[findings per 2a, 2b, 2c]

## Dimension 3: Technical Accuracy
[findings per 3a, 3b, 3c, 3d]

## Dimension 4: Consuming Agent Effectiveness
[findings per 4a, 4b, 4c, 4d]

## Custom Evaluations
[findings per Custom 1-9]

---

## Summary

### Overall Assessment
[1-2 paragraph qualitative assessment — be honest, not kind]

### Prioritized Action Items
[Priority 1 (HIGH), Priority 2 (MEDIUM), Priority 3 (LOW)]
[Each with: what to fix, where (line numbers), estimated effort, impact]
```
