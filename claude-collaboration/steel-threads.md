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

1. **Produce an Agent Spec** — purpose, topic graph as Mermaid flowchart,
   actions with backing logic analysis, variables, gating conditions, and
   behavioral intent

2. **Analyze available backing logic** — scan the project for Apex classes,
   Flows, and Prompt Templates that could serve each topic's needs. For each
   action, either recommend an existing implementation with rationale, or
   articulate what's missing and stub with specific input/output requirements.
   Record findings in the Agent Spec

3. **Implement an agent with these characteristics:**
   - Correct block ordering (system → config → variables → language →
     start_agent → topics)
   - Gated action pattern for events lookup (gated behind guest interests
     being populated)
   - `@utils.setVariables` to collect guest interests before the gated action
   - Action loop prevention in instructions (explicit "call only ONCE"
     directives)
   - Correctly stubbed action targets with proper protocols, I/O declarations,
     and comments describing what backing implementations need to do
   - Off-topic and escalation guardrail topics
   - Correct transition syntax per context (`@utils.transition to` in
     reasoning.actions, bare `transition to` in directive blocks)

4. **Validate** via `sf agent validate authoring-bundle` and resolve errors

5. **Verify behavior** via `sf agent preview`

### Acceptance Criteria

- An Agent Spec is produced that accurately represents the agent's structure
  and intent, including topic graph as Mermaid flowchart
- Backing logic analysis is present in the Agent Spec: each action either
  maps to existing project code with rationale, or has a clearly articulated
  gap with stubbed requirements
- The `.agent` file compiles cleanly on `sf agent validate authoring-bundle`
- The agent uses correct transition syntax in each context (`@utils.transition
  to` in reasoning.actions, bare `transition to` in directive blocks)
- Events lookup cannot be triggered in preview until guest interests are
  provided
- No action enters a repeat loop (e.g., the same action called multiple
  times in succession without new user input)
- Off-topic user messages get redirected, not answered
- Escalation topic exists with correct `@utils.escalate` wiring and is
  reachable from the topic selector (end-to-end handoff is a platform
  limitation in preview, not testable)
- All three domain topics route correctly from the topic selector in preview

---

## Steel Thread 2: Comprehend

### Prompt

> "I just inherited an agent called Local Info Agent from another team. Can you help
> me understand what it does?"

### Build Instructions

1. **Locate the agent** — the skill must teach enough about Agentforce metadata
   structure (`AiAuthoringBundle` directory conventions, `sfdx-project.json` package directories)
   and Salesforce CLI retrieval to find the `.agent` file, whether it's already
   in the local project or needs to be retrieved from the org

2. **Comprehend the agent** — parse all blocks, topics, variables, actions, and
   transitions. Trace flow control: how conversations move through topics, what
   gates exist, what triggers transitions. Analyze action integration: each
   action's target protocol, inputs/outputs, and backing logic

3. **Produce an Agent Spec** — consolidate comprehension into an Agent Spec:
   purpose, topic graph as Mermaid flowchart (with transition types and gating
   conditions), actions with backing logic mappings, variables (where set,
   where read, what gates they control), gating logic, and behavioral intent

4. **Produce inline `#` comment annotations** on the `.agent` file explaining
   flow decisions, gating rationale, and topic relationships

### Acceptance Criteria

- The agent is located correctly, whether from local project structure or
  retrieved from the org
- An Agent Spec is produced that accurately represents the agent's structure,
  including topic graph as Mermaid flowchart
- Transition types are correctly identified (handoff vs. delegation)
- Gated actions are called out with their gating conditions
- Variable usage is traced correctly (where set, where read, what gates
  they control)
- Action targets and their backing requirements are identified in the
  Agent Spec
- Inline comments, when applied to the `.agent` file, don't break
  compilation (`sf agent validate` still passes)
- A developer unfamiliar with the agent could read the Agent Spec and
  accurately explain the agent's behavior without reading the `.agent`
  file directly

---

## Steel Thread 3: Modify

### Prompt

> "I need to add appointment booking to my resort agent. Guests should be able
> to book spa treatments, and the agent should check availability before
> confirming. It should also ask for the guest's room number so we can charge
> it to their folio. Oh, and we don't need the facility hours feature anymore —
> please remove it."

### Build Instructions

1. **Comprehend the existing agent** — before modifying, parse the existing
   agent's structure: topics, variables, actions, transitions, backing logic,
   and flow control

2. **Produce an Agent Spec** — consolidate comprehension into an Agent Spec
   as the baseline. This is both the starting reference and the artifact the
   developer reviews before changes begin

