# Agentforce DX (AFDX) — Pro-Code Test Drive

> Project-specific instructions for the `afdx-pro-code-testdrive` workspace.
> Copy this file to the project root as `CLAUDE.md`.

---

## Domain Context: Agentforce DX (AFDX)

### What is Agentforce?

Salesforce's autonomous AI agent platform. Unlike chatbots, Agentforce agents reason through problems, build action plans, and execute tasks using the **Atlas Reasoning Engine**. Grounded in trusted business data via **Data Cloud** and **Retrieval Augmented Generation (RAG)**. Actions use Flows, Apex, Prompt Templates, and MuleSoft APIs.

Supports **low-code authoring** (Agent Builder, web-based) and **pro-code authoring** (Agent Script and DX tools).

### What is AFDX?

**Agentforce DX Pro-Code Tools** empower developers to create, customize, test, and deploy Agents using automatable, conversational, source-driven tools optimized for real-time human collaboration.

Pro-code tools = IDE-hosted (VS Code, Cursor) or CLI-based (terminal). Contrasts with bespoke web-based "low-code" or "declarative" tools like Agent Builder.

AFDX is a key component of the **Agent Development Lifecycle (ADLC)**, enabling the "Code→Build→Run→Debug" inner loop for front-line developers and the "Build→Test→Deploy" outer loop for DevOps engineers in CI/CD environments.

Agentic development tools like **Agentforce Vibes**, **Cursor**, and **Claude Code** leverage AFDX capabilities, enabling pro-code developers to author, validate, preview, and publish agents using natural language. Without the programmatic access layer provided by AFDX, these vibe coding tools cannot participate in the Agent Development Lifecycle for next-gen agents built on Agent Script.

### Current Focus: NGA V4 GA (February 2026)

Pro-code tooling support for **Agent Script** and **Next-Gen Authoring (NGA)**. Developers author agents using Agent Script in VS Code and Code Builder with full IDE support.

---

## Guiding Principles

**Architecture:**
1. Functionality is delivered in DX Foundation libraries and consumed by DX products
2. DX products should not "shell out" to the CLI

**Design:**
1. Don't think in terms of "CLI" or "IDE" — focus on desired user experience
2. Two engagement modes: Agentforce Vibes Dev Assistant Panel (PRIMARY), interactive CLI command (SECONDARY)
3. Conversation previews for existing Agents should not run in Dev Assistant — text-only via CLI, multi-modal in webview tab

**Engineering:**
1. AFDX scrum team ONLY builds: DX Foundation Libraries, SF CLI Plugins, VS Code Extensions (all TypeScript/Node)
2. Other teams MUST deliver engineering work outside these environments

---

## Core Team

- **Vivek Chawla** — Product Manager
- **Shanis Kurundrayil** — Architect
- **Diego Desvard** — Engineering Manager
- **Steve Hetzel** — Lead Engineer
- **Willie Ruemmele** — SMTS
- **Esteban Romero** — SMTS
- **Marcelino Llano** — UX Lead
- **Juliet Shackell** — CX Lead

---

## Glossary

- **Agent Script**: Scripting language for NGA agent definition. Authored in AiAuthoringBundle, validated/compiled/simulated/published via Agent Lifecycle APIs.
- **Agent DSL**: Compiled representation of Agent Script. Internal to platform, not exposed to developers.
- **Agent Spec**: Natural-language YAML description of an agent (company, role, topics). Input to agent creation workflows.
- **AiAuthoringBundle**: Metadata type containing Agent Script for NGA agents. Single-file artifact.
- **NGA (Next-Gen Authoring)**: New agent authoring paradigm using Agent Script. Provides LSP support, validation, simulation, publishing.
- **Session Trace / Plan History**: Detailed execution log (topic selection, reasoning, actions, outcomes). Used for debugging.
- **Agent Pseudo-Type**: Virtual metadata type in SDR for deploy/retrieve using single Bot identifier.

---

## Agent-Related Metadata Types

