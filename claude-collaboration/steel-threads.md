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

### Prompt

> "I need to add appointment booking to my resort agent. Guests should be able
> to book spa treatments, and the agent should check availability before
> confirming. It should also ask for the guest's room number so we can charge
> it to their folio."

### Build Instructions

1. **Comprehend the existing agent** — before modifying, parse the existing
   agent's structure (topics, variables, actions, transitions) to understand
   what's already there and avoid breaking it

2. **Design the modification** — update the existing design doc and Mermaid
   flowchart to show the new topic, its transitions, and how it integrates
   with the existing topic graph

3. **Analyze available backing logic** — scan the project for Apex classes,
   Flows, and Prompt Templates that could serve the booking and availability
   actions. Map existing implementations or articulate gaps with stubbed
   requirements

4. **Implement the new topic with these characteristics:**
   - New topic with correct block structure
   - Multi-condition gating: availability check must complete before booking
     confirmation, room number must be collected before charging
   - `@utils.setVariables` to collect room number before the gated action
   - Correctly stubbed action targets for availability check, booking
     confirmation, and folio charge
   - Proper transitions connecting the new topic to the existing topic graph
   - No regressions to existing topics (weather, events, facility hours)

5. **Validate** via `sf agent validate authoring-bundle` and resolve errors

6. **Verify behavior** via `sf agent preview` — test both new and existing
   functionality

### Acceptance Criteria

- Updated Mermaid flowchart shows new topic integrated with existing graph
  (no orphaned topics, no broken transitions)
- Backing logic analysis is present for all new actions
- The modified `.agent` file compiles cleanly on `sf agent validate authoring-bundle`
- New variables (room number, treatment preference) are correctly declared
  with appropriate types
- Booking confirmation cannot be triggered until availability is checked AND
  room number is collected (multi-condition gate)
- All three original topics (weather, events, facility hours) still route
  correctly from the topic selector in preview — no regressions
- New spa booking topic is reachable from the topic selector
- Availability check fires before booking confirmation (order is enforced,
  not coincidental)

---

## Steel Thread 4: Diagnose (Compilation)

### Prompt

> "I'm trying to preview my agent but it's throwing errors. Can you help me
> fix it?"

### Build Instructions

1. **Locate and read the agent** — find the `.agent` file in the project and
   parse its structure

2. **Run validation** — execute `sf agent validate authoring-bundle` and
   capture the error output

3. **Diagnose errors** — for each validation error, the skill must guide the
   LLM to:
   - Identify the root cause (not just the symptom the validator reports)
   - Explain *why* Agent Script requires this (connect to the Agent Script
     execution model)
   - Propose a specific fix with correct syntax

4. **Apply fixes** — make targeted edits that resolve the errors without
   introducing new ones or changing the agent's intended behavior

5. **Re-validate** — run `sf agent validate authoring-bundle` again to confirm
   the fix worked. If new errors surface, repeat the diagnose-fix cycle

6. **Explain what was wrong** — provide a brief summary of each error, its
   root cause, and what was changed, so the developer learns (not just gets
   a fix)

### Error Categories to Cover

The agent file used for this steel thread should contain at least one error
from each category:

- **Block ordering** — blocks in wrong sequence (e.g., topics before variables)
- **Indentation** — incorrect indentation that changes block nesting or breaks
  parent-child relationships (Agent Script is indentation-sensitive)
- **Syntax** — malformed block syntax, wrong transition syntax for context
  (`@utils.transition to` vs. bare `transition to`)
- **Missing declarations** — variable referenced but not declared, action
  used but not defined
- **Type mismatches** — variable used in a context that conflicts with its
  declared type
- **Structural** — duplicate topic names, orphaned topics with no inbound
  transitions

### Acceptance Criteria

- All validation errors are resolved in a single diagnose-fix cycle (no
  infinite loops of fix-break-fix)
- Each fix is targeted — only the broken parts change, existing working
  behavior is preserved
- Explanations connect errors to the Agent Script execution model (not just
  "this is the correct syntax" but *why* it needs to be that way)
- The agent's intended behavior is unchanged after fixes (the developer's
  design intent is preserved)
- Block ordering errors are fixed by moving blocks, not rewriting content
- Re-validation passes cleanly after all fixes are applied

---

## Steel Thread 5: Diagnose (Behavioral)

### Prompt

> "My resort agent isn't working right. When a guest asks about local events,
> the agent seems to get stuck and never actually answers the question. And
> sometimes it tries to help with things it shouldn't, like giving restaurant
> recommendations when that's not part of the agent."

### Build Instructions

1. **Validate first** — run `sf agent validate authoring-bundle` to rule out
   structural issues before investigating behavioral ones

2. **Comprehend the agent and produce an Agent Spec** — parse structure,
   topics, actions, transitions, gating logic, and backing logic. Generate
   an Agent Spec (purpose, topic graph as Mermaid flowchart, actions with
   backing logic mappings, variables, gating conditions, behavioral intent)
   as the baseline artifact. Present to the developer — structural or flow
   control issues may be immediately apparent in the spec

3. **Form hypotheses using the Agent Script execution model** — map each
   described symptom to likely root causes based on how Agent Script processes
   topics, actions, and gating at runtime (e.g., action re-invocation without
   gating, topic selector instructions too broad, missing guardrail topic)

4. **Reproduce symptoms in preview and analyze session trace data** — use
   `sf agent preview` to actually execute the conversation paths described
   by the developer (do not reason about expected behavior from code alone —
   the Agent Spec represents intended design, not actual runtime behavior).
   Then examine the session trace output to find deeper issues that
   conversation observation alone won't reveal (e.g., the grounding service
   masking successful action results as failures, causing the agent to retry
   or stall)

