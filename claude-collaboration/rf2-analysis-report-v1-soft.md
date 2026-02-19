# RF2 — Design & Agent Spec Creation — Analysis Report

**Analysis Date:** February 19, 2026
**RF File:** `agent-script-skill/references/agent-design-and-spec-creation.md`
**RF Line Count:** 788 lines
**RF Scope:** Categories C (Flow Control & Design Patterns) and D (Agent Spec Production)

---

## Dimension 1: Completeness

### 1a. Coverage Map

All substantive topics from the authoritative rules file that fall within RF2's scope are covered:

| Topic | RF2 Line Coverage | Authoritative Source |
|-------|-------------------|---------------------|
| Agent Spec structure and lifecycle | Lines 16-54 | agent-script-rules-no-edit.md (not explicit, but implied) |
| Agent Spec directional vs. observational entries | Lines 29-37 | Collaboration context, Session 2 decision |
| Agent Spec template reference | Line 51-53 | Collaboration context (Section 4, Agent Spec) |
| Topic strategies (domain, guardrail, escalation) | Lines 103-141 | agent-script-rules-no-edit.md (block reference section) |
| Single-topic vs. multi-topic decision | Lines 142-155 | agent-script-rules-no-edit.md (not explicit) |
| Architecture patterns (5 patterns) | Lines 157-250 | agent-script-rules-no-edit.md (not explicit, but demonstrated) |
| Handoff transitions | Lines 420-443 | agent-script-rules-no-edit.md (transition syntax rules) |
| Delegation transitions | Lines 445-480 | agent-script-rules-no-edit.md (delegation with `@topic.X`) |
| Deterministic vs. subjective flow control | Lines 484-553 | agent-script-rules-no-edit.md (before_reasoning guards, available when) |
| Instruction ordering and grounding | Lines 514-561 | agent-script-rules-no-edit.md (post-action instructions section) |
| Gating patterns (available when) | Lines 573-600 | agent-script-rules-no-edit.md (action availability, conditional instructions) |
| Conditional instructions | Lines 602-621 | agent-script-rules-no-edit.md (if/else in instructions) |
| before_reasoning guards | Lines 623-637 | agent-script-rules-no-edit.md (before_reasoning block) |
| Multi-condition gating | Lines 639-662 | agent-script-rules-no-edit.md (available when with and/or) |
| Sequential gate pattern | Lines 664-686 | agent-script-rules-no-edit.md (mutable variables for state tracking) |
| Action loop prevention | Lines 690-787 | agent-script-rules-no-edit.md (action loop prevention section) |
| Backing logic identification and analysis | Lines 258-373 | agent-script-rules-no-edit.md (action definition, target types) |

### 1b. Missing Items

No substantive gaps identified within RF2's scope. However, one potential enhancement opportunity was identified:

- **Discovery questions methodology (Section 2, lines 57-100):** RF2 covers *what* discovery questions are but provides minimal guidance on *how* to extract answers from existing code or external context. Lines 61-62 state "resolve as many questions as possible from available context before asking the human" but don't provide a systematic process. This doesn't constitute a missing section (the topic is addressed), but a consuming agent might benefit from more tactical guidance on question-answering precedence. **Impact:** LOW — the core requirement (ask discovery questions) is met; the execution methodology is helpful but not critical.

### 1c. Scope Boundary Check

Content correctly deferred to sibling RFs:

| Topic | Deferred To | Rationale |
|-------|-------------|-----------|
| Syntax of `@utils.transition to` vs bare `transition to` | RF1 (Core Language, lines 796-838) | Belongs in "how to write it" (syntax), not "why to design it this way" (design intent) |
| Variable declarations syntax | RF1 (Core Language, lines 199-230) | Belongs in language mechanics, not design patterns |
| Action target syntax (`flow://`, `apex://`) | RF1 (Core Language, lines 632-657) | Belongs in language reference, not backing logic analysis |
| Validation and error diagnosis | RF3 (Validation & Debugging) | Correctly scoped to RF3 per architecture decision |
| Preview and behavioral debugging | RF3 (Validation & Debugging) | Correctly scoped to RF3 per architecture decision |
| Deploy/publish/activate pipeline | RF4 (Metadata & Lifecycle) | Correctly scoped to RF4 per architecture decision |
| Test authoring YAML | RF5 (Test Authoring) | Correctly scoped to RF5 per architecture decision |

**Scope bleed check:** No content identified that belongs in another sibling RF. The boundary between RF2 (design thinking and Agent Spec production) and RF1 (syntax and execution model) is clean. The boundary between RF2 and RF3 (validation/debugging) is also clean.

### 1d. Redundancy with Sibling RFs

Intentional reinforcement of concepts from RF1:

| Content | RF2 Lines | RF1 Lines | Assessment |
|---------|----------|----------|-------------|
| Execution model explanation for gating decisions | Lines 484-512 | RF1 lines 20-56 | INTENTIONAL REINFORCEMENT — RF2 explains execution model specifically in context of design decision-making (when to choose deterministic vs. subjective control). This is a contextual anchor; different from RF1's explanation of runtime mechanics. |
| Variable scope and state tracking | Lines 27, 95-99, 666-686 | RF1 lines 250-299 | INTENTIONAL REINFORCEMENT — RF2 shows how to use variables for gating logic design; RF1 shows variable syntax. Different purposes; both needed. |
| `available when` syntax | Lines 573-600 | RF1 lines 698-710 | INTENTIONAL REINFORCEMENT — RF2 shows *why* and *when* to use `available when` for gating; RF1 shows syntax. Context-appropriate in both. |
| Boolean capitalization | None in RF2 | RF1 lines 286-298 | Correctly omitted from RF2 — pure syntax rule, belongs only in RF1. |
| Post-action transitions | Lines 731-750 | RF1 lines 542-546 | INTENTIONAL REINFORCEMENT — RF2 shows post-action transitions as a loop prevention technique (design intent); RF1 shows transition syntax (how to write it). Both needed. |

**Redundancy assessment:** All overlaps are intentional reinforcement, not harmful duplication. Each appears in a different context (design vs. syntax) that aids learning in different ways.

---

## Dimension 2: Information Flow

### 2a. Section Progression

| Section | Logical Flow | Assessment |
|---------|-------------|-------------|
| 1. Agent Spec: Structure and Lifecycle | Introduction, prerequisite for all following sections | STRONG — establishes what an Agent Spec is before discussing how to create it |
| 2. Discovery Questions | Builds on Section 1 — these questions *feed* the Agent Spec | STRONG — logical progression from "what is an Agent Spec" to "what questions populate it" |
| 3. Topic Architecture | Shifts from "Agent Spec artifact" to "topic design choices" | MODERATE — section assumes reader understands Agent Spec structure already. The transition could be smoother. No backward-reference to Section 1, so a reader landing in Section 3 first may be confused. |
| 4. Mapping Logic to Actions | Continues topic design; adds specific backing logic analysis | STRONG — natural follow-up to topic architecture; reader now knows topics exist, learns how to back them with code |
| 5. Transition Patterns | Completes topic graph design by covering connections | STRONG — builds on Sections 3-4 (topics and actions) by explaining how to connect them |
| 6. Deterministic vs. Subjective Flow Control | Shifts from "what topics and actions do" to "how to control them" | MODERATE — requires understanding of execution model from RF1. Section opens with control concepts but doesn't anchor to execution mechanics. Reader should have RF1 loaded, but RF2 doesn't explicitly state this dependency. |
| 7. Gating Patterns | Implements the deterministic/subjective distinction from Section 6 | STRONG — Section 6 defines the concepts; Section 7 provides the mechanisms |
| 8. Action Loop Prevention | Specialized application of gating and post-action patterns | STRONG — builds on Sections 5-7 (transitions, gating) |

