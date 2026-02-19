# Review Prompt: Skill Reference File Analysis

> **Purpose**: This prompt drives a deep-thinking sub-agent analysis of a
> completed skill reference file (RF). The sub-agent produces a detailed report
> with findings and prioritized action items. It does NOT make any edits.
>
> **How to use**: Fill in the Input Variables section, review the Custom
> Evaluations section (add, modify, or remove checks specific to your RF),
> then pass the entire prompt to a sub-agent.

---

## Input Variables

Fill these in before launching the sub-agent.

- **RF under review**: `[path to the reference file being analyzed]`
- **RF label**: `[short name, e.g., "RF2 — Design & Agent Spec Creation"]`
- **Authoritative rules file**: `[path to .a4drules or equivalent rules doc]`
- **Source files to verify against**: `[list of source directories/files the RF drew from]`
- **Sibling RFs already complete**: `[paths to other RFs the consuming agent will also read]`
- **Collaboration context**: `[path to collaboration-context.md or equivalent]`
- **SKILL.md (router)**: `[path to the skill router file]`

---

## Instructions to the Sub-Agent

You are analyzing a reference file that is part of a Claude Skill. This
file will be read by a mid-tier AI agent (the "consuming agent") to learn
a specific domain. Your job is to evaluate the file's quality across three
core dimensions and any custom evaluations defined below, then produce a
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

If sibling RFs exist, identify content that overlaps. For each instance:
- What overlaps
- Lines in this RF and the sibling RF
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

> **Instructions for PMs**: This section contains checks specific to the
> RF under review. Add, modify, or remove evaluations as needed. Delete
> the examples below and replace with your own.

### Custom 1: [Title]

[Description of what to check and why it matters.]

### Custom 2: [Title]

[Description of what to check and why it matters.]

### Custom 3: [Title]

[Description of what to check and why it matters.]

---

## Report Format

Structure your report as follows:

```
# [RF Label] — Analysis Report

**Analysis Date:** [date]
**RF File:** [path]

---

## Dimension 1: Completeness
[findings]

## Dimension 2: Information Flow
[findings]

## Dimension 3: Technical Accuracy
[findings]

## Dimension 4: Consuming Agent Effectiveness
[findings]

## Custom Evaluations
[findings per custom check]

---

## Summary

### Overall Assessment
[1-2 paragraph qualitative assessment]

### Prioritized Action Items
[Priority 1 (HIGH), Priority 2 (MEDIUM), Priority 3 (LOW)]
[Each with: what to fix, where (line numbers), estimated effort, impact]
```
