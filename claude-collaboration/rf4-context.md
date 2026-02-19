# Reference File 4 Working Context — Metadata & Lifecycle

> **Purpose**: Captures all domain read findings, conflict resolutions, and
> outline decisions for `references/agent-metadata-and-lifecycle.md`. Read
> this before writing or revising the file.

---

## Sources Read

1. **`salesforcedocs/.../agent-dx/agent-dx-metadata.md`** (47 lines):
   `AiAuthoringBundle` structure (`.agent` + `.bundle-meta.xml`). Agent
   metadata hierarchy: Bot (top-level) → BotVersion (one active) →
   GenAiPlannerBundle (reasoning engine) → GenAiPlugin (topics) →
   GenAiFunction (actions). Lists all metadata types involved in the
   agent lifecycle.

2. **`salesforcedocs/.../agent-dx/agent-dx-nga-authbundle.md`** (79 lines):
   Generating authoring bundles: `sf agent generate authoring-bundle`.
   Bundle stored at `aiAuthoringBundles/<API-name>/`. Two files created:
   `<API-name>.agent` (the Agent Script source) and
   `<API-name>.bundle-meta.xml` (metadata about the bundle). The command
   prompts for API name and description.

3. **`salesforcedocs/.../agent-dx/agent-dx-nga-publish.md`** (83 lines):
   Publishing workflow: validates first, creates Bot/GenAi* metadata,
   retrieves hydrated metadata back to local project. The `<target>`
   element in `bundle-meta.xml` is populated after publish + retrieve.
   Key detail: versioned bundles (e.g., `My_Bundle_1`) are NOT draft —
   only draft bundles can be published. Publishing commits a version.
   A new draft is created automatically if changes are needed after
   publishing.

4. **`salesforcedocs/.../agent-dx/agent-dx-manage.md`** (69 lines):
   Activate/deactivate: `sf agent activate --api-name <Bot_API_Name>`,
   `sf agent deactivate --api-name <Bot_API_Name>`. Open in Builder:
   `sf org open agent --api-name <name>`. Key constraint: preview of
   published agents requires the agent to be ACTIVATED.

5. **`salesforcedocs/.../agent-dx/agent-dx-synch.md`** (118 lines):
   Deploy/retrieve/delete commands. `Agent` pseudo metadata type =
   shorthand for all agent metadata components. `Agent:Agent_API_Name`
   works with deploy/retrieve/delete commands. Delete behavior:
   `sf project delete source --metadata AiAuthoringBundle:X` deletes
   bundle AND associated agent metadata (Bot, BotVersion,
   GenAiPlannerBundle) but NOT Apex/Flow backing code. Also covers
   `sf project retrieve start --metadata Agent:X` for retrieving all
   agent components at once.

6. **`salesforcedocs/.../agent-dx/agent-dx-reference.md`** (43 lines):
   Agent spec YAML property reference (top-level keys: `name`,
   `description`, `type`, `topics`, `instructions`). Test spec YAML
   property reference (top-level keys: `name`, `description`,
   `subjectName`, `subjectType`, `testCases`). Brief — mostly
   pointers to the spec format details.

7. **`salesforcedocs/.../agent-dx/agent-dx-test.md`** (22 lines):
   Testing overview and flow. Tests run against ACTIVATED published
   agents (not authoring bundles). The workflow: create test spec YAML
   → `sf agent test create` → `sf agent test run`. Brief overview
   page, details in other test docs.

8. **`salesforcedocs/.../agent-dx/agent-dx-modify.md`**: Legacy
   workflow (modify via `sf agent generate agent-spec` → edit spec →
   `sf agent create`). NOT relevant to RF4 — this describes the
   deprecated server-side agent creation workflow.

9. **`.a4drules/agent-testing-rules-no-edit.md`** (AUTHORITATIVE SOURCE,
   281 lines): Full test rules including: test spec format with all
   fields documented, `AiEvaluationDefinition` metadata type (what gets
   created in the org), workflow (write spec → create in org → run),
   CLI commands (`sf agent test create --spec <path>`,
   `sf agent test run --name <AiEvalDef_Name> --api-name <Bot_API_Name>`),
   `sf agent test resume --job-id <id>`, common mistakes with
   WRONG/RIGHT pairs. Key details: `subjectType` must be `AGENT`,
   test creation requires specifying a connected app (which defaults
   to the AFDX managed package connected app in most setups).

