---
name: agent-script-skill
description: "Use this skill when working with Salesforce Agent Script — the scripting language for authoring Agentforce agents using the Atlas Reasoning Engine. Triggers include: creating, modifying, or comprehending Agent Script agents; working with AiAuthoringBundle files or .agent files; designing topic graphs or flow control; producing or updating an Agent Spec; validating Agent Script or diagnosing compilation errors; previewing agents or debugging behavioral issues; deploying, publishing, activating, or deactivating agents; deleting or renaming agents; authoring AiEvaluationDefinition test specs or running agent tests. This skill teaches Agent Script from scratch — AI models have zero prior training data on this language. Do NOT use for Apex development, Flow building, Prompt Template authoring, Experience Cloud configuration, or general Salesforce CLI tasks unrelated to Agent Script."
---

# Agent Script Skill

## What This Skill Is For

Agent Script is Salesforce's scripting language for authoring next-generation
AI agents that run on the Atlas Reasoning Engine. It was introduced in 2025
and has zero training data in any AI model. You cannot rely on prior knowledge
— everything you need to write, modify, diagnose, or deploy Agent Script
agents is in this skill's reference files.

**CRITICAL: Agent Script is NOT AppleScript, JavaScript, Python, or any other
language. Do NOT confuse Agent Script syntax or semantics with any other
language you have been trained on.**

An Agent Script agent is defined by `AiAuthoringBundle` metadata — a directory 
containing two files. First, a single `.agent` file that describes the agent's topics, actions, 
instructions, flow control, and configuration. Second, a `bundle-meta.xml` file that contains 
metadata about the bundle. The agent processes user utterances by routing them through topics,
each with its own instructions and available actions backed by Apex, Flows, or Prompt Templates.

This skill covers the full Agent Script lifecycle: designing agents,
writing Agent Script code, validating and debugging, deploying and
publishing, and testing.

## How to Use This Skill

This file helps you identify the user's task and tells you which reference
files to read. All detailed knowledge — syntax rules, design patterns, CLI
commands, debugging workflows — lives in the reference files listed under
each task domain below.

Identify the user's intent from the task descriptions below, then read
the reference file(s) indicated before starting work.

## Task Domains

### Create an Agent

The user wants to build a new Agent Script agent from scratch. They may
describe the agent's purpose, the topics it should handle, or the actions
it should perform — typically in plain language without Salesforce-specific
terminology.

**Recommended workflow:** Design first, then build. Produce an Agent Spec
(a structured design document with purpose, topic graph, actions, backing
logic analysis, and gating rationale) for the user to review before writing
any Agent Script code. This ensures design decisions are explicit and
reviewable, not buried in code.

**Reference files to read:**
1. [Core Language](references/agent-script-core-language.md) — execution
   model, syntax, block structure, anti-patterns
2. [Design & Agent Spec](references/agent-design-and-spec-creation.md) —
   topic graph design, flow control patterns, Agent Spec production,
   backing logic analysis
3. [Topic Map Diagrams](references/agent-topic-map-diagrams.md) —
   Mermaid diagram conventions for visualizing the agent's topic graph
4. [Validation & Debugging](references/agent-validation-and-debugging.md) —
   validate the agent compiles, preview to confirm behavior

### Comprehend an Existing Agent

The user wants to understand an Agent Script agent they didn't write, or
one they need to revisit. They may point to an `AiAuthoringBundle` directory
or ask "what does this agent do?"

**Recommended workflow:** Reverse-engineer an Agent Spec from the existing
code. Annotate the source with inline comments explaining flow control
decisions, gating rationale, and topic relationships. Produce a Mermaid
flowchart of the topic graph.

**Reference files to read:**
1. [Core Language](references/agent-script-core-language.md) — understand
   the syntax and execution model to read the code correctly
2. [Design & Agent Spec](references/agent-design-and-spec-creation.md) —
   Agent Spec structure for the reverse-engineered output, flow control
   pattern recognition
3. [Topic Map Diagrams](references/agent-topic-map-diagrams.md) —
   produce a Mermaid topic map of the existing agent's architecture
4. [Metadata & Lifecycle](references/agent-metadata-and-lifecycle.md) —
   locate the agent files, understand directory conventions

### Modify an Existing Agent

The user wants to add, remove, or change topics, actions, instructions, or
flow control on an existing agent. They may describe the change in plain
language ("add a billing topic") or reference specific Agent Script
constructs.

**Recommended workflow:** Comprehend first, then modify. Produce or update
the Agent Spec to reflect the intended changes, get user review, then
implement. For action changes, analyze backing logic requirements — what
Apex/Flow/Prompt Template exists, what's missing, and what needs stubbing.

**Reference files to read:**
1. [Core Language](references/agent-script-core-language.md) — syntax for
   writing the modifications
2. [Design & Agent Spec](references/agent-design-and-spec-creation.md) —
   update the Agent Spec, analyze backing logic for new actions
3. [Validation & Debugging](references/agent-validation-and-debugging.md) —
   validate the modified agent compiles and behaves correctly

### Diagnose Compilation Errors

The user has Agent Script that won't compile. They may share error output
from `sf agent validate` or describe symptoms like "I'm getting a
validation error."

**Recommended workflow:** Map error messages to root causes using the error
taxonomy. Fix the code. Re-validate.

**Reference files to read:**
1. [Core Language](references/agent-script-core-language.md) — syntax rules
   and block structure to understand what correct code looks like
