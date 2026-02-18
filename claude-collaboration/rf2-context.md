# Reference File 2 Working Context — Design & Agent Spec

> **Purpose**: Captures all domain read findings, conflict resolutions, and
> outline decisions for `references/agent-design-and-spec-creation.md`. Read
> this before writing or revising the file.

---

## Sources Read

1. **Official Agent Script docs** (14 files under
   `salesforcedocs/.../agent-script/`): Same source set as RF1.
   Provides authoritative grounding for Agent Script syntax, runtime
   behavior, and built-in references. Used in RF2 to verify claims
   about action properties, transition mechanics, gating syntax, and
   directive block behavior.

2. **`.a4drules/agent-script-rules-no-edit.md`** (AUTHORITATIVE SOURCE):
   785 lines. Key RF2 content: Discovery Questions (lines 7-51, 5 categories),
   Action Loop Prevention (lines 646-663), Grounding Considerations
   (lines 666-680), Writing Effective Instructions (lines 620-642),
   Transition Syntax Rules (lines 403-422), Control Flow patterns
   (lines 425-469).

3. **Jag's fsm-architecture.md** (`jaganpro/sf-skills/sf-ai-agentscript/resources/`):
   651 lines. FSM framing for agent design. 5 node patterns (Routing,
   Verification, Data-Lookup, Processing, Handoff). 4 architecture patterns
   (Hub-and-Spoke, Linear Flow, Escalation Chain, Verification Gate).
   Deterministic vs. Subjective classification framework. Topic transition
   mechanics (handoff vs. delegation). Topic design patterns and best
   practices. Naming conventions. Common design mistakes checklist.

4. **Jag's instruction-resolution.md** (`jaganpro/sf-skills/sf-ai-agentscript/resources/`):
   348 lines. Three-phase instruction resolution model (Pre-LLM Setup,
   LLM Reasoning, Post-Action Loop). Recommended instruction ordering
   pattern: post-action checks at top → data loading → dynamic instructions.
   Anti-patterns for instruction ordering (data load after LLM text,
   post-action check at bottom). Key insight: Phase 3 (post-action loop)
   is actually Phase 1 running again — aligns with RF1's two-phase model.

5. **Architectural pattern recipes** (8 recipes under
   `agent-script-recipes/force-app/main/04_architecturalPatterns/`):
   - `multiTopicNavigation/` — multi-topic architecture, transitions,
     conditional transition availability, auto-transition after action,
     Mermaid flowchart conventions
   - `bidirectionalNavigation/` — specialist consultation pattern,
     state transfer across topics, return-to-main-via-transition
   - `safetyAndGuardrails/` — multi-stage validation, explicit
     confirmation, dependency checking, sequential gates with
     `available when` and state variables
   - `errorHandling/` — validation-first approach, business rule
     enforcement, guard clauses, error state tracking, conditional
     action availability
   - `advancedReasoningPatterns/` — multi-source data loading,
     sequential action chains, computed insights, dynamic instruction
     building, `@utils.setVariables` for slot-filling
   - `multiStepWorkflows/` — action chaining with `run`, step-by-step
     workflows, progress tracking with boolean flags
   - `externalAPIIntegration/` — Flow vs Apex targets, error capture
     patterns, fixed default parameters
   - `simpleQA/` — single-topic agent pattern, system vs reasoning
     instruction separation

6. **Local Info Agent** (`force-app/.../Local_Info_Agent/Local_Info_Agent.agent`):
   268 lines. Canonical example. Hub-and-spoke architecture: start_agent
   routes to 3 domain topics + escalation + off-topic + ambiguous_question.
   Demonstrates: gated actions (`available when`), `@utils.setVariables`
   for slot-filling, `@utils.escalate`, multiple target protocols
   (`apex://`, `prompt://`, `flow://`), guardrail topics with strict
   rules (never reveal system info, never answer off-topic), conditional
   instructions in resort_hours topic (`if @variables.reservation_required`),
   action loop prevention via instructions ("Only call check_events ONCE").

---

## Conflict Resolutions (Decided)

1. **FSM framing vs. our execution model framing**: Jag frames everything
   as a Finite State Machine (topics = states, transitions = state changes).
   RF1 uses a two-phase execution model (deterministic resolution → LLM
   reasoning). **Decision**: These are complementary, not conflicting. FSM
   is a *design* perspective — useful for RF2 when teaching topic
   architecture. Execution model is a *runtime* perspective — already
   covered in RF1. RF2 adopts the FSM lens for design thinking without
   introducing new runtime terminology.

