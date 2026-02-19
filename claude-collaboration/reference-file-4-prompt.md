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

3. **Working context for this file** — contains the finalized outline, all
   conflict resolutions, content scope, and ordering rationale:
   `afdx-pro-code-testdrive/claude-collaboration/rf4-context.md`

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
listed first. When conflicts arise between sources, follow the conflict
resolutions documented in `rf4-context.md`.

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

**OFFICIAL DOCUMENTATION** (grounding for authoritative claims):

3. `salesforcedocs/.../guides/agentforce/agent-dx/agent-dx-metadata.md` (47 lines)
   — Agent metadata hierarchy (Bot → BotVersion → GenAiPlannerBundle →
   GenAiPlugin → GenAiFunction). `AiAuthoringBundle` structure.

4. `salesforcedocs/.../guides/agentforce/agent-dx/agent-dx-nga-authbundle.md` (79 lines)
   — `sf agent generate authoring-bundle` command. What it creates.

5. `salesforcedocs/.../guides/agentforce/agent-dx/agent-dx-nga-publish.md` (83 lines)
   — Publishing workflow. Validates → commits version → hydrates
   Bot/GenAi* metadata → retrieves to local. `<target>` element.

6. `salesforcedocs/.../guides/agentforce/agent-dx/agent-dx-manage.md` (69 lines)
   — `sf agent activate`, `sf agent deactivate`, `sf org open agent`.

7. `salesforcedocs/.../guides/agentforce/agent-dx/agent-dx-synch.md` (118 lines)
   — Deploy/retrieve/delete commands. `Agent` pseudo metadata type.
   Delete behavior details.

8. `salesforcedocs/.../guides/agentforce/agent-dx/agent-dx-test.md` (22 lines)
   — Testing overview. Tests run against activated published agents.

9. `salesforcedocs/.../guides/agentforce/agent-dx/agent-dx-reference.md` (43 lines)
   — Agent spec and test spec YAML property references.

**REAL PUBLISHED METADATA** (use for concrete examples):

10. `force-app/main/default/bots/Local_Info_Agent/Local_Info_Agent.bot-meta.xml`
    — Real Bot container metadata.

11. `force-app/main/default/bots/Local_Info_Agent/v1.botVersion-meta.xml`
    and `v2.botVersion-meta.xml` — Real BotVersion files.

12. `force-app/main/default/genAiPlannerBundles/Local_Info_Agent_v1/Local_Info_Agent_v1.genAiPlannerBundle`
    and `Local_Info_Agent_v2/Local_Info_Agent_v2.genAiPlannerBundle`
    — Real GenAiPlannerBundle files showing version-suffixed naming and
    org-generated ID suffixes.

13. `force-app/main/default/aiAuthoringBundles/Local_Info_Agent/Local_Info_Agent.bundle-meta.xml`
    — Real bundle-meta.xml showing `<target>Local_Info_Agent.v2</target>`.

14. `sfdx-project.json` — Real project configuration showing package
    directory path.

---

## Step 2: Write the File

### Finalized Outline (8 Sections)

Follow this outline exactly. The ordering was debated and finalized with
the skill author. See `rf4-context.md` for the rationale behind each
positioning decision.

1. **Agent Metadata Structure** — `AiAuthoringBundle` directory layout:
   `.agent` file (Agent Script source) + `.bundle-meta.xml` (metadata).
   Located under `aiAuthoringBundles/<API_Name>/` within the package
   directory from `sfdx-project.json`. Full agent metadata hierarchy
   (Bot → BotVersion → GenAiPlannerBundle → GenAiPlugin → GenAiFunction)
   — explain this is the PUBLISHED structure, not the authoring structure.
   How to locate agents in a project: read `sfdx-project.json` for the
   `packageDirectories[].path` value, then look under
   `<path>/main/default/aiAuthoringBundles/` for authoring bundles.