2. [Validation & Debugging](references/agent-validation-and-debugging.md) —
   error taxonomy, error-to-root-cause mapping, validation workflow

### Diagnose Behavioral Issues

The user's agent compiles but doesn't behave as expected. They may describe
symptoms like "the agent keeps going to the wrong topic" or "the action
isn't being called." This is fundamentally different from compilation
diagnosis — the code is valid but the behavior is wrong.

**Recommended workflow:** Form hypotheses from the execution model, reproduce
in preview, analyze conversation traces, apply targeted fixes. Compare
actual behavior against the Agent Spec to identify where intent and
implementation diverge.

**Reference files to read:**
1. [Core Language](references/agent-script-core-language.md) — execution
   model to reason about why the runtime makes specific choices
2. [Design & Agent Spec](references/agent-design-and-spec-creation.md) —
   the Agent Spec as behavioral baseline, flow control pattern analysis
3. [Validation & Debugging](references/agent-validation-and-debugging.md) —
   preview workflow, session trace analysis, behavioral diagnosis methodology

### Deploy, Publish, and Activate

The user wants to take a working agent from local development to a running
state in a Salesforce org. This is a three-step pipeline: deploy the
`AiAuthoringBundle` and its dependencies, publish to commit a version, then
activate to make it live.

**Reference files to read:**
1. [Validation & Debugging](references/agent-validation-and-debugging.md) —
   validate before deploying, preview to confirm behavior
2. [Metadata & Lifecycle](references/agent-metadata-and-lifecycle.md) —
   deploy pipeline, publish and activate commands, dependency management

### Delete or Rename an Agent

The user wants to remove an agent or change its name. These are maintenance
tasks complicated by `AiAuthoringBundle` versioning and published version
dependencies.

**Reference files to read:**
1. [Validation & Debugging](references/agent-validation-and-debugging.md) —
   validate state after changes, preview to confirm
2. [Metadata & Lifecycle](references/agent-metadata-and-lifecycle.md) —
   delete mechanics, rename mechanics, orphan cleanup

### Test an Agent

The user wants to create automated tests for an Agent Script agent. This
involves writing `AiEvaluationDefinition` test specs in YAML format that
define test scenarios, expected behaviors, and quality metrics.

**Recommended workflow:** Use the Agent Spec as a coverage baseline — each
topic, action, and flow control path should have corresponding test
scenarios. Write test spec YAML, create the test metadata, then run tests.

**Reference files to read:**
1. [Core Language](references/agent-script-core-language.md) — understand
   the agent's structure to design meaningful tests
2. [Design & Agent Spec](references/agent-design-and-spec-creation.md) —
   Agent Spec as test coverage baseline
3. [Metadata & Lifecycle](references/agent-metadata-and-lifecycle.md) —
   test metadata creation and execution commands
4. [Test Authoring](references/agent-test-authoring.md) — test spec YAML
   format, expectations, metrics, test design methodology
5. [assets/local-info-agent-testSpec.yaml](assets/template-testSpec.yaml) —
   concrete example of a complete test spec

## The Agent Spec

The **Agent Spec** is the central artifact this skill produces and consumes.
It is a structured design document that represents an agent's purpose,
topic graph, actions with backing logic, variables, gating logic, and
behavioral intent.

The Agent Spec is not just a design-time artifact — it evolves with the
agent. At creation time, it's sparse (purpose, topics, directional notes).
During build, it fills in (flowchart, backing logic mapped, gating
documented). During comprehension, it's reverse-engineered from existing
code. During diagnosis, it's the reference for comparing expected vs.
actual behavior. During testing, test coverage maps against it.

Always produce or update an Agent Spec as the first step of any operation
that changes or analyzes an agent. It is the consistent ground truth you
work from, and the consistent artifact the developer reviews.

For Agent Spec structure and production methodology, read
[Design & Agent Spec](references/agent-design-and-spec-creation.md).

## Assets

The `assets/` directory contains templates and examples. Read these
when you need a starting point or a concrete reference.

- **`assets/local-info-agent-annotated.agent`** — A complete annotated
  example based on the Local Info Agent, showing all major Agent Script
  constructs in context with inline comments explaining why each construct
  is used. Read this when you need a concrete reference for how concepts
  compose into a working agent, or as a fallback when focused examples in
  the reference files aren't sufficient.

- **`assets/template-testSpec.yaml`** — A test spec template with
  placeholder values and inline comments explaining each field. Copy to
  `specs/<Agent_API_Name>-testSpec.yaml` in the user's SFDX project and
  customize for the agent being tested.

- **`assets/template-single-topic.agent`** — Minimal starting-point agent
  with one topic. Copy and modify for simple agents.

- **`assets/template-multi-topic.agent`** — Starting-point agent with
  multiple topics and transitions. Copy and modify for complex agents.

## Important Constraints

- **Use only the Salesforce CLI and a Salesforce org.** Do not reference
  or depend on other skills, MCP servers, or external tooling. All commands
  in this skill use `sf` (Salesforce CLI). Always include the `--json` flag
  when executing `sf` commands so output is machine-readable.

- **Only certain backing logic types are valid for actions.** For example,
  only invocable Apex (not arbitrary Apex classes) can back an action.
  Similar constraints may apply to Flows and Prompt Templates. When wiring
  actions to backing logic, consult the Design & Agent Spec reference file
  for valid types and stubbing methodology.

- **`sf agent generate test-spec` is not for agentic use.** It is an
  interactive, REPL-style command designed for humans. When creating test
  specs, start from the boilerplate template in assets instead.
