# Collaboration Context — Agent Script Skill Project

> **What this file is**: Living memory for a multi-session collaboration between Vivek
> Chawla and Claude. Any session working on this project should read this file first.
>
> **How to use this file**:
> - Read it completely before starting work
> - When your session produces decisions, insights, or changes, MERGE them into the
>   relevant sections below — do NOT overwrite existing content
> - Add new entries to the Session Log (Section 10) so future sessions know what happened
> - If you disagree with a prior decision recorded here, flag it to Vivek — don't silently
>   override it
> - Sections marked [UNRESOLVED] need Vivek's input before acting on them
>
> **Last updated**: February 13, 2026 — Session 1

---

## 1. About Vivek (How to Collaborate Effectively)

Vivek is a Product Management Director at Salesforce DX Services (IC, multi-product).
30 years of experience across software engineering, architecture, technical evangelism,
engineering management, and product management. Expert in Salesforce Platform, SFDX,
ISV ecosystem. Currently deepening PM craft and AI concepts knowledge.

### How Vivek Works

- Processes through conversation, not solo work. Blank pages trigger paralysis — he needs
  structure first, then creativity flows.
- Preferred flow: conversational exploration → Claude synthesizes structure → sequential
  refinement together.
- Sequential beats parallel. Chunk questions into small visible groups — no walls of text.
- Ask questions only when genuinely needed, not as exercises.
- Directness over agreeableness — push back if he's going suboptimal.

### What Vivek Needs From Claude

- **Collaboration, not transaction.** Don't rush to produce finished artifacts. Reason
  through decisions together so Vivek understands the "why."
- **Don't move too fast.** A first draft dumped without discussion is uncomfortable. Build
  incrementally, check in, let him push back before committing.
- **Explain reasoning, but keep it concise.** He wants to learn, not be lectured. Flag
  opportunities for deeper dives instead of auto-expanding.
- **Always ask if he has a template** before proposing one.
- **Be honest about uncertainty.** If you don't know something or are guessing, say so.

### Vivek's Expertise (What to Assume)

- Software engineering, architecture, public speaking, solid PM fundamentals
- Deep SFDX/Salesforce Platform knowledge — don't explain basic Salesforce concepts
- Offer guidance on: PM gaps, AI concepts/tools, skill design best practices

---

## 2. Project Objectives

There are THREE intertwined objectives, not just one.

### Objective 1: Build the Best Agent Script Skill

Create a Claude Skill that teaches Agent Script from scratch — enabling AI coding
assistants (Agentforce Vibes, Cursor, Claude Code) to author, edit, validate, preview,
test, and debug NGA agents correctly despite zero training data in any model.

The skill must be token-efficient and maximally effective. It must outperform what other
Salesforce teams have built, grounded in research-backed principles and real-world
canonical examples.

### Objective 2: Build Vivek's Expertise in Skill Design

This is Vivek's first time building a Skill. Given industry trends, the ability to create
high-quality skills is becoming a professional requirement. He needs to understand skill
design deeply enough to evaluate tradeoffs, defend design decisions, and know WHY things
work — not just THAT they work.

He'd rather learn from Claude and get things right than force a suboptimal approach. Trust
goes both ways — Claude should ground recommendations in best examples and thought
leadership, and Vivek trusts Claude to push back when he's heading in the wrong direction.

### Objective 3: Create a Repeatable Framework for Other PMs

Vivek is the first PM on his team to build a Skill for his product. Leadership expects him
to teach other PMs the process. The way we work together, the questions we ask, the
evaluation criteria we use — all of that becomes the template other PMs follow.

This means the process is as important as the output.

---

## 3. North Stars

Established in Session 2. These are the non-negotiable principles that guide every
decision we make on this skill.

1. **Enable developers to build working agents.** This is the goal. Everything else
   serves it. Token discipline, structural elegance, and teaching quality are means
   to this end — not ends in themselves.

2. **Design for developers who know what they want, not how to implement it.** 
   The skill should enable a developer who can describe their agent's purpose
   and behavior in plain language — without requiring knowledge of Salesforce metadata types,
   CLI commands, or backing implementation details. Designing for this persona ensures
   more capable developers also succeed.

