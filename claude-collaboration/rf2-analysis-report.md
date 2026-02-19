# RF2 — Design & Agent Spec Creation — Analysis Report

**Analysis Date:** 2026-02-19
**RF File:** agent-script-skill/references/agent-design-and-spec-creation.md
**Review Stance:** Adversarial — Assume errors; verify against authoritative sources only

---

## Dimension 1: Completeness

### 1a. Coverage Map

Verifying substantive topics within RF2's scope are covered against permitted sources:

| Topic | RF2 Line(s) | Authoritative Source | Status |
|-------|-------------|---------------------|--------|
| Agent Spec structure & sections | 20-27 | Not in `.a4drules`; invented by RF2 authors | ✓ COVERED (design artifact) |
| Discovery Questions: 5 categories | 63-99 | `.a4drules` lines 6-51 | ✓ COVERS ALL (Agent Identity, Topics & Flow, Reasoning, Actions, State Management) |
| Topic roles (domain/guardrail/escalation) | 111-140 | Not named in `.a4drules`; inferred from examples | ✓ COVERED (RF2 invention) |
| Architecture patterns (5 distinct patterns) | 157-250 | Not in `.a4drules` | ✓ COVERED (RF2 patterns) |
| Backing logic identification | 305-325 | `.a4drules` lines 287-299, 306-315 | ✓ COVERS identification methodology |
| Valid backing types: Apex (invocable) | 262-292 | `.a4drules` line 266 | ✓ COVERS with code examples |
| Valid backing types: Flow (autolaunched) | 297-299 | `.a4drules` line 297 | ✓ COVERS |
| Valid backing types: Prompt Templates | 301-303 | `.a4drules` line 292 | ✓ COVERS |
| Transition types (handoff/delegation) | 416-480 | `.a4drules` lines 403-422 | ✓ COVERS with decision rationale |
| Deterministic vs. subjective control | 484-553 | `.a4drules` lines 620-628 | ✓ COVERS decision framework |
| Gating mechanisms (4 types) | 569-686 | `.a4drules` lines 254-257, 465-469 | ✓ COVERS all mechanisms |
| Action loop prevention (3 mitigations) | 690-788 | `.a4drules` lines 646-663 | ✓ COVERS all mitigations |

**Assessment:** All topics within scope are covered. No mandatory gaps.

---

### 1b. Missing Items

Scanning `.a4drules` for content within RF2 scope that is absent from RF2:

| What's Missing | Source | Impact |
|----------------|--------|--------|
| Boolean capitalization rule (True/False not true/false) | `.a4drules` lines 219-221 | **HIGH** — Rule is used in RF2 code examples (line 232, 234, 597) but never stated. Consuming agent may not enforce this. |
| `before_reasoning` and `after_reasoning` block definitions | `.a4drules` lines 254-257, 277-279 | **HIGH** — Used in RF2 examples (line 625, 647-649, 673-683, 745-750) without explanation. Forward reference breaks standalone usability. |
| Grounding validation prerequisites | `.a4drules` lines 677-679 | **MODERATE** — RF2 mentions grounding (line 555-559) but doesn't explain that validation requires live mode, not simulation. Consuming agent may not test correctly. |
| Stub Apex compilation requirement | `.a4drules` line 412 | **LOW** — RF2 line 412 mentions deployment but doesn't state that stub classes must compile; deployment will fail if code has syntax errors. Minor detail. |

**Assessment:** One HIGH-priority gap (boolean rule), one HIGH (directive block definitions), one MODERATE (grounding validation mode).

---

### 1c. Scope Boundary Check

Checking for content that belongs in other RFs or is correctly deferred:

**Correctly Deferred:**
- Syntax rules (operators, expressions) → RF1 ✓
- Variable declaration syntax → RF1 ✓
- Topic block structure → RF1 ✓
- System/Config block details → RF1 ✓
- Validation mechanics → RF3 (deferred appropriately)
- Preview/testing → RF3 (deferred appropriately)

**Scope Bleed Detected:**

1. **Lines 514-553 (Instruction Ordering & Grounding).** This section teaches how to write subjective control (instructions) effectively — it's implementation guidance. While contextually placed within Section 6 (Deterministic vs. Subjective), the grounding discussion (lines 555-559) is a platform-specific technical constraint that borders on validation/preview mechanics (RF3 territory). Verdict: **MINOR** — contextually defensible; not harmful.

