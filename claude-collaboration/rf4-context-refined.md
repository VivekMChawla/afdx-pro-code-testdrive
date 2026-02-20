# Reference File 4 Refined Context — Metadata & Lifecycle

## A. Purpose & Scope

This document captures the domain knowledge and structural decisions for `references/agent-metadata-and-lifecycle.md`. It is consumed by a writing agent tasked with producing RF4 — a comprehensive guide to Salesforce Agent metadata structure, the agent lifecycle (generate → deploy → publish → activate → test), and the CLI operations that manage agents throughout their lifecycle. The document preserves all confirmed facts, resolves conflicts, and eliminates redundancy to enable linear comprehension by a fresh reader.

---

## B. Conceptual Foundation

### 1. The Metadata Entity Graph

Agent metadata spans two domains that are independent until publish connects them:

```
AUTHORING DOMAIN (developer-owned, exists before any publish)
  AiAuthoringBundle
    ├── .agent (Agent Script source — editable text file)
    └── .bundle-meta.xml (metadata; optional <target> links to published version)

RUNTIME DOMAIN (created by publish)
  Bot (top-level container, one per agent)
    └── BotVersion (one per published version)
          └── GenAiPlannerBundle (versioned bundle, contains compiled agent definition)
                ├── .genAiPlannerBundle (XML: local topics, references to local actions)
                └── local action files (scoped to this version only)
```

### 2. The Authoring Domain: AiAuthoringBundle

An `AiAuthoringBundle` (AAB) is a developer-authored configuration container that holds Agent Script source code — it is NOT an agent. It consists of two files: `.agent` (the Agent Script source, editable text) and `.bundle-meta.xml` (metadata about the bundle, XML). The AAB is stored in the `aiAuthoringBundles/` directory within the package directory specified in `sfdx-project.json`.

The `<target>` element in `bundle-meta.xml` is the AAB-side pointer into the runtime domain (format: `Bot_API_Name.vN`). It controls AAB state: absent = draft (editable), present = locked to that published version.

AABs take two forms locally:

- **Naked AAB** (e.g., `Local_Info_Agent`): No version suffix in filename. Always points to the highest DRAFT version in the org. This is the only writable surface for pro-code developers. After publish, local source is unchanged (no `<target>` set). Deploying it creates or updates draft versions.

- **Version-suffixed AAB** (e.g., `Local_Info_Agent_1`, `Local_Info_Agent_2`): Published snapshots retrieved from the org. Locked by their `<target>` element. Read-only — useful for diffing, auditing, and understanding version history. Modified deploys fail; unmodified deploys succeed as misleading no-ops.

### 3. The Runtime Domain: Bot → BotVersion → GenAiPlannerBundle

Publishing an AAB creates the runtime entities that make an agent usable. `Bot` is the top-level container (one per agent). `BotVersion` represents a specific published version. `GenAiPlannerBundle` is a versioned bundle containing the compiled agent definition for that version.

`GenAiPlannerBundle` is a "bundle" metadata type — it decomposes in local source into multiple files representing topics and actions. These local components are scoped to that version of the agent only. `GenAiPlugin` and `GenAiFunction` also exist as standalone global metadata types, but the versions inside a `GenAiPlannerBundle` are local copies, not independently addressable global metadata.

Think of it as: AAB is the recipe, the runtime domain is the cooked dish, and publish is the act of cooking. The AAB is editable and versionable in the local project, stored in git. The runtime entities are the org's representation — created when the AAB is published, never edited directly.

### 4. Deploy vs. Publish: Different Operations for Different Audiences

- **Deploy** (`sf project deploy start`): Populates the authoring domain only. Puts the AAB source file into the org as `AiAuthoringBundle` metadata. Does NOT create Bot, BotVersion, or GenAiPlannerBundle. The agent is not usable for runtime or preview via `--api-name`, but it IS visible in Agent Builder (Agentforce Studio) for low-code editing. Deploy is a staging step — useful for pro-code/low-code collaboration.

- **Publish** (`sf agent publish authoring-bundle`): Populates the runtime domain. Deploys the AAB internally, compiles Agent Script to Agent DSL, and creates the entire runtime entity graph (Bot + BotVersion + GenAiPlannerBundle with local topics and actions). The agent becomes usable and visible for preview and runtime. Publish is self-contained — a brand-new AAB can be published directly with no prior deploy or org state.

---

## C. RF4 Section Outline

**7 sections, in order:**

### 1. Agent Metadata Structure
**Purpose:** Establish the complete metadata landscape before any procedure is explained.