10. **`.a4drules/agent-script-rules-no-edit.md`** (AUTHORITATIVE SOURCE,
    partial — lines 54-71): Lifecycle operations section. Metadata
    locations via `sfdx-project.json`. Critical rule: "NEVER deploy
    `.agent` or `AiAuthoringBundle` metadata unless explicitly asked."
    Reason: deploying the authoring bundle creates/updates the agent
    in the org, which may not be desired during development. The deploy
    command should only deploy backing code (Apex, Flow, etc.) unless
    the developer explicitly wants to push the agent definition itself.

11. **Real published metadata files** (inspected from reference project
    `afdx-pro-code-testdrive/force-app/`):

    - `bots/Local_Info_Agent/Local_Info_Agent.bot-meta.xml`: Bot container
      with `agentDSLEnabled: true`, `agentType: EinsteinServiceAgent`,
      `type: ExternalCopilot`, `botUser`, `label`, `description`.

    - `bots/Local_Info_Agent/v1.botVersion-meta.xml`: Minimal — just
      `<fullName>v1</fullName>`.

    - `bots/Local_Info_Agent/v2.botVersion-meta.xml`: Minimal — just
      `<fullName>v2</fullName>`.

    - `genAiPlannerBundles/Local_Info_Agent_v1/Local_Info_Agent_v1.genAiPlannerBundle`:
      Full expanded agent definition. Contains `localTopics` (all topics
      with full definitions), `localActions` (actions with invocation
      targets), org-generated ID suffixes (e.g., `_16jDL000000Cb11`),
      `plannerType: Atlas__ConcurrentMultiAgentOrchestration`.

    - `genAiPlannerBundles/Local_Info_Agent_v2/Local_Info_Agent_v2.genAiPlannerBundle`:
      Same structure as v1, different org-generated IDs (suffix
      `_16jDL000000Cb16`).

    - `aiAuthoringBundles/Local_Info_Agent/Local_Info_Agent.bundle-meta.xml`
      (after retrieve of versioned bundles):
      ```xml
      <AiAuthoringBundle xmlns="http://soap.sforce.com/2006/04/metadata">
          <bundleType>AGENT</bundleType>
          <target>Local_Info_Agent.v2</target>
      </AiAuthoringBundle>
      ```
      The `<target>` element maps the authoring bundle to its most
      recently published version (`Bot_API_Name.vN`).

12. **`sfdx-project.json`** (reference project): `packageDirectories:
    [{"path": "force-app", "default": true}]`, `sourceApiVersion:
    "65.0"`. The `path` field determines where all metadata types
    (including agent components) are stored.

13. **RF1/RF2/RF3 boundary checks**: Grep'd all three existing reference
    files for deploy/publish/activate/metadata terms. All mention these
    only in passing (RF3 mentions "deploy" as a pre-condition for
    preview, RF2 mentions "deploy" as a design-time warning about
    invalid backing logic). Clean boundaries — no overlap with RF4
    scope.

---

## Conflict Resolutions (Decided)

1. **Preview of published agents requires activation**: Initial read of
   `agent-dx-manage.md` seemed to conflict with RF3's guidance on
   previewing via `--api-name`. Clarification from Vivek: once an
   agent is published (AiAuthoringBundle → Bot + GenAiPlannerBundle),
   it can ONLY be previewed if it has been ACTIVATED. Only one published
   version can be active at a time. Preview of the active published
   agent uses the `Bot` API name (e.g., `Local_Info_Agent`), not the
   planner bundle name.
   **Decision**: Document this clearly. The activate step is not
   optional for published agent preview — it's a hard requirement.