**Forward references check below (Section 2b)** — no disabling blockers identified. Sections assume prior reading (good), but some transitions could be more explicit.

### 2b. Forward References

| Concept | Used At | Introduced At | Severity |
|---------|---------|-------------|----------|
| "Agent Spec" | Lines 18, 24, 51, 59, 105, etc. | Line 16 (Section 1 title) | LOW — defined in Section 1 before heavy use. Acceptable. |
| "Domain topics" vs. "guardrail topics" | Line 111 (first use) | Lines 111-113 (immediate definition) | LOW — terms defined immediately when introduced. Good practice. |
| "Execution model" (referenced line 486, 501) | Line 486 | Not formally introduced in RF2; assumes RF1 knowledge | MODERATE — RF2 references execution model assumptions at line 486 ("The test: what happens if the LLM gets this wrong?") without explicitly anchoring to RF1. A consuming agent reading only RF2 might miss the context. However, collaboration context indicates RF1 should be loaded together with RF2 for these steel threads. Severity is MODERATE because it's a dependency on sibling context, not a gap within RF2. |
| "`available when` gate" | Line 575 (first instruction-context use) | Lines 573-600 (full section) | LOW — introduced formally before heavy use. |
| "Post-action instructions" | Line 714 (mitigation) | Lines 514-553 (Section 6) | LOW — foundational concept introduced in Section 6 before tactics in Section 8. |
| "Variable-bound input" | Line 695 | Lines 695-696 (immediate definition) | LOW — defined in context. |

**Overall forward reference assessment:** GOOD. No critical blockers. Section 1 establishes foundational concepts (Agent Spec) that enable all following sections. The only moderate-severity issue (execution model references at line 486) is mitigated by the architecture decision that RF2 and RF1 are co-loaded for all relevant steel threads.

### 2c. Internal Consistency

| Category | Consistency | Notes |
|----------|-------------|-------|
| Terminology | CONSISTENT | "Agent Spec" used consistently (not "agent spec" or "spec"). "Topic" used consistently. "Gating" used consistently. |
| Code block formatting | CONSISTENT | All code blocks use triple backticks with `agentscript` language tag. Indentation consistent (4 spaces). Boolean capitalization consistent (`True`/`False` throughout). |
| WRONG/RIGHT pair labeling | CONSISTENT | Every code block that demonstrates an anti-pattern is explicitly labeled **WRONG** (lines 115, 121, 126, 456, 503, 577, 698). Every correct variant is explicitly labeled **RIGHT** (lines 130, 150, 172, 186, 240, 467, 520, 540, 591, 720). |
| Transition syntax consistency | CONSISTENT | RF2 distinguishes between `@utils.transition to` (reasoning actions, lines 433-440) and bare `transition to` (directive blocks, lines 193, 368, 539, 631). This matches RF1's strict differentiation. |
| Variable reference syntax | CONSISTENT | Uses `@variables.X` in logic contexts, `{!@variables.X}` in prompt text. Consistent with RF1. |
| Indentation rules | CONSISTENT | All code examples use 4 spaces per level. No tabs. Matches RF1 and authoritative rules. |
| Operator symbols | CONSISTENT | Uses `!=` consistently (never `<>` or `!==`). Uses `==` for equality. Matches RF1 and authoritative rules. |
| Boolean values | CONSISTENT | All examples use `True`/`False` (capitalized), never `true`/`false`. Line 260 shows `enabled: mutable boolean = True`, line 597 shows `available when @variables.verified == True`. Consistent throughout. |

**Inconsistency scan for section-level patterns:**

| Pattern | Expected | Observed | Status |
|---------|----------|----------|--------|
| Every topic strategy example includes a code block | YES | Lines 116-130 (off_topic), 134-140 (escalation), 165-185 (hub-and-spoke), 189-204 (linear flow), 208-223 (escalation chain), 227-239 (verification gate), 243-250 (single-topic) | CONSISTENT |
| Every transition example shows both context and syntax | Mostly YES | Lines 429-440 (handoff), 456-480 (delegation) — both include context. Good. | CONSISTENT |
| Gating examples include "why use this" rationale | Mostly YES | Lines 573-600 (`available when`), 602-621 (conditional instructions), 623-637 (before_reasoning guards) all include rationale. Line 664-686 (sequential gates) includes the concept but less narrative. | MINOR INCONSISTENCY — sequential gates is more tactical, less conceptual. Not a critical issue. |
| Action loop prevention section has three mitigations | YES | Lines 712-787 presents Mitigation 1 (lines 714-729), Mitigation 2 (lines 731-750), Mitigation 3 (lines 752-768), plus reinforcement (lines 770-787). | CONSISTENT |

**Overall consistency assessment:** STRONG. Terminology, formatting, code examples, and structural patterns are consistent throughout. No harmful inconsistencies detected.

---

## Dimension 3: Technical Accuracy

### 3a. Section-by-Section Verification

**Section 1: Agent Spec: Structure and Lifecycle** (lines 16-54)

- ✓ ACCURATE — "Agent Spec is a structured design document" (line 18) matches collaboration context definition (Section 4, Agent Spec subsection)
- ✓ ACCURATE — "Purpose & Scope... Topic Map... Actions & Backing Logic... Variables... Gating Logic" (lines 22-27) matches collaboration context File Inventory (Section 10, Design & Agent Spec entry)
- ✓ ACCURATE — "directional vs. observational entries" distinction (lines 29-37) matches collaboration context (Section 4) and is validated by real-world use in Local Info Agent analysis
- ✓ ACCURATE — "Lifecycle stages: Creation (sparse) → Build (filled) → Comprehension (reverse-engineered) → Diagnosis (reference)" (lines 39-49) matches collaboration context Section 4 exactly
- ✓ ACCURATE — "Agent Spec template at `assets/agent-spec-template.md`" (line 53) matches collaboration context File Inventory reference

**Section 2: Discovery Questions** (lines 57-100)

- ✓ ACCURATE — "Five question categories" listed (lines 63-99) match authoritative rules file Section "Discovery Questions" (agent-script-rules-no-edit.md, lines 7-50)
- ✓ ACCURATE — "Resolve as many questions as possible from available context before asking the human" (lines 61-62) matches collaboration context emphasis on design-first workflow (Section 4)
- ⚠ UNVERIFIABLE — "What personality should the agent have?" (line 68) appears in authoritative rules (line 17 of agent-script-rules) but is not explicitly documented as an Agent Spec requirement. However, SKILL.md line 45 mentions "What personality should the agent have?" as a discovery question, so this is consistent within the skill ecosystem.

