# Agent Design and Spec Creation

## Table of Contents

1. Agent Spec: Structure and Lifecycle
2. Discovery Questions
3. Topic Architecture
4. Mapping Logic to Actions
5. Transition Patterns
6. Deterministic vs. Subjective Flow Control
7. Gating Patterns
8. Action Loop Prevention

---

## 1. Agent Spec: Structure and Lifecycle

An **Agent Spec** is a structured design document describing an agent's purpose, topics, actions, state, control flow, and behavioral intent. When creating a new agent, produce the Agent Spec before writing Agent Script code. When comprehending or diagnosing an existing agent, reverse-engineer an Agent Spec from the `.agent` file to make the agent's design explicit.

### What an Agent Spec Contains

- **Purpose & Scope** — what the agent does, in plain language
- **Behavioral Intent** — what the agent is supposed to achieve (requirements and constraints), not just what the code does
- **Topic Map** — a Mermaid flowchart showing all topics, transitions (with type labels: handoff or delegation), and when transitions occur
- **Actions & Backing Logic** — each action's name, its backing implementation (Apex class, Flow, Prompt Template), inputs/outputs, and whether the backing logic exists or needs creation
- **Variables** — declarations, types, default values, which topics set/read them, and what gates they control
- **Gating Logic** — conditions that govern action visibility or instruction evaluation, with rationale for each. Always include this section; if no gating applies, state "No gating required" so reviewers know it was considered, not overlooked.

### Directional vs. Observational Entries

Agent Spec entries can be directional or observational — both are valid:

- **Directional:** "The `confirm_booking` action needs an Apex class `BookingConfirmer` that accepts reservation_id (string), guest_name (string), and returns confirmation_number (string), booking_date (date)." This is a gap you're creating acceptance criteria for.

- **Observational:** "The `fetch_weather` action is backed by Apex class `WeatherService`, invoked via `apex://WeatherService`. Accepts dateToCheck (date), returns maxTemp/minTemp (number)." This documents existing backing logic.

Both go in the same Agent Spec section. The distinction tells you whether the backing logic is missing (directional) or implemented (observational).

### Lifecycle Stages

The Agent Spec evolves across the agent's lifecycle:

**Creation (sparse).** Purpose, topic names, rough descriptions, directional notes about backing logic ("this action needs an Apex class that accepts X, returns Y"). No flowchart yet. Entries are mostly placeholders.

**Build (filled).** Flowchart added with transition types labeled. Backing logic mapped (existing implementations identified with filenames, missing implementations stubbed with protocols and I/O specs). Variables documented with their usage and gating impact. Gating rationale explained.

**Comprehension (reverse-engineered).** Starting from an existing `.agent` file, produce a complete Agent Spec by parsing topics, tracing transitions, analyzing actions, and documenting state. This is the "what does this agent do?" output.

**Diagnosis (reference).** Compare actual runtime behavior against the Agent Spec to find where intent and implementation diverge.

### Agent Spec Template

The skill provides a starter spec template at `assets/agent-spec-template.md`. Use it as a starting point for new agents. It includes all sections and placeholder content you fill in during design.

---

## 2. Discovery Questions

These five question categories drive the content of your Agent Spec. When creating a new agent, use them to elicit requirements from the human. When comprehending or diagnosing an existing agent, extract the answers from the `.agent` file and project files.

**Resolve as many questions as possible from available context before asking the human.** Scan existing code, project metadata, prior conversation, and any provided requirements. Only surface questions the human must answer — never forward this list verbatim.

### Agent Identity & Purpose *(feeds Purpose & Scope)*

- What is the agent's name? (no spaces, letters/numbers/underscores only)
- What is the agent's primary purpose in one sentence?
- What should the welcome message say?
- What personality should the agent have? (professional, friendly, formal, casual)
- What error message should the agent show if something breaks?

### Topics & Conversation Flow *(feeds Topic Map)*

