# Reference File 3 Working Context — Validation & Debugging

> **Purpose**: Captures all domain read findings, conflict resolutions, and
> outline decisions for `references/agent-validation-and-debugging.md`. Read
> this before writing or revising the file.

---

## Sources Read

1. **`.a4drules/agent-preview-rules-no-edit.md`** (AUTHORITATIVE SOURCE):
   177 lines. Programmatic preview workflow (start/send/end with `--json`),
   execution modes (simulated vs. live), agent identification flags
   (`--authoring-bundle` vs. `--api-name`), target org rules, metadata
   locations via `sfdx-project.json`, session traces, 6 common mistakes
   with WRONG/RIGHT pairs.

2. **`.a4drules/agent-debugging-rules-no-edit.md`** (AUTHORITATIVE SOURCE):
   179 lines. Session trace file structure (metadata.json, transcript.jsonl,
   traces/<PLAN_ID>.json), 11 trace step types with diagnostic meanings,
   4 diagnostic patterns (wrong topic routing, actions not firing, grounding
   failures, loops), grounding retry mechanism (2 attempts then error),
   LLMStep detail (messages_sent, tools_sent, response_messages), 8-step
   diagnostic workflow.

3. **`.a4drules/agent-script-rules-no-edit.md`** (AUTHORITATIVE SOURCE,
   partial): Lines 56-61 (validation command), lines 683-701 (validation
   checklist, 14 items), lines 704-785 (error prevention, 7 common
   mistakes with WRONG/RIGHT pairs).

4. **AFDX docs** (`agent-dx-nga-preview.md` — updated Feb 2026):
   Now accurate. Connected app requirements removed. Includes programmatic
   preview commands (start/send/sessions/end), `--authoring-bundle` vs.
   `--api-name` flag distinction, session trace file structure. The old
   `agent-dx-preview.md` no longer exists. `.a4drules` remains
   authoritative for programmatic depth (`--json`, trace step types,
   diagnostic patterns) not covered in AFDX docs. AFDX docs useful for:
   VS Code Agent Preview pane, Apex Replay Debugger integration (live
   mode only), Agent Tracer tab, trace file format verification.

5. **Jag's `debugging-guide.md`** (318 lines): 4 debugging views
   (Interaction Details, Trace Waterfall, Variable State, Script View
   with Linting), 6 span types with latency benchmarks, 5 debug patterns
   with code fixes, diagnostic checklist. **CAUTION: VS Code UI-centric.**
   The 4 views describe Agent Preview pane tabs, not programmatic access.
   The concepts (span types, variable state analysis, debug patterns) are
   valuable regardless of interface. **INACCURACY: Uses `sf agent validate
   --source-dir ./agent`** — the correct command per `.a4drules` is
   `sf agent validate authoring-bundle --api-name <NAME>`.

6. **RF1 boundary check**: Zero mentions of validation, preview, debugging,
   or traces. Clean boundary — no overlap.

7. **RF2 boundary check**: Mentions grounding and preview in passing
   within design context (lines 372, 565-571). RF2 line 372 warns about
   invalid backing logic passing validation but failing at deploy — this
   is a design-time warning, not a diagnostic workflow. RF2 line 565-571
   covers grounding as an instruction-writing concern. RF3 covers
   grounding as a diagnostic concern (how to identify and fix grounding
   failures using traces). Clean boundary.

---

## Conflict Resolutions (Decided)

1. **AFDX docs vs. `.a4drules` on preview**: Updated AFDX doc is now
   accurate (connected app removed, programmatic commands documented).
   `.a4drules` remains authoritative for programmatic-first guidance.
   The only difference is `--api-name` (published) vs. `--authoring-bundle`
   (Agent Script). **Decision**: Use `.a4drules` as authoritative. Ignore
   AFDX docs' connected app setup. Document the simplified flag
   distinction.

2. **Jag's validate command vs. `.a4drules`**: Jag uses
   `sf agent validate --source-dir ./agent`. The `.a4drules` uses
   `sf agent validate authoring-bundle --api-name <NAME>`.
   **Decision**: Use `.a4drules` as authoritative. The `.a4drules` version
   is the command our consuming agent must use.

