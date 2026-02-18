# Writing Prompt: Reference File 2 — Design & Agent Spec Creation

> **Output file**: `afdx-pro-code-testdrive/agent-script-skill/references/agent-design-and-spec-creation.md`
>
> **What you are building**: The design reference file for a Claude Skill
> that teaches a consuming AI agent how to design Agentforce agents using
> Agent Script. This file covers *when and why* to use patterns — the reader
> already knows *how* to write syntax from Reference File 1 (Core Language).

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
   `afdx-pro-code-testdrive/claude-collaboration/rf2-context.md`

4. **Reference File 1 (Core Language)** — understand what the reader already
   knows (syntax, execution model, block structure). RF2 must not re-teach
   RF1 content:
   `afdx-pro-code-testdrive/agent-script-skill/references/agent-script-core-language.md`

5. **Steel threads** — acceptance scenarios the complete skill must satisfy:
   `afdx-pro-code-testdrive/claude-collaboration/steel-threads.md`

---

## Step 1: Domain Reads

Read these source files to extract content. The AUTHORITATIVE source is
listed first. When conflicts arise between sources, follow the conflict
resolutions documented in `rf2-context.md`.

### Source Priority

**AUTHORITATIVE** (prioritize over all other sources):

1. `.a4drules/agent-script-rules-no-edit.md` (785 lines)
   Created and tested by the skill author. Key RF2 content: Discovery
   Questions (lines 7-51, 5 categories), Action Loop Prevention
   (lines 646-663), Grounding Considerations (lines 666-680), Writing
   Effective Instructions (lines 620-642), Transition Syntax Rules
   (lines 403-422), Control Flow patterns (lines 425-469).

**OFFICIAL DOCUMENTATION** (grounding for authoritative claims):

2. Official Agent Script docs (14 files under
   `salesforcedocs/.../guides/agentforce/agent-script/`):
   - `ascript-ref-utils.md` — transition mechanics, delegation semantics
   - `ascript-ref-instructions.md` — reasoning instruction patterns
   - `ascript-flow.md` — flow of control, topic transitions
   - `ascript-ref-actions.md` — action definitions, target protocols
   - `ascript-ref-tools.md` — reasoning.actions, `available when`
   - `ascript-ref-before-after-reasoning.md` — directive blocks

   These provide grounding for claims made in the reference file.
   Consult them to verify factual accuracy. Do NOT use the `agent-dx/`
   subdirectory — those "agent spec" docs are OUTDATED and unrelated
   to our Agent Spec artifact.

**CANONICAL EXAMPLE**:

3. `afdx-pro-code-testdrive/force-app/main/default/aiAuthoringBundles/Local_Info_Agent/Local_Info_Agent.agent`
   — 268 lines. Hub-and-spoke architecture: 3 domain topics + escalation
   + off-topic + ambiguous_question. Ground all design pattern examples
   against this file.

**SUPPLEMENTARY** (mine for patterns, do not treat as authoritative):

4. Jag's fsm-architecture.md:
   `jaganpro/sf-skills/sf-ai-agentscript/resources/fsm-architecture.md`
   — 651 lines. FSM framing, 5 node patterns, 4 architecture patterns,
   deterministic vs. subjective framework. Useful for Topic Architecture
   and Flow Control sections. Use FSM concepts naturally but do not
   formally define FSM theory.