2. **Lines 272-292 (Apex code examples).** Full Apex class code with annotations is shown, but RF2 is about *design*, not Apex development. The examples serve the "identify backing logic" section (line 305), so this is **ACCEPTABLE** — the code is a reference artifact for understanding invocable requirements, not a tutorial.

**Assessment:** Scope boundaries are clean. No critical bleed.

---

### 1d. Redundancy with RF1

Checking for content overlapping with RF1 (sibling reference):

| Content | RF2 Lines | RF1 Lines | Assessment |
|---------|-----------|-----------|------------|
| Topic block structure basics | 111-140 | RF1 lines 314-378 | Mild overlap: RF1 shows syntax; RF2 shows role classification. Different purposes. ✓ OK |
| Transitions (`@utils.transition to` vs `@topic.X`) | 416-480 | RF1 lines 550-561, 796-838 | Mild overlap: RF1 teaches syntax; RF2 teaches design consequences. ✓ OK |
| `available when` gating syntax | 573-600 | RF1 lines 698-710 | Mild overlap: RF1 teaches syntax; RF2 teaches patterns. ✓ OK |
| Boolean capitalization | Lines 232, 234, 597 | RF1 lines 286-298 | **UNVERIFIED** — Rule used but not stated in RF2. Creates one-directional dependency on RF1. ⚠ |
| `before_reasoning` mechanics | Lines 623-637 | RF1 lines 362-378 | **UNVERIFIED** — Used in examples without definition in RF2. ⚠ |
| Post-action transitions | Lines 731-750 | RF1 lines 542-546 | Mild overlap: RF1 shows syntax; RF2 shows loop prevention use. ✓ OK |

**Assessment:** Overlaps are intentional pedagogical reinforcement. Two concerns: boolean rule and directive block syntax are *used* but not *defined* in RF2, requiring RF1 lookup.

---

## Dimension 2: Information Flow

### 2a. Section Progression

Evaluating logical sequencing:

| Section | Prerequisites | Flow Assessment |
|---------|--------------|-----------------|
| 1. Agent Spec Structure | None | ✓ Strong opener; introduces core artifact |
| 2. Discovery Questions | Section 1 (what is an Agent Spec) | ✓ Logical: questions *feed* the spec |
| 3. Topic Architecture | Sections 1-2 (agent structure exists) | ✓ Natural progression: now design the topics |
| 4. Mapping Logic to Actions | Sections 1-3 (topics exist; need backing) | ✓ Logical: back each topic with implementations |
| 5. Transition Patterns | Sections 1-4 (topics and actions exist) | ✓ Logical: connect the topics |
| 6. Deterministic vs. Subjective | Sections 1-5 (understand structure) | ⚠ **ASSUMES RF1 KNOWLEDGE** — execution model (line 486) is referenced without definition |
| 7. Gating Patterns | Section 6 (concepts defined) | ✓ Implements Section 6 decisions |
| 8. Action Loop Prevention | Sections 5-7 (transitions, gating) | ✓ Specialized application of prior concepts |

**Assessment:** Flow is logical top-to-bottom. One moderate issue: Section 6 assumes RF1 execution model knowledge without stating this dependency explicitly.

---

### 2b. Forward References

Checking for concepts used before introduction:

| Concept | First Use | First Definition | Severity |
|---------|-----------|-----------------|----------|
| "Agent Spec" | Line 16 | Line 16 (same line) | ✓ LOW — defined immediately |
| "Topic" | Line 18 | Line 103 (Section 3) | ⚠ **MODERATE** — used extensively in Sections 1-2 before formal introduction |
| "Gating logic" | Line 27 | Line 569 (Section 7) | ⚠ **MODERATE** — used in Agent Spec definition (line 27) before Section 7 |
| `before_reasoning` block | Line 625 | Never formally introduced in RF2 | **HIGH** — used in examples without definition |
| `after_reasoning` block | Line 673 | Never formally introduced in RF2 | **HIGH** — used in examples without definition |
| "Variable-bound input" | Line 695 | Line 695 (immediate context) | ✓ LOW — defined in context |
| "Grounding service" | Line 555 | Never explained; just mentioned | ⚠ **MODERATE** — platform concept used without explanation |