- What distinct conversation areas (topics) does the agent need?
- Which topic is the entry point? (where conversations start)
- What are the possible transitions between topics?
- Are there topics that delegate to others and need to return?
- Are there guardrail topics (off-topic redirection, ambiguity handling, security gates)?

### State Management *(feeds Variables, Gating Logic)*

- What information must persist across the conversation? (customer name, preferences, process state)
- What external context is needed? (session ID, user record, linked fields)
- What conditions should trigger different behavior in the same topic? (is_premium, role, completed_steps)

### Actions & External Systems *(feeds Actions & Backing Logic)*

- What external systems does the agent call?
  - Salesforce Flows (autolaunched only)
  - Apex classes (invocable only)
  - Prompt Templates
  - External APIs (not directly; must be wrapped in Apex or Flow)
- For each action: What inputs? What outputs? When should it be available?

### Reasoning & Instructions *(feeds Behavioral Intent)*

- What should the agent do in each topic?
- What conditions change the instructions? (if guest is premium, if step 1 is complete)
- Should any actions run automatically before/after reasoning?
- What data transformations (if any) does the LLM need to do?

---

## 3. Topic Architecture

Topics are states in a finite state machine. Design them before writing code.

### Architecture Patterns

**Hub-and-Spoke.** One central topic (the router) transitions to specialized domain topics. The router is the `start_agent` topic. Each domain topic handles a specific area (orders, billing, support) and may transition back to the router or to other topics. Use when the agent handles multiple distinct domains that don't naturally flow together.

Example: The Local Info Agent. The `topic_selector` (hub) routes to `local_weather`, `local_events`, `resort_hours`, `escalation`, `off_topic`, and `ambiguous_question` (spokes).

```agentscript
start_agent topic_selector:
    reasoning:
        actions:
            go_weather: @utils.transition to @topic.local_weather
            go_events: @utils.transition to @topic.local_events
            go_hours: @utils.transition to @topic.resort_hours

topic local_weather:
    reasoning:
        instructions: | Handle weather questions.

topic local_events:
    reasoning:
        instructions: | Handle event questions.
```

**Linear Flow.** Topics form a pipeline: start → step 1 → step 2 → step 3 → end. Users progress through stages without backtracking. Use for multi-step workflows with mandatory ordering (application forms, troubleshooting trees).

```agentscript
start_agent intake:
    reasoning:
        actions:
            go_next: @utils.transition to @topic.verification

topic verification:
    reasoning:
        actions:
            go_next: @utils.transition to @topic.details_gathering

topic details_gathering:
    reasoning:
        actions:
            go_next: @utils.transition to @topic.confirmation
```

**Escalation Chain.** Tiered support: first-level topic tries to resolve, second-level topic handles harder issues, third-level escalates to humans. Use when support difficulty varies and each tier has different capabilities.

```agentscript
topic level_1_support:
    reasoning:
        actions:
            escalate: @utils.transition to @topic.level_2_support

topic level_2_support:
    reasoning:
        actions:
            escalate_to_human: @utils.escalate
```

**Verification Gate.** A security/permission check before allowing access to protected topics. The gate topic validates the user, then transitions to the protected topic or an error topic.

```agentscript
start_agent security_gate:
    reasoning:
        actions:
            go_admin: @utils.transition to @topic.admin_panel
                available when @variables.user_role == "admin"
            go_denied: @utils.transition to @topic.access_denied
                available when @variables.user_role != "admin"

topic access_denied:
    reasoning:
        instructions: | You don't have permission to access this.
```

**Single-Topic.** The entire agent is one topic — no transitions. Use for focused QA agents where all interactions stay in the same domain.

```agentscript
start_agent faq:
    description: "Answer questions about pricing"
    reasoning:
        instructions: | Answer questions about our pricing plans.
        actions:
            lookup_plan: @actions.get_plan_details
```

### Escalation Topics

Use `@utils.escalate` to hand off to a human. This is a permanent handoff — the user leaves the agent for a support channel (phone, email, chat with a human).