**Must cover:**
- AiAuthoringBundle directory layout (`.agent` + `.bundle-meta.xml`; stored in `aiAuthoringBundles/` per `sfdx-project.json`)
- Published agent metadata hierarchy (Bot → BotVersion → GenAiPlannerBundle → GenAiPlugin → GenAiFunction)
- `AiEvaluationDefinition` for tests
- `Agent` pseudo metadata type (shorthand covering all agent components)
- How to locate agents in a project by reading `sfdx-project.json` and scanning directories
- Real metadata examples from `afdx-pro-code-testdrive` reference project (Bot, BotVersion, GenAiPlannerBundle, bundle-meta.xml snippets)

**Cross-references to facts:** 5, 6, 10, 18

---

### 2. Agent Metadata Lifecycle: Generate → Deploy → Publish → Activate → Test
**Purpose:** Conceptual overview before diving into detail sections.

**Must cover:**
- The full lifecycle chain as a conceptual flow
- Each step's purpose in 1-2 sentences
- Key distinction: Agent Script source (AAB) = developer's artifact; published metadata (Bot/GenAi*) = org's representation
- The big picture that connects all detail sections (analogous to "execution model" in RF1)

**Cross-references to facts:** 14, 15

---

### 3. Creating an Agent
**Purpose:** Detailed treatment of the first action in the lifecycle.

**Must cover:**
- The `sf agent generate authoring-bundle` command with REQUIRED flags:
  - `--no-spec` (prevents waiting for classic-style spec; critical gotcha)
  - `--name "<Label>"` (becomes `agent_label`)
  - `--api-name <Developer_Name>` (becomes `developer_name`)
- What the command creates (two files: `.agent` and `.bundle-meta.xml`)
- What the generated boilerplate contains
- Likely failure modes (omitting `--no-spec`, confusing `--name`/`--api-name`, omitting flags and getting interactive prompts)
- WRONG/RIGHT pairs for these failures

**Cross-references to facts:** 5, 6, 7

---

### 4. Working With Authoring Bundles
**Purpose:** Hidden oddities and non-obvious behaviors — the most valuable original content in RF4.

**Must cover:**
- "Naked" AAB always points to highest DRAFT version (Fact 18)
- Version-suffixed AABs are frozen snapshots with `<target>` locks (Fact 20, 22)
- First deploy creates DRAFT V1 (Fact 11)
- No pro-code way to create new draft versions (Builder button only) (Fact 12)
- Deploy-before-publish is legitimate for pro-code/low-code collaboration (Fact 8)
- `.a4drules` caution: NEVER deploy AAB in routine backing-code operations (Fact 8b)
- `default_agent_user` must have "Einstein Agent" license; misleading error if wrong (Fact 3, 3a, 3b)
- `default_agent_user` is immutable after first publish (Fact 3a)
- Two validation layers: CLI compile validation (syntax only) and API validation (user, backing logic) (Fact 3c, 3d)
- Deploy validates backing logic via Invocable Action registry lookup; stub classes are sufficient (Fact 4)
- Parameter names, types, return types are NOT validated at deploy — only at runtime (Fact 4, gap warning)
- Backing code defined: Apex, Flows, Prompt Templates, and other invocation targets (Fact 9)
- Server-side AAB filename includes version suffix even though local doesn't; triggers CLI warning (Fact 21)
- Post-publish workflow is seamless: local source unchanged, deploy auto-creates new DRAFT (Fact 19, happy path)
- `<target>` edge case: retrieve after publish locks AAB; clear `<target>` to resume deploying (Fact 19, recovery)
- `<target>` absent = draft; `<target>` present = locked (Fact 14)

**WRONG/RIGHT pairs:**
- Omitting `--no-spec` (waits for spec file)
- Confusing `--name` and `--api-name`
- Using non-Einstein-Agent-licensed user for `default_agent_user`
- Editing a version-suffixed AAB expecting changes to persist
- Retrieving published AAB after publish and deploying with changes
- Assuming deploy validates parameter types and return types

**Cross-references to facts:** 3, 3a, 3b, 3c, 3d, 4, 8, 8b, 9, 11, 12, 14, 18, 19, 19-edge, 20, 21, 22

---

### 5. Publishing Authoring Bundles
**Purpose:** Why publishing is needed, when to do it, what happens.

**Must cover:**
- Why publish is needed: creates the full agent entity graph (Bot, BotVersion, GenAiPlannerBundle, GenAiPlugins) from AAB source; deploy alone does NOT do this
- When to publish: after validation passes, backing code deployed (if agent has actions)
- Publish is SELF-CONTAINED: no prior deploy or org state needed (Fact 15b)
- Simplest pipeline: generate → edit → validate → publish → activate (no intermediate deploy step)
- What metadata gets created (use RQ4 inventory from Fact 15: Bot, BotVersion, GenAiPlannerBundle, GenAiPlugins with org-generated ID suffixes)
- The `<target>` element in `bundle-meta.xml` maps AAB to published version
- Multiple published versions accumulate across publish cycles
- Post-publish behavior: local source unchanged, developer can immediately continue editing and deploying (Fact 19)
- Gotcha: publish creates new version even if content unchanged, when no DRAFT exists on server (Fact 12, version inflation)
- Gotcha: publish response includes no version number — must retrieve to see what version was created (Fact 17)
- Retrieve with `AiAuthoringBundle:` (NOT `Agent:`—which omits the AAB) to see `<target>` (Fact 16)
- Use real metadata from reference project to illustrate version accumulation (v1, v2 metadata snippets)