2. **Generating an Agent** — `sf agent generate authoring-bundle`
   command. What it creates (two files: `.agent` and `.bundle-meta.xml`).
   The `.agent` file is where Agent Script code goes. Keep this short —
   one command, two outputs.

3. **Deploy → Publish → Activate Pipeline** — The core lifecycle
   operation. Three steps, each with distinct purpose:
   - **Deploy backing code**: `sf project deploy start --source-dir <path>`
     to deploy Apex, Flow, Prompt Template dependencies. This is routine
     and frequent. CRITICAL: Do NOT include `.agent` or `AiAuthoringBundle`
     metadata in routine deploys unless the developer explicitly asks.
     Show this as a WRONG/RIGHT pair.
   - **Deploy agent metadata** (when explicitly publishing): deploy the
     `AiAuthoringBundle` to the org as part of the publish workflow.
   - **Publish**: `sf agent publish authoring-bundle --api-name <NAME>`.
     What happens: validates → commits version → creates Bot/GenAi*
     metadata → auto-retrieves hydrated metadata to local project.
     After publish, new files appear in the local project (Bot,
     BotVersion, GenAiPlannerBundle directories).
   - **Activate**: `sf agent activate --api-name <Bot_API_Name>`. Makes
     a published version live for runtime and preview. Only one version
     active at a time. `sf agent deactivate --api-name <Bot_API_Name>`
     to take offline.

4. **Published Agent Metadata** — What publish creates and what it means.
   Explain each component:
   - `Bot` container: `bots/<API_Name>/<API_Name>.bot-meta.xml` — top-level
     agent definition with `agentDSLEnabled: true`
   - `BotVersion`: `bots/<API_Name>/vN.botVersion-meta.xml` — minimal
     version files (just `<fullName>vN</fullName>`)
   - `GenAiPlannerBundle`: `genAiPlannerBundles/<API_Name>_vN/` — full
     expanded agent definition with org-generated ID suffixes on topics
     and actions. Version-suffixed directory names.
   - `bundle-meta.xml` `<target>` element: Maps authoring bundle to most
     recently published version (format: `Bot_API_Name.vN`). Only appears
     after publish + retrieve.
   Use the real metadata from the reference project to illustrate.
   State clearly: these files are org-generated. The consuming agent
   does NOT edit them directly. Edit the `.agent` file, republish.

5. **Retrieve and Sync** — `sf project retrieve start` with
   `--metadata Agent:<API_Name>` to pull all agent components from the
   org. The `Agent` pseudo metadata type is shorthand for all agent
   components (Bot, BotVersion, GenAiPlannerBundle, etc.). When to
   retrieve: after publishing (to get hydrated metadata), when starting
   from an org-built agent (to get local copies), when syncing team
   changes. Also mention: `sf project retrieve start
   --metadata AiAuthoringBundle:<API_Name>` to retrieve just the
   authoring bundle.

6. **Agent Management** — `sf org open agent --api-name <Name>` to
   open in Agent Builder (web UI). Useful for visual inspection,
   not the consuming agent's primary workflow. Checking agent status:
   how to determine if an agent is active (look for BotVersion files
   in the local project, or use Builder).

7. **Delete and Rename** — Delete workflow: deactivate →
   `sf project delete source --metadata AiAuthoringBundle:<API_Name>`
   (deletes agent metadata, preserves backing code). Alternative:
   `sf project delete source --metadata Agent:<API_Name>` to delete
   all agent components. Rename: advise against renaming published
   agents — the API name appears in Bot, BotVersion directories,
   GenAiPlannerBundle directories, and AiAuthoringBundle directory.
   Recommended approach: create a new agent with the desired name,
   migrate the Agent Script source, publish, activate the new version,
   then delete the old agent. Be honest that rename tooling may evolve.