2. **"NEVER deploy AiAuthoringBundle unless explicitly asked" vs.
   deploy → publish pipeline**: `.a4drules` says never deploy
   AiAuthoringBundle metadata without explicit request. But the
   publish pipeline requires the authoring bundle to be deployed
   first. These are not in conflict — the `.a4drules` rule means
   "don't include AiAuthoringBundle in routine deploys of backing
   code." When the developer explicitly wants to publish, they must
   deploy the authoring bundle as a deliberate step.
   **Decision**: Frame the deploy → publish pipeline clearly as an
   intentional, developer-initiated sequence. Separate the "deploy
   backing code" workflow (routine, frequent, excludes AiAuthoringBundle)
   from the "deploy + publish agent" workflow (deliberate, includes
   AiAuthoringBundle). Reinforce the `.a4drules` caution about not
   accidentally deploying agent definitions during routine backing
   code deploys.

3. **Version naming in GenAiPlannerBundle vs. BotVersion**: Published
   versions are tracked in two places — `BotVersion` files (minimal,
   just `<fullName>vN</fullName>`) and `GenAiPlannerBundle` directories
   (version-suffixed, e.g., `Local_Info_Agent_v1`, containing the full
   expanded definition). The `bundle-meta.xml` `<target>` element uses
   `Bot_API_Name.vN` format. These are consistent but serve different
   purposes: `BotVersion` is the version record, `GenAiPlannerBundle`
   is the versioned definition.
   **Decision**: Explain the three-way relationship (BotVersion →
   GenAiPlannerBundle → bundle-meta.xml target) clearly. The consuming
   agent doesn't need to manipulate these files, but understanding the
   relationship helps diagnose version-related issues.

4. **Test CLI commands: RF4 scope vs. RF5 scope**: The collaboration
   context says "CLI commands for testing" belong in BOTH File 4 and
   File 5 (intentional duplication). `.a4drules/agent-testing-rules`
   provides full detail on `sf agent test create`, `sf agent test run`,
   and `sf agent test resume`.
   **Decision**: RF4 covers the metadata operations (creating
   `AiEvaluationDefinition` from a test spec, running tests via CLI)
   as lifecycle procedures. RF5 covers test spec authoring and result
   interpretation. The CLI commands appear in both files — this is
   intentional reinforcement per Design Principle 3.

---

## Content Scope (What Goes in File 4)

**In scope** (collaboration-context.md File Inventory assigns
Knowledge Category G — Metadata & Lifecycle Management):

- `AiAuthoringBundle` directory structure: `.agent` file (Agent Script
  source), `.bundle-meta.xml` (metadata), location under
  `aiAuthoringBundles/` within the package directory
- Locating agents: reading `sfdx-project.json` for package directory
  paths, finding authoring bundles and published agent metadata
- Generating new authoring bundles: `sf agent generate authoring-bundle`
- The deploy → publish → activate pipeline as three distinct steps
  with different purposes:
  - Deploy: `sf project deploy start` for backing code (routine) vs.
    deploying with agent metadata (deliberate)
  - Publish: `sf agent publish authoring-bundle` — validates, commits
    version, hydrates Bot/GenAi* metadata, retrieves to local
  - Activate: `sf agent activate` — makes a published version live
  - Deactivate: `sf agent deactivate` — takes a published version
    offline
- Published agent metadata structure: Bot, BotVersion,
  GenAiPlannerBundle, and how they relate to the authoring bundle
- Version tracking: how versions accumulate across publish cycles,
  `<target>` element in `bundle-meta.xml`, version-suffixed planner
  bundle directories
- Opening an agent in Agent Builder: `sf org open agent --api-name`
- Delete mechanics: `sf project delete source` with `AiAuthoringBundle`
  or `Agent` metadata type. What gets deleted, what doesn't (backing
  code persists). Deactivation required before delete.
- Rename considerations: the complexity of renaming across the metadata
  hierarchy (Bot, BotVersion, GenAiPlannerBundle, AiAuthoringBundle
  all reference the API name)
- Retrieve: `sf project retrieve start` with `Agent` pseudo metadata
  type to pull all agent components
- `Agent` pseudo metadata type: shorthand for all agent metadata
  components, usable with deploy/retrieve/delete
- Test lifecycle commands (metadata operations only):
  `sf agent test create` (from test spec YAML → AiEvaluationDefinition),
  `sf agent test run`, `sf agent test resume`. The test spec is NOT
  deployable metadata — it's an intermediate artifact used to create
  the `AiEvaluationDefinition` in the org.

