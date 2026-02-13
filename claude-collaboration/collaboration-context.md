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

## 3. North Stars [UNRESOLVED]

We have not yet defined the north stars for this project. This was flagged as an open
item during Session 1 but not yet addressed.

Future sessions: help Vivek define these. North stars should answer "what are the
non-negotiable principles that guide every decision we make on this skill?"

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

## 6. Key Decisions Made

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

## 7. Competitive Landscape

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

**Status**: Need to get repo access to review. Options:
- Start a new Cowork session with his repo folder mounted
- Copy relevant skill files into our workspace
- Vivek uploads specific files to a chat message

---

## 8. Open Questions

1. **North stars** — What are the non-negotiable principles for this skill? [UNRESOLVED]
2. **Jag's skills** — Need to review and compare. What patterns does he use that we should
   adopt? What should we avoid? [BLOCKED on repo access]
3. **First draft review** — SKILL.md needs section-by-section review with Vivek
4. **Reference file verification** — The four reference files were written but never read
   back. Need to verify they're accurate.
5. **Evaluation approach** — How will we test the skill? The context doc suggests specific
   prompts + validation, but we haven't set this up yet.

---

## 9. Guiding Cautions

- **Don't rush.** Build incrementally, check in with Vivek, let him push back.
- **Don't use `afdx-pro-code-testdrive/temp/` files** without asking Vivek first — stale content.
- **Don't assume other teams' approaches are correct** — evaluate against our principles.
- **Don't produce finished artifacts without collaborative iteration** — the process
  matters as much as the output (Objective 3).
- **Verify file paths** before sending agents to explore them — check accessibility first.

---

## 10. Session Log

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
