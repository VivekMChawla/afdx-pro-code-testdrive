# Agent Metadata and Lifecycle Management

## Table of Contents

1. Agent Metadata Structure
2. Generating an Agent
3. Deploy → Publish → Activate Pipeline
4. Published Agent Metadata
5. Retrieve and Sync
6. Agent Management
7. Delete and Rename
8. Test Lifecycle

---

## 1. Agent Metadata Structure

An Agent Script agent is stored as an `AiAuthoringBundle` — a directory containing two files. The bundle lives under `aiAuthoringBundles/<API_Name>/` within the package directory.

**Locate the package directory:** Read `sfdx-project.json` at the project root. The `packageDirectories` array contains entries with a `path` field (commonly `force-app`, but not guaranteed) and a `default` flag. Use the path marked `"default": true`. All metadata types live under `<packageDirectory>/main/default/`.

**Contents of an AiAuthoringBundle:**

- `<API_Name>.agent` — The Agent Script source file. This is where you write topics, actions, variables, and all Agent Script code.
- `<API_Name>.bundle-meta.xml` — Metadata about the bundle. Contains a `<bundleType>AGENT</bundleType>` element and (after publishing) a `<target>` element showing the most recently published version.

**How to locate agents in a project:**

1. Read `sfdx-project.json` for the default package directory path
2. Navigate to `<path>/main/default/aiAuthoringBundles/`
3. Each subdirectory name is an agent API name (e.g., `Local_Info_Agent`)
4. The `.agent` file inside has the same name

**Published Agent Metadata Hierarchy** [SOURCE: agent-dx-metadata (lines 1-16)]:

After an agent is published, the platform creates a full metadata hierarchy in the org and retrieves it to the local project:

- **Bot** — Container metadata at `bots/<API_Name>/<API_Name>.bot-meta.xml`. Top-level agent definition with `agentDSLEnabled: true`, agent type, and user context. [SOURCE: Local_Info_Agent.bot-meta.xml (lines 1-17)]
- **BotVersion** — Version records at `bots/<API_Name>/vN.botVersion-meta.xml`. Minimal metadata — just a `<fullName>vN</fullName>` element. [SOURCE: Local_Info_Agent v1.botVersion-meta.xml (lines 1-4)]
- **GenAiPlannerBundle** — Full expanded agent definition at `genAiPlannerBundles/<API_Name>_vN/<API_Name>_vN.genAiPlannerBundle`. Contains `localTopics` (all topics with full definitions), `localActions` (actions with targets), and org-generated ID suffixes (e.g., `_16jDL000000Cb11`). Version-suffixed directory names. [SOURCE: Local_Info_Agent_v1.genAiPlannerBundle (lines 1-49)]
- **GenAiPlugin & GenAiFunction** — Individual topic and action definitions within the planner bundle. These are org-generated; you do not edit them directly.

All published metadata is org-generated. The consuming agent does NOT edit Bot, BotVersion, or GenAiPlannerBundle files directly. Edit the `.agent` source file, then publish to update these files.

---

## 2. Generating an Agent

Create a new agent using the `sf agent generate authoring-bundle` command [SOURCE: agent-dx-nga-authbundle (lines 1-30)]:

```bash
sf agent generate authoring-bundle --api-name <API_NAME>
```

Replace `<API_NAME>` with the agent's unique identifier (letters, numbers, underscores; no spaces). The command creates two files:

- `<API_NAME>.agent` — Empty shell Agent Script file ready for editing
- `<API_NAME>.bundle-meta.xml` — Metadata wrapper for the bundle

Both files are created in `aiAuthoringBundles/<API_NAME>/` under the default package directory. The `.agent` file is where all Agent Script code goes.

---

## 3. Deploy → Publish → Activate Pipeline

The lifecycle moves an agent from local development to a running state in a Salesforce org through three distinct steps.

### Deploy: Backing Code Dependencies

Before publishing an agent, all backing logic must exist in the org. Deploy Apex classes, Flows, Prompt Templates, and any other dependencies your agent's actions require.

```bash
sf project deploy start --source-dir force-app/main/default/classes --json
```

Deploy each dependency type before (or concurrent with) agent deployment. Publishing fails if dependencies are missing from the org. [SOURCE: agent-dx-nga-publish (lines 15-25)]

**CRITICAL CAUTION — NEVER deploy AiAuthoringBundle in routine deploys** [SOURCE: agent-script-rules (lines 64-65)]:

WRONG: Deploying agent metadata with backing code
```bash
# WRONG — this accidentally deploys the agent metadata
sf project deploy start --source-dir force-app/main/default/ --json
```

RIGHT: Deploying only backing code
```bash
# CORRECT — deploy Apex, Flows, etc. without agent metadata
sf project deploy start --source-dir force-app/main/default/classes --json
```

Deploying the `AiAuthoringBundle` creates or updates the agent definition in the org. This should only happen as part of the intentional publish workflow, not as a side effect of routine backing-code deploys.

### Publish: Commit and Hydrate

Once backing code is deployed, publish the agent to commit a version and create the full metadata structure:

```bash
sf agent publish authoring-bundle --api-name <API_NAME> --json
```

Publishing does the following [SOURCE: agent-dx-nga-publish (lines 30-45)]:

1. Validates the `.agent` file for syntax errors
2. Commits the current Agent Script as a version (tracked via BotVersion files)
3. Hydrates Bot/GenAi* metadata in the org
4. Auto-retrieves the hydrated metadata back to the local project

After publish, new files appear in your local project: a Bot container, BotVersion files, and GenAiPlannerBundle directories (see Section 4 for structure).

### Activate: Make Live

One published version can be active at a time. The active version is what the runtime uses for previews and customer conversations.

```bash
sf agent activate --api-name <Bot_API_Name> --json
```

Replace `<Bot_API_Name>` with the agent's API name (the same one used for publish). The command makes that agent's most recent published version live.

To deactivate (take the agent offline without deleting it):

```bash
sf agent deactivate --api-name <Bot_API_Name> --json
```

[SOURCE: agent-dx-manage (lines 30-45)]

---

## 4. Published Agent Metadata

After publishing, several new files appear in the local project. Understanding this structure helps you navigate the file system and verify publish succeeded.

**Bot Container** — Located at `bots/<API_Name>/<API_Name>.bot-meta.xml`.

Sample (from Local_Info_Agent):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Bot xmlns="http://soap.sforce.com/2006/04/metadata">
    <agentDSLEnabled>true</agentDSLEnabled>
    <agentType>EinsteinServiceAgent</agentType>
    <botMlDomain>
        <label>Local Info Agent</label>
        <name>Local_Info_Agent</name>
    </botMlDomain>
    <botUser>afdx-agent@testdrive.org05e7916a-ce7e-4015-b412-20ce15bdc091</botUser>
    <description>A next-gen agent for Coral Cloud Resort...</description>
    <label>Local Info Agent</label>
    <type>ExternalCopilot</type>
</Bot>
```

The Bot is the top-level agent definition. It declares the agent name, type, and which user context it runs under.

**BotVersion Files** — Located at `bots/<API_Name>/vN.botVersion-meta.xml`.

Each published version gets a version record:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<BotVersion xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>v1</fullName>
</BotVersion>
```

These are minimal — just version identifiers. The actual expanded definition is in the GenAiPlannerBundle.

**GenAiPlannerBundle** — Located at `genAiPlannerBundles/<API_Name>_vN/<API_Name>_vN.genAiPlannerBundle`.

This is the full expanded agent definition. It contains `<localTopicLinks>` (references to all topics), `<localTopics>` (full topic definitions with instructions), and org-generated IDs appended to topic names (e.g., `off_topic_16jDL000000Cb11`). Version numbers are suffixed to directory names (`Local_Info_Agent_v1`, `Local_Info_Agent_v2`). [SOURCE: Local_Info_Agent_v1.genAiPlannerBundle structure]

**The `<target>` Element in bundle-meta.xml** — Located in `aiAuthoringBundles/<API_Name>/Local_Info_Agent.bundle-meta.xml`.

After publishing and retrieving, the authoring bundle's metadata file includes:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<AiAuthoringBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <bundleType>AGENT</bundleType>
    <target>Local_Info_Agent.v2</target>