**Cross-references to facts:** 8, 8b, 12, 14, 15a, 15b, 16, 17, 19, 26

---

### 6. Activating Published Agents
**Purpose:** How to make a published version live.

**Must cover:**
- `sf agent activate --api-name <Bot_API_Name>`
- `sf agent deactivate --api-name <Bot_API_Name>`
- Only one published version active at a time
- Published agents can ONLY be previewed if activated (Fact 1, critical requirement)
- Deactivate before replacing with different version
- Relationship between activation and runtime availability

**Cross-references to facts:** 1, 2

---

### 7. Lifecycle Operations
**Purpose:** Consolidated CLI reference for deploy, retrieve, delete, rename, test commands.

**Must cover:**

**Deploy:**
- `sf project deploy start` for backing code only (routine, excludes agent metadata)
- `sf project deploy start` with agent metadata (deliberate, part of publish pipeline)
- Deploy puts AAB source in org but does NOT create Bot entity (Fact 15a)
- WRONG/RIGHT pair: accidental AAB deploy in routine backing-code deploys

**Retrieve:**
- `sf project retrieve start --metadata Agent:X` retrieves Bot, BotVersion, GenAiPlannerBundle, GenAiPlugin
- GOTCHA: `Agent:` retrieve does NOT include AiAuthoringBundle (Fact 16)
- `sf project retrieve start --metadata AiAuthoringBundle:X` for AAB-specific retrieves
- Version history: `AiAuthoringBundle:Local_Info_Agent_*` wildcard retrieves ALL version-suffixed AABs (Fact 23)
- Without wildcard, only naked AAB returned
- Source tracking does NOT cover version-suffixed AABs (Fact 24)

**Delete:**
- Unpublished AABs: `sf project delete source --metadata AiAuthoringBundle:X` works
- WARNING: also deletes local source files (Fact 25)
- Published agents: CANNOT be deleted via Metadata API (circular dependency) (Fact 26)
- Implications for test hygiene and scratch org refresh
- Backing code: org enforces deletion dependency — cannot delete while any AAB version references it (Fact 10)

**Rename:**
- Advise against for published agents
- Create-new-and-migrate approach
- Be honest about limitations

**Test Lifecycle:**
- `sf agent test create --spec <path>` (creates AiEvaluationDefinition in org)
- `sf agent test run --name <AiEvalDef_Name> --api-name <Bot_API_Name>`
- `sf agent test resume --job-id <id>`
- Tests run against ACTIVATED published agents only
- WRONG/RIGHT pair: running tests against unpublished agent

**Open in Builder:**
- `sf org open authoring-bundle` (opens Agentforce Studio list view for all AABs)
- `sf org open agent --api-name` (queries BotDefinition; works only for published agents)

**Cross-references to facts:** 1, 8, 10, 15a, 16, 23, 24, 25, 26

---

## D. Confirmed Facts (Canonical)

Each fact is stated once, in its final authoritative framing. Corrections are fully incorporated; history of corrections is omitted.

**Fact 1: Published agents require activation for preview**
After publishing an agent (AiAuthoringBundle → Bot + GenAiPlannerBundle), it can ONLY be previewed if it has been ACTIVATED. Only one published version can be active at a time. Preview uses the Bot API name, not the planner bundle name.
- Source: `agent-dx-manage.md` + Vivek clarification, 2026-02-19

**Fact 2: Activate/deactivate commands**
`sf agent activate --api-name <Bot_API_Name>` and `sf agent deactivate --api-name <Bot_API_Name>` control which published version is live.
- Source: `agent-dx-manage.md`

**Fact 3: `default_agent_user` requires "Einstein Agent" license**
The `default_agent_user` field must reference a user with the "Einstein Agent" license type (profile: "Einstein Agent User"). Standard Salesforce-licensed users (including System Administrators) cannot be used. Mismatched license produces a misleading `"Internal Error, try again later"` error message instead of a license-specific error.
- Source: RQ1 experiment, 2026-02-19

**Fact 3a: `default_agent_user` is immutable after first publish**
Once an agent has been published, `default_agent_user` cannot be changed. Both CLI and NGA Web (Agent Builder) enforce this immutability. The agent user is permanently bound at first publish.
- Source: RQ1 experiment, 2026-02-19

