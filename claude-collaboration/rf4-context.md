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
   - `default_agent_user` must be set to a user with "Einstein Agent"
     license (CONFIRMED via RQ1). Wrong license → misleading "Internal
     Error, try again later." Immutable after first publish.
   - Two validation layers: compile (CLI `validate`) and API (during
     `publish`). API validation catches agent user and backing logic
     issues that compile validation misses. Open TD to integrate them.
   - Deploy validates backing logic via Invocable Action registry
     lookup (CONFIRMED via RQ2): class must exist AND have
     `@InvocableMethod`. Parameter names, types, return types are NOT
     validated at deploy time — only caught at runtime. Stub classes
     with `@InvocableMethod` are sufficient to unblock deploy.
   - "Backing code" defined: Apex classes, Flows, Prompt Templates,
     and any other metadata that agent actions reference as invocation
     targets.
   - Server-side AAB filename includes version suffix (e.g.,
     `Local_Info_Agent_4.agent`) even though local filename doesn't —
     triggers a CLI warning that can confuse developers.
   - **Post-publish workflow is seamless by design (CONFIRMED via RQ3
     + Vivek clarification)**: After publishing, local source is
     unchanged — no `<target>` set. Developer can immediately continue
     editing and deploying. Deploy auto-creates new DRAFT on server.
     This is the intended pro-code workflow.
   - **`<target>` edge case**: If developer retrieves the published AAB
     into local source, `<target>` gets set and locks the AAB. Must
     clear `<target>` from `bundle-meta.xml` to resume deploying. Teach
     this as a recovery scenario, not the normal workflow.
   - `<target>` absent = draft (deployable); `<target>` present =
     locked to published version. Pulling "naked" DRAFT versions via
     retrieve never sets `<target>`.

5. **Publishing Authoring Bundles** — Why publishing is needed (creates
   the full agent entity graph — Bot, BotVersion, GenAiPlannerBundle,
   GenAiPlugins — from the AAB source; deploy alone does NOT do this).
   When to publish (after validation passes, backing code is deployed).
   Key detail: publish is SELF-CONTAINED — no prior deploy or org state
   needed (CONFIRMED via RQ4). A brand-new AAB can be published directly.
   The simplest pipeline: generate → edit → validate → publish →
   activate. Deploy backing code is still needed if agent has actions.
   The `<target>` element in `bundle-meta.xml`. Multiple published
   versions and how they accumulate. What metadata gets created (use
   RQ4's full inventory: Bot, BotVersion, GenAiPlannerBundle,
   GenAiPlugins with org-generated ID suffixes). Post-publish behavior:
   local source unchanged, developer can immediately continue editing
   and deploying (CONFIRMED via RQ3 + Vivek). Gotcha: publishing when
   no DRAFT exists on server creates a new version even if content is
   unchanged (version inflation — only when no existing DRAFT). Gotcha:
   publish response doesn't include the version number — must retrieve
   with `AiAuthoringBundle:` specifically (NOT `Agent:` — which omits
   the AAB). Use real metadata from the reference project to illustrate.

6. **Activating Published Agents** — `sf agent activate` /
   `sf agent deactivate`. Only one published version active at a
   time. Published agents can ONLY be previewed if activated.
   Deactivate before replacing with a different version. The
   relationship between activation and runtime availability.

7. **Lifecycle Operations** — Consolidated CLI reference:
   - **Deploy**: `sf project deploy start` for backing code vs.
     agent metadata. Deploy puts AAB source in org but does NOT create
     a Bot entity (CONFIRMED via RQ4). WRONG/RIGHT pair for accidental
     AAB deploy.
   - **Retrieve**: `sf project retrieve start` with `Agent` pseudo
     metadata type. GOTCHA: `Agent:` retrieve does NOT include
     AiAuthoringBundle (DISCOVERED via RQ4). Must use
     `AiAuthoringBundle:` for AAB-specific retrieves.
   - **Delete**: Two levels of complexity:
     (a) Unpublished AABs: `sf project delete source` with
     `AiAuthoringBundle` or `Agent` type works. WARNING: also deletes
     local source files (DISCOVERED via RQ4).
     (b) Published agents: CANNOT be deleted via Metadata API
     (DISCOVERED via RQ4). Circular dependency chain prevents deletion.
     Only Setup UI or scratch org expiration. Implications for test
     hygiene.
     (c) Backing code: org enforces deletion dependency — cannot delete
     while any AAB version references it. Must update AAB reference
     first, then delete class.
   - **Rename**: Advise against for published agents. Create-new-and-
     migrate approach. Honest about limitations.
   - **Test lifecycle**: `sf agent test create`, `sf agent test run`,
     `sf agent test resume`. Tests run against ACTIVATED published
     agents only. WRONG/RIGHT pair for running tests against
     unpublished agent.
   - **Open in Builder**: `sf org open authoring-bundle` (opens
     Agentforce Studio list view). Note: `sf org open agent --api-name`
     queries BotDefinition and only works for published agents.

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