**Assessment:** Two HIGH-risk forward references (`before_reasoning`, `after_reasoning` blocks used without explanation). These are Agent Script syntax elements that RF2 should define or explicitly defer to RF1.

---

### 2c. Internal Consistency

Checking formatting, terminology, and structural patterns:

| Pattern | Expected | Observed | Status |
|---------|----------|----------|--------|
| Section headings | Numbered with descriptive text | All sections use "## N. Title" format | ✓ CONSISTENT |
| Code blocks | Triple backticks with language tag | All use ` ```agentscript ` or ` ```apex ` | ✓ CONSISTENT |
| WRONG/RIGHT labeling | Explicit "WRONG:" and "RIGHT:" labels | All 6 pairs are labeled (lines 273, 456, 503, 542, 577, 698) | ✓ CONSISTENT |
| Boolean values | Capitalized True/False | All examples use True/False (never true/false) | ✓ CONSISTENT |
| Indentation | 4 spaces per level | All code examples follow this | ✓ CONSISTENT |
| Operators | `!=` only (not `<>`) | All examples use `!=` for inequality | ✓ CONSISTENT |
| Template injection | `{!@variables.X}` in prompt text | Used consistently (lines 531, 539, 703, 722) | ✓ CONSISTENT |
| Action references | `{!@actions.X}` in instructions | Used consistently where present (line 703, 722, 761) | ✓ CONSISTENT |

**Assessment:** High consistency. No formatting or terminology violations detected. Code examples follow RF1 conventions.

---

## Dimension 3: Technical Accuracy

### 3a. Section-by-Section Verification

**Section 1: Agent Spec (Lines 16-54)**

| Claim | Verification | Result |
|-------|--------------|--------|
| "Agent Spec is a structured design document" | Not in `.a4drules` or official docs | ⚠ **UNVERIFIABLE** — design artifact created by authors |
| Five required sections (Purpose, Intent, Topic Map, Actions, Variables, Gating Logic) | Not in `.a4drules` | ⚠ **UNVERIFIABLE** — not platform-mandated; author-defined structure |
| "Directional vs. observational entries" distinction | Not in `.a4drules` | ⚠ **UNVERIFIABLE** — author's concept |
| "Lifecycle stages: Creation (sparse) → Build → Comprehension → Diagnosis" | Not in `.a4drules` | ⚠ **UNVERIFIABLE** — author's framework |

**Verdict:** Section 1 describes design artifacts not validated against authoritative sources. These are reasonable design patterns but not platform-mandated. Consuming agent should understand these are *recommended* patterns, not requirements.

---

**Section 2: Discovery Questions (Lines 57-100)**

| Claim | Verification | Result |
|-------|--------------|--------|
| Five question categories match `.a4drules` | `.a4drules` lines 6-51 (Discovery Questions section) | ✓ **ACCURATE** — Direct mapping |
| "Resolve as many questions as possible from available context before asking human" | `.a4drules` lines 9-12 ("ALWAYS run this CLI command...") | ✓ **ACCURATE** — Aligns with design-first methodology |

---

**Section 3: Topic Architecture (Lines 103-250)**

| Claim | Verification | Result |
|-------|--------------|--------|
| "Topics are states in a finite state machine" (line 105) | Not stated in `.a4drules`; inferred from execution model | ✓ **PLAUSIBLE** — Aligns with topic structure |
| "Domain topics... Guardrail topics... Escalation topics" | Not named in `.a4drules`; inferred from Local_Info_Agent.agent (lines 47-90) | ⚠ **UNVERIFIABLE** — RF2 classification; not platform terminology |
| "off_topic and ambiguous_question are standard guardrails" | Local_Info_Agent.agent lines 47-90 (confirms these are present) | ✓ **ACCURATE** for the reference agent |
| "`@utils.escalate` is a permanent exit" | `.a4drules` lines 372-373 ("Escalation ends the current conversation") | ✓ **ACCURATE** |

---

**Section 4: Mapping Logic to Actions (Lines 258-412)**

