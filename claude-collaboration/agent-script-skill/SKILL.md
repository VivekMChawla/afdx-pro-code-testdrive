---
name: agent-script-skill
description: "**Agent Script Authoring**: Create, edit, validate, preview, test, and debug Agentforce agents using Agent Script (.agent files). Covers AiAuthoringBundle metadata, NGA (Next-Gen Authoring), and the Agent Development Lifecycle. MANDATORY TRIGGERS: Agent Script, .agent files, authoring bundles, AiAuthoringBundle, NGA agents, next-gen agents, Agentforce agents, pro-code agent authoring, agent preview, agent testing, agent debugging. Use this skill whenever the user wants to create, modify, validate, preview, test, or debug an Agentforce agent using pro-code tools — even if they don't use the exact term 'Agent Script.' If they mention .agent files, authoring bundles, or NGA, this skill applies. DO NOT use for: Apex classes, Flows, Prompt Templates, LWC, or other Salesforce metadata types that have their own authoring tools. This skill covers the agent definition layer, not the backing implementations."
---

# Agent Script Skill

Agent Script is Salesforce's scripting language for authoring next-generation AI agents.
It has ZERO training data in any AI model. Everything you need to write correct Agent Script
is in this document and its reference files. Do not guess syntax — if something isn't
documented here, it doesn't exist.

**Before writing or modifying any Agent Script**, read `references/syntax-rules.md` for the
complete grammar and validation rules.

---

## 1. Quick Reference

| Task | How |
|------|-----|
| Create a new agent | Create `.agent` file under `aiAuthoringBundles/<Name>/<Name>.agent` |
| Validate changes | `sf agent validate authoring-bundle --api-name <NAME>` |
| Preview (simulated) | `sf agent preview start --authoring-bundle <NAME> --json` |
| Preview (live actions) | Add `--use-live-actions` to the start command |
| Send utterance | `sf agent preview send --authoring-bundle <NAME> --session-id <ID> -u "<MSG>" --json` |
| End preview session | `sf agent preview end --authoring-bundle <NAME> --session-id <ID> --json` |
| Create test in org | `sf agent test create --spec specs/<NAME>-testSpec.yaml --api-name <TEST_NAME>` |
| Run test | `sf agent test run --api-name <TEST_NAME>` |
| Debug (read traces) | Check `.sfdx/agents/<NAME>/sessions/<SESSION_ID>/traces/` |

**Critical rule**: ALWAYS run `sf agent validate authoring-bundle` after every modification
to an `.agent` file. Never assume your changes are valid — let the validator confirm.

---

## 2. How Agent Script Works (The Execution Model)

Understanding how Agent Script *runs* is essential for writing it correctly. Agent Script
is NOT imperative code. It is a declarative configuration that the **Atlas Reasoning Engine**
interprets at runtime. Here is what happens when a user sends a message:

### The Runtime Cycle

1. **User utterance arrives.** The platform receives a message and starts a reasoning cycle.

2. **`start_agent` evaluates first.** The `start_agent` block is the entry point. Its
   `before_reasoning` block (if any) runs deterministically — no LLM involved. Then the
   LLM reads the `start_agent` instructions and sees the available transition actions.

3. **Topic selection.** The LLM picks a transition action (e.g., `@utils.transition to
   @topic.local_weather`). This is a permanent handoff — control moves to the target topic
   and does not return to `start_agent`.

4. **Topic entry.** Inside the selected topic, the cycle repeats:
   - `before_reasoning` runs (deterministic): can execute actions, set variables, transition
   - LLM reads the topic's `instructions` (including conditional blocks evaluated against
     current variable state) and sees the topic's available `reasoning.actions`
   - LLM decides: respond with text, invoke an action, transition to another topic, or escalate

5. **Action execution.** If the LLM selects a `@actions.*` action, the platform executes
   the target (Apex class, Flow, or Prompt Template) — not the LLM. The platform passes
   inputs and receives outputs. Then post-action directives run: `set` captures outputs into
   variables, `run` chains another action, conditional `transition` moves to another topic.

6. **`after_reasoning` runs.** After the LLM's reasoning cycle completes, `after_reasoning`
   executes deterministically. It can conditionally transition to another topic based on
   variable state.

7. **Response delivered.** The platform's grounding checker validates the LLM's response
   against action output data, then delivers the response to the user.

8. **State persists.** Variable values persist across conversation turns within the session.
   The next user utterance starts a new cycle from step 4 (staying in the current topic)
   or step 2 (if the topic transitions back to `start_agent` — rare).

### Key Concepts