**Fact 3b: CLI `sf agent validate` does NOT validate `default_agent_user`**
The `sf agent validate authoring-bundle` command checks only Agent Script syntax and compilation. User validity is checked only during `sf agent publish`, at publish time (not compile time). A developer can validate successfully and still fail at publish due to an invalid agent user.
- Source: RQ1 experiment, 2026-02-19

**Fact 3c: Two validation layers exist**
Compile validation (CLI `sf agent validate authoring-bundle`) checks only Agent Script syntax/structure. API validation (runs during `sf agent publish` and in NGA Web Agent Builder) checks `default_agent_user` validity and backing logic references. Until the Agentforce team integrates API validation into the CLI, developers will see validation pass but publish fail for these classes of errors.
- Source: RQ1 experiment + Vivek clarification, 2026-02-19

**Fact 3d: Retracted claim about pre-existing BotVersion**
An earlier claim that deploy requires a pre-existing BotVersion is WRONG. Deploy works for AABs in orgs with no prior Bot infrastructure. This is the foundation for pro-code/low-code collaboration.
- Source: RQ1 experiment, 2026-02-19 (Vivek correction)

**Fact 4: Deploy validates backing logic via Invocable Action registry lookup**
Deploying an AAB validates that every backing logic reference resolves to a registered Invocable Action in the org. The referenced class/flow/prompt must exist AND (for Apex classes) must have an `@InvocableMethod`-annotated method. Deploy validation does NOT check parameter names, types, return types, or whether the method has parameters. Stub classes with `@InvocableMethod` are sufficient to unblock deployment. Parameter/type mismatches are caught only at runtime.
- Source: RQ2 experiment, 2026-02-19

**Fact 5: Generation command syntax**
`sf agent generate authoring-bundle --no-spec --name "<Label>" --api-name <Developer_Name>` creates a `.agent` file and `.bundle-meta.xml`. The `--no-spec` flag is required (prevents waiting for a classic-style agent spec file). `--name` becomes `agent_label`; `--api-name` becomes `developer_name`.
- Source: Brain dump (Vivek), session 11

**Fact 6: What generation creates**
The command creates two files in `aiAuthoringBundles/<API_name>/`: the `.agent` source file (editable) and `.bundle-meta.xml` (metadata, initially without `<target>`).
- Source: `agent-dx-nga-authbundle.md`

**Fact 7: Backing code definition**
"Backing code" means Apex classes, Flows, Prompt Templates, and any other metadata that agent actions reference as invocation targets. These components actually execute when an agent action fires.
- Source: Brain dump (Vivek), session 11

**Fact 8: Deploy-before-publish is legitimate for pro-code/low-code collaboration**
Deploy (without publish) puts the AAB into the org as `AiAuthoringBundle` metadata, making it visible in Agent Builder for low-code editing. This is not a failed workflow — it is the foundation for pro-code/low-code collaboration. Pro-code developers author Agent Script locally, deploy to get it into Builder, low-code users refine in Builder, and pro-code developers retrieve and continue. Deploy/retrieve are one-way overwrites with no sync warnings.
- Source: RQ4 experiment + Vivek clarification, 2026-02-20

**Fact 8b: Never deploy AAB in routine backing-code operations**
The `.a4drules` caution: NEVER deploy `.agent` or `AiAuthoringBundle` metadata in routine deploys of backing code. When deploying backing code (Apex, Flows, etc.), exclude agent metadata unless explicitly publishing the agent.
- Source: `.a4drules/agent-script-rules-no-edit.md`

**Fact 9: Backing code deletion enforcement**
The org tracks hard dependencies between AAB versions and their backing Apex classes. Attempting to delete a backing class while any AAB version references it fails with a dependency error. To delete a backing class, update the AAB to remove the reference, deploy, then delete the class.
- Source: RQ2 experiment, 2026-02-19

**Fact 10: Server-side AAB filename includes version suffix**
When deploying a local AAB (`Local_Info_Agent.agent`), the server uses a version-suffixed filename (`Local_Info_Agent_4.agent`), triggering a CLI warning about the file not being found in the local project. This reflects the "naked AAB = highest draft" behavior.
- Source: RQ2 experiment, 2026-02-19

**Fact 11: First deploy creates DRAFT V1**
The first time an AAB is deployed to an org (if unpublished), the org creates DRAFT V1. This is the starting state for a new agent.
- Source: Brain dump (Vivek), session 11

**Fact 12: No pro-code way to create new draft versions**
No CLI command creates a new DRAFT version. The only way to create additional DRAFT versions is via Agent Builder's "create new draft version" button on a published version, resulting in multiple DRAFT versions in the org. These draft versions can be retrieved with their version number (`AiAuthoringBundle:Local_Info_Agent_3`).
- Source: Brain dump (Vivek), session 11

**Fact 13: Publish is self-contained**
A brand-new AAB can be published directly with `sf agent publish authoring-bundle` with no prior deploy or org state. Publish handles initial deploy, compilation, and entity creation in one step. The simplest pipeline is: generate → edit → validate → publish → activate.
- Source: RQ4 experiment, 2026-02-20