- **The deploy-runtime validation gap is a trap (from RQ2).** Deploy
  validates only that referenced classes have `@InvocableMethod`. It
  does NOT validate parameter names, types, or return types. A
  developer can deploy an AAB with completely wrong I/O definitions
  and not discover the problem until someone talks to the agent. The
  skill must explicitly warn about this gap and advise deploying fully
  implemented (not just stub) classes when possible.

- **Stub classes are a real workflow tool, not just a workaround.**
  A minimal class with `@InvocableMethod` unblocks AAB deployment for
  pro-code/low-code collaboration. This connects to Confirmed Fact 8
  (deploying before publishing). The skill should teach stub creation
  as a deliberate pattern, with a clear warning about the runtime gap.

- **Deletion has hidden dependency enforcement.** Backing code can't
  be deleted while any AAB version references it. The skill should
  teach the correct cleanup sequence: update AAB → deploy → delete
  old class. This especially matters for refactoring workflows.

- **The post-publish workflow is seamless — teach it as the happy path
  (from RQ3 + Vivek).** After publishing, the developer just keeps
  editing and deploying. The platform auto-creates new DRAFTs. No
  special steps needed. The `<target>` locking only happens if the
  developer retrieves the published AAB into local source — teach
  this as an edge case recovery, not the normal workflow. The skill
  should give developers confidence that publish → continue working
  is the intended, smooth path.

- **`<target>` is the draft/published toggle, but rarely encountered
  in normal workflow.** Absent = draft, present = locked. The
  consuming agent should know this mechanism exists (for debugging)
  but should NOT be taught to fear it or routinely clear it. It only
  appears locally when a published/versioned bundle is retrieved.
  Retrieving "naked" DRAFTs never sets it.

- **Deploy vs. publish is the most important distinction in RF4 (from
  RQ4).** Deploy = metadata operation (puts AAB source in org). Publish
  = full entity creation (Bot + BotVersion + GenAiPlannerBundle +
  GenAiPlugins). This must be crystal clear early — Section 2 (lifecycle
  overview) should establish this, and Sections 5 and 7 should reinforce.

- **Publish is the streamlined happy path.** Generate → validate →
  publish → activate. No intermediate deploy step. The skill should
  present this as the default pipeline, with "deploy before publish"
  as an optional step for specific use cases (pro-code/low-code
  collaboration — pending Vivek clarification on how this works).

- **Published agents can't be deleted via CLI — major lifecycle fact.**
  The skill must warn about this clearly. Test agents in scratch orgs
  accumulate until org expiration. Implications: use unique names for
  test agents, don't over-publish in scratch orgs, consider org
  refresh cadence.

- **`sf project delete source` removes local files too.** Developers
  will expect "delete from org only" and lose their local source.
  WRONG/RIGHT pair needed in Section 7.

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

**3. `default_agent_user` requires "Einstein Agent" license.**
**(CONFIRMED via RQ1 experiment — 2026-02-19)**

The `default_agent_user` field requires a user with the **"Einstein
Agent"** license type (profile: "Einstein Agent User"). Standard
"Salesforce"-licensed users — even System Administrators — cannot be
used. The platform returns a misleading `"Internal Error, try again
later"` instead of a license-related error, making this hard to
diagnose. Reproduced 3 times across 2 different agents.

**3a. `default_agent_user` is immutable after first publish.**
**(DISCOVERED via RQ1 experiment — 2026-02-19)**

Once an agent has been published, `default_agent_user` cannot be
changed. Confirmed in BOTH CLI and NGA Web (Agent Builder):
- CLI: `"Default Agent user [X] does not match the existing Default
  Agent user [Y]"`