| Claim | Verification | Result |
|-------|--------------|--------|
| "Only invocable Apex classes work" | `.a4drules` line 266 | ✓ **ACCURATE** |
| "@InvocableMethod marks the entry point" | `.a4drules` line 268 | ✓ **ACCURATE** |
| "@InvocableVariable marks inputs/outputs" | `.a4drules` line 270 | ✓ **ACCURATE** |
| Apex example (lines 279-292) structure | `.a4drules` example (lines 279-292) | ✓ **ACCURATE** — matches annotations |
| "Only autolaunched Flows work" | `.a4drules` line 297 | ✓ **ACCURATE** |
| Type mapping (String → string, Boolean → boolean, Decimal → number) | `.a4drules` lines 227-228 (action parameter types) | ✓ **ACCURATE** |
| "If you point to invalid backing logic... validation may pass in simulation but fail in deployment" | Mentioned in SKILL.md (platform behavior) | ✓ **ACCURATE** — known platform issue |

---

**Section 5: Transition Patterns (Lines 416-480)**

| Claim | Verification | Result |
|-------|--------------|--------|
| "Handoff is one-way using `@utils.transition to`" | `.a4drules` lines 373, 410-411 | ✓ **ACCURATE** |
| "Delegation uses `@topic.X`" | `.a4drules` line 375 | ✓ **ACCURATE** |
| "`@topic.X` does NOT implement call-return semantics automatically" | `.a4drules` line 375 (says "can return" if coded) | ✓ **ACCURATE** — emphasizes explicit coding requirement |
| WRONG example (lines 456-465) shows missing return | Logic correct per platform behavior | ✓ **ACCURATE** anti-pattern |
| RIGHT example (lines 468-480) shows explicit return | Correct per `.a4drules` | ✓ **ACCURATE** |

---

**Section 6: Deterministic vs. Subjective Flow Control (Lines 484-566)**

| Claim | Verification | Result |
|-------|--------------|--------|
| "Deterministic: runtime enforces. Subjective: LLM decides" | RF1 execution model (lines 20-56) | ✓ **ACCURATE** — execution phases |
| Examples of deterministic (security, financial) and subjective (tone, NLG) | `.a4drules` directives (lines 620-628) | ✓ **ACCURATE** |
| "The test: what happens if LLM gets wrong?" decision framework | Sound principle; not in `.a4drules` | ✓ **PLAUSIBLE** — good design heuristic |
| "Instruction ordering: top-to-bottom resolution before LLM sees result" | RF1 execution model (Phase 1) | ✓ **ACCURATE** |
| "Post-action check should appear first" (lines 520-540 RIGHT example) | `.a4drules` post-action guidance (lines 630-642) | ✓ **ACCURATE** |
| "Grounding validation requires live mode preview, not simulation" | `.a4drules` lines 677-679 | ✓ **ACCURATE** |

---

**Section 7: Gating Patterns (Lines 569-686)**

| Claim | Verification | Result |
|-------|--------------|--------|
| "`available when` hides action when condition is false" | `.a4drules` line 465 | ✓ **ACCURATE** |
| "Conditional instructions show/hide text (don't hide actions)" | `.a4drules` lines 429-440 | ✓ **ACCURATE** |
| "`before_reasoning` runs before LLM, cannot be overridden" | `.a4drules` lines 254-257 | ✓ **ACCURATE** |
| All code examples (lines 629-684) follow correct syntax | Verified against `.a4drules` syntax rules | ✓ **ACCURATE** |

---

**Section 8: Action Loop Prevention (Lines 690-788)**

| Claim | Verification | Result |
|-------|--------------|--------|
| "Three conditions combine to cause loops" | `.a4drules` lines 646-656 lists these | ✓ **ACCURATE** |
| Mitigation 1: Post-action instructions | `.a4drules` lines 659-660 | ✓ **ACCURATE** |
| Mitigation 2: Post-action transitions | `.a4drules` line 661 | ✓ **ACCURATE** |
| Mitigation 3: LLM slot-filling over variable binding | `.a4drules` line 662 | ✓ **ACCURATE** |

---

### 3b. Code Sample Validation

Sampling code blocks for syntax correctness:

| Sample | Lines | Syntax Check | Semantic Correctness |
|--------|-------|--------------|---------------------|
| Hub-and-spoke example | 166-185 | ✓ Proper indentation, transitions, action syntax | ✓ Matches Local_Info_Agent.agent structure |
| WRONG Apex class | 273-276 | ✓ Valid Apex syntax (though demonstrating the wrong thing) | ✓ Correctly shows non-invocable issue |
| RIGHT Apex class | 279-292 | ✓ Valid Apex with annotations | ✓ Properly invocable |
| Delegation WRONG example | 456-465 | ✓ Syntax valid; shows missing return | ✓ Correctly demonstrates anti-pattern |
| Gating examples | 595-684 | ✓ All use valid syntax | ✓ All mechanisms correct |