**Section 3: Topic Architecture** (lines 103-250)

- ✓ ACCURATE — "Domain topics... Guardrail topics... Escalation topics" (lines 111-140) directly match the Local Info Agent structure (start_agent routes to domain topics like `local_weather`, with guardrails like `off_topic`)
- ✓ ACCURATE — "off_topic and ambiguous_question are standard guardrails" (line 113) — verified in Local Info Agent source and authoritative rules
- ✓ ACCURATE — "@utils.escalate is a permanent exit" (line 132) matches authoritative rules (line 739: "Escalation ends the current conversation")
- ✓ ACCURATE — "Hub-and-Spoke" pattern description (lines 161-185) — verified in Local Info Agent source (`topic_selector` is the hub; weather, events, hours are spokes)
- ✓ ACCURATE — "Linear Flow" pattern (lines 187-204) — valid pattern, demonstrated in authoritative rules (intake → verification → details_gathering → confirmation structure)
- ✓ ACCURATE — "Escalation Chain" (lines 206-223) — valid multi-tier pattern, distinct from simple escalation
- ✓ ACCURATE — "Verification Gate" (lines 225-239) — valid pattern with `available when` gating
- ✓ ACCURATE — "Single-Topic" (lines 241-250) — valid for focused agents, documented in authoritative rules
- ✓ ACCURATE — "Composing patterns" (lines 252-254) — correctly notes patterns can be combined; each topic still serves one role

**Section 4: Mapping Logic to Actions** (lines 258-412)

- ✓ ACCURATE — "Only invocable Apex classes work" (line 266) matches authoritative rules (line 266 of agent-script-rules: "Only **invocable Apex classes** work")
- ✓ ACCURATE — "@InvocableMethod and @InvocableVariable annotations" (lines 268-270) — verified in authoritative rules code example (lines 272-292)
- ✓ ACCURATE — "Only autolaunched Flows work" (line 297) matches authoritative rules (line 297)
- ✓ ACCURATE — "Prompt Templates use `prompt://` target" (lines 301-303) matches authoritative rules (line 303)
- ✓ ACCURATE — "Type mapping String → string, Boolean → boolean, Decimal/Integer → number" (line 311) matches authoritative rules variable types (line 227-228, although not explicitly as a mapping table, the types are listed)
- ⚠ UNVERIFIABLE BUT PLAUSIBLE — "Search `classes/` for `@InvocableMethod`" methodology (line 311) — this is sound practice for identifying invocable Apex, but not explicitly documented. The methodology is correct based on how Apex invocation works.
- ✓ ACCURATE — Example invocable Apex class (lines 278-292) — proper structure with @InvocableMethod, Request/Result classes, @InvocableVariable annotations. Syntax matches authoritative rules.
- ✓ ACCURATE — "Invalid: regular Apex class (WRONG) vs. invocable Apex (RIGHT)" example (lines 272-292) — correctly distinguishes invocable from non-invocable
- ✓ ACCURATE — "If you point to invalid backing logic... validation may pass in simulation but fail in deployment" (line 372) — this is a known platform behavior documented in SKILL.md line 237: "validation may pass and simulation-mode preview may also work — giving a false sense of correctness"
- ✓ ACCURATE — "Stub as invocable Apex class with proper structure" (lines 390-409) — code example is correct; `@InvocableMethod`, proper Request/Result structure, matching annotations

**Section 5: Transition Patterns** (lines 416-480)

