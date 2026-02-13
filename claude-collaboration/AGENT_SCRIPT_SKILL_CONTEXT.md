# Agent Script Skill — Context Document

> **Purpose**: Provide the context needed to build a high-quality Claude Skill for authoring,
> editing, and debugging Agent Script — a programming language with zero AI training data.
>
> **Created**: February 2026
> **Author**: Vivek Chawla (PM, Agentforce DX) + Claude (analyst)
> **Delete when**: The Skill is built and validated.

---

## 1. The Challenge

Agent Script is Salesforce's new scripting language for authoring next-generation AI agents.
It was introduced in 2025 and has **zero training data in any AI model**. No model has seen
Agent Script syntax, idioms, or examples during training.

This means a Claude Skill for Agent Script can't rely on the model's pre-existing knowledge.
The Skill itself must teach Claude everything it needs to author correct Agent Script — from
scratch, using only the context provided in the Skill document.

This is fundamentally different from a Skill for Python or JavaScript, where the model already
knows the language and the Skill just adds domain-specific guidance.

---

## 2. Research-Backed Principles for Zero-Training-Data Skills

These principles come from in-context learning research (Brown et al. 2020, Min et al. 2022),
grammar prompting for domain-specific languages (NeurIPS 2023), and programming language
pedagogy research. They are ordered by impact.

### P1: Teach the Execution Model First ("Notional Machine")

**Source**: Du Boulay's "notional machine" concept, validated in programming pedagogy research.

**Finding**: Students (and LLMs) with an accurate mental model of how a language *executes*
make far fewer "plausible but wrong" errors than those who only know syntax rules.

**Application**: The Skill must explain how Agent Script programs *run*, not just how they
*look*. Specifically:

- How the Atlas Reasoning Engine selects topics at runtime
- How actions get invoked (LLM decides when, platform executes the target)
- What state persists across conversation turns (variables, conversation history)
- The difference between reasoning actions (LLM-selected) and directive actions (deterministic)
- When `before_reasoning` and `after_reasoning` blocks execute relative to the LLM reasoning cycle

This section should come FIRST in the Skill, before any syntax reference.

### P2: Formal Grammar + Annotated Examples, Interwoven

**Source**: "Grammar Prompting for Domain-Specific Language" (NeurIPS 2023).

**Finding**: For domain-specific languages, combining a formal grammar with annotated examples
significantly outperforms either alone. The grammar constrains hallucination; examples teach
idiomatic usage.

**Application**: Don't put the grammar in an appendix and examples in a separate section.
Weave them together:

```
## Topic Declaration
Grammar: `"topic" IDENTIFIER ":" NEWLINE INDENT description reasoning [actions]`

Example:
    topic local_weather:
        description: "Handles weather inquiries for Coral Cloud Resort"
        reasoning:
            instructions: ->
                | Your job is to answer weather questions.
```

### P3: Format Consistency Is More Important Than Prose Quality

**Source**: Min et al. 2022 — "What Makes Good In-Context Examples for GPT-3?"

**Finding**: Format and structure consistency matter MORE than label correctness for in-context
learning. Models learn structural patterns faster than semantic content.

**Application**:
- Every example in the Skill must use identical formatting (4-space indentation, same section ordering)
- Never mix formatting styles across examples
- Establish conventions early and adhere rigidly
- Use the exact same annotation style throughout

### P4: Anti-Patterns with Semantic Explanations

**Source**: Prompt engineering research on negative examples; validated in code generation studies.

**Finding**: Showing what NOT to do — with explanations tied to the execution model —
significantly reduces a class of errors.

**Application**: Include a "Common Mistakes" section with WRONG/RIGHT pairs. Crucially,
explain WHY the wrong version fails in terms of the execution model, not just "this is invalid."

```
# WRONG — @utils.transition has no post-action directives
go_next: @utils.transition to @topic.checkout
    set @variables.navigated = True

# WHY: Utility actions are consumed by the topic router, not the action executor.
# The platform never sees `set` directives on utility actions — they're silently ignored.

# CORRECT
go_next: @utils.transition to @topic.checkout
```

### P5: Leverage Analogies to Known Languages

**Source**: Cross-lingual transfer learning research (2023).

**Finding**: Models transfer knowledge from well-known languages to unfamiliar ones when
given explicit analogies.

**Application**: Include a brief "How Agent Script Relates to What You Know" section:

- **Structure**: Like YAML configuration files (indentation-sensitive, declarative)
- **Topics**: Like route handlers in Express.js (pattern matching on user intent)
- **Actions**: Like API endpoint contracts (typed inputs, typed outputs, target implementation)
- **Variables**: Like session state in a web framework (persists across requests/turns)
- **Reasoning instructions**: Like system prompts for an LLM (guide behavior, not execute logic)
- **NOT like imperative code**: No loops, no step-by-step procedures, no function calls in the traditional sense