**Deferred to other files**:

- Agent Script syntax and execution model → RF1 (Core Language)
- Agent design and flow control → RF2 (Design & Agent Spec)
- Validation and debugging → RF3 (Validation & Debugging)
- Test spec authoring and result interpretation → RF5 (Test Authoring)

**Boundary with RF3 (Validation & Debugging)**: RF3 teaches preview
(including the `--api-name` flag for published agents) and references
"deploy" as a precondition. RF4 teaches the actual deploy/publish/activate
pipeline. RF3 line 236 says backing code must be deployed — RF4 explains
how. RF3 line 248 describes `--api-name` for published agents — RF4
explains how an agent becomes published and activated.

**Boundary with RF5 (Test Authoring)**: RF4 covers the metadata
operations for tests (creating `AiEvaluationDefinition`, running tests
via CLI). RF5 covers writing the test spec YAML and interpreting
results. CLI commands appear in both files (intentional duplication).

---

## Finalized Outline (Collaboratively Refined)

### Ordering Rationale

1. **Agent metadata structure first.** Comprehensive coverage of ALL
   agent-related metadata types. The consuming agent needs to understand
   the full metadata landscape before any operational procedure makes
   sense. This sets the stage for everything that follows.

2. **Lifecycle overview second.** Before diving into individual steps,
   the consuming agent needs the big picture: Generate → Deploy →
   Publish → Activate → Test. This is the conceptual chain that
   connects the detail sections. Same principle as RF1's execution
   model — teach "how it works" before "how to do it."

3. **Creating an agent third.** The first action in the lifecycle.
   `sf agent generate authoring-bundle` in depth. This is the step
   LLMs have failed at most consistently, so it needs careful
   treatment — not just "one command, two outputs."

4. **Working with authoring bundles fourth.** The finer points and
   hidden traps of AABs. This is where the consuming agent learns
   the non-obvious behaviors: draft versioning (the "naked" AAB
   always points to the highest draft), version accumulation, and
   other oddities. This section prevents mistakes that no other
   section covers.

5. **Publishing authoring bundles fifth.** Why publishing is needed,
   when to do it, what happens (version commit, metadata hydration,
   auto-retrieve). Multiple versions, connections back to AABs, the
   `<target>` element, what metadata actually gets created.

6. **Activating published agents sixth.** Activation mechanics, the
   one-active-at-a-time constraint, preview-requires-activation
   requirement, deactivation.

7. **Lifecycle operations seventh.** Consolidated reference for
   deploy, retrieve, delete, rename, and test lifecycle CLI commands.
   Some reinforcement of commands introduced in earlier sections,
   but structured as a concise operational reference with CLI commands
   and WRONG/RIGHT pairs. Not heavily token-rich — focused on the
   commands themselves.

### Sections (7 total):

1. **Agent Metadata Structure** — Comprehensive coverage of ALL
   agent-related metadata types. `AiAuthoringBundle` directory layout
   (`.agent` + `.bundle-meta.xml`). Package directory from
   `sfdx-project.json`. Full published metadata hierarchy (Bot →
   BotVersion → GenAiPlannerBundle → GenAiPlugin → GenAiFunction).
   `AiEvaluationDefinition` for tests. `Agent` pseudo metadata type
   as shorthand. How to locate agents in a project.

2. **Agent Metadata Lifecycle: Generate → Deploy → Publish →
   Activate → Test** — Overview of the full lifecycle chain. Each
   step's purpose in one or two sentences. The key concept: Agent
   Script source (AiAuthoringBundle) is the developer's artifact;
   published metadata (Bot/GenAi*) is the org's representation of
   the same agent. This section is conceptual — the detail sections
   that follow explain each step.

3. **Creating an Agent** — `sf agent generate authoring-bundle` in
   depth. The full command with required flags: `--no-spec` (prevents
   requiring a classic-style agent spec), `--name` (→ `agent_label`),
   `--api-name` (→ `developer_name`). What it creates (two files:
   `.agent` and `.bundle-meta.xml`). What the generated files contain.
   WRONG/RIGHT for omitting `--no-spec`. This is the step LLMs fail
   at most consistently — likely failures: omitting `--no-spec`,
   confusing `--name`/`--api-name`, omitting flags and getting
   interactive prompts.