**Topics are conversation domains, not functions.** A topic groups instructions, actions,
and state logic for a domain (e.g., "weather" or "order tracking"). The LLM stays in a
topic across multiple turns until it transitions out.

**Variables are session state.** Mutable variables persist across turns. Set by actions
(`set @variables.x = @outputs.y`) or LLM (`@utils.setVariables`). Linked variables are
read-only, injected from external context.

**Two kinds of transitions:**
- `@utils.transition to @topic.X` — Permanent handoff (in `reasoning.actions`). Does not return.
- `@topic.X` — Delegate and return (in `reasoning.actions`). Can return to caller.

**Two kinds of blocks:**
- `reasoning` — LLM-driven. Probabilistic action selection.
- `before_reasoning` / `after_reasoning` — Deterministic. No LLM. Use for guaranteed logic.

**Instructions are LLM prompts, not code.** Text inside `instructions:` is sent to the
LLM as system prompt. Write clear AI directives. Strong language ("ALWAYS", "NEVER") is
more reliable than soft suggestions.

---

## 3. How Agent Script Relates to What You Know

- **Structure**: Like YAML — indentation-sensitive, declarative, colon-delimited keys
- **Topics**: Like route handlers in Express.js — pattern matching on user intent, each
  with its own logic and actions
- **Actions**: Like API endpoint contracts — typed inputs, typed outputs, target implementation
  lives elsewhere (Apex, Flow, Prompt Template)
- **Variables**: Like session state in a web framework — persist across requests (turns),
  scoped to the session
- **Reasoning instructions**: Like system prompts for an LLM — guide behavior, don't
  execute logic
- **`before_reasoning`/`after_reasoning`**: Like middleware — deterministic pre/post
  processing around each reasoning cycle
- **NOT like imperative code**: No loops, no traditional function calls, no step-by-step
  procedures. The LLM decides what to do based on instructions and available actions.

---

## 4. Annotated Example: Local Info Agent (Simplified)

This is a minimal but complete Agent Script showing all major constructs. Study it carefully —
the ordering, indentation, and syntax patterns here are the canonical reference.

```agentscript
# 1. SYSTEM — Global identity and messages (required, must be first)
system:
    instructions: "You are a helpful assistant for Coral Cloud Resort."
    messages:
        welcome: "Hi, I'm an AI assistant. How can I help you today?"
        error: "Sorry, something has gone wrong."

# 2. CONFIG — Agent metadata (required, second)
config:
    developer_name: "Local_Info_Agent"
    agent_label: "Local Info Agent"
    description: "Provides weather, events, and resort hours for Coral Cloud."
    default_agent_user: "agent-user@example.org"

# 3. VARIABLES — Session state (optional, third)
variables:
    guest_interests: mutable string = ""
        description: "Event types the guest is interested in"
    reservation_required: mutable boolean = False
        description: "Whether the last checked facility requires a reservation"

# 4. LANGUAGE — Locale settings (optional)
language:
    default_locale: "en_US"

# 5. START_AGENT — Entry point and topic router (required)
start_agent topic_selector:
    description: "Route the user to the appropriate topic"
    reasoning:
        actions:
            go_to_weather: @utils.transition to @topic.local_weather
            go_to_events: @utils.transition to @topic.local_events
            go_to_hours: @utils.transition to @topic.resort_hours
            go_to_escalation: @utils.transition to @topic.escalation

# 6. TOPICS — Conversation domains (at least one required)
topic local_weather:
    description: "Weather inquiries for Coral Cloud Resort"
    reasoning:
        instructions: ->
            | Your job is to answer weather questions. Use {!@actions.check_weather}
              to get forecast data. After receiving results, summarize them directly.
              Do NOT call the action again. ALWAYS use the date from action results.
        actions:
            check_weather: @actions.check_weather
                with dateToCheck = ...       # LLM slot-fills from conversation
    actions:
        check_weather:
            description: "Fetch weather forecast for Coral Cloud Resort."
            target: "apex://CheckWeather"    # Apex class target
            inputs:
                dateToCheck: object
                    description: "Date in yyyy-MM-dd format"
                    is_required: True
            outputs:
                maxTemperature: number
                minTemperature: number

topic local_events:
    description: "Local events in Port Aurelia near the resort"
    reasoning:
        instructions: ->
            | Determine guest interests. If clear, save them immediately.
              Once saved, use {!@actions.check_events} to look up events.
              IMPORTANT: Only call {!@actions.check_events} ONCE.
        actions:
            collect_interests: @utils.setVariables      # Utility: set variables via LLM
                description: "Save the guest's interests"
                with guest_interests = ...
            check_events: @actions.check_events
                available when @variables.guest_interests != ""  # Gated action
                with Event_Type = @variables.guest_interests     # Bound to variable
    actions:
        check_events:
            target: "prompt://Get_Event_Info"   # Prompt Template target
            description: "Retrieves local events in Port Aurelia."
            inputs:
                "Input:Event_Type": string
                    description: "Type of event"
                    is_required: True

topic resort_hours:
    description: "Operating hours for resort facilities"
    reasoning:
        instructions: ->
            | Help guests find facility hours.
            if @variables.reservation_required:       # Conditional instructions
                | This facility REQUIRES a reservation. Call (555) 867-5309.
            else:
                | No reservation needed. Walk in during operating hours.
        actions:
            get_resort_hours: @actions.get_resort_hours
                with activity_type = ...
                set @variables.reservation_required = @outputs.reservation_required  # Capture output
    actions:
        get_resort_hours:
            target: "flow://Get_Resort_Hours"   # Flow target
            description: "Look up facility hours."
            inputs:
                activity_type: string
                    description: "Facility type (spa, pool, restaurant, gym)"
                    is_required: True
            outputs:
                reservation_required: boolean

topic escalation:
    description: "Transfer to a live human agent"
    reasoning:
        instructions: ->
            | If the user asks for a live agent, escalate the conversation.
        actions:
            escalate_to_human: @utils.escalate          # Utility: escalate
```