2. **Jag's "three phases" vs. our "two phases"**: Jag describes Phase 1
   (Pre-LLM), Phase 2 (LLM Reasoning), Phase 3 (Post-Action Loop). RF1
   describes two phases: deterministic resolution and LLM reasoning. The
   difference: Jag's Phase 3 is actually Phase 1 running again on the
   next cycle. **Decision**: Maintain RF1's two-phase model. RF2 should
   not introduce a "Phase 3" concept. When discussing the post-action
   loop pattern, describe it as "the deterministic resolution phase runs
   again with updated variables" — not as a separate phase.

3. **Topic delegation return mechanics**: Jag's FSM guide says `@topic.X`
   is "temporary delegation" where "original topic resumes." The
   BidirectionalNavigation recipe shows specialists using
   `@utils.transition to @topic.general_support` to "return" — which is
   a permanent transition back, not a true subroutine return.
   **Decision**: [UNRESOLVED] — need to verify whether `@topic.X`
   implements actual call-return semantics or if "returning" always
   requires explicit transition. This affects transition pattern guidance.
   Flag for validation during writing.

4. **Agent Spec is our design artifact**: The `salesforcedocs` folder
   contains references to "agent specs" in the `agent-dx/` directory.
   These are OUTDATED artifacts that have nothing to do with the Agent
   Spec we are designing. **Decision**: Ignore all `salesforcedocs`
   agent spec references entirely. Our Agent Spec (defined in
   collaboration-context Section 4) is a richer design artifact:
   purpose, topic architecture, actions/backing logic, variables,
   gating, behavioral intent. The CLI command `sf agent generate agent-spec` does not currently produce a starter spec. We will
   include a starter spec template as one of the skill's assets.
   RF2 teaches our Agent Spec format exclusively.

---

## Content Scope (What Goes in File 2)

**In scope** (Knowledge Categories C + D):

- Agent Spec structure and lifecycle (sparse → filled → reverse-engineered)
- Discovery questions (5 categories from `.a4drules`)
- Topic architecture patterns (hub-and-spoke, linear, escalation chain,
  verification gate, single-topic)
- Mapping backing logic to actions (scan for Apex/Flow/Prompt Templates,
  map existing, stub missing, valid backing logic types)
- Transition patterns (handoff vs. delegation, when to use each)
- Deterministic vs. subjective flow control (classification framework,
  instruction ordering within topics, grounding considerations)
- Gating patterns (`available when`, conditional instructions,
  `before_reasoning` guards, multi-condition gating, security gates)
- Escalation and guardrail topics (escalation pattern, off-topic/ambiguous
  redirection, guardrail rules)
- Action loop prevention (root causes, three mitigations)

**Deferred to other files**:

- Transition syntax and action definition syntax → File 1 (Core Language)
- Execution model mechanics → File 1 (Core Language)
- Validation commands and error interpretation → File 3 (Validation & Debugging)
- Preview and behavioral debugging → File 3 (Validation & Debugging)
- Deploy/publish/activate pipeline → File 4 (Metadata & Lifecycle)
- Test spec authoring → File 5 (Test Authoring)

**Boundary with File 1 (Core Language)**: RF1 teaches *how* to write
syntax (transition syntax, action definitions, gating syntax). RF2
teaches *when and why* to use each pattern (design decisions, architectural
tradeoffs). RF1 = runtime mechanics and syntax. RF2 = design intent and
patterns. When RF2 shows code examples, they illustrate design patterns —
the reader is assumed to already know the syntax from RF1.

---

## Finalized Outline

Ordering was debated and resolved through structured discussion with Vivek.

### Ordering Rationale

1. **Agent Spec first.** The artifact everything else produces. The
   consuming agent needs to know what it's building toward before
   learning how to build it.

2. **Discovery Questions second.** First thing a developer does — answer
   these to understand requirements. The answers feed directly into the
   Agent Spec.

3. **Topic Architecture third.** Once requirements are known, the first
   structural decision is how to organize topics. This is the macro
   design — architecture patterns, single vs. multi-topic, escalation
   and guardrail topics.

4. **Mapping Logic to Actions fourth.** Topics designed, now figure out
   what powers them — scan for existing backing logic, map what exists,
   stub what's missing.

5. **Transition Patterns fifth.** Topics and actions defined, now decide
   how topics connect — permanent handoff vs. delegation, when to use each.

6. **Deterministic vs. Subjective Flow Control sixth.** Structure complete,
   now decide what's enforced by code vs. LLM reasoning — and how to
   write each correctly. Includes instruction ordering within topics
   and grounding considerations for LLM instruction writing.

7. **Gating Patterns seventh.** Framework established, now the primary
   implementation tool for deterministic control — `available when`,
   conditional instructions, security gates.

