# Writing Prompt: Reference File 4 — Metadata & Lifecycle

> **Output file**: `afdx-pro-code-testdrive/agent-script-skill/references/agent-metadata-and-lifecycle.md`
>
> **What you are building**: The metadata and lifecycle reference file
> for a Claude Skill that teaches a consuming AI agent how to locate
> agents, generate new ones, deploy, publish, activate, delete, rename,
> and manage test lifecycle. The reader already knows syntax (RF1),
> design patterns (RF2), and debugging (RF3). This file teaches the
> operational procedures: how to go from Agent Script code to a running
> agent and how to manage it through its lifecycle.

---

## Step 0: Read Before Writing

Read these files in this exact order before writing anything. Each builds
on the previous.

1. **Project context** — understand the full skill architecture:
   `afdx-pro-code-testdrive/claude-collaboration/collaboration-context.md`

2. **SKILL.md (router)** — understand how the consuming agent arrives at
   this file:
   `afdx-pro-code-testdrive/agent-script-skill/SKILL.md`

3. **Refined working context for this file** — contains the finalized
   outline, all confirmed facts (26 total from 5 experiments), writing
   insights, error inventory, and the conceptual foundation. This is the
   single source of truth for RF4 content:
   `afdx-pro-code-testdrive/claude-collaboration/rf4-context-refined.md`

4. **Reference File 1 (Core Language)** — understand what the reader
   already knows. RF4 must not re-teach syntax or execution model:
   `afdx-pro-code-testdrive/agent-script-skill/references/agent-script-core-language.md`

5. **Reference File 2 (Design & Agent Spec)** — understand what the reader
   already knows about design, Agent Spec, and backing logic analysis:
   `afdx-pro-code-testdrive/agent-script-skill/references/agent-design-and-spec-creation.md`

6. **Reference File 3 (Validation & Debugging)** — understand what the
   reader already knows about validation, preview, and debugging. RF4
   must not re-teach these. Note RF3's references to deploying and
   published agents — RF4 provides the actual procedures:
   `afdx-pro-code-testdrive/agent-script-skill/references/agent-validation-and-debugging.md`

7. **Steel threads** — acceptance scenarios the complete skill must satisfy.
   Pay attention to ST2 (Comprehend), ST6 (Deploy), ST7 (Delete), ST8
   (Rename), and ST9 (Test) which load RF4:
   `afdx-pro-code-testdrive/claude-collaboration/steel-threads.md`

---

## Step 1: Domain Reads

Read these source files to extract content. The AUTHORITATIVE sources are
listed first. The refined context file (`rf4-context-refined.md`) contains
26 confirmed facts validated through live experiments. When conflicts arise
between source docs and confirmed facts, the confirmed facts take precedence.

### Source Priority

**AUTHORITATIVE** (prioritize over all other sources):

