# Session Retrospective: Creating the Travel_Advisor Agent

**Date:** 2026-02-20
**Task:** Create a new Agent Script agent called Travel_Advisor from a plain-language description.
**Operator:** Claude Opus 4.6 via Claude Code, guided by the Agent Script skill.
**Prompt:** I want to create a new Agent Script agent called Travel_Advisor that helps users plan trips. It should have topics for flight search, hotel recommendations, and activity suggestions. Flight search should call an Apex action. Hotel recommendations should use a Prompt Template. The agent should collect the user's destination before searching for anything.

---

## Summary of What Was Built

- **Agent Spec** design document (`Travel_Advisor-AgentSpec.md`)
- **Agent Script file** (`Travel_Advisor.agent`) — 6 topics, 2 Apex-backed actions, 1 instruction-driven topic
- **Bundle metadata** (`Travel_Advisor.bundle-meta.xml`)
- **Two Apex stubs** (`SearchFlights.cls`, `GetHotelRecommendations.cls`)

All artifacts were deployed and validated successfully. Publish failed due to an invalid `default_agent_user` — an org configuration issue unrelated to the skill.

---

## Turn-by-Turn Decision Log

### Turn 1: Skill Invocation and Reference File Loading

**What happened:** User described the agent in plain language. I invoked the Agent Script skill, which returned `SKILL.md` — the skill's routing document. SKILL.md correctly identified this as a "Create an Agent" task and directed me to read four reference files:
1. `agent-script-core-language.md`
2. `agent-design-and-spec-creation.md`
3. `agent-topic-map-diagrams.md`
4. `agent-validation-and-debugging.md`

**What I did:** I read the first three in parallel, plus the multi-topic template and annotated example. I also launched an Explore subagent to scan the project for existing backing logic (Apex, Flows, Prompt Templates, AiAuthoringBundles).

**Skill assessment:** SKILL.md was excellent here. The task-domain routing ("Create an Agent → read these files") was clear and actionable. I didn't need to guess which files to read.

**What I did NOT do:** I skipped reading `agent-validation-and-debugging.md` at this stage because I wasn't yet at the validation step. This turned out to be a mistake — it likely contains the correct CLI command syntax for `sf agent validate`, which I had to discover by trial and error later (see Turn 7). **The skill should note that the validation reference file contains CLI command syntax that's needed during the build phase, not just during debugging.**

---

### Turn 2: Design-First Workflow (Agent Spec)

**What happened:** Following the skill's explicit recommendation — *"Produce an Agent Spec... for the user to review before writing any Agent Script code"* — I drafted the Agent Spec inline in my response.

**Decision process:** The skill's `agent-design-and-spec-creation.md` defined the Agent Spec structure clearly: Purpose & Scope, Behavioral Intent, Topic Map (Mermaid), Actions & Backing Logic, Variables, Gating Logic. I followed this structure directly.

**Key design decisions guided by the skill:**
- **Hub-and-spoke architecture** — chosen because the user described three distinct domain topics. The skill's architecture pattern catalog (Section 3 of the design reference) made this choice obvious.
- **Gating pattern** — the user said "collect destination before searching for anything." The skill's gating patterns (Section 7 of the core language reference) provided the exact `available when` + `@utils.setVariables` pattern I needed. The Local Info Agent's `local_events` topic demonstrated this exact two-step collect-then-query pattern.
- **Action loop prevention** — the skill's anti-patterns (Section 12 of core language, Section 8 of design) warned about actions with variable-bound inputs and no post-action instructions. This directly shaped my reasoning instructions, which include explicit "Do NOT call the action again" directives.

**Skill assessment:** The design reference was the most valuable file in the skill. The discovery questions (Section 2) helped me identify what I already knew from the user's prompt vs. what I needed to decide. The architecture pattern catalog made pattern selection mechanical rather than creative. The backing logic analysis methodology (Section 4) gave me a clear framework for documenting what exists vs. what needs stubbing.

**One gap:** The Agent Spec template mentioned in Section 1 (`assets/agent-spec-template.md`) does not actually exist in the assets directory. The skill references it but doesn't provide it. I had to construct the Agent Spec from the structural description in the reference file instead. **The skill should either add this template file or remove the reference to it.**

---

### Turn 3: User Feedback on Spec Presentation

**What happened:** The user couldn't easily read the Agent Spec in the chat interface and asked me to save it as a file.

