# Writing Prompt: Reference File 3 — Validation & Debugging

> **Output file**: `afdx-pro-code-testdrive/agent-script-skill/references/agent-validation-and-debugging.md`
>
> **What you are building**: The validation and debugging reference file
> for a Claude Skill that teaches a consuming AI agent how to validate
> Agent Script code, preview agent behavior, read session traces, and
> diagnose common issues. The reader already knows syntax (RF1) and
> design patterns (RF2). This file teaches the feedback loop: validate →
> preview → diagnose → fix → re-validate.

---

## Step 0: Read Before Writing

Read these files in this exact order before writing anything. Each builds
on the previous.

1. **Project context** — understand the full skill architecture:
   `afdx-pro-code-testdrive/claude-collaboration/collaboration-context.md`

2. **SKILL.md (router)** — understand how the consuming agent arrives at
   this file:
   `afdx-pro-code-testdrive/agent-script-skill/SKILL.md`

3. **Working context for this file** — contains the finalized outline, all
   conflict resolutions, content scope, and ordering rationale:
   `afdx-pro-code-testdrive/claude-collaboration/rf3-context.md`

4. **Reference File 1 (Core Language)** — understand what the reader
   already knows about syntax, execution model, and block structure. RF3
   must not re-teach RF1 content:
   `afdx-pro-code-testdrive/agent-script-skill/references/agent-script-core-language.md`

5. **Reference File 2 (Design & Agent Spec)** — understand what the reader
   already knows about design patterns, grounding considerations, and
   gating. RF3 must not re-teach RF2 content. Pay special attention to RF2's
   grounding section (design-time concern) — RF3 covers grounding as a
   diagnostic concern:
   `afdx-pro-code-testdrive/agent-script-skill/references/agent-design-and-spec-creation.md`

6. **Steel threads** — acceptance scenarios the complete skill must satisfy:
   `afdx-pro-code-testdrive/claude-collaboration/steel-threads.md`

---

## Step 1: Domain Reads

Read these source files to extract content. The AUTHORITATIVE sources are
listed first. When conflicts arise between sources, follow the conflict
resolutions documented in `rf3-context.md`.

### Source Priority

**AUTHORITATIVE** (prioritize over all other sources):

1. `.a4drules/agent-preview-rules-no-edit.md` (177 lines)
   Created and tested by the skill author. Comprehensive coverage of
   programmatic preview workflow (start/send/end), execution modes
   (simulated vs. live), agent identification flags (`--authoring-bundle`
   vs. `--api-name`), target org handling, session traces, and 6 common
   preview mistakes with WRONG/RIGHT pairs.

2. `.a4drules/agent-debugging-rules-no-edit.md` (179 lines)
   Created and tested by the skill author. Session trace file structure,
   11 trace step types, 4 diagnostic patterns (wrong topic routing,
   actions not firing, grounding failures, loops), grounding retry
   mechanism, LLMStep detail, and 8-step diagnostic workflow.

3. `.a4drules/agent-script-rules-no-edit.md` (partial — lines 56-61,
   683-785)
   Validation command (line 56-61), validation checklist (lines 683-701,
   14 items), and error prevention section (lines 704-785, 7 common
   mistakes with WRONG/RIGHT pairs).

**OFFICIAL DOCUMENTATION** (OUT OF DATE on preview — use with caution):

4. `salesforcedocs/.../guides/agentforce/agent-dx/agent-dx-nga-preview.md`
   — VS Code Agent Preview pane, simulated vs. live mode descriptions,
   Apex Replay Debugger integration, Agent Tracer tab. **CAUTION**: The
   connected app / OAuth / `--client-app` requirements described in these
   docs have been REMOVED. The only difference between previewing an
   Agent Script agent and a published agent is the flag:
   `--authoring-bundle` (Agent Script) vs. `--api-name` (published).
   Do NOT include connected app setup instructions.

5. `salesforcedocs/.../guides/agentforce/agent-dx/agent-dx-preview.md`
   — Published agent preview. Same caution as above — connected app
   setup is outdated. Use only for transcript/response file format
   reference.

**CANONICAL EXAMPLE**:

6. `afdx-pro-code-testdrive/force-app/main/default/aiAuthoringBundles/Local_Info_Agent/Local_Info_Agent.agent`
   — 268 lines. Use as the agent in diagnostic examples and preview
   command examples.

**SUPPLEMENTARY** (mine for concepts, do not treat as authoritative):