**Fact 14: `<target>` controls draft/locked state**
The `<target>` element in `bundle-meta.xml` controls AAB state. Absent `<target>` = draft (deployable, editable). Present `<target>` (e.g., `Local_Info_Agent.v4`) = locked to that published version (modified deploys fail).
- Source: RQ3 experiment + Vivek clarification, 2026-02-20

**Fact 15a: Deploy vs. publish distinction**
`sf project deploy start` puts the AAB source file into the org as metadata. It does NOT create a Bot, BotVersion, GenAiPlannerBundle, or GenAiPlugin. The agent is not usable and cannot be previewed via `--api-name`. Deploy is a metadata operation only.
- Source: RQ4 experiment, 2026-02-20

**Fact 15b: What publish does**
`sf agent publish authoring-bundle` deploys the AAB, compiles Agent Script to Agent DSL, and creates the full agent entity graph (Bot + BotVersion + GenAiPlannerBundle + GenAiPlugins with org-generated ID suffixes). The agent becomes usable and visible.
- Source: RQ4 experiment, 2026-02-20

**Fact 16: `Agent:` pseudo-type retrieve omits AiAuthoringBundle**
`sf project retrieve start --metadata Agent:X` retrieves Bot, BotVersion, GenAiPlannerBundle, and GenAiPlugin but does NOT include AiAuthoringBundle. To see `<target>` after publish, use `sf project retrieve start --metadata AiAuthoringBundle:X`.
- Source: RQ4 experiment, 2026-02-20

**Fact 17: Publish response lacks version number**
The `sf agent publish authoring-bundle` response does not include the version number of the published version. The developer must retrieve with `AiAuthoringBundle:` (NOT `Agent:`, which omits AABs — see Fact 16) to determine what version was created.
- Source: RQ3 experiment, 2026-02-20

**Fact 18: "Naked" AAB always points to highest DRAFT**
An `AiAuthoringBundle` without a version suffix (e.g., `Local_Info_Agent`) is tied to the highest DRAFT version in the org. Version-suffixed AABs (e.g., `Local_Info_Agent_1`) are published snapshots. No matter how many times the AAB is published, the "naked" AAB in pro-code source always points to the highest draft.
- Source: Vivek clarification, 2026-02-19

**Fact 19: Post-publish workflow is seamless**
After publishing, `<target>` in `bundle-meta.xml` is NOT automatically updated in local source. The local source stays clean. The developer can immediately continue editing and deploy, and the platform auto-creates a new DRAFT version on the server. The intended workflow is: publish → keep editing → deploy (auto-creates new draft).
- Source: RQ3 experiment + Vivek clarification, 2026-02-20

**Fact 19-edge: Retrieve after publish locks AAB**
If a developer retrieves the AAB after publishing (e.g., `sf project retrieve start --metadata AiAuthoringBundle:Local_Info_Agent`), the retrieved `bundle-meta.xml` WILL have `<target>` set, locking the local AAB. Subsequent deploys with content changes fail. Recovery: remove `<target>` from `bundle-meta.xml` and deploy.
- Source: RQ3 experiment, 2026-02-20

**Fact 20: Version-suffixed AABs are immutable snapshots**
Retrieved version-suffixed AABs (e.g., `Local_Info_Agent_3`) contain full Agent Script (.agent files) but are locked by their `<target>` element. Content modifications fail on deploy; unmodified deploys succeed as misleading no-ops. The naked AAB is the only writable surface.
- Source: RQ5 experiment, 2026-02-20

**Fact 21: Wildcard retrieve returns all version-suffixed AABs**
`sf project retrieve start -m "AiAuthoringBundle:Local_Info_Agent_*"` retrieves ALL version-suffixed AABs. Without the wildcard, only the naked AAB is returned. This is the pattern for version history inspection, diffing, and auditing.
- Source: RQ5 experiment, 2026-02-20

**Fact 22: Source tracking does not cover version-suffixed AABs**
Deploying a version-suffixed AAB generates source tracking timeout warnings. The org's source tracking system does not recognize version-suffixed AABs as tracked entities.
- Source: RQ5 experiment, 2026-02-20

**Fact 23: Unmodified deploy of version-suffixed AAB is misleading**
Deploying a version-suffixed AAB without content changes reports `success: true` and `created: true`, but nothing meaningful happens. Automation checking deploy success could be fooled.
- Source: RQ5 experiment, 2026-02-20

**Fact 24: Published agents cannot be deleted via Metadata API**
A circular dependency chain between agent metadata types prevents deletion. There is no Metadata API path to delete a published NGA agent. Cleanup requires the Salesforce Setup UI or scratch org expiration.
- Source: RQ4 experiment, 2026-02-20