```agentscript
topic support:
    reasoning:
        actions:
            escalate: @utils.escalate
                description: "Connect with a human agent"
```

The escalation action does NOT return. Once triggered, the agent exits.

### Guardrail Topics

Guardrails are specialized topics that enforce agent boundaries. Always include:

**Off-Topic Redirection.** Route users back to the agent's scope when they ask about unrelated things.

```agentscript
topic off_topic:
    description: "Handle off-topic requests"
    reasoning:
        instructions: ->
            | You asked about something outside my scope.
              I can only help with [list your capabilities].
              What can I help you with today?
```

**Ambiguous Question Handling.** Guide users to clarify vague requests instead of guessing.

```agentscript
topic clarify:
    description: "Ask for clarification"
    reasoning:
        instructions: ->
            | I didn't quite understand your request.
              Can you provide more details about what you need?
```

### Single-Topic vs. Multi-Topic Decision

Use **single-topic** if:
- The agent handles one domain only (FAQ, weather checker, status lookup)
- All interactions naturally stay in the same context
- No complex state transitions needed

Use **multi-topic** if:
- The agent handles multiple distinct domains (customer service: orders + billing + account)
- Different topics have different instructions or action sets
- Users may need to switch contexts mid-conversation
- You need different entry points or security gates

---

## 4. Mapping Logic to Actions

Before you write an action definition in Agent Script, identify what Salesforce implementation backs it. Every action needs backing logic — either existing or stubbed with requirements.

### Valid Backing Logic Types

**Apex**: Only **invocable Apex classes** can back actions. A regular Apex class, even if it has public methods, will not work. Invocable classes are decorated with `@InvocableMethod`.

```apex
// WRONG — regular class, not invocable
public class WeatherFetcher {
    public static String getWeather(String date) { ... }
}

// RIGHT — invocable class
public class WeatherFetcher {
    @InvocableMethod(label='Fetch Weather')
    public static List<Result> getWeather(List<Request> requests) { ... }
}
```

Wire to the Apex action with: `target: "apex://ClassName"`

**Flows**: Only **autolaunched Flows** can back actions. Flows triggered by UI or record change events will not work. The Flow must have no trigger — it starts only when explicitly invoked.

Wire to the Flow action with: `target: "flow://FlowName"`

**Prompt Templates**: Use Salesforce Prompt Templates (custom or industry-specific).

Wire to the Prompt Template action with: `target: "prompt://TemplateName"`

### How to Identify Existing Backing Logic

1. **Scan the project** — look in `force-app/main/default/classes/` for Apex classes, `flows/` for Flows, and `promptTemplates/` for templates
2. **Check decorators** — grep for `@InvocableMethod` to find invocable Apex
3. **Check Flow type** — open the Flow editor; if "Autolaunch" appears, it's valid
4. **Review metadata** — check `sfdx-project.json` to understand package directory structure

### How to Map Existing Implementations

Once you find a candidate implementation, verify it matches what the action needs:

1. **Input contract** — does the implementation accept the parameters the action will send?
2. **Output contract** — does the implementation return data the agent needs?
3. **Target format** — use the correct protocol (`apex://`, `flow://`, `prompt://`)

Example:

Existing Apex class `OrderLookup`:
```apex
@InvocableMethod(label='Fetch Order')
public static List<OrderResult> getOrderStatus(List<OrderRequest> requests) {
    // accepts order_id, returns status, amount, date
}
```

In the Agent Spec, record:
```
check_order action:
  Backing: Apex class OrderLookup (invocable)
  Target: apex://OrderLookup
  Inputs: order_id (string)
  Outputs: status (string), amount (number), date (date)
  Status: IMPLEMENTED
```

### How to Stub Missing Logic

When no implementation exists, stub it with I/O specs in your Agent Spec:

```
fetch_invoice action:
  Backing: (needs creation)
  Target: apex://InvoiceFetcher (proposed)
  Inputs: invoice_id (string, required)
  Outputs: invoice_amount (number), due_date (date), status (string)
  Requirements: Invocable Apex class that accepts invoice_id,
                queries Invoice records, returns amount/due_date/status
```