7. Jag's debugging-guide.md:
   `jaganpro/sf-skills/sf-ai-agentscript/resources/debugging-guide.md`
   — 318 lines. 4 debugging views (VS Code UI-centric — map concepts to
   programmatic trace analysis, don't teach the UI tabs), 6 span types
   with latency benchmarks, 5 debug patterns with code fixes, diagnostic
   checklist. **INACCURACY**: Uses `sf agent validate --source-dir
   ./agent` — the correct command per `.a4drules` is `sf agent validate
   authoring-bundle --api-name <NAME>`.

---

## Step 2: Write the File

### Finalized Outline (6 Sections)

Follow this outline exactly. The ordering was debated and finalized with
the skill author. See `rf3-context.md` for the rationale behind each
positioning decision.

1. **Validation** — The `sf agent validate authoring-bundle` command.
   When to run it (after every modification to `.agent` files). What it
   checks. How to interpret output. The validation checklist as a
   pre-validate mental model (14 items from `.a4drules` lines 683-701).
   Always pass `--json` when calling from an AI assistant or script.

2. **Error Taxonomy and Prevention** — Classification of validation
   errors: block ordering, indentation, syntax, missing declarations,
   type mismatches, structural errors. Common mistakes with WRONG/RIGHT
   pairs (from `.a4drules` Error Prevention section, lines 704-785).
   Error-to-root-cause mapping: when you see error X, the cause is Y,
   the fix is Z. Frame these as "how to fix broken code" — the reader
   already knows the correct syntax from RF1.

3. **Preview** — Programmatic workflow: start session → send utterances →
   end session. All three commands with correct flags. Execution modes:
   simulated (default — fake action outputs via LLM) vs. live
   (`--use-live-actions` — real backing code). When to use each mode
   (simulated for early experimentation; live when backing code is
   deployed and you need real data flow, grounding validation, or
   variable-driven branching). Agent identification:
   `--authoring-bundle <name>` for Agent Script agents,
   `--api-name <name>` for published agents. These are the ONLY
   differences — no additional setup required for published agents.
   `--use-live-actions` is ONLY valid with `--authoring-bundle`;
   published agents always execute real actions. Target org handling
   (omit `--target-org`, rely on project default). Common preview
   mistakes with WRONG/RIGHT pairs (from `agent-preview-rules`).

4. **Session Traces** — Trace file location
   (`.sfdx/agents/<NAME>/sessions/<ID>/`). File structure:
   `metadata.json`, `transcript.jsonl`, `traces/<PLAN_ID>.json`. Traces
   are available after every `send` — you do NOT need to end the session
   to read them. The 11 step types from `agent-debugging-rules` and what
   each tells you (present as a reference table — this IS genuinely
   tabular content). How to read a trace chronologically. The LLMStep
   in detail: `messages_sent` (full prompt the LLM saw), `tools_sent`
   (available actions), `response_messages` (what the LLM chose),
   `execution_latency`. When the transcript is sufficient vs. when you
   need the full trace.

5. **Diagnostic Patterns** — Structured symptom → trace analysis → root
   cause → fix patterns for each of these issues:
   - **Wrong topic routing**: Check `LLMStep` where `agent_name` is
     `topic_selector`. Examine `tools_sent` and `response_messages`.
   - **Actions not firing**: Check `EnabledToolsStep` for action
     visibility. If missing, check `available when` gate + variable
     state in `NodeEntryStateStep`. If visible but not called, check
     `LLMStep` response.
   - **Action loops**: Look for repeated `TransitionStep` entries,
     unconditional `before_reasoning` actions, missing exit conditions.
   - **"Unexpected error" responses**: Check `PlannerResponseStep` for
     system error message. Look backward for consecutive `UNGROUNDED`
     `ReasoningStep` entries (two UNGROUNDED = agent gives up).
   - **Post-action logic not running**: Check instruction resolution
     order — post-action checks must be at the TOP of instructions, not
     after transition logic.
   Each pattern should include a code example showing the WRONG
   configuration and the fix.

6. **Diagnostic Workflow** — The systematic approach that ties all
   previous sections together:
   1. Reproduce — use `sf agent preview start/send/end` with `--json`
   2. Locate — find the failing turn in `transcript.jsonl`
   3. Read the trace — open `traces/<PLAN_ID>.json` for the failing turn
   4. Follow execution — read steps in order, noting: topic selected,
      variable state, actions available vs. invoked, what the LLM saw
      in its prompt, what it responded with, grounding check result
   5. Identify the gap — compare expected behavior to actual at each step
   6. Fix — update Agent Script instructions, variable logic, or action
      definitions
   7. Validate — `sf agent validate authoring-bundle --api-name <NAME>`
   8. Re-test — new preview session, compare traces

   **Grounding subsection** (dedicated depth within this section):
   The grounding retry mechanism: when the platform flags a response as
   UNGROUNDED, it injects an error message as a `role: "user"` message
   and gives the LLM a second chance. If the second attempt is also
   UNGROUNDED, the agent returns the system error message. This retry
   is visible in traces as repeated `LLMStep` → `ReasoningStep` pairs.
   The grounding checker is NON-DETERMINISTIC — the same response may
   pass on one attempt and fail on the next. Common grounding failure
   causes: date inference ("today" instead of specific date), unit
   conversion, embellishment (adding details not in action output),
   loose paraphrasing. Diagnosing: compare `FunctionStep` output with
   `LLMStep` response to find where the response diverges. Fix: update
   instructions to tell the agent to use specific values from action
   output verbatim. Why simulated mode CANNOT reproduce grounding
   failures — simulated mode generates fake action outputs, so the
   grounding checker has no real data to validate against.

---

## Conflict Resolutions (Already Decided)

These were resolved through discussion with the skill author. Do NOT
revisit or present alternatives. Apply them as stated.

1. **AFDX docs vs. `.a4drules` on published agent preview**: AFDX docs
   describe complex connected app / OAuth / `--client-app` setup. This
   has been REMOVED. The only difference is `--api-name` (published) vs.
   `--authoring-bundle` (Agent Script). Use `.a4drules` as authoritative.
   Do NOT include connected app setup instructions.

2. **Jag's validate command vs. `.a4drules`**: Jag uses
   `sf agent validate --source-dir ./agent`. The correct command per
   `.a4drules` is `sf agent validate authoring-bundle --api-name <NAME>`.
   Use `.a4drules` as authoritative.

3. **Jag's 4 debugging views vs. programmatic trace analysis**: Jag's
   guide describes VS Code UI tabs (Interaction Details, Trace Waterfall,
   Variable State, Script View). Our consuming agent works
   programmatically — it reads trace files, not UI tabs. Do NOT teach the
   VS Code UI views. Adopt Jag's concepts (span types, variable state
   entry/exit analysis, latency benchmarks) and map them to trace file
   fields.