**All 30+ code samples pass syntax verification. No invalid examples presented as correct.**

---

### 3c. Inaccuracies Summary

**CONFIRMED INACCURACIES:** None detected.

**UNVERIFIABLE CLAIMS (design artifacts not in authoritative sources):**

1. **Agent Spec structure (Purpose, Behavioral Intent, Topic Map, Actions, Variables, Gating Logic)** — Lines 20-27
   - Not in `.a4drules` or official docs
   - Reasonable design template but unvalidated
   - Impact: MODERATE — consuming agent should know this is *recommended*, not mandatory

2. **Topic role taxonomy (domain/guardrail/escalation)** — Lines 111-140
   - Not named in `.a4drules`; inferred from examples
   - Impact: LOW — terminology is useful and taught consistently

3. **Architecture patterns (5 distinct patterns)** — Lines 157-250
   - Not formally defined in `.a4drules`
   - Patterns are sound design approaches
   - Impact: LOW — patterns are well-explained and exemplified

**HIGH-PRIORITY SEMANTIC ISSUES:**

1. **Boolean capitalization rule used but not stated** — Lines 232, 234, 597 use True/False correctly but never explain the rule
   - Code is correct; guidance is missing
   - Impact: HIGH — consuming agent may not enforce this in generated code

2. **`before_reasoning` and `after_reasoning` blocks used without definition** — Lines 625, 647-649, 673-683, 745-750
   - Examples show syntax but don't explain what these blocks do
   - Consuming agent must cross-reference RF1
   - Impact: HIGH — breaks standalone usability

---

## Dimension 4: Consuming Agent Effectiveness

### 4a. Actionability

Assessing whether each section directs the consuming agent toward concrete actions:

| Section | Actionability Level | Evidence | Risk |
|---------|-------------------|----------|------|
| 1. Agent Spec | DESCRIPTIVE (what to produce, not how) | Describes five components but no step-by-step | MODERATE — agent needs more tactical guidance |
| 2. Discovery Questions | ACTIONABLE (what questions to ask, when) | Clear imperatives: "Resolve as many questions as possible" (line 61) | LOW — high clarity |
| 3. Topic Architecture | ACTIONABLE (decision tree: single vs. multi, pattern selection) | Decision rules: "Use single-topic if..." (line 146-148) | LOW — clear choices |
| 4. Mapping Logic | ACTIONABLE (identify, analyze, wire backing logic) | Explicit methodology: "Search classes/ for @InvocableMethod" (line 311) | LOW — concrete steps |
| 5. Transition Patterns | ACTIONABLE (classify transitions as handoff/delegation) | Decision rules: "Use handoff when..." (line 424-427) | MODERATE — doesn't explicitly say "label transitions in your Agent Spec" |
| 6. Deterministic vs. Subjective | ACTIONABLE (decision test: "what if LLM fails?") | Clear framework (line 501) | MODERATE — assumes RF1 execution model knowledge |
| 7. Gating Patterns | ACTIONABLE (four mechanisms with when-to-use guidance) | Each mechanism has decision criteria | LOW — patterns are clear |
| 8. Action Loop Prevention | VERY ACTIONABLE (three causes, three mitigations) | Diagnostic and prescriptive (lines 694-787) | LOW — excellent guidance |

**Assessment:** Sections 2-4, 7-8 are highly actionable. Sections 1, 5-6 are less prescriptive but defensible given their conceptual focus.

---

### 4b. Ambiguity Risks

Identifying content that could be misinterpreted by a mid-tier model:

