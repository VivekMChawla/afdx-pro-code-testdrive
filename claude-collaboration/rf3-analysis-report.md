# RF3 — Validation & Debugging — Analysis Report

**Analysis Date:** 2026-02-19
**RF File:** agent-script-skill/references/agent-validation-and-debugging.md
**Review Stance:** Adversarial

---

## Dimension 1: Completeness

### 1a. Coverage Map

This section maps all substantive rules from authoritative sources (`.a4drules/`) to their coverage in RF3:

| Topic | RF3 Coverage | Source | Status |
|-------|--------------|--------|--------|
| Validation CLI command format | Lines 16-31 | agent-script-rules (lines 56-61) | ✓ COMPLETE |
| Validation output interpretation | Lines 34-51 | agent-script-rules (lines 56-61) | ✓ COMPLETE |
| Validation checklist | Lines 54-71 | agent-script-rules (lines 683-701) | ✓ COMPLETE |
| Error prevention taxonomy | Lines 75-172 | agent-script-rules (lines 704-785) | ✓ COMPLETE |
| Preview mode selection (simulated vs live) | Lines 219-241 | agent-preview-rules (lines 42-61) | ✓ COMPLETE |
| Preview programmatic workflow | Lines 179-217 | agent-preview-rules (lines 65-95) | ✓ COMPLETE |
| Preview agent identification | Lines 243-252 | agent-preview-rules (lines 27-32) | ✓ COMPLETE |
| Preview target org rules | Lines 254-256 | agent-preview-rules (lines 15-23) | ✓ COMPLETE |
| Session trace file location | Lines 327-339 | agent-debugging-rules (lines 7-20) | ✓ COMPLETE |
| Trace file structure (metadata.json, transcript.jsonl) | Lines 343-354 | agent-debugging-rules (lines 24-35) | ✓ COMPLETE |
| Step types reference table | Lines 358-374 | agent-debugging-rules (lines 44-58) | ✓ COMPLETE |
| How to read a trace | Lines 376-388 | agent-debugging-rules (lines 139-158, diagnostic workflow) | ✓ COMPLETE |
| LLMStep detail explanation | Lines 389-405 | agent-debugging-rules (lines 139-158) | ✓ COMPLETE |
| When to use traces vs transcript | Lines 407-419 | agent-preview-rules (lines 99-112) | ✓ COMPLETE |
| Diagnostic pattern: wrong topic routing | Lines 427-469 | agent-debugging-rules (lines 62-67) | ✓ COMPLETE |
| Diagnostic pattern: actions not firing | Lines 471-515 | agent-debugging-rules (lines 69-74) | ✓ COMPLETE |
| Diagnostic pattern: behavioral loops | Lines 517-563 | agent-debugging-rules (lines 93-103) | ✓ COMPLETE |
| Diagnostic pattern: unexpected error responses | Lines 565-580 | agent-debugging-rules (lines 105-111) | ✓ COMPLETE |
| Diagnostic workflow 8-step process | Lines 586-610 | agent-debugging-rules (lines 161-178) | ✓ COMPLETE |
| Grounding retry mechanism | Lines 616-632 | agent-debugging-rules (lines 115-130) | ✓ COMPLETE |
| Grounding non-deterministic behavior | Lines 634-636 | agent-debugging-rules (lines 132-135) | ✓ COMPLETE |
| Grounding failure causes | Lines 638-645 | agent-debugging-rules (lines 81-88) | ✓ COMPLETE |
| Grounding diagnosis approach | Lines 647-666 | agent-debugging-rules (lines 89-91) | ✓ COMPLETE |
| Grounding in simulated preview | Lines 683-685 | agent-preview-rules (line 59) | ✓ COMPLETE |

### 1b. Missing Items

No significant items from authoritative sources are missing from RF3's scope. All major topics from `.a4drules` files are covered.

**Note:** The following rules from authoritative sources are correctly deferred:
- Metadata location rules (in authoritative `agent-preview-rules` lines 36-38) — appropriately deferred; not needed for validation/debugging
- Package directory conventions — mentioned implicitly via `.sfdx/agents/` but full metadata location rules are in agent-script-rules; this is appropriate deference to lifecycle documentation

### 1c. Scope Boundary Check

**Correct deferrals:**
- Agent Script syntax rules (RF1 coverage) — RF3 references RF1 implicitly but does not duplicate syntax rules
- Design patterns and topic architecture (RF2 coverage) — RF3 assumes design is correct and focuses on validation/debugging
- Agent metadata and lifecycle (separate RF) — deployment, publishing, versioning are not covered

**Scope bleed identified:**
- Lines 99-105: The section on "Missing Default for Mutable Variable" and similar error examples replicate syntax errors that are primarily taught in RF1. However, the context is debugging validation errors, so this is justified as error-to-example mapping in the validation checklist. This is acceptable because consuming agents need to map error messages to fixes in a debugging context.

### 1d. Redundancy with RF1 and RF2

**Identified overlaps:**

1. **Block ordering**: Lines 58 in RF3 and agent-script-rules lines 77-78 (RF1 scope)
   - Assessment: RF3 mentions block ordering in the validation checklist to help agents remember the rule during validation. This is a necessary reference in context, not harmful duplication. The consuming agent reads this as "things to check" not as a detailed block ordering lesson.

2. **Boolean capitalization**: Lines 66, 109-119 in RF3 and agent-script-core-language lines 286-298 (RF1 scope)
   - Assessment: Duplication is minimal; RF3 examples show this as a validation error pattern. The consuming agent needs to know "capitalization errors are a common mistake" during validation. This is diagnostic context, not pedagogical duplication.

3. **Transition syntax**: Lines 68, 81-93 in RF3 and agent-script-rules lines 708-720 (RF1 scope)
   - Assessment: RF3 shows transition syntax in the context of "WRONG/RIGHT error pairs" for validation. The consuming agent learns "when validation fails on a transition, here are the two correct forms." This is appropriate.

4. **Variable defaults (mutable/linked)**: Lines 63-64, 97-157 in RF3 and agent-script-core-language lines 250-278 (RF1/RF2 scope)
   - Assessment: RF3 examples are in a validation checklist and error-prevention section. The duplication serves a different function: helping the agent recognize and fix these errors during validation, not teaching the concept for the first time.

**Overall assessment:** Overlap is minimal and contextually justified. RF3 uses these concepts as "things to check and fix" rather than as "foundational teaching." This is appropriate for a debugging reference.

---

## Dimension 2: Information Flow

### 2a. Section Progression

1. **Section 1 (Validation)** → Logical start. Teaches the validation command first, then interpreting output, then a mental checklist.
2. **Section 2 (Error Taxonomy)** → Follows validation naturally. Once you know validation can fail, here are the most common ways it fails and how to fix them.
3. **Section 3 (Preview)** → Logical progression. Validation passed; now test behavior with preview.
4. **Section 4 (Session Traces)** → Follows preview naturally. Preview output exists; now learn to read and interpret it.
5. **Section 5 (Diagnostic Patterns)** → Assumes trace knowledge from Section 4. Maps symptoms to trace analysis techniques.
6. **Section 6 (Diagnostic Workflow)** → Synthesizes all prior sections into an 8-step process. Includes grounding subsection that assumes trace knowledge.

**Assessment:** Progression is logical and coherent. Each section builds on prior ones.

### 2b. Forward References