### P6: Explicit Constraints Over Implicit Assumptions

**Source**: Neurosymbolic research on constrained generation.

**Finding**: Explicitly stated constraints reduce invalid generation. Implicit rules cause
models to hallucinate variations.

**Application**: Every rule should be stated as both narrative and constraint. Don't just say
"topics need descriptions" — say "every `topic` block MUST have a `description:` field as its
first child. Validation will fail without it."

---

## 3. Existing Materials Assessment

The project already has three reference documents in `.a4drules/`:

| File | Lines | Content | Quality | What's Missing |
|------|-------|---------|---------|----------------|
| `agent-script-rules-no-edit.md` | 716 | Complete syntax reference with validation checklist and error prevention | Good — covers all constructs | No execution model. No explanation of WHY constructs exist. Rules-focused, not teaching-focused. |
| `agent-preview-rules-no-edit.md` | 140 | Preview CLI commands (interactive vs. programmatic, execution modes) | Good — clear and actionable | Nothing major missing |
| `agent-testing-rules-no-edit.md` | 224 | Test spec YAML format, metrics, CLI commands | Good — complete schema reference | Nothing major missing |
| `agent-debugging-rules-no-edit.md` | ~180 | Session trace analysis, diagnostic patterns, grounding retry mechanism | Good — comprehensive methodology | New file, created Feb 2026 |

**Key gap**: The syntax rules file (716 lines) tells you WHAT is valid but not HOW
the runtime uses it. The Skill needs to fill this gap with the execution model (P1)
and annotated examples (P2).

**The existing `.a4drules` files should NOT be duplicated into the Skill.** The Skill should
reference them as bundled resources. The Skill's main SKILL.md should add what's missing:
the notional machine, analogies, patterns, and anti-patterns.

---

## 4. The Skill Format

A Claude Skill is a directory containing:

```
agent-script/
├── SKILL.md                    # Required: main skill definition (target: <500 lines)
└── references/                 # Optional: detailed reference docs loaded on demand
    ├── syntax-rules.md         # Agent Script grammar and validation rules
    ├── preview-rules.md        # Preview CLI commands and modes
    ├── testing-rules.md        # Test spec format and CLI commands
    └── debugging-rules.md      # Session trace analysis and diagnostic patterns
```

### SKILL.md Structure

```yaml
---
name: agent-script
description: "**Agent Script Authoring**: Create, edit, validate, preview, and test
  Agentforce agents using Agent Script (.agent files). Use whenever the user mentions
  Agent Script, .agent files, authoring bundles, AiAuthoringBundle, NGA agents, or
  wants to create/modify an Agentforce agent using pro-code tools."
---

# Body: Markdown instructions for the agent
```

### Key Conventions from Existing Skills

1. **Progressive disclosure**: Keep SKILL.md under 500 lines. Put detailed references
   in separate files loaded on demand ("Read references/syntax-rules.md for full grammar").

2. **Quick reference table at top**: Give the agent a fast lookup for common operations.

3. **Explain WHY, not just WHAT**: Use theory of mind — help the agent understand
   reasoning, not just rules (from the skill-creator meta-skill guidance).

4. **Trigger optimization**: The description field drives skill activation. Include
   all relevant keywords and anti-triggers.

5. **Imperative instructions**: "Read the syntax rules file before writing any Agent Script"
   is better than "The agent should consider reading..."

---

## 5. Available Raw Materials

### Complete Agent Script Example: Local Info Agent

Location: `force-app/main/default/aiAuthoringBundles/Local_Info_Agent/Local_Info_Agent.agent`

This is a fully functional agent with:
- `system` block with instructions and messages
- `config` block with developer_name, label, description, default_agent_user
- `variables` block with 3 mutable variables (string, string, boolean)
- `language` block
- `start_agent` with conditional instructions and transitions
- 6 topics: escalation, off_topic, ambiguous_question, local_weather, local_events, resort_hours
- 3 action types: Apex (`apex://CheckWeather`), Prompt Template (`prompt://Get_Event_Info`), Flow (`flow://Get_Resort_Hours`)
- Patterns: gated actions (`available when`), variable capture from outputs (`set @variables.x = @outputs.y`), conditional instructions, template variables

### Simpler Agent Script Example: My_First_NGA_Agent

Location: `temp/demoTemp/aiAuthoringBundles/My_First_NGA_Agent/My_First_NGA_Agent.agent`

Simpler agent demonstrating linked variables, basic topic structure, and minimal configuration.

### Test Specification Example

Location: `specs/Local_Info_Agent-testSpec.yaml`

Shows test cases with: single-turn tests, multi-turn tests (conversationHistory), metric selection, expectedActions (including empty array for "should NOT invoke action").

### Existing Rules Files

