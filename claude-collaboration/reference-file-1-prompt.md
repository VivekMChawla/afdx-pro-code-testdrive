# Writing Prompt: Reference File 1 — Agent Script Core Language

> **Output file**: `afdx-pro-code-testdrive/agent-script-skill/references/agent-script-core-language.md`
>
> **What you are building**: The foundational reference file for a Claude Skill
> that teaches a consuming AI agent how to read, write, and debug Agent Script
> — a Salesforce-proprietary language with zero public training data.

---

## Step 0: Read Before Writing

Read these files in this exact order before writing anything. Each builds
on the previous.

1. **Project context** — understand the full skill architecture:
   `afdx-pro-code-testdrive/claude-collaboration/collaboration-context.md`

2. **SKILL.md (router)** — understand how the consuming agent arrives at this file:
   `afdx-pro-code-testdrive/agent-script-skill/SKILL.md`

3. **Working context for this file** — contains the finalized outline, all
   conflict resolutions, content scope, and ordering rationale:
   `afdx-pro-code-testdrive/claude-collaboration/rf1-context.md`

4. **Steel threads** — acceptance scenarios the complete skill must satisfy:
   `afdx-pro-code-testdrive/claude-collaboration/steel-threads.md`

---

## Step 1: Domain Reads

Read these source files to extract content. The AUTHORITATIVE source is
listed first. When conflicts arise between sources, follow the conflict
resolutions documented in `rf1-context.md`.

### Source Priority

**AUTHORITATIVE** (prioritize over all other sources):

1. `.a4drules/agent-script-rules-no-edit.md` (785 lines)
   Created and tested by the skill author. Comprehensive coverage of
   syntax, structure, anti-patterns, validation checklist, and examples.
   All conflicts have been resolved in favor of this file unless
   explicitly overridden in `rf1-context.md`.

**OFFICIAL DOCUMENTATION** (14 files — read the 6 most critical):

2. `salesforcedocs/.../guides/agentforce/agent-script/ascript-lang.md`
   — Language characteristics, split-brain execution model
3. `salesforcedocs/.../guides/agentforce/agent-script/ascript-blocks.md`
   — Block structure definitions
4. `salesforcedocs/.../guides/agentforce/agent-script/ascript-flow.md`
   — Flow of control, worked example of topic to resolved prompt
5. `salesforcedocs/.../guides/agentforce/agent-script/ascript-ref-instructions.md`
   — Reasoning instructions syntax (arrow vs pipe)
6. `salesforcedocs/.../guides/agentforce/agent-script/ascript-ref-actions.md`
   — Action definitions, target protocols, inputs/outputs
7. `salesforcedocs/.../guides/agentforce/agent-script/ascript-ref-tools.md`
   — Reasoning actions, `available when`, topic-as-tool vs transition

   Additional official docs (read if needed for specific sections):
   `ascript-ref-variables.md`, `ascript-ref-utils.md`,
   `ascript-ref-expressions.md`, `ascript-ref-operators.md`,
   `ascript-ref-before-after-reasoning.md`, `ascript-example.md`

**CANONICAL EXAMPLE**:

8. `afdx-pro-code-testdrive/force-app/main/default/aiAuthoringBundles/Local_Info_Agent/Local_Info_Agent.agent`
   — 268 lines. 3 domain topics + escalation + off-topic + ambiguous
   guardrails. Ground all syntax examples against this file.

**SUPPLEMENTARY** (mine for patterns, do not treat as authoritative):

9. Language essentials recipes:
   `agent-script-recipes/force-app/main/01_languageEssentials/`
   — HelloWorld, TemplateExpressions, VariableManagement

10. Session 1 draft:
    `afdx-pro-code-testdrive/claude-collaboration/agent-script-skill/references/syntax-rules.md`
    — 658 lines. Mine for well-expressed WRONG/RIGHT pairs. Content is
    unreviewed. Some sections belong to Files 2-4, not File 1.

11. Jag's syntax-reference.md:
    `jaganpro/sf-skills/sf-ai-agentscript/resources/syntax-reference.md`
    — 487 lines. TDD-validated findings. Good for `complex_data_type_name`
    mapping and additional target protocols. Do NOT include the `<>` operator.

---

## Step 2: Write the File

### Finalized Outline (13 Sections)

Follow this outline exactly. The ordering was debated and finalized with
the skill author. See `rf1-context.md` for the rationale behind each
positioning decision.

1. **TOC**
2. **How Agent Script Executes** — Split-brain model. Runtime resolves
   reasoning instructions deterministically (if/else, run, set) to build
   a prompt string. LLM only reasons after the resolved prompt is complete.
   Include a worked example showing topic source to resolved prompt.
3. **File Structure and Block Ordering** — Eight blocks in mandatory
   order: `system, config, variables, connections, knowledge, language,
   start_agent, topics`. Which are required. Internal ordering within
   topic blocks.
4. **Naming and Formatting Rules** — Name constraints, 4-space indent,
   NEVER tabs, comments.
