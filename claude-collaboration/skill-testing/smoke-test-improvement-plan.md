# Smoke Test Improvement Plan

Based on the Travel_Advisor session retrospective (2026-02-20).

---

## Finding 1: Missing CLI Command Reference (HIGH)

**Problem:** Three failed bash commands during validation. The agent guessed `sf agent validate --source-dir`, then `sf agent validate authoring-bundle --source-dir`, before discovering the correct `--api-name` flag via `--help`. The skill documents Agent Script syntax exhaustively but provides almost no CLI command syntax in the files routed for "Create an Agent."

**Root cause:** RF3 (Validation & Debugging) has the correct `sf agent validate authoring-bundle --api-name <NAME> --json` syntax, but it's not in the "Create an Agent" reading list. The agent skipped it because the task domain only routes to RF1, RF2, RF6, RF3 — and RF3 was listed last, so the agent deferred it to "when I need to debug."

**Fix options:**

A. **Add a CLI Quick Reference section to SKILL.md** — a compact block listing every `sf agent` command with exact syntax. This is always loaded, so the agent always has it. Downside: adds ~20 lines to the router file which currently has zero domain knowledge by design.

B. **Add RF4 (Metadata & Lifecycle) to the "Create an Agent" reading list** — RF4 already has deploy, publish, activate, and validate commands. But it's 649 lines and most of it is irrelevant to a first-time create workflow.

C. **Move the CLI command block into the "Create an Agent" task domain description in SKILL.md** — embed the 4-5 essential commands (validate, deploy bundle, deploy class, publish, activate) directly in the task domain. Not a separate reference file, just a quick-ref inline with the routing.

**Recommendation:** Option C. It respects the "SKILL.md is a router" principle while solving the practical problem. The consuming agent gets the exact commands it needs at routing time. Five lines of CLI syntax is not domain knowledge — it's operational context for the task.

---

## Finding 2: RF4 Not in "Create an Agent" Reading List (HIGH)

**Problem:** Creating `bundle-meta.xml` is a required step of agent creation, but the agent had to discover the format by reading an existing file. RF4 documents bundle metadata but isn't routed for "Create an Agent."

**Root cause:** The "Create an Agent" task domain routes to RF1 (language), RF2 (design), RF6 (diagrams), RF3 (validation). RF4 was designed as a lifecycle reference, not a creation reference. But agent creation IS a lifecycle operation.

**Fix:** Add RF4 to the "Create an Agent" reading list with a scoped note: "Section 2 (Creating an Agent) — directory structure, bundle metadata, sf agent generate authoring-bundle." This tells the agent which section to focus on rather than reading all 649 lines.

---

## Finding 3: Missing Agent Spec Template (MEDIUM)

**Problem:** RF2 Section 1 references `assets/agent-spec-template.md` but this file doesn't exist. The agent had to construct the Agent Spec from the structural description instead.

**Root cause:** We never created this asset. It was in the original plan (work item #4) but we focused on the .agent templates and test spec template.

**Fix:** Create `assets/agent-spec-template.md` with the standard Agent Spec structure: Purpose & Scope, Behavioral Intent, Topic Map (Mermaid placeholder), Variables table, Actions & Backing Logic, Gating Logic, Architecture Pattern, Agent Configuration. Use descriptive placeholder text (same pattern as the .agent templates).

Also: check RF2 for the exact reference and ensure the path matches.

---

## Finding 4: No Backing Logic Selection Guidance (MEDIUM)

**Problem:** The agent initially chose a Prompt Template for hotel recommendations because "hotel recommendations feels like a generative task." The user had to redirect to Apex stubs. The skill explains what each backing type IS but not WHEN to choose each.

**Root cause:** RF2 Section 4 (Backing Logic Analysis) covers analysis methodology and stubbing, but doesn't include a decision framework for type selection.

**Fix:** Add a brief decision framework to RF2 Section 4. Something like:

- **Use Apex when:** The action returns structured data, performs CRUD operations, calls external APIs, or needs stub-first development (Apex stubs are the simplest to create and deploy).
- **Use Flow when:** The action orchestrates multi-step platform operations, sends emails, creates records with complex logic, or leverages existing Flow infrastructure.
- **Use Prompt Template when:** The action generates natural language content using org data as grounding. Prompt Templates cannot be stubbed — they require actual prompt configuration in the org.
- **Default to Apex for stubs:** When the backing logic doesn't exist yet and the developer wants to iterate on the agent before building real backing logic, always use Apex. Apex stubs are a single class file; Flow and Prompt Template stubs require org configuration.

---

## Finding 5: `developer_name` = Directory Name Constraint (MEDIUM)

**Problem:** The constraint that `config.developer_name` must match the AiAuthoringBundle directory name is only documented in the annotated example's inline comments, not in RF1 Section 5 (System and Config Blocks) where config fields are defined.

**Fix:** Add to RF1 Section 5, in the `config` block documentation: "`developer_name` must exactly match the directory name under `aiAuthoringBundles/` (without the `.agent` extension). A mismatch causes deploy failures."

---

## Finding 6: No `default_agent_user` Validation (LOW)

**Problem:** Publish failed because the `default_agent_user` copied from Local_Info_Agent doesn't exist in the current org. The skill doesn't guide the agent to verify this value.

**Fix:** Add a note in RF4's publish section and in RF2's config documentation: "Before publishing, verify the `default_agent_user` exists in the target org. An invalid user causes publish failure." We could suggest a SOQL query, but that's getting into Salesforce admin territory — flagging the risk is probably sufficient.

---

## Finding 7: Agent Spec Should Be Saved to File (LOW)

**Problem:** The Agent Spec was initially presented inline in chat, which was hard to review. The user had to ask for it to be saved as a file.

**Fix:** Add to RF2's Agent Spec production methodology: "Save the Agent Spec as `<AgentName>-AgentSpec.md` in the project directory for review. The Agent Spec is a significant design artifact that benefits from proper rendering, especially the Mermaid Topic Map diagram."

---

## Observations Not in the Retrospective

**The Agent Spec is good.** Hub-and-spoke architecture, correct gating pattern, proper variable scoping, backing logic analysis with NEEDS STUB markers. The design-first workflow is working.

**The Topic Map diagram has a stale reference.** Line 46 of the Agent Spec still shows `backing: Prompt Template` for get_hotels even after the pivot to Apex. This is a minor artifact of the design iteration, but it highlights that the Agent Spec should be updated when design decisions change. Could add a note in RF2: "Update the Agent Spec whenever a design decision changes — the spec is the source of truth."

**The annotated example was the MVP.** The retrospective explicitly calls it "the single most valuable asset." This validates the investment in creating it. The templates were also used (multi-topic as structural starting point).

---

## Implementation Priority for Today

Given the 10:30am demo constraint, I'd prioritize:

1. **Finding 1 (CLI Quick Reference in SKILL.md)** — 5 minutes, eliminates the biggest failure mode
2. **Finding 2 (RF4 in Create reading list)** — 2 minutes, one line change
3. **Finding 5 (developer_name in RF1)** — 5 minutes, one paragraph addition
4. **Finding 3 (Agent Spec template)** — 15 minutes, new asset file

Findings 4, 6, 7 can wait for medium-term.