3. **Jag's 4 debugging views vs. programmatic trace analysis**: Jag's
   guide describes VS Code UI tabs (Interaction Details, Trace Waterfall,
   Variable State, Script View). Our consuming agent works programmatically
   via CLI, not through VS Code UI. **Decision**: Don't teach the UI views.
   Teach trace file analysis directly — the trace files contain the same
   information the UI views display. Adopt Jag's *concepts* (span types,
   variable state entry/exit, latency benchmarks) and map them to trace
   file fields.

4. **Two trace output formats**: Authoring bundle preview stores traces
   at `.sfdx/agents/<NAME>/sessions/<ID>/` with `transcript.jsonl` +
   `traces/<PLAN_ID>.json`. Published agent preview (per AFDX docs) stores
   `transcript.json` + `responses.json` in a user-specified output dir.
   **Decision**: Teach the authoring bundle trace format as primary (this
   is what the consuming agent will use most). Mention the published agent
   format briefly with the key difference (no detailed trace steps, just
   transcript + API responses).

---

## Content Scope (What Goes in File 3)

**In scope** (the collaboration-context.md File Inventory assigns
Knowledge Categories E (Validation & Error Diagnosis) and F (Preview &
Behavioral Debugging) to this file):

- Validation: `sf agent validate authoring-bundle` usage, interpreting
  output, the validation checklist as a pre-validate mental model
- Error taxonomy: block ordering, indentation, syntax, missing
  declarations, type mismatches, structural errors
- Error-to-root-cause mapping: common error messages → what's wrong →
  how to fix
- Error prevention: common mistakes with WRONG/RIGHT pairs (from
  `.a4drules` Error Prevention section)
- Preview: programmatic workflow (start/send/end), execution modes
  (simulated vs. live), when to use each, agent identification flags
- Session traces: file structure, step types, how to read them
- Diagnostic patterns: wrong topic routing, actions not firing, action
  loops, "unexpected error" responses, post-action logic not running
- Diagnostic workflow: the systematic approach (reproduce → locate →
  read trace → follow execution → identify gap → fix → validate →
  re-test), with grounding as a dedicated subsection covering the retry
  mechanism, non-deterministic behavior, and diagnosis/fix methodology

**Deferred to other files**:

- Agent Script syntax rules and block structure → RF1 (Core Language)
- Design-time grounding considerations (instruction writing) → RF2
  (Design & Agent Spec)
- Gating pattern design (when to use `available when`) → RF2
- Deploy/publish/activate pipeline → RF4 (Metadata & Lifecycle)
- Test spec authoring → RF5 (Test Authoring)

**Boundary with RF1 (Core Language)**: RF1 teaches the syntax rules that
prevent errors. RF3 teaches what happens when those rules are violated —
how to identify, diagnose, and fix errors. RF3's error prevention section
will show WRONG/RIGHT pairs for common mistakes, which overlaps with RF1's
anti-patterns section. This is intentional reinforcement per Design
Principle 3 — the same mistake shown in a "how to write correct code"
context (RF1) and a "how to fix broken code" context (RF3) strengthens
the consuming agent's understanding.