4. **Two trace output formats**: Authoring bundle preview stores traces
   at `.sfdx/agents/<NAME>/sessions/<ID>/` with `transcript.jsonl` +
   `traces/<PLAN_ID>.json`. Published agent preview stores
   `transcript.json` + `responses.json` in a user-specified output dir.
   Teach the authoring bundle trace format as primary. Mention the
   published agent format briefly with the key difference (no detailed
   trace steps — just transcript and API responses).

---

## Writing Rules

These are non-negotiable. Violating any of them produces a file that
fails its purpose.

### Audience

The reader is a **consuming AI agent** (an LLM like Claude) that will
use this file to validate, preview, and debug Agentforce agents. Every
line must change how the agent diagnoses and fixes issues. Do NOT write
for human developers reading traces in a browser.

### Identity

**CRITICAL**: Agent Script is NOT AppleScript, JavaScript, Python, YAML,
or any other language. The consuming agent has ZERO training data for
Agent Script. Do not assume familiarity. Do not use analogies to other
languages.

### Tone

**Authoritative and direct.** State diagnostic rules as facts. When a
trace pattern maps to a specific root cause, say so plainly. Use phrases
like "Always," "Never," "When you see X, the cause is Y" — not
"Consider," "You might want to check," "It could be."

### Style

- **Prose over tables.** LLMs process prose more reliably than tabular
  data. Use tables only when the content is genuinely tabular. The step
  type reference (11 types with descriptions) IS genuinely tabular —
  use a table there.
- **WRONG/RIGHT pairs inline.** Place anti-patterns within the section
  where they occur. Show the incorrect code or command, explain WHY it
  fails, then show the correct version.
- **Diagnostic patterns follow a fixed structure.** Every pattern:
  symptom → which trace steps to examine → root cause → fix (code
  example). Do not deviate from this structure.
- **All CLI commands use `--json`.** The consuming agent is programmatic.
  Never show interactive REPL commands.
- **No analogies to other languages.** This reinforces the identity rule.

### Source Attribution

**NON-NEGOTIABLE.** Every technical claim must include an inline source
citation in this exact format:

```
[SOURCE: filename (line N)]
```

Examples:
- `[SOURCE: agent-preview-rules (line 44)]`
- `[SOURCE: agent-debugging-rules (lines 62-66)]`
- `[SOURCE: agent-script-rules (line 689)]`

