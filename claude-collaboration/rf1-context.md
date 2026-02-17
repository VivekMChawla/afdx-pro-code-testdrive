# Reference File 1 Working Context — Core Language

> **Purpose**: Captures all domain read findings, conflict resolutions, and
> outline decisions for `references/agent-script-core-language.md`. Read this
> before writing or revising the file.

---

## Sources Read

1. **Official Agent Script docs** (14 files under `salesforcedocs/.../agent-script/`):
   `agent-script.md`, `ascript-lang.md`, `ascript-blocks.md`, `ascript-flow.md`,
   `ascript-ref-instructions.md`, `ascript-ref-variables.md`, `ascript-ref-actions.md`,
   `ascript-ref-tools.md`, `ascript-ref-utils.md`, `ascript-ref-expressions.md`,
   `ascript-ref-operators.md`, `ascript-ref-before-after-reasoning.md`,
   `ascript-example.md`, `ascript-manage.md`

2. **Local Info Agent** (`force-app/.../Local_Info_Agent/Local_Info_Agent.agent`):
   Canonical example. 268 lines. 3 domain topics + escalation + off-topic +
   ambiguous guardrails. Demonstrates gated actions (`available when`),
   `@utils.setVariables` for slot-filling, `@utils.escalate`, multiple
   target protocols (`apex://`, `prompt://`, `flow://`), `complex_data_type_name`,
   `filter_from_agent`, `is_displayable`, `progress_indicator_message`.

3. **Language essentials recipes** (HelloWorld, TemplateExpressions,
   VariableManagement): Supplementary patterns. HelloWorld shows minimal
   structure. TemplateExpressions shows `{!expression}` usage including
   arithmetic in templates. VariableManagement shows slot-filling pattern
   with `@utils.setVariables`.

4. **Session 1 draft** (`claude-collaboration/agent-script-skill/references/syntax-rules.md`):
   658 lines. Rich content but unreviewed. Discovery Questions section
   (File 2 territory). Good WRONG/RIGHT pairs. Good action loop prevention
   and grounding sections (File 2 territory). Validation checklist (File 3
   territory).

5. **Jag's syntax-reference.md** (`jaganpro/sf-skills/sf-ai-agentscript/resources/`):
   487 lines. TDD-validated findings. Additional target protocols beyond
   the three core ones. `<>` operator documented (we exclude it — see
   conflicts below). Complete example with linked variable sourced from
   `@MessagingSession.MessagingEndUserId`.

6. **`.a4drules/agent-script-rules-no-edit.md`** (AUTHORITATIVE SOURCE):
   785 lines. Created and tested by Vivek. Prioritize this over other
   sources when conflicts arise. Comprehensive coverage of syntax,
   structure, anti-patterns. Fixed `agent_name` → `developer_name` during
   this session.

---

## Conflict Resolutions (Decided)

1. **`developer_name` vs `agent_name` in config block**: Official docs
   (3 files) and Local Info Agent use `developer_name`. `.a4drules` had
   `agent_name` — this was a bug, now fixed to `developer_name`.

2. **Block ordering**: `.a4drules` says strict order: `system → config →
   variables → connections → knowledge → language → start_agent → topics`.
   Jag says both orderings compile. **Decision**: Follow `.a4drules` strict
   order. Do not mention compiler leniency.

3. **`<>` operator**: Jag documents `<>` alongside `!=`. Official docs and
   `.a4drules` only show `!=`. **Decision**: Only use `!=`. Never include
   `<>` as an example.

4. **Indentation**: `.a4drules` says 4 spaces, never tabs. Jag says
   2/3/tabs all fine if consistent. **Decision**: ALWAYS use spaces, NEVER
   tabs, default to 4 spaces.

5. **`prompt://` vs `generatePromptResponse://`**: `.a4drules` says
   `prompt` is the short form and `generatePromptResponse` is the long
   form. Both work. **Decision**: Use `prompt://` in examples, note the
   long form exists.

---

## Content Scope (What Goes in File 1)