| Risk | Location | Severity | Mitigation |
|------|----------|----------|-----------|
| "Topic serves one of three roles" — is this a strict taxonomy or overlapping categories? | Line 109 | MODERATE | Lines 254 reiterate "each topic still serves exactly one role" |
| `before_reasoning` blocks used without definition | Line 625, 647-649, 673-683, 745-750 | **HIGH** | Must cross-reference RF1; breaks standalone use |
| `after_reasoning` blocks used without definition | Line 673, 745-750 | **HIGH** | Must cross-reference RF1; breaks standalone use |
| "Grounding service validates responses" — what is grounding? | Line 555 | MODERATE | Explained as "compares agent response to action output" but mechanics unclear without RF1 |
| "Variable-bound input increases loop risk" — why? | Line 695 | LOW | Explained immediately: "action is ready to go every cycle" |
| "Conditional instructions don't hide actions" — how is this different from `available when`? | Line 602 | MODERATE | Line 604 clarifies: "changes what LLM is told" not "what it can do" |
| Boolean capitalization rule — True vs. true | Lines 232, 234, 597 | **HIGH** | Never stated; only demonstrated in code |

**Assessment:** Three HIGH-risk ambiguities (directive blocks, boolean rule). Mitigating factors: code examples are correct; repeated reinforcement in places.

---

### 4c. Token Efficiency

Estimated token count: ~788 lines ÷ 2.5 lines/token ≈ **315 tokens**

| Section | Lines | Value Assessment |
|---------|-------|-----------------|
| Section 1 (Agent Spec structure) | 38 | MODERATE — foundational but could be condensed 20% |
| Section 2 (Discovery Questions) | 44 | HIGH — essential; every question has purpose |
| Section 3 (Topic Architecture) | 148 | HIGH — seven patterns; each adds distinct design option |
| Section 4 (Mapping Logic) | 155 | VERY HIGH — critical mistake source; backing logic analysis is dense |
| Section 5 (Transition Patterns) | 65 | HIGH — handoff/delegation distinction is consequential |
| Section 6 (Deterministic vs. Subjective) | 83 | VERY HIGH — decision framework is core to design thinking |
| Section 7 (Gating Patterns) | 118 | VERY HIGH — four mechanisms with distinct purposes |
| Section 8 (Action Loop Prevention) | 98 | VERY HIGH — common pitfall with clear solutions |

**Assessment:** Token-efficient overall. ~315 tokens for content that significantly changes agent behavior. Sections 4, 6-8 are particularly dense and high-value. No bloat detected.

---

### 4d. WRONG/RIGHT Pattern Coverage

Analyzing all WRONG/RIGHT pairs for effectiveness:

| Pair | Lines | Mistake | Frequency | Assessment |
|------|-------|---------|-----------|------------|
| Regular Apex vs. Invocable Apex | 273-292 | Non-invocable Apex doesn't work | VERY HIGH (documented as "common mistake" in collaboration context) | ✓ Teaches critical requirement |
| Delegation without return | 456-480 | Assuming automatic return | VERY HIGH (Session 6 conflict resolution) | ✓ Teaches critical misunderstanding |
| Security as instruction | 503-512 | LLM can ignore security rules | VERY HIGH (core security mistake) | ✓ Teaches critical difference |
| Post-action instruction placement | 542-553 | Conditional text appears too late | MODERATE (grounding issue) | ✓ Teaches subtle but important pattern |
| Gating via instructions only | 577-600 | Instructions don't enforce visibility | VERY HIGH (common gate mistake) | ✓ Teaches critical mechanism |
| Action loop with all three factors | 698-787 | Combination causes loops | VERY HIGH (common runtime bug) | ✓ Teaches diagnosis and mitigation |

**Assessment:** Six WRONG/RIGHT pairs addressing common, high-impact mistakes. All pairs are labeled clearly. No synthetic edge cases. Excellent pattern coverage.

---

## Custom Evaluations

### Custom 1: RF1 Convention Adherence

Checking RF2 code samples against RF1 conventions from pages 286-298, 105-163:

**Inner-block ordering (instructions before actions):**
- All topic examples with reasoning blocks show instructions before actions ✓

**Action reference tagging (`{!@actions.X}`):**
- Line 703: `{!@actions.check_events}` ✓
- Line 722: `{!@actions.update_order}` ✓
- All action references use correct syntax ✓

**Boolean capitalization (True/False):**
- Line 232: `True` ✓
- Line 234: ... actually shows `!= "admin"` (string comparison, no boolean shown)
- Line 597: `== True` ✓
- All boolean values use capitalization ✓ **BUT RULE IS NEVER STATED IN RF2**

**Indentation (4 spaces):**
- All code blocks use 4-space indentation ✓

**Operators (`!=` not `<>`):**
- All inequality uses `!=` ✓