**Fact 25: `sf project delete source` removes local files**
When deleting org metadata via `sf project delete source`, the command also deletes the corresponding local source files. Developers expecting "delete from org only" will lose their local files.
- Source: RQ4 experiment, 2026-02-20

**Fact 26: Publishing creates new version with no DRAFT on server**
If no DRAFT exists on the server (after a prior publish with no subsequent deploy), `sf agent publish` creates a new published version even if content is identical to the last published version (version inflation). This occurs only when no existing DRAFT exists on server.
- Source: RQ3 experiment + Vivek clarification, 2026-02-20

---

## E. AAB Lifecycle Model

The lifecycle is a state machine with more states and transitions than source documentation reveals:

```
GENERATE (sf agent generate authoring-bundle)
    ↓
LOCAL ONLY — AAB exists in local project, not in org
    ↓
DEPLOY to org (explicit or as part of publish)
    ↓
DRAFT V1 in org — editable in Builder, previewable via --authoring-bundle
    ↓
[Optional: low-code user creates new draft versions in Builder]
    ↓
DRAFT VN in org — "naked" local AAB always points to highest draft (Fact 18)
    ↓
PUBLISH (sf agent publish authoring-bundle)
    ↓
PUBLISHED VN — version locked, Bot/GenAi* metadata created,
               version-suffixed AAB appears in local project (Fact 15b)
    ↓
LOCAL SOURCE UNCHANGED — <target> NOT set by publish (Fact 19)
    ↓
CONTINUE EDITING → DEPLOY → auto-creates new DRAFT VN+1
    ↓
[Repeat edit/deploy/publish cycle]
    ↓
ACTIVATE (sf agent activate --api-name)
    ↓
ACTIVE — one version at a time, required for preview via --api-name (Fact 1),
         required for test execution, available for runtime channels
    ↓
[Optional: DEACTIVATE (sf agent deactivate --api-name)]
    ↓
INACTIVE — unpublished but not deleted (cannot delete via CLI due to
           circular dependencies) (Fact 24)

EDGE CASE — Retrieve after publish (not part of normal workflow):
    RETRIEVE published AAB → <target> set in local bundle-meta.xml (Fact 19-edge)
    → deploy with changes FAILS ("content cannot be changed...")
    → CLEAR <target> from bundle-meta.xml (recovery)
    → deploy succeeds → auto-creates new DRAFT
```

**Key insight:** The pro-code developer's "naked" AAB always floats to the highest draft. Published versions are frozen snapshots with version-suffixed names. The developer never edits a published version — they edit the current draft and publish again. The intended post-publish workflow is seamless: just keep editing and deploying. The `<target>` locking only happens if the developer explicitly retrieves the published version.

---

## F. Writing Insights

These instructions guide how to write RF4. Each is directive and must be reflected in the final content.

**Structure and tone:**
- RF4 is a procedures manual with a conceptual foundation. Sections 1-2 build understanding (metadata structure and lifecycle overview). Sections 3-6 teach specific procedures. Section 7 consolidates commands for reference. After the conceptual setup, tone should be direct and operational.

**Section 3 priority:**
- Creating an agent is where LLMs fail most consistently. This section needs more depth than "one command, two outputs." Capture specific failure modes (omitting `--no-spec`, confusing `--name`/`--api-name`, omitting flags and getting interactive prompts). Include WRONG/RIGHT pairs for each failure mode.

**Section 4 value:**
- AAB oddities are the most valuable content in this file. The consuming agent cannot learn the "naked AAB points to highest draft" behavior from any existing documentation. Section 4 is where RF4 adds the most value. Invest tokens here. The hidden behaviors (Fact 18, 19, 19-edge, 20) are what distinguish RF4 from source docs.

**Critical distinctions:**
- Deploy vs. publish is the most important distinction in RF4. Deploy = metadata operation (puts AAB source in org). Publish = full entity creation (Bot + BotVersion + GenAiPlannerBundle + GenAiPlugins). This must be crystal clear early (Section 2) and reinforced (Sections 5 and 7).
- The deploy distinction is critical: deploying backing code (routine, excludes agent metadata) vs. deploying agent metadata (deliberate, part of the publish pipeline). WRONG/RIGHT pair required.
- Published metadata is read-only context, not write targets. The consuming agent never edits Bot, BotVersion, or GenAiPlannerBundle files directly. Make this clear to prevent the consuming agent from trying to modify published metadata.

**Happy paths vs. edge cases:**
- Publish is the streamlined happy path: generate → validate → publish → activate. No intermediate deploy step. Present this as the default pipeline.
- The post-publish workflow is seamless — teach it as the happy path (Fact 19). After publishing, the developer just keeps editing and deploying. The platform auto-creates new DRAFTs. No special steps needed. The `<target>` locking only happens if the developer retrieves the published AAB into local source — teach this as an edge case recovery, not the normal workflow.