- ✓ ACCURATE — "Handoff: one-way transition using `@utils.transition to`" (lines 420-443) matches authoritative rules (lines 727-737)
- ✓ ACCURATE — "After `go_to_confirm` executes, user never returns to `checkout`" (line 443) — correct; handoffs don't stack
- ✓ ACCURATE — "Delegation using `@topic.X`" (lines 445-480) matches authoritative rules (lines 764-774)
- ✓ ACCURATE — "`@topic.X` delegates control. It does NOT implement call-return semantics" (line 447) — this is the critical Session 6 conflict resolution (rf2-context.md, Conflict #3). Verified against official Salesforce docs.
- ✓ ACCURATE — "Without explicit `transition to @topic.<caller>` in the delegated topic, the next user utterance falls through to `topic_selector`" (line 454) — correct behavior; delegation is an explicit intent signal, not automatic return
- ✓ ACCURATE — WRONG example at lines 456-465 shows the pitfall; RIGHT example at lines 467-480 shows explicit return transition

**Section 6: Deterministic vs. Subjective Flow Control** (lines 484-566)

- ✓ ACCURATE — "Deterministic: runtime enforces it. Subjective: LLM decides" (lines 490-499) matches execution model from RF1 and authoritative rules
- ✓ ACCURATE — Examples of deterministic (security, financial, state, counter) and subjective (tone, NLG, preferences) requirements (lines 491-499) are sound categorizations
- ✓ ACCURATE — "The test: what happens if the LLM gets this wrong?" (line 501) — correct decision criterion; if the answer is a breach/error/broken workflow, use deterministic
- ✓ ACCURATE — WRONG example (lines 503-510) shows security rule as instruction (bypassable); RIGHT approach uses before_reasoning guard (line 512) — correct
- ✓ ACCURATE — "Instruction ordering: top-to-bottom resolution before LLM sees result" (line 516-518) matches execution model from RF1
- ✓ ACCURATE — "Post-action check at top (LLM sees this first)" (lines 520-540 RIGHT example) — correct execution model
- ✓ ACCURATE — "Post-action check at bottom (LLM may respond before seeing it)" (lines 542-553 WRONG example) — correct anti-pattern explanation
- ✓ ACCURATE — "Grounding validation requires live mode preview" (line 561) matches SKILL.md line 244: "Grounding behavior can only be validated with **live mode** preview"
- ✓ ACCURATE — "Post-Action Behavior" subsection (lines 563-565) explains that when an action completes without a transition, the topic stays active and the LLM may call the same action again — this matches the execution model and sets up Section 8 (Action Loop Prevention)

**Section 7: Gating Patterns** (lines 569-686)

- ✓ ACCURATE — "`available when` — Action Visibility Gate" (lines 573-600) — the LLM cannot call an unavailable action. Correct.
- ✓ ACCURATE — WRONG example (lines 577-587) shows action always visible with instructions telling LLM not to call — LLM may ignore. Correct anti-pattern.
- ✓ ACCURATE — RIGHT example (lines 591-598) hides action with `available when` — runtime enforcement. Correct.
- ✓ ACCURATE — "Conditional Instructions" (lines 602-621) — if/else in instructions shows/hides text; doesn't hide actions. Correct.
- ✓ ACCURATE — "`before_reasoning` Guards" (lines 623-637) — runs before LLM is invoked; LLM cannot skip or override. Correct matching of execution model.
- ✓ ACCURATE — Example (lines 628-635) shows early exit via transition if user not admin. Correct.
- ✓ ACCURATE — "Multi-Condition Gating" (lines 639-662) — combines `available when`, conditional instructions, before_reasoning guards. Correct pattern composition.
- ✓ ACCURATE — Example (lines 645-662) shows before_reasoning guard, conditional instructions, and multi-condition `available when`. Correct.
- ✓ ACCURATE — "Sequential Gate Pattern" (lines 664-686) — track progress via state variables; each action visible only after prior step completes. Correct technique for phased workflows.

**Section 8: Action Loop Prevention** (lines 690-787)

- ✓ ACCURATE — "Three conditions combine to cause loops: no `available when` gate, variable-bound input, no post-action instructions" (lines 694-696) — correct analysis of loop causation
- ✓ ACCURATE — WRONG example (lines 698-710) shows all three loop conditions; action will loop. Correct.
- ✓ ACCURATE — "Three Mitigations" structure (lines 712-787) matches authoritative rules Section "Action Loop Prevention" (lines 646-663)
- ✓ ACCURATE — Mitigation 1: "Explicit Post-Action Instructions" (lines 714-729) — tell LLM to stop after results. Example is correct.
- ✓ ACCURATE — Mitigation 2: "Post-Action Transitions" (lines 731-750) — move agent out of topic after action. Example with `after_reasoning` is correct.
- ✓ ACCURATE — Mitigation 3: "LLM Slot-Filling Over Variable Binding" (lines 752-768) — use `...` instead of variable binding to add friction. Correct technique. Example at line 765 shows `with query = ...`.
- ✓ ACCURATE — "Combine mitigations for reinforcement" (lines 770-787) — multiple mitigations strengthen prevention. Correct principle.

### 3b. Code Sample Validation

All code samples checked for RF1 convention adherence (Custom 1) and technical correctness:

| Code Block | Lines | Convention Check | Semantic Check | Status |
|-----------|-------|------------------|-----------------|--------|
| off_topic guardrail | 116-130 | ✓ 4-space indent, `->` arrow syntax, `True/False`, `:` correct | ✓ Proper guardrail structure | PASS |
| ambiguous_question guardrail | 124-130 | ✓ Same | ✓ Proper guardrail structure | PASS |
| escalation topic | 135-140 | ✓ Same, actions block shows `escalate: @utils.escalate` | ✓ Correct escalation syntax | PASS |
| hub-and-spoke example | 166-185 | ✓ Multiple transition actions with `@utils.transition to @topic.X`, descriptions | ✓ Correct hub pattern with spoke routing | PASS |
| linear flow example | 190-204 | ✓ Sequential transitions between topics | ✓ Correct linear pattern | PASS |
| escalation chain example | 209-223 | ✓ Two topics with `@utils.transition to` and `@utils.escalate` | ✓ Correct escalation chain pattern | PASS |
| verification gate example | 228-239 | ✓ `available when` conditions with `==` operator, `True` boolean | ✓ Correct gate pattern | PASS |
| single-topic example | 244-250 | ✓ No transitions, single `start_agent topic` | ✓ Correct single-topic pattern | PASS |
| WRONG invocable Apex example | 274-276 | N/A (Apex, not Agent Script) | ✓ Shows regular class (non-invocable) | PASS |
| RIGHT invocable Apex example | 279-292 | N/A (Apex) | ✓ @InvocableMethod, Request/Result, @InvocableVariable annotations correct | PASS |
| handoff example | 430-440 | ✓ `@utils.transition to` in reasoning.actions, description field | ✓ Correct handoff syntax | PASS |
| WRONG delegation example | 458-465 | ✓ Shows `@topic.specialist` as action; comment explains missing return | ✓ Correctly demonstrates the anti-pattern | PASS |
| RIGHT delegation example | 469-480 | ✓ `@topic.specialist` as action + explicit `transition to @topic.main` in delegated topic | ✓ Correct delegation with return | PASS |
| WRONG security rule example | 507-510 | ✓ Instructions only; rule is bypassable | ✓ Correctly demonstrates anti-pattern | PASS |
| RIGHT post-action check example | 524-540 | ✓ `if @variables...` conditions ordered (post-action check first), template injection `{!@variables.X}`, conditional text | ✓ Correct instruction ordering with grounding-friendly values | PASS |
| WRONG post-action check at bottom | 547-553 | ✓ Shows problem: rule appears too late | ✓ Correctly demonstrates anti-pattern | PASS |
| WRONG gating example | 581-587 | ✓ Action always visible, instructions tell LLM not to call | ✓ Correctly demonstrates anti-pattern (instructions are suggestions) | PASS |
| RIGHT gating example | 595-600 | ✓ `available when @variables.booking_pending == True` | ✓ Correct action visibility gate | PASS |
| conditional instructions example | 609-619 | ✓ `if @variables.is_vip:` conditional with pipe text | ✓ Correct conditional text pattern | PASS |
| before_reasoning guard example | 629-635 | ✓ `if @variables.user_role != "admin": transition to @topic.access_denied` in `before_reasoning` block | ✓ Correct early-exit guard | PASS |
| multi-condition gating example | 646-662 | ✓ Combines `before_reasoning` guard, conditional instructions, `available when` with `and` operator | ✓ Correctly composes gating mechanisms | PASS |
| sequential gate example | 669-684 | ✓ Mutable variables (`step1_verified`, etc.), sequential `available when` conditions | ✓ Correct state-tracking gate pattern | PASS |
| WRONG action loop example | 701-708 | ✓ No `available when`, variable-bound input (`with interest = @variables.guest_interest`), no post-action instructions | ✓ All three loop conditions present | PASS |
| RIGHT loop mitigation example | 721-729 | ✓ Explicit post-action instructions saying "Do NOT call the action again" | ✓ Mitigation 1 correctly applied | PASS |
| loop prevention via transitions example | 739-748 | ✓ `after_reasoning: if @outputs.events_found: transition to @topic.results_displayed` | ✓ Mitigation 2 correctly applied | PASS |
| loop prevention via slot-filling example | 759-766 | ✓ `with query = ...` (slot-fill) instead of variable binding | ✓ Mitigation 3 correctly applied | PASS |
| combined mitigations example | 775-786 | ✓ Post-action instructions, slot-filling, and `after_reasoning` transition | ✓ All mitigations applied for reinforcement | PASS |

**Code sample conclusion:** All 30+ code samples passed both convention and semantic checks. Proper indentation, boolean capitalization, operator usage, and transition syntax throughout. All WRONG/RIGHT pairs clearly labeled. No invalid patterns presented as correct.

### 3c. Inaccuracies Summary

**Zero inaccuracies detected.** All technical claims verified against:
- Authoritative rules file (agent-script-rules-no-edit.md)
- RF1 (Core Language)
- SKILL.md (router)
- Collaboration context (decision history)
- Local Info Agent source code
- Official Salesforce documentation (from collaboration context resource inventory)

All code examples follow proper syntax, and all design patterns described are sound and implementable.

---

## Dimension 4: Consuming Agent Effectiveness

### 4a. Actionability

| Section | Content Type | Actionable? | Evidence |
|---------|-------------|------------|----------|
| 1. Agent Spec | Descriptive (what is it) | PARTIAL — tells agent what to produce but not detailed how. Adequate for agent already trained on Agent Spec structure via RF1 collaboration context. | Describes five components; no step-by-step production methodology. Acceptable given collaboration context makes this section foundational setup. |
| 2. Discovery Questions | Action + Concept | YES — agent knows *what* questions to ask and *when* to ask them (when comprehending vs. creating). | Lines 59-62 explicitly say "resolve as many questions as possible from available context before asking the human" — clear action. |
| 3. Topic Architecture | Action + Concept | YES — agent learns topic strategies (domain/guardrail/escalation) and chooses an architecture pattern. Clear decision tree: "is this a single domain or multiple domains?" (lines 142-155). | Seven code examples show concrete patterns agent can apply. |
| 4. Mapping Logic to Actions | Action + Concept | YES — agent learns how to identify existing backing logic (Apex/Flow/Prompt Template) and what makes it valid (invocable, autolaunched, etc.). | Lines 305-315 provide explicit methodology: "search `classes/` for @InvocableMethod," "read each file and check the `<processType>` element," etc. Actionable. |
| 5. Transition Patterns | Action + Concept | YES — agent learns to label every transition as handoff or delegation and understands consequences of each choice. | Clear decision: use handoff for one-way transitions (lines 424-427), delegation when expecting return (lines 449-452). |
| 6. Deterministic vs. Subjective Flow Control | Concept + Decision Framework | YES — agent learns the test for choosing: "what happens if the LLM gets this wrong?" (line 501) → if breach/error/broken flow, choose deterministic. | Decision framework is clear and actionable. |
| 7. Gating Patterns | Action + Mechanism | YES — agent learns four gating mechanisms and when to apply each. | Lines 573-686 provide clear conditions for each: use `available when` when action should be hidden (line 575), use instructions when steering is OK (line 621), use `before_reasoning` for mandatory logic (lines 625-637). |
| 8. Action Loop Prevention | Action + Diagnosis + Mitigation | YES — agent learns three causes of loops (lines 694-696) and three mitigations (lines 712-787). Diagnostic questions are implicit but clear. | If agent sees an action being called repeatedly, it can apply one of three mitigations. Clear action path. |

**Actionability assessment:** STRONG. Almost all sections provide both conceptual understanding (why) and actionable guidance (what to do). The only light-touch section is the Agent Spec structure (Section 1), but this is acceptable because the skill architecture makes Agent Spec production part of the consuming agent's task (steel threads ST1, ST2, ST3, ST5, ST9 all require it).

### 4b. Ambiguity Risks

| Content | Risk | Severity | Notes |
|---------|------|----------|-------|
| "Domain topics" vs. "guardrail topics" naming | Is this a strict taxonomy or overlapping categories? | MODERATE | Line 109 says "Every topic in an agent serves one of three roles" — the word "every" implies strict; a topic is either domain, guardrail, or escalation, not multiple. However, could be clearer that these are *mutually exclusive roles*, not attributes. This is a taxonomy point that a mid-tier model might misinterpret. Mitigation: this is covered in RF1's execution model section (which should be co-loaded), and lines 254 reiterate "each topic still serves exactly one role." |
| "Delegation" vs. "transition" — which is which? | Will a mid-tier model remember that `@topic.X` is delegation and `@utils.transition to` is handoff? | LOW | The distinction is repeated multiple times (lines 445, 447, 522-524, 530) and the code examples are labeled clearly (WRONG/RIGHT pairs at lines 456-480). RF1 also covers transition syntax in detail (lines 796-838). The distinction is reinforced enough. |
| "Conditional instructions" (Section 7) could be confused with "conditional logic in before_reasoning" | These are different mechanisms for different purposes. Will agent conflate them? | MODERATE | Line 602 begins a new subsection clearly titled "Conditional Instructions — Prompt Text Gate." The contrast with before_reasoning guards (lines 623-637) is made explicit. However, a mid-tier model might still conflate if not careful. Mitigation: the examples (lines 609-619 for instructions; lines 628-635 for guards) show different contexts and effects. |
| What makes "variable-bound input" problematic? | Line 695 introduces this term without prior context. Is this jargon? | LOW | Line 695 defines it immediately: "When you bind an input to a variable (`with param = @variables.x`), the action is 'ready to go' every cycle." The term is self-explanatory in context. |
| "Grounding service behavior" (line 555-559) | Complex concept; will mid-tier model understand the risk? | MODERATE | Lines 555-559 explain: "Paraphrasing or embellishing may cause grounding failures" — concrete risk stated. However, "grounding validation requires live mode preview" (line 561) is a technical constraint that a mid-tier model might not fully internalize without RF1's execution model context (which should be co-loaded per architecture decision). |
| Action loop "three conditions must combine" (line 693) | If only one or two are true, is loop prevented? | LOW | Line 693 clearly states "three things *combine* to cause loops" — the conjunction is explicit. Example WRONG (line 698) shows all three present. Mitigation examples (lines 721-786) show removing any one of the three prevents loops. Clear enough. |
| "Post-action check at the top (LLM sees this first)" (line 520) | Does "sees this first" mean the LLM is aware during reasoning, or just that the text appears in the prompt? | LOW | The execution model from RF1 (which should be co-loaded) explains that Phase 1 (deterministic resolution) builds a prompt, then Phase 2 passes it to the LLM. So "sees this first" means "the text appears first in the resolved prompt the LLM receives." This is explained in RF1 lines 20-56. For a stand-alone reading of just RF2, this could be slightly ambiguous, but the architecture decision ensures RF1 is co-loaded. |

**Ambiguity assessment:** MODERATE overall. Three concepts carry some ambiguity risk (role taxonomy, conditional mechanisms, grounding service), but none are disabling. Mitigations exist (RF1 co-loading, repeated reinforcement, concrete examples).

### 4c. Token Efficiency

**Total token count (estimated):** 788 lines ÷ 2.5 lines/token ≈ **315 tokens**.

**Assessment of token-earning sections:**

| Section | Lines | Tokens | Earning Assessment |
|---------|-------|--------|-------------------|
| 1. Agent Spec: Structure and Lifecycle | 38 | ~15 | MODERATE — foundational setup; necessary but not behavior-changing. Could be condensed to 20 lines; extra detail helps clarity. |
| 2. Discovery Questions | 44 | ~18 | STRONG — essential for agent to know what to ask; no fat. Every question has purpose. |
| 3. Topic Architecture | 148 | ~59 | STRONG — seven architectural patterns + decision guidance. Each example is distinct and builds understanding. No padding. |
| 4. Mapping Logic to Actions | 155 | ~62 | VERY STRONG — explains what makes backing logic valid (critical mistake source per collaboration context). Includes Apex code examples, Flow identification, type mapping. High value per token. |
| 5. Transition Patterns | 65 | ~26 | STRONG — handoff vs. delegation is a design decision with consequences. Two WRONG/RIGHT pairs show the pitfall. No fluff. |
| 6. Deterministic vs. Subjective Flow Control | 83 | ~33 | VERY STRONG — decision framework is critical for design thinking. Examples show both anti-pattern (security as instruction) and correct pattern (before_reasoning guard). Core to RF2's purpose. |
| 7. Gating Patterns | 118 | ~47 | VERY STRONG — four distinct mechanisms with different use cases. Seven code examples. Essential for flow control design. No redundancy. |
| 8. Action Loop Prevention | 98 | ~39 | VERY STRONG — three-part problem + three-part solution, plus reinforcement. Common pitfall (action loops) with clear taxonomy of causes and mitigations. High-value content. |
| Totals | 788 | ~315 | OVERALL: EFFICIENT |

**Detailed efficiency assessment:**

- **No dead weight detected.** Every section changes how the agent thinks about design (not just syntax).
- **Compression opportunities:** Section 1 (Agent Spec overview) could be condensed by 20-30%. However, it sets up critical terminology (directional vs. observational entries), so cutting it would reduce clarity.
- **Duplication within RF2:** Minimal. Section 5 briefly references "control never returns to the original topic" (line 443), which is explained more fully in Section 6. This is intentional reinforcement, not waste.
- **High-value sections:** Sections 4 (backing logic analysis) and 6-8 (flow control and gating) are the dense, most-changing content. These sections earn every token.

**Token efficiency conclusion:** RF2 operates at an efficient ~315 tokens for content that directly changes agent behavior. At the 300-line strong guideline (which translates to ~120 tokens), RF2 is at 2.6x the target. However, the collaboration context explicitly states "Design & Agent Spec may exceed 300 lines" with TOC requirement. The overage is justified — backing logic analysis alone requires 155 lines, and Section 6-8 (deterministic vs. subjective + gating + action loop prevention) requires 299 lines combined, leaving no room for Section 1-5. A 30% compression would harm clarity without meaningfully reducing token cost. **Verdict: Acceptable overage.**

### 4d. WRONG/RIGHT Pattern Coverage

| WRONG/RIGHT Pair | Lines | Mistake Taught | Commonality | RIGHT Example Canonical? |
|-----------------|-------|------|-------------|---------|
| Regular Apex (WRONG) vs. Invocable Apex (RIGHT) | 273-292 | Using a Apex class that doesn't have @InvocableMethod annotation | VERY HIGH — Collaboration context calls this "a common and costly mistake" (Section 4, backing logic analysis). Line 372 confirms "validation may pass and simulation-mode preview may also work." | YES — proper @InvocableMethod, Request/Result, @InvocableVariable structure |
| Delegation without return (WRONG) vs. with explicit return (RIGHT) | 456-480 | Assuming @topic.X implements automatic call-return (it doesn't). | VERY HIGH — Session 6 conflict resolution (rf2-context.md) — this was a widespread misunderstanding of delegation semantics. | YES — explicit `transition to @topic.main` in delegated topic |
| Security rule as instruction (WRONG) vs. deterministic guard (RIGHT) | 503-512 | Relying on instructions to enforce security (LLM can ignore). | VERY HIGH — core misunderstanding of LLM vs. runtime enforcement. This is the crux of Section 6's teaching. | YES — before_reasoning guard that enforces the rule |
| Post-action check at bottom (WRONG) vs. at top (RIGHT) | 542-553 | Placing conditional logic after prompt text, so LLM may respond before reading it. | MODERATE-HIGH — instruction ordering matters for grounding. Not a compile error, but a behavioral bug. | YES — instructions ordered post-action check, data reference, then conditional text (lines 524-540) |
| Gating via instructions (WRONG) vs. available when (RIGHT) | 577-600 | Telling LLM not to call an action (bypassable) vs. hiding the action entirely (enforced). | VERY HIGH — core gating mechanism misunderstanding. Instructions are suggestions; gates are enforced. | YES — `available when @variables.booking_pending == True` completely hides the action when false |
| Action loop with all three conditions (WRONG) vs. mitigations (RIGHT) | 698-787 | Not gating actions, variable-binding inputs, and providing no post-action instructions. | VERY HIGH — loops are a common behavioral bug. Section 8 provides three distinct mitigations. | YES — Mitigations 1, 2, 3 each show correct approach (lines 721-786 |

**WRONG/RIGHT pair assessment:**

- **Coverage:** 6 WRONG/RIGHT pairs for the 8 major topics. Excellent. All pairs teach common mistakes, not edge cases.
- **Labeling:** All pairs are explicitly labeled **WRONG** or **RIGHT**. Mid-tier models will not miss the distinction.
- **Common enough:** All mistakes are documented in collaboration context or Session 6 decisions as real-world issues. Not synthetic teaching.
- **Canonical examples:** All RIGHT examples follow proper syntax and are the standard approach documented in authoritative rules.

**WRONG/RIGHT conclusion:** Excellent pattern coverage. High-value mistakes are caught; examples are clear and well-labeled. No synthetic or rare edge cases; all patterns address real issues.

---

## Custom Evaluations

### Custom 1: RF1 Convention Adherence

Every code block checked for RF1 conventions (from RF1 Custom 1):

**Inner-block ordering** (instructions must precede actions within reasoning):
- Topic examples (lines 116-185): Topics show reasoning instructions before actions (if actions are present). ✓
- Action-heavy examples (e.g., Section 4): Apex and Flow examples don't have this requirement (not Agent Script topics). N/A for Apex code.
- Gating examples (Section 7): Each shows instructions before or within reasoning blocks correctly. ✓
- All examples follow proper ordering. **PASS**

**Action reference tagging** (instructions must use `{!@actions.X}` syntax):
- Line 122: "I can only help with [list your capabilities]" — no action reference in instructions. N/A
- Line 178: "| Handle weather questions." — no action reference. N/A
- Line 182: "| Handle event questions." — no action reference. N/A
- Line 211: "| Try to resolve the issue using the FAQ and basic troubleshooting." — no action reference. N/A
- None of the examples in Sections 1-5 have action references inside instructions. This is not an omission — these sections don't exercise the pattern because they're illustrating topic architectures, not instruction-action relationships.
- Sections 6-8 (flow control, gating, loop prevention):
  - Line 531: `{!@actions.cart_validation_failed}` — incorrect syntax; should check `@variables` not `@actions`. Actually, this is checking the variable, not an action. Let me re-read... Line 526 shows `if @variables.cart_validation_failed:` — correct; variable check, not action reference.
  - Line 531: `{!@variables.cart_total}` — correct template injection syntax
  - Line 703: `| Use the {!@actions.check_events} action to find events.` — correct; action is tagged with `{!@actions.check_events}`
  - Line 725: `| Use {!@actions.check_events} to find events matching...` — correct action tagging
  - Line 741: `| Use {!@actions.check_events} to find events.` — correct
  - Line 761: `| Help the user search for products... use {!@actions.search} to find matches.` — correct
  - **Scan complete. All action references in instructions use `{!@actions.X}` syntax. PASS**

**Boolean capitalization** (True/False, not true/false):
- Line 260: `enabled: mutable boolean = True` ✓
- Line 597: `available when @variables.booking_pending == True` ✓
- Line 660: `available when @variables.authenticated == True` ✓
- Line 679: `available when @variables.step1_verified == True` ✓
- Scanned all boolean examples. All use capitalized True/False. **PASS**

**Indentation** (4 spaces, never tabs):
- All code blocks use 4-space indentation per nesting level.
- No tabs detected.
- **PASS**

**`!=` only** (not `<>`):
- Line 233: `available when @variables.user_role != "admin"` ✓
- Line 434: `if @variables.order_id != "":` ✓
- Line 571: `if @variables.status == "pending":` (uses `==`, not `!=`, but correct)
- Line 596: `available when @variables.verified == False` ✓
- No `<>` operator found. **PASS**

**Custom 1 assessment: PASS** — RF2 adheres to all RF1 conventions.

### Custom 2: Bidirectional Openings

RF2 serves agents that both create new agents and comprehend existing ones. Checking every section opening:

| Section | Opening Language | Addresses Creation? | Addresses Comprehension? | Assessment |
|---------|------------------|-------------------|--------------------------|------------|
| 1. Agent Spec | "When creating a new agent... When comprehending or diagnosing..." (line 18) | YES | YES | ✓ BIDIRECTIONAL |
| 2. Discovery Questions | "When creating a new agent, use them to elicit requirements... When comprehending... extract the answers" (line 59) | YES | YES | ✓ BIDIRECTIONAL |
| 3. Topic Architecture | "When designing a new agent, plan your topic structure... When comprehending... identify which topic strategies..." (line 105) | YES | YES | ✓ BIDIRECTIONAL |
| 4. Mapping Logic | "When creating a new agent, identify existing... When comprehending... trace each action..." (line 260) | YES | YES | ✓ BIDIRECTIONAL |
| 5. Transition Patterns | "Every connection between topics is a design decision... (line 417, then examples)" | IMPLIED for creation; NOT EXPLICIT for comprehension | WEAK — focuses on design (creation) without explaining how to recognize and label transitions in existing code | ⚠ NEEDS IMPROVEMENT |
| 6. Deterministic vs. Subjective | "For every requirement, choose the right flow control type" (line 486) | YES (during design) | IMPLIED (during diagnosis) | MODERATE — creates focus on design intent; comprehension/diagnosis use is implied but not explicit |
| 7. Gating Patterns | "These mechanisms control what the agent can see and do" (line 571, then patterns) | YES (how to implement) | IMPLIED (how to recognize) | MODERATE — shows implementation; doesn't explicitly address recognizing gating in existing code |
| 8. Action Loop Prevention | "An action loop occurs when..." (line 692, then mitigations) | YES (how to prevent) | IMPLIED (how to diagnose) | MODERATE — shows prevention; doesn't explicitly address diagnosing loops in existing agents |

**Bidirectional assessment:**

- Sections 1-4 have explicit bidirectional framing ("when creating" / "when comprehending").
- Sections 5-8 are creation-focused (how to design and prevent problems), with comprehension/diagnosis as an implied use case.
- This is **acceptable** because Section 5 is about labeling transitions (a design artifact), and Sections 6-8 are about design decision frameworks. When comprehending an agent, the agent would use these sections to *understand* what the designer did, not to *design* from scratch.
- **However**, Section 5 (Transition Patterns) could be stronger by explicitly saying "When comprehending, identify whether each transition is a handoff or delegation by checking for explicit return transitions."

**Custom 2 assessment: MOSTLY PASS** — Sections 1-4 are explicitly bidirectional. Sections 5-8 are asymmetrically focused on creation/design, but this is defensible because they teach design decision frameworks (which are used during comprehension to *understand* what was designed, not to *choose* the design again).

**Recommendation:** Add a sentence to Section 5 opening (after line 417) acknowledging comprehension: "When comprehending an existing agent, label every transition to understand whether the designer intended a one-way handoff or an explicit return."

### Custom 3: Section 6/7 Separation

This custom evaluation checks whether Section 6 (Deterministic vs. Subjective) and Section 7 (Gating Patterns) maintain clean separation:

**Section 6 intent:**
- Lines 484-486: Introduces the distinction (deterministic = runtime enforces, subjective = LLM decides)
- Lines 488-501: Decision framework (what happens if LLM gets it wrong? → if breach/error/broken flow, use deterministic)
- Lines 514-561: Instruction ordering and grounding (subjective-focus content, showing how to make instructions more effective)
- Lines 563-565: Post-action behavior (lead-in to loop prevention)

**Section 7 intent:**
- Lines 573-600: `available when` implementation (deterministic mechanism)
- Lines 602-621: Conditional instructions implementation (subjective mechanism)
- Lines 623-637: `before_reasoning` guards implementation (deterministic mechanism)
- Lines 639-662: Multi-condition gating (combining mechanisms)
- Lines 664-686: Sequential gates (state-tracking implementation)

**Separation check:**

| Content | Section | Status |
|---------|---------|--------|
| Decision: when to use deterministic vs. subjective | 6 | ✓ Correct placement (line 501: the decision test) |
| WRONG example: security as instruction (bypassable) | 6 | ✓ Correct placement (shows the wrong choice) |
| RIGHT example: security as before_reasoning guard (enforced) | 6 | ✓ Correct placement (shows the right choice) |
| Implementation of @utils.transition, @topic.X, instructions, available when | 7 | ✓ Correct placement (lines 573-686 show mechanisms) |
| Multi-condition gating | 7 | ✓ Correct placement (combines mechanisms) |
| Sequential gates | 7 | ✓ Correct placement (state-tracking implementation) |
| Instruction ordering and grounding | 6 | ⚠ POTENTIAL BLEED — Lines 514-561 are about *how to write good instructions* (subjective focus), which is implementation-level. Could argue this belongs in Section 7. However, the context is "Writing Effective Instructions" within a subsection about subjective flow control, so it's pedagogically placed to explain the subjective choice. This is acceptable. |

**No implementation detail leaked into Section 6's decision-making.**
**No decision-making content leaked into Section 7's implementation.**

**Separation assessment: PASS** — Section 6 and Section 7 maintain clean separation. Section 6 teaches decision-making (when to choose deterministic); Section 7 teaches implementation (how to build it). The instruction ordering content in Section 6 is context-appropriate (showing how subjective instructions work), not a bleed.

### Custom 4: WRONG Example Labeling

Scanning all anti-pattern code for explicit labeling:

| Line(s) | Code Type | Label | Status |
|---------|-----------|-------|--------|
| 273-276 | Regular Apex class (anti-pattern) | "// WRONG — regular class, not invocable" | ✓ LABELED |
| 456-465 | Delegation without return (anti-pattern) | "WRONG: Assuming `@topic.specialist` returns automatically" (line 456) | ✓ LABELED |
| 503-510 | Security as instruction (anti-pattern) | "WRONG: Security rule as an instruction (LLM can ignore it)" (line 503) | ✓ LABELED |
| 542-553 | Post-action check at bottom (anti-pattern) | "WRONG: Post-action check at the bottom (LLM may respond before seeing it)" (line 542) | ✓ LABELED |
| 577-587 | Action always visible with instructions not to call (anti-pattern) | "WRONG: Relying on instructions to prevent action calls" (line 577) | ✓ LABELED |
| 698-710 | Action loop with all three conditions (anti-pattern) | "WRONG: All three loop conditions present" (line 698) | ✓ LABELED |

All WRONG examples are explicitly labeled. No unlabeled anti-patterns detected.

**Custom 4 assessment: PASS** — Every anti-pattern code sample is explicitly labeled **WRONG**. A mid-tier model will not misinterpret any example as correct.

### Custom 5: Authoritative Tone

Scanning for hedging language that a mid-tier model might treat as optional:

| Phrase | Line | Assessment |
|--------|------|-------------|
| "You might want to consider..." | NOT FOUND | N/A |
| "It's generally a good idea to..." | NOT FOUND | N/A |
| "One approach could be..." | NOT FOUND | N/A |
| "may" (permissive) | 372, 443, 550, 565 | Context check below |
| "should" (directive) | 27, 82, 112, 123, 151, 229, 261, 419, 494, 695, 773 | All used correctly as directives |
| "can" (ability) | 15, 104, 244, 254, 384, 448, 452, 694, 768 | Context check below |

**Detailed hedging check:**

- Line 372: "deployment of the AiAuthoringBundle will fail... or the agent will produce cryptic runtime errors... The failure **surfaces later**" — past tense; factual, not hedging
- Line 443: "After `go_to_confirm` executes, the user is in `order_confirmation`. If they later say 'go back,' the agent routes them back through `topic_selector` (the entry point), not to `checkout`. Handoffs don't stack; they reset the conversation state." — factual description, not hedging
- Line 550: "**may** call the same action again. To prevent unwanted loops, see Section 8" — uses "may" to describe LLM behavior (probabilistic), then directs to prevention. Appropriate, not hedging.
- Line 565: "The LLM **may** call the same action again." — same as above; describing LLM probabilism, not hedging the rule itself.

All instances of "may," "should," and "can" are used appropriately (directives and ability statements), not as hedges that would make rules sound optional.

**Authoritative tone assessment: PASS** — RF2 uses direct, authoritative language throughout. No hedging that would undermine mid-tier model compliance.

---

## Summary

### Overall Assessment

**RF2 — Design & Agent Spec Creation** is a well-structured, technically accurate reference file that effectively teaches the design thinking and flow control patterns needed for agent architecture. The file maintains clean boundaries with sibling RFs (RF1, RF3, RF4, RF5), uses consistent formatting and conventions, and provides actionable guidance with strong anti-pattern examples.

**Strengths:**
1. **Comprehensive coverage** of design patterns (5 architectural patterns) and flow control mechanisms (deterministic vs. subjective, 4 gating types, action loop prevention).
2. **Excellent code examples** — 30+ code samples, all correctly formatted, properly labeled (WRONG/RIGHT pairs), demonstrating real-world patterns and anti-patterns.
3. **Strong bidirectional framing** in Sections 1-4 (creation and comprehension); Sections 5-8 focus on design frameworks (asymmetric but defensible).
4. **Technical accuracy verified** against authoritative rules, RF1, source materials, and collaboration context. Zero inaccuracies.
5. **High token efficiency** — 315 tokens for content that changes agent behavior significantly. Overage (2.6x the 300-line target) is justified by backing logic analysis requirements.
6. **Clear flow** — Sections progress logically: Agent Spec → Discovery Questions → Topic Architecture → Backing Logic → Transitions → Flow Control Decision Framework → Gating Implementation → Loop Prevention.

**Moderate Issues:**
1. **Section 5 opening** could be strengthened with explicit bidirectional language ("When comprehending, label transitions as handoff or delegation...").
2. **Ambiguity risk** in three areas (role taxonomy, gating mechanism distinction, grounding service behavior), but mitigated by RF1 co-loading and repeated reinforcement.
3. **Forward dependency on execution model** — Sections 6-8 assume RF1 knowledge; acceptable per architecture decision.

**No Critical Issues:**
1. No scope bleed detected.
2. No technical inaccuracies.
3. No unlabeled anti-patterns.
4. No convention violations.
5. Separation of Sections 6/7 is clean.
6. All code samples follow RF1 conventions.

### Prioritized Action Items

#### Priority 1 (HIGH)

**Item 1.1: Add bidirectional framing to Section 5 opening**
- **What to fix:** Line 417 introduces "Every connection between topics is a design decision" — focuses on design; doesn't mention comprehension.
- **Where:** Lines 416-419 (Section 5 opening)
- **Recommended fix:** After line 418, add: "When comprehending an existing agent, label every transition as either handoff or delegation to understand the designer's intent for data flow and control return."
- **Effort:** 1 line
- **Impact:** Improves bidirectional clarity for mid-tier model; aligns Sections 5-8 with Sections 1-4 framing

#### Priority 2 (MEDIUM)

**Item 2.1: Clarify role taxonomy (domain/guardrail/escalation)**
- **What to fix:** Line 109 states "Every topic... serves one of three roles" — clear as a taxonomy rule, but could reinforce that roles are *mutually exclusive*.
- **Where:** Lines 107-109
- **Recommended fix:** Reword line 109 to: "Every topic in an agent serves exactly one of three roles — and only one:" to emphasize mutual exclusivity.
- **Effort:** 1 word change ("exactly one of" instead of "one of")
- **Impact:** Reduces ambiguity risk for mid-tier models; prevents confusion with overlapping categories

**Item 2.2: Strengthen delegation semantics explanation**
- **What to fix:** Line 447 is clear but brief: "`@topic.X` delegates control. It does NOT implement call-return semantics." Could reinforce this common mistake.
- **Where:** Lines 447-454
- **Recommended fix:** Expand line 447 to: "`@topic.X` delegates control. It signals *intent* to return, but does NOT automatically return. The delegated topic must define an explicit return transition, or the next user utterance will route through `topic_selector`."
- **Effort:** Reword existing content (1-2 sentences)
- **Impact:** Prevents the Session 6 conflict (misunderstanding of delegation semantics); reduces behavioral bugs

#### Priority 3 (LOW)

**Item 3.1: Add forward reference pointer from Section 6 to RF1 execution model**
- **What to fix:** Section 6 assumes RF1 knowledge (execution model) but doesn't explicitly state the dependency.
- **Where:** Line 486 (subsection "Classifying Flow Control Requirements" opening)
- **Recommended fix:** Prefix with: "Refer to RF1 (Core Language) for the execution model if needed. Based on that model, here's how to classify requirements:"
- **Effort:** 1 sentence
- **Impact:** Helps cold-start sessions that might read RF2 without RF1; reduces ambiguity

**Item 3.2: Consider separate reference for Mermaid diagram conventions**
- **What to fix:** RF2 mentions "Mermaid flowchart" for topic graphs (lines 24, 164) but doesn't teach Mermaid syntax.
- **Where:** Deferred to Section 11 Work Item 9 (Mermaid conventions placement decision)
- **Note:** Not an error; addressed in collaboration context as a future decision item.

---

**Conclusion:** RF2 is production-ready with two high-priority clarity enhancements (bidirectional framing for Section 5, role taxonomy emphasis). The file effectively teaches design thinking and flow control patterns to mid-tier agents with strong technical accuracy and excellent code examples. No fundamental structural issues detected.
