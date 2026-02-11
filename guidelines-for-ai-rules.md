# Guidelines for Writing AI Rules Files

Best practices for authoring effective AI rules (e.g., files in `.a4drules/`) that guide LLM agents through CLI workflows. Derived from iterative development of AFDX pro-code rules files.

---

## Core Principles

### 1. Resolve ambiguity, not restate the obvious

The highest-value rules target spots where an LLM would make the wrong choice without guidance. If `--help` already makes something clear, restating it in a rule wastes tokens. Focus on what help text doesn't make obvious: flag interactions, mode selection logic, when to use one approach vs. another.

### 2. Structure for decision-making, not for reading

An LLM doesn't read rules top-to-bottom like a tutorial. It scans for the relevant constraint when making a choice. Use clear headings, bullet lists, and if/then structures. Avoid flowing prose that buries the decision point.

### 3. Encode constraints and sequencing

The most common LLM mistakes are: doing things out of order, omitting required flags, and mixing up mutually exclusive modes. Make dependencies and mutual exclusions explicit.

### 4. State what NOT to do

Negative constraints prevent the most costly errors. LLMs are optimistic by default and will try plausible-but-wrong combinations. Explicit "NEVER do X" rules are often more valuable than "do Y" rules.

### 5. Ground rules in real tool behavior

Derive rules from actual `--help` output and observed behavior, not from memory or abstract documentation. Run the commands, read the help, and validate before writing rules.

### 6. Stay scoped and concise

Token budget is real. Every unnecessary line crowds out lines that matter. A tighter file that covers the decisions an agent actually faces outperforms a comprehensive file that covers everything.

---

## Formatting: Bullet Lists Over Tables

Research on LLM table comprehension (tested across multiple formats and model sizes) shows:

- **Markdown tables score middle-of-the-pack** (~52% accuracy) for structured data comprehension. Key-value bullet lists score significantly higher (~61%).
- **Smaller models are disproportionately affected.** Format choice can swing performance by up to 40% on weaker models, while stronger models are more robust.
- **Tables require cross-column correlation** — the LLM must connect cells across rows and columns. Bullet lists make each rule independently parseable.

**Recommendation:** Use bullet lists for decision logic and constraints. Each bullet should be a self-contained rule that an LLM can apply without correlating it with adjacent content.

```markdown
# Prefer this:
- Use `--authoring-bundle <name>` for a local Agent Script. The name is the directory name under `aiAuthoringBundles/`.
- Use `--api-name <name>` for a published agent in the org. The name is the directory name under `Bots/`.

# Over this:
| Flag | Agent Source | How to Find the Name |
|------|-------------|----------------------|
| `--authoring-bundle <name>` | Local Agent Script | Directory under `aiAuthoringBundles/` |
| `--api-name <name>` | Published agent | Directory under `Bots/` |
```

---

## Handling Defaults and Optional Flags

When a CLI flag has a sensible default (e.g., `--target-org` uses the project default), weaker LLMs often see "required" in help text and try to supply a value — frequently hallucinating one.

**Rules for default-bearing flags:**
- Tell the LLM to omit the flag and rely on the default.
- State the condition under which the flag should be passed (e.g., "ONLY if the user explicitly specifies").
- Provide a recovery path for when no default is configured (e.g., "run `sf org list` and ask the user").
- Remove the flag from code templates so LLMs don't copy-paste and fill in a placeholder.

---

## Overriding Help Text Behavior

Sometimes the right rule for an AI agent contradicts what `--help` says. For example, `--session-id` may be documented as optional (when only one session exists), but AI agents should always provide it because multiple agents may run concurrent sessions.

**When overriding help text:**
- State the rule as an absolute requirement. Do NOT acknowledge the optionality.
- Provide a brief rationale so the rule doesn't feel arbitrary (e.g., "multiple agents may have concurrent sessions").
- Avoid phrasing like "help says optional, but you should always provide it" — weaker LLMs may latch onto "optional" and skip the flag.
- Add a Common Mistake entry with WRONG/CORRECT examples to reinforce the rule.

The rules file should be the authority. If an LLM reads both help text and the rules, the rule should win cleanly without requiring the LLM to reason about which source to trust.

---

## Avoiding False Urgency and Premature Actions

Rules that create urgency ("resources are consumed", "always do X when done") can cause LLMs to act prematurely — ending sessions before the user is finished, cleaning up before results are reviewed, etc.

**Guidelines:**
- Distinguish between "do this when truly complete" and "do this immediately." Use language like "when the conversation is fully complete" rather than "when done."
- If an action is optional, label it as such. Move optional actions out of the core workflow so they don't read as mandatory steps.
- Consider multi-step user interactions. An agent may need to pause, report back, get feedback, and resume. Rules should explicitly permit keeping resources open between interactions.
- Avoid linear workflow framing (Step 1 → Step 2 → Step 3) when the workflow is actually iterative. Use headings that reflect the true relationship (e.g., "Start a Session" / "Send Utterances" / "End a Session (Optional)").

---

## Common Mistakes Section

Every rules file should end with a Common Mistakes section using WRONG/CORRECT code block pairs. This section is high-value for all model sizes because:

- It shows the exact failure pattern, not just an abstract prohibition.
- WRONG/CORRECT pairs are unambiguous — no interpretation required.
- Weaker models benefit from concrete negative examples more than from abstract rules.

**Guidelines for Common Mistakes entries:**
- Focus on high-probability errors. Cut entries for mistakes an LLM is unlikely to make.
- Keep WRONG examples minimal — just enough to show the pattern.
- Add a brief comment on the WRONG line explaining why it's wrong (e.g., `# WRONG — mutually exclusive`).
- One CORRECT example per mistake is sufficient.

---

## Tightening Checklist

After drafting a rules file, review against these questions:

1. **Is this rule stated more than once?** Consolidate to a single location. Redundancy wastes tokens without adding disambiguation value.
2. **Does this rule restate what `--help` already makes clear?** Cut it.
3. **Would an LLM encounter this decision point?** If the flag or option never appears in the programmatic workflow, the rule is defending against a near-zero probability mistake. Cut it.
4. **Can this section be removed without losing a decision-critical constraint?** If yes, cut it.
5. **Are code examples showing more variants than needed?** One template per command is usually enough. Variants belong in the decision logic sections, not duplicated as examples.

---

## References

- [Which Table Format Do LLMs Understand Best?](https://www.improvingagents.com/blog/best-input-data-format-for-llms/) — 11-format comparison, Markdown-KV vs tables
- [Table Meets LLM (SUC Benchmark)](https://arxiv.org/html/2305.13062v4) — Format sensitivity across model sizes
- [Does Prompt Formatting Impact LLM Performance?](https://arxiv.org/html/2411.10541v1) — Up to 40% variance on smaller models