**Deploy-before-publish clarification:**
- Deploy before publish is legitimate for specific use cases (pro-code/low-code collaboration — Fact 8), but it is NOT the default workflow. Publish is self-contained and can be done first.

**Validation gap warning:**
- The deploy-runtime validation gap is a trap (Fact 4). Deploy validates only that referenced classes have `@InvocableMethod`. It does NOT validate parameter names, types, or return types. A developer can deploy an AAB with completely wrong I/O definitions and not discover the problem until conversation/preview. Explicitly warn about this gap and advise deploying fully implemented (not just stub) classes when possible.

**Stub classes as a workflow tool:**
- Stub classes are a real workflow tool, not just a workaround (Fact 4). A minimal class with `@InvocableMethod` unblocks AAB deployment for pro-code/low-code collaboration. Teach stub creation as a deliberate pattern, with a clear warning about the runtime gap.

**License gotcha:**
- `default_agent_user` requires "Einstein Agent" license — no exceptions (Fact 3). Standard Salesforce users, even System Administrators, will fail with a misleading error. This is immutable after first publish (Fact 3a). Emphasize that getting it right on the first publish is critical.

**Immutability and constraints:**
- Deletion has hidden dependency enforcement (Fact 9). Backing code can't be deleted while any AAB version references it. Teach the correct cleanup sequence: update AAB → deploy → delete old class. This matters for refactoring workflows.
- Published agents can't be deleted via CLI (Fact 24) — a major lifecycle fact. Test agents in scratch orgs accumulate. Implications: use unique names for test agents, don't over-publish in scratch orgs, consider org refresh cadence.
- Version-suffixed AABs are read-only reference copies, not editable branches (Fact 20). Teach wildcard retrieve (`AiAuthoringBundle:Local_Info_Agent_*`) for version history inspection and diffing, but make clear that ALL edits must go through the naked AAB. WRONG/RIGHT pair: "Don't edit a version-suffixed AAB expecting to update that version."
- Rename is hazardous — don't oversell capability (Fact 8b). The metadata hierarchy makes renaming complex. Advise creating a new agent and migrating. Be honest about limitations.

**Practical tools and patterns:**
- The `Agent` pseudo metadata type saves time (Fact 16). Instead of specifying every individual metadata type, `Agent:X` covers them all. The consuming agent should use this by default. But warn: `Agent:` retrieve does not include AiAuthoringBundle.
- `<target>` is the draft/published toggle, but rarely encountered in normal workflow (Fact 14). Absent = draft, present = locked. The consuming agent should know this mechanism exists (for debugging) but should NOT be taught to fear it or routinely clear it. It only appears locally when a published/versioned bundle is retrieved.
- Unmodified deploys of version-suffixed AABs are misleading (Fact 23). They report `success: true` and `created: true` but nothing happens. Warn if covering version-suffixed deploy behavior.
- `sf project delete source` removes local files too (Fact 25). Developers will expect "delete from org only" and lose local source. WRONG/RIGHT pair needed.
- Publish response doesn't include version number (Fact 17). The developer must retrieve with `AiAuthoringBundle:` (NOT `Agent:`) to see what version was created.

**Concrete illustration:**
- Use real metadata from the reference project to illustrate structure and version accumulation. Show what happens across two publish cycles: first publish creates `v1.botVersion-meta.xml` + `Local_Info_Agent_v1.genAiPlannerBundle`, second publish creates `v2.botVersion-meta.xml` + `Local_Info_Agent_v2.genAiPlannerBundle`, and `<target>` updates to `Local_Info_Agent.v2`. Use real snippets, not abstract descriptions.
- Version accumulation needs concrete illustration using reference project data.

**Section 7 structure:**
- Section 7 is reinforcement, not redundancy. CLI commands introduced in detail sections (3-6) reappear in Section 7 as a consolidated reference. This is intentional — the consuming agent may arrive at Section 7 directly for a lifecycle operation without reading the full context above.

---

## G. Error Inventory Reference

The following bad error messages were discovered during experimentation. The canonical inventory is in `collaboration-context.md`. This is a quick-reference for the writing agent to include context around these gotchas.

| Trigger | Error Message | What's Wrong |
|---------|---------------|--------------|
| Using non-Einstein-Agent user for `default_agent_user` | `"Internal Error, try again later"` | Misleading — does not indicate license issue. Developers waste time debugging. |
| Class exists but lacks `@InvocableMethod` annotation | `"Couldn't find..."` (same as missing class) | Identical error for two different problems. Developers can't distinguish between missing class and missing annotation. |
| Deploy response for modified version-suffixed AAB | Component appears in both `componentSuccesses` AND `componentFailures` simultaneously with `numberComponentErrors: 0` | Contradictory response — confuses parsing automation. |
| Server-side AAB filename versioning | `"AiAuthoringBundle, Local_Info_Agent_4.agent, returned from org, but not found in the local project"` | Misleading — reflects normal behavior but sounds like an error. |
| Source tracking for version-suffixed AABs | `"Polling for 1 SourceMembers timed out"` | Incomplete error message; no guidance on resolution. |