**Boundary with RF2 (Design & Agent Spec)**: RF2 teaches grounding as
an instruction-writing concern ("paraphrase data closely, avoid
transforming values"). RF3 teaches grounding as a diagnostic concern
("the trace shows UNGROUNDED — here's how to find what diverged and
fix it"). RF2 line 372 warns about invalid backing logic passing
validation — that's a design-time gotcha. RF3 would cover what to do
when deployment fails because of it.

---

## Finalized Outline

### Ordering Rationale

1. **Validation first.** The most common and immediate need — "does my
   code compile?" This is the first thing a developer runs after writing
   or modifying Agent Script. Quick feedback loop.

2. **Error taxonomy and prevention second.** When validation fails,
   the developer needs to understand what went wrong. Classify the error,
   map to root cause, fix. The WRONG/RIGHT pairs serve as both diagnostic
   aid and preventive reference.

3. **Preview third.** Code compiles, now test behavior. The preview
   section teaches the programmatic workflow and execution modes. This
   is the transition from "does it compile?" to "does it work?"

4. **Session traces fourth.** Preview revealed unexpected behavior —
   now read the traces to understand why. Trace file structure, step
   types, and how to extract diagnostic information.

5. **Diagnostic patterns fifth.** The systematic patterns for common
   behavioral issues. Each pattern follows the same structure: symptom →
   trace analysis → root cause → fix. This is the payoff section — the
   agent has all the tools (validation, preview, traces) and now applies
   them to specific problems.

6. **Diagnostic workflow sixth.** The capstone — the systematic
   8-step approach that ties everything together. Placed last because
   it references all previous sections. Grounding is folded in here
   rather than as a standalone section, because grounding diagnosis is
   a workflow that uses traces and patterns — it's the most complex
   application of the diagnostic methodology, not a separate category
   of knowledge. Covers: the retry mechanism, non-deterministic
   behavior, simulated vs. live mode gap, and how to diagnose and fix
   grounding failures using the trace-based workflow.

### Sections (6 total):

1. **Validation** — The `sf agent validate authoring-bundle` command.
   When to run it (after every modification). What it checks. How to
   interpret output. The validation checklist as a pre-validate mental
   model (14 items from `.a4drules`).

2. **Error Taxonomy and Prevention** — Classification of validation
   errors: block ordering, indentation, syntax, missing declarations,
   type mismatches, structural. Common mistakes with WRONG/RIGHT pairs
   (from `.a4drules` Error Prevention section). Error-to-root-cause
   mapping patterns.

3. **Preview** — Programmatic workflow: start session → send utterances
   → end session. Execution modes: simulated (default, fake action
   outputs) vs. live (`--use-live-actions`, real backing code). When to
   use each mode. Agent identification: `--authoring-bundle` for Agent
   Script agents, `--api-name` for published agents. Target org handling.
   Common preview mistakes with WRONG/RIGHT pairs.

4. **Session Traces** — Trace file location and structure
   (metadata.json, transcript.jsonl, traces/<PLAN_ID>.json). The 11
   step types and what each tells you. How to read a trace
   chronologically. The LLMStep in detail (the most diagnostic step
   type). When to use traces vs. when the transcript is sufficient.

5. **Diagnostic Patterns** — Structured symptom → trace analysis →
   root cause → fix patterns for: wrong topic routing, actions not
   firing, action loops, "unexpected error" responses, post-action
   logic not running. Each pattern maps to specific trace step types.

6. **Diagnostic Workflow** — The systematic 8-step approach: reproduce
   → locate failing turn → read trace → follow execution → identify
   gap → fix → validate → re-test. This is the capstone that ties
   validation, preview, traces, and diagnostic patterns together.
   Includes grounding as a dedicated subsection: the retry mechanism
   (2 attempts then error), non-deterministic behavior, common failure
   causes (date inference, unit conversion, embellishment, loose
   paraphrasing), diagnosing via traces (ReasoningStep + FunctionStep
   comparison), fix approach (use specific values verbatim), and why
   simulated mode can't reproduce grounding failures.

---

## Key Insights for Writing

- **RF3's audience is the consuming agent, operating programmatically.**
  All preview commands use `--json`. All trace analysis is file-based.
  Don't teach VS Code UI interactions — the consuming agent can't click
  buttons. Teach CLI commands and file reading.

- **The `.a4drules` files are the primary sources.** Between them,
  `agent-preview-rules` and `agent-debugging-rules` cover almost
  everything RF3 needs. The `agent-script-rules` validation checklist
  and error prevention section round out the validation/error content.

- **Error prevention WRONG/RIGHT pairs are intentional reinforcement
  with RF1.** RF1 shows these in a "how to write correct code" context.
  RF3 shows them in a "how to fix broken code" context. Don't
  deduplicate — the different framing strengthens comprehension.

- **Grounding folds into Diagnostic Workflow, not a standalone section.**
  Grounding diagnosis is a workflow that uses traces and patterns — it's
  the most complex application of the diagnostic methodology. Treat it
  as a dedicated subsection within the capstone, not a separate category
  of knowledge. It still needs depth: (a) the retry mechanism is
  invisible without traces, (b) it's non-deterministic, (c) simulated
  mode can't reproduce it, and (d) the fix is counterintuitive (tell
  the LLM to be less creative, not more).

- **The diagnostic workflow is a capstone, not an introduction.** Place
  it last. The agent needs to know the tools (validation, preview,
  traces) before it can follow the systematic workflow that uses them.

- **Published agent preview is now simple.** No connected app setup.
  Just `--api-name` instead of `--authoring-bundle`. Don't overcomplicate
  this — it's a one-line flag difference. The key behavioral difference:
  published agents always execute real actions (no simulated mode).

- **Trace step types are the backbone of behavioral debugging.** The
  11 step types from `.a4drules` map directly to diagnostic questions.
  Present them as a reference the agent can consult when reading traces,
  not as a list to memorize.
