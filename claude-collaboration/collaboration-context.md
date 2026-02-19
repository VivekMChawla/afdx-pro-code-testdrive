# Collaboration Context — Agent Script Skill Project

> **What this file is**: Living memory for a multi-session collaboration between Vivek
> Chawla and Claude. Any session working on this project should read this file first.
>
> **How to use this file**:
> - Read it completely before starting work
> - When your session produces decisions, insights, or changes, MERGE them into the
>   relevant sections below — do NOT overwrite existing content
> - Add new entries to the Session Log (Section 13) so future sessions know what happened
> - If you disagree with a prior decision recorded here, flag it to Vivek — don't silently
>   override it
> - Sections marked [UNRESOLVED] need Vivek's input before acting on them
>
> **Last updated**: February 19, 2026 — Session 10 (RF3 complete, adversarial review passed, context docs updated)

---

## Quick Start for Fresh Sessions

If you're starting a new session on this project, read in this order:

1. **Terminology** (below this guide) — canonical names for key concepts.
2. **Section 1 (About Vivek)** — how to collaborate. Read this first.
   Your first response sets the tone; get this right.
3. **Section 2 (Project Objectives)** — what we're building and why
   (three intertwined objectives, not just one).
4. **Section 3 (North Stars)** — non-negotiable principles guiding every
   decision.
5. **Section 10 (Reference File Architecture)** — start with the
   **Architecture Decision** at the top (the decision summary, reference
   files, and load profiles). The **Source Research (Deep Dive)**
   subsection contains the detailed reasoning — treat it as background
   context, not required reading for action. Then read the **File
   Inventory** for content scope per reference file.
6. **Section 11 (Active Work Items)** — backlog with status tags and
   acceptance criteria. This tells you what to work on.