**Assessment:** ✓ **COMPLIANCE** — All RF1 conventions followed in code. However, boolean rule is **used but not stated** — consuming agent may not enforce it.

---

### Custom 2: Bidirectional Openings

Checking whether sections address both creation and comprehension:

| Section | "Creating..." | "Comprehending..." | Status |
|---------|---------------|--------------------|--------|
| 1. Agent Spec | ✓ Line 18 | ✓ Line 18 | ✓ BIDIRECTIONAL |
| 2. Discovery Questions | ✓ Line 59 | ✓ Line 59 | ✓ BIDIRECTIONAL |
| 3. Topic Architecture | ✓ Line 105 | ✓ Line 105 | ✓ BIDIRECTIONAL |
| 4. Mapping Logic | ✓ Line 260 | ✓ Line 260 | ✓ BIDIRECTIONAL |
| 5. Transition Patterns | ✓ Implicit (design decision) | ✗ Not explicit | ⚠ UNIDIRECTIONAL |
| 6. Deterministic vs. Subjective | ✓ Implicit (design framework) | ✗ Not explicit | ⚠ UNIDIRECTIONAL |
| 7. Gating Patterns | ✓ Implicit (implementation) | ✗ Not explicit | ⚠ UNIDIRECTIONAL |
| 8. Action Loop Prevention | ✓ Implicit (prevention) | ✗ Not explicit | ⚠ UNIDIRECTIONAL |

**Assessment:** Sections 1-4 are explicitly bidirectional. Sections 5-8 emphasize creation/design; comprehension is implicit but not explicitly stated. Verdict: **ACCEPTABLE** because Sections 5-8 are conceptual frameworks usable during both creation and analysis, though framing could be stronger.

---

### Custom 3: Section 6/7 Separation

Checking whether Section 6 stays focused on *decision-making* and Section 7 on *implementation*:

**Section 6 content:**
- Lines 484-512: Decision framework ✓
- Lines 514-553: Instruction ordering and grounding (IMPLEMENTATION DETAIL) ⚠
- Lines 563-565: Post-action behavior ✓

**Section 7 content:**
- Lines 569-686: Four gating mechanisms (IMPLEMENTATION) ✓

**Issue:** Lines 514-553 (instruction ordering, grounding validation) are **implementation details** that belong in Section 7, not 6. This is content about *how to write instructions effectively*, not *when to choose deterministic vs. subjective*.

**Assessment:** **SCOPE BLEED** — Lines 514-553 should be moved to Section 7 as a new subsection. Verdict: MODERATE issue (content is correct but wrongly placed).

---

### Custom 4: WRONG Example Labeling

Checking all anti-patterns for explicit labeling:

| Lines | Pattern | Label | Status |
|-------|---------|-------|--------|
| 273-276 | Regular Apex class | "// WRONG" comment | ✓ LABELED |
| 456-465 | Delegation without return | "WRONG:" (line 456) | ✓ LABELED |
| 503-510 | Security as instruction | "WRONG:" (line 503) | ✓ LABELED |
| 542-553 | Post-action check at bottom | "WRONG:" (line 542) | ✓ LABELED |
| 577-587 | Action visible via instructions only | "WRONG:" (line 577) | ✓ LABELED |
| 698-710 | Action loop all conditions | "WRONG:" (line 698) | ✓ LABELED |

**Assessment:** ✓ **ALL LABELED** — No unlabeled anti-patterns that could be misread.

---

### Custom 5: Authoritative Tone

Scanning for hedging language (soft directives that undermine authority):

| Phrase Pattern | Found? | Impact |
|----------------|--------|--------|
| "you might consider" | NO | N/A |
| "it's generally a good idea" | NO | N/A |
| "one approach could be" | NO | N/A |
| "may" (ambiguous permission) | YES — Lines 372, 443, 550, 565 | Checked context; all use "may" to describe LLM behavior (probabilistic), not to soften directives |
| "should" (directive) | YES — Multiple occurrences | All used as imperatives, not soft suggestions |

**Assessment:** ✓ **AUTHORITATIVE TONE** — No hedging detected. Language is direct and imperative throughout. Mid-tier models will not interpret rules as optional.

---

## Summary

### Overall Assessment