5. **Expressions and Operators** — Comparison (`==`, `!=`, `<`, `>`,
   `<=`, `>=`), logical (`AND`, `OR`, `NOT`), arithmetic (`+`, `-`,
   `*`, `/`), access (`@variables.X`), conditional (`if/else`). Template
   injection `{!expression}`. Resource references. NEVER use `<>`.
6. **System and Config Blocks** — Required fields, messages,
   instructions. Field is `developer_name` (NOT `agent_name`).
7. **Variables** — Mutable vs linked, types by context, defaults,
   template injection `{!@variables.X}`, boolean capitalization (`True`/`False`).
8. **Topics** — Topic structure, internal block ordering,
   before/after_reasoning directive blocks, topic-level system overrides.
   Does NOT cover `start_agent` (that's in Flow Control).
9. **Reasoning Instructions** — Arrow (`->`) vs pipe (`|`) modes,
   if/else (no `else if`), inline `run @actions.X`, how pipe sections
   become the prompt the LLM receives.
10. **Flow Control** — `start_agent` routing, conditional branching,
    deterministic transitions (`transition to` in directive blocks),
    LLM-chosen transitions (`@utils.transition to` in reasoning.actions),
    delegation with return (`@topic.X` in reasoning.actions).
11. **Actions** — Unified section: definition syntax in topic.actions,
    target protocols (`apex://`, `prompt://`, `flow://`), inputs/outputs,
    `complex_data_type_name`, deterministic invocation via `run @actions.X`,
    LLM exposure via `reasoning.actions`, `available when` conditions,
    `with` binding, `set` outputs, post-action directives.
12. **Utility Functions** — `@utils.transition to`, `@utils.escalate`,
    `@utils.setVariables`, `@topic.X` delegation mechanics.
13. **Anti-Patterns** — WRONG/RIGHT pairs from `.a4drules`. Capstone
    section reinforcing all preceding concepts.

---

## Conflict Resolutions (Already Decided)

These were resolved through discussion with the skill author. Do NOT
revisit or present alternatives. Apply them as stated.

1. **`developer_name`** (not `agent_name`) in config blocks.
2. **Block ordering**: Follow `.a4drules` strict order. Do not mention
   that the compiler accepts other orderings.
3. **`!=` only**: Never include `<>` as an inequality operator.
4. **Indentation**: ALWAYS spaces, NEVER tabs, default 4 spaces.
5. **`prompt://`**: Use short form in examples. Note that
   `generatePromptResponse://` is the long form and both work.

---

## Writing Rules

These are non-negotiable. Violating any of them produces a file that
fails its purpose.

### Audience

The reader is a **consuming AI agent** (an LLM like Claude) that will
use this file to generate Agent Script code. Every line must change how
the agent writes, reads, or debugs Agent Script. Do NOT write for human
skill designers.

### Identity

**CRITICAL**: Agent Script is NOT AppleScript, JavaScript, Python, YAML,
or any other language. The consuming agent has ZERO training data for
Agent Script. Do not assume familiarity. Do not use analogies to other
languages. Every construct must be taught from scratch.

### Style

- **Prose over tables.** LLMs process prose more reliably than tabular
  data. Use tables only when the content is genuinely tabular (e.g., a
  list of operators with descriptions).
- **Interweave grammar and examples.** Every rule gets an inline code
  example immediately after it (Design Principle 2). Do not batch all
  examples at the end.
- **WRONG/RIGHT pairs for anti-patterns.** Show the incorrect code,
  explain WHY it breaks (tied to the execution model), then show the
  correct version. Implicit reasoning breaks mid-tier models.
- **No analogies to other languages.** This reinforces the identity rule.
- **`--json` flag**: Always include in any `sf` CLI command examples.

### Scope Boundaries

Content that belongs in OTHER reference files — do NOT include it here:

- Discovery Questions, Writing Effective Instructions, Action Loop
  Prevention, Grounding Considerations → File 2
- Validation commands and checklists → File 3
- Metadata locations, deployment, lifecycle → File 4

### Target Length

~300 lines. If exceeding, justify the overage by the density of the
content. This file covers the most ground of any reference file, so
moderate overage is expected, but avoid bloat.

---

## Quality Checks (Self-Verify Before Delivering)

After writing, verify the file against these criteria:

1. Does every section in the outline appear in the correct order?
2. Does the execution model (split-brain) appear in Section 2 and get
   reinforced in Actions (Section 11) and Anti-Patterns (Section 13)?
3. Are all 5 conflict resolutions correctly applied throughout?
4. Does every rule have an inline code example?
5. Do all anti-patterns use WRONG/RIGHT format with semantic explanation?
6. Is `developer_name` used everywhere (never `agent_name`)?
7. Is indentation consistently 4 spaces (never tabs)?
8. Is the `<>` operator absent from the entire file?
9. Are there zero analogies to other programming languages?
10. Would a consuming agent with zero Agent Script knowledge be able to
    write a syntactically valid `.agent` file after reading this?