This becomes acceptance criteria for an Apex developer to build against. Include target protocol, parameter names, types, and descriptions.

### Wiring Actions in Agent Script

In your Agent Script, reference the backing logic via the `target` field:

```agentscript
topic booking:
    actions:
        confirm: @actions.confirm_booking
            target: "apex://BookingConfirmer"
            description: "Confirm the spa booking"
            inputs:
                reservation_id: string
                guest_name: string
            outputs:
                confirmation_number: string
                booking_date: date
```

**Critical gotcha**: If you point to invalid backing logic (a Flow that isn't autolaunched, or an Apex class that isn't invocable), validation will pass but the agent will fail at runtime with cryptic errors. Always verify the backing logic type before wiring.

---

## 5. Transition Patterns

Topics connect via transitions. There are two types: **handoff** (permanent) and **delegation** (with return).

### Handoff: Permanent Transition

A handoff is a one-way transition. The user moves to a new topic and control never returns to the original topic on that topic branch. Handoffs use `@utils.transition to` in `reasoning.actions`.

Use handoff when:
- Switching modes (preview → confirm → complete)
- Entry point routing (topic_selector → domain topics)
- One-way workflows (checkout → order_confirmation → end)

```agentscript
topic topic_selector:
    reasoning:
        actions:
            go_checkout: @utils.transition to @topic.checkout
                description: "Start checkout"

topic checkout:
    reasoning:
        actions:
            go_confirm: @utils.transition to @topic.order_confirmation
                description: "Proceed to confirmation"
```

After `go_confirm` executes, the user is in `order_confirmation`. If they later say "go back," the agent routes them back through `topic_selector` (the entry point), not to `checkout`. Handoffs don't stack; they reset the conversation state.

### Delegation: Temporary Handoff with Explicit Return

Delegation temporarily hands control to another topic, but does NOT automatically return. The delegated topic must explicitly transition back to the caller.

WRONG: Assuming `@topic.specialist` returns automatically
```agentscript
topic main:
    reasoning:
        actions:
            consult_specialist: @topic.specialist  # WRONG — assumes return

# After specialist runs, control does NOT return to main.
# The next user utterance routes through topic_selector.
```

RIGHT: Delegating topic defines explicit return transition
```agentscript
topic main:
    reasoning:
        actions:
            consult_specialist: @topic.specialist
                description: "Consult specialist"

topic specialist:
    reasoning:
        actions:
            go_back: @utils.transition to @topic.main
                description: "Return to main"
```

Use delegation when:
- One topic needs advice from a specialist and should continue after
- Reusable sub-workflows (e.g., identity verification called from multiple topics)
- Visiting a topic temporarily, then returning

**Critical Rule:** `@topic.X` delegates control. It does NOT implement call-return semantics. If you want the user to return to the calling topic, code an explicit `transition to @topic.<caller>` in the delegated topic. Without it, the next user utterance falls through to `topic_selector`.

---

## 6. Deterministic vs. Subjective Flow Control

Decide what's enforced by code vs. what's decided by the LLM.

### Classification Framework

**Deterministic control** (code enforces it): Use when requirements are non-negotiable.
- Security: "only admin users can access this"
- Financial: "never approve transactions above $10,000 without human review"
- State: "don't show the payment form until the user provides a delivery address"
- Counter: "you can only call this action once per session"

**Subjective control** (LLM decides): Use when flexibility is OK.
- Conversational tone: "respond professionally but warmly"
- Natural language generation: "summarize the results in your own words"
- User preferences: "if the user is impatient, give short answers; if curious, explain more"

### Instruction Ordering Within Topics

Order your instructions deterministically. The runtime evaluates them top-to-bottom during Phase 1, building the prompt the LLM sees in Phase 2.

**Best practice ordering**:

1. **Post-action checks** — if the previous action had a specific result, mention it first
2. **Data loading** — fetch or reference data the LLM needs
3. **Dynamic instructions** — conditional text based on state

```agentscript
topic checkout:
    reasoning:
        instructions: ->
            # Check the last action result
            if @outputs.cart_validation_failed:
                | Your cart has items that are no longer available.
                  Please remove them and try again.

            # Load data
            | Your current cart total is {!@variables.cart_total}.

            # Dynamic instructions
            if @variables.is_premium:
                | You qualify for FREE shipping.
            else:
                | Standard shipping is {!@variables.shipping_cost}.

            # Standard prompt
            | Proceed to payment or cancel?
```

### The Post-Action Loop Pattern

If an action doesn't trigger a transition, the topic stays active. The LLM may call the same action again on the next cycle. The runtime re-evaluates the entire topic — Phase 1 runs again with updated variables, and Phase 2 passes the new resolved prompt to the LLM.

This is NOT a separate "Phase 3." It's Phase 1 running again with new data.

To prevent unwanted loops, see Section 8 (Action Loop Prevention).

### Grounding Considerations

The platform's grounding service validates that the agent's response matches the action output data. If the agent paraphrases or embellishes, grounding may fail.

**Rules**:
- Use specific values from action results. `"The event is on {!@outputs.event_date}"` (grounds) vs. `"The event is next week"` (may not ground).
- Avoid transforming values. Return `"Tuesday"` as-is instead of converting to `"day after Monday"`.
- Avoid instructions that encourage embellishment. `"Respond like a pirate"` increases risk — embellished content has no output to ground against.
- Paraphrase or directly quote data. The closer the response text matches the action output, the more reliably it grounds.

**Important**: Grounding validation requires **live mode preview** (`sf agent preview --use-live-actions`). Simulated mode generates fake action outputs, so the grounding checker has nothing real to validate against.

---

## 7. Gating Patterns

Gating controls what the agent can see and do.

### `available when` — Action Visibility Gate

An action marked `available when <condition>` is hidden from the LLM when the condition is false. The LLM cannot call an unavailable action.

```agentscript
topic booking:
    reasoning:
        actions:
            confirm: @actions.confirm_booking
                available when @variables.booking_pending == True
```

If `booking_pending` is False, the LLM sees no `confirm` action in this topic. This is the strongest gate — absence itself is a signal.

**WRONG: Not using `available when`**
```agentscript
topic booking:
    reasoning:
        actions:
            confirm: @actions.confirm_booking  # Always visible

        instructions: ->
            | if @variables.booking_pending:
                  Do NOT call confirm yet.
```

The action is still visible; instructions tell the LLM not to call it. The LLM may ignore instructions.

**RIGHT: Using `available when`**
```agentscript
topic booking:
    reasoning:
        actions:
            confirm: @actions.confirm_booking
                available when @variables.booking_pending == True
```

The action is literally absent from the LLM's view. No temptation to call it.

### Conditional Instructions — Prompt Text Gate

Use `if/else` in instructions to show/hide text based on state. This doesn't hide actions; it changes what the LLM is told to do.

```agentscript
topic support:
    reasoning:
        instructions: ->
            | You're helping a customer with their order.

            if @variables.is_vip:
                | This is a VIP customer. Prioritize their request
                  and offer alternatives if the first option isn't available.
            else:
                | Follow standard support procedures.

            | What can I help you with?
```

Use conditional instructions when you want to steer the LLM's reasoning without hiding actions entirely.

### `before_reasoning` Guards — Early Exit

Run code before the LLM is even invoked. Use for security gates and mandatory checks.

```agentscript
topic admin_panel:
    before_reasoning:
        if @variables.user_role != "admin":
            transition to @topic.access_denied

    reasoning:
        instructions: | You are in the admin panel.
```

If the guard fails, the user never sees the admin topic. They transition out before Phase 2 (LLM reasoning) runs.

### Multi-Condition Gating

Combine `available when`, conditional instructions, and guards to enforce complex rules.