| Metadata Type | Owning Team | Source Tracking | Notes |
|---------------|-------------|-----------------|-------|
| Bot | Chatbot Core | Supported (v62.0+) | Core agent definition |
| BotVersion | Chatbot Core | Supported (v62.0+) | Agent versions |
| BotSettings | Chatbot Core | Supported (v62.0+) | Agent configuration |
| GenAiFunction | Copilot Core | Supported (v62.0+) | Agent actions |
| GenAiPlanner (DEPRECATED) | Copilot Core | Supported (v62.0-v64.0) | Agent planning logic |
| GenAiPlannerBundle | Copilot Core | Supported (v65.0+) | Agent planning logic (replaces GenAiPlanner) |
| GenAiPlugin | Copilot Core | Supported (v62.0+) | Agent plugins |
| GenAiPromptTemplate | Einstein GPT Foundations | Supported (v62.0+) | Prompt templates |
| GenAiPromptTemplateActv | Einstein GPT Foundations | Supported (v62.0+) | Active prompt templates |
| AiAuthoringBundle | AI Platform (NGA) | Supported | Contains Agent Script for NGA agents |

---

## Key APIs

**Agent Lifecycle APIs (NGA)** — Team: Copilot Runtime & Gateway
- Validate Agent Script
- Compile Agent Script to Agent DSL
- Simulate agents from Agent Script (ephemeral, no publication required)
- Publish agents from Agent Script

**Agentforce API v6 / Agent API v1** — Team: Agentforce API
- Interact with published agents
- Multi-turn conversations
- Session trace data access

**SF Eval API** — Team: SF Eval API
- Agent testing and validation
- Custom evaluations
- Test case management

---

## Developer Workflows (Steel Threads)

### 1. NGA Pro-Code Agent Creation

1. Developer opens VS Code with Salesforce project
2. Run `sf agent generate agent-spec` — provides minimal info, receives YAML agent spec
3. Review and modify the generated agent spec (topics, role, descriptions)
4. Run `sf agent generate authoring-bundle --spec <file>` — AI Assist API generates Agent Script
5. Edit Agent Script using LSP-based editor support or vibe coding with AFV Dev Agent
6. Run `sf agent validate authoring-bundle` — validates with line/column-specific errors
7. Run `sf agent preview --authoring-bundle <name>` — simulate agent without publishing (ephemeral)
8. Iterate on Agent Script based on preview results
9. Run `sf agent publish authoring-bundle` — publish agent and retrieve metadata
10. Deploy AiAuthoringBundle to org, open in Agent Builder for final review

### 2. Agent Testing

1. Create or generate agent test metadata (AiEvaluationDefinition)
2. Deploy test metadata to target org
3. Run `sf agent test run --name <test-name>` — execute tests (async by default)
4. Monitor progress with `sf agent test results`
5. Review detailed test results (expectations, metrics, evaluations)
6. View results in VS Code Testing Panel
7. Integrate with CI/CD pipelines for automated testing

### 3. Agent Debugging

1. Set breakpoint in Apex class used by agent action
2. Start conversation preview in VS Code with Debug Mode enabled
3. Engage in conversation turns with agent
4. When Apex hits breakpoint, Apex Replay Debugger launches automatically
5. Step through code, inspect variables
6. Fix issues, deploy updated Apex
7. Continue testing with updated code

### 4. Scratch Org-Based Agent Development

**Requirements**: DevHub with Einstein1AIPlatform feature, scratch org definition with required features/settings, Data Cloud setup, proper permissions on admin user.

**Limitations**: Agent Creator API can preview but not create agents in scratch orgs, Data Library dependencies not possible (requires CdpScratchOrg perm — ISV partners only), limited agent template selection.

---

## Preview Execution Modes

**Live Preview (from Agent Script)** — Compiles Agent Script to Agent DSL, executes actual deployed code when actions are invoked. Requires all backing implementations to be deployed.

**Simulated Preview (from Agent Script)** — Compiles to Agent DSL, uses LLM-generated outputs instead of executing backing logic. Enables rapid scaffolding and instruction testing without deployed dependencies.

**Production Runtime (Published Agents)** — Connects to published+activated agents via Agent Runtime API. Requires agent to be activated in the org.

---

## Agent-First Design Context

**Original Design (Human-First):** Preview tools built for human interaction patterns (REPL terminal, GUI chat panels, interactive prompts).

