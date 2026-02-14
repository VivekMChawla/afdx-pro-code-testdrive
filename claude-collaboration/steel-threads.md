# Steel Threads — Agent Script Skill

Steel threads are specific prompt-based scenarios with concrete success criteria.
Each one exercises a task domain and proves the skill works for that domain.

**Design principle**: Prompts assume a developer who knows *what they want* but not
necessarily *how Salesforce implements it technically*. No metadata type names, no CLI
commands, no backing implementation details in the prompt.

Each steel thread has two sections:
- **Build Instructions** — what the skill must teach the LLM to do (informs skill content)
- **Acceptance Criteria** — pass/fail checks an evaluator can run on the output

---

## Steel Thread 1: Create (Design-First Path)

### Prompt

> "Build me a customer service agent for Coral Cloud Resort. It should handle three
> things: weather inquiries, local event lookups, and resort facility hours. It should
> verify what the guest is interested in before looking up events. If the guest asks
> something off-topic, redirect them politely. If they want a human, escalate."

### Build Instructions

1. **Produce a design doc** — Markdown with Mermaid flowchart showing topic graph,
   transition types, gating logic, and action requirements

2. **Analyze available backing logic** — scan the project for Apex classes, Flows,
   and Prompt Templates that could serve each topic's needs. For each action, either
   recommend an existing implementation with rationale, or articulate what's missing
   and stub with specific input/output requirements

3. **Implement an agent with these characteristics:**
   - Correct block ordering (system → config → variables → language → start_agent → topics)
   - Gated action pattern for events lookup (gated behind guest interests being populated)
   - `@utils.setVariables` to collect guest interests before the gated action
   - Action loop prevention in instructions (explicit "call only ONCE" directives)
   - Correctly stubbed action targets with proper protocols, I/O declarations, and
     comments describing what backing implementations need to do
   - Off-topic and escalation guardrail topics
   - Correct transition syntax per context (`@utils.transition to` in reasoning.actions,
     bare `transition to` in directive blocks)

4. **Validate** via `sf agent validate authoring-bundle` and resolve errors

5. **Verify behavior** via `sf agent preview`

### Acceptance Criteria

- A design doc exists with a Mermaid flowchart that accurately represents the agent's
  topic graph
- Backing logic analysis is present: each action either maps to existing project code
  with rationale, or has a clearly articulated gap with stubbed requirements
- The `.agent` file compiles cleanly on `sf agent validate authoring-bundle`
- Events lookup cannot be triggered in preview until guest interests are provided
- No action enters a repeat loop (e.g., `check_events` called multiple times in
  succession without new user input)
- Off-topic user messages get redirected, not answered
- Escalation topic exists with correct `@utils.escalate` wiring and is reachable from
  the topic selector (end-to-end handoff is a platform limitation in preview, not testable)
- All three domain topics route correctly from the topic selector in preview
- The agent uses correct transition syntax in each context (`@utils.transition to` in
  reasoning.actions, bare `transition to` in directive blocks)

---

## Steel Thread 2: Comprehend

### Prompt

> "I just inherited an agent called Local Info Agent from another team. Can you help
> me understand what it does?"

### Build Instructions

1. **Locate the agent** — the skill must teach enough about Agentforce metadata
   structure (AAB directory conventions, `sfdx-project.json` package directories) and
   Salesforce CLI retrieval to find the `.agent` file, whether it's already in the
   local project or needs to be retrieved from the org

2. **Parse the agent's structure** — identify all blocks, topics, variables, actions,
   and transitions

3. **Trace the flow control** — map how conversations move through topics, what gates
   exist, what triggers transitions

4. **Analyze action integration** — identify each action's target protocol, inputs/outputs,
   and what backing logic it requires

5. **Produce inline `#` comment annotations** explaining flow decisions, gating rationale,
   and topic relationships

6. **Generate a Mermaid flowchart** showing the topic graph with transition types
   (handoff vs. delegation) and gating conditions

7. **Produce a Markdown design doc** summarizing: agent purpose, topic responsibilities,
   variable usage, action dependencies, and flow control rationale

### Acceptance Criteria

- The agent is located correctly, whether from local project structure or retrieved
  from the org
- The Mermaid flowchart accurately represents all topics and transitions (no missing
  topics, no phantom transitions)
- Transition types are correctly identified (handoff vs. delegation)
- Gated actions are called out with their gating conditions
- The Markdown summary correctly describes the purpose of each topic
- Variable usage is traced correctly (where set, where read, what gates they control)
- Action targets and their backing requirements are identified
- Inline comments, when applied to the `.agent` file, don't break compilation
  (`sf agent validate` still passes)
- A developer unfamiliar with the agent could read the outputs and accurately explain
  the agent's behavior without reading the `.agent` file directly

---

## Steel Thread 3: Modify

*To be defined*

---

## Steel Thread 4: Diagnose (Compilation)

*To be defined*

---

## Steel Thread 5: Diagnose (Behavioral)

*To be defined*

---

## Steel Thread 6: Publish & Deploy

*To be defined*

---

## Steel Thread 7: Delete & Rename

*To be defined*

---

## Steel Thread 8: Test

*To be defined*