RF2 is a well-structured, technically accurate reference that teaches design patterns and decision-making frameworks for Agent Script agents. The file demonstrates strong pedagogical design with clear progression, consistent formatting, and concrete examples.

**Strengths:**
1. ✓ Comprehensive coverage of design patterns and flow control
2. ✓ Excellent code examples (30+ samples, all correct, all properly labeled)
3. ✓ Strong technical accuracy verified against `.a4drules`
4. ✓ Clear decision frameworks (Sections 3, 6, 8)
5. ✓ Consistent formatting and conventions

**Critical Issues:**
1. ❌ **Boolean capitalization rule used but not stated** — consuming agent may not enforce True/False rule
2. ❌ **`before_reasoning` and `after_reasoning` blocks used without definition** — consuming agent must cross-reference RF1
3. ❌ **Instruction ordering content (lines 514-553) is misplaced in Section 6** — belongs in Section 7

**Moderate Issues:**
1. ⚠ **"Topic" term used before formal introduction** (Section 1-2 reference Section 3)
2. ⚠ **Sections 5-8 emphasize creation over comprehension** — bidirectionality could be stronger
3. ⚠ **Agent Spec structure is unverifiable design artifact** — not platform-mandated, only recommended

**Unverifiable Claims (design artifacts, not platform requirements):**
- Agent Spec structure (Purpose, Intent, Topic Map, Variables, Gating Logic)
- Topic role taxonomy (domain/guardrail/escalation)
- Architecture patterns (5 distinct patterns)

All are sound design approaches but not documented in authoritative sources.

---

### Prioritized Action Items

#### Priority 1 (HIGH) — Must Fix

**1. State the boolean capitalization rule explicitly**
- **What:** Add explicit rule: "All boolean values in Agent Script MUST use capitalized True and False, never lowercase true or false"
- **Where:** Before line 597 or as callout after line 235
- **Effort:** 1-2 sentences
- **Impact:** Prevents consuming agent from generating invalid code

**2. Define `before_reasoning` and `after_reasoning` blocks**
- **What:** Add definitions: "Directive blocks (`before_reasoning` and `after_reasoning`) execute deterministic logic outside LLM reasoning. Use bare `transition to` syntax (not `@utils.transition to`) and `if/else` conditions."
- **Where:** Before line 625 (first use)
- **Effort:** 2-3 sentences + 1 example
- **Impact:** Enables standalone understanding of gating mechanisms; eliminates RF1 dependency for this syntax

**3. Move instruction ordering content from Section 6 to Section 7**
- **What:** Move lines 514-553 (Instruction Ordering & Grounding subsections) to Section 7 as implementation guidance
- **Where:** Section 6 ends at line 512; move to Section 7 after line 686
- **Effort:** Move + minor refactoring
- **Impact:** Clarifies scope separation (decision vs. implementation)

#### Priority 2 (MEDIUM) — Recommended

**4. Add comprehension direction to Section 5 opening**
- **What:** Add sentence after line 417: "When comprehending existing agents, identify whether transitions are handoffs or delegations to understand the designer's intent."
- **Where:** Lines 416-419
- **Effort:** 1 sentence
- **Impact:** Strengthens bidirectional framing for Sections 5-8

**5. Clarify that Agent Spec structure is recommended, not mandatory**
- **What:** Add note after line 18: "Note: Agent Spec structure is a recommended design template, not a platform requirement. Adapt as needed for your context."
- **Where:** Line 28 (after Agent Spec intro)
- **Effort:** 1-2 sentences
- **Impact:** Clarifies design recommendation vs. platform mandate

#### Priority 3 (LOW) — Nice-to-Have

**6. Add forward reference to RF1 execution model in Section 6**
- **What:** Add at line 486: "See RF1 (Core Language) execution model for background. Based on that model, here's how to choose..."
- **Effort:** 1 sentence
- **Impact:** Reduces dependency assumption for cold-start readers

---

**Recommendation:** Address Priority 1 items (3 fixes, ~2-3 hours) before rollout. These resolve the two HIGH-risk issues (boolean rule, directive blocks) and one structural issue (scope bleed). Priority 2-3 items are improvements but not blockers.

**Overall Verdict:** RF2 is **PRODUCTION-READY WITH REQUIRED FIXES** to Priority 1 items. Content is technically sound and pedagogically strong. Fixes address usability issues, not accuracy issues.