4. **Working With Authoring Bundles** — The finer points and hidden
   traps. Key content:
   - The "naked" AAB (no version suffix) always points to the highest
     DRAFT version in the org, not the most recently published version.
   - Version-suffixed AABs (e.g., `Local_Info_Agent_1`) are published
     snapshots — frozen, not editable.
   - First deploy creates DRAFT V1 in the org.
   - No pro-code way to create new draft versions — only via Builder's
     "create new draft version" button. But drafts CAN be retrieved
     with version-suffixed names.
   - Deploying an AAB (without publishing) is legitimately useful:
     enables pro-code/low-code collaboration where pro-code developers
     author Agent Script locally while low-code users refine in Builder.
   - The deploy caution from `.a4drules`: NEVER deploy `.agent` or
     AiAuthoringBundle metadata in routine backing-code deploys.
   - `default_agent_user` must be set to a valid agent user (license
     type requirements UNKNOWN — see Research Questions).
   - Deploy validates backing logic existence (validation depth
     UNKNOWN — see Research Questions).
   - "Backing code" defined: Apex classes, Flows, Prompt Templates,
     and any other metadata that agent actions reference as invocation
     targets.

5. **Publishing Authoring Bundles** — Why publishing is needed (locks
   a version, creates runtime metadata). When to publish (after
   validation passes, backing code is deployed). Key detail: publishing
   INCLUDES deploying the AAB to the org — the developer does NOT need
   to manually deploy the AAB before publishing. The pipeline is:
   deploy backing code (manual) → publish (deploys AAB, validates,
   commits version, hydrates Bot/GenAi* metadata, retrieves). The
   `<target>` element in `bundle-meta.xml`. Multiple published versions
   and how they accumulate. What metadata gets created (Bot container,
   BotVersion files, GenAiPlannerBundle directories with version-suffixed
   names and org-generated ID suffixes). Post-publish draft behavior
   UNKNOWN — see Research Questions. Use real metadata from the
   reference project to illustrate.

6. **Activating Published Agents** — `sf agent activate` /
   `sf agent deactivate`. Only one published version active at a
   time. Published agents can ONLY be previewed if activated.
   Deactivate before replacing with a different version. The
   relationship between activation and runtime availability.

7. **Lifecycle Operations** — Consolidated CLI reference:
   - **Deploy**: `sf project deploy start` for backing code vs.
     agent metadata. WRONG/RIGHT pair for accidental AAB deploy.
   - **Retrieve**: `sf project retrieve start` with `Agent` pseudo
     metadata type. When to retrieve.
   - **Delete**: Deactivate first → `sf project delete source` with
     `AiAuthoringBundle` or `Agent` type. What gets deleted vs.
     preserved.
   - **Rename**: Advise against for published agents. Create-new-and-
     migrate approach. Honest about limitations.
   - **Test lifecycle**: `sf agent test create`, `sf agent test run`,
     `sf agent test resume`. Tests run against ACTIVATED published
     agents only. WRONG/RIGHT pair for running tests against
     unpublished agent.
   - **Open in Builder**: `sf org open agent --api-name`.

---

## Key Insights for Writing

- **RF4 is a procedures manual with a conceptual foundation.** Sections
  1-2 build understanding (metadata structure and lifecycle overview).
  Sections 3-6 teach specific procedures. Section 7 consolidates
  commands for reference. The tone should be direct and operational
  after the conceptual setup.

- **AAB oddities are the most valuable content in this file.** The
  consuming agent cannot learn the "naked AAB points to highest draft"
  behavior from any existing documentation. Section 4 (Working With
  Authoring Bundles) is where RF4 adds the most value beyond what
  source docs already cover. Invest tokens here.

- **Creating an agent is where LLMs fail most.** Section 3 needs
  more depth than "one command, two outputs." Capture the specific
  failure modes that have been observed.

- **The deploy distinction is critical.** The difference between
  deploying backing code (routine, excludes agent metadata) and
  deploying agent metadata (deliberate, part of the publish pipeline)
  must be internalized. WRONG/RIGHT pair required.

