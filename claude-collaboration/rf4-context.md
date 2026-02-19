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
   depth. What the command does, what it creates, what the generated
   files contain, and what the consuming agent should do next. This
   is the step LLMs fail at most consistently — needs careful
   treatment of common failure modes.

4. **Working With Authoring Bundles** — The finer points and hidden
   traps. Key content: the "naked" AAB (no version suffix) always
   points to the highest DRAFT version in the org, not the most
   recently published version. Version-suffixed AABs (e.g.,
   `Local_Info_Agent_1`) are published snapshots. The deploy caution
   from `.a4drules`: NEVER deploy `.agent` or AiAuthoringBundle
   metadata in routine deploys. Additional AAB oddities to be
   captured during brain dump session with Vivek.

5. **Publishing Authoring Bundles** — Why publishing is needed (locks
   a version, creates runtime metadata). When to publish (after
   validation passes, backing code is deployed). What happens:
   validates → commits version → creates Bot/GenAi* metadata →
   auto-retrieves hydrated metadata to local. The `<target>` element
   in `bundle-meta.xml`. Multiple published versions and how they
   accumulate. What metadata actually gets created (Bot container,
   BotVersion files, GenAiPlannerBundle directories with
   version-suffixed names and org-generated ID suffixes). Use real
   metadata from the reference project to illustrate.

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
   Working With Authoring Bundles) is needed. Additional oddities to
   be captured in a brain dump session with Vivek.