**Skill assessment:** Not a skill issue — this is a presentation/UX concern. However, **the skill could recommend saving the Agent Spec to a file by default**, since it's a significant design artifact that benefits from proper rendering (especially the Mermaid diagram). A note like "Save the Agent Spec as `<AgentName>-AgentSpec.md` at the project root for review" would be helpful.

---

### Turn 4: User Requests Apex-Only Stubs (No Prompt Templates)

**What happened:** The original design used a Prompt Template (`prompt://Get_Hotel_Recommendations`) for hotel recommendations. The user said they didn't want to create any Prompt Templates and asked to stub everything with Apex.

**Decision process:** The skill's backing logic section (Section 4 of design reference) explicitly states: *"Always use Apex for stubs — do not attempt to hand-craft Flow XML or Prompt Template metadata."* This validated the user's instinct. I changed the hotel action target from `prompt://Get_Hotel_Recommendations` to `apex://GetHotelRecommendations`.

**Skill assessment:** The skill's stubbing guidance was clear and correct. However, **the skill could be more proactive about recommending Apex stubs for all action types during initial design.** When I first designed the agent, I chose a Prompt Template for hotels because the user said "hotel recommendations" (which feels like a generative task). The skill's design reference doesn't provide guidance on *when* to choose Apex vs. Prompt Template vs. Flow — it only describes what each type *is*. A decision matrix ("use Apex when X, use Prompt Template when Y, use Flow when Z") would have prevented the unnecessary round-trip with the user.

---

### Turn 5: Writing the .agent File

**What happened:** I wrote the full `Travel_Advisor.agent` file based on the approved Agent Spec.

**Decision process:** I used the multi-topic template (`assets/template-multi-topic.agent`) as a structural starting point and the annotated Local Info Agent (`assets/local-info-agent-annotated.agent`) as a behavioral reference. Specific decisions:

- **Block ordering** followed the mandatory order from core language Section 2: `system` → `config` → `variables` → `language` → `start_agent` → topics.
- **Variable declaration** used `mutable string = ""` with a description, matching the pattern in core language Section 6.
- **Gating** used `available when @variables.destination != ""` on both Apex-backed actions, matching the pattern in core language Section 10.
- **`@utils.setVariables`** was used identically to the Local Info Agent's `collect_interests` pattern — LLM slot-fill with `...`.
- **Conditional instructions** used `if/else` on `@variables.destination == ""` to provide different guidance depending on whether the destination is known.
- **Anti-loop instructions** included explicit "Do NOT call the action again" directives in each topic that has an action, following core language Section 12.
- **Guardrail topics** (`escalation`, `off_topic`, `ambiguous_question`) were adapted from the annotated example but simplified (no security rules). The skill's topic architecture section (design reference Section 3) defines these as standard guardrail topics.

**Skill assessment:** The combination of the template, annotated example, and reference files gave me everything I needed to write correct Agent Script. The annotated example was particularly valuable — seeing real patterns with inline comments explaining *why* each construct is used was more helpful than the abstract syntax descriptions in the core language reference.

**One concern:** The `config` block in my agent uses `developer_name: "Travel_Advisor"`. The skill says this must match the directory name under `aiAuthoringBundles/`. This constraint is mentioned in the annotated example's comments but NOT in the core language reference's Section 5 (System and Config Blocks). **This critical constraint should be documented in the core language reference where `developer_name` is defined, not just in an example's comments.**

---

### Turn 6: Creating the Bundle Metadata

**What happened:** I read the existing `Local_Info_Agent.bundle-meta.xml` and created an identical one for Travel_Advisor.

**Skill assessment:** The skill's `agent-metadata-and-lifecycle.md` reference file (which I did not read — it wasn't in the "Create an Agent" reading list) presumably documents bundle metadata. But the metadata is trivial (just `<bundleType>AGENT</bundleType>`), so reading the existing file was sufficient. **However, the skill's "Create an Agent" task domain should include the metadata reference file in its reading list**, since creating the bundle-meta.xml is a required step of agent creation.

---

### Turn 7: Generating and Deploying Apex Stubs

**What happened:** I used `sf generate apex class` to scaffold both classes, then replaced the generated bodies with invocable Apex structures following the skill's stubbing methodology (design reference Section 4).

**Skill assessment:** The stubbing workflow was well-documented. The skill told me to:
1. Find the default package directory from `sfdx-project.json`
2. Generate the class with `sf generate apex class`
3. Replace the body with the invocable structure
4. Deploy one class at a time

I followed this exactly and both deployments succeeded on the first try. This was one of the skill's strongest areas — the step-by-step stubbing methodology left no ambiguity.