---

## H. Provenance Appendix

This section documents which experiments tested which research questions and where the full results live. No facts are restated — only references.

**RQ1: Which license types qualify for `default_agent_user`?**
- Outcome: A (definitively resolved)
- Tested: License type requirements for `default_agent_user`
- Result: Only "Einstein Agent" license works. Immutability after first publish confirmed. Two validation layers identified (compile vs. API validation).
- Full results: `rf4-experiments/RQ1-agent-user-license.md`
- Facts: 3, 3a, 3b, 3c, 3d

**RQ2: How deep is deploy validation of backing logic?**
- Outcome: B-minus (partially resolved)
- Tested: Deploy validation depth for Apex/Flow references
- Result: Deploy validates `@InvocableMethod` annotation presence only. Parameter names, types, return types not validated. Stub classes viable. Org enforces deletion dependency between AABs and backing code. Server-side filename versioning observed.
- Full results: `rf4-experiments/RQ2-deploy-validation-depth.md`
- Facts: 4, 9, 10

**RQ3: What happens after publishing when no DRAFT exists to resume from?**
- Outcome: A (happy path), with edge case C (retrieve-locks behavior)
- Tested: Post-publish draft creation and `<target>` behavior
- Result: Normal workflow (no post-publish retrieve) leaves local source unchanged. Next deploy auto-creates new DRAFT. Edge case: explicit retrieve after publish sets `<target>`, locking AAB. Version inflation occurs only when no existing DRAFT on server. Publish response lacks version number.
- Full results: `rf4-experiments/RQ3-post-publish-draft-behavior.md`
- Facts: 14, 17, 19, 19-edge, 26

**RQ4: Can you publish an AAB that has never been manually deployed?**
- Outcome: Both A and C confirmed
- Tested: Deploy behavior on fresh AAB; publish self-containment; published agent deletion constraints; retrieve/delete limitations
- Result: Deploy succeeds on fresh AAB, creating AiAuthoringBundle metadata but NO Bot entity. Agent Builder can still see and edit deployed AABs. Publish is self-contained, can succeed with no prior deploy. Published agents cannot be deleted via CLI (circular dependency). `Agent:` retrieve omits AiAuthoringBundle. `sf project delete source` also removes local files.
- Full results: `rf4-experiments/RQ4-publish-without-prior-deploy.md`
- Facts: 8, 13, 15a, 15b, 16, 24, 25

**RQ5: Can version-suffixed AABs be deployed independently, and what constraints apply?**
- Outcome: B (constrained/immutable)
- Tested: Version-suffixed AAB deploy behavior; wildcard retrieve; source tracking coverage
- Result: Version-suffixed AABs are immutable snapshots locked by `<target>`. Modified deploys fail; unmodified deploys succeed as no-ops. Wildcard retrieve (`AiAuthoringBundle:*`) retrieves all versions. Source tracking does not cover version-suffixed AABs. Naked AAB is the only writable surface.
- Full results: `rf4-experiments/RQ5-versioned-aab-deploy.md`
- Facts: 20, 21, 22, 23

---

## I. Source Documents Reference

This list indicates which source documents were read for RF4 and where they are located. The writing agent should reference these when seeking authoritative guidance.

1. **`salesforcedocs/.../agent-dx/agent-dx-metadata.md`** — AiAuthoringBundle structure and agent metadata hierarchy
2. **`salesforcedocs/.../agent-dx/agent-dx-nga-authbundle.md`** — Generating authoring bundles
3. **`salesforcedocs/.../agent-dx/agent-dx-nga-publish.md`** — Publishing workflow
4. **`salesforcedocs/.../agent-dx/agent-dx-manage.md`** — Activate/deactivate and agent management
5. **`salesforcedocs/.../agent-dx/agent-dx-synch.md`** — Deploy/retrieve/delete commands
6. **`salesforcedocs/.../agent-dx/agent-dx-reference.md`** — Agent spec YAML property reference
7. **`salesforcedocs/.../agent-dx/agent-dx-test.md`** — Testing overview
8. **`.a4drules/agent-testing-rules-no-edit.md`** (AUTHORITATIVE) — Full test rules and workflow
9. **`.a4drules/agent-script-rules-no-edit.md`** (AUTHORITATIVE) — Lifecycle operations and deployment caution
10. **Real published metadata files** (from `afdx-pro-code-testdrive/force-app/`) — Bot, BotVersion, GenAiPlannerBundle, bundle-meta.xml examples
11. **`sfdx-project.json`** (reference project) — Package directory configuration

