# Review Prompt: RF2 — Design & Agent Spec Creation

> **Purpose**: This prompt drives an adversarial sub-agent analysis of
> RF2 (Design & Agent Spec Creation). The sub-agent's job is to find
> every flaw, inaccuracy, inconsistency, and weakness in this file. It
> produces a detailed report. It does NOT make any edits.
>
> **Based on**: `rf-review-prompt.md` (generic framework) with RF2-specific
> inputs and custom evaluations merged in.

---

## Input Variables

- **RF under review**: `afdx-pro-code-testdrive/agent-script-skill/references/agent-design-and-spec-creation.md`
- **RF label**: RF2 — Design & Agent Spec Creation
- **Authoritative source for Agent Script syntax and rules**: `afdx-pro-code-testdrive/.a4drules/agent-script-rules-no-edit.md`
- **Authoritative source for Agent Script platform behavior**: `salesforcedocs/genai-main/content/en-us/agentforce/guides/agentforce/agent-script/` (official Salesforce documentation)
- **Source files for verifying real-world patterns**:
  - `agent-script-recipes/force-app/main/04_architecturalPatterns/` (architecture pattern examples)
  - `afdx-pro-code-testdrive/force-app/main/default/aiAuthoringBundles/Local_Info_Agent/` (reference agent)
- **Sibling RF for cross-reference**: `afdx-pro-code-testdrive/agent-script-skill/references/agent-script-core-language.md` (RF1 — Core Language)
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
how to design Agentforce agents using Agent Script. The consuming agent
has no prior knowledge of Agent Script — everything it knows comes from
this file and its sibling (RF1). If this file contains errors, the
consuming agent will produce broken agents.

**Critical rules:**

- Do NOT edit any files. Report only.
- Do NOT read any collaboration context, working context, or prompt
  files. You must evaluate this RF with fresh eyes, as an outsider
  would. You have no knowledge of the authors' intent, decisions, or
  design rationale. Judge the file purely on what it says and whether
  what it says is correct and useful.
- **Permitted sources for technical accuracy verification:**
  - `.a4drules/agent-script-rules-no-edit.md` (authoritative syntax rules)
  - `salesforcedocs/` directory (official Salesforce documentation)
  - `agent-script-recipes/` (real-world pattern examples)
  - `Local_Info_Agent/` (reference agent implementation)
  - RF1 (sibling reference file, for cross-reference only)
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
  `afdx-pro-code-testdrive/claude-collaboration/rf2-analysis-report.md`

---

## Dimension 1: Completeness

Determine whether the RF covers everything it should — and nothing it
shouldn't.

### 1a. Coverage Map

For every substantive design rule, pattern, or guidance in the
authoritative rules file (`.a4drules`) that falls within RF2's scope
(design patterns, flow control, gating, action loop prevention, Agent
Spec creation), confirm it is covered in the RF. Present as a list with:
- Topic name
- RF line coverage (or "MISSING")
- Source reference (file and line)

### 1b. Missing Items

List anything within RF2's scope that is not covered. For each:
- What is missing
- Where the authoritative source documents it
- Impact assessment (how would the consuming agent be affected)

### 1c. Scope Boundary Check

List items that are correctly deferred to sibling RFs or future files.
Also flag any content in this RF that belongs elsewhere (scope bleed).
Cite specific lines.

### 1d. Redundancy with RF1

Identify content that overlaps with RF1. For each instance:
- What overlaps
- Lines in RF2 and in RF1
- Assessment: does the RF2 version add value beyond what RF1 teaches,
  or is it harmful duplication that could confuse a consuming agent
  seeing the same concept explained two different ways?

---

## Dimension 2: Information Flow

Evaluate whether the RF reads coherently from top to bottom.

### 2a. Section Progression

For each section, assess whether it logically follows the previous one.
Flag any section that assumes knowledge not yet introduced in this file
or in RF1.

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