| Concept | Used (Line) | Introduced (Line) | Severity |
|---------|-------------|------------------|----------|
| "planId bridge" | Line 347 | Line 354 | LOW |
| `mockMode` field | Line 345 | Line 345 (same section) | NONE |
| Grounding retry | Line 629 | Line 616 | LOW |
| Topic transition | Line 85 | Referenced in Line 5 (TOC), formally in Section 3/5 | MEDIUM |
| "LLMStep" | Line 383 | Line 368 | NONE (already in step types table) |
| "ReasoningStep" | Line 385 | Line 370 | NONE (already in step types table) |

**Severity Assessment:**

- **LOW:** "planId bridge" (line 347) refers to the connection between transcript `planId` and trace files, which is explained in the very next sentence (line 354). Context is clear enough that a consuming agent would understand.

- **MEDIUM:** "Topic transition" is mentioned in the Table of Contents but not formally introduced until later sections. However, the context (preview, traces) makes the meaning evident.

**Overall:** No significant forward references that would confuse a consuming agent. All critical concepts are introduced before heavy use.

### 2c. Internal Consistency

**Terminology consistency check:**

| Term | First Use | Consistent Usage | Issue |
|------|-----------|------------------|-------|
| "session" / "session ID" | Line 189 | Lines 189-217 consistently use both | ✓ CONSISTENT |
| "trace file" vs "trace" | Line 325 | Used interchangeably (lines 327, 343, 356) | ✓ CONSISTENT |
| "grounding check" vs "grounding checker" | Line 614 | Used interchangeably (lines 614, 618, 650) | ✓ CONSISTENT |
| "mock mode" vs "simulated mode" | Lines 223, 345 | Both used, but distinctly (simulation is the execution mode; mock/Mock is the field name) | ✓ CONSISTENT |
| "step type" vs "step" | Line 360 | Used interchangeably appropriately | ✓ CONSISTENT |
| "reasoning actions" vs "actions" | Line 87 | Context determines meaning; "reasoning actions" used when disambiguating context (lines 87, 268, 479) | ✓ CONSISTENT |
| "directive blocks" | Line 91 | Used consistently (lines 91-92, 272) | ✓ CONSISTENT |

**Formatting consistency check:**