- **Published metadata is read-only context, not write targets.**
  The consuming agent never edits Bot, BotVersion, or
  GenAiPlannerBundle files directly. These are org-generated artifacts
  retrieved for reference. The consuming agent edits `.agent` files
  in the authoring bundle. Make this clear to prevent the consuming
  agent from trying to modify published metadata.

- **Version accumulation needs concrete illustration.** Show what
  happens across two publish cycles using the reference project data:
  first publish creates `v1.botVersion-meta.xml` +
  `Local_Info_Agent_v1.genAiPlannerBundle`, second publish creates
  `v2.botVersion-meta.xml` + `Local_Info_Agent_v2.genAiPlannerBundle`,
  and `<target>` updates to `Local_Info_Agent.v2`.

- **Rename is hazardous — don't oversell capability.** The metadata
  hierarchy makes renaming complex. Advise creating a new agent and
  migrating. Be honest about limitations.

- **Use real metadata from the reference project.** The inspected
  Bot, BotVersion, GenAiPlannerBundle, and bundle-meta.xml files
  provide concrete examples. Use snippets to illustrate structure
  rather than describing abstractly.

- **The `Agent` pseudo metadata type saves time.** Instead of
  specifying every individual metadata type, `Agent:X` covers them
  all. The consuming agent should use this by default.

- **Section 7 is reinforcement, not redundancy.** CLI commands
  introduced in detail sections (3-6) reappear in Section 7 as a
  consolidated reference. This is intentional — the consuming agent
  may arrive at Section 7 directly for a lifecycle operation without
  reading the full context above.

---

## Vivek's Clarifications (from domain read session)

These are direct clarifications from Vivek that are NOT in the source
documentation:

1. **Published agent preview requires activation.** Not stated clearly
   in docs. Vivek confirmed: once published, an agent can ONLY be
   previewed if it has been ACTIVATED.

2. **Version accumulation across publish cycles.** Vivek ran `publish`
   twice on the reference project to generate v1 and v2 metadata so
   I could inspect the real file structure.

3. **The `<target>` element appears after AAB retrieve.** The
   `bundle-meta.xml` initially has no `<target>`. After publishing
   and then retrieving the authoring bundle, `<target>` is populated
   with `Bot_API_Name.vN` pointing to the most recently published
   version.

4. **Only ONE published version can be active at a time.** Multiple
   published versions can exist, but only one is activated for
   runtime/preview use.

5. **"Naked" AAB always points to the highest draft version.** An
   `AiAuthoringBundle` in the local project WITHOUT a version suffix
   (e.g., `Local_Info_Agent`) is tied to the highest DRAFT version
   of that AAB metadata in the org. Version-suffixed AABs (e.g.,
   `Local_Info_Agent_1`) are published snapshots. Example: the
   reference project has both `Local_Info_Agent` (which is actually
   DRAFT VERSION 2 of the AAB in the org) and `Local_Info_Agent_1`
   (published version 1). No matter how many times the AAB is
   published, the "naked" AAB in pro-code source always points to
   the highest numerically versioned DRAFT AAB in the org. This is
   not documented anywhere and is counterintuitive.

6. **AAB oddities need dedicated coverage.** There are enough
   non-obvious behaviors with AABs that a dedicated section (Section 4:
   Working With Authoring Bundles) is needed. Additional oddities
   captured in brain dump below.

---

## AAB Brain Dump (from Vivek — Session 11)

This section captures Vivek's deep knowledge of AAB behaviors, organized
into confirmed facts, open questions requiring validation, and a
research plan for resolving the unknowns.

### Confirmed Facts

**1. Generation command requires specific flags.**

The correct command is:
```
sf agent generate authoring-bundle --no-spec --name "<Label>" --api-name <Developer_Name>
```

- `--no-spec` — prevents the command from requiring a classic-style
  agent spec file. Without this flag, the command expects a spec path.
  NOTE: this is NOT the same "Agent Spec" artifact we've defined as a
  first-class design artifact in RF2. The classic-style spec is from
  the deprecated `sf agent generate agent-spec` / `sf agent create`
  workflow.