---

## 5. Key Patterns

### Pattern 1: Gated Action (Collect Before Acting)

Gate an action behind a variable so the LLM must collect data first:

```agentscript
reasoning:
    actions:
        collect_email: @utils.setVariables
            description: "Collect the customer's email"
            with customer_email = ...
        lookup_order: @actions.find_order
            available when @variables.customer_email != ""
            with email = @variables.customer_email
```

**Why it works**: The `available when` condition hides `lookup_order` from the LLM until
the email variable is populated. The LLM sees only `collect_email` at first, forcing it
to ask the user for their email.

### Pattern 2: Variable Capture from Action Outputs

Capture action outputs into variables for use in later instructions or conditions:

```agentscript
reasoning:
    actions:
        check_status: @actions.get_order_status
            with order_id = @variables.order_id
            set @variables.order_status = @outputs.status
            set @variables.needs_return = @outputs.eligible_for_return
```

**Note**: `set` directives only work on `@actions.*` actions, never on `@utils.*` actions.

### Pattern 3: Conditional Instructions Based on State

Instructions change dynamically based on variable values:

```agentscript
reasoning:
    instructions: ->
        | Help the customer with their order.
        if @variables.is_vip:
            | This customer is a VIP. Offer expedited shipping at no cost.
        else:
            | Standard shipping rates apply.
        | Always confirm the shipping address before processing.
```

**How it works**: The platform evaluates `if`/`else` blocks against current variable state
before sending instructions to the LLM. The LLM only sees the branch that applies.

### Pattern 4: Template Variable Interpolation

Inject variable values directly into instruction text:

```agentscript
instructions: ->
    | The customer's name is {!@variables.customer_name}.
      Their account status is {!@variables.account_status}.
```

Use `{!expression}` syntax. The platform substitutes values before the LLM sees the text.

### Pattern 5: Before/After Reasoning for Deterministic Logic

```agentscript
before_reasoning:
    if @variables.customer_id:
        run @actions.fetch_order
            with customer_id = @variables.customer_id
            set @variables.order_data = @outputs.order_json
after_reasoning:
    if @variables.order_complete:
        transition to @topic.feedback
```

**Critical**: In directive blocks, use bare `transition to @topic.X`. Never use
`@utils.transition to` — that syntax is only for `reasoning.actions`.

### Pattern 6: Guardrail Topics (Off-Topic, Ambiguous)

Create dedicated topics to handle off-topic or ambiguous user requests:

```agentscript
topic off_topic:
    description: "Redirect off-topic requests"
    reasoning:
        instructions: ->
            | The user request is off-topic. Do NOT answer it.
              Redirect the conversation by asking how you can help with
              topics this agent supports. NEVER answer general knowledge questions.
```

Route to these from `start_agent` alongside your domain topics. They act as guardrails
to keep the agent focused.

### Pattern 7: Action Loop Prevention

```agentscript
instructions: ->
    | Use {!@actions.check_events} to look up events.
      IMPORTANT: Only call {!@actions.check_events} ONCE. After receiving
      results, summarize them directly. Do NOT call the action again.
```

**Why loops happen**: The LLM sees all available actions each cycle. If `available when`
stays true and instructions don't say "stop," the LLM calls it again.

---