7. **Sections 4-9 — read selectively based on your task:**
   - Writing skill content? → Section 4 (What We're Building) for task
     domains, Section 5 (Design Principles) for content patterns
   - Making architecture decisions? → Section 6 (Skill Architecture)
     including 6.1 (Constraints vs. Goals Matrix)
   - Evaluating other approaches? → Section 8 (Competitive Landscape)
   - Finding source material? → Section 9 (Resource Inventory)
   - Checking prior decisions? → Section 7 (Key Decisions)
8. **Section 13 (Session Log)** — update this at the end of your session.

## Terminology (Canonical Names)

Use these exact forms when writing skill content or updating this document:

- **Agent Script** — the scripting language. Not "AgentScript" or "agent script."
- **Agent Script execution model** — how Agent Script processes at runtime.
  Short form "execution model" is acceptable when context is unambiguous.
- **Agent Spec** — the canonical design/documentation artifact (always title
  case). Not "agent spec," "Agent Specification," or "agent-spec."
- **`AiAuthoringBundle`** — the Salesforce metadata type that serves as the
  container for an Agent Script agent definition (one word, PascalCase).
  Not "AiAuthoring Bundle" or "Ai Authoring Bundle."
- **`AiEvaluationDefinition`** — the Salesforce metadata type that represents
  an agent test definition (one word, PascalCase).
- **Steel thread** — a concrete test scenario (lowercase). Abbreviated ST1-ST9.
- **Reference file** — a file in the `references/` directory (lowercase).
  When referencing specific reference files, use the short name and filename:
  "Core Language (`agent-script-core-language.md`)". Note: earlier sessions
  used the term "bundle" to mean "a grouping of knowledge categories into
  a reference file." That term is retired — just say "reference file."

**File path convention:** All paths in this document are relative to the
git repository root. When running in a session, the full path is:
`/sessions/[session-id]/mnt/git/[relative-path]`

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

8. **Test** — Create `AiEvaluationDefinition` tests. [UNRESOLVED]: Do these
   run against `AiAuthoringBundle` (Agent Script) agents or only published
   (Bot/GenAi*) agents? This affects when in the workflow testing is viable.
   Needs validation during File 5 (Test Authoring) writing.


#### Cross-Cutting Concerns (Not Steel Threads)

- **Source discovery** [FUTURE] — Approved sources for additional context when the
  agent gets stuck. Possibly integrate with Context7. Should be a reference file
  the agent consults, not a standalone task domain. Not blocking current work.
- **Flow control reasoning** [ADDRESSED] — The core design activity within Create
  and Modify. Covered by knowledge category C (Flow Control & Design Patterns)
  in reference File 2 (`agent-design-and-spec-creation.md`).

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

Status: ST1-ST9 defined and refined in Session 2. See
`afdx-pro-code-testdrive/claude-collaboration/steel-threads.md` for the full
steel thread definitions (prompts, build instructions, acceptance criteria).

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

### 6.1 Constraints vs. Goals Matrix

This matrix is the authoritative source for what's mandatory vs. preferred.
When in doubt during writing, consult this — not the prose in other sections.

**Hard Constraints (no exceptions):**
- Skill must work standalone — no other skills, MCP servers, or custom tooling
  assumed (North Star 4)
- YAML frontmatter `description` must be single-line double-quoted string
  (parser requirement — Section 7)
- One level deep references from SKILL.md — no nested reference chains
  (Agent Skills spec)
- Every reference file has a "when to read" trigger in SKILL.md
  (Agent Skills spec + skill-creator guidance)
- Every reference file includes a TOC (~10-15 lines, negligible cost)

**Strong Guidelines (exceeding requires justification to Vivek):**
- SKILL.md body under 500 lines. The skill-creator itself is 763 lines,
  so this is not an absolute wall — but our router model should make
  staying under 500 easy. If you're exceeding, you're probably putting
  domain knowledge in the body.
- Reference files under 300 lines each. If a file needs more, justify
  with a content audit showing every section earns its tokens. The
  Design & Agent Spec reference file is the most likely to exceed.

**Design Goals (guide decisions, not hard rules):**
- Minimize total token consumption per task — token cost is the real
  metric, not file read count (three focused 250-line reads > one
  750-line read where half is irrelevant)
- Each reference file must earn its token cost — if loaded, most content
  should be relevant to the current task
- Small, consistent duplications across files are intentional reinforcement,
  not waste (Design Principle 3)
- When trading off prose compression vs. anti-pattern examples, keep the
  examples — implicit reasoning breaks mid-tier models (Design Principle 2)
- Structural format consistency across all reference files — the repeating
  format is itself a learning signal (Design Principle 4)

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

### Jag's sf-skills (FDE — Forward Deployed Engineer) [REVIEWED — Session 2]

Repo at `jaganpro/sf-skills/sf-ai-agentscript/`. Jag is an experienced FDE and
emerging thought leader on AI-assisted productivity inside Salesforce. His choices
are grounded in hands-on experience.

**Caution**: His skills assume the presence of his full skill library. Design choices
that work in that context may not transfer to our standalone skill.

**Detailed findings**: Section 6 ("Lessons from Jag's sf-ai-agentscript Skill").

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

## 10. Reference File Architecture

### Architecture Decision (FINAL — Session 3)

**Router model with 5 reference files.** SKILL.md is a pure router —
it identifies the user's task and directs the agent to the correct reference
file(s). All substantial domain knowledge lives in reference files.

**Why router model:** (1) No knowledge category appears in every steel thread,
so nothing strictly requires SKILL.md body placement. (2) The routing function
IS needed for every task — it's what genuinely belongs in the body. (3) Agents
that adopt the Agent Skills standard already progressively load context from
reference files. (4) Clean separation of concerns, SKILL.md stays well under
500 lines.

**Chosen approach:** Router + co-occurrence clusters. Categories that always
appear together in steel threads share a reference file. Minimizes reads,
maximizes relevance per read.

**Alternatives considered and rejected:**
- ❌ **Pattern A (flat):** Everything in SKILL.md — our domain is too complex.
- ❌ **By steel thread:** One file per task domain — too much duplication of
  shared knowledge (execution model, syntax).
- ❌ **By knowledge type:** Syntax, gotchas, CLI, patterns in separate files —
  a single task would need 3-4 file reads.
- ❌ **Hybrid (universals in SKILL.md body, phases in references):** No category
  appears in every ST, so "universals" is empty. Body would contain content
  that's irrelevant to some tasks.

**The 5 reference files:**

Core Language (`agent-script-core-language.md`) — categories A+B
(Execution Model, Syntax & Block Structure). Loaded by ST1, ST2, ST3,
ST4, ST5, ST9.

Design & Agent Spec (`agent-design-and-spec-creation.md`) — categories
C+D (Flow Control & Design Patterns, Agent Spec Production). Loaded by
ST1, ST2, ST3, ST5, ST9.

Validation & Debugging (`agent-validation-and-debugging.md`) — categories
E+F (Validation & Error Diagnosis, Preview & Behavioral Debugging).
Loaded by ST1, ST3, ST4, ST5, ST6, ST8.

Metadata & Lifecycle (`agent-metadata-and-lifecycle.md`) — category G
(Metadata & Lifecycle Management). Loaded by ST2, ST6, ST7, ST8, ST9.

Test Authoring (`agent-test-authoring.md`) — category H (Agent Test Spec
Authoring). Loaded by ST9 only.

**Load profile per steel thread:** ST1 Create loads Core Language,
Design & Agent Spec, Validation & Debugging (3 reads). ST2 Comprehend
loads Core Language, Design & Agent Spec, Metadata & Lifecycle (3 reads).
ST3 Modify loads Core Language, Design & Agent Spec, Validation &
Debugging (3 reads). ST4 Diagnose-Compilation loads Core Language,
Validation & Debugging (2 reads). ST5 Diagnose-Behavioral loads Core
Language, Design & Agent Spec, Validation & Debugging (3 reads). ST6
Deploy loads Validation & Debugging, Metadata & Lifecycle (2 reads).
ST7 Delete loads Metadata & Lifecycle (1 read). ST8 Rename loads
Validation & Debugging, Metadata & Lifecycle (2 reads). ST9 Test loads
Core Language, Design & Agent Spec, Metadata & Lifecycle, Test Authoring
(4 reads). Most STs need 2-3 files. ST9 (most complex) needs 4. ST7
(simplest) needs 1. Proportional to actual task complexity.

**Pressure test summary (all PASS):**
- **Core Language:** PASS — Execution Model and Syntax are inseparable.
  Boundary with Flow Control (C) is clean: A = runtime mechanics,
  C = design intent.
- **Design & Agent Spec:** PASS with size risk — may exceed 300 lines.
  TOC required. Co-occurrence data is unambiguous; this is a sizing
  concern, not a clustering error.
- **Validation & Debugging:** PASS with acceptable waste — ST4 loads
  preview knowledge it doesn't use, ST9 loads validation knowledge it
  doesn't use. Waste is dead weight, not misleading signal.
- **Metadata & Lifecycle:** PASS — procedurally diverse (deploy, delete,
  rename, test metadata) but follows recipe-based pattern. No confusion risk.
- **Test Authoring:** PASS — unique to ST9, self-contained.

### Source Research (Deep Dive)

The architecture decision above was derived from three source analyses and a
systematic clustering methodology. This section documents the detailed
reasoning — treat it as background context supporting the decision summary
above, not as required reading for executing work items.

#### Source 1: Agent Skills Specification

The spec defines three optional directories beyond SKILL.md:

- `references/` — additional documentation loaded on demand. Examples:
  REFERENCE.md, FORMS.md, domain-specific files (finance.md, legal.md).
  Guidance: "Keep individual reference files focused. Agents load these on demand,
  so smaller files mean less use of context."
- `scripts/` — executable code. Should be self-contained with helpful error messages.
- `assets/` — static resources (templates, images, data files, schemas).

Key constraints from the spec:
- File references should be **one level deep** from SKILL.md (no deeply nested chains)
- SKILL.md body should stay under **500 lines** — move detailed reference material out
- The three-tier model is explicit: Metadata → Instructions → Resources (as needed)

### Source 2: Skill-Creator Skill (Process Framework)

The skill-creator (763 lines, the most sophisticated built-in skill) adds:
- "Reference files clearly from SKILL.md with guidance on **when to read them**"
- "For large reference files (>300 lines), include a table of contents"
- Domain organization pattern: organize by variant (aws.md, gcp.md, azure.md) so
  "Claude reads only the relevant reference file"
- Scripts can execute without being loaded into context (token-free execution)

### Source 3: Built-In Skills — Observed Patterns

Four distinct reference file architectures emerge across the built-in skills:

**Pattern A — Flat (docx, xlsx)**: No reference files. Everything in SKILL.md
(481 and 292 lines respectively). Works when the domain is small enough to fit
in the body and every task needs most of the same knowledge.

**Pattern B — Workflow-Split (pptx)**: Two reference files split by workflow
variant — `editing.md` (edit existing) vs `pptxgenjs.md` (create from scratch).
SKILL.md explicitly directs: "Read [editing.md](editing.md) for full details."
Works when there are 2-3 distinct workflows that rarely overlap.

**Pattern C — Conditional (pdf)**: Two reference files split by task type —
`FORMS.md` (form filling, loaded first if forms detected) vs `REFERENCE.md`
(advanced features). SKILL.md uses conditional triggers: "If you need to fill
out a PDF form, first check... then go to FORMS.md." Works when tasks have
clear branch points.

**Pattern D — Hierarchical (skill-creator)**: Eight reference files organized
into `references/` (4 mode-specific docs) and `agents/` (4 role-specific docs
for subagent delegation). Files are loaded at specific workflow stages: "Read
references/eval-mode.md at the beginning of Eval Mode." The most sophisticated
architecture — works when the skill has multiple modes with distinct deep knowledge.

### Synthesis: Implications for Agent Script Skill

**Our domain is more complex than any built-in skill.** We have 9 steel threads
across 8 task domains, each requiring different subsets of Agent Script knowledge.
Pattern A (flat) won't work. The question is which combination of B, C, and D
best fits our content.

**Candidate partitioning dimensions** (all evaluated and rejected — see
Architecture Decision at top of Section 10 for the chosen approach):

1. ❌ **By steel thread / task domain** — one reference file per major task.
   Rejected: too much duplication of shared knowledge across files.

2. ❌ **By knowledge type** — syntax, gotchas, CLI, patterns in separate files.
   Rejected: a single task would need 3-4 file reads.

3. ❌ **By workflow phase** — comprehend, build, validate, deploy phases.
   Rejected: phase boundaries are fuzzy (Create spans comprehend + build + validate).

4. ❌ **Hybrid (universals in body, phases in references)** — no category
   appears in every ST, so "universals" is empty. Rejected in favor of
   pure router model.

**Constraints and goals** — see Section 6.1 (Constraints vs. Goals Matrix)
for the authoritative list. Key points relevant to this research:
- SKILL.md body: strong guideline of 500 lines (not absolute wall —
  skill-creator is 763 — but exceeding requires justification)
- Reference files: target 300 lines each, TOC required for all
- One level deep references from SKILL.md (no nested chains)
- Clear "when to read" triggers for every reference file
- Token cost is the real metric, not file read count
- Small duplications across files are intentional reinforcement
  (Design Principle 3: "Deduplication can kill reinforcement")

### Knowledge Categories (Finalized, Session 3)

Eight categories of knowledge the skill must contain, ordered by developer
workflow progression:

- **A. Execution Model** — how Agent Script processes topics, actions, and gating
  at runtime. The "why" behind every syntax rule.
- **B. Syntax & Block Structure** — correct block ordering, indentation rules,
  transition syntax variants, variable declarations, action definitions. The
  constructive knowledge for writing correct code.
- **C. Flow Control & Design Patterns** — topic graph design, gating patterns
  (single/multi-condition), transition types (handoff vs delegation), escalation,
  guardrails, action loop prevention. The design thinking, not just syntax.
- **D. Agent Spec Production** — how to produce, consume, and populate the
  canonical Agent Spec artifact, including the investigative work of backing
  logic analysis (scanning for Apex/Flow/Prompt Templates, mapping or stubbing
  actions with protocols/I-O specs/data types). Backing logic analysis is merged
  here because it is never a standalone activity — it always populates the
  Agent Spec. This makes the Agent Spec a first-class, core requirement.
- **E. Validation & Error Diagnosis** — running `sf agent validate`, interpreting
  errors, mapping to root causes, error taxonomy (block ordering, indentation,
  syntax, missing declarations, type mismatches, structural).
- **F. Preview & Behavioral Debugging** — running `sf agent preview`, session
  trace analysis, grounding service behavior, reproducing and diagnosing
  behavioral symptoms.
- **G. Metadata & Lifecycle Management** — `AiAuthoringBundle` directory
  conventions, locating agents, `sfdx-project.json`, deploy → publish → activate
  pipeline, deactivation, delete mechanics, rename mechanics, orphan cleanup.
- **H. Agent Test Spec Authoring** — YAML format, expectations (topic/action
  sequence match, bot_response_rating), quality/performance metrics, conversation
  history, `sf agent test create/run`.

### Steel Thread × Knowledge Category Matrix (Binary)

The agent either reads a reference file or it doesn't — there is no partial
or "light" consumption. This binary framing was established after discovering
that the earlier "required vs light" distinction didn't map to any real
difference in agent behavior. Format note: this matrix uses explicit prose
rather than a table because LLMs process prose more reliably than tabular
formats that require spatial reasoning.

**ST1 Create** needs 6 categories: Execution Model, Syntax & Block Structure,
Flow Control & Design Patterns, Agent Spec Production, Validation & Error
Diagnosis, Preview & Behavioral Debugging.

**ST2 Comprehend** needs 5 categories: Execution Model, Syntax & Block
Structure, Flow Control & Design Patterns, Agent Spec Production, Metadata
& Lifecycle Management.

**ST3 Modify** needs 6 categories: Execution Model, Syntax & Block Structure,
Flow Control & Design Patterns, Agent Spec Production, Validation & Error
Diagnosis, Preview & Behavioral Debugging.

**ST4 Diagnose-Compilation** needs 3 categories: Execution Model, Syntax &
Block Structure, Validation & Error Diagnosis.

**ST5 Diagnose-Behavioral** needs 6 categories: Execution Model, Syntax &
Block Structure, Flow Control & Design Patterns, Agent Spec Production,
Validation & Error Diagnosis, Preview & Behavioral Debugging.

**ST6 Deploy** needs 3 categories: Validation & Error Diagnosis, Preview &
Behavioral Debugging, Metadata & Lifecycle Management.

**ST7 Delete** needs 1 category: Metadata & Lifecycle Management.

**ST8 Rename** needs 3 categories: Validation & Error Diagnosis, Preview &
Behavioral Debugging, Metadata & Lifecycle Management.

**ST9 Test** needs 7 categories: Execution Model, Syntax & Block Structure,
Flow Control & Design Patterns, Agent Spec Production, Preview & Behavioral
Debugging, Metadata & Lifecycle Management, Agent Test Spec Authoring.

**How many STs need each category:** Execution Model: 6 (ST1, ST2, ST3, ST4,
ST5, ST9). Syntax & Block Structure: 6 (ST1, ST2, ST3, ST4, ST5, ST9). Flow
Control & Design Patterns: 5 (ST1, ST2, ST3, ST5, ST9). Agent Spec
Production: 5 (ST1, ST2, ST3, ST5, ST9). Validation & Error Diagnosis: 6
(ST1, ST3, ST4, ST5, ST6, ST8). Preview & Behavioral Debugging: 6 (ST1, ST3,
ST5, ST6, ST8, ST9). Metadata & Lifecycle Management: 5 (ST2, ST6, ST7, ST8,
ST9). Agent Test Spec Authoring: 1 (ST9).

**Co-occurrence patterns driving the reference file architecture:**
- Execution Model and Syntax & Block Structure appear in identical STs
  (ST1,2,3,4,5,9) — they always travel together → Core Language file
- Flow Control & Design Patterns and Agent Spec Production appear in
  identical STs (ST1,2,3,5,9) — they always travel together → Design
  & Agent Spec file
- Validation & Error Diagnosis and Preview & Behavioral Debugging are close
  but not identical (Validation in ST4/ST8 without Preview; Preview in ST9
  without Validation) → merged into Validation & Debugging file because
  validation is lightweight and the waste is harmless
- Metadata & Lifecycle Management stands alone (ST2,6,7,8,9) → Metadata
  & Lifecycle file
- Agent Test Spec Authoring is unique to ST9 → Test Authoring file

### Trigger Precision Guide (For Reference File Authoring)

When writing reference file content, use this guide to disambiguate
which file a piece of knowledge belongs in:

- **Execution model mechanics** → File 1 (Core Language) — how the runtime works
- **Syntax rules and block structure** → File 1 (Core Language) — how to write correct code
- **Flow control design and topic graph patterns** → File 2 (Design & Agent Spec) — design-time thinking
- **Agent Spec structure and lifecycle** → File 2 (Design & Agent Spec) — the canonical artifact
- **Backing logic analysis** → File 2 (Design & Agent Spec) — feeds the Agent Spec
- **Compilation errors and validation** → File 3 (Validation & Debugging) — diagnosing broken code
- **Preview and behavioral debugging** → File 3 (Validation & Debugging) — diagnosing broken behavior
- **CLI commands for deploy/publish/activate** → File 4 (Metadata & Lifecycle) — operational
- **CLI commands for testing** → File 5 (Test Authoring) AND File 4 (intentional duplication)
- **Test spec YAML format and design methodology** → File 5 (Test Authoring) — authoring

**Quick disambiguation:** Is this about understanding or designing the agent
(Files 1-2)? Or about operating or testing it (Files 3-5)?

### Cluster Analysis and Reference File Groupings (Session 3)

The co-occurrence patterns reveal three natural clusters and two independents.
Categories that appear in exactly the same set of steel threads should be
co-located in the same reference file — splitting them would force two file
reads where one suffices.

**Cluster 1 — "Core Language" (categories A+B):** Execution Model and Syntax
& Block Structure appear in identical STs (ST1, ST2, ST3, ST4, ST5, ST9).
They always travel together. Rationale: you cannot write or read Agent Script
without understanding both the runtime behavior and the syntax rules.

**Cluster 2 — "Design & Agent Spec" (categories C+D):** Flow Control & Design
Patterns and Agent Spec Production appear in identical STs (ST1, ST2, ST3,
ST5, ST9). They always travel together. Rationale: Agent Spec Production
captures the output of design thinking — you never produce an Agent Spec
without reasoning about flow control, and you never reason about flow control
without recording it in the Agent Spec. (This reinforces the Session 2
decision to make the Agent Spec a first-class artifact.)

**Merged — "Verify & Debug" (categories E+F):** Validation & Error
Diagnosis and Preview & Behavioral Debugging are close but not identical (E
appears in ST4/ST8 without F; F appears in ST9 without E). Decision: merge
them into a single reference file. Rationale: validation is lightweight (CLI commands,
interpreting return values), so loading it alongside preview/debugging
knowledge is an acceptable token cost. Keeping them separate would force
5 STs (ST1, ST3, ST5, ST6, ST8) to load two files where one suffices.

**Standalone — "Metadata & Lifecycle Management" (category G):** Appears in
ST2, ST6, ST7, ST8, ST9. Shares almost no overlap with Clusters 1 and 2
(co-occurs with them only in ST2 and ST9). Clearly its own reference file.

**Standalone — "Agent Test Spec Authoring" (category H):** Unique to ST9.
Clearly its own reference file.

This produces **5 reference files**. Under the router model (SKILL.md
routes, reference files carry domain knowledge), each ST loads SKILL.md plus
the following reference files:

- ST1 Create: Core Language, Design & Agent Spec, Verify & Debug (3 files)
- ST2 Comprehend: Core Language, Design & Agent Spec, Metadata & Lifecycle (3 files)
- ST3 Modify: Core Language, Design & Agent Spec, Verify & Debug (3 files)
- ST4 Diagnose-Compilation: Core Language, Verify & Debug (2 files)
- ST5 Diagnose-Behavioral: Core Language, Design & Agent Spec, Verify & Debug (3 files)
- ST6 Deploy: Verify & Debug, Metadata & Lifecycle (2 files)
- ST7 Delete: Metadata & Lifecycle (1 file)
- ST8 Rename: Verify & Debug, Metadata & Lifecycle (2 files)
- ST9 Test: Core Language, Design & Agent Spec, Metadata & Lifecycle, Test Spec Authoring (4 files)

Load profile: most STs need 2-3 reference files. ST9 (the most complex task)
needs 4. ST7 (the simplest) needs 1. This is proportional to actual task
complexity.

### Pressure Test Results (Session 3)

Each reference file was examined for misassignment, internal cohesion,
and edge cases.

**Core Language (A+B): PASS.** Potential boundary concern:
Execution Model (A) explains *how* the runtime selects topics and invokes
actions, which could bleed into Flow Control (C). Resolution: A covers
runtime mechanics ("the runtime evaluates topic selector instructions to
choose a topic"). C covers design intent ("here's how to design those
instructions so the runtime makes the choices you want"). Mechanics vs.
design — clean split.

**Design & Agent Spec (C+D): PASS with size risk.** Flow
control patterns (gating, transitions, escalation, guardrails, action
loop prevention) plus Agent Spec guidance (structure, lifecycle evolution,
backing logic analysis methodology) is substantial content. If this
exceeds 300 lines, it needs a TOC or a split. This is a content-sizing
risk, not a clustering error — the co-occurrence data is unambiguous.

**Validation & Debugging (E+F): PASS with acceptable waste.** Waste
cases: ST4 (compilation diagnosis) loads preview/debugging knowledge it
doesn't use. ST9 (testing) loads validation knowledge it doesn't use.
Assessment: the waste is harmless — validation and preview are clearly
different activities, so the agent won't confuse them. The irrelevant
content is dead weight, not misleading signal.

**Metadata & Lifecycle (G): PASS with cohesion note.** This reference
file serves diverse STs: ST2 needs directory conventions, ST6 needs
the deploy pipeline, ST7 needs delete mechanics, ST8 needs rename
mechanics, ST9 needs test deployment. The content is procedurally diverse
— more of a reference manual than a cohesive narrative. This is the
reference file most likely to feel like a grab bag. However, these are all
distinct procedural recipes that the agent follows one at a time, so
the diversity doesn't create confusion.

**Test Authoring (H): PASS.** Unique to ST9,
self-contained. No issues.

**ST9 load count concern:** ST9 loads 4 reference files
(Core Language, Design & Agent Spec, Metadata & Lifecycle, Test Spec
Authoring). Each is genuinely needed — comprehend the agent (1), produce
Agent Spec as test baseline (2), deploy test specs (4), write the YAML
(5). The 4-file load reflects real task complexity, not an architecture
problem.

**Overall assessment:** Reference file groupings hold up. Risks are
content-sizing (Design & Agent Spec) and cohesion (Metadata & Lifecycle),
both manageable during writing.
No category is misassigned.

### File Inventory (Draft, Session 3)

Each entry specifies the filename, the "when to read" trigger that SKILL.md
will use to direct the consuming agent, and the approximate content scope.
Asset files (examples, templates) are listed under the reference file that
triggers their read.

**SKILL.md** (router)
- Skill purpose and scope
- Brief Agent Script orientation (enough for the agent to understand routing
  decisions, not enough to write code)
- Task domain descriptions (so the agent can identify the user's intent)
- "When to read" triggers for each reference file
- Note: all substantial domain knowledge lives in reference files, not here

**Reference File 1: `references/agent-script-core-language.md`** (categories A+B)
Trigger: "Read this file when you need to read, write, or modify Agent
Script code. This includes creating agents, modifying existing agents,
diagnosing compilation or behavioral issues, and comprehending agent
structure."
Content:
- How the Agent Script runtime processes topics, actions, and gating
  (execution model)
- Block structure and ordering rules (system → config → variables →
  language → start_agent → topics)
- Syntax: variable declarations, action definitions, transition syntax
  variants (`@utils.transition to` vs bare `transition to`), indentation
  rules
- Key anti-patterns with WRONG/RIGHT pairs
- Pointer to annotated example asset
Asset: `assets/local-info-agent-annotated.agent` — complete annotated
example based on the Local Info Agent, showing all major constructs in
context. Serves two purposes: (1) pedagogical — teaches how concepts
compose into a working agent, (2) safety valve — a fallback reference
when the agent can't build successfully from focused inline examples
alone. Referenced from this file, not embedded.
Additional assets (generative templates): starting-point agents for
common patterns, e.g., `assets/single-topic-template.agent`,
`assets/multi-topic-template.agent`. Minimal, uncommented, designed
to be copied and modified. Zero token cost until read. The number of
templates is unconstrained — assets load on demand per the Agent
Skills spec's progressive disclosure model.

**Reference File 2: `references/agent-design-and-spec-creation.md`** (categories C+D)
Trigger: "Read this file when you need to design an agent's topic graph,
reason about flow control, produce or update an Agent Spec, or analyze
backing logic requirements."
Content:
- Agent Spec structure (purpose, topic graph, actions/backing logic,
  variables, gating, behavioral intent)
- Agent Spec lifecycle (sparse at creation → filled during build →
  reverse-engineered during comprehension)
- Topic graph design patterns (Mermaid flowchart conventions)
- Gating patterns: single-condition, multi-condition, with examples
- Transition types: handoff vs delegation, when to use each
- Escalation and guardrail topic patterns
- Action loop prevention
- Backing logic analysis methodology: how to scan for Apex/Flow/Prompt
  Templates, how to map existing implementations, how to stub gaps with
  protocols/I-O specs/data types. Critical detail: only certain types of
  backing logic are valid for actions (e.g., only invocable Apex, not
  arbitrary Apex classes). Similar constraints may exist for Flows and
  Prompt Templates — needs validation during content writing. This is
  high-value knowledge worth extra token spend because wiring an action
  to invalid backing logic is a common and costly mistake.
- Pointer to Agent Spec template asset (if created)

**Reference File 3: `references/agent-validation-and-debugging.md`** (categories E+F)
Trigger: "Read this file when you need to validate Agent Script, diagnose
compilation errors, preview an agent, or debug behavioral issues."
Content:
- Validation: `sf agent validate authoring-bundle` usage, interpreting
  output
- Error taxonomy: block ordering, indentation, syntax, missing
  declarations, type mismatches, structural
- Error-to-root-cause mapping patterns
- Preview: `sf agent preview` usage, `--authoring-bundle` vs `--api-name`
  flags
- Session trace analysis: what to look for, how to interpret
- Grounding service behavior (masking issues)
- Behavioral diagnosis methodology: form hypotheses from execution model
  → reproduce in preview → analyze traces → targeted fixes

**Reference File 4: `references/agent-metadata-and-lifecycle.md`** (category G)
Trigger: "Read this file when you need to locate an agent, deploy, publish,
activate, deactivate, delete, rename an agent, or run agent tests."
Content:
- `AiAuthoringBundle` directory conventions and file structure
- Locating agents: local project structure, `sfdx-project.json`,
  retrieving from org
- Deploy pipeline: `sf project deploy start` (dependencies first),
  `sf agent publish authoring-bundle`, `sf agent activate` /
  `sf agent deactivate`
- Delete mechanics: deactivate → remove local → destructive deploy →
  verify cleanup
- Rename mechanics: identify all references, assess published version
  impact, execute consistently, validate
- `AiEvaluationDefinition` metadata: what it is, how `sf agent test create`
  creates it from test specs, and `sf agent test run` to execute tests.
  Note: test specs are unofficial intermediate artifacts used to create
  `AiEvaluationDefinition` metadata — they are not directly deployable.
  Test spec authoring and result interpretation are covered in
  `references/agent-test-authoring.md`; this file covers the metadata
  and CLI operations.

**Reference File 5: `references/agent-test-authoring.md`** (category H)
Trigger: "Read this file when you need to design test scenarios, write
Agent Test Spec YAML files, or interpret test results."
Content:
- Agent Test Spec YAML format
- Expectations: `topic_sequence_match`, `action_sequence_match`,
  `bot_response_rating`
- Quality metrics: coherence, completeness, conciseness, instruction
  following, factuality
- Performance metrics: output latency
- Conversation history for multi-turn scenarios
- Custom evaluations (string/numeric comparisons)
- Test design methodology: using Agent Spec as coverage baseline
- Interpreting test results: what pass/fail means for each expectation
  and metric type
- Anti-pattern: `sf agent generate test-spec` is an interactive,
  REPL-style CLI command designed for human use (serial "interview
  style" test case entry). It is NOT appropriate for agentic use.
  Agents should start from boilerplate test spec assets instead. Note:
  future AFDX releases may change this command's output to better
  support agentic use cases, but current behavior is human-only.
- CLI commands for reference: `sf agent test create` (creates
  `AiEvaluationDefinition` metadata from test specs), `sf agent test run`
  (executes tests). These are also documented in
  `references/agent-metadata-and-lifecycle.md` — the intentional duplication
  reinforces knowledge without meaningful token cost.
- Pointer to test spec template asset (if created)
Asset: `assets/local-info-agent-testSpec.yaml` — example test spec
showing format and expectations. Referenced from this file, not embedded.

Architecture is decided and pressure-tested. See **Section 11 (Active
Work Items)** for the prioritized backlog of next steps.

---

## 11. Active Work Items

These are the tasks that need to happen next, with explicit status.
Sessions should consult this section to determine what to work on.

1. **[DONE — Session 5]** Write SKILL.md (router).
   - Completed and reviewed. Sub-agent routing eval passed all 9 steel
     threads. File is at `agent-script-skill/SKILL.md`.

2. **[DONE — Session 5, File 1]** Targeted domain reads — read source
   material before writing each reference file. NOT bulk — read on
   demand per file.
   - **File 1 (Core Language):** COMPLETED. Six sources read including
     `.a4drules` (authoritative), 14 official docs, Local Info Agent,
     language essentials recipes, Session 1 draft, and Jag's reference.
     Five source conflicts identified and resolved. Findings captured
     in `claude-collaboration/rf1-context.md`. Writing prompt created
     at `claude-collaboration/reference-file-1-prompt.md`.
   - **Reading plan for remaining files:**
     - **File 2 (Design & Agent Spec):** COMPLETED. Six sources read:
       official Agent Script docs (14 files, for grounding), `.a4drules`
       (authoritative), Jag's fsm-architecture.md and
       instruction-resolution.md, 8 architectural pattern recipes,
       Local Info Agent source. Four source conflicts identified and
       resolved. Findings captured in `claude-collaboration/rf2-context.md`.
       Writing prompt created at
       `claude-collaboration/reference-file-2-prompt.md`.
       NOTE: `salesforcedocs/agent-dx/` agent spec references are OUTDATED
       and unrelated — ignored per Vivek's directive.
     - **File 3 (Validation & Debugging):** COMPLETED. Three
       authoritative `.a4drules` sources read (preview-rules,
       debugging-rules, script-rules partial), AFDX docs (elevated
       to OFFICIAL after update), Jag's debugging-guide.md, RF1/RF2
       boundary checks. Five conflict resolutions documented. Real
       trace data validated against 3 fresh sessions. Findings in
       `claude-collaboration/rf3-context.md`. Writing prompt at
       `claude-collaboration/reference-file-3-prompt.md`.
     - **File 4 (Metadata & Lifecycle):** AFDX metadata docs
       (`salesforcedocs/.../agent-dx-metadata.md`,
       `agent-dx-nga-authbundle.md`, `agent-dx-manage.md`), deploy/publish
       docs (`agent-dx-nga-publish.md`)
     - **File 5 (Test Authoring):** Testing docs
       (`salesforcedocs/.../agent-dx-test*.md`), testing metadata
       reference, existing test spec example
       (`specs/Local_Info_Agent-testSpec.yaml`), Jag's testing-guide.md

3. **[IN PROGRESS — File 3 complete, File 4 next]** Write reference files —
   one at a time, sequentially, with Vivek review between each.
   - **Order:** File 1 (Core Language) → File 2 (Design & Agent Spec)
     → File 3 (Validation & Debugging) → File 4 (Metadata & Lifecycle)
     → File 5 (Test Authoring)
   - **File 1 (Core Language):** DONE. 1,017 lines. Reviewed and
     accepted across Sessions 5-6.
   - **File 2 (Design & Agent Spec):** DONE. Collaborative section-by-
     section review completed (Sessions 7-8). Adversarial sub-agent
     review (v2) run, findings triaged with Vivek, actionable items
     applied. Review findings captured in rf2-context.md.
   - **File 3 (Validation & Debugging):** DONE. ~680 lines. Sub-agent
     first draft, collaborative section-by-section review (Sessions
     9-10), adversarial sub-agent review passed with no critical
     findings. Key corrections: fabricated validation output replaced
     with real CLI output, Pattern 5 (post-action logic) cut as
     fabricated, behavioral loops rewritten with real scenario,
     grounding guidance corrected (checker runs in both preview modes).
     Source citations stripped. Review findings in rf3-context.md.
   - **Per-file acceptance criteria:** (a) Content matches the scope
     defined in the File Inventory (Section 10). (b) TOC at top.
     (c) Target 300 lines; if exceeding, justify the overage.
     (d) Anti-patterns use WRONG/RIGHT pairs (Design Principle 2).
     (e) Structural format is consistent across all files (Design
     Principle 4). (f) Small duplications of CLI commands across files
     are intentional — do not deduplicate.

4. **[READY]** Create/annotate assets — annotated Local Info Agent
   example, test spec template, generative agent templates.
   - **Acceptance criteria:** (a) `local-info-agent-annotated.agent`
     shows all major constructs with inline comments explaining why,
     not just what. (b) `local-info-agent-testSpec.yaml` is a working
     example of the test spec format. (c) Generative templates are
     minimal, uncommented, designed to be copied and modified.

5. **[BLOCKED — needs written skill files]** Validate skill against
   steel threads — run each ST's prompt against the completed skill
   and evaluate against acceptance criteria in `steel-threads.md`.
   - **Validation methodology:** TBD (relates to Item 7).

6. **[RESOLVED — Session 4]** First draft disposition — Vivek decided
   to start fresh. The Session 1 draft (499 lines) was written before
   the router model decision and has domain knowledge in the body.
   It may be useful as a source when writing reference files, but is
   not being reviewed or iterated on.

7. **[FUTURE]** Evaluation approach — systematic testing methodology
   for the skill. Relates to skill-creator's Eval and Benchmark modes.

8. **[FUTURE]** Agent Script Skill Validator — separate skill for
   ongoing platform validation. See Section 11.1.

9. **[FUTURE]** Mermaid diagram conventions placement — discovered
   `agent-script-recipes/.airules/MERMAID_DIAGRAMS.md` (380 lines of
   detailed conventions for producing Topic Map diagrams). Currently
   referenced as a skill asset in RF2, but the content is more
   instructional than a passive template. Needs decision: skill asset
   (`assets/mermaid-conventions.md`) vs. dedicated reference file.
   Choosing reference file would require revisiting the knowledge
   category model. Review after all planned RFs are complete.

## 11.1 Future Workstreams

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

## 12. Guiding Cautions

- **Don't rush.** Build incrementally, check in with Vivek, let him push back.
- **Don't use `afdx-pro-code-testdrive/temp/` files** without asking Vivek first — stale content.
- **Don't assume other teams' approaches are correct** — evaluate against our principles.
- **Don't produce finished artifacts without collaborative iteration** — the process
  matters as much as the output (Objective 3).
- **Verify file paths** before sending agents to explore them — check accessibility first.
- **Prose over tables for LLM-consumed content.** Tables require spatial reasoning
  that LLMs handle unreliably. This applies to this document and to the skill
  itself. If a sub-agent or reviewer suggests converting prose to tables, reject it.

### Sub-Agent Review Rules

Sub-agents (spawned for reviews, research, or validation) are useful for finding
problems but dangerous for prescribing fixes. These rules were established in
Session 4 after a sub-agent recommended changes that contradicted decisions
already made and validated in earlier sessions.

1. **Sub-agents don't have session history.** They will recommend changes that
   contradict recorded decisions. Every sub-agent recommendation must be filtered
   against Sections 7 (Key Decisions), 10 (Architecture Decision), and the
   Terminology glossary before applying.
2. **Separate "what's broken" from "how to fix it."** Sub-agent problem
   identification is usually accurate. Their proposed fixes may violate
   constraints they can't see. Treat findings as hypotheses, not directives.
3. **After applying sub-agent-recommended changes, do a targeted self-review**
   against the Terminology glossary and key decisions — not another sub-agent
   pass. The filter needs session context that sub-agents lack.
4. **Content changes require a line-level accuracy check.** References like
   "above" vs "below," section numbers, and cross-references break easily
   during restructuring. Verify these manually after every batch of edits.

---

## 12.1 Working Files for Reference File Authoring

These files support the writing of individual reference files. They
capture domain read findings, conflict resolutions, finalized outlines,
and self-contained writing prompts. Read the relevant files before
writing or revising a reference file.

**Reference File 1 (Core Language):**
- `claude-collaboration/rf1-context.md` — Working context: all sources
  read, conflict resolutions (decided), content scope, finalized
  13-section outline with ordering rationale, and writing insights.
  Read this before writing or revising the file.
- `claude-collaboration/reference-file-1-prompt.md` — Self-contained
  writing prompt with source priority hierarchy, finalized outline,
  conflict resolutions, writing rules, scope boundaries, and a
  10-point quality checklist. Can be used by the primary agent or a
  sub-agent to write the file independently.

**Reference File 2 (Design & Agent Spec):**
- `claude-collaboration/rf2-context.md` — Working context: all sources
  read, 4 conflict resolutions, content scope, finalized 8-section
  outline with ordering rationale, writing insights, and review findings
  (section-by-section decisions + adversarial review triage).
- `claude-collaboration/reference-file-2-prompt.md` — Self-contained
  writing prompt used by sub-agent to produce the first draft.
- `claude-collaboration/rf-review-prompt.md` — Generic 4-dimension
  review framework, reusable across all reference files and by other PMs.
- `claude-collaboration/rf2-review-prompt.md` — Self-contained adversarial
  review prompt with RF2-specific custom evaluations.
- `claude-collaboration/rf2-analysis-report.md` — Adversarial review (v2)
  output, modified by Vivek with triage notes.
- `claude-collaboration/rf2-analysis-report-v1-soft.md` — Backup of
  discarded v1 (soft) review report, kept for comparison.

**Reference File 3 (Validation & Debugging):**
- `claude-collaboration/rf3-context.md` — Working context: all sources
  read, 5 conflict resolutions, content scope, finalized 6-section
  outline with ordering rationale, writing insights, and review findings
  (section-by-section decisions + adversarial review triage).
- `claude-collaboration/reference-file-3-prompt.md` — Self-contained
  writing prompt used by sub-agent to produce the first draft.
- `claude-collaboration/rf3-review-prompt.md` — Self-contained adversarial
  review prompt with RF3-specific custom evaluations (7 custom checks).
- `claude-collaboration/rf3-analysis-report.md` — Adversarial review
  output, no critical findings, 3 MEDIUM items triaged with Vivek.

**Reference Files 4-5:** Working context and prompts to be created
following the same pattern as Files 1-3.

---

## 13. Session Log

### How to Write a Session Log Entry

Use this structure for consistency across sessions:

```
### Session N — Date

**Outputs**: [Concrete artifacts created or modified]

**Key decisions**: [Decisions made, with rationale if not captured elsewhere]

**What's unresolved**: [Status of work carrying into the next session]

**Files modified**: [Paths of files changed or added]
```

### Session 1 — February 13, 2026

**Outputs**:
- First draft of Agent Script skill (SKILL.md + 4 reference files)
- This collaboration-context.md document
- Revised AGENT_SCRIPT_SKILL_PROMPT.md (session-opener template)
- Updated file paths across `claude-collaboration/` to include
  `afdx-pro-code-testdrive/` prefix for multi-repo mount support

**Key decisions**:
- YAML frontmatter `description` must be single-line quoted string
  (folded scalars break the parser)
- AI Platform team's approach identified as counter-example
- Three-objective framework established (build skill, build expertise,
  create repeatable framework)

**Key mistake**: Moved too fast on first draft — produced without
collaborative iteration. Acknowledged; future work is incremental.

**What's unresolved**: North stars, Jag's repo review, section-by-section
SKILL.md review, reference file verification, evaluation approach.

### Session 2 — February 14-15, 2026

**Outputs**:
- North Stars defined (Section 3)
- Steel threads ST1-ST9 defined and refined (see `steel-threads.md`)
- Agent Spec established as first-class AFDX artifact (Section 4)
- Execution contexts and agent lifecycle documented (Section 4)
- Design Principles and Skill Architecture Principles codified
  (Sections 5-6)
- Jag's sf-ai-agentscript skill reviewed (Section 6, Section 8)
- Resource Inventory created (Section 9)
- Reference file architecture planning initiated (Section 10, partial)

**Key decisions**:
- Agent Spec is official AFDX artifact, required for most operations
- "Agent Script execution model" is preferred terminology (not "Atlas
  Reasoning Engine" or bare "execution model")
- Prompts should be action-oriented; acceptance criteria outcome-focused
- `AiAuthoringBundle` spelled out (not "AAB") since the dev agent is audience
- Deploy pipeline is three steps: deploy → publish → activate

**What's unresolved**: Reference file architecture (continued in Session 3).

**Context note**: Session 2 ran out of context. Decisions and findings
were preserved in Sections 3-10 of this document. A continuation session
completed the reference file architecture research (see Session 3).

### Session 3 — February 16-17, 2026

**Outputs**:
- Reference file architecture research completed (Section 10):
  Built-in skills audit, Agent Skills spec review, skill-creator analysis
- Knowledge categories defined (8 categories, A-H)
- Binary ST × category mapping matrix
- Cluster analysis and 5-reference-file architecture decided
- Router model for SKILL.md confirmed
- File inventory sketched (5 reference files + assets)
- Per-file and cross-inventory pressure tests completed (all PASS)
- Collaboration-context.md restructured per context engineering research
  (Quick Start guide, Active Work Items,
  Trigger Precision Guide, session log template)

**Key decisions**:
- SKILL.md is a router (no domain knowledge in body)
- 5 reference files: Core Language (A+B), Design & Agent Spec
  (C+D), Validation & Debugging (E+F), Metadata & Lifecycle (G),
  Test Authoring (H)
- Agent Spec as first-class artifact reinforced (backing logic analysis
  merged into Agent Spec Production — never a standalone activity)
- Annotated Local Info Agent as canonical example + generative templates
  in assets
- `sf agent generate test-spec` is anti-pattern for agentic use
- Small duplications across reference files are intentional reinforcement
- TOC standard for all reference files
- Token cost is the real metric, not file read count

**What's unresolved**: Writing the actual skill files (see Section 11
Active Work Items)

**Files modified**: `collaboration-context.md`, `steel-threads.md`

### Session 4 — February 17, 2026

**Outputs**:
- Antagonistic review of collaboration-context.md (8-dimension rubric,
  scored 20/40 pre-fixes)
- Document hardened for cold-start sessions — all 9 review findings addressed
- Sub-Agent Review Rules established (Section 12) after sub-agent
  recommended table format that contradicted Session 3 prose decision

**Key changes**:
- Section 10 restructured: decision summary at top,
  research moved to "Source Research (Deep Dive)" subsection below
- Removed redundant "Architecture Decision" and "Implementation Status"
  subsections from Section 10 (decision is now at top; status is in
  Section 11)
- Section 11 work items expanded with acceptance criteria, reading plans
  per reference file, and explicit triggers/blockers
- Section 6.1 added: Constraints vs. Goals Matrix (authoritative source
  for what's mandatory vs. preferred)
- Terminology glossary added after Quick Start (canonical names for
  Agent Script, Agent Spec, AiAuthoringBundle, etc.)
- Quick Start updated: Sections 4-9 disambiguated by task type
- ST × category matrix tightened (kept as prose — tables are unreliable
  for LLM consumption; sub-agent recommendation to use tables was rejected)
- Stale status markers fixed: Jag review ([NOT YET] → [REVIEWED]),
  steel threads status updated, cross-cutting concerns tagged
- Candidate partitioning dimensions marked as rejected with reasons

**What's unresolved**: Writing the actual skill files (see Section 11
Active Work Items). Next task is Item 1: Write SKILL.md (router).

**Files modified**: `collaboration-context.md`

### Sessions 5-6 — February 17-18, 2026

**Outputs**:
- SKILL.md (router) written and reviewed, sub-agent routing eval passed
  all 9 steel threads
- RF1 (Core Language) written by sub-agent, reviewed collaboratively
  with Vivek across multiple sessions, accepted at 1,017 lines
- RF2 domain reads completed across 6 source categories
- rf2-context.md created with sources, 4 conflict resolutions, 8-section
  outline, and key writing insights
- reference-file-2-prompt.md created
- RF2 first draft written by sub-agent (727 lines)

**Key decisions**:
- `@topic.X` delegation does NOT implement automatic call-return semantics
  (Conflict #3 resolved via official docs analysis)
- `salesforcedocs/agent-dx/` agent spec references are OUTDATED and must
  be ignored; our Agent Spec is our own design artifact
- `sf agent generate agent-spec` does not currently produce a starter
  spec; we must include a starter spec template as a skill asset
- RF2 anti-patterns use inline WRONG/RIGHT pairs (not a capstone section)
- RF2 tone must be authoritative and direct for the consuming agent

**What's unresolved**: RF2 collaborative review in progress (Sections
1-4 reviewed, Sections 5-8 in progress). Mermaid conventions placement
TBD (asset vs. reference file — see Work Item 9).

**Files modified**: `agent-script-skill/SKILL.md`,
`agent-script-skill/references/agent-script-core-language.md`,
`agent-script-skill/references/agent-design-and-spec-creation.md`,
`claude-collaboration/rf1-context.md`,
`claude-collaboration/rf2-context.md`,
`claude-collaboration/reference-file-1-prompt.md`,
`claude-collaboration/reference-file-2-prompt.md`,
`claude-collaboration/collaboration-context.md`

### Sessions 7-8 — February 18-19, 2026

**Outputs**:
- RF2 collaborative section-by-section review completed (Sections 5-8)
- Adversarial sub-agent review framework created (reusable for other PMs)
- Two sub-agent review passes run; v1 discarded, v2 findings triaged
- RF1 action reference tagging fixes (3 violations in anti-patterns)
- rf2-context.md updated with review findings
- Sample asset creation deferred to post-RF5

**Key decisions**:
- Section 6/7 separation: Section 6 = classification (WHEN), Section 7 =
  mechanisms (HOW). No back-references from 7→6.
- Section 8 loop prevention: unified explanation with three concrete
  bullets. "No `available when` gate" = action stays visible (explicit
  mechanism, not abstract state).
- Stub flow: 5 sequential steps. Use `sfdx-project.json` to find default
  package directory (don't hardcode `force-app`). Use CLI to generate
  class files. Deploy one class at a time.
- Sub-agent review methodology: adversarial stance, collaboration context
  banned as source, design artifacts marked UNVERIFIABLE, permitted sources
  explicitly listed. This process is documented in rf-review-prompt.md and
  rf2-review-prompt.md for reuse by other PMs (Objective 3).
- Dismissed v2 findings about boolean capitalization, `before_reasoning`
  definitions, and "Topic used before introduced" — RF1 is always loaded
  as prerequisite per SKILL.md.
- Sample assets deferred to after all RFs are complete.

**What's unresolved**: RF3 (Validation & Debugging) is next. Sample
asset creation planned for post-RF5.

**Files modified**: `agent-script-skill/references/agent-design-and-spec-creation.md`,
`agent-script-skill/references/agent-script-core-language.md`,
`claude-collaboration/rf2-context.md`,
`claude-collaboration/rf-review-prompt.md`,
`claude-collaboration/rf2-review-prompt.md`,
`claude-collaboration/rf2-analysis-report.md`,
`claude-collaboration/rf2-analysis-report-v1-soft.md`,
`claude-collaboration/collaboration-context.md`

### Sessions 9-10 — February 19, 2026

**Outputs**:
- RF3 (Validation & Debugging) written, reviewed, and accepted (~680 lines)
- AFDX docs evaluated after update — elevated from "OUT OF DATE" to
  "OFFICIAL DOCUMENTATION"
- rf3-context.md created with sources, conflict resolutions, outline,
  and review findings
- reference-file-3-prompt.md created
- rf3-review-prompt.md created (7 custom evaluations)
- rf3-analysis-report.md produced (no critical findings)
- Cowork rendering bug workaround discovered (later fixed by Anthropic)

**Key decisions**:
- AFDX doc (`agent-dx-nga-preview.md`) elevated to OFFICIAL but
  `.a4drules` remains authoritative for programmatic depth
- Validation output: don't prescribe rigid error structure — CLI error
  format changes frequently
- Pattern 5 (Post-Action Logic Not Running) cut — premise was fabricated.
  `@outputs` only valid in post-action context.
- Behavioral loops rewritten with real `local_events` scenario instead
  of theoretical example
- Grounding checker runs in both preview modes — simulated outputs
  trigger false failures. Previous claim that checker "only runs against
  live action outputs" was incorrect.
- "simulated mode" / "live mode" → "simulated preview mode" / "live
  preview mode" throughout RF3
- No markdown tables — project convention is bullet lists
- Cross-RF references (e.g., pointing to RF1 for `available when`)
  skipped — unclear how cross-RF references work with skills
- All remaining code examples validated against authoritative sources
  after Pattern 5 discovery

**What's unresolved**: RF4 (Metadata & Lifecycle) is next.

**Files modified**: `agent-script-skill/references/agent-validation-and-debugging.md`,
`claude-collaboration/rf3-context.md`,
`claude-collaboration/reference-file-3-prompt.md`,
`claude-collaboration/rf3-review-prompt.md`,
`claude-collaboration/rf3-analysis-report.md`,
`claude-collaboration/collaboration-context.md`
