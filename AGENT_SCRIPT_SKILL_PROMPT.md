# Prompt: Build the Agent Script Skill

> Copy everything below this line into a new Cowork task.

---

## Task

Build a Claude Skill for **Agent Script** — Salesforce's new scripting language for
authoring next-generation AI agents. Agent Script has zero training data in any AI model,
so this Skill must teach Claude everything it needs from scratch.

## Context

Read the file `AGENT_SCRIPT_SKILL_CONTEXT.md` in this folder first. It contains:

- The challenge framing (why this is hard — zero training data)
- Research-backed principles for building effective skills for unknown languages
- Assessment of existing materials and what's missing
- The Skill format specification
- Recommended content architecture with line budgets per section
- Quality criteria and evaluation approach
- Constraints

## What to Build

A Skill directory at the project root:

```
agent-script-skill/
├── SKILL.md                    # Main skill definition (<500 lines)
└── references/
    ├── syntax-rules.md         # Adapted from .a4drules/agent-script-rules-no-edit.md
    ├── preview-rules.md        # Adapted from .a4drules/agent-preview-rules-no-edit.md
    └── testing-rules.md        # Adapted from .a4drules/agent-testing-rules-no-edit.md
```

## Key Requirements

1. **Start with the execution model** — Section 2 of SKILL.md must explain HOW Agent Script
   runs at runtime (the "notional machine"), not just syntax rules. This is the most
   important section. It fills the gap that training data would normally provide.

2. **Interweve grammar and examples** — Don't separate syntax reference from examples.
   Show the grammar production, then immediately show what it looks like in practice.

3. **Include anti-patterns with WHY** — Every WRONG example must explain the failure
   in terms of the execution model, not just "this is invalid syntax."

4. **Use the Local Info Agent as the primary example** — It's at
   `force-app/main/default/aiAuthoringBundles/Local_Info_Agent/Local_Info_Agent.agent`.
   It demonstrates all major constructs: multiple topics, three action types (Apex, Flow,
   Prompt Template), gated actions, variable capture, conditional instructions, template
   variables, guardrail patterns.

5. **Reference files adapt existing content** — The `.a4drules/` files are solid reference
   material. Copy and adapt them into `references/` — don't duplicate content between
   SKILL.md and the reference files. The main SKILL.md should teach concepts and point
   to references for detailed rules.

6. **Format the description field for trigger optimization** — Include all relevant keywords:
   Agent Script, .agent files, authoring bundles, AiAuthoringBundle, NGA, next-gen agents,
   Agentforce agents, pro-code agent authoring. Include anti-triggers for things the skill
   should NOT handle (e.g., Apex classes, Flows, Prompt Templates — those have their own tools).

## Process

1. Read `AGENT_SCRIPT_SKILL_CONTEXT.md` — understand the principles and architecture
2. Read the Local Info Agent source file — understand what correct Agent Script looks like
3. Read the three `.a4drules/` files — understand the existing reference material
4. Write SKILL.md following the content architecture in Section 6 of the context doc
5. Create the reference files by adapting the `.a4drules/` content
6. Validate: Read back the SKILL.md and check it against the quality criteria in Section 7

## What NOT to Do

- Don't register the Skill in any manifest or configuration — I'll handle that
- Don't modify the existing `.a4drules/` files — they're shared with other tools
- Don't create test scripts or evaluation harnesses — we'll do that separately
- Don't exceed 500 lines in SKILL.md — use reference files for detailed content