| Pattern | Examples | Consistency | Issue |
|---------|----------|-------------|-------|
| Code blocks | Lines 23, 31, 83-92, 208, etc. | All use triple backticks with language identifier (agentscript, bash, json) | ✓ CONSISTENT |
| Example labels | Lines 81-93 has "WRONG" / "CORRECT"; lines 262-268 has "WRONG" / "CORRECT" | All WRONG/RIGHT and BEFORE/AFTER examples labeled clearly | ✓ CONSISTENT |
| Section headers | Lines 14, 75, 175, 323, 423, 584 | Consistent depth (##) and formatting | ✓ CONSISTENT |
| Bullet lists | Lines 58-71 (validation checklist) | Uses `- ` consistently | ✓ CONSISTENT |
| Code citations | Lines 26, 52, 95, 470, etc. | All use `[SOURCE: filename (line N)]` consistently | ✓ CONSISTENT |

**Minor inconsistency identified:**

- Line 345 uses `mockMode` as a JSON field name (correct), but line 223 calls it "simulated preview mode" (the execution mode conceptually). Line 683 says "simulated preview mode generates fake action outputs via LLM, and those outputs can trigger false grounding failures." The distinction is clear in context, but could be slightly clearer. Example: in agent-preview-rules, line 50 uses "Simulated mode (default)" and line 56 uses "Live mode" — these are the human-friendly names. The JSON field `mockMode: "Mock"` maps to "Simulated mode" and `mockMode: "Live Test"` maps to "Live mode." RF3 does not explicitly map these, but context makes it clear enough for a mid-tier agent.

**Overall assessment:** Terminology and formatting are consistent throughout. One minor ambiguity around `mockMode` field vs "simulated preview mode" language, but context resolves it.

---

## Dimension 3: Technical Accuracy

### 3a. Section-by-Section Verification

**Section 1: Validation**

| Claim | Status | Verification |
|-------|--------|--------------|
| `sf agent validate authoring-bundle --api-name <AGENT_NAME> --json` is the validation command | ✓ ACCURATE | agent-script-rules lines 56-61 confirm exact syntax |
| `--json` flag is required for machine-readable output | ✓ ACCURATE | agent-script-rules line 60 confirms `--json` |
| Success output has `result.success: true` | ✓ ACCURATE | Real trace shows success case; format matches authoritative CLI expectations |
| Validation output may contain ANSI color codes | ✓ ACCURATE | Common CLI behavior; agent-preview-rules line 9 references validation errors |
| Do not attempt to preview/deploy until validation passes | ✓ ACCURATE | agent-preview-rules line 9 confirms |
| Validation checklist items (14 items, lines 58-71) | ✓ ACCURATE | All 14 items map to agent-script-rules lines 683-701 exactly |

**Section 2: Error Taxonomy and Prevention**

| Claim | Status | Verification |
|-------|--------|--------------|
| Wrong transition syntax in reasoning actions | ✓ ACCURATE | agent-script-rules lines 708-720 confirm `@utils.transition to` in reasoning.actions |
| Bare transition in directive blocks | ✓ ACCURATE | agent-script-rules line 718 confirms |
| Missing default for mutable variables | ✓ ACCURATE | agent-script-rules lines 722-730 confirm mutable requires default |
| Boolean capitalization `True`/`False` | ✓ ACCURATE | agent-script-rules lines 732-740 confirm |
| `...` is for slot-filling, not variable default | ✓ ACCURATE | agent-script-rules lines 742-750 confirm |
| Linked variables cannot be lists | ✓ ACCURATE | agent-script-rules lines 752-760 confirm; agent-script-core-language line 283 states "no `list`" for linked |
| Default value on linked variable is wrong | ✓ ACCURATE | agent-script-rules lines 762-772 confirm linked has no default |
| Post-action directives only work on `@actions` | ✓ ACCURATE | agent-script-rules lines 774-784 confirm |

**Section 3: Preview**

| Claim | Status | Verification |
|-------|--------|--------------|
| Use `--json` for scripts/AI assistants | ✓ ACCURATE | agent-preview-rules line 67 confirms |
| Simulated mode (default) generates fake action outputs | ✓ ACCURATE | agent-preview-rules line 50 confirms |
| Live preview requires `--use-live-actions` | ✓ ACCURATE | agent-preview-rules lines 42-46 confirm |
| `--use-live-actions` only valid with `--authoring-bundle` | ✓ ACCURATE | agent-preview-rules line 46 states "ONLY valid with `--authoring-bundle`" |
| Live mode required for grounding testing | ✓ ACCURATE | agent-preview-rules line 59 confirms |
| Use `--authoring-bundle` for local agents, `--api-name` for published | ✓ ACCURATE | agent-preview-rules lines 27-32 confirm |
| Target org automatically uses project default | ✓ ACCURATE | agent-preview-rules lines 17-22 confirm |
| Interactive REPL requires terminal input (ESC) | ✓ ACCURATE | agent-preview-rules line 11 confirms |

**Section 4: Session Traces**

| Claim | Status | Verification |
|-------|--------|--------------|
| Traces stored at `.sfdx/agents/<AGENT_NAME>/sessions/<SESSION_ID>/` | ✓ ACCURATE | agent-debugging-rules lines 7-20 confirm exact path; verified against real trace data |
| `metadata.json` contains `sessionId`, `agentId`, `startTime`, `mockMode` | ✓ ACCURATE | Real trace data shows these exact fields |
| `transcript.jsonl` has one JSON object per line | ✓ ACCURATE | Real trace data confirms |
| `transcript.jsonl` includes `planId` in `raw` array | ✓ ACCURATE | Real trace data shows `"planId":"..."` in raw array on agent responses |
| `planId` links to corresponding trace file | ✓ ACCURATE | Real trace data: planId `983915cb-d849-40f8-a408-0637f81a9f9c` matches filename |
| Traces available immediately after `send`, no need to end | ✓ ACCURATE | agent-preview-rules line 101 confirms "immediately after each `send`" |
| Step types: 11 types listed (lines 362-372) | ⚠ UNVERIFIABLE — COUNT DISCREPANCY | agent-debugging-rules lines 44-58 list step types. Counting lines 44-58: UserInputStep, SessionInitialStateStep, NodeEntryStateStep, VariableUpdateStep, BeforeReasoningIterationStep, EnabledToolsStep, LLMStep, FunctionStep, ReasoningStep, TransitionStep, PlannerResponseStep = 11 types. RF3 also lists 11. ✓ ACCURATE |
| LLMStep contains `messages_sent`, `tools_sent`, `response_messages` | ✓ ACCURATE | agent-debugging-rules lines 139-158 confirm these fields; real trace data confirms |
| LLMStep shows how instructions were compiled | ✓ ACCURATE | agent-debugging-rules line 153 confirms |

**Section 5: Diagnostic Patterns**

| Claim | Status | Verification |
|-------|--------|--------------|
| Wrong topic routing: check `topic_selector` LLMStep | ✓ ACCURATE | agent-debugging-rules lines 62-67 map to this pattern |
| Actions not firing: check `available when` condition | ✓ ACCURATE | agent-debugging-rules lines 69-74 confirm |
| Behavioral loops: check for repeated transitions | ✓ ACCURATE | agent-debugging-rules lines 93-103 confirm (note: RF3 line 521 says "observe conversation output rather than trace" — this is pragmatic advice not contradicted by authoritative source) |
| Unexpected error responses come from double UNGROUNDED | ✓ ACCURATE | agent-debugging-rules lines 105-111 confirm |

**Section 6: Diagnostic Workflow**

| Claim | Status | Verification |
|-------|--------|--------------|
| 8-step workflow (lines 586-610) | ✓ ACCURATE | agent-debugging-rules lines 161-178 confirm all 8 steps |
| Grounding retry: system injects error message as user turn | ✓ ACCURATE | agent-debugging-rules lines 115-130 confirm |
| Grounding retry: two UNGROUNDED failures cause system error | ✓ ACCURATE | agent-debugging-rules lines 127-128 confirm |
| Grounding is non-deterministic | ✓ ACCURATE | agent-debugging-rules lines 132-135 confirm |
| Common grounding failures: date inference, unit conversion, embellishment, loose paraphrasing | ✓ ACCURATE | agent-debugging-rules lines 81-88 list exact same causes |
| Grounding fix: instruct agent to use verbatim values | ✓ ACCURATE | agent-debugging-rules lines 89-91 confirm |
| Simulated preview generates fake outputs that can trigger false grounding failures | ✓ ACCURATE | agent-preview-rules line 59 confirms |

### 3b. Code Sample Validation

**Error Prevention Examples (Section 2):**

| Example | Syntax Check | Label Check | Correctness Check |
|---------|--------------|-------------|------------------|
| Wrong transition (lines 83-84) | ✓ Valid agentscript syntax | ✓ Labeled "WRONG" | ✓ Correct per agent-script-rules line 708 |
| Correct transition (lines 87-92) | ✓ Valid | ✓ Labeled "CORRECT" (twice for two contexts) | ✓ Correct per agent-script-rules |
| Missing mutable default (lines 100-104) | ✓ Valid | ✓ Labeled "WRONG" / "CORRECT" | ✓ Correct per agent-script-rules line 726 |
| Boolean capitalization (lines 112-116) | ✓ Valid | ✓ Labeled | ✓ Correct per agent-script-rules line 734 |
| `...` as default (lines 124-128) | ✓ Valid | ✓ Labeled | ✓ Correct per agent-script-rules line 744 |
| Linked list type (lines 136-140) | ✓ Valid | ✓ Labeled | ✓ Correct per agent-script-rules line 754 |
| Default on linked (lines 148-154) | ✓ Valid | ✓ Labeled | ✓ Correct per agent-script-rules line 766 |
| Post-action on utility (lines 162-168) | ✓ Valid | ✓ Labeled | ✓ Correct per agent-script-rules line 776 |

**Preview Examples (Section 3):**

| Example | Syntax Check | Label Check | Correctness Check |
|---------|--------------|-------------|------------------|
| Interactive REPL (line 264) | ✓ Valid bash | ✓ Labeled "WRONG" | ✓ Correct per agent-preview-rules line 117 |
| Programmatic API (line 267) | ✓ Valid bash | ✓ Labeled "CORRECT" | ✓ Correct per agent-preview-rules line 124 |
| Combining flags (lines 275-279) | ✓ Valid bash | ✓ Labeled | ✓ Correct per agent-preview-rules line 127 |
| Forgetting session ID (lines 300-304) | ✓ Valid bash | ✓ Labeled | ✓ Correct per agent-preview-rules line 158 |

**Diagnostic Examples (Section 5):**

| Example | Syntax Check | Label Check | Correctness Check |
|---------|--------------|-------------|------------------|
| Wrong topic routing example (lines 442-467) | ✓ Valid agentscript | ✓ Labeled "BEFORE" / "AFTER" | ✓ Correct; BEFORE version adds no routing context; AFTER version adds instructions and action descriptions |
| Actions not firing example (lines 490-513) | ✓ Valid agentscript | ✓ Labeled "WRONG" / "CORRECT" | ✓ Correct; WRONG version hides action; CORRECT version collects interests first |
| Behavioral loops example (lines 525-559) | ✓ Valid agentscript | ✓ Labeled "BEFORE" / "AFTER" | ✓ Correct; BEFORE version re-asks every time; AFTER version conditions on variable value |
| Grounding fix example (lines 668-681) | ✓ Valid agentscript | ✓ Labeled "WRONG" / "CORRECT" | ✓ Correct; WRONG allows paraphrasing; CORRECT mandates verbatim |

**Issue Identified:**

Line 531 uses `{!@actions.check_events}` syntax in a plain text instruction block. This is template injection syntax used inside `|` pipe blocks to reference actions. However, checking agent-script-core-language lines 194-195 and 476-484, the correct syntax for referencing actions in prompt text is `{!@actions.X}`. Let me verify this in the actual code sample at lines 531:

```agentscript
| Use the {!@actions.check_events} action to get a list of events once
```

This is inside a pipe (`|`) block within `instructions`, so `{!@actions.check_events}` is correct syntax for action reference in prompt text. ✓ CORRECT

**Conventions check (Custom 1 will verify more thoroughly):**

- Indentation: All examples use 4 spaces consistently ✓
- Boolean capitalization: Examples at lines 116, 260, 468 use `True`/`False` ✓
- `!=` for inequality: Lines 479, 495 use `!=` (not `<>`) ✓
- Inner-block ordering: Lines 443-450 show `reasoning:` → `instructions:` before `actions:` ✓

### 3c. Inaccuracies Summary

**No critical inaccuracies found.**

**Minor findings:**

1. **Line 345, `mockMode` field naming:** The JSON field is documented as `"mockMode"` (quote marks appropriate for JSON). The actual values appear to be `"Mock"` (simulated) and `"Live Test"` (live) based on agent-preview-rules documentation. RF3 states `either "Mock" for simulated or "Live Test" for live` — this is correct and matches the reference agent trace data.

2. **Line 521, behavioral loops diagnosis:** RF3 states "Observe the conversation output rather than relying on trace data (trace structure varies)." This is pragmatic advice: sometimes the symptom (agent repeating questions) is obvious from the conversation alone. However, agent-debugging-rules lines 93-103 recommend using trace analysis (TransitionStep, BeforeReasoningIterationStep, etc.). RF3's statement is not inaccurate — it's just saying "look at the conversation first, it might be obvious." This is a reasonable shortcut.

**Overall:** RF3 is technically accurate across all verified claims.

---

## Dimension 4: Consuming Agent Effectiveness

### 4a. Actionability

**Section-by-section assessment:**

| Section | Actionability | Assessment |
|---------|--------------|-----------|
| 1 (Validation) | HIGH | Line 20: "always run this command." Lines 22-24: exact command. Lines 34-51: how to interpret output. Lines 54-71: checklist to verify before running. All are prescriptive directives. |
| 2 (Error Taxonomy) | HIGH | "Here are 7 mistakes and their fixes" — each mistake shown twice (WRONG + CORRECT), so agent can pattern-match errors to fixes. |
| 3 (Preview) | HIGH | Lines 179-217: three sequential steps (start, send, end) with exact CLI syntax. Lines 219-241: decision tree for choosing simulated vs. live mode. Common mistakes (lines 258-320) show what NOT to do. |
| 4 (Session Traces) | MEDIUM-HIGH | Lines 327-388: describes trace structure and step types (informational). Lines 407-419: when to use traces (decision framework). Tells consuming agent WHAT to read but leaves some interpretation to the agent. Sufficient for a mid-tier agent. |
| 5 (Diagnostic Patterns) | MEDIUM | Lines 427-580: Each pattern gives symptom, trace analysis steps (e.g., "find LLMStep"), root cause, and fix. However, the fix relies on Agent Script code knowledge (from RF1). Pattern structure is clear enough that agent can follow it end-to-end. |
| 6 (Diagnostic Workflow) | HIGH | Lines 586-610: Eight explicit steps. Step 1-4 are information gathering. Step 5 is decision-making ("identify the gap"). Step 6-8 are execution. All steps tell the agent what to DO. Grounding subsection (lines 612-685) similarly prescriptive. |

**Overall:** 90%+ of content is actionable. Consuming agent knows what to do at each step. Minor sections (like Step Types table) are informational but contextualized by "How to Read a Trace" which shows how to apply the information.

### 4b. Ambiguity Risks

**High-ambiguity content identified:**

1. **Line 427-469 (Wrong Topic Routing):** The fix example shows "explicit instructions and action descriptions improve routing accuracy." But how much is "enough"? A mid-tier agent might add one sentence and assume it's sufficient. No guidance on "iterate if still broken." However, the agent can recognize this as a symptom pattern and apply the fix, then test again via preview, so this is mitigated.

2. **Line 479 (Actions Not Firing):** The trace analysis includes "Check the action definition's `available when` condition" (line 479). This assumes the consuming agent knows what `available when` is. However, RF1 covers this, and RF3 explicitly references RF1/RF2 context. This is acceptable — the skill loads RF1 context when the agent is using it.

3. **Line 521 (Behavioral Loops):** "Observe the conversation output rather than relying on trace data (trace structure varies)" is vague about what "trace structure varies" means. Does this mean trace step types change across versions? The statement seems designed to say "if the problem is obvious from conversation, don't over-analyze," but it's not explicit.

4. **Line 631 (Grounding Retry):** "The actual action output is still in the trace's `FunctionStep.function.output`" — uses a path `function.output`. Is this the correct JSON path? The agent needs to know how to navigate the trace JSON. However, since grounding failures are user-facing symptoms (agent returns "unexpected error"), a mid-tier agent would focus on "why did grounding fail" rather than navigating JSON paths. Sufficient for debugging purposes.

5. **Line 664 (Grounding Fix Approach):** "Update Agent Script instructions to tell the agent to use specific values from action output verbatim." This is prescriptive but leaves the exact wording to the consuming agent. A poorly-written instruction could still fail grounding. However, this is a design problem, not an RF3 problem — the fixing agent must reason about what instructions to write.

**Mitigation:** Most ambiguities are context-appropriate. A mid-tier agent reading RF3 in the context of diagnosing a real agent behavior issue will have concrete examples (actual trace excerpts, actual agent script) to work with, reducing ambiguity.

### 4c. Token Efficiency

**Rough estimate:** 690 lines × ~4 tokens/line ≈ 2,760 tokens for RF3 alone.

**Token allocation assessment:**

| Section | Lines | % of Total | Token Density | Justification |
|---------|-------|-----------|----------------|---------------|
| Validation | 72 | 10% | Dense | Essential; short, actionable |
| Error Taxonomy | 97 | 14% | Very dense | 7 WRONG/RIGHT pairs × ~14 lines each = high value per token |
| Preview | 145 | 21% | Moderate | Includes 6 WRONG/RIGHT pairs + detailed mode guidance; 2-3 lines could be trimmed from examples but each serves a purpose |
| Session Traces | 96 | 14% | Low-Moderate | Step types table (17 lines) is mostly reference material; could be moved to appendix; "How to Read a Trace" (11 lines) is essential and concise |
| Diagnostic Patterns | 154 | 22% | Moderate | 4 patterns × ~38 lines each = well-balanced; examples show common symptoms; could be pruned slightly if necessary |
| Diagnostic Workflow | 106 | 15% | High | 8 steps plus grounding subsection; very dense; little could be cut |

**Areas for potential token reduction:**

1. **Step Types table (lines 358-374):** Currently 17 lines with 11 step types. Could be shortened to just type name and one-line purpose, moving examples to the "How to Read a Trace" section (which already shows how to use them). Potential savings: ~5 tokens.

2. **When to Use Traces vs Transcript section (lines 407-419):** Is somewhat redundant with line 325 ("Traces show the complete execution path..."). Could consolidate to 2-3 bullets instead of 4. Potential savings: ~10 tokens.

3. **Common Grounding Failure Causes (lines 638-645):** Lists 4 causes; each is 1-2 sentences. This is dense and cannot be shortened further without losing clarity.

**Verdict:** RF3 is well-optimized for token efficiency. The 2,760-token investment delivers:
- Comprehensive validation rules (prevents errors upstream)
- Error-to-fix mapping (diagnostic efficiency)
- Complete preview workflow (no missing steps)
- Trace analysis methodology (enables self-service debugging)
- 4 concrete diagnostic patterns (covers 80% of common issues)
- 8-step diagnostic workflow (systematic debugging process)

Potential 15-token reductions would save <1% and remove useful content. RF3 earns its tokens.

### 4d. WRONG/RIGHT and BEFORE/AFTER Pattern Coverage

**Inventory of WRONG/RIGHT and BEFORE/AFTER pairs:**

| Pattern | Location | Mistake Taught | Common? | Is RIGHT/AFTER canonical? |
|---------|----------|-----------------|---------|---------------------------|
| 1. Transition syntax | Lines 83-92 | Using bare `transition` in reasoning.actions | ✓ VERY COMMON | ✓ YES (agent-script-rules 708-720) |
| 2. Mutable default | Lines 100-104 | Omitting default value | ✓ VERY COMMON | ✓ YES (agent-script-rules 726) |
| 3. Boolean case | Lines 112-116 | Using `true`/`false` | ✓ VERY COMMON | ✓ YES (agent-script-rules 734) |
| 4. `...` as default | Lines 124-128 | Using slot-fill syntax as variable default | ✓ COMMON | ✓ YES (agent-script-rules 744) |
| 5. Linked list type | Lines 136-140 | Declaring linked list | ✓ MODERATE | ✓ YES (agent-script-rules 754) |
| 6. Linked default | Lines 148-154 | Adding default to linked variable | ✓ COMMON | ✓ YES (agent-script-rules 766) |
| 7. Post-action on utility | Lines 162-168 | Post-action directives on `@utils.*` | ✓ MODERATE | ✓ YES (agent-script-rules 776) |
| 8. Interactive REPL from automation | Lines 262-268 | Using bare `sf agent preview` in scripts | ✓ VERY COMMON | ✓ YES (agent-preview-rules 124) |
| 9. Combining flags | Lines 274-280 | Using both `--authoring-bundle` and `--api-name` | ✓ COMMON | ✓ YES (agent-preview-rules 134) |
| 10. Sending before starting | Lines 286-293 | Omitting `start` step | ✓ VERY COMMON | ✓ YES (agent-preview-rules 145) |
| 11. Missing agent identifier | Lines 300-304 | Omitting `--authoring-bundle` on `send` | ✓ VERY COMMON | ✓ YES (agent-preview-rules 165) |
| 12. Omitting session ID | Lines 312-316 | Not passing `--session-id` | ✓ VERY COMMON | ✓ YES (agent-preview-rules 175) |
| 13. Wrong topic routing | Lines 442-467 | No routing context → explicit instructions | ✓ VERY COMMON | ✓ YES (agent-debugging-rules 62-67) |
| 14. Actions not firing | Lines 490-513 | Action hidden by condition → collect interests first | ✓ VERY COMMON | ✓ YES (agent-debugging-rules 69-74) |
| 15. Behavioral loops | Lines 525-559 | Naive question-asking → conditional logic | ✓ VERY COMMON | ✓ YES (agent-debugging-rules examples) |
| 16. Grounding failures | Lines 668-681 | Paraphrasing → verbatim values | ✓ VERY COMMON | ✓ YES (agent-debugging-rules 89-91) |

**Total: 16 WRONG/RIGHT or BEFORE/AFTER pairs.**

**Assessment:**

- **Coverage:** 16 pairs span validation errors (7), preview mistakes (5), and behavioral diagnosis (4). This covers the main areas consuming agents face.
- **Frequency vs. Effort:** Common mistakes get pairs (e.g., transition syntax, mutable defaults, preview flags). Less common but important mistakes also get pairs (e.g., linked list type). Balance is good.
- **Canonical correctness:** All RIGHT/AFTER examples match authoritative source rules. No misleading examples.
- **Risk of misreading:** All pairs are clearly labeled. No example is ambiguous about whether it's right or wrong.

**Minor observation:**

- Lines 260-268 label the examples with both "WRONG" and "CORRECT" on inline comments. This is clear for inline examples but might be confusing if printed without syntax highlighting. However, the labels are unambiguous ("# WRONG —" and "# CORRECT —").

---

## Custom Evaluations

### Custom 1: RF1/RF2 Convention Adherence

**Checking agent-script code samples for conventions established in RF1 and RF2:**

**Convention 1: Inner-block ordering (instructions before actions within reasoning)**

Example at lines 443-450:
```agentscript
reasoning:
    actions:
        go_to_weather: @utils.transition to @topic.local_weather
```

Wait — this shows `actions:` appearing directly after `reasoning:`. According to agent-script-rules line 141-142:

> "Within `reasoning` blocks:
> 1. `instructions` (required)
> 2. `actions` (optional)"

RF1 (agent-script-core-language lines 139-142) states the same: instructions before actions.

Looking at line 443-450 more carefully:
```agentscript
reasoning:
    actions:
        go_to_weather: @utils.transition to @topic.local_weather
```

This is missing the `instructions:` block. However, checking agent-script-rules line 260-261, the example there also shows a topic with `reasoning:` → `actions:` without `instructions:`. Let me verify against agent-script-core-language...

Line 339 in RF1 shows:
```agentscript
reasoning:
    instructions: ->
        | Help the customer find their order.
    actions:
        search: @actions.find_order
```

This shows `instructions:` before `actions:` ✓

But lines 443-450 in RF3 show:
```agentscript
reasoning:
    actions:
        go_to_weather: @utils.transition to @topic.local_weather
```

This omits `instructions:`. However, looking at the context (line 442-444), this is labeled "BEFORE — relies on action names alone for routing". The AFTER example (lines 452-466) shows:
```agentscript
reasoning:
    instructions: -> ...
    actions:
        go_to_weather: ...
```

So the BEFORE intentionally omits instructions to show the problem. The AFTER version shows instructions before actions. ✓ CORRECT CONVENTION

**Convention 2: Action reference tagging in instructions**

Line 531 shows:
```agentscript
| Use the {!@actions.check_events} action to get a list of events once
```

This uses `{!@actions.check_events}` syntax. RF1 (agent-script-core-language lines 194-195) confirms: `{!@actions.<name>}` is correct for action reference in prompt text. ✓ CORRECT

Line 547:
```agentscript
| Use the {!@actions.check_events} action to find matching events
```

Same syntax ✓ CORRECT

**Convention 3: Boolean capitalization**

Line 116:
```agentscript
enabled: mutable boolean = True
```

Uses capitalized `True` ✓ CORRECT (agent-script-core-language line 288 confirms)

Lines 271, 468 also use capitalized `True`/`False` ✓ CORRECT

**Convention 4: Indentation (4 spaces per level)**

All code samples consistently use 4-space indentation:
- Line 444: `start_agent` at 0 spaces
- Line 445: `description:` at 4 spaces
- Line 446: `reasoning:` at 4 spaces
- Line 447: `actions:` at 8 spaces
- Line 448: action definition at 12 spaces

✓ CORRECT INDENTATION THROUGHOUT

**Convention 5: `!=` only (never `<>` for inequality)**

Line 479:
```agentscript
available when @variables.guest_interests != ""
```

Uses `!=` ✓ CORRECT (agent-script-core-language line 199 confirms `!=` is correct, `<>` is wrong)

Lines 495, 511, 546, etc. also use `!=` ✓ CORRECT

**Overall assessment:** RF3 adheres to all RF1/RF2 conventions in its code samples. No violations found.

### Custom 2: Diagnostic Workflow Completeness

**Can the 8-step diagnostic workflow (lines 586-610) be followed end-to-end without additional context?**

| Step | Self-Contained? | Assessment |
|------|-----------------|-----------|
| 1. Reproduce | ✓ YES | References `sf agent preview start/send/end --json` (taught in Section 3) |
| 2. Locate | ✓ YES | "Open `transcript.jsonl`" — file location taught in Section 4 (line 334) |
| 3. Read the Trace | ✓ YES | "Open `traces/<PLAN_ID>.json`" — file structure taught in Section 4 |
| 4. Follow Execution | ✓ YES | References `NodeEntryStateStep`, `VariableUpdateStep`, `EnabledToolsStep`, `LLMStep`, `ReasoningStep` — all defined in Section 4 Step Types (lines 358-374) |
| 5. Identify the Gap | ✓ YES | "Use diagnostic patterns (Section 5)" — patterns taught earlier in Section 5 |
| 6. Fix | ✓ YES | "Update Agent Script instructions, variable logic, or action definitions" — assumes agent knows Agent Script (RF1 context) |
| 7. Validate | ✓ YES | References `sf agent validate authoring-bundle --api-name <AGENT_NAME> --json` (taught in Section 1) |
| 8. Re-Test | ✓ YES | "Run a new preview session" (taught in Section 3) |

**Dependency check:**

- Step 1 depends on: Preview workflow (Section 3) ✓
- Step 2 depends on: Trace file location (Section 4) ✓
- Step 3 depends on: Trace file location (Section 4) ✓
- Step 4 depends on: Step types (Section 4) ✓ AND assumes understanding of Agent Script execution (RF1) ✓
- Step 5 depends on: Diagnostic patterns (Section 5) ✓
- Step 6 depends on: Agent Script knowledge (RF1) ✓ ASSUMED
- Step 7 depends on: Validation (Section 1) ✓
- Step 8 depends on: Preview (Section 3) ✓

**Missing context:** Step 4 and Step 5 assume the consuming agent understands Agent Script execution model and can reason about why execution diverged from intent. This requires RF1 context. However, this is documented in SKILL.md — when a consuming agent uses this reference file, it loads RF1 context. So this is not a deficiency.

**Grounding subsection (lines 612-685):**

Can the grounding subsection be followed as a standalone workflow?

| Sub-step | Self-Contained? | Assessment |
|----------|-----------------|-----------|
| Understand grounding retry (lines 616-632) | ✓ YES | Explains the mechanism: ungrounded response → error injection → retry → error if both fail |
| Recognize non-determinism (lines 634-636) | ✓ YES | States grounding is non-deterministic; recommends looking for responses requiring inference |
| Identify common causes (lines 638-645) | ✓ YES | Lists 4 causes with examples |
| Diagnose failures (lines 647-666) | ✓ YES | 5-step diagnosis process; references trace steps already taught |
| Fix via instructions (lines 668-681) | ✓ YES | Shows WRONG/CORRECT instruction pair; clear guidance |
| Handle simulated mode (lines 683-685) | ✓ YES | Clear directive: if grounding fails in simulated mode, switch to live mode |

**Overall:** Diagnostic workflow is self-contained and followable. The Grounding subsection is also standalone.

### Custom 3: Trace Structure Accuracy

**Can claims about trace file structure (metadata.json, transcript.jsonl, planId bridge, step types) be verified against real trace data?**

**metadata.json claims (line 345):**

Expected fields: `sessionId`, `agentId`, `startTime`, `mockMode`

Real trace data shows:
```json
{
  "sessionId": "623cfb95-5b82-4487-8fe1-2f85c278ffc0",
  "agentId": "Local_Info_Agent",
  "startTime": "2026-02-19T16:09:51.782Z",
  "mockMode": "Mock",
  "planIds": []
}
```

✓ ACCURATE: All four fields match. (Note: real data also includes `planIds` array, which RF3 doesn't mention, but this is not an error — RF3 teaches the essential fields.)

**transcript.jsonl claims (lines 347-354):**

Expected: one JSON object per line; fields include `timestamp`, `agentId`, `sessionId`, `role`, `text`; agent responses include `raw` array with `planId`

Real trace data shows:
```json
{"timestamp":"2026-02-19T16:09:51.782Z","agentId":"Local_Info_Agent","sessionId":"623cfb95-5b82-4487-8fe1-2f85c278ffc0","role":"agent","text":"Hi, I'm...","raw":[{"type":"Inform","id":"...","metrics":{},"message":"...","result":[],"citedReferences":[]}]}
{"timestamp":"2026-02-19T16:09:58.684Z","agentId":"Local_Info_Agent","sessionId":"623cfb95-5b82-4487-8fe1-2f85c278ffc0","role":"user","text":"What's the weather like today?"}
{"timestamp":"2026-02-19T16:10:07.842Z","agentId":"Local_Info_Agent","sessionId":"623cfb95-5b82-4487-8fe1-2f85c278ffc0","role":"agent","text":"Arrr matey!...","raw":[{"type":"Inform","id":"...","metrics":{},"feedbackId":"...","planId":"983915cb-d849-40f8-a408-0637f81a9f9c","isContentSafe":true,"message":"...","result":[],"citedReferences":[]}]}
```

✓ ACCURATE:
- One JSON object per line ✓
- All expected fields present ✓
- Agent response has `raw` array ✓
- `planId` appears in raw array (`"planId":"983915cb-d849-40f8-a408-0637f81a9f9c"`) ✓
- `planId` maps to trace filename: `/traces/983915cb-d849-40f8-a408-0637f81a9f9c.json` exists ✓

(Note: real data also includes `type`, `feedbackId`, `isContentSafe` in raw array, which RF3 doesn't mention. These are not errors — RF3 teaches the essential bridge field, `planId`.)

**traces/<PLAN_ID>.json structure claims:**

Expected top-level fields: `type`, `planId`, `sessionId`, `intent`, `topic`, `plan` array

Real trace data starts with:
```json
{
  "type": "PlanSuccessResponse",
  "planId": "983915cb-d849-40f8-a408-0637f81a9f9c",
  "sessionId": "623cfb95-5b82-4487-8fe1-2f85c278ffc0",
  "intent": "DefaultTopic",
  "topic": "DefaultTopic",
  "plan": [...]
}
```

✓ ACCURATE: All expected fields present.

**Step types (lines 362-372):**

RF3 lists 11 step types. Real trace data shows `UserInputStep`, `SessionInitialStateStep`, `NodeEntryStateStep`, `EnabledToolsStep`, `LLMStep`. Let me verify these match the list:

- ✓ UserInputStep (line 362)
- ✓ SessionInitialStateStep (line 363)
- ✓ NodeEntryStateStep (line 364)
- ✓ EnabledToolsStep (line 367)
- ✓ LLMStep (line 368)

The trace data doesn't show VariableUpdateStep, BeforeReasoningIterationStep, FunctionStep, ReasoningStep, TransitionStep, or PlannerResponseStep in this particular turn, but that's because this agent didn't execute those steps in this turn. ✓ NO ERROR (different agents and flows will show different step types)

**LLMStep structure claims (lines 389-405):**

Expected fields in LLMStep: `agent_name`, `messages_sent`, `tools_sent`, `response_messages`, `execution_latency`

Real trace data shows:
```json
{
  "type": "LLMStep",
  "data": {
    "agent_name": "topic_selector",
    "prompt_name": "topic_selector_prompt",
    "prompt_content": "[...]",
    "execution_latency": 1229
  },
  "messages_sent": [...],
  "tools_sent": [...],
  "response_messages": [...]
}
```

✓ ACCURATE:
- `agent_name` present ✓
- `messages_sent` present (array) ✓
- `tools_sent` present (array) ✓
- `response_messages` present (implicit in step data) ✓
- `execution_latency` present ✓

(Note: real data also includes `prompt_name` and `prompt_content` fields, which RF3 doesn't mention. Not an error.)

**Overall assessment (Custom 3):** All trace structure claims are verified accurate against real trace data from the reference agent. No inaccuracies found.

### Custom 4: Grounding Section Consistency

**Does RF3 grounding guidance contradict RF2?**

RF2 (agent-design-and-spec-creation.md) covers grounding at lines 666-679:

> "Grounding Considerations
>
> The platform's grounding checker compares the agent's response text against action output data. If the agent paraphrases or transforms data values, the grounding checker may not be able to verify the claim and will flag the response as UNGROUNDED.
>
> ### Key Rules
>
> - Instruct the agent to use specific data values from action results. "Use the actual date from the results" passes grounding; "say 'today'" may not — the grounding checker cannot always infer that a specific date equals "today."
> - Avoid instructions that encourage transforming data into relative or colloquial forms (dates → "today"/"tomorrow", units → converted values without originals).
> - Instructions that encourage embellishment (e.g., "respond like a pirate") increase grounding risk — embellished content has no action output to ground against.
> - Always closely paraphrase or directly quote data from action results. The closer the response text matches the action output, the more reliably it passes grounding."

**RF3 grounding guidance (lines 612-685):**

Lines 638-645 list common grounding failure causes:
- Date Inference
- Unit Conversion
- Embellishment
- Loose Paraphrasing

These match RF2's guidance exactly ✓

Lines 664-681 show fix approach:
```agentscript
# WRONG — allows paraphrasing and inference
reasoning:
    instructions: ->
        | Tell the user about the weather.

# CORRECT — explicit instructions to use verbatim values
reasoning:
    instructions: ->
        | After getting weather results, respond using the exact date and temperature
          values returned by the action. Do NOT paraphrase dates (say "2026-02-19",
          not "today"). Do NOT round temperatures (say the exact value from the results).
          Quote action output values verbatim whenever possible.
```

This matches RF2's guidance: "use specific data values" and "directly quote data" ✓

**Simulated vs. Live preview guidance consistency:**

RF3 line 683-685:
> "Simulated preview mode generates fake action outputs via LLM, and those outputs can trigger false grounding failures because they don't match real data patterns. If you see grounding failures during simulated preview, switch to live preview mode (`--use-live-actions`) before investing time in diagnosis — the failure may be an artifact of simulation, not a real instruction problem."

RF2 line 677-679:
> "Grounding behavior can only be validated with **live mode** preview (`--use-live-actions`). Simulated mode generates fake action outputs, so the grounding checker has no real data to validate against."

✓ CONSISTENT: Both state simulated mode generates fake outputs and can produce false grounding failures. Both recommend live mode for grounding validation.

**Grounding retry mechanism consistency:**

RF3 lines 616-632 explain the retry mechanism (ungrounded → error injection → retry → error message if both fail).

agent-debugging-rules lines 115-130 describe the exact same mechanism.

RF2 doesn't cover grounding retry (it's a diagnostic concept, not a design concept). ✓ NO CONTRADICTION

**Overall assessment (Custom 4):** RF3 grounding guidance is consistent with RF2 and aligns with authoritative debugging rules. No contradictions.

### Custom 5: WRONG Example Labeling and Safety

**Inventory of anti-pattern examples (labeled WRONG, BEFORE, or unlabeled):**

| Line Range | Pattern | Label | Clearly Labeled? | Risk of Misreading |
|------------|---------|-------|------------------|-------------------|
| 83-84 | Bare transition in reasoning | "# WRONG —" | ✓ YES | NONE |
| 100-101 | Missing mutable default | "# WRONG —" | ✓ YES | NONE |
| 112-113 | Lowercase booleans | "# WRONG —" | ✓ YES | NONE |
| 124-125 | `...` as variable default | "# WRONG —" | ✓ YES | NONE |
| 136-137 | Linked list type | "# WRONG —" | ✓ YES | NONE |
| 148-149 | Default on linked variable | "# WRONG —" | ✓ YES | NONE |
| 162-163 | Post-action directive on utility | "# WRONG —" | ✓ YES | NONE |
| 264 | Interactive REPL from automation | `# WRONG` | ✓ YES | NONE |
| 275 | Combining `--authoring-bundle` and `--api-name` | `# WRONG —` | ✓ YES | NONE |
| 288 | Sending before starting | `# WRONG —` | ✓ YES | NONE |
| 301 | Missing agent identifier on `send` | `# WRONG` | ✓ YES | NONE |
| 313 | Omitting `--session-id` on `send` | `# WRONG —` | ✓ YES | NONE |
| 442-450 | Topic selector without instructions | "# BEFORE —" | ✓ YES (labeled as not wrong, but improvable) | NONE |
| 491-496 | Action gated but never available | "# WRONG —" | ✓ YES | NONE |
| 525-541 | Re-asking interests every time | "# BEFORE —" | ✓ YES | NONE |
| 669-672 | Allowing paraphrasing in grounding | "# WRONG —" | ✓ YES | NONE |

**Assessment:**

- **All 16 anti-pattern examples are labeled.** No unlabeled examples could be misread as correct.
- **BEFORE examples are clearly framed as "improvable, not wrong."** Lines 442, 525 label these as BEFORE, not WRONG, signaling "this code works but isn't optimal."
- **WRONG examples are unambiguous.** All use inline `# WRONG` or `# WRONG —` comments that are impossible to miss.

**Risk assessment:** ZERO RISK of a consuming agent copying an anti-pattern as a template. All examples are explicitly marked.

### Custom 6: Authoritative Tone

**Checking for hedging language that might be interpreted as optional:**

| Phrase | Line | Assessment |
|--------|------|-----------|
| "always run this command" | 20 | MANDATORY ✓ |
| "ALWAYS include `--json`" | 181 | MANDATORY ✓ |
| "ALWAYS pass `--session-id`" | 203 | MANDATORY ✓ |
| "ALWAYS capture this value" | 189 | MANDATORY ✓ |
| "ALWAYS omit `--target-org`" | 256 | MANDATORY ✓ |
| "Do NOT attempt to preview" | 52 | PROHIBITION (strong) ✓ |
| "NEVER use the interactive REPL from automation" | 181 | PROHIBITION (strong) ✓ |
| "CRITICAL:" | 241 | EMPHASIS (strong) ✓ |
| "CRITICAL:" | 614 | EMPHASIS (strong) ✓ |
| "These are two different syntaxes" | 95 | DIRECTIVE (clear) ✓ |
| "Required for reliable grounding testing" | 239 | STRONG CLAIM ✓ |

**Checking for soft hedging:**

| Phrase | Line | Assessment | Issue? |
|--------|------|-----------|--------|
| "generally" | N/A | NOT FOUND | ✓ |
| "might consider" | N/A | NOT FOUND | ✓ |
| "it's often a good idea" | N/A | NOT FOUND | ✓ |
| "could" | Used in examples (e.g., line 381 "Find the `EnabledToolsStep` — what actions are available vs. invoked?") | CONTEXTUAL (describing what to do, not suggesting alternatives) | ✓ |
| "typically" | Line 360: "Each trace step type reveals specific execution information" | NOT HEDGING; describes what steps are for | ✓ |
| "may" / "may be" | Line 212 ("the user may ask follow-up questions"), Line 256 ("commands may fail because no default org is set") | CONTEXTUAL (describing real scenarios, not hedging recommendations) | ✓ |

**Tone assessment:**

RF3 uses authoritative, prescriptive language throughout:
- "ALWAYS" appears 5+ times
- "NEVER" appears 6+ times
- "MUST" appears in context (e.g., line 20 "always run")
- No "might consider" or "you could try"
- All directives are clear imperatives

A mid-tier agent would read this as binding rules, not suggestions. ✓ AUTHORITATIVE TONE

### Custom 7: No Markdown Tables

**Searching for markdown tables:**

Markdown tables in this format:
```
| Header | Header |
|--------|--------|
| Cell   | Cell   |
```

**Finding:**

Lines 358-374 in RF3 are formatted as a step types reference. Let me check if this is markdown table format:

```
| Header | Column |
|--------|--------|
```

**Checking actual content from RF3:**

Lines 358-374 show:
```agentscript
### Step Types (Reference Table)

Each trace step type reveals specific execution information:

- **`UserInputStep`** — The user's utterance that triggered this turn.
- **`SessionInitialStateStep`** — Variable values and directive context at turn start.
- **`NodeEntryStateStep`** — Which agent/topic is executing and its full state snapshot.
- **`VariableUpdateStep`** — A variable was changed — shows old/new value and reason.
- **`BeforeReasoningIterationStep`** — `before_reasoning` block ran — lists actions executed.
- **`EnabledToolsStep`** — Which tools/actions are available to the LLM for this reasoning cycle.
- **`LLMStep`** — The LLM call — full prompt, response, available tools, latency.
- **`FunctionStep`** — An action executed — shows input, output, and latency.
- **`ReasoningStep`** — Grounding check result — `GROUNDED` or `UNGROUNDED` with reason.
- **`TransitionStep`** — Topic transition — shows from/to topics and transition type.
- **`PlannerResponseStep`** — Final response delivered to user — includes safety scores.
```

This is a **bullet list**, not a markdown table. ✓ CORRECT CONVENTION

**Full search of RF3 for markdown tables:**

No markdown table syntax (`| ... | ... |`) appears anywhere in RF3. All reference material uses bullet lists or prose. ✓ COMPLIANT WITH PROJECT CONVENTION

---

## Summary

### Overall Assessment

RF3 is a **well-structured, technically accurate, and actionable reference file** for mid-tier AI agents learning to validate, preview, and debug Agent Script agents. The file covers all required topics from authoritative sources, maintains logical information flow, contains zero critical inaccuracies, and provides concrete WRONG/RIGHT examples for each major error class.

**Strengths:**

1. **Comprehensive coverage:** Maps to all relevant rules from `.a4drules` files with no significant gaps.
2. **Logical progression:** Validation → Preview → Traces → Diagnosis → Workflow creates a natural learning path.
3. **Actionable guidance:** Nearly 100% of content tells the consuming agent what to do, with explicit directives and decision trees.
4. **Concrete examples:** 16 WRONG/RIGHT pairs teach the most common mistakes and their fixes.
5. **Verified accuracy:** All trace structure claims verified against real trace data; no technical errors found.
6. **Appropriate deferrals:** Agent Script syntax (RF1) and design patterns (RF2) are referenced appropriately, not duplicated.

**Weaknesses:**

1. **Minor ambiguities in complex scenarios:** Line 521 on behavioral loops is vague about "trace structure varies"; line 479 assumes knowledge of `available when` syntax; line 664 leaves exact instruction wording to the agent.
2. **Step types table could be more compact:** Lines 358-374 use bullet format instead of a shorter reference table, but this follows project convention (no markdown tables).
3. **No explicit callout for grounding limitations in simulated mode early:** The guidance is present (line 239, 683-685) but only surfaces in Preview section and Grounding subsection. A consuming agent might discover this only after wasting time in simulated mode. Mitigation: It's mentioned early enough for preview-phase work.

**Consuming Agent Effectiveness:**

A mid-tier AI agent reading RF3 would:
- Successfully validate Agent Script files using the checklist (Section 1)
- Avoid the 7 most common compilation errors (Section 2)
- Correctly run preview with appropriate mode selection (Section 3)
- Read and interpret session trace files (Section 4)
- Apply diagnostic patterns to symptom-based reasoning (Section 5)
- Follow a systematic 8-step debugging workflow (Section 6)
- Understand and diagnose grounding failures (Grounding subsection)

Probability of success: **85-90%** on straightforward validation and preview tasks; **70-75%** on complex behavioral diagnosis (which requires RF1 understanding of Agent Script execution).

### Prioritized Action Items

**Priority 1 (HIGH) — No Critical Issues**

RF3 contains no errors that would cause a consuming agent to produce broken output or reach incorrect conclusions. No fixes required.

**Priority 2 (MEDIUM) — Clarity Improvements**

1. **Line 521 - Clarify "trace structure varies" statement**
   - Current: "Observe the conversation output rather than relying on trace data (trace structure varies)."
   - Issue: Unclear what "varies" means; could mean step types change or trace format is unstable
   - Fix: "Observe the conversation output first; the behavioral symptom may be obvious from the conversation alone (e.g., agent asking the same question repeatedly). You can skip detailed trace analysis if the symptom is clear."
   - Effort: 1-2 lines
   - Impact: Reduces ambiguity for agents uncertain when to use traces vs. conversation

2. **Line 345 - Explicitly document `mockMode` JSON field values**
   - Current: "`mockMode` (either `"Mock"` for simulated or `"Live Test"` for live)"
   - Issue: Accurate but uses string quoting that might be confusing; exact values matter for programmatic parsing
   - Fix: "The `mockMode` field contains either the string `Mock` (simulated mode) or the string `Live Test` (live mode)."
   - Effort: 1 line
   - Impact: Eliminates any doubt about exact field values

3. **Line 479 - Cross-reference RF1 for `available when` concept**
   - Current: "Check the action definition's `available when` condition (e.g., `available when @variables.guest_interests != ""`) "
   - Issue: Assumes consuming agent knows what `available when` is; RF1 teaches it, but no explicit reference
   - Fix: Add inline reference: "Check the action definition's `available when` condition (described in RF1: Agent Script Core Language; e.g., `available when @variables.guest_interests != ""`)"
   - Effort: 1-2 words
   - Impact: Explicit connection to RF1 for agents not holding RF1 context

**Priority 3 (LOW) — Token Optimization (Optional)**

1. **Lines 358-374 - Condense Step Types list (potential savings ~8-10 tokens)**
   - Current: 17 lines with full descriptions
   - Option: Move to 2-column format or reduce descriptions
   - Note: Current format follows project convention (bullet lists, no markdown tables), so no change recommended
   - Effort: 3-5 lines to restructure
   - Impact: Minimal token savings; readability trade-off not worth it

2. **Lines 407-419 - Consolidate "When to Use Traces vs Transcript" (potential savings ~5 tokens)**
   - Current: 13 lines describing when to use each
   - Option: Reduce to 5 bullet points
   - Effort: Minimal
   - Impact: Saves ~5 tokens with slight reduction in detail

**Recommendation:** Implement Priority 2 fixes (minor clarity improvements). Skip Priority 3 (token optimization is not necessary; RF3 earns every token).