- `--name "<Label>"` — becomes the `agent_label` in the generated
  Agent Script boilerplate.
- `--api-name <Developer_Name>` — becomes the `developer_name` in the
  generated Agent Script boilerplate.

This is the step where LLMs fail most consistently. Likely failure
modes: omitting `--no-spec` (command hangs or errors waiting for a
spec file), confusing `--name` and `--api-name`, or omitting flags
entirely and getting interactive prompts the LLM can't handle.

**2. "Backing code" defined explicitly.**

"Backing code" means: Apex classes, Flows, Prompt Templates, and any
other metadata that agent actions reference as their invocation targets.
These are the components that actually execute when an agent action
fires. The term is used throughout RF4 to distinguish routine deploys
(backing code only) from agent metadata deploys (AiAuthoringBundle).

**3. `default_agent_user` must be set for AAB deployment.**

Deploying an AAB to an org fails if `default_agent_user` is not set
to a valid Salesforce agent user. The specifics of which license types
qualify are UNKNOWN (see Research Questions below).

**4. Deploy validates backing logic existence.**

Deploying an AAB fails when any backing logic for the agent's actions
is invalid or does not exist in the org. The depth of this validation
is UNKNOWN — unclear if it's referential integrity only (does the
class exist?) or if it also validates method/property signatures (see
Research Questions below).

**5. First AAB deploy creates DRAFT V1.**

The first time an AAB is deployed to an org (if unpublished), the org
creates DRAFT V1 of the AAB. This is the starting state for a new
agent.

**6. No pro-code way to create new draft versions.**

There is no CLI command to create a new DRAFT version of an AAB from
pro-code tools. In the low-code Agentforce Studio (Agent Builder), a
user can open a published AAB version and click "create a new draft
version." This can be done multiple times, resulting in multiple
DRAFT (unpublished) versions in the org. Those draft versions CAN be
retrieved to a pro-code project:
```
sf project retrieve start -m AiAuthoringBundle:Local_Info_Agent_3
```
(with the version number appended to the API name).

**7. Publishing includes deployment.**

When publishing an AAB, the current version of the AAB is deployed
to the org as part of the publish process. So a developer CAN publish
without manually deploying the AAB first — the publish operation
handles deploying the AAB into the org. However, backing code must
already be deployed, since publish validation checks for it.

This corrects the earlier framing of "deploy then publish" as two
mandatory manual steps. The pipeline is more accurately:
- Deploy backing code (Apex, Flows, etc.) — manual, required
- Publish AAB (which deploys the AAB, validates, commits version,
  hydrates Bot/GenAi* metadata, retrieves) — handles AAB deployment
  internally
- Activate — makes the published version live

**8. Deploying AAB before publishing has legitimate uses.**

Deploying an AAB to an org WITHOUT publishing is genuinely useful:
it lets someone use the org-based Agent Builder to contribute to the
agent's development. This enables a pro-code/low-code collaboration
model where pro-code developers author Agent Script locally and deploy
to the org, while low-code users refine the agent in Builder. This is
a valuable feature of the Agent Script workflow, not just a step in
the publish pipeline.

**9. Post-publish draft behavior is uncertain.**

After publishing an AAB, something happens regarding the next draft
version. If the `<target>` field in `bundle-meta.xml` is empty or
points to a published bundle, either an error occurs or a new DRAFT
version is created automatically. This needs experimental validation
(see Research Questions below).

### AAB Lifecycle Model (Structured from Brain Dump)

This is the conceptual model that emerges from the confirmed facts.
The lifecycle has more states and transitions than the source
documentation suggests:

```
GENERATE (sf agent generate authoring-bundle)
    ↓
LOCAL ONLY — AAB exists in local project, not in org
    ↓
DEPLOY to org (explicit or as part of publish)
    ↓
DRAFT V1 in org — editable in Builder, previewable via
                   --authoring-bundle
    ↓
[Optional: low-code user creates new draft versions in Builder]
    ↓
DRAFT VN in org — "naked" local AAB always points to highest draft
    ↓
PUBLISH (sf agent publish authoring-bundle)
    ↓
PUBLISHED VN — version locked, Bot/GenAi* metadata created,
               version-suffixed AAB appears in local project,
               <target> updated in bundle-meta.xml
    ↓
[New draft auto-created? Or must be created via Builder? UNKNOWN]
    ↓
ACTIVATE (sf agent activate)
    ↓
ACTIVE — one version at a time, required for preview via --api-name,
         required for test execution, available for runtime channels
```