8. **Test Lifecycle** — CLI commands for test metadata operations:
   - `sf agent test create --spec <path>` — creates
     `AiEvaluationDefinition` metadata in the org from a test spec YAML.
     The test spec is NOT deployable metadata — it's an intermediate
     artifact.
   - `sf agent test run --name <AiEvalDef_Name> --api-name <Bot_API_Name>`
     — executes tests against an ACTIVATED published agent. Tests
     CANNOT run against AiAuthoringBundle agents — must publish and
     activate first. Show this as a WRONG/RIGHT pair.
   - `sf agent test resume --job-id <id>` — for long-running test jobs.
   Test spec authoring and result interpretation are in RF5. This
   section covers only the lifecycle commands.

---

## Conflict Resolutions (Already Decided)

These were resolved through discussion with the skill author. Do NOT
revisit or present alternatives. Apply them as stated.

1. **Published agent preview requires activation.** Vivek confirmed:
   once published, an agent can ONLY be previewed if it has been
   ACTIVATED. Only one published version can be active at a time.
   Preview uses the `Bot` API name, not the planner bundle name.

2. **"NEVER deploy AiAuthoringBundle" vs. deploy pipeline.** These are
   complementary. Routine backing-code deploys should NEVER include
   AiAuthoringBundle metadata. The deploy → publish pipeline is a
   deliberate, developer-initiated sequence that includes agent
   metadata intentionally. Frame these as two distinct workflows.

3. **Version naming across metadata types.** BotVersion files use
   `vN`, GenAiPlannerBundle directories use `API_Name_vN`, and
   bundle-meta.xml target uses `Bot_API_Name.vN`. These are consistent
   but serve different purposes. Explain the three-way relationship.

4. **Test CLI commands in RF4 and RF5.** Intentional duplication per
   Design Principle 3. RF4 covers the commands as lifecycle procedures.
   RF5 covers them in the context of test authoring and execution.

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
  where they occur. Minimum two: the deploy caution (deploying AAB
  accidentally) and the test target mistake (running tests against
  unpublished agent).
- **All CLI commands use `--json` where applicable.** The consuming
  agent is programmatic. Note: not all lifecycle commands support
  `--json` — use it where available.
- **No analogies to other languages.** Agent Script metadata is unique.
- **Use real metadata from the reference project.** The inspected Bot,
  BotVersion, GenAiPlannerBundle, and bundle-meta.xml files provide
  concrete examples. Show actual XML snippets to illustrate structure.
  Keep snippets minimal — enough to show the key elements, not the
  full file content.

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

These citations make the file auditable. They will be regex-stripped
(`\[SOURCE:.*?\]`) after review. Do NOT omit them.

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

~300 lines. RF4 is procedural — each section is a recipe, not a
conceptual explanation. If exceeding, check for verbose preambles or
unnecessary metadata XML that could be trimmed. The published agent
metadata section (Section 4) is the most likely to run long — keep
XML snippets minimal.

---

## Quality Checks (Self-Verify Before Delivering)

After writing, verify the file against these criteria:

1. Do all 8 sections appear in the correct order per the outline?
2. Is the deploy caution ("NEVER deploy AiAuthoringBundle unless
   explicitly asked") prominent with a WRONG/RIGHT pair?
3. Is the deploy → publish → activate pipeline clearly presented as
   three distinct steps with different commands and purposes?
4. Does the published agent metadata section use real XML snippets
   from the reference project (not fabricated examples)?
5. Is it clear that published metadata files are org-generated and
   NOT to be edited directly?
6. Is the `Agent` pseudo metadata type explained as a convenient
   shorthand for deploy/retrieve/delete?
7. Does the test lifecycle section clearly state that tests run
   against ACTIVATED published agents only?
8. Does every technical claim have a `[SOURCE: ...]` citation?
9. Do all code examples follow RF1/RF2/RF3 conventions?
10. Does the file avoid re-teaching RF1 content (syntax), RF2
    content (design), and RF3 content (validation/debugging)?
11. Could a consuming agent with zero prior Salesforce metadata
    experience use this file to deploy, publish, activate, and
    manage an agent end-to-end?
12. Is every section under the 300-line target pulling its weight —
    no filler, no redundancy, no padding?