5. Jag's instruction-resolution.md:
   `jaganpro/sf-skills/sf-ai-agentscript/resources/instruction-resolution.md`
   — 348 lines. Three-phase model (maps to our two-phase — see Conflict
   Resolution #2 in rf2-context.md). Instruction ordering patterns and
   anti-patterns.

6. Architectural pattern recipes (8 recipes):
   `agent-script-recipes/force-app/main/04_architecturalPatterns/`
   - `multiTopicNavigation/` — multi-topic routing, transition patterns
   - `bidirectionalNavigation/` — specialist consultation, return pattern
   - `safetyAndGuardrails/` — sequential gates, dependency checking
   - `errorHandling/` — validation-first, guard clauses, conditional availability
   - `advancedReasoningPatterns/` — multi-source data loading, action chains
   - `multiStepWorkflows/` — action chaining with `run`, boolean progress flags
   - `externalAPIIntegration/` — Flow vs Apex targets, error capture
   - `simpleQA/` — single-topic pattern

---

## Step 2: Write the File

### Finalized Outline (8 Sections)

Follow this outline exactly. The ordering was debated across 12 rounds
of feedback with the skill author. See `rf2-context.md` for the rationale
behind each positioning decision.

**Agent Spec: Structure and Lifecycle** — What an Agent Spec contains
(purpose, topic architecture, actions/backing logic, variables, gating,
behavioral intent). How it evolves through three lifecycle stages: sparse
at creation → filled during build → reverse-engineered during
comprehension. Entries can be directional ("this action needs an Apex
class that accepts X, returns Y") or observational ("this action is
backed by existing Flow Z") — both are valid because the Agent Spec
serves creation and comprehension. The skill provides a starter spec
template as an asset — reference it here.

**Discovery Questions** — The 5 categories of structured questions from
`.a4drules`: Agent Identity & Purpose, Topics & Conversation Flow, State
Management, Actions & External Systems, Reasoning & Instructions. These
are the inputs that populate the Agent Spec. Present each category with
its questions. Explain that the answers flow directly into the Agent Spec
sections.

**Topic Architecture** — Architecture patterns: hub-and-spoke (central
router to specialized topics), linear flow (sequential pipeline),
escalation chain (tiered support), verification gate (security gate
before protected topics), single-topic (focused QA agents). When to use
each. Escalation topic pattern (`@utils.escalate`). Guardrail topics
(off-topic redirection, ambiguous question handling, security rules).
Single-topic vs. multi-topic decision criteria. Use the Local Info Agent
as the primary hub-and-spoke example.

**Mapping Logic to Actions** — How to identify what backing logic exists
(Apex classes, Flows, Prompt Templates). How to map existing
implementations to actions (target protocols, input/output contracts).
How to stub missing logic with protocols, I/O specs, and data types.
Valid backing logic types for actions (invocable Apex, autolaunched Flow,
etc.). This populates the "actions & backing logic" section of the Agent
Spec. CRITICAL: wiring an action to invalid backing logic (e.g., a Flow
that isn't autolaunched, or an Apex class that isn't invocable) produces
cryptic runtime errors. Be explicit about what qualifies.

**Transition Patterns** — Permanent handoff (`@utils.transition to` in
reasoning.actions — the user leaves the current topic and never returns)
vs. delegation (`@topic.X` in reasoning.actions — the current topic
delegates to another topic). CRITICAL TEACHING POINT: `@topic.X` does
NOT automatically return control. The official docs state: "When the
specified topic has completed, the flow of control doesn't return to
the original topic, so you must explicitly create a transition back to
the original topic if that's what you want." Teach the correct two-topic
pattern: caller delegates via `@topic.specialist`, specialist transitions
back via `@utils.transition to @topic.caller`. Include a WRONG/RIGHT
pair: WRONG = assuming delegation returns automatically; RIGHT = coding
the explicit return transition in the specialist topic. Design
implications: when to use handoff (mode switches, entry point routing),
when to use delegation (specialist consultation, reusable sub-workflows).

**Deterministic vs. Subjective Flow Control** — Classification framework:
security, financial, counter, and state requirements → deterministic code;
conversational, natural language generation, and flexibility requirements
→ LLM reasoning. Instruction ordering within topics: post-action checks
at top → data loading → dynamic instructions for the LLM. Post-action
loop pattern (deterministic resolution runs again with updated variables
— this is NOT a separate "Phase 3," it is Phase 1 running again).
Grounding considerations: paraphrase data closely, avoid transforming
values, embellishment increases grounding risk, live mode is required for
grounding validation.

**Gating Patterns** — `available when` for conditional action visibility
(the LLM cannot see gated actions when the condition is false). `if/else`
in instructions for conditional prompt text. `before_reasoning` guards
for security gates and early exits. Multi-condition gating (combining
`available when` + conditional instructions). Sequential gate pattern
(state variables track progress through validation stages).

**Action Loop Prevention** — What causes loops: an action remains
available to the LLM after executing AND instructions don't tell the LLM
to stop calling it. Variable-bound inputs (where `with` clauses bind
action inputs to variables instead of using `...` for LLM slot-filling)
increase risk because the LLM can invoke the action without friction —
it doesn't need to extract values from the conversation. Three
mitigations: explicit post-action instructions ("do not call X again"),
post-action transitions (move to a different topic after action
completes), LLM slot-fill (`...`) over variable binding (forces the LLM
to extract values each time, adding natural friction).

---

## Conflict Resolutions (Already Decided)

These were resolved through discussion with the skill author. Do NOT
revisit or present alternatives. Apply them as stated.

1. **FSM vs. execution model**: Complementary perspectives. FSM (topics =
   states, transitions = state changes) is the design lens for RF2. The
   two-phase execution model (Phase 1: deterministic resolution; Phase 2:
   LLM reasoning) is the runtime lens from RF1. Use FSM concepts naturally
   for design thinking without introducing new runtime terminology.

2. **Two phases, not three**: Jag's "Phase 3" (post-action loop) is Phase 1
   running again. Do NOT introduce a "Phase 3" concept. Describe post-action
   loops as "the deterministic resolution phase runs again with updated
   variables."

3. **`@topic.X` delegation does NOT auto-return**: `@topic.X` delegates
   control to another topic. It does not automatically return. If you want
   the user to return to the calling topic, the delegated topic must contain
   an explicit `transition to @topic.<caller>`. State this as authoritative
   fact. Include a WRONG/RIGHT pair showing the mistake and the fix.

4. **Agent Spec is our invention**: No authoritative external source defines
   it. Ignore ALL `salesforcedocs/agent-dx/` agent spec references — they
   are outdated and unrelated. The `sf agent generate agent-spec` CLI command
   does NOT currently produce a starter spec. We provide a starter spec
   template as a skill asset. Write about our Agent Spec format with
   confidence and clarity.

---

## Writing Rules

These are non-negotiable. Violating any of them produces a file that
fails its purpose.

### Audience

The reader is a **consuming AI agent** (an LLM like Claude) that will
use this file to design Agentforce agents. Every line must change how the
agent reasons about agent design — topic structure, flow control, action
wiring, and gating decisions. Do NOT write for human skill designers.

### Identity

**CRITICAL**: Agent Script is NOT AppleScript, JavaScript, Python, YAML,
or any other language. The consuming agent has ZERO training data for
Agent Script. Do not assume familiarity. Do not use analogies to other
languages.

### Tone

**Authoritative and direct.** The consuming agent needs clear guidance,
not nuanced discussions. State design rules as facts. When a pattern has
a correct way and an incorrect way, say so plainly. Use phrases like
"Always," "Never," "Use X when Y" — not "Consider," "You might want to,"
"It depends." Where a decision genuinely depends on context, provide a
clear decision framework (if condition A → do X; if condition B → do Y).

### Style

- **Prose over tables.** LLMs process prose more reliably than tabular
  data. Use tables only when the content is genuinely tabular (e.g., a
  comparison of architecture patterns).
- **Code examples illustrate design, not syntax.** RF2 code examples
  should be shorter than RF1's. Show enough to demonstrate the pattern;
  omit syntax details the reader already knows from RF1. Every design
  pattern gets a code example.
- **WRONG/RIGHT pairs inline.** Place anti-patterns within the section
  where they occur, not in a capstone section. Design anti-patterns are
  more meaningful in context. Show the incorrect approach, explain WHY
  it fails (tied to runtime behavior), then show the correct version.
- **No analogies to other languages.** This reinforces the identity rule.
- **`--json` flag**: Always include in any `sf` CLI command examples.

### Scope Boundaries

Content that belongs in OTHER reference files — do NOT include it here:

- Syntax rules, block structure, expression operators → File 1 (Core Language)
- Execution model mechanics (two-phase runtime) → File 1 (Core Language)
- Validation commands and error interpretation → File 3 (Validation & Debugging)
- Preview and behavioral debugging → File 3 (Validation & Debugging)
- Deploy/publish/activate pipeline → File 4 (Metadata & Lifecycle)
- Test spec authoring → File 5 (Test Authoring)

When RF2 mentions concepts taught in RF1 (e.g., `available when` syntax,
`transition to` syntax), state the design intent and trust the reader to
know the syntax. Do not re-teach it.

### Boundary with File 1 (Core Language)

RF1 teaches *how* to write syntax: transition syntax, action definitions,
gating syntax, expression operators, block structure.

RF2 teaches *when and why* to use each pattern: which architecture fits
which scenario, when to gate vs. instruct, when to use deterministic code
vs. LLM reasoning, how to wire backing logic correctly.

RF1 = runtime mechanics and syntax. RF2 = design intent and patterns.

### Target Length

~300 lines. If exceeding, justify the overage by the density of the
content. This file covers substantial ground (8 sections across both
design patterns and Agent Spec production), so moderate overage is
expected — but avoid bloat. Every line must earn its tokens.

---

## Quality Checks (Self-Verify Before Delivering)

After writing, verify the file against these criteria:

1. Do all 8 sections appear in the correct order per the outline?
2. Does every design pattern get a code example?
3. Are all 4 conflict resolutions correctly applied throughout?
4. Do all anti-patterns use inline WRONG/RIGHT format with semantic
   explanation of WHY the wrong approach fails?
5. Is `@topic.X` delegation explicitly taught as non-returning without
   an explicit transition back? Is the WRONG/RIGHT pair present?
6. Is the Agent Spec presented confidently as our format — with no
   references to outdated `salesforcedocs/agent-dx/` specs?
7. Does the file reference the starter spec template asset?
8. Is the post-action loop described as "Phase 1 running again" (never
   as "Phase 3")?
9. Are all design rules stated authoritatively (not hedged with
   "consider" or "you might want to")?
10. Could a consuming agent with zero prior design knowledge produce a
    well-structured Agent Spec and make correct design decisions after
    reading this file?
11. Does the file avoid re-teaching RF1 content (syntax, block structure,
    execution model mechanics)?
12. Is every section under the 300-line target pulling its weight — no
    filler, no redundancy, no padding?