## 6. Common Mistakes

### Mistake 1: Wrong transition syntax per context

```agentscript
# WRONG in reasoning.actions     |  # WRONG in directive blocks
go_next: transition to @topic.X  |  @utils.transition to @topic.X

# CORRECT in reasoning.actions   |  # CORRECT in directive blocks
go_next: @utils.transition to @topic.X  |  transition to @topic.X
```

**Why**: `@utils.transition to` is an LLM-selectable tool. Directive blocks are deterministic — no LLM.

### Mistake 2: Missing default on mutable variable

```agentscript
# WRONG                    # CORRECT
count: mutable number      count: mutable number = 0
```

### Mistake 3: Boolean capitalization

```agentscript
# WRONG                           # CORRECT
enabled: mutable boolean = true   enabled: mutable boolean = True
```

### Mistake 4: `...` as variable default

```agentscript
# WRONG (... is slot-fill syntax)   # CORRECT
my_var: mutable string = ...        my_var: mutable string = ""
```

**Why**: `...` means "LLM extracts from conversation" — only valid in `with param = ...`.

### Mistake 5: Post-action directives on utility actions

```agentscript
# WRONG — utilities ignore directives     # CORRECT — only @actions support directives
go_next: @utils.transition to @topic.X    process: @actions.process_order
    set @variables.navigated = True           set @variables.result = @outputs.result
```

**Why**: Utilities are consumed by the topic router, not the action executor. Directives are silently ignored.

### Mistake 6: Default value on linked variable

```agentscript
# WRONG                              # CORRECT
session_id: linked string = ""       session_id: linked string
    source: @session.sessionID           source: @session.sessionID
```

**Why**: Linked variables get their value from `source` at runtime. Defaults contradict this.

### Mistake 7: `else if` (not supported)

```agentscript
# WRONG                               # CORRECT — use separate if blocks
if @variables.status == "gold":        if @variables.status == "gold":
    | Gold benefits.                       | Gold benefits.
else if @variables.status == "silver": if @variables.status == "silver":
    | Silver benefits.                     | Silver benefits.
```

---

## 7. Lifecycle Commands

### Validate (after every change)

```bash
sf agent validate authoring-bundle --api-name <AGENT_NAME>
```

The `--api-name` is the directory name under `aiAuthoringBundles/`, without extension.

### Preview

Read `references/preview-rules.md` first. **Simulated** (default): fake action outputs,
good for testing routing/instructions. **Live** (`--use-live-actions`): real execution,
required for grounding and variable-driven branching.

### Test

Read `references/testing-rules.md` first. Sequence: author spec YAML in `specs/` →
`sf agent test create` (deploys to org) → `sf agent test run` (runs in org).
A local spec does NOT mean the test exists in the org.

### Debug

Read `references/debugging-rules.md`. Traces at `.sfdx/agents/<NAME>/sessions/<ID>/traces/`
contain LLM prompts, action I/O, grounding results, and variable changes.

---

## 8. File Structure

Agent Script files: `<packageDir>/main/default/aiAuthoringBundles/<Name>/<Name>.agent`
(check `sfdx-project.json` `packageDirectories` for the base path).

The file name (without `.agent`) must match the directory name and the `developer_name`
in the `config` block.

**Block ordering** (mandatory — validation fails if wrong):
`system` → `config` → `variables` → `connections` → `knowledge` → `language` → `start_agent` → topics

**Internal ordering** within each topic/start_agent:
`description` → `system` → `before_reasoning` → `reasoning` → `after_reasoning` → `actions`

---

## 9. Reference Files

These files contain detailed rules adapted from the project's canonical reference material.
Read the relevant file before performing the corresponding task.

| File | When to Read | Content |
|------|-------------|---------|
| `references/syntax-rules.md` | Before writing or modifying ANY Agent Script | Complete grammar, block reference, naming rules, validation checklist, all variable/action/type details |
| `references/preview-rules.md` | Before previewing an agent | Programmatic vs. interactive modes, simulated vs. live execution, session management, common mistakes |
| `references/testing-rules.md` | Before writing or running tests | Test spec YAML schema, metrics, conversation history, custom evaluations, CLI workflow |
| `references/debugging-rules.md` | When diagnosing agent behavior issues | Session trace structure, step types, diagnostic patterns for routing/actions/grounding/loops |

---

## 10. Deployment Rules

- NEVER deploy `.agent` or `AiAuthoringBundle` metadata unless the user explicitly asks
- ALWAYS deploy `ApexClass` metadata when you create or modify Apex backing implementations
- Validate Agent Script locally — deployment is a separate, deliberate step