---

### Turn 8: Validating the Agent — CLI Command Discovery (FAILED, then succeeded)

**What happened:** This was the most problematic step. I attempted three different command syntaxes before finding the right one:

1. **`sf agent validate --source-dir ... --json`** → Error: `agent validate is not a sf command`
2. **`sf agent validate authoring-bundle --source-dir ... --json`** → Error: `Nonexistent flag: --source-dir`
3. **`sf agent validate authoring-bundle --api-name Travel_Advisor --json`** → Success

**Decision process:** After the first failure, I ran `sf help agent` to discover the subcommand structure. After the second failure, I ran `sf agent validate authoring-bundle --help` to discover the correct flags. The third attempt succeeded.

**Skill assessment: This is the skill's biggest gap.** The skill's SKILL.md says to read `agent-validation-and-debugging.md` for validation workflows, but I hadn't read it yet (it wasn't in my immediate reading list since I was still in the "build" phase). More critically, **the skill never provides the exact CLI command syntax for validation anywhere in the files I did read.** The design reference (Section 4) provides deploy command syntax (`sf project deploy start --metadata ApexClass:<ClassName> --json`) but there's no equivalent for the validate command.

**Recommendation:** The skill should include a **CLI Command Quick Reference** section — either in SKILL.md or as a dedicated reference file — listing every `sf agent` command with its exact syntax and flags. Something like:

```
## CLI Commands
- Validate: `sf agent validate authoring-bundle --api-name <NAME> --json`
- Deploy: `sf project deploy start --metadata AiAuthoringBundle:<NAME> --json`
- Publish: `sf agent publish authoring-bundle --api-name <NAME> --json`
- Activate: `sf agent activate --api-name <NAME> --json`
```

Three failed bash commands could have been zero with this information.

---

### Turn 9: Deploying the AiAuthoringBundle

**What happened:** `sf project deploy start --metadata AiAuthoringBundle:Travel_Advisor --json` succeeded. There was a non-blocking warning about SourceMember polling timing out, but the deployment itself was successful.

**Skill assessment:** The deploy command syntax was not explicitly provided in any file I read for the "Create an Agent" workflow. I inferred it from the Apex stub deploy syntax in the design reference. **The skill should document the bundle deploy command explicitly.**

---

### Turn 10: Publishing the Agent (FAILED)

**What happened:** `sf agent publish authoring-bundle --api-name Travel_Advisor --json` failed with:
```
Default agent user afdx-agent@testdrive.org05e7916a-ce7e-4015-b412-20ce15bdc091 could not be found
```

**Decision process:** The `default_agent_user` value was copied from the existing Local Info Agent. This value apparently doesn't resolve in the current org. I attempted to query the org for valid usernames, but the user stopped me at this point.

**Skill assessment:** This failure is partially the skill's responsibility. The skill's config block documentation says `default_agent_user` is required for `AgentforceServiceAgent` type and should be a "Salesforce username." But it doesn't provide guidance on **how to discover valid agent users in an org**. When I asked the user which agent user to use, they said "same as Local_Info_Agent" — a reasonable answer that happened to be wrong for this org.

**Recommendation:** The skill should include a step in the agent creation workflow: *"Before writing the config block, verify the `default_agent_user` exists in the target org. Run `sf data query --query \"SELECT Username FROM User WHERE IsActive = true\" --json` or similar to confirm."* This would catch the issue before deploy/publish rather than after.

---

## Aggregate Skill Assessment

### Where the Skill Excelled

1. **Task routing (SKILL.md)** — The task-domain routing was immediately useful. "Create an Agent → read these files" eliminated guesswork.

2. **Design-first methodology** — The explicit recommendation to produce an Agent Spec before code was the right call. It surfaced the Prompt Template → Apex pivot *before* any code was written, saving rework.

3. **The annotated example** — `local-info-agent-annotated.agent` was the single most valuable asset. Seeing real patterns with inline rationale was more actionable than abstract syntax documentation. Every construct I used in Travel_Advisor had a direct precedent in this file.

4. **Anti-pattern documentation** — Core language Section 12 (Anti-Patterns) and design reference Section 8 (Action Loop Prevention) directly shaped the agent's instructions and gating. Without these, I would likely have written action definitions vulnerable to loops.

5. **Stubbing methodology** — The step-by-step Apex stubbing workflow (design reference Section 4) was clear, correct, and complete. Both stubs deployed successfully on the first try.