3. **Build deep understanding, not just syntax knowledge.** The LLM has zero prior
   knowledge of Agent Script. It must understand Agent Script deeply enough to make
   correct *design* decisions — not just produce code that compiles. Syntax knowledge
   produces valid code. Deep understanding produces code that works as intended.

4. **The skill must work standalone.** No assumed ecosystem — no other skills, no MCP
   servers, no custom tooling. A developer with this skill, the Salesforce CLI, and a
   Salesforce org can build a functional agent.

5. **Earn every token.** The skill operates under a hard context budget imposed by
   Agentforce Vibes (AFV) and the Agent Skills spec. Every line must justify its
   place. Wasteful token consumption is a **product quality failure** for AFV customers.

6. **Validate through automated testing.** Skill accuracy must be systematically
   verifiable against a live org, not dependent on manual review or assumptions.
   Build testing into the process so claims stay current as the platform evolves.

7. **Platform truth over documentation truth.** When Salesforce docs and the compiler
   disagree, the compiler wins. Test results are the source of truth for what the
   skill documents.

---

## 4. What We're Building

### The Agent Script Skill

Agent Script is Salesforce's new scripting language for authoring next-generation AI
agents using the Atlas Reasoning Engine. It was introduced in 2025 and has ZERO training
data in any AI model.

A Claude Skill for Agent Script must teach everything from scratch — execution model,
syntax, patterns, anti-patterns, lifecycle commands. This is fundamentally different from
a Skill for Python or JavaScript where the model already knows the language.

### Current State (as of Session 1)

A first draft exists at `afdx-pro-code-testdrive/agent-script-skill/` with:
- `SKILL.md` (499 lines) — main skill definition
- `references/syntax-rules.md` (658 lines)
- `references/preview-rules.md` (168 lines)
- `references/testing-rules.md` (256 lines)
- `references/debugging-rules.md` (151 lines)

**Known issue with the first draft**: It was produced too quickly in Session 1 — Claude
read all sources and wrote everything in one pass without collaborative iteration. The
content passed a subagent validation check against quality criteria, but has not been
reviewed by Vivek section by section. It should be treated as a rough draft, not a
finished artifact.

### File Locations

- Skill files: `afdx-pro-code-testdrive/agent-script-skill/`
- Collaboration docs: `afdx-pro-code-testdrive/claude-collaboration/`
- Agent Script source example: `afdx-pro-code-testdrive/force-app/main/default/aiAuthoringBundles/Local_Info_Agent/`
- Existing rules (read-only): `afdx-pro-code-testdrive/.a4drules/`
- Test spec example: `afdx-pro-code-testdrive/specs/Local_Info_Agent-testSpec.yaml`
- **Do NOT use files in `afdx-pro-code-testdrive/temp/`** — stale/inaccurate content. Always ask Vivek first.

### Task Domains and Steel Threads

Established in Session 2. These are the concrete tasks the skill must enable, and the
steel thread scenarios that prove each one works.

#### Task Domains

1. **Create** — Build a new agent from scratch. Recommended workflow: design-first
   (produce a Markdown design doc with Mermaid flowchart showing topic graph, flow
   control, action requirements, gating rationale → human review → build to spec).
   The design doc serves as acceptance criteria. Fast path (direct build) also supported.

2. **Comprehend** — Understand an existing agent the developer didn't write. Outputs
   include: inline `#` comment annotations explaining flow control decisions, gating
   rationale, and topic relationships; a Mermaid flowchart of the topic graph and
   transitions; and optionally a Markdown design doc reverse-engineered from the agent.
   This capability is also the first step of Modify — the agent must comprehend before
   it changes.