When a claim is grounded by multiple sources, list them:
- `[SOURCE: agent-preview-rules (line 44), agent-debugging-rules (line 109)]`

These citations make the file auditable. They will be regex-stripped
(`\[SOURCE:.*?\]`) after review. Do NOT omit them — a claim without a
source citation is an unverifiable claim.

For claims derived from Jag's supplementary guide, cite as:
- `[SOURCE: jag/debugging-guide (line N)]`

For claims from official Salesforce docs, cite as:
- `[SOURCE: salesforcedocs/agent-dx-nga-preview (line N)]`

### RF1/RF2 Conventions (Carry Forward)

These conventions were established during RF1 and RF2 review. Follow
them exactly:

- **Action reference tagging.** When referencing an action by name inside
  an `instructions:` block, use `{!@actions.action_name}` syntax. Do NOT
  use plain text action names in instructions.
- **Inner-block ordering.** Within `reasoning:` blocks, `instructions:`
  comes before `actions:`. Routing-only topics with no instructions are
  the only exception.
- **Verbosity principle.** Tighter is better. If the core statement is
  accurate and complete, do not add explanatory dash clauses or
  parenthetical expansions. Every token must earn its place.
- **Boolean capitalization.** `True`/`False` (capitalized). This is
  established in RF1 — do not re-teach it, but use it correctly in all
  code examples.

### Scope Boundaries

Content that belongs in OTHER reference files — do NOT include it here:

- Syntax rules, block structure, expression operators → RF1 (Core Language)
- Execution model mechanics (two-phase runtime) → RF1 (Core Language)
- Design patterns, Agent Spec, topic architecture → RF2 (Design & Agent Spec)
- Design-time grounding considerations (instruction writing) → RF2
- Deploy/publish/activate pipeline → RF4 (Metadata & Lifecycle)
- Test spec authoring → RF5 (Test Authoring)

When RF3 mentions concepts taught in RF1 or RF2 (e.g., `available when`
syntax, grounding as an instruction-writing concern), state the
diagnostic implication and trust the reader to know the underlying
concept. Do not re-teach it.

### Boundary with RF1 (Core Language)

RF1 teaches the syntax rules that prevent errors. RF3 teaches what
happens when those rules are violated — how to identify, diagnose, and
fix errors. RF3's error prevention section shows WRONG/RIGHT pairs for
common mistakes. This overlaps with RF1's anti-patterns section
intentionally — the same mistake framed as "how to write correct code"
(RF1) and "how to fix broken code" (RF3) strengthens the consuming
agent's understanding.

### Boundary with RF2 (Design & Agent Spec)

RF2 teaches grounding as an instruction-writing concern ("paraphrase
data closely, avoid transforming values, embellishment increases risk").
RF3 teaches grounding as a diagnostic concern ("the trace shows
UNGROUNDED — here's how to find what diverged and fix it"). Do not
repeat RF2's design-time grounding guidance. Focus on the diagnostic
workflow: how to read grounding results in traces, how the retry
mechanism works, and how to fix grounding failures.

### Target Length

~300 lines. If exceeding, justify the overage by the density of the
content. The diagnostic patterns and grounding subsection are
information-dense, so moderate overage is expected — but avoid bloat.
Every line must earn its tokens.

---

## Quality Checks (Self-Verify Before Delivering)

After writing, verify the file against these criteria:

1. Do all 6 sections appear in the correct order per the outline?
2. Does every CLI command include the `--json` flag?
3. Are all 4 conflict resolutions correctly applied throughout?
4. Does every diagnostic pattern follow the fixed structure: symptom →
   trace steps → root cause → fix (with code example)?
5. Is the validation command `sf agent validate authoring-bundle
   --api-name <NAME>` (NOT `sf agent validate --source-dir`)?
6. Is published agent preview described as a simple flag change
   (`--api-name` instead of `--authoring-bundle`) with NO connected app
   setup instructions?
7. Does the grounding subsection cover: retry mechanism, non-determinism,
   common causes, trace-based diagnosis, fix approach, and simulated mode
   limitation?
8. Does every technical claim have a `[SOURCE: ...]` citation?
9. Do all code examples follow RF1/RF2 conventions (action reference
   tagging, inner-block ordering, boolean capitalization, verbosity)?
10. Does the file avoid re-teaching RF1 content (syntax, block structure)
    and RF2 content (design patterns, instruction-writing grounding)?
11. Could a consuming agent with zero prior debugging experience use this
    file to systematically diagnose and fix a misbehaving agent?
12. Is every section under the 300-line target pulling its weight — no
    filler, no redundancy, no padding?