**In scope** (Knowledge Categories A + B):
- Execution model (how Agent Script runtime processes topics)
- Block structure and ordering
- System and config block syntax
- Variables (mutable, linked, types, referencing, slot-filling)
- Topics and start_agent structure
- Reasoning instructions (arrow vs pipe, mixing logic and prompt)
- Action definitions (syntax, target protocols, inputs/outputs)
- Tools / reasoning actions (exposing to LLM, available when, with/set)
- Utility functions (@utils.transition to, @utils.escalate, @utils.setVariables, @topic.X delegation)
- Transitions (two syntaxes in two contexts, one-way vs delegation)
- Expressions and operators
- Naming and formatting rules
- Anti-patterns (WRONG/RIGHT pairs)

**Deferred to other files**:
- Discovery Questions → File 2 (Design & Agent Spec)
- Writing Effective Instructions → File 2
- Action Loop Prevention → File 2
- Grounding Considerations → File 2
- Validation command and checklist → File 3 (Validation & Debugging)
- Metadata locations, deployment, lifecycle → File 4 (Metadata & Lifecycle)

---

## Proposed Outline (Under Review)

The ordering below is proposed but NOT finalized. Vivek flagged that the
order may not be right. Key question: what ordering best serves the
consuming agent's needs?

**Design principle for ordering**: The execution model should come first
(Design Principle 1: "Teach the execution model first"). After that,
the question is whether to follow the structure of an .agent file
(block-by-block, top to bottom) or to follow a conceptual progression
(simple → complex).

### Current proposed sections:

1. **TOC**

2. **How Agent Script Executes** — Split-brain model: runtime resolves
   reasoning instructions deterministically (if/else, run, set) to build
   a prompt string. LLM only reasons after the resolved prompt is complete.
   Worked example from ascript-flow.md showing topic → resolved prompt.

3. **File Structure and Block Ordering** — Eight blocks in mandatory order
   per .a4drules. Which are required. Internal ordering within topic blocks.

4. **System and Config Blocks** — Required fields, messages, instructions.

5. **Variables** — Mutable vs linked, types by context, defaults, template
   injection `{!@variables.X}`, boolean capitalization.

6. **Topics and start_agent** — Entry point, topic structure,
   before/after_reasoning directive blocks, topic-level system overrides.

7. **Reasoning Instructions** — Arrow vs pipe modes, if/else (no else if),
   inline `run @actions.X`, how pipe sections become the prompt.

8. **Actions** — Definition in topic.actions, target protocols, inputs/outputs,
   complex_data_type_name. Two execution paths: deterministic vs LLM-chosen.

9. **Tools (Reasoning Actions)** — Exposing actions in reasoning.actions,
   available when, with binding, set outputs, post-action directives.
   Key rule: post-action directives only work with @actions, not @utils.

10. **Utility Functions** — @utils.transition to, @utils.escalate,
    @utils.setVariables, @topic.X delegation.

11. **Transitions** — Two syntaxes, two contexts. WRONG/RIGHT pairs.
    One-way (transition) vs delegation (@topic.X returns).

12. **Expressions and Operators** — Comparison, logical, arithmetic,
    access, conditional. Template injection. Resource references.

13. **Naming and Formatting Rules** — Name constraints, 4-space indent,
    comments.

14. **Anti-Patterns** — 7 WRONG/RIGHT pairs from .a4drules.

### Open question on ordering:

Should sections 8-11 (Actions, Tools, Utilities, Transitions) be
restructured? They're currently split by concept (definition → LLM
exposure → utilities → transitions) but could alternatively follow the
.agent file structure (topic.actions block → topic.reasoning.actions
block → transition rules).

---

## Key Insights for Writing

- **Write for the consuming agent, not designers.** Every line should
  change how the agent writes/reads Agent Script.
- **Agent Script is NOT any other language.** The consuming agent has
  zero training data. Don't assume familiarity.
- **Prose over tables.** LLMs process prose more reliably.
- **WRONG/RIGHT pairs for anti-patterns.** Implicit reasoning breaks
  mid-tier models.
- **Always use `--json` flag** in any `sf` CLI command examples.
- **Interweave grammar and examples** (Design Principle 2).
- **Anti-patterns tied to execution model** (Design Principle 4).