Example: "Show the payment action only if the user is authenticated AND the cart is not empty AND we're not in a preview/demo mode"

```agentscript
topic checkout:
    before_reasoning:
        if @variables.is_demo_mode:
            transition to @topic.demo_complete

    reasoning:
        instructions: ->
            | Review your order.

            if @variables.items_in_cart == 0:
                | Your cart is empty. Go back and select items.

        actions:
            pay: @actions.process_payment
                available when @variables.authenticated == True
                    and @variables.items_in_cart > 0
```

### Sequential Gate Pattern

Track progress through validation stages using state variables.

```agentscript
variables:
    step1_verified: mutable boolean = False
    step2_verified: mutable boolean = False
    step3_verified: mutable boolean = False

topic verification:
    reasoning:
        actions:
            verify_step1: @actions.run_check_1
            verify_step2: @actions.run_check_2
                available when @variables.step1_verified == True
            verify_step3: @actions.run_check_3
                available when @variables.step2_verified == True
            proceed: @utils.transition to @topic.confirmed
                available when @variables.step3_verified == True
```

Each step becomes visible only after the previous step completes (updates its variable). This gates the entire flow.

---

## 8. Action Loop Prevention

An action loop occurs when the LLM calls the same action repeatedly without new user input. Two conditions cause loops:

1. The action remains **available** to the LLM after it executes
2. The **instructions don't tell the LLM to stop** calling it

### What Triggers Loops

Variable-bound inputs increase loop risk. When you bind an input to a variable (`with param = @variables.x`), the action is "ready to go" every cycle — the LLM doesn't need to extract values from the conversation. It can invoke the action with zero friction.

```agentscript
topic events:
    reasoning:
        instructions: ->
            | Use the {!@actions.check_events} action to find events.

        actions:
            check_events: @actions.check_events
                with interest = @variables.guest_interest  # Variable-bound input
```

The LLM can call `check_events` repeatedly because the input is always ready. If instructions don't explicitly forbid it, loops happen.

### Three Mitigations

**1. Explicit Post-Action Instructions (most common).**

Tell the LLM to stop calling the action after receiving results.

```agentscript
topic events:
    reasoning:
        instructions: ->
            | Use {!@actions.check_events} to find events matching the guest's interest.
              After you receive the results, present them to the guest in your response.
              Do NOT call the action again — you already have the information you need.

        actions:
            check_events: @actions.check_events
                with interest = @variables.guest_interest
```

**2. Post-Action Transitions (state-based).**

Move the agent out of the topic after the action completes, breaking the cycle.

```agentscript
topic events:
    reasoning:
        instructions: ->
            | Use {!@actions.check_events} to find events.

        actions:
            check_events: @actions.check_events
                with interest = @variables.guest_interest

    after_reasoning:
        if @outputs.events_found:
            transition to @topic.results_displayed
```

After `check_events` runs, the `after_reasoning` block transitions to a new topic. The agent never cycles back to `events`, so the action can't be called again.

**3. LLM Slot-Filling Over Variable Binding (friction-based).**

Use `...` (LLM slot-fill) instead of variable binding. This forces the LLM to extract values from the conversation each cycle, adding natural decision friction.

```agentscript
topic search:
    reasoning:
        instructions: ->
            | Help the user search for products.
              Ask them what they're looking for, then use {!@actions.search} to find matches.

        actions:
            search: @actions.search
                with query = ...  # LLM must extract the query each time
```

With `...`, the LLM must actively decide "do I have a new search query?" on every cycle. It won't call the action repeatedly without user input — the input simply isn't there.

**Combine mitigations for reinforcement:**

```agentscript
topic lookup:
    reasoning:
        instructions: ->
            | Once you have the result, present it. Do NOT call the action again.

        actions:
            lookup: @actions.find_data
                with key = ...  # Requires extraction each time

    after_reasoning:
        if @outputs.data_found:
            transition to @topic.done  # Exit the topic
```

Strong mitigations prevent loops even if one fails.