**Current Priority (Agent-First):** AI coding assistants (Agentforce Vibes, Cursor, Claude Code) are PRIMARY users. Human developers using CLI/VS Code are SECONDARY. Without programmatic access, AI tools cannot participate in agent development lifecycle.

**Key Constraint:** Command overloading (serving both human and agent workflows) creates help text complexity that makes it difficult for AI assistants to use commands correctly without extensive prior context. Solution requires self-documenting interfaces that agents can understand from `--help` alone.

---

## Key Stakeholders & Dependencies

| Team | Owns | Key Contacts |
|------|------|-------------|
| Chatbot Core | Bot, BotVersion, BotSettings metadata | Jonathan Rico Morales |
| Copilot Core | GenAiFunction, GenAiPlanner, GenAiPlugin metadata | Jonathan Rico Morales |
| Einstein GPT Foundations | GenAiPromptTemplate, GenAiPromptTemplateActv metadata | — |
| Agentforce API | API to interact with agents | Kamil Szybalski (PM) |
| SF Eval API | Test and validate prompts/plans | Safique Mohamed (PM), Nabil Naffar (dev lead) |
| Agent Creator API | APIs to create agent job specs and agents | Annie Zhang (dev lead), Prithvi Krishnan Padmanabhan (architect) |
| Copilot Runtime & Gateway | Agent Lifecycle APIs (NGA) | Pragya Anand (PM), Sarah Boaz-Shelley (EM) |

---

## Personas

Use ONLY these personas when tailoring user stories, epics, and other documents. Always connect outcomes to the persona's known jobs.

**Salesforce Developer** — Develops and maintains SF applications. Jobs: develop features, maintain apps, ensure smooth deployments.

**Salesforce DevOps Engineer** — Automates deployment and integration. Jobs: manage CI/CD pipelines, automate deployments, monitor performance, collaborate on integrations.

**Salesforce QA Engineer** — Ensures quality through testing. Jobs: develop/execute test plans, perform automated/manual testing, collaborate on requirements, document results.

**Salesforce Admin** — Daily platform administration. Jobs: manage users/permissions, customize SF (fields, layouts, workflows), data management, user support/training.

**Salesforce Advanced Admin** — Advanced optimization and strategic management. Jobs: implement automation (Flow, Process Builder), complex data analysis/reporting, optimize performance/scalability, lead implementations.

**Salesforce Technical Architect** — Designs complex solutions with system integration. Jobs: design high-level architecture, provide technical guidance, oversee integrations, ensure scalability/security/compliance.

**Salesforce Solution Architect** — Designs solutions aligned with business objectives. Jobs: analyze business requirements, gather stakeholder requirements, guide implementation teams, ensure maintainability/compliance.

**Product Manager** — Oversees product development lifecycle. Jobs: define requirements/roadmaps, coordinate with dev teams, gather/analyze customer feedback.

---

## Definitions

### T-Shirt Size Estimates (Engineering Effort)

- **S**: 1 SWE × 1 Sprint | **M**: 1 SWE × 2 Sprints | **L**: 1 SWE × 4 Sprints
- **XL**: 2 SWE × 4 Sprints | **2XL**: 4 SWE × 4 Sprints
- **3XL**: 4 SWE × 8 Sprints | **4XL**: 6+ SWE × 8 Sprints

### Timeboxes

- **Sprint**: 2 weeks (10 business days)
- **Release**: 4 months (8 sprints)
- **Spring Release**: February | **Summer Release**: June | **Winter Release**: October

---

## Methodology: Jobs to Be Done (JTBD)

Core framework for all epics and user stories.

**For Epics**: Identify and confirm personas → connect outcomes to persona jobs (surface misalignment) → confirm persona list → define jobs in epic context → define problems → define outcomes → clarify out-of-scope items.

**For User Stories**: Identify feature/functionality → ensure persona alignment → describe jobs from persona perspective → identify problems and acceptance criteria → confirm scope.

**Collaboration**: Share drafts in real-time. Prompt for feedback at each section. Document feedback/changes. Avoid unnecessary refinements after confirmation.

**Templates**: Always ask if Vivek has a template before proposing one. When using a template, follow it EXACTLY — no added sections. Templates for epics, user stories, research spikes, and pain point summaries are maintained in the `pm-assistant` repo.