8. **Action Loop Prevention eighth.** The failure mode when gating and
   instructions don't properly constrain repeated action execution.
   Follows naturally from gating patterns.

### Sections (8 total):

1. **Agent Spec: Structure and Lifecycle** — What an Agent Spec contains
   (purpose, topic architecture, actions/backing logic, variables, gating,
   behavioral intent). How it evolves: sparse at creation → filled during
   build → reverse-engineered during comprehension. The skill provides a
   starter spec template as an asset. Directional vs. observational entries.

2. **Discovery Questions** — The 5 categories of structured questions
   from `.a4drules`: Agent Identity & Purpose, Topics & Conversation
   Flow, State Management, Actions & External Systems, Reasoning &
   Instructions. These are the inputs that populate the Agent Spec.

3. **Topic Architecture** — Architecture patterns: hub-and-spoke (central
   router to specialized topics), linear flow (sequential pipeline),
   escalation chain (tiered support), verification gate (security gate
   before protected topics), single-topic (focused QA agents). When to
   use each. Escalation topic pattern (`@utils.escalate`). Guardrail
   topics (off-topic redirection, ambiguous question handling, security
   rules). Single-topic vs. multi-topic decision criteria.

4. **Mapping Logic to Actions** — How to identify what backing logic
   exists (Apex classes, Flows, Prompt Templates). How to map existing
   implementations to actions (target protocols, input/output contracts).
   How to stub missing logic with protocols, I/O specs, and data types.
   Valid backing logic types for actions (invocable Apex, autolaunched
   Flow, etc.). This populates the "actions & backing logic" section of
   the Agent Spec.

5. **Transition Patterns** — Permanent handoff (`@utils.transition to`
   in reasoning.actions) vs. delegation (`@topic.X` in reasoning.actions).
   Design implications of each. When to use handoff (mode switches,
   entry point routing, one-way workflows). When to use delegation
   (specialist consultation, reusable sub-workflows). Back-navigation
   patterns. [Note: syntax is in RF1; this section covers design
   decisions only.]

6. **Deterministic vs. Subjective Flow Control** — Classification
   framework: security/financial/counter/state requirements →
   deterministic code; conversational/NLG/flexibility requirements →
   LLM reasoning. Instruction ordering within topics: post-action checks
   at top → data loading → dynamic instructions for LLM. Post-action
   loop pattern (deterministic resolution runs again with updated
   variables). Grounding considerations: paraphrase data closely, avoid
   transforming values, embellishment increases grounding risk, live
   mode required for grounding validation.

7. **Gating Patterns** — `available when` for conditional action
   visibility (LLM cannot see gated actions when condition is false).
   `if/else` in instructions for conditional prompt text. `before_reasoning`
   guards for security gates and early exits. Multi-condition gating
   (combining `available when` + conditional instructions). Sequential
   gate pattern (state variables track progress through validation stages).

8. **Action Loop Prevention** — What causes loops: action remains
   available after executing + instructions don't say "stop." Variable-bound
   inputs increase risk (no slot-filling friction). Three mitigations:
   explicit post-action instructions, post-action transitions, LLM
   slot-fill over variable binding.

---

## Key Insights for Writing

- **RF2's audience is the same as RF1: the consuming agent.** But the
  mental mode is different — RF1 teaches "how to write code," RF2 teaches
  "how to design agents." Examples illustrate design patterns, not syntax.

- **Code examples should be shorter than RF1's.** RF2 code shows design
  intent, not complete syntax. The reader already knows syntax from RF1.

- **FSM terminology is useful for design sections** (topics as states,
  transitions as state changes) but should not conflict with RF1's
  execution model terminology. Use it naturally without formal definition.

- **The Agent Spec is our invention.** No authoritative external source
  defines it. The collaboration-context Section 4 is the source of truth.
  Ignore all `salesforcedocs/agent-dx/` references to "agent specs" —
  those are outdated and unrelated. The skill will include a starter
  spec template as an asset; RF2 should reference it. Write with
  confidence but clarity — the consuming agent needs to understand
  exactly what to produce.

- **Backing logic analysis is high-value content.** Wiring an action to
  invalid backing logic is a common and costly mistake. This section
  justifies extra token spend (per collaboration-context line 1189).

- **Anti-patterns may emerge during writing.** RF1 has a dedicated
  anti-patterns capstone section. RF2 should use inline WRONG/RIGHT
  pairs within each section where appropriate, rather than collecting
  them at the end. Design anti-patterns are more meaningful in context
  than in a list.

- **Grounding and instruction ordering fold into Section 6.** These
  were separate sections in earlier outlines. They were consolidated
  because grounding is instruction-writing guidance and instruction
  ordering is implementation of the deterministic/subjective
  classification.