Key insight: the pro-code developer's "naked" AAB always floats to
the highest draft. Published versions are frozen snapshots with
version-suffixed names. The developer never edits a published version
— they edit the current draft and publish again.

### Open Research Questions

These questions CANNOT be answered from documentation. They require
experimental validation against a live org.

**RQ1: Which license types qualify for `default_agent_user`?**
Can a SysAdmin user with a standard Salesforce license be used as
the agent user? Or does this require a user with the Agentforce
Agent license type (exact license name may differ)?
- **Why it matters**: If only special license types work, the skill
  must guide the developer to check license requirements before
  deploying.
- **Test approach**: Try deploying an AAB with `default_agent_user`
  set to (a) a SysAdmin with Salesforce license, (b) a user with
  an Agentforce-specific license. Record which succeeds/fails.

**RQ2: How deep is deploy validation of backing logic?**
Does deployment validation only check referential integrity (does
the "CheckWeather" class exist in the org?) or does it also validate
against method and property signatures (does the class have the
expected `@InvocableMethod` with the right parameters)?
- **Why it matters**: Determines whether the skill should advise
  deploying stub classes (existence-only) or fully implemented
  classes before deploying the AAB.
- **Test approach**: Deploy an AAB that references (a) a non-existent
  Apex class, (b) an existing class with wrong method signature,
  (c) an existing class with correct signature. Compare error messages.

**RQ3: What happens after publishing when the current AAB has no
draft to point to?**
After publishing, the `<target>` element points to the published
version. If the developer then tries to deploy or modify the "naked"
AAB, does the platform (a) auto-create a new draft version, (b)
throw an error, or (c) overwrite the published version?
- **Why it matters**: Determines whether the skill must warn about
  post-publish state or can rely on automatic draft creation.
- **Test approach**: Publish an AAB, then immediately try to deploy
  a modified version of the "naked" AAB. Observe org state.

**RQ4: Can you publish an AAB that has never been manually deployed?**
The publish command deploys the AAB internally. Does this work for a
brand-new AAB that has never been in the org, or does the org need
to have a pre-existing draft?
- **Why it matters**: Simplifies the pipeline guidance if publish
  handles everything.
- **Test approach**: Generate a fresh AAB locally, ensure backing
  code is deployed, run `sf agent publish authoring-bundle` without
  a prior deploy. Observe whether it succeeds.

**RQ5: Can version-suffixed AABs be deployed independently?**
If a developer retrieves `Local_Info_Agent_3` (a draft created in
Builder), can they modify it locally and deploy it back? Or is the
version-suffixed AAB read-only in the local project?
- **Why it matters**: Affects guidance on the pro-code/low-code
  collaboration model.
- **Test approach**: Retrieve a version-suffixed AAB, modify it,
  attempt to deploy. Observe result.

### Validation Plan: Claude Code Experiment Prompts

Vivek has a local Claude Code agent with access to Salesforce CLI
auth (not sandboxed). We can write prompts for that agent to run
the experiments above against a live org. The approach:

1. Write a self-contained prompt for each research question
2. Each prompt includes: the hypothesis, the exact commands to run,
   what to observe, and how to record the result
3. Vivek runs the prompts via Claude Code locally
4. Results feed back into rf4-context.md as confirmed facts or
   updated guidance
5. Updated context flows into the writing prompt and final RF4 content

**Prompts to create** (after brain dump is complete):
- RQ1 prompt: `default_agent_user` license type experiment
- RQ2 prompt: Deploy validation depth experiment
- RQ3 prompt: Post-publish draft behavior experiment
- RQ4 prompt: Publish-without-prior-deploy experiment
- RQ5 prompt: Version-suffixed AAB deploy experiment

These prompts should be saved to
`claude-collaboration/rf4-experiments/` as individual files that
Vivek can feed directly to his local Claude Code agent.
