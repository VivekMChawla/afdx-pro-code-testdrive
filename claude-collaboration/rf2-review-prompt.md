# Review Prompt: RF2 — Design & Agent Spec Creation

> **Purpose**: This prompt drives a deep-thinking sub-agent analysis of
> RF2 (Design & Agent Spec Creation). The sub-agent produces a detailed
> report with findings and prioritized action items. It does NOT make any
> edits.
>
> **Based on**: `rf-review-prompt.md` (generic framework) with RF2-specific
> inputs and custom evaluations merged in.

---

## Input Variables

- **RF under review**: `afdx-pro-code-testdrive/agent-script-skill/references/agent-design-and-spec-creation.md`
- **RF label**: RF2 — Design & Agent Spec Creation
- **Authoritative rules file**: `afdx-pro-code-testdrive/.a4drules/agent-script-rules-no-edit.md`
- **Source files to verify against**:
  - `salesforcedocs/genai-main/content/en-us/agentforce/guides/agentforce/agent-script/` (official Salesforce docs)
  - `agent-script-recipes/force-app/main/04_architecturalPatterns/` (architecture pattern examples)
  - `jaganpro/sf-skills/sf-ai-agentscript/` (Jag's existing skill for comparison)
  - `afdx-pro-code-testdrive/force-app/main/default/aiAuthoringBundles/Local_Info_Agent/` (reference agent)
- **Sibling RFs already complete**:
  - RF1 (Core Language): `afdx-pro-code-testdrive/agent-script-skill/references/agent-script-core-language.md`
- **Collaboration context**: `afdx-pro-code-testdrive/claude-collaboration/collaboration-context.md`
- **SKILL.md (router)**: `afdx-pro-code-testdrive/agent-script-skill/SKILL.md`

---

## Instructions to the Sub-Agent

You are analyzing a reference file that is part of a Claude Skill. This
file will be read by a mid-tier AI agent (the "consuming agent") to learn
a specific domain. Your job is to evaluate the file's quality across four
core dimensions and the custom evaluations defined below, then produce a
written report.

**Critical rules:**
- Do NOT edit any files. Report only.
- Read ALL files listed in the Input Variables before beginning analysis.
- Verify claims against source materials, not your own training data.
- When you find an issue, cite the specific line number(s) in the RF.
- Distinguish between "confirmed wrong" and "unverifiable but plausible."
- Structure your report using the exact dimension headings below.

---

## Dimension 1: Completeness

Determine whether the RF covers everything it should — and nothing it
shouldn't.

### 1a. Coverage Map

For every substantive rule, concept, or pattern in the authoritative rules
file that falls within this RF's scope, confirm it is covered in the RF.
Present as a list with:
- Topic name
- RF line coverage (or "MISSING")
- Source reference (file and line)

### 1b. Missing Items

List anything within this RF's scope that is not covered. For each:
- What is missing
- Where the authoritative source documents it
- Impact assessment (how would the consuming agent be affected)

### 1c. Scope Boundary Check

List items that are correctly deferred to sibling RFs. For each:
- Topic name
- Which sibling RF should cover it
- Brief rationale

Also flag any content in this RF that belongs in a sibling RF (scope
bleed). Cite the specific lines.

### 1d. Redundancy with Sibling RFs

Identify content that overlaps with RF1 (Core Language). For each instance:
- What overlaps
- Lines in this RF and in RF1
- Assessment: intentional reinforcement or harmful duplication?

---

## Dimension 2: Information Flow

Evaluate whether the RF reads coherently from top to bottom.

### 2a. Section Progression

For each section, assess whether it logically follows the previous one.
Flag any section that assumes knowledge not yet introduced.

### 2b. Forward References

Identify every instance where the RF uses a concept before it is formally
introduced. For each:
- What concept is referenced
- Where it is used (line number)
- Where it is formally introduced (line number or "not introduced")
- Severity: LOW (self-explanatory in context), MODERATE (causes confusion),
  HIGH (blocks understanding)

### 2c. Internal Consistency

Check that terminology, formatting conventions, and structural patterns
are consistent throughout the file. Flag any inconsistencies with line
numbers.

---

## Dimension 3: Technical Accuracy

Verify every technical claim against source materials.

### 3a. Section-by-Section Verification

For each section, list every verifiable claim and its source verification
status. Use:
- ✓ ACCURATE (cite source)
- ❌ INACCURATE (cite source, explain discrepancy)
- ⚠ UNVERIFIABLE (explain why — but assess whether it is logically sound)

### 3b. Code Sample Validation

For every code sample in the RF:
- Does it follow the syntax rules from the authoritative rules file?
- Are WRONG examples clearly labeled as WRONG?
- Are RIGHT examples actually correct?
- Do examples use consistent conventions (naming, ordering, formatting)?

### 3c. Inaccuracies Summary

Collect all inaccuracies into a single prioritized list with line numbers
and recommended corrections.

---

## Dimension 4: Consuming Agent Effectiveness

Evaluate whether a cold mid-tier AI agent would produce correct output
after reading this RF.

### 4a. Actionability

For each section, assess: does the content tell the consuming agent what
to DO, or does it merely describe concepts? Flag sections that inform
without directing.

### 4b. Ambiguity Risks

Identify content that a mid-tier model might misinterpret. Focus on:
- Implicit knowledge (things a human would infer but an LLM might not)
- Overloaded terms (same word used with different meanings)
- Nuanced distinctions that require careful reasoning

### 4c. Token Efficiency

Estimate the total token count of the RF. Assess whether every section
earns its tokens — does it change how the consuming agent behaves? Flag
any content that could be cut without reducing the agent's capability.

### 4d. WRONG/RIGHT Pattern Coverage

List all WRONG/RIGHT pairs. For each:
- What mistake does the WRONG example teach the agent to avoid?
- Is the mistake common enough to warrant the token cost?
- Is the RIGHT example the canonical way to do it?

---

## Custom Evaluations

### Custom 1: RF1 Convention Adherence

RF2 code samples must follow conventions established in RF1. Check every
agentscript code block for:

- **Inner-block ordering**: Within a `reasoning:` block, `instructions:`
  must appear before `actions:`. Flag any code sample where `actions:`
  precedes `instructions:` within the same `reasoning:` block. Exception:
  topics that genuinely have no instructions (routing-only topics with
  only transition actions) are acceptable.

- **Action reference tagging**: When an action is referenced by name
  inside an `instructions:` block, it must use `{!@actions.X}` syntax,
  not plain text. Check every instructions block for untagged action
  references.

- **Boolean capitalization**: `True` and `False`, never `true` or `false`.

- **Indentation**: 4 spaces per level, never tabs.

- **`!=` only**: Never `<>` for inequality.

### Custom 2: Bidirectional Openings

RF2 serves agents that both create new agents and comprehend/diagnose
existing ones. Check every section opening to confirm it addresses both
directions. Flag any opening that only speaks to the "create a new agent"
use case.

### Custom 3: Section 6/7 Separation

Sections 6 (Deterministic vs. Subjective Flow Control) and 7 (Gating
Patterns) were deliberately separated during review:

- Section 6 covers the **decision**: when to use deterministic control vs.
  LLM reasoning. It should show only WRONG examples for misclassification,
  then point the reader to Section 7 for implementation.

- Section 7 covers the **mechanisms**: `available when`, conditional
  instructions, `before_reasoning` guards, multi-condition gating,
  sequential gates.

Check that this separation is clean. Flag any implementation detail that
leaked into Section 6 or any decision-making content that leaked into
Section 7.

### Custom 4: WRONG Example Labeling

Every code sample that demonstrates an anti-pattern or incorrect approach
must be explicitly labeled with **WRONG** (or equivalent). Check for any
unlabeled anti-pattern code that a consuming agent might interpret as a
correct template.

### Custom 5: Authoritative Tone

The consuming agent is mid-tier. Content must be authoritative and direct,
not hedging or nuanced. Flag any instances of:
- "You might want to consider..."
- "It's generally a good idea to..."
- "One approach could be..."
- Or similar hedging language that a mid-tier model might treat as optional

---

## Report Format

Structure your report as follows:

```
# RF2 — Design & Agent Spec Creation — Analysis Report

**Analysis Date:** [date]
**RF File:** afdx-pro-code-testdrive/agent-script-skill/references/agent-design-and-spec-creation.md

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
[1-2 paragraph qualitative assessment]

### Prioritized Action Items
[Priority 1 (HIGH), Priority 2 (MEDIUM), Priority 3 (LOW)]
[Each with: what to fix, where (line numbers), estimated effort, impact]
```
