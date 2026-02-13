# Agent Script Syntax Rules & Reference

Complete grammar and validation rules for Agent Script (`.agent` files).

---

## Table of Contents

1. [Discovery Questions](#discovery-questions)
2. [File Structure & Block Ordering](#file-structure--block-ordering)
3. [Naming Rules](#naming-rules)
4. [Indentation & Comments](#indentation--comments)
5. [System Block](#system-block)
6. [Config Block](#config-block)
7. [Variables Block](#variables-block)
8. [Topic Block Structure](#topic-block-structure)
9. [Action Definitions](#action-definitions)
10. [Reasoning Actions](#reasoning-actions)
11. [Utility Actions](#utility-actions)
12. [Transition Syntax Rules](#transition-syntax-rules)
13. [Control Flow](#control-flow)
14. [Templates & Expressions](#templates--expressions)
15. [Writing Effective Instructions](#writing-effective-instructions)
16. [Action Loop Prevention](#action-loop-prevention)
17. [Grounding Considerations](#grounding-considerations)
18. [Validation Checklist](#validation-checklist)
19. [Error Prevention](#error-prevention)

---

## Discovery Questions

Before writing Agent Script, work through these questions to understand requirements:

### Agent Identity & Purpose
- What is the agent's name? (letters, numbers, underscores only; no spaces; max 80 chars)
- What is the agent's primary purpose? (becomes the description)
- What personality should the agent have?
- What should the welcome and error messages say?

### Topics & Conversation Flow
- What distinct conversation areas (topics) does this agent need?
- What is the entry point topic?
- How should the agent transition between topics?
- Are there topics that delegate to others and return?

### State Management
- What information needs to be tracked across the conversation?
- What external context is needed? (session ID, user record, etc.)

### Actions & External Systems
- What external systems does the agent need to call? (Flows, Apex, Prompt Templates, APIs)
- For each action: what inputs, outputs, and availability conditions?

### Reasoning & Instructions
- What should the agent do in each topic?
- Are there conditions that change the instructions?
- Should any actions run automatically before/after reasoning?

---

## File Structure & Block Ordering

Top-level blocks MUST appear in this order:

```agentscript
# 1. SYSTEM (required) - Global instructions and messages
system:
    instructions: "..."
    messages:
        welcome: "..."
        error: "..."

# 2. CONFIG (required) - Agent metadata
config:
    agent_name: "DescriptiveName"
    ...

# 3. VARIABLES (optional) - State management
variables:
    ...

# 4. CONNECTIONS (optional) - Escalation routing
connections:
    ...

# 5. KNOWLEDGE (optional) - Knowledge base config
knowledge:
    ...

# 6. LANGUAGE (optional) - Locale settings
language:
    ...

# 7. START_AGENT (required) - Entry point
start_agent topic_selector:
    description: "..."
    reasoning:
        ...

# 8. TOPICS (at least one required)
topic my_topic:
    ...
```

### Within `start_agent` and `topic` Blocks

1. `description` (required)
2. `system` (optional — instruction overrides)
3. `before_reasoning` (optional)
4. `reasoning` (required)
5. `after_reasoning` (optional)
6. `actions` (optional — action definitions)

### Within `reasoning` Blocks

1. `instructions` (required)
2. `actions` (optional)

---

## Naming Rules

All names (agent_name, topic names, variable names, action names):

- Can contain only letters, numbers, and underscores
- Must begin with a letter
- Cannot include spaces
- Cannot end with an underscore
- Cannot contain two consecutive underscores
- Maximum 80 characters

---

## Indentation & Comments

- Use 4 spaces per indent level (NEVER tabs)
- Use `#` for comments (standalone or inline)

---

## System Block

```agentscript
system:
    messages:
        welcome: "Welcome message shown when conversation starts"
        error: "Error message shown when something goes wrong"

    instructions: ->
        | You are a helpful assistant.
          Always be polite and professional.
          Never share sensitive information.
```

---

## Config Block

```agentscript
config:
    # Required
    agent_name: "DescriptiveName"           # Unique identifier

    # Optional with defaults
    agent_label: "DescriptiveName"          # Display name (defaults to normalized agent_name)
    description: "Agent description"        # What the agent does
    agent_type: "AgentforceServiceAgent"    # or "AgentforceEmployeeAgent"
    default_agent_user: "user@example.com"  # Required for AgentforceServiceAgent
```

---

## Variables Block

```agentscript
variables:
    # MUTABLE variables - agent can read AND write (MUST have default value)
    my_string: mutable string = ""
        description: "Description for slot-filling"
    my_number: mutable number = 0
    my_bool: mutable boolean = False
    my_list: mutable list[string] = []
    my_object: mutable object = {}

    # LINKED variables - read-only from external context (MUST have source, NO default)
    session_id: linked string
        description: "The session ID"
        source: @session.sessionID
```

### Boolean Values

Boolean values MUST be capitalized: `True` or `False`. Never `true` or `false`.

### Valid Types by Context

| Context | Allowed Types |
|---------|--------------|
| Mutable variables | `string`, `number`, `boolean`, `object`, `date`, `timestamp`, `currency`, `id`, `list[T]` |
| Linked variables | `string`, `number`, `boolean`, `date`, `timestamp`, `currency`, `id` |
| Action parameters | `string`, `number`, `boolean`, `object`, `date`, `timestamp`, `currency`, `id`, `list[T]`, `datetime`, `time`, `integer`, `long` |

---

## Topic Block Structure

```agentscript
topic my_topic:
    description: "What this topic handles"

    # Optional: Override system instructions for this topic
    system:
        instructions: ->
            | Topic-specific system instructions

    # Optional: Runs before each reasoning cycle (deterministic)
    before_reasoning:
        run @actions.some_action
            with param = @variables.value
            set @variables.result = @outputs.result

    # Required: Reasoning configuration (LLM-driven)
    reasoning:
        instructions: ->
            | Static instructions that always appear
            if @variables.some_condition:
                | Conditional instructions
            | More instructions with template: {!@variables.value}
        actions:
            action_alias: @actions.action_name
                description: "Override description"
                available when @variables.condition == True
                with param1 = ...
                with param2 = @variables.x
                set @variables.y = @outputs.result

    # Optional: Runs after reasoning completes (deterministic)
    after_reasoning:
        if @variables.should_transition:
            transition to @topic.next_topic

    # Optional: Action definitions (what actions this topic CAN call)
    actions:
        action_name:
            description: "What this action does"
            target: "flow://MyFlow"
            inputs:
                param1: string
                    description: "Parameter description"
            outputs:
                result: string
                    description: "Result description"
```

---

## Action Definitions

### Target Formats

Use `"type://Name"` in the `target` field:

| Type | Example | Description |
|------|---------|-------------|
| `flow` | `"flow://GetCustomerInfo"` | Salesforce Flow |
| `apex` | `"apex://CheckWeather"` | Apex Class |
| `prompt` | `"prompt://Get_Event_Info"` | Prompt Template |
| `standardInvocableAction` | — | Built-in Actions |
| `externalService` | — | External APIs |
| `quickAction` | — | Quick Actions |
| `api` | — | REST API |
| `apexRest` | — | Apex REST |
| `mcpTool` | — | MCP Tool |
| `retriever` | — | Retriever |

Additional types: `serviceCatalog`, `integrationProcedureAction`, `expressionSet`, `cdpMlPrediction`, `externalConnector`, `slack`, `namedQuery`, `auraEnabled`

### Full Action Syntax

```agentscript
actions:
    get_customer:
        target: "flow://GetCustomerInfo"
        description: "Fetches customer information"
        label: "Get Customer"
        require_user_confirmation: False
        include_in_progress_indicator: True
        progress_indicator_message: "Looking up customer..."
        inputs:
            customer_id: string
                description: "The customer's unique ID"
                label: "Customer ID"
                is_required: True
                complex_data_type_name: "lightning__textType"
        outputs:
            name: string
                description: "Customer's name"
            email: string
                description: "Customer's email"
                filter_from_agent: False
                is_displayable: True
```

---

## Reasoning Actions

### Input Binding

```agentscript
reasoning:
    actions:
        # LLM slot-fills all parameters (... means LLM extracts from conversation)
        search: @actions.search_products
            with query = ...
            with category = ...

        # Mix of bound and slot-filled
        lookup: @actions.lookup_customer
            with customer_id = @variables.current_customer_id   # Bound to variable
            with include_history = ...                          # LLM decides
            with limit = 10                                     # Fixed value
```

### Post-Action Directives

Post-action directives ONLY work with `@actions.*`, NEVER with `@utils.*`:

```agentscript
reasoning:
    actions:
        process: @actions.process_order
            with order_id = @variables.order_id
            # Capture outputs into variables
            set @variables.status = @outputs.status
            set @variables.total = @outputs.total
            # Chain another action
            run @actions.send_notification
                with message = "Order processed"
                set @variables.notified = @outputs.sent
            # Conditional transition after action completes
            if @outputs.needs_review:
                transition to @topic.review
```

---

## Utility Actions

Utility actions are ONLY valid inside `reasoning.actions`:

| Utility | Syntax | Purpose |
|---------|--------|---------|
| Escalate | `name: @utils.escalate` | Transfer to human agent |
| Transition | `name: @utils.transition to @topic.X` | Permanent handoff to topic |
| Set Variables | `name: @utils.setVariables` | LLM slot-fills variable values |
| Delegate | `name: @topic.X` | Delegate to topic (can return) |

```agentscript
reasoning:
    actions:
        go_to_checkout: @utils.transition to @topic.checkout
            description: "Move to checkout when ready"
            available when @variables.cart_has_items == True

        get_help: @utils.escalate
            description: "Connect with a human agent"

        consult_expert: @topic.expert_topic
            description: "Consult the expert topic"

        collect_info: @utils.setVariables
            description: "Collect user preferences"
            with preferred_color = ...
            with budget = ...
```

**Important**: Utility actions do NOT support post-action directives (`set`, `run`, `transition`). Any directives attached to utility actions are silently ignored.

---

## Transition Syntax Rules

**CRITICAL: Different syntax depending on context.**

### In `reasoning.actions` (LLM-selected):

```agentscript
go_next: @utils.transition to @topic.target_topic
    description: "Description for LLM"
```

### In Directive Blocks (`before_reasoning`, `after_reasoning`):

```agentscript
transition to @topic.target_topic
```

Rules:
- NEVER use `@utils.transition to` in directive blocks
- NEVER use bare `transition to` in `reasoning.actions`

---

## Control Flow

### If/Else in Instructions

```agentscript
instructions: ->
    | Welcome to the assistant!
    if @variables.user_name:
        | Hello, {!@variables.user_name}!
    else:
        | What's your name?
    if @variables.is_premium:
        | As a premium member, you have access to exclusive features.
```

**Note**: `else if` is NOT supported. Use separate `if` blocks instead.

### Transitions in Directive Blocks

```agentscript
before_reasoning:
    if @variables.not_authenticated:
        transition to @topic.login

after_reasoning:
    if @variables.completed:
        transition to @topic.summary
```

### Conditional Action Availability

```agentscript
reasoning:
    actions:
        admin_action: @actions.admin_function
            available when @variables.user_role == "admin"
        premium_feature: @actions.premium_function
            available when @variables.is_premium == True
```

---

## Templates & Expressions

### String Templates

Use `{!expression}` for string interpolation:

```agentscript
instructions: ->
    | Your order total is: {!@variables.total}
    | Status: {!@variables.status if @variables.status else "pending"}
```

### Multiline Strings

Use `->` followed by `|` for multiline content in procedures:

```agentscript
instructions: ->
    | Line one continues
      on this line (same paragraph)
    | Line two starts fresh
```

Or use `|` directly for simple multiline:

```agentscript
instructions: |
    Line one
    Line two
    Line three
```

### Supported Operators

| Category | Operators |
|----------|-----------|
| Comparison | `==`, `!=`, `<`, `<=`, `>`, `>=`, `is`, `is not` |
| Logical | `and`, `or`, `not` |
| Arithmetic | `+`, `-` only (no `*`, `/`, `%`) |
| Access | `.` (property), `[]` (index) |
| Conditional | `x if condition else y` |

### Resource References

| Reference | Purpose |
|-----------|---------|
| `@actions.<name>` | Action defined in topic's `actions` block |
| `@topic.<name>` | Reference a topic by name |
| `@variables.<name>` | Reference a variable |
| `@outputs.<name>` | Action output (in post-action context only) |
| `@inputs.<name>` | Action input (in procedure context) |
| `@utils.<utility>` | Utility function (escalate, transition to, setVariables) |

---

## Writing Effective Instructions

Instructions are prompts to an LLM. The LLM's behavior is probabilistic — strong, specific
directives are more reliable than soft suggestions.

### Strong vs. Soft Directives

- Use mandatory language ("You MUST", "ALWAYS", "NEVER") for required behaviors
- Be specific about timing: "In your FIRST response, ask for the guest's name"
- Pair positive instructions with negative constraints: "Present the results directly. Do NOT call the action again."

### Post-Action Instructions

The moment after an action returns results is where the LLM is most likely to go off-track.
Always tell the agent explicitly what to do with results:

```agentscript
# WEAK — doesn't say what to do after getting results
| Use the {!@actions.check_events} action to get a list of events.

# STRONG — explicit post-action behavior
| Use the {!@actions.check_events} action to get a list of events.
  After receiving event results, summarize them for the guest in your response.
  Do NOT call the action again — present the results directly.
```

---

## Action Loop Prevention

Each reasoning cycle, the LLM sees all available actions and decides which to call. If an
action remains available after executing and instructions don't say "stop," the LLM may
call it repeatedly.

### What Causes Loops

An action loops when both conditions are true:
1. The `available when` condition remains satisfied after the action runs
2. Instructions don't tell the agent to stop calling the action after receiving results

Variable-bound inputs (`with param = @variables.x`) increase loop risk — no slot-filling
decision required. LLM slot-filled inputs (`with param = ...`) add natural friction.

### Mitigations

- **Instructions**: "After receiving results from {!@actions.X}, present them. Do NOT call the action again."
- **Post-action transitions**: `transition to @topic.other_topic` moves the agent out
- **Input binding**: Use `...` instead of variable binding when appropriate

---

## Grounding Considerations

The platform's grounding checker compares the agent's response against action output data.
Paraphrased or transformed data may be flagged as UNGROUNDED.

### Key Rules

- Instruct the agent to use specific data values from action results verbatim
- Avoid instructions that encourage transforming data (dates → "today", unit conversions)
- Embellishment instructions (e.g., "respond like a pirate") increase grounding risk
- Always closely paraphrase or directly quote data from action results

### Testing Grounding

Grounding can ONLY be validated with **live mode** preview (`--use-live-actions`). Simulated
mode generates fake outputs — the grounding checker has no real data to validate against.

---

## Validation Checklist

Before finalizing an Agent Script, verify:

- [ ] Block ordering: system → config → variables → connections → knowledge → language → start_agent → topics
- [ ] `config` has `agent_name` (and `default_agent_user` for service agents)
- [ ] `system` has `messages.welcome`, `messages.error`, and `instructions`
- [ ] `start_agent` exists with at least one transition action
- [ ] Each `topic` has `description` and `reasoning` block
- [ ] All `mutable` variables have default values
- [ ] All `linked` variables have `source` (and NO default value)
- [ ] Action `target` uses valid format (`flow://`, `apex://`, etc.)
- [ ] Boolean values use `True`/`False` (capitalized)
- [ ] `...` used for LLM slot-filling only (not as variable defaults)
- [ ] `@utils.transition to` in `reasoning.actions`; bare `transition to` in directives
- [ ] Indentation is consistent (4 spaces)
- [ ] Names follow naming rules (letters, numbers, underscores; start with letter)

---

## Error Prevention

### Common Mistakes

1. **Wrong transition syntax:**
    ```agentscript
    # WRONG in reasoning.actions
    go_next: transition to @topic.next
    # CORRECT in reasoning.actions
    go_next: @utils.transition to @topic.next
    # CORRECT in directive blocks
    after_reasoning:
        transition to @topic.next
    ```

2. **Missing default for mutable:**
    ```agentscript
    # WRONG
    count: mutable number
    # CORRECT
    count: mutable number = 0
    ```

3. **Wrong boolean case:**
    ```agentscript
    # WRONG
    enabled: mutable boolean = true
    # CORRECT
    enabled: mutable boolean = True
    ```

4. **`...` as variable default:**
    ```agentscript
    # WRONG — slot-fill syntax, not a default
    my_var: mutable string = ...
    # CORRECT
    my_var: mutable string = ""
    ```

5. **List type for linked variables:**
    ```agentscript
    # WRONG — linked cannot be list
    items: linked list[string]
    # CORRECT
    items: mutable list[string] = []
    ```

6. **Default value on linked variable:**
    ```agentscript
    # WRONG
    session_id: linked string = ""
        source: @session.sessionID
    # CORRECT
    session_id: linked string
        source: @session.sessionID
    ```

7. **Post-action directives on utilities:**
    ```agentscript
    # WRONG — utilities don't support directives
    go_next: @utils.transition to @topic.next
        set @variables.navigated = True
    # CORRECT — only @actions support directives
    process: @actions.process_order
        set @variables.result = @outputs.result
    ```