3. **Design the modification** — update the Agent Spec to show the new
   topic, its transitions, backing logic requirements, and how it integrates
   with the existing topic graph. Also mark the facility hours topic for
   removal, tracing its connections (inbound transitions, outbound
   transitions, variables it sets, actions it defines) to identify what
   else must change

4. **Analyze available backing logic** — scan the project for Apex classes,
   Flows, and Prompt Templates that could serve the booking and availability
   actions. Map existing implementations or articulate gaps with stubbed
   requirements. Record findings in the Agent Spec

5. **Implement the changes:**
   - New topic with correct block structure
   - Multi-condition gating: availability check must complete before booking
     confirmation, room number must be collected before charging
   - `@utils.setVariables` to collect room number before the gated action
   - Action targets for availability check, booking confirmation, and folio
     charge with declared protocols, input/output variable specifications
     (including correct data types), and comments describing what the backing
     implementation must do
   - Proper transitions connecting the new topic to the existing topic graph
   - Clean removal of the facility hours topic: delete the topic, remove
     transitions pointing to it, remove variables and actions only it used,
     preserve any shared variables or actions
   - No regressions to remaining topics (weather, events)

6. **Validate** via `sf agent validate authoring-bundle` and resolve errors

7. **Verify behavior** via `sf agent preview` — test both new and existing
   functionality

### Acceptance Criteria

- Agent Spec is produced for the existing agent, then updated to reflect the
  planned modification (no orphaned topics, no broken transitions)
- Backing logic analysis is present in the Agent Spec for all new actions
- The modified `.agent` file compiles cleanly on `sf agent validate authoring-bundle`
- New variables (room number, treatment preference) are correctly declared
  with appropriate types
- Booking confirmation cannot be triggered until availability is checked AND
  room number is collected (multi-condition gate)
- Availability check fires before booking confirmation (order is enforced,
  not coincidental)
- Facility hours topic is fully removed: no dangling transitions, no
  orphaned variables or actions that only it used
- New spa booking topic is reachable from the topic selector
- Remaining original topics (weather, events) still route correctly from
  the topic selector in preview — no regressions
- Facility hours topic is not reachable from the topic selector

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

> "My agent is working well in preview. Deploy it so my team can start
> using it."

### Build Instructions

1. **Verify readiness** — confirm the agent validates cleanly and the
   developer has tested in preview

2. **Deploy the `AiAuthoringBundle` and all dependencies** — run
   `sf project deploy start` to push the `AiAuthoringBundle` and its
   backing logic (Apex classes, Flows, Prompt Templates, etc.) to the org.
   All dependencies must be deployed prior to, or concurrent with, the
   deployment of the `AiAuthoringBundle`. Publishing will fail if any
   dependencies are not deployed to the org.

3. **Publish the agent** — run `sf agent publish authoring-bundle` to
   commit the current version and hydrate Bot/GenAi* metadata. Confirm
   the hydrated metadata is auto-retrieved to the local project

4. **Activate the agent** — run `sf agent activate` to make the published
   version live

5. **Verify the published agent** — preview the agent using `--api-name`
   instead of `--authoring-bundle` (which routes through the runtime path,
   confirming the full deploy → publish → activate pipeline succeeded)

6. **Handle errors** — if any step fails, diagnose the error (metadata
   conflicts, missing dependencies, permission issues) and guide the
   developer through resolution

### Acceptance Criteria

- All dependencies are deployed before publish is attempted
- The agent version is published and the hydrated metadata is present
  in the local project
- The agent is activated and responds correctly when previewed with
  `--api-name` (runtime path)
- Pipeline errors (if any) are diagnosed with root cause, not just
  the CLI error message
- If a previous version was active, it is correctly deactivated before
  the new version is activated

---

## Steel Thread 7: Delete

### Prompt

> "I don't need the Local Info Agent anymore. Remove it completely."

### Build Instructions

1. **Locate all agent artifacts** — identify the full scope of what needs
   to be removed: the `AiAuthoringBundle` directory, any published versions
   in the org (Bot/GenAi* metadata), and any related test specs
   (`AiEvaluationDefinition` files)

2. **Deactivate if active** — if the agent has an active published version,
   run `sf agent deactivate` before deletion

3. **Remove local artifacts** — delete the `AiAuthoringBundle` directory
   and any related files from the local project

4. **Remove org artifacts** — deploy destructive changes to remove the
   agent metadata from the org, including published versions

5. **Verify cleanup** — confirm no orphaned metadata remains in the org
   and no stale references exist in the local project

### Acceptance Criteria

- Active version is deactivated before any deletion is attempted
- All local artifacts are removed (`AiAuthoringBundle` directory, related
  test specs)
- All org artifacts are removed (published versions, Bot/GenAi* metadata)
- No orphaned metadata remains in the org after deletion
- No stale references to the deleted agent remain in the local project

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