1. `.a4drules/agent-script-rules-no-edit.md` (lines 54-71)
   Lifecycle operations: metadata locations via `sfdx-project.json`,
   critical deploy caution ("NEVER deploy `.agent` or `AiAuthoringBundle`
   metadata unless explicitly asked").

2. `.a4drules/agent-testing-rules-no-edit.md` (281 lines)
   Full test rules: `sf agent test create --spec <path>`,
   `sf agent test run --name <NAME> --api-name <Bot_API_Name>`,
   `sf agent test resume --job-id <id>`. `AiEvaluationDefinition`
   metadata. Common test mistakes with WRONG/RIGHT pairs.

**EXPERIMENT-CONFIRMED FACTS** (override source docs when they conflict):

3. `rf4-context-refined.md` Section D — 26 confirmed facts from live
   experiments (RQ1-RQ5) and domain expert (Vivek) clarifications.
   These facts were validated against a real Salesforce scratch org and
   represent ground truth for RF4. Key experiment-sourced facts:
   - Deploy validation depth (Fact 4, RQ2)
   - Post-publish seamless workflow (Fact 19, RQ3 + Vivek)
   - Deploy vs. publish distinction (Facts 15a/15b, RQ4)
   - Publish self-containment (Fact 13, RQ4)
   - Version-suffixed AAB immutability (Fact 20, RQ5)
   - Wildcard retrieve for version history (Fact 21, RQ5)
   - Published agent deletion impossibility (Fact 24, RQ4)

**OFFICIAL DOCUMENTATION** (grounding for authoritative claims):

4. `salesforcedocs/.../guides/agentforce/agent-dx/agent-dx-metadata.md` (47 lines)
   — Agent metadata hierarchy. `AiAuthoringBundle` structure.

5. `salesforcedocs/.../guides/agentforce/agent-dx/agent-dx-nga-authbundle.md` (79 lines)
   — `sf agent generate authoring-bundle` command. What it creates.

6. `salesforcedocs/.../guides/agentforce/agent-dx/agent-dx-nga-publish.md` (83 lines)
   — Publishing workflow. Validates → commits version → hydrates
   Bot/GenAi* metadata → retrieves to local. `<target>` element.

7. `salesforcedocs/.../guides/agentforce/agent-dx/agent-dx-manage.md` (69 lines)
   — `sf agent activate`, `sf agent deactivate`, `sf org open agent`.

8. `salesforcedocs/.../guides/agentforce/agent-dx/agent-dx-synch.md` (118 lines)
   — Deploy/retrieve/delete commands. `Agent` pseudo metadata type.
   Delete behavior details.

9. `salesforcedocs/.../guides/agentforce/agent-dx/agent-dx-test.md` (22 lines)
   — Testing overview. Tests run against activated published agents.

10. `salesforcedocs/.../guides/agentforce/agent-dx/agent-dx-reference.md` (43 lines)
    — Agent spec and test spec YAML property references.

**REAL PUBLISHED METADATA** (use for concrete examples):

11. `force-app/main/default/bots/Local_Info_Agent/Local_Info_Agent.bot-meta.xml`
    — Real Bot container metadata.

12. `force-app/main/default/bots/Local_Info_Agent/v1.botVersion-meta.xml`
    and `v2.botVersion-meta.xml` — Real BotVersion files.

13. `force-app/main/default/genAiPlannerBundles/Local_Info_Agent_v1/Local_Info_Agent_v1.genAiPlannerBundle`
    and `Local_Info_Agent_v2/Local_Info_Agent_v2.genAiPlannerBundle`
    — Real GenAiPlannerBundle files showing version-suffixed naming and
    locally-scoped topic/action components.

14. `force-app/main/default/aiAuthoringBundles/Local_Info_Agent/Local_Info_Agent.bundle-meta.xml`
    — Real bundle-meta.xml showing `<target>Local_Info_Agent.v2</target>`.

15. `sfdx-project.json` — Real project configuration showing package
    directory path.

---

## Step 2: Write the File

### Finalized Outline (7 Sections)

Follow this outline exactly. The ordering was debated and finalized with
the skill author. The refined context file contains the full outline with
cross-references to confirmed facts — use Section C of
`rf4-context-refined.md` as your checklist.

1. **Agent Metadata Structure** — Start with the two-domain entity graph
   (authoring domain vs. runtime domain) from Section B of the refined
   context. Then cover: `AiAuthoringBundle` directory layout (`.agent` +
   `.bundle-meta.xml`), the `<target>` element, `AiEvaluationDefinition`
   for tests, `Agent` pseudo metadata type, how to locate agents in a
   project by reading `sfdx-project.json`. Use real metadata snippets.
   Facts: 5, 6, 10, 18.

2. **Agent Metadata Lifecycle: Generate → Deploy → Publish → Activate → Test** — Conceptual overview of the full lifecycle chain. Each step's
   purpose in 1-2 sentences. Key distinction: authoring domain (AAB =
   developer's source) vs. runtime domain (Bot/GenAi* = org's
   representation). Deploy populates the authoring domain; publish
   populates the runtime domain. This section is the "execution model"
   equivalent for lifecycle operations. Facts: 14, 15a, 15b.

3. **Creating an Agent** — `sf agent generate authoring-bundle` with
   REQUIRED flags: `--no-spec`, `--name "<Label>"`, `--api-name
   <Developer_Name>`. What the command creates (two files). What the
   generated boilerplate contains. Failure modes: omitting `--no-spec`
   (waits for spec file), confusing `--name`/`--api-name`, omitting
   flags (interactive prompts). WRONG/RIGHT pairs for each.
   Facts: 5, 6, 7.

4. **Working With Authoring Bundles** — This is the highest-value
   section in RF4. The hidden behaviors and non-obvious oddities that no
   source documentation covers. Must include:
   - "Naked" AAB always points to highest DRAFT (Fact 18)
   - Version-suffixed AABs are frozen published snapshots (Fact 20)
   - First deploy creates DRAFT V1 (Fact 11)
   - No pro-code way to create new draft versions (Fact 12)
   - Deploy-before-publish for pro-code/low-code collaboration (Fact 8)
   - `.a4drules` caution: NEVER deploy AAB in routine ops (Fact 8b)
   - `default_agent_user` requires Einstein Agent license (Fact 3);
     immutable after first publish (Fact 3a); misleading error if wrong
   - Two validation layers: compile vs. API (Fact 3c)
   - Deploy validates via Invocable Action lookup only — parameter
     types NOT checked (Fact 4). Stub classes sufficient but risky.
   - Post-publish workflow is seamless (Fact 19, happy path)
   - `<target>` edge case: retrieve after publish locks AAB (Fact 19-edge)
   - Server-side filename versioning triggers CLI warning (Fact 10)
   WRONG/RIGHT pairs: non-Einstein-Agent user, editing version-suffixed
   AAB, retrieving published AAB and deploying with changes, assuming
   deploy validates parameter types.

5. **Publishing Authoring Bundles** — Why publish is needed (creates
   runtime domain entities). Publish is SELF-CONTAINED — no prior deploy
   needed (Fact 13). Simplest pipeline: generate → edit → validate →
   publish → activate. What metadata gets created (Bot, BotVersion,
   GenAiPlannerBundle with locally-scoped topics/actions). Post-publish
   behavior: local source unchanged, developer continues editing (Fact
   19). Version inflation when no DRAFT exists (Fact 26). Publish
   response lacks version number — must retrieve to discover it (Fact
   17). Retrieve with `AiAuthoringBundle:` NOT `Agent:` (Fact 16).
   Use real metadata to illustrate version accumulation.

6. **Activating Published Agents** — `sf agent activate --api-name
   <Bot_API_Name>` and `sf agent deactivate`. Only one version active
   at a time. Published agents can ONLY be previewed if activated
   (Fact 1). Required for test execution. Facts: 1, 2.

7. **Lifecycle Operations** — Consolidated CLI reference. This section
   is intentional reinforcement — the consuming agent may arrive here
   directly for a specific operation without reading sections 3-6.
   Subsections:
   - **Deploy**: backing code (routine, excludes agent metadata) vs.
     agent metadata (deliberate). Deploy does NOT create Bot entity
     (Fact 15a). WRONG/RIGHT for accidental AAB deploy.
   - **Retrieve**: `Agent:` pseudo-type. GOTCHA: `Agent:` omits AAB
     (Fact 16). Wildcard for version history:
     `AiAuthoringBundle:Name_*` (Fact 21). Source tracking gap (Fact 22).
   - **Delete**: unpublished AABs (works, but WARNING: also deletes
     local files — Fact 25). Published agents CANNOT be deleted via
     Metadata API (Fact 24). Backing code deletion dependency (Fact 9).
   - **Rename**: advise against. Create-new-and-migrate. Be honest.
   - **Test lifecycle**: `sf agent test create`, `run`, `resume`. Tests
     run against ACTIVATED agents only. WRONG/RIGHT for unpublished.
   - **Open in Builder**: `sf org open authoring-bundle`,
     `sf org open agent --api-name`.

---

## Writing Rules

These are non-negotiable. Violating any of them produces a file that
fails its purpose.

### Audience

The reader is a **consuming AI agent** (an LLM like Claude) that will
use this file to perform lifecycle operations on Agentforce agents.
Every line must change how the agent manages agent metadata and
lifecycle. Do NOT write for human developers browsing a web UI.

### Identity

**CRITICAL**: Agent Script is NOT AppleScript, JavaScript, Python, YAML,
or any other language. The consuming agent has ZERO training data for
Agent Script. Do not assume familiarity with Salesforce metadata
conventions. Explain the metadata hierarchy explicitly.

### Tone

**Procedural and direct.** This is a procedures manual. Use imperative
phrasing: "Run this command," "Deploy backing code first," "Do not
include AiAuthoringBundle in routine deploys." State each procedure as
a clear sequence of steps. No hedging.

### Style

- **Prose over tables.** LLMs process prose more reliably than tabular
  data. Use bullet lists for sequences of steps.
- **WRONG/RIGHT pairs inline.** Place anti-patterns within the section
  where they occur. Minimum: deploy caution (deploying AAB accidentally),
  test target mistake (running tests against unpublished agent), editing
  version-suffixed AAB, using wrong license for `default_agent_user`.
- **All CLI commands use `--json` where applicable.** The consuming
  agent is programmatic. Note: not all lifecycle commands support
  `--json` — use it where available.
- **No analogies to other languages.** Agent Script metadata is unique.
- **Use real metadata from the reference project.** Show actual XML
  snippets to illustrate structure. Keep snippets minimal — enough to
  show key elements, not full file content.

### Source Attribution

**NON-NEGOTIABLE.** Every technical claim must include an inline source
citation in this exact format:

```
[SOURCE: filename (line N)]
```

Examples:
- `[SOURCE: agent-script-rules (line 56)]`
- `[SOURCE: agent-dx-metadata (line 12)]`
- `[SOURCE: agent-testing-rules (line 44)]`

When a claim is grounded by multiple sources, list them:
- `[SOURCE: agent-dx-nga-publish (line 30), agent-dx-synch (line 15)]`

For claims from Vivek's direct clarifications (not in any source doc):
- `[SOURCE: Vivek clarification — published agent preview requires activation]`

For claims validated by live experiments:
- `[SOURCE: RQ2 experiment — deploy validates Invocable Action registry only]`
- `[SOURCE: RQ4 experiment — publish is self-contained]`

For confirmed facts from the refined context:
- `[SOURCE: rf4-context-refined Fact 19 — post-publish workflow is seamless]`

These citations make the file auditable. They will be regex-stripped
(`\[SOURCE:.*?\]`) after review. Do NOT omit them — a claim without a
source citation is an unverifiable claim.

### RF1/RF2/RF3 Conventions (Carry Forward)

These conventions were established during RF1, RF2, and RF3 review.
Follow them exactly:

- **Action reference tagging.** When referencing an action by name inside
  an `instructions:` block, use `{!@actions.action_name}` syntax.
- **Inner-block ordering.** Within `reasoning:` blocks, `instructions:`
  comes before `actions:`.
- **Verbosity principle.** Tighter is better. Every token must earn its
  place.
- **Boolean capitalization.** `True`/`False` (capitalized).
- **No markdown tables.** Use bullet lists per project convention.
- **"simulated preview mode" / "live preview mode"** — use explicit
  full terms when referencing preview modes.

### Scope Boundaries

Content that belongs in OTHER reference files — do NOT include it here:

- Agent Script syntax, block structure, execution model → RF1 (Core Language)
- Design patterns, Agent Spec, topic architecture → RF2 (Design & Agent Spec)
- Validation, preview workflow, debugging, traces → RF3 (Validation & Debugging)
- Test spec authoring and result interpretation → RF5 (Test Authoring)

When RF4 references concepts from other files (e.g., "deploy before
you can preview" references RF3's preview workflow), state the
operational step and trust the reader to know the concept.

### Target Length

~350 lines. RF4 has 7 sections covering more ground than RF3's 6
sections, and Section 4 (Working With Authoring Bundles) is
information-dense with behaviors undocumented anywhere else. Moderate
overage is expected. If exceeding 400 lines, check for verbose
preambles or unnecessary XML that could be trimmed.

---

## Quality Checks (Self-Verify Before Delivering)

After writing, verify the file against these criteria:

1. Do all 7 sections appear in the correct order per the outline?
2. Does Section 1 present the two-domain entity graph (authoring domain
   vs. runtime domain) clearly?
3. Does Section 2 establish the deploy vs. publish distinction as
   "which domain does this populate?"
4. Is the deploy caution ("NEVER deploy AiAuthoringBundle unless
   explicitly asked") prominent with a WRONG/RIGHT pair?
5. Is publish presented as self-contained (no prior deploy needed)?
6. Is the post-publish workflow presented as seamless (happy path) with
   the `<target>` edge case clearly marked as "only if you retrieve"?
7. Does Section 4 cover all confirmed facts about AAB oddities
   (Facts 3, 4, 8, 10, 11, 12, 18, 19, 20)?
8. Does the published agent metadata section use real XML snippets
   from the reference project (not fabricated examples)?
9. Is it clear that published metadata files are org-generated and
   NOT to be edited directly?
10. Is the `Agent` pseudo metadata type explained as convenient
    shorthand, with the GOTCHA that it omits AiAuthoringBundle?
11. Does the test lifecycle subsection clearly state that tests run
    against ACTIVATED published agents only?
12. Does every technical claim have a `[SOURCE: ...]` citation?
13. Do all code examples follow RF1/RF2/RF3 conventions?
14. Does the file avoid re-teaching RF1 content (syntax), RF2
    content (design), and RF3 content (validation/debugging)?
15. Could a consuming agent with zero prior Salesforce metadata
    experience use this file to deploy, publish, activate, and
    manage an agent end-to-end?
16. Is every section pulling its weight — no filler, no redundancy?