5. **Propose targeted fixes** — for each issue, explain root cause in terms
   of the Agent Script execution model, propose a specific change
   (instruction wording, gating condition, transition adjustment), and explain
   why the fix addresses the root cause

6. **Apply fixes and verify** — make changes, validate compilation still
   passes, then test in preview to confirm behavioral issues are resolved.
   Compare the post-fix agent against the original Agent Spec to confirm the
   agent's intended structure was preserved

### Acceptance Criteria

- Agent Spec is produced during comprehension and used as a baseline to
  verify fixes didn't alter the agent's intended structure
- Diagnosis includes session trace analysis, not just conversation replay —
  hidden issues like grounding service masking are surfaced
- Explanations reference the Agent Script execution model to explain *why*
  the behavior occurred
- Fixes are instruction-level changes (wording, gating, transitions), not
  structural rewrites
- Compilation still passes after behavioral fixes
- Agent responds to the user's question rather than stalling or looping on
  the same action
- Off-topic requests are redirected by the guardrail topic, not answered by
  domain topics
- Existing correct behavior is unaffected by the changes

---

## Steel Thread 6: Publish & Deploy

### Prompt

> "My agent is working well in preview. How do I get it deployed to my org so
> other people can use it?"

### Build Instructions

1. **Verify readiness** — confirm the agent validates cleanly and the developer
   has tested in preview

2. **Explain the publish/deploy pipeline** — walk through what happens when an
   agent goes from local AAB files to a running agent in the org:
   - Source deploy (`sf project deploy start`)
   - Agent activation in the org
   - Any org-level configuration needed (connected apps, permissions, channels)

3. **Execute deployment** — run the appropriate CLI commands to deploy the
   agent metadata to the org

4. **Verify deployment** — confirm the agent metadata arrived in the org
   correctly

5. **Handle deployment errors** — if deploy fails, diagnose the error
   (metadata conflicts, missing dependencies, permission issues) and guide
   the developer through resolution

### Acceptance Criteria

- The developer understands the distinction between local preview and org
  deployment
- Deployment commands are correct and execute successfully
- Deployment errors (if any) are diagnosed with root cause, not just
  the CLI error message
- The agent metadata is present in the org after deployment
- The skill correctly identifies prerequisites that must be in place before
  deployment (backing logic deployed, permissions configured)

---

## Steel Thread 7: Delete & Rename

### Prompt

> "I need to rename my agent from 'Local Info Agent' to 'Coral Cloud Concierge'.
> Also, the old 'dining_recommendations' topic is no longer needed — can you
> remove it completely?"

### Build Instructions

1. **Understand the rename scope** — Agent Script names appear in multiple
   locations (agent file, metadata references, possibly directory names).
   The skill must guide identification of all locations that need updating

2. **Execute the rename** — update all references consistently, ensuring no
   orphaned references to the old name

3. **Understand deletion scope** — before deleting a topic, trace its
   connections: inbound transitions, outbound transitions, variables it sets
   that other topics read, actions it defines that might be shared

4. **Execute the deletion** — remove the topic and all its associated
   references (transitions pointing to it, variables only it used, actions
   only it invoked)

5. **Validate** — run `sf agent validate authoring-bundle` to confirm the
   rename and deletion didn't break anything

6. **Verify** — confirm in preview that remaining topics still work and
   the deleted topic is no longer reachable

### Acceptance Criteria

- Agent name is updated consistently across all locations (no orphaned
  references to old name)
- Deleted topic is fully removed: no dangling transitions pointing to it,
  no orphaned variables or actions that only it used
- Variables and actions shared with other topics are preserved (only
  topic-specific elements are removed)
- The agent validates cleanly after both operations
- Remaining topics still route correctly in preview
- The deleted topic is not reachable from the topic selector

---

## Steel Thread 8: Test

### Prompt

> "I want to make sure my agent handles edge cases well before I deploy it.
> Can you help me create test specs I can run automatically?"

### Build Instructions

1. **Comprehend the agent** — parse the agent's structure to understand all
   topics, transitions, gating conditions, and action dependencies

2. **Explore behavior in preview** — use `sf agent preview` to interactively
   exercise the agent's topics, observe how it handles various inputs, and
   identify behavioral patterns that need test coverage. This is the discovery
   step, not the deliverable

3. **Design test scenarios** — based on comprehension and preview exploration,
   produce a structured set of test cases that exercise:
   - **Happy paths** — each topic's primary flow from entry to resolution
   - **Gating conditions** — confirm gates block when unsatisfied and pass
     when satisfied
   - **Transitions** — verify each transition type works correctly (handoff
     returns, delegation doesn't)
   - **Guardrails** — off-topic redirection, escalation triggering
   - **Edge cases** — ambiguous inputs that could match multiple topics,
     rapid topic switching, empty/null variable states

4. **Generate AiEvaluationDefinition YAML specs** — translate test scenarios
   into valid AiEvaluationDefinition metadata files that can be deployed and
   executed as automated tests. Each spec must include:
   - Test name and description
   - User utterance(s) that trigger the scenario
   - Expected outcomes (topic activation, action invocation, response content)
   - Pass/fail evaluation criteria

5. **Validate the test specs** — ensure the generated YAML is structurally
   valid and deployable as AiEvaluationDefinition metadata

### Acceptance Criteria

- Test scenarios cover all topics (no untested topics)
- Gating conditions are tested in both satisfied and unsatisfied states
- At least one edge case per topic is included
- Off-topic and escalation guardrails are tested
- Test cases are specific enough that pass/fail is unambiguous (not
  "agent should respond appropriately")
- All test scenarios are expressed as valid AiEvaluationDefinition YAML specs,
  not just prose descriptions
- Generated YAML is structurally valid and deployable as metadata
- Preview was used for behavioral exploration, not as the test execution
  mechanism