6. **Gating patterns** — The gating pattern catalog (design reference Section 7) provided the exact pattern I needed (`available when` + `@utils.setVariables`). The Local Info Agent's `local_events` topic demonstrated this pattern in context.

### Where the Skill Fell Short

1. **Missing CLI command reference** — The skill documents Agent Script syntax exhaustively but provides almost no CLI command syntax. This caused three failed bash commands during validation. Every `sf agent` command used in the agent lifecycle (validate, deploy, publish, activate, deactivate, preview) should be documented with exact syntax and flags.

2. **Missing Agent Spec template file** — The design reference (Section 1) references `assets/agent-spec-template.md` but this file doesn't exist. Either add it or remove the reference.

3. **No backing logic selection guidance** — The skill explains *what* Apex, Flows, and Prompt Templates are, but not *when* to choose each. A decision matrix would prevent unnecessary design iterations (like my Prompt Template → Apex pivot).

4. **`developer_name` constraint underdocumented** — The requirement that `developer_name` must match the AiAuthoringBundle directory name is only mentioned in the annotated example's comments, not in the core language reference where config block fields are defined.

5. **Bundle metadata not in "Create an Agent" reading list** — The `agent-metadata-and-lifecycle.md` file is not listed in the "Create an Agent" task domain's reading list, even though creating the `bundle-meta.xml` is a required step of agent creation.

6. **No `default_agent_user` validation guidance** — The skill doesn't tell you how to verify that the agent user exists in the target org before you hit publish failures.

7. **No recommendation to save Agent Spec as a file** — The skill says to produce an Agent Spec for review but doesn't suggest saving it as a file. In a CLI/chat interface, inline specs are hard to review. A default convention like `<AgentName>-AgentSpec.md` at the project root would improve the workflow.

### Specific Recommendations for the Skill Developer

| Priority | Recommendation | Rationale |
|----------|---------------|-----------|
| **High** | Add a CLI Command Quick Reference with exact `sf agent` command syntax | Caused 3 failed commands; most impactful single improvement |
| **High** | Add `agent-metadata-and-lifecycle.md` to the "Create an Agent" reading list | Bundle metadata creation is a required step of agent creation |
| **Medium** | Add the missing `assets/agent-spec-template.md` file (or remove the reference) | Broken reference erodes trust in the skill's documentation |
| **Medium** | Document `developer_name` = directory name constraint in core language Section 5 | Critical constraint only documented in example comments |
| **Medium** | Add a backing logic selection decision matrix to the design reference | Would prevent unnecessary design pivots |
| **Low** | Add `default_agent_user` validation step to the creation workflow | Would catch publish failures earlier |
| **Low** | Recommend saving Agent Spec to a file by default | Improves reviewability in CLI/chat environments |

---

## Failed Commands Log

| # | Command | Error | Root Cause | Resolution |
|---|---------|-------|------------|------------|
| 1 | `sf agent validate --source-dir ... --json` | `agent validate is not a sf command` | `validate` is a topic, not a command; needs subcommand `authoring-bundle` | Ran `sf help agent` to discover subcommand structure |
| 2 | `sf agent validate authoring-bundle --source-dir ... --json` | `Nonexistent flag: --source-dir` | The command uses `--api-name`, not `--source-dir` | Ran `--help` to discover correct flags |
| 3 | `sf agent publish authoring-bundle --api-name Travel_Advisor --json` | `Default agent user ... could not be found` | The `default_agent_user` from Local_Info_Agent doesn't exist in the current org | User stopped the session; needs org-specific username |
| 4 | `sf org display --json` | User rejected the tool call | User said "Please stop" — did not want further troubleshooting | Session ended |

---

## Files Created During This Session

| File | Purpose |
|------|---------|
| `Travel_Advisor-AgentSpec.md` | Agent design document |
| `force-app/main/default/aiAuthoringBundles/Travel_Advisor/Travel_Advisor.agent` | Agent Script file |
| `force-app/main/default/aiAuthoringBundles/Travel_Advisor/Travel_Advisor.bundle-meta.xml` | Bundle metadata |
| `force-app/main/default/classes/SearchFlights.cls` | Invocable Apex stub for flight search |
| `force-app/main/default/classes/SearchFlights.cls-meta.xml` | Apex class metadata (auto-generated) |
| `force-app/main/default/classes/GetHotelRecommendations.cls` | Invocable Apex stub for hotel recommendations |
| `force-app/main/default/classes/GetHotelRecommendations.cls-meta.xml` | Apex class metadata (auto-generated) |