3. **Modify** — Add, remove, or change topics, actions, and instructions on an existing
   agent. Action integration is the hardest sub-task here: reasoning about what backing
   logic (Apex, Flow, Prompt Template) exists, what's missing, and articulating specific
   gaps. The skill can't cover Apex/Flow development but must know enough to stub actions
   correctly and hand off context cleanly ("you need an Apex class that accepts X, returns
   Y, implements Z — look for an Apex skill").

4. **Diagnose (compilation)** — "Why won't this compile?" Interpret validation errors
   from `sf agent validate authoring-bundle`, map cryptic error messages to root causes,
   and produce fixes. Different thought process from behavioral diagnosis.

5. **Diagnose (behavioral)** — "Why does the agent do this?" Debug agent behavior using
   `sf agent preview` for inner-loop dev/test/debug. Analyze conversation traces to
   identify incorrect topic routing, unexpected action selection, grounding failures,
   and instruction evaluation issues.

6. **Publish & Deploy** — Three-step pipeline to go from local `AiAuthoringBundle` to a
   running agent: deploy `AiAuthoringBundle` + all dependencies (`sf project deploy start`), publish the agent
   (`sf agent publish authoring-bundle` — commits the version, hydrates Bot/GenAi*
   metadata, auto-retrieves to local project), then activate the published version.
   Publishing will fail if dependencies are missing from the org. A given agent can
   have multiple published versions but only one active at a time.

7. **Delete & Rename** — Maintenance tasks complicated by `AiAuthoringBundle` versioning. May have
   significant restrictions, especially rename. Needs discovery.

8. **Test** — Create `AiEvaluationDefinition` tests. Open question: do these run against
   `AiAuthoringBundle` (Agent Script) agents or only published (Bot/GenAi*) agents? This affects when
   in the workflow testing is viable.
   

#### Cross-Cutting Concerns (Not Steel Threads)

- **Source discovery** — Approved sources for additional context when the agent gets
  stuck. Possibly integrate with Context7. Should be a reference file the agent
  consults, not a standalone task domain.
- **Flow control reasoning** — The core design activity within Create and Modify.
  Not a separate domain, but steel threads for Create and Modify must specifically
  exercise flow control reasoning (topic graph design, transition type selection,
  gating patterns, escalation paths).

#### The Agent Spec (Core Artifact)

Established in Session 2. The **Agent Spec** is the canonical artifact that represents
an agent's structure, intent, and dependencies at any point in its lifecycle. It is
an official AFDX artifact — referenced in documentation, described in skills, and
intended to become a standard pattern developers carry forward regardless of tooling.

**Contents of an Agent Spec:**

- **Purpose & scope** — what the agent does, in plain language
- **Topic graph** — Mermaid flowchart showing topics, transitions, and flow control
- **Actions & backing logic** — what each action does, what powers it (Apex, Flow,
  Prompt Template), and whether that's implemented or needs stubbing
- **Variables** — declarations, types, which topics use them
- **Gating logic** — what conditions govern what, and why
- **Behavioral intent** — what the agent is *supposed* to do (requirements-level,
  not just what the code says)

**The Agent Spec evolves with the agent:**

- At **creation time**, it's sparse — role, topics, descriptions, directional notes
  about backing logic. (This is essentially what `sf agent generate agent-spec`
  produced as YAML, but richer.)
- During **build**, it fills in — flowchart added, backing logic mapped, gating
  documented.
- During **comprehension**, it's reverse-engineered from an existing agent.
- During **diagnosis**, it's the reference the dev agent compares actual behavior
  against.
- During **testing**, test coverage is noted against it.

**Agent Spec entries can be directional or observational:**

- Directional: "booking_confirm needs an Apex class that accepts X, returns Y —
  stub contract defined here"
- Observational: "check_events is backed by Apex class EventLookup, invoked via
  the standard action pattern"

**Platform context:** AFDX previously had `sf agent generate agent-spec` (REPL-style
interview → YAML) and `sf agent create` (YAML → classic agent metadata via server-side
API). Both were deprioritized when local GenAI tooling (Claude Code, AFV) made the
server-side approach less compelling. The refined Agent Spec concept described here
may warrant revisiting deprecation — the artifact has value beyond the original
generation pipeline. Product decision owned by Vivek.

**Role in the skill:** The dev agent always produces or updates an Agent Spec as the
first output of comprehension and the foundation for every other operation. It is
the consistent ground truth the dev agent works from, and the consistent artifact
the developer reviews and reacts to.

#### Execution Contexts and Agent Lifecycle

Established in Session 2. Critical platform knowledge for the skill.

**Two execution contexts (same underlying APIs, different clients):**

- **Preview** — developer-facing, using preview APIs. Same APIs whether in
  VS Code/CLI or the NGA Web UI (Agent Builder). Used during development for
  inner-loop dev/test/debug.
- **Runtime** — the published + activated agent running via the Runtime Agent API.
  Can be accessed from CLI/VS Code/NGA Web for developer testing, but critically,
  can also be surfaced in customer-facing channels like the Embedded Service App
  on Experience Cloud sites.

The distinction is preview APIs vs. Runtime Agent API, not local vs. org.

**Agent version lifecycle:**

1. **Draft** — the working state during development (`AiAuthoringBundle` files)
2. **Published** — a committed version. Publishing locks the version — no further
   changes are possible to that version. Published versions start in an inactive
   state. A new draft version is created if changes are needed.
3. **Activated** — one published version is made live. A given agent can have
   multiple published versions, but only one can be active at a time. There are
   specific CLI commands to activate/deactivate agents.

**Deploy → Publish → Activate pipeline:**

1. Deploy `AiAuthoringBundle` + all dependencies via `sf project deploy start` (must happen first —
   publish fails if dependencies are missing from the org)
2. Publish via `sf agent publish authoring-bundle` (commits version, hydrates
   Bot/GenAi* metadata, auto-retrieves hydrated metadata to local project)
3. Activate via `sf agent activate` to make a published version live for runtime
   access (`sf agent deactivate` to take it offline or before replacing with a
   different published version)

#### Design-First Workflow (Recommended for Create, Valuable for Comprehend)

A key capability of the skill: before writing Agent Script, the agent produces an
**Agent Spec** containing purpose, topic graph (as Mermaid flowchart), flow control
decisions, action requirements with backing logic analysis, and gating rationale.
The human reviews and refines. Then the agent builds to that spec.

This serves three purposes:
- Gives the human a visual, reviewable artifact before code exists
- Creates acceptance criteria the agent script can be evaluated against
- Forces the agent to reason through design decisions explicitly rather than
  making implicit choices buried in code

The skill should provide everything the agent needs for this capability (Mermaid
patterns, Agent Spec structure guidance, flow analysis patterns) even if not every
user chooses to use it.

#### Steel Threads (To Be Defined)

Steel threads are specific prompt-based scenarios with concrete success criteria.
Each one exercises a task domain and proves the skill works for that domain.

**Steel thread design principle**: Prompts should assume a developer who knows *what
they want* but not necessarily *how Salesforce implements it technically*. No metadata
type names, no CLI commands, no backing implementation details in the prompt. If we
design for this persona, more capable developers automatically succeed too.

Each steel thread has two sections:
- **Build Instructions** — what the skill must teach the LLM to do (informs skill content)
- **Acceptance Criteria** — pass/fail checks an evaluator can run on the output

Status: In progress. See `afdx-pro-code-testdrive/claude-collaboration/steel-threads.md`
for the full steel thread definitions.

---

## 5. Design Principles (Research-Backed)

These come from in-context learning research and are documented in detail in
`afdx-pro-code-testdrive/claude-collaboration/AGENT_SCRIPT_SKILL_CONTEXT.md`. Summarized here:

1. **Teach the execution model first** (P1) — Explain HOW Agent Script runs at runtime,
   not just syntax. The "notional machine" concept. This is the most important section.
2. **Interweave grammar and examples** (P2) — Don't separate syntax from examples. Show
   grammar, then immediately show what it looks like in practice.
3. **Format consistency over prose quality** (P3) — Structural patterns matter more than
   label correctness for in-context learning.
4. **Anti-patterns with semantic explanations** (P4) — WRONG/RIGHT pairs explained in
   terms of the execution model, not just "this is invalid."
5. **Analogies to known languages** (P5) — Map Agent Script to YAML, Express.js routes,
   API contracts, session state.
6. **Explicit constraints over implicit assumptions** (P6) — State rules as both narrative
   and hard constraint.

---

## 6. Skill Architecture Principles (Research-Backed)

These principles govern how we structure the Agent Script skill. They combine the
Agent Skills open specification, in-context learning research, and lessons from
reviewing Jag's sf-ai-agentscript skill. Established in Session 2.

### The Agent Skills Spec Constraints

The [Agent Skills open standard](https://agentskills.io/specification) defines a
three-tier progressive disclosure model that all skill-compatible agents (AFV, Claude
Code, Cline, Cursor, Codex) implement:

| Tier | What Loads | When | Budget |
|------|-----------|------|--------|
| **1. Discovery** | `name` + `description` from YAML frontmatter | Always, for all installed skills | ~100 tokens |
| **2. Activation** | Full SKILL.md body | When agent decides skill is relevant | < 5000 tokens recommended |
| **3. Execution** | Files in `references/`, `scripts/`, `assets/` | On demand, when agent reads them | As needed per subtask |

**Critical constraint**: The SKILL.md body loads *in full* every time the skill
activates. Every token in that body is consumed whether or not it's relevant to the
current task. This is the core token economics problem.

**Implication**: The SKILL.md body should contain what the LLM needs to *correctly
approach any Agent Script task*. Reference files should contain what it needs to
*execute specific subtasks correctly*. Content that only matters for some tasks
belongs in reference files, not the body.

### Token Discipline Principles

**Primary target: Agentforce Vibes (AFV)**, a Cline fork. AFV customers pay for
tokens. Wasteful token consumption is a product quality failure. Token discipline
is the top priority; effectiveness is a close second.

1. **Compress prose ruthlessly. Never compress structure, examples, or anti-patterns.**
   A terse sentence that says the same thing as a verbose paragraph is always better.
   But a missing example or a removed WRONG/RIGHT pair is almost always worse, even
   though it saves more tokens than tightening prose.

2. **Implicit reasoning breaks mid-tier models.** Frontier models infer negative
   cases from positive statements. Mid-tier models (Haiku-class, AFV default/free
   tier) often don't. Explicit anti-patterns cost a few extra tokens but prevent
   whole classes of errors. When in doubt, show the WRONG case.

3. **Deduplication can kill reinforcement.** Seeing a concept applied in multiple
   contexts strengthens the model's grasp (in-context learning research). A concept
   used in a syntax section AND a pattern example isn't waste — it's two different
   contextual anchors. Cut one only if you're certain the remaining occurrence is
   sufficient.

4. **Structural consistency is signal.** The repeating format of how content is
   presented is itself a learning signal. Cutting words from individual sections
   to save tokens but breaking the structural pattern is a net loss. Consistency
   of format > brevity of individual sections.

5. **SKILL.md body = what applies to every task. Reference files = what applies
   to specific subtasks.** This is the primary sorting criterion for what goes where.

### What Belongs in SKILL.md Body (< 500 lines)

- Execution model (how Agent Script runs at runtime) — applies to every task
- Block structure and ordering — applies to every task
- Complete annotated example — the canonical "what correct looks like"
- Key patterns (gated actions, variable capture, conditionals, etc.) — common tasks
- Common mistakes with WRONG/RIGHT pairs — prevents frequent errors
- Pointers to reference files with clear "when to read" guidance

### What Belongs in Reference Files

- Detailed syntax rules and validation checklists
- Platform-specific gotchas (canvas bugs, reserved field names, etc.)
- Deployment checklists and CLI command reference
- Type matrices and data type mappings
- Templates for common agent patterns
- Known platform bugs and workarounds (release-specific)
- Testing and debugging workflows
- Preview mode rules and session management

### Lessons from Jag's sf-ai-agentscript Skill

Reviewed in Session 2. Jag's skill (v1.8.0, 1,400-line SKILL.md + 12 resource
files + 28 templates + syntax validator hook) is the most comprehensive Agent Script
skill we've seen. Key takeaways:

**Adopt (content is excellent)**:
- TDD-validated gotchas ("Features NOT Valid in Current Release")
- Scoring system (100 points, 6 categories) — gives LLM a quality target
- WRONG/RIGHT constraint tables — prevents specific compile errors
- Canvas corruption bugs documentation
- `complex_data_type_name` mapping table
- Lifecycle hook validation (before_reasoning/after_reasoning)
- Reserved field names list
- PostToolUse syntax validator hook
- Templates library (patterns, components, complete agents)
- Cross-skill orchestration pointers

**Don't adopt (structural issues)**:
- 1,400-line SKILL.md body (~3x the spec recommendation)
- Operational detail front-loaded into body instead of reference files
- Inconsistencies between SKILL.md and resource files (block ordering, config
  field names disagree between files)
- No execution model section — jumps straight to syntax constraints
- No progressive disclosure hierarchy in the main file

---

## 7. Key Decisions Made

### Frontmatter Format

The YAML frontmatter `description` field MUST be a single-line double-quoted string.
YAML folded scalars (`>`) break the skill parser — it treats continuation lines as
separate attributes. This matches the canonical docx skill's pattern.

### Canonical Reference

The built-in `docx` skill (at `/sessions/.../mnt/.skills/skills/docx/SKILL.md`) is our
structural reference for what a well-built skill looks like. 482 lines, single-line
description, quick reference table up top, task-organized sections.

### Primary Example Agent

The Local Info Agent at `afdx-pro-code-testdrive/force-app/main/default/aiAuthoringBundles/Local_Info_Agent/`
is the primary example. It demonstrates all major constructs.

### What NOT to Modify

- `afdx-pro-code-testdrive/.a4drules/` files are shared with other tools — read-only for us
- Files in `afdx-pro-code-testdrive/temp/` are stale — do not use without asking Vivek

---

## 8. Competitive Landscape

Multiple teams inside Salesforce are also building Skills for Agent Script. Vivek wants
ours to be the best, but is open to adopting better approaches from others.

### Evaluation Principles for Other Teams' Work

- Adopt the best of what they're doing, but don't lose the character of what we're building
- Other teams may make design choices that assume their full tool ecosystem is present —
  our skill must work standalone
- Challenge our own assumptions based on what others are doing, but stay grounded in our
  north stars (once defined)

### AI Platform Team (SAMPLE-CLAUDE-INSTRUCTIONS-FROM-OTHER-TEAM.md)

Reviewed in Session 1. Key observations:
- They route through a **custom MCP server** for preview, publish, and test — bypassing
  AFDX CLI commands (`sf agent preview`, `sf agent test`, etc.)
- Requires **manual credential management** (client ID, secret, access tokens) that SFDX
  handles transparently through `sf org login`
- Their Agent Script reference is thin — no execution model, no anti-patterns, no gated
  action patterns. Syntax cheat sheet only.
- They have the **block ordering wrong** (`language` before `variables`)
- They are Python developers working outside the Salesforce Developer experience — their
  tooling choices reflect that background, not AFDX best practices
- **Takeaway**: Their approach is instructive as a counter-example. Shows what happens
  when Agent Script tooling is built outside the SFDX mental model.

### Jag's sf-skills (FDE — Forward Deployed Engineer) [NOT YET REVIEWED]

Repo at `/Users/vchawla/git/jaganpro/sf-skills`. Jag is an experienced FDE and emerging
thought leader on AI-assisted productivity inside Salesforce. His choices are likely
grounded in hands-on experience.

**Caution**: His skills may assume the presence of his full skill library. Design choices
that work in that context may not transfer to our standalone skill.

**Status**: Reviewed in Session 2. Repo accessible at `jaganpro/sf-skills/sf-ai-agentscript/`.
Detailed findings recorded in Section 6 ("Lessons from Jag's sf-ai-agentscript Skill").

---

## 9. Resource Inventory

Established in Session 3. Catalog of all available source material for skill
development. Resources are inventoried here but NOT bulk-ingested — pull targeted
content on demand during skill writing. This follows the same progressive disclosure
principle we apply to the skill itself.

### Agent Script Source Examples

- **Local Info Agent** (primary example):
  `afdx-pro-code-testdrive/force-app/main/default/aiAuthoringBundles/Local_Info_Agent/`
- **Agent Script Recipes** (DevRel samples, ~28 recipes organized by category):
  `agent-script-recipes/force-app/`
  - `main/01_languageEssentials/` — HelloWorld, TemplateExpressions,
    LanguageSettings, VariableManagement, SystemInstructionOverrides
  - `main/02_actionConfiguration/` — ActionDefinitions, ActionCallbacks,
    AdvancedInputBindings, ActionDescriptionOverrides,
    InstructionActionReferences, PromptTemplateActions
  - `main/03_reasoningMechanics/` — AfterReasoning, ReasoningInstructions
  - `main/04_architecturalPatterns/` — MultiStepWorkflows, ErrorHandling,
    AdvancedReasoningPatterns, MultiTopicNavigation, SimpleQA,
    SafetyAndGuardrails, BidirectionalNavigation, ExternalAPIIntegration
  - `future_recipes/` — ConditionalLogicPatterns, ContextHandling,
    MultiTopicOrchestration, ComplexStateManagement, EscalationPatterns,
    DynamicActionRouting, CustomerServiceAgent, TopicDelegation
  - **Caution**: These are authored by DevRel, not the platform team. Validate
    patterns against compiler behavior before adopting. Use carefully when
    integrating into the skill.

### Salesforce AFDX Documentation

Location: `salesforcedocs/genai-main/content/en-us/agentforce/`

- **Guides** (`guides/agentforce/agent-dx/`):
  - Agent Script authoring: `agent-dx-nga-author-agent.md`,
    `agent-dx-nga-script.md`
  - Agent Spec: `agent-dx-create-agent-spec.md`,
    `agent-dx-generate-agent-spec.md`
  - Agent creation: `agent-dx-create-agent.md`
  - Preview: `agent-dx-preview.md`, `agent-dx-nga-preview.md`
  - Publish: `agent-dx-nga-publish.md`
  - Testing: `agent-dx-test.md`, `agent-dx-test-spec.md`,
    `agent-dx-test-create.md`, `agent-dx-test-customize.md`,
    `agent-dx-test-run.md`
  - Metadata: `agent-dx-metadata.md`, `agent-dx-nga-authbundle.md`
  - Management: `agent-dx-manage.md`, `agent-dx-modify.md`,
    `agent-dx-synch.md`
  - Setup: `agent-dx-set-up-env.md`
  - Reference: `agent-dx-reference.md`
- **References** (`references/`):
  - Agent Script syntax: `agent-script/agent-script-reference.md`
  - Testing metadata: `testing/testing-metadata-reference.md`,
    `testing/testing-connect-reference.md`
  - AFDX CLI reference: `agentforce-dx/agentforce-dx-reference.md`

### Salesforce CLI Documentation

**Gap**: CLI reference docs are only available on the Salesforce website, which
blocks agent access. No local copy available. Current workaround: rely on AFDX
docs (above) and Vivek's direct knowledge for CLI command accuracy.

### Competing Skills

- **Jag's sf-ai-agentscript** (reviewed Session 2):
  `jaganpro/sf-skills/sf-ai-agentscript/`
  - SKILL.md (1,400 lines), 12 resource files, 28 templates, syntax
    validator hook
  - Key resource files: `fsm-architecture.md`, `instruction-resolution.md`,
    `syntax-reference.md`, `testing-guide.md`, `debugging-guide.md`,
    `actions-reference.md`, `known-issues.md`
  - Detailed findings in Section 6

### Agent Skills Specification

- **Canonical spec** (reviewed Session 2): `agentskills/docs/`
  - `specification.mdx` — spec constraints (name, description, body limits)
  - `what-are-skills.mdx` — progressive disclosure concept
  - `integrate-skills.mdx` — how agents discover, load, and activate skills
- **Reference implementation**: `agentskills/skills-ref/src/skills_ref/`
  - `prompt.py`, `models.py`, `validator.py`

### Cline / AFV Platform Documentation

- **Cline Skills doc**: `cline/docs/customization/skills.mdx`
- **Other Cline customization**: `cline/docs/customization/` — cline-rules,
  clineignore, hooks, workflows

### Our Current Skill Draft

- `afdx-pro-code-testdrive/agent-script-skill/` — SKILL.md + reference files
  (treated as rough draft, not reviewed section-by-section)

### Existing Rules Files (Read-Only)

- `afdx-pro-code-testdrive/.a4drules/` — agent-script-rules,
  agent-preview-rules, agent-testing-rules, agent-debugging-rules
  (shared with other tools, do not modify)

### Test Spec Example

- `afdx-pro-code-testdrive/specs/Local_Info_Agent-testSpec.yaml`

### Skill-Creator Skill (Process Framework)

- `.skills/skills/skill-creator/SKILL.md` — process framework, eval approach,
  writing guide (reviewed Session 2)

---

## 10. Open Questions

1. ~~**North stars**~~ — **RESOLVED** in Session 2. See Section 3.
2. ~~**Jag's skills**~~ — **RESOLVED** in Session 2. See Section 6 and Section 8.
3. **First draft review** — SKILL.md needs section-by-section review with Vivek
4. **Reference file verification** — The four reference files were written but never read
   back. Need to verify they're accurate.
5. **Evaluation approach** — How will we test the skill? The context doc suggests specific
   prompts + validation, but we haven't set this up yet.

## 10.1 Future Workstreams

### Agent Script Skill Validator (Separate Skill)

**What**: A standalone skill that systematically tests the Agent Script skill's claims
against a live Salesforce org. Takes the syntax rules, supported features, known bugs,
and anti-patterns documented in our skill and verifies them against the current platform
release.

**Why**: Agent Script is evolving rapidly. Features that don't compile today may work
next release (and vice versa). Jag's TDD validation is manual — someone ran 13 agents
through a live org and recorded results. A Validator skill would make this repeatable
and automatable.

**When**: After the core Agent Script skill is solid. The Validator needs concrete,
verified claims to test against. Building it before the skill is stable is premature.

**Cadence**: Run weekly or after each Salesforce release to catch platform changes.

**Key design decisions (for later)**:
- What does the test matrix look like? (syntax features × agent types × release)
- How does it report results? (diff against current skill claims)
- How does it update the skill? (auto-PR to reference files, or report for human review)
- Does it need its own org/scratch org, or can it share the dev org?

---

## 11. Guiding Cautions

- **Don't rush.** Build incrementally, check in with Vivek, let him push back.
- **Don't use `afdx-pro-code-testdrive/temp/` files** without asking Vivek first — stale content.
- **Don't assume other teams' approaches are correct** — evaluate against our principles.
- **Don't produce finished artifacts without collaborative iteration** — the process
  matters as much as the output (Objective 3).
- **Verify file paths** before sending agents to explore them — check accessibility first.

---

## 12. Session Log

### Session 1 — February 13, 2026

**What happened**:
- Read all source materials (context doc, prompt, Local Info Agent, all four .a4drules
  files, test spec, skill-creator SKILL.md, docx SKILL.md)
- Produced first draft of complete skill (SKILL.md + 4 reference files)
- Fixed frontmatter format issue (YAML folded scalar → single-line quoted string)
- Reviewed AI Platform team's CLAUDE.md sample — identified as counter-example
- Established collaboration principles and three-objective framework
- Created this collaboration-context.md document

**Key mistake**: Moved too fast on the first draft — wrote everything in one pass without
collaborative iteration. Recognized and acknowledged. Future work should be incremental.

**Unresolved at session end**: North stars, Jag's repo review, section-by-section SKILL.md
review, reference file verification, evaluation approach.

### Session 1 (continued) — February 13, 2026

**What happened**:
- Rewrote `AGENT_SCRIPT_SKILL_PROMPT.md` from an 86-line build specification to a 35-line
  collaboration-first session-opener. Points to collaboration-context.md instead of repeating
  context. Explicitly sets collaborative mode ("not a build task").
- Updated all file paths in `claude-collaboration/` to include `afdx-pro-code-testdrive/`
  prefix — Vivek plans to mount `~/git` as the root folder for future sessions so he can
  access multiple repos (including Jag's sf-skills repo).
- Files updated: collaboration-context.md, AGENT_SCRIPT_SKILL_CONTEXT.md,
  AGENT_SCRIPT_SKILL_PROMPT.md, LOCAL_INFO_AGENT_PROMPT.md, LOCAL_INFO_AGENT_REFINEMENT.md,
  guidelines-for-ai-rules.md
- Files intentionally NOT updated: SAMPLE-CLAUDE-INSTRUCTIONS-FROM-OTHER-TEAM.md (other
  team's document, paths are theirs), agent-script-skill/ files (project-relative paths
  correct for skill context)

**Still unresolved**: Same as Session 1 — north stars, Jag's repo review, section-by-section
SKILL.md review, reference file verification, evaluation approach.
