# Session 5 Continuation Prompt: File 1 Domain Reads + Writing

## Context

You are continuing a multi-session collaboration with Vivek Chawla to build a
Claude Skill for Agent Script. Read these files first:

1. `afdx-pro-code-testdrive/claude-collaboration/collaboration-context.md` — full project context
2. `afdx-pro-code-testdrive/agent-script-skill/SKILL.md` — the router (already written and reviewed)
3. `afdx-pro-code-testdrive/claude-collaboration/steel-threads.md` — acceptance scenarios

## Current Task

**Work Item 2 + 3 (for File 1 only):** Domain reads then write Reference File 1:
`references/agent-script-core-language.md` (Knowledge Categories A+B).

### Step 1: Domain Reads

Read these source files to extract content for File 1. Do NOT bulk-ingest — read
with purpose, extracting what's needed for the content scope below.

**Sources to read:**

1. **Agent Script syntax reference** (primary):
   `salesforcedocs/genai-main/content/en-us/agentforce/references/agent-script/agent-script-reference.md`

2. **Local Info Agent source** (primary example):
   `afdx-pro-code-testdrive/force-app/main/default/aiAuthoringBundles/Local_Info_Agent/`
   — Read the `.agent` file. This is the canonical example that all constructs
   should be grounded against.

3. **Language essentials recipes** (supplementary patterns):
   `agent-script-recipes/force-app/main/01_languageEssentials/`
   — Read selectively: HelloWorld, TemplateExpressions, VariableManagement,
   SystemInstructionOverrides. Skip LanguageSettings unless it reveals
   something the syntax reference doesn't cover.

4. **Current draft syntax-rules.md** (existing rough draft):
   `afdx-pro-code-testdrive/agent-script-skill/references/syntax-rules.md`
   — Session 1 rough draft. Mine for content that's already well-expressed,
   but don't treat as authoritative. Validate everything against the syntax
   reference and Local Info Agent source.

5. **Jag's syntax-reference.md** (competitive reference):
   `jaganpro/sf-skills/sf-ai-agentscript/resources/syntax-reference.md`
   — Key items to extract: WRONG/RIGHT constraint pairs, TDD-validated gotchas,
   `complex_data_type_name` mapping, reserved field names, canvas corruption bugs.
   Apply the Sub-Agent Review Rules mindset: Jag's content is excellent for
   problem identification, but his structural choices assume his full skill
   ecosystem.

### Step 2: Present Findings to Vivek

After domain reads, present a structured summary to Vivek BEFORE writing:
- Key content extracted from each source
- Any conflicts between sources (syntax ref vs. compiler behavior vs. Jag)
- Proposed content outline for the file
- Any questions or gaps that need Vivek's input

Do NOT start writing without Vivek's review of the outline.

### Step 3: Write File 1

Write `afdx-pro-code-testdrive/agent-script-skill/references/agent-script-core-language.md`.

**Content scope** (from collaboration-context.md Section 10, File Inventory):
- How the Agent Script runtime processes topics, actions, and gating (execution model)
- Block structure and ordering rules (system → config → variables → language → start_agent → topics)
- Syntax: variable declarations, action definitions, transition syntax variants
  (`@utils.transition to` vs bare `transition to`), indentation rules
- Key anti-patterns with WRONG/RIGHT pairs
- Analogies to known languages (YAML, Express.js routes, API contracts)
- Pointer to annotated example asset

**Acceptance criteria** (from Section 11, Item 3):
- (a) Content matches the scope defined in the File Inventory
- (b) TOC at top
- (c) Target 300 lines; if exceeding, justify the overage
- (d) Anti-patterns use WRONG/RIGHT pairs (Design Principle 2)
- (e) Structural format is consistent (will set the pattern for Files 2-5)
- (f) Small duplications of CLI commands across files are intentional

**Writing principles** (critical — review these before writing):
- Write for the consuming agent's behavior, not for skill designers
- Prose over tables for LLM-consumed content
- Teach the execution model first (Design Principle 1)
- Interweave grammar and examples (Design Principle 2)
- Anti-patterns with semantic explanations tied to the execution model (Design Principle 4)
- Agent Script is NOT any other language — do not let training data bleed in
- Always use `--json` flag in any `sf` CLI command examples

## Collaboration Rules

- Vivek processes through conversation. Don't dump a finished file without discussion.
- Sequential, not parallel. Work through the domain reads one source at a time.
- Push back if something seems wrong — directness over agreeableness.
- Keep explanations brief. Flag deeper dives instead of auto-expanding.