**Important:** Claims about "Agent Spec" structure, lifecycle stages,
discovery question categories, and similar constructs that do not appear
in `.a4drules` or Salesforce docs should be marked UNVERIFIABLE. These
may be valid design artifacts created by the authors, but you cannot
confirm them from platform documentation. Do not mark them ACCURATE
just because they seem reasonable.

### 3b. Code Sample Validation

For every code sample in the RF:
- Does it follow the syntax rules in `.a4drules`?
- Are WRONG examples clearly labeled as WRONG?
- Are RIGHT examples actually correct per `.a4drules`?
- Do examples use consistent conventions (naming, block ordering,
  formatting)?
- Could any unlabeled example be misread as a correct template?

### 3c. Inaccuracies Summary

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

### 4c. Token Efficiency

Estimate the total token count of the RF (use ~4 tokens per line as a
rough heuristic for mixed prose and code). Assess whether every section
earns its tokens. Flag any content that could be cut without reducing
the agent's capability. Be aggressive — every token in context competes
with the user's actual task.

### 4d. WRONG/RIGHT Pattern Coverage

List all WRONG/RIGHT pairs. For each:
- What mistake does the WRONG example teach the agent to avoid?
- Is the mistake common enough to warrant the token cost?
- Is the RIGHT example actually the canonical way to do it per `.a4drules`?
- Could the WRONG example be misread despite its label?

---

## Custom Evaluations

### Custom 1: RF1 Convention Adherence

RF2 code samples must follow conventions established in RF1. Check every
agentscript code block for:

- **Inner-block ordering**: Within a `reasoning:` block, `instructions:`
  must appear before `actions:`. Flag any violation. Exception: topics
  with only transition actions and no instructions are acceptable.
- **Action reference tagging**: Actions referenced by name inside
  `instructions:` blocks must use `{!@actions.X}` syntax, not plain
  text. Check every instructions block.
- **Boolean capitalization**: `True` and `False`, never `true`/`false`.
- **Indentation**: 4 spaces per level, never tabs.
- **`!=` only**: Never `<>` for inequality.

### Custom 2: Bidirectional Openings

RF2 should serve agents that both create new agents and comprehend/
diagnose existing ones. Check every section opening. Flag any that only
address the "create new agent" direction.

### Custom 3: Section 6/7 Separation

Check whether Section 6 stays focused on the *decision* (when to use
deterministic vs. subjective control) and Section 7 stays focused on
*implementation mechanisms*. Flag any bleed in either direction.

### Custom 4: WRONG Example Labeling

Every code sample showing an anti-pattern must be explicitly labeled
WRONG. Flag any unlabeled anti-pattern that a consuming agent might
copy as a correct template.

### Custom 5: Authoritative Tone

The consuming agent is mid-tier. Flag any hedging language ("you might
consider," "it's generally a good idea," "one approach could be") that
the agent might treat as optional rather than directive.

---

## Report Format

Write the report to
`afdx-pro-code-testdrive/claude-collaboration/rf2-analysis-report.md`

Structure your report as follows:

```
# RF2 — Design & Agent Spec Creation — Analysis Report

**Analysis Date:** [date]
**RF File:** agent-script-skill/references/agent-design-and-spec-creation.md
**Review Stance:** Adversarial

---

## Dimension 1: Completeness
[findings per 1a, 1b, 1c, 1d]

## Dimension 2: Information Flow
[findings per 2a, 2b, 2c]

## Dimension 3: Technical Accuracy
[findings per 3a, 3b, 3c]

## Dimension 4: Consuming Agent Effectiveness
[findings per 4a, 4b, 4c, 4d]

## Custom Evaluations
[findings per Custom 1-5]

---

## Summary

### Overall Assessment
[1-2 paragraph qualitative assessment — be honest, not kind]

### Prioritized Action Items
[Priority 1 (HIGH), Priority 2 (MEDIUM), Priority 3 (LOW)]
[Each with: what to fix, where (line numbers), estimated effort, impact]
```