</AiAuthoringBundle>
```

The `<target>` element maps the authoring bundle to the most recently published version. Format: `<Bot_API_Name>.vN`. This appears only after publish + retrieve.

**Version Accumulation** — Multiple published versions accumulate:

After first publish:
- `bots/Local_Info_Agent/v1.botVersion-meta.xml`
- `genAiPlannerBundles/Local_Info_Agent_v1/Local_Info_Agent_v1.genAiPlannerBundle`
- `aiAuthoringBundles/Local_Info_Agent/Local_Info_Agent.bundle-meta.xml` with `<target>Local_Info_Agent.v1</target>`

After second publish:
- `bots/Local_Info_Agent/v1.botVersion-meta.xml` (unchanged)
- `bots/Local_Info_Agent/v2.botVersion-meta.xml` (new)
- `genAiPlannerBundles/Local_Info_Agent_v1/Local_Info_Agent_v1.genAiPlannerBundle` (unchanged)
- `genAiPlannerBundles/Local_Info_Agent_v2/Local_Info_Agent_v2.genAiPlannerBundle` (new)
- `aiAuthoringBundles/Local_Info_Agent/Local_Info_Agent.bundle-meta.xml` with `<target>Local_Info_Agent.v2</target>` (updated)

Only one version can be active at a time. The `<target>` always points to the most recent version, regardless of which version is active.

---

## 5. Retrieve and Sync

Retrieve all agent components from the org using the `Agent` pseudo metadata type [SOURCE: agent-dx-synch (lines 15-45)]:

```bash
sf project retrieve start --metadata Agent:<API_Name> --json
```

The `Agent` pseudo metadata type is shorthand for all agent components: Bot, BotVersion, GenAiPlannerBundle, GenAiPlugin, and GenAiFunction. A single command pulls everything.

**When to retrieve:**

- After publishing an agent (to get the hydrated metadata locally)
- When starting from an org-built agent created in Agent Builder (to get local copies)
- When syncing team changes (after a teammate publishes a new version)

**To retrieve only the authoring bundle** (without published versions):

```bash
sf project retrieve start --metadata AiAuthoringBundle:<API_Name> --json
```

This pulls just the source `.agent` file and `bundle-meta.xml`, not the Bot/GenAi* metadata.

---

## 6. Agent Management

Open an agent in Agent Builder (the web UI) for visual inspection or manual adjustments:

```bash
sf org open agent --api-name <Agent_API_Name> --json
```

This opens the published agent's web interface. Useful for visual review of the agent structure, but the consuming agent's primary workflow is CLI-based.

**Checking Agent Status:**

An agent is active if one of its published BotVersion files corresponds to a running agent. In the local project, check `bots/<API_Name>/` for version files. If a BotVersion exists for a version, it has been published. To determine which is active, either use Agent Builder or inspect deployment logs from your most recent publish/activate commands.

Deactivate a published version before making significant changes to ensure preview and runtime don't use stale logic:

```bash
sf agent deactivate --api-name <Bot_API_Name> --json
```

---

## 7. Delete and Rename

### Delete Mechanics

Delete an agent by removing its metadata. Deactivate first if it has an active published version.

**Step 1: Deactivate**

```bash
sf agent deactivate --api-name <Bot_API_Name> --json
```

**Step 2: Delete Local Artifacts**

Remove the authoring bundle directory from your local project:

```bash
rm -rf force-app/main/default/aiAuthoringBundles/<API_Name>
```

**Step 3: Delete from Org**

Delete agent metadata from the org using one of two approaches:

Option A — Delete authoring bundle and associated agent metadata:
```bash
sf project delete source --metadata AiAuthoringBundle:<API_Name> --json
```

This removes the authoring bundle AND the associated Bot/BotVersion/GenAiPlannerBundle metadata, but preserves Apex/Flow backing code.

Option B — Delete all agent components:
```bash
sf project delete source --metadata Agent:<API_Name> --json
```

This removes all agent metadata (everything Option A removes, plus any lingering GenAiPlugin/GenAiFunction metadata). Use this for a complete cleanup.

[SOURCE: agent-dx-synch (lines 46-65)]

**Backing code persists** — Delete operations remove agent metadata only, not the Apex classes, Flows, or Prompt Templates backing your actions. Delete those separately if no other agents use them.

### Rename Mechanics

Renaming a published agent is complex because the API name appears in multiple locations: the Bot directory, the BotVersion directory, the GenAiPlannerBundle directory, and the AiAuthoringBundle directory. Platform tooling for rename is limited.

**Recommended approach:** Create a new agent with the desired name, migrate the Agent Script source from the old agent to the new one, publish the new agent, activate it, then delete the old agent. This is cleaner and less error-prone than renaming across the metadata hierarchy.

If you must rename, be aware that published versions may require additional steps in the org (deactivation, re-publication, or manual cleanup). Inform the developer of the implications before proceeding.

---

## 8. Test Lifecycle

Agent tests are defined in YAML test specs and deployed as `AiEvaluationDefinition` metadata. Tests run only against activated published agents (not authoring bundles).

**Step 1: Create Test in Org**

```bash
sf agent test create --spec specs/<Agent_Name>-testSpec.yaml --api-name <Test_API_Name> --json
```

This takes a local test spec YAML file (see RF5 for test spec authoring) and creates an `AiEvaluationDefinition` in the org. The test spec itself is NOT deployable metadata — it's an intermediate artifact used to create the definition. The metadata is retrieved to your local project at `aiEvaluationDefinitions/<Test_API_Name>.aiEvaluationDefinition-meta.xml`.

[SOURCE: agent-testing-rules (lines 180-190)]

**Step 2: Run Tests**

```bash
sf agent test run --name <AiEvalDef_Name> --api-name <Bot_API_Name> --json
```

Replace `<AiEvalDef_Name>` with the test definition's API name (what you passed to `--api-name` during create). Replace `<Bot_API_Name>` with the agent's API name.

Tests execute against the ACTIVATED published version of the agent. If no version is active, the test fails. [SOURCE: agent-testing-rules (lines 58-62), agent-dx-test (lines 15-20)]

**Step 3: Long-Running Tests**

For tests that take longer than expected, resume with:

```bash
sf agent test resume --job-id <JOB_ID> --json
```

The job ID is returned by the `run` command.

[SOURCE: agent-testing-rules (lines 244-248)]

**CRITICAL: Tests require activation**

WRONG: Running tests against an authoring bundle
```bash
# WRONG — tests cannot run against authoring bundles
sf agent test run --name My_Test --authoring-bundle Local_Info_Agent --json
```

RIGHT: Tests run against published, activated agents
```bash
# CORRECT — the agent must be published and activated first
sf agent test run --name My_Test --api-name Local_Info_Agent --json
```

Authoring bundles are draft definitions. Tests validate published behavior against real action execution in the org. Publish and activate the agent before running tests.

---