- `.a4drules/agent-script-rules-no-edit.md` — 716 lines, complete syntax reference
- `.a4drules/agent-preview-rules-no-edit.md` — 140 lines, preview CLI commands
- `.a4drules/agent-testing-rules-no-edit.md` — 224 lines, test spec format and CLI commands

---

## 6. Skill Content Architecture

Based on the research principles and existing materials, here's the recommended structure
for the Skill's main SKILL.md:

### Section 1: Quick Reference (~30 lines)
Table mapping common tasks to actions: "Create new agent → ...", "Add a topic → ...",
"Validate changes → sf agent validate authoring-bundle ...", etc.

### Section 2: How Agent Script Works (Execution Model) (~80 lines)
The notional machine. How the Atlas Reasoning Engine processes an Agent Script at runtime:
1. Agent receives user utterance
2. `start_agent` evaluates — `before_reasoning` runs first (deterministic)
3. LLM reads instructions (including conditional blocks), sees available actions
4. LLM selects an action (a topic transition, a utility, or a domain action)
5. If domain action: platform executes target (Apex/Flow/Prompt Template), returns outputs
6. Post-action directives run (set variables, chain actions, conditional transitions)
7. `after_reasoning` runs (deterministic)
8. Response returned to user; state persists for next turn

Also explain: topics as conversation domains, variables as session state, the difference
between `@utils.transition` (permanent) vs `@topic.X` (delegate + return).

### Section 3: Analogies to Familiar Concepts (~20 lines)
Map Agent Script to things the model knows (YAML, Express.js routes, API contracts, etc.)

### Section 4: Minimal Complete Example (~60 lines)
A small but complete Agent Script with inline annotations explaining each section.
Use the simplest possible agent that demonstrates all major constructs.

### Section 5: Key Patterns (~80 lines)
The 6-8 most important patterns, each with a concrete example:
1. Topic with gated action (collect data before allowing action)
2. Variable capture from action outputs
3. Conditional instructions based on state
4. Multi-topic transitions (permanent vs. delegate)
5. Before/after reasoning for deterministic logic
6. Template variable interpolation in instructions
7. Progress indicators on actions
8. Guardrail patterns (off-topic, ambiguous)

### Section 6: Common Mistakes (~60 lines)
WRONG/RIGHT pairs with semantic explanations (tied to execution model):
1. Wrong transition syntax per context
2. Missing defaults on mutable variables
3. Boolean capitalization (True/False not true/false)
4. `...` used as variable default instead of slot-fill
5. Post-action directives on utility actions
6. Linked variables with defaults
7. `else if` (not supported)

### Section 7: Lifecycle Commands (~30 lines)
Validate, preview, test — with the exact CLI commands.
Point to reference files for details.

### Section 8: Reference Pointers (~15 lines)
"For complete syntax rules, read references/syntax-rules.md"
"For preview modes and CLI workflow, read references/preview-rules.md"
"For test spec format and metrics, read references/testing-rules.md"

**Estimated total: ~375 lines** — well under the 500-line target.

---

## 7. Quality Criteria

The Skill is successful if a model with NO prior Agent Script knowledge can:

1. **Author a complete, valid Agent Script** from a natural-language agent description
   - Correct block ordering, indentation, naming conventions
   - Appropriate use of mutable vs. linked variables
   - Correct action target formats and input/output schemas

2. **Modify existing Agent Script correctly**
   - Add topics, actions, variables without breaking existing structure
   - Preserve formatting consistency
   - Update instructions and reasoning without syntax errors

3. **Avoid the top 7 common mistakes** identified in the rules file
   - Especially: transition syntax per context, boolean capitalization, slot-fill syntax

4. **Use lifecycle commands correctly**
   - Validate after every change
   - Preview in correct mode (simulated vs. live)
   - Understand when NOT to deploy AiAuthoringBundle metadata

5. **Pass validation** on generated Agent Script
   - `sf agent validate authoring-bundle` returns no errors

### Evaluation Approach

Test the Skill by giving Claude prompts like:
- "Create an agent that helps customers track orders and manage returns"
- "Add a new topic to this agent for handling billing inquiries"
- "The agent should ask for the customer's name before looking up orders"
- "Fix this Agent Script" (provide script with known errors)

Run `sf agent validate authoring-bundle` on every generated/modified script.

---

## 8. Constraints

- The Skill is for Claude (Anthropic's model), not a generic LLM
- The Skill format follows Anthropic's open standard (see Section 4)
- The existing `.a4drules` files are **not editable** — the Skill can reference them
  but not modify them
- The Skill should work in both Cowork mode (desktop app) and Claude Code (CLI)
- Keep SKILL.md under 500 lines
- Agent Script syntax may evolve — structure the Skill so updates are localized
  (syntax changes go in references/syntax-rules.md, not scattered through SKILL.md)