- NGA Web: `"API validation failed. Error details: Default Agent user
  [005DL00000JbQJa] does not match the existing Default Agent user
  [005DL00000JbLoZ]"`
This means the agent user is permanently bound at first publish.
Getting this right on the first publish is critical.

**3b. `sf agent validate` does NOT validate `default_agent_user`.**
**(DISCOVERED via RQ1 experiment — 2026-02-19)**

Validation only checks Agent Script syntax/compilation. User validity
is only checked during `sf agent publish`, at the publish step (not
the compile step). A developer can validate successfully and still
fail at publish due to an invalid agent user.

**3c. RETRACTED — `sf project deploy start` CAN deploy an AAB
without pre-existing BotVersion.**

The RQ1 local agent claimed deploy requires a pre-existing BotVersion.
This is WRONG — Vivek has personally deployed AABs to an org before
publishing. The local agent pivoted from `sf project deploy start` to
`sf agent publish` without actually testing deploy, then stated this
as fact in its approach rationale (line 87 of the experiment results).
The claim had no supporting evidence.

**Confirmed fact (from Vivek):** `sf project deploy start` works for
deploying an AAB to an org that has no prior Bot infrastructure. This
is how the pro-code/low-code collaboration model works — you deploy
the AAB to get it into Builder, then optionally publish later.

**3d. Two validation layers exist: compile validation and API validation.**
**(From Vivek — 2026-02-19)**

The CLI `sf agent validate authoring-bundle` only performs compile-level
checks (Agent Script syntax/structure). A separate "API Validation"
layer exists that checks:
- `default_agent_user` validity (license type, immutability)
- Backing logic references (do referenced Apex/Flow components exist?)

API Validation runs during `sf agent publish` but NOT during
`sf agent validate`. NGA Web (Agent Builder) labels these as
"API validation failed" errors. The AFDX team has an open TD with
the Agentforce team to integrate the API validation into the CLI
`validate` command alongside the compile API. Until that work ships,
developers will see validation pass but publish fail for these classes
of errors.

**4. Deploy validates backing logic via Invocable Action registry lookup.**
**(RESOLVED via RQ2 experiment — 2026-02-19)**

Deploying an AAB validates that every backing logic reference resolves
to a registered Invocable Action in the org. Specifically:

- The referenced class/flow/prompt must **exist** in the org.
- For Apex classes, the class must have an **`@InvocableMethod`-annotated
  method**. A class without `@InvocableMethod` fails with the same
  "couldn't find" error as a truly missing class (bad error message #3).
- Validation is **identical for Apex and Flow references** — same error
  format, same behavior.

Deploy validation does **NOT** check:
- `@InvocableVariable` names (wrong names pass)
- Whether the method has any parameters at all (zero-param `void` passes)
- Parameter types or return types (completely wrong types pass)

The validation is essentially: "Is there a registered Invocable Action
with this name?" — not a structural contract check. Parameter/type
mismatches are only caught at **runtime** (during agent preview or
conversation), creating a gap where deploy succeeds but the agent
breaks when used.

**Practical implication — stub classes are viable:** A minimal stub
with `@InvocableMethod` is sufficient to unblock AAB deployment:
```apex
public class MyStubAction {
    @InvocableMethod(label='Stub' description='Stub for AAB deploy')
    public static void stub() {}
}
```
This is useful for the pro-code/low-code collaboration model: deploy
stubs to get the agent into Builder, then backfill real implementations.

Full experiment results: `rf4-experiments/RQ2-deploy-validation-depth.md`

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
**(CONFIRMED via RQ4 + Vivek clarification — 2026-02-20)**

Deploying an AAB to an org WITHOUT publishing is genuinely useful:
Agent Builder (part of Agentforce Studio) CAN see and open deployed-
but-unpublished AABs. This enables a pro-code/low-code collaboration
model:

1. Pro-code dev authors Agent Script locally and deploys to the org
2. Low-code user opens the deployed AAB in Agent Builder
3. Agent Builder supports canvas editing, script view text editing,
   and built-in preview — every change modifies the underlying Agent
   Script
4. Pro-code dev retrieves to see Builder changes, makes further edits,
   deploys back

**Important caveats:**
- Deploy/retrieve are one-way overwrites with NO sync warnings — last
  write wins
- Collision risk is low because usually one person works on one AAB
  per org at a time
- AAB is a configuration container for Agent Script, NOT an actual
  agent — "publish" hydrates the actual agent (Bot + GenAiPlanner
  metadata)

**9. Post-publish workflow: deploy auto-creates a new DRAFT.**
**(RESOLVED via RQ3 experiment + Vivek clarification — 2026-02-20)**

After publishing, `<target>` in `bundle-meta.xml` is NOT automatically
updated in the local project. The local source stays clean — no
`<target>`, no lock. This is intentional design: the developer can
immediately continue editing and deploy, and the platform auto-creates
a new DRAFT version on the server.

**The intended (normal) workflow:**
1. Publish succeeds → local source UNCHANGED (no `<target>` set)
2. Developer continues editing `.agent` file
3. Deploy → platform auto-creates new DRAFT version on the server
4. Repeat edit/deploy cycle as needed

**The retrieve edge case:** If the developer retrieves the AAB after
publishing (e.g., `sf project retrieve start --metadata
AiAuthoringBundle:Local_Info_Agent`), the retrieved `bundle-meta.xml`
WILL have `<target>` set to the published version (e.g.,
`Local_Info_Agent.v4`). This locks the local AAB — subsequent deploys
with content changes fail with:
> `"content cannot be changed once the bundle version is published."`

**Recovery from retrieve edge case:** Remove the `<target>` element
from `bundle-meta.xml`, then deploy. This creates a new DRAFT (if no
draft exists) or updates the highest existing DRAFT.

**Key insight (from Vivek):** `<target>` not updating on publish IS A
FEATURE. The intended flow is publish → keep working → deploy (auto-
creates new draft). The RQ3 experiment created the "locked" state by
explicitly retrieving after publish (Step 3), which is not part of
the normal workflow. The skill should teach the normal workflow as the
default and the retrieve recovery as an edge case.

**Additional behaviors:**
- Pulling "naked" DRAFT versions via retrieve never sets `<target>` —
  only retrieving published/versioned bundles does
- Deploy after publish (without retrieve) creates a new DRAFT if none
  exists, or updates the highest existing DRAFT
- Retrieving a "naked" AAB always pulls the highest DRAFT version

Full experiment results: `rf4-experiments/RQ3-post-publish-draft-behavior.md`

**10. Org enforces deletion dependency between AABs and backing code.**
**(DISCOVERED via RQ2 experiment — 2026-02-19)**

The org tracks hard dependencies between AAB versions and their
backing Apex classes. Attempting to delete a backing class while any
AAB version still references it produces:
> `"This apex class is referenced elsewhere in Salesforce. Remove the
> usage and try again. : Authoring Bundle Version Content Dependency
> - [Id]."`

To delete a backing class, you must first update the AAB to remove
the reference (or point to a different class), deploy the updated AAB,
and then delete the old class. This affects cleanup and refactoring
workflows.

**11. Server-side AAB filename includes version suffix.**
**(OBSERVED during RQ2 experiment — 2026-02-19)**

When deploying a local AAB (`Local_Info_Agent.agent`), the server uses
a version-suffixed filename (`Local_Info_Agent_4.agent`). This triggers
a CLI warning: `"AiAuthoringBundle, Local_Info_Agent_4.agent, returned
from org, but not found in the local project"`. Another manifestation
of the "naked AAB = highest draft" behavior — the server knows the
version number, the local project doesn't include it in the filename.

**12. Publishing creates a new version when no DRAFT exists on server.**
**(DISCOVERED via RQ3 experiment, clarified by Vivek — 2026-02-20)**

If no DRAFT version exists on the server (e.g., immediately after a
prior publish with no subsequent deploy), running `sf agent publish`
creates a new published version from whatever the current state is —
even if the content is identical to the last published version
(observed: v4 → v5 with zero changes). This is "silent version
inflation" but it's more predictable than initially captured: it only
occurs when there IS NOT an existing DRAFT on the server. If a DRAFT
exists (because the developer deployed after the last publish), then
publish promotes that DRAFT — no inflation.

**13. Publish response does not include the version number created.**
**(DISCOVERED via RQ3 experiment — 2026-02-19)**

The JSON response from `sf agent publish authoring-bundle` includes
only `{ "success": true, "botDeveloperName": "Local_Info_Agent" }`.
No version number. To discover what version was created, the developer
must retrieve the AAB and inspect `<target>` in `bundle-meta.xml`.

**14. `<target>` absent = draft state; `<target>` present = locked.**
**(CONFIRMED via RQ3 experiment, clarified by Vivek — 2026-02-20)**

The `<target>` element in `bundle-meta.xml` controls whether the org
treats the AAB as a draft or a published version:
- `<target>` absent or empty → AAB is a draft, deployable, editable
- `<target>` set (e.g., `Local_Info_Agent.v4`) → AAB is locked to
  that published version, deploy with changes fails

**Critical nuance about when `<target>` appears in local source:**
- Publishing does NOT set `<target>` in local source
- Retrieving a published/versioned AAB DOES set `<target>` in local
  source
- Retrieving a "naked" DRAFT AAB does NOT set `<target>`
- In the normal workflow (publish → keep editing → deploy), `<target>`
  is never set locally and never causes problems

**15. Deploy and publish are fundamentally different operations.**
**(CONFIRMED via RQ4 experiment — 2026-02-20)**

- `sf project deploy start` puts the AAB source file into the org as
  metadata. It does NOT create a Bot, BotVersion, GenAiPlannerBundle,
  or GenAiPlugin. The agent is not usable and is not visible in Agent
  Builder. Deploy is a metadata operation only.
- `sf agent publish authoring-bundle` deploys the AAB, compiles Agent
  Script to Agent DSL, and creates the full agent entity graph (Bot +
  BotVersion + GenAiPlannerBundle + GenAiPlugins). The agent becomes
  usable and visible.

This distinction is critical for how we frame the pipeline. Deploy
alone is not sufficient to make an agent usable — only publish does
that.

**RESOLVED — Impact on Confirmed Fact 8 (Vivek clarification
2026-02-20):** Although deploy does NOT create a Bot entity, Agent
Builder (part of Agentforce Studio) CAN see and open deployed-but-
unpublished AABs directly. Deploy creates AiAuthoringBundle metadata
in the org, which is sufficient for Agent Builder to discover and
open the AAB for canvas editing, script view editing, and built-in
preview. The Bot/GenAi* entities are only needed for the published,
usable agent — not for Builder-based editing of the configuration.
See updated Confirmed Fact 8 for the full collaboration workflow.

**16. Publish is self-contained — no prior deploy or org state needed.**
**(CONFIRMED via RQ4 experiment — 2026-02-20)**

A brand-new AAB that has never existed in the org can be published
directly with `sf agent publish authoring-bundle`. The command handles
initial deploy, compilation, and entity creation in one step. The
developer workflow does NOT require a preceding `sf project deploy
start`. The simplest pipeline is: generate → edit → validate →
publish → activate.

**17. Published NGA agents cannot be deleted via Metadata API.**
**(DISCOVERED via RQ4 experiment — 2026-02-20)**

A circular dependency chain between agent metadata types prevents
deletion of any individual component:
1. AiAuthoringBundle → "Published bundle versions cannot be deleted"
2. Bot → "setup object in use"
3. BotVersion → "referenced elsewhere...Authoring Bundle Definition
   Version"
4. GenAiPlannerBundle → "referenced elsewhere...Generative AI
   Conversation Definition Planner"

There is no Metadata API path to delete a published NGA agent. Cleanup
requires either the Salesforce Setup UI or scratch org expiration.
This has significant implications for testing workflows and scratch
org hygiene — test agents accumulate and cannot be removed via CLI.

**18. `Agent:` pseudo-type retrieve does not include AiAuthoringBundle.**
**(DISCOVERED via RQ4 experiment — 2026-02-20)**

`sf project retrieve start --metadata Agent:X` retrieves Bot,
BotVersion, GenAiPlannerBundle, and GenAiPlugin metadata but does NOT
include the AiAuthoringBundle. To see `<target>` in `bundle-meta.xml`
after publish, a separate retrieve is required:
`sf project retrieve start --metadata AiAuthoringBundle:X`

This is a gap in the Agent pseudo-type's composite behavior. The skill
should warn about this and advise using `AiAuthoringBundle:` for AAB-
specific retrieves.

**19. `sf project delete source` removes local files too.**
**(DISCOVERED via RQ4 experiment — 2026-02-20)**

When deleting org metadata via `sf project delete source`, the command
also deletes the corresponding local source files. Developers who
expect "delete from org only" will lose their local files and need to
re-create them. The skill should warn about this behavior, especially
for cleanup and testing workflows.

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
               version-suffixed AAB appears in local project
    ↓
LOCAL SOURCE UNCHANGED — <target> NOT set by publish
    ↓
CONTINUE EDITING → DEPLOY → auto-creates new DRAFT VN+1
    ↓
[Repeat edit/deploy/publish cycle]
    ↓
ACTIVATE (sf agent activate)
    ↓
ACTIVE — one version at a time, required for preview via --api-name,
         required for test execution, available for runtime channels

EDGE CASE — Retrieve after publish:
    RETRIEVE published AAB → <target> set in local bundle-meta.xml
    → deploy with changes FAILS ("content cannot be changed...")
    → CLEAR <target> from bundle-meta.xml → deploy succeeds
```

Key insight: the pro-code developer's "naked" AAB always floats to
the highest draft. Published versions are frozen snapshots with
version-suffixed names. The developer never edits a published version
— they edit the current draft and publish again. The intended post-
publish workflow is seamless: just keep editing and deploying. The
`<target>` locking issue only arises if the developer retrieves the
published version into their local source.

### Open Research Questions

These questions CANNOT be answered from documentation. They require
experimental validation against a live org.

**RQ1: Which license types qualify for `default_agent_user`?**
**RESOLVED — Outcome A.** Only "Einstein Agent" license works.
See Confirmed Facts 3, 3a, 3b, 3c above. Full experiment results
in `rf4-experiments/RQ1-agent-user-license.md`.

**RQ2: How deep is deploy validation of backing logic?**
**RESOLVED — Outcome B-minus.** Deploy validates `@InvocableMethod`
annotation presence but nothing else about the method signature.
Class must exist AND have `@InvocableMethod`. Parameter names, types,
return types, and even zero-parameter void methods all pass. Stub
classes with `@InvocableMethod` are viable. The error message for
"class exists but no @InvocableMethod" is identical to "class doesn't
exist" — bad error message #3. Additionally discovered: org enforces
deletion dependency (can't delete backing class while AAB references
it) and server-side filename versioning. See Confirmed Facts 4, 10, 11.
Full experiment results in `rf4-experiments/RQ2-deploy-validation-depth.md`.

**RQ3: What happens after publishing when the current AAB has no
draft to point to?**
**RESOLVED — Outcome A (seamless), with edge case C (from Vivek
clarification, 2026-02-20).** In the normal workflow (no post-publish
retrieve), local source is unchanged after publish — `<target>` is NOT
set. Next deploy auto-creates a new DRAFT on the server. This is the
intended design. The RQ3 experiment's Step 3 (explicit retrieve after
publish) introduced `<target>` into local source, creating the "locked"
state that the experiment then documented as a "trap." In reality, the
locking only occurs if the developer retrieves the published AAB.
Version inflation only occurs when no DRAFT exists on server. Publish
response still lacks version number. See Confirmed Facts 9, 12, 13, 14.
Full experiment results in `rf4-experiments/RQ3-post-publish-draft-behavior.md`.

**RQ4: Can you publish an AAB that has never been manually deployed?**
**RESOLVED — Both A and C confirmed (2026-02-20).**

Step 4 (deploy): Outcome **A** — `sf project deploy start` succeeds
on a fresh AAB, creating AiAuthoringBundle metadata in the org. BUT
deploy alone does NOT create a Bot entity — the agent is not usable
as an agent. However, Agent Builder CAN see and open deployed AABs
for editing. Deploy puts source in the org; it does not compile or
instantiate the agent, but it does make the AAB available for Builder-
based collaboration (see Confirmed Fact 8).

Step 5 (publish): Outcome **C** — `sf agent publish authoring-bundle`
succeeds on a fresh AAB with no prior org state. Publish handles
initial deploy + compilation + full entity creation in one step.

Additionally discovered: published agents cannot be deleted via
Metadata API (circular dependency chain), `Agent:` pseudo-type
retrieve does not include AiAuthoringBundle, and `sf project delete
source` also removes local files. See Confirmed Facts 15-19.
Full experiment results in `rf4-experiments/RQ4-publish-without-prior-deploy.md`.

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
