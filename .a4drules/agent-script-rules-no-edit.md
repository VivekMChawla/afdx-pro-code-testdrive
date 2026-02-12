# Agent Script Rules & Guide

This document provides comprehensive rules and guidance for building valid Agent Script configurations (`.agent` files).

---

## Discovery Questions

Before writing Agent Script, work through these questions to understand requirements:

### 1. Agent Identity & Purpose

- **What is the agent's name?** (letters, numbers, underscores only; no spaces; max 80 chars)
- **What is the agent's primary purpose?** (This becomes the description)
- **What personality should the agent have?** (Friendly, professional, formal, casual?)
- **What should the welcome message say?**
- **What should the error message say?**

### 2. Topics & Conversation Flow

- **What distinct conversation areas (topics) does this agent need?**
- **What is the entry point topic?** (The first topic users interact with)
- **How should the agent transition between topics?**
- **Are there any topics that need to delegate to other topics and return?**

### 3. State Management

- **What information needs to be tracked across the conversation?**
    - User data (name, email, preferences)?
    - Process state (step completed, status)?
    - Collected inputs (selections, answers)?
- **What external context is needed?** (session ID, user record, etc.)

### 4. Actions & External Systems

- **What external systems does the agent need to call?**
    - Salesforce Flows
    - Apex classes
    - Prompt templates
    - External APIs
- **For each action:**
    - What inputs does it need?
    - What outputs does it return?
    - When should it be available?

### 5. Reasoning & Instructions

- **What should the agent do in each topic?**
- **Are there conditions that change the instructions?**
- **Should any actions run automatically before/after reasoning?**

---

## Lifecycle Operations

### Validating Agent Script

ALWAYS run this CLI command after modifying `.agent` files to validate your changes.
```bash
sf agent validate authoring-bundle --api-name NAME_OF_AGENT_FILE_WITHOUT_EXTENSION
```

### Deployment Considerations
- NEVER deploy `.agent` or `AiAuthoringBundle` metadata unless explicitly asked to do so
- ALWAYS deploy `ApexClass` metadata when you create or modify `.cls` Apex class files

---

## Metadata Locations

Metadata source paths depend on the package directories defined in `sfdx-project.json` at the project root. Check the `packageDirectories` array for the correct base path. `force-app` is a common default but is not guaranteed. Metadata type subdirectories (e.g., `aiAuthoringBundles/`, `classes/`) are relative to `<packageDirectory>/main/default/`.

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
        instructions: ->
            ...
        actions:
            ...

# 8. TOPICS (at least one required)
topic my_topic:
    description: "..."
    reasoning:
        ...
    actions:
        ...
```

---

## Block Internal Ordering

### Within `start_agent` and `topic` blocks:

1. `description` (required)
2. `system` (optional - for instruction overrides)
3. `before_reasoning` (optional)
4. `reasoning` (required)
5. `after_reasoning` (optional)
6. `actions` (optional - action definitions)

### Within `reasoning` blocks:

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

## Block Reference

### System Block

```agentscript
system:
    messages:
        welcome: "Welcome message shown when conversation starts"
        error: "Error message shown when something goes wrong"

    # The | (pipe) indicates multiline prompt instructions before/after deterministic logic
    instructions: ->
        | You are a helpful assistant.
          Always be polite and professional.
          Never share sensitive information.
```

### Config Block

```agentscript
config:
    # Required
    agent_name: "DescriptiveName"           # Unique identifier (letters, numbers, underscores)

    # Optional with defaults
    agent_label: "DescriptiveName"          # Display name (defaults to normalized agent_name)
    description: "Agent description"        # What the agent does
    agent_type: "AgentforceServiceAgent"    # or "AgentforceEmployeeAgent"
    default_agent_user: "user@example.com"  # Required for AgentforceServiceAgent
```

### Variables Block

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

**Boolean variable values MUST be capitalized:**
- ALWAYS `True` or `False`
- NEVER `true` or `false`

**Valid Types by Context:**

- **Mutable variable types:** `string`, `number`, `boolean`, `object`, `date`, `timestamp`, `currency`, `id`, `list[T]`
- **Linked variable types:** `string`, `number`, `boolean`, `date`, `timestamp`, `currency`, `id`
- **Action parameter types:** `string`, `number`, `boolean`, `object`, `date`, `timestamp`, `currency`, `id`, `list[T]`, `datetime`, `time`, `integer`, `long`


### Topic Block Structure

```agentscript
topic my_topic:
    description: "What this topic handles"

    # Optional: Override system instructions for this topic
    system:
        instructions: -> 
            | Topic-specific system instructions

    # Action definitions (what the topic CAN call)
    actions:
        action_name:
            description: "What this action does"
            inputs:
                param1: string
                description: "Parameter description"
                param2: number
            outputs:
                result: string
            target: "flow://MyFlow"

    # Optional: Runs before each reasoning cycle
    before_reasoning:
        run @actions.some_action
            with param = @variables.value
            set @variables.result = @outputs.result

    # Required: Reasoning configuration
    reasoning:
        instructions:->
            | Static instructions that always appear
            if @variables.some_condition:
                | Conditional instructions
            | More instructions with template: {!@variables.value}

        # Actions available to the LLM during reasoning
        actions:
            action_alias: @actions.action_name
                description: "Override description"
                available when @variables.condition == True
                with param1 = ...           # LLM slot-fills this
                with param2 = @variables.x  # Bound to variable
                set @variables.y = @outputs.result

    # Optional: Runs after reasoning completes
    after_reasoning:
        if @variables.should_transition:
            transition to @topic.next_topic
```

---

## Action Definition

### Target Formats

Use the format `"type://Name"` in the `target` field. Common target types:

- `flow` — Salesforce Flow (e.g., `"flow://GetCustomerInfo"`)
- `apex` — Apex Class (e.g., `"apex://CheckWeather"`)
- `prompt` — Prompt Template (e.g., `"prompt://Get_Event_Info"`). Long form: `generatePromptResponse`
- `standardInvocableAction` — Built-in Actions
- `externalService` — External APIs
- `quickAction` — Quick Actions
- `api` — REST API
- `apexRest` — Apex REST

Additional target types: `serviceCatalog`, `integrationProcedureAction`, `expressionSet`, `cdpMlPrediction`, `externalConnector`, `slack`, `namedQuery`, `auraEnabled`, `mcpTool`, `retriever`

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
        # LLM slot-fills all parameters
        search: @actions.search_products
            with query = ...
            with category = ...

        # Mix of bound and slot-filled
        lookup: @actions.lookup_customer
            with customer_id = @variables.current_customer_id   # Bound
            with include_history = ...                          # LLM decides
            with limit = 10                                     # Fixed value
```

Use `...` to indicate LLM should extract value from conversation.

### Post-Action Directives

Only work with `@actions.*`, NOT with `@utils.*`:

```agentscript
reasoning:
    actions:
        process: @actions.process_order
            with order_id = @variables.order_id
            # Capture outputs
            set @variables.status = @outputs.status
            set @variables.total = @outputs.total
            # Chain another action
            run @actions.send_notification
                with message = "Order processed"
                set @variables.notified = @outputs.sent
            # Conditional transition
            if @outputs.needs_review:
                transition to @topic.review
```

### Utility Actions (reasoning.actions only)

- `@utils.escalate` — Escalate to a human agent. Syntax: `name: @utils.escalate`
- `@utils.transition to` — Permanent handoff to another topic. Syntax: `name: @utils.transition to @topic.X`
- `@utils.setVariables` — Set variables via LLM slot-filling. Syntax: `name: @utils.setVariables` with `with var = ...`
- `@topic.<name>` — Delegate to another topic (can return). Syntax: `name: @topic.X`

```agentscript
reasoning:
    actions:
        # Transition to another topic (permanent handoff)
        go_to_checkout: @utils.transition to @topic.checkout
            description: "Move to checkout when ready"
            available when @variables.cart_has_items == True

        # Escalate to human
        get_help: @utils.escalate
            description: "Connect with a human agent"
            available when @variables.needs_human == True

        # Delegate to topic (can return)
        consult_expert: @topic.expert_topic
            description: "Consult the expert topic"

        # Set variables via LLM
        collect_info: @utils.setVariables
            description: "Collect user preferences"
            with preferred_color = ...
            with budget = ...
```

---

## Transition Syntax Rules

**CRITICAL: Different syntax depending on context!**

### In `reasoning.actions` (LLM-selected):

```agentscript
go_next: @utils.transition to @topic.target_topic
   description: "Description for LLM"
```

### In Directive Blocks (`before_reasoning`, `after_reasoning`):

```agentscript
transition to @topic.target_topic
```

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

Note: `else if` is not currently supported.

### Transitions in Directive Blocks

```agentscript
before_reasoning:
    if @variables.not_authenticated:
        transition to @topic.login

    if @variables.session_expired:
        transition to @topic.session_expired

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
    | Items in cart: {!@variables.cart_items}
    | Status: {!@variables.status if @variables.status else "pending"}
```

### Multiline Strings

Use `|` for multiline content:

```agentscript
instructions: |
   Line one
   Line two
   Line three
```

Or in procedures:

```agentscript
instructions: ->
   | Line one
     continues here
   | Line two starts fresh
```

### Supported Operators

- Comparison operators: `==`, `!=`, `<`, `<=`, `>`, `>=`, `is`, `is not`
- Logical operators: `and`, `or`, `not`
- Arithmetic operators: `+`, `-` only (no `*`, `/`, `%`)
- Access operators: `.` (property access), `[]` (index access)
- Conditional expressions: `x if condition else y`

### Resource References

- `@actions.<name>` - Reference action defined in topic's `actions` block
- `@topic.<name>` - Reference a topic by name
- `@variables.<name>` - Reference a variable
- `@outputs.<name>` - Reference action output (in post-action context)
- `@inputs.<name>` - Reference action input (in procedure context)
- `@utils.<utility>` - Reference utility function (escalate, transition to, setVariables)

---

## Comprehensive Example

This example demonstrates all block types: system, config, variables (mutable + linked), start_agent, multiple topics with transitions, action definitions with inputs/outputs, before_reasoning, reasoning with conditionals and actions, and after_reasoning.

```agentscript
system:
    instructions: "You are a helpful customer service assistant. Be professional and concise."
    messages:
        welcome: "Hello! How can I help you today?"
        error: "Sorry, something went wrong. Please try again."

config:
    agent_name: "Customer_Service_Agent"
    agent_type: "AgentforceServiceAgent"
    default_agent_user: "serviceuser@example.com"
    description: "Handles customer inquiries about orders and accounts."

variables:
    customer_name: mutable string = ""
        description: "The customer's name"
    EndUserId: linked string
        source: @MessagingSession.MessagingEndUserId
        description: "This variable may also be referred to as MessagingEndUser Id"

start_agent topic_selector:
    description: "Route the customer to the appropriate topic"
    reasoning:
        actions:
            go_order_info: @utils.transition to @topic.order_info
                description: "Route to order info when the customer asks about an order"
            go_account_help: @utils.transition to @topic.account_help
                description: "Route to account help for account-related questions"

topic order_info:
    description: "Look up order status and provide updates to the customer"

    before_reasoning:
        if @variables.customer_name:
            run @actions.fetch_order
                with customer_id = @variables.customer_name

    reasoning:
        instructions: ->
            if @variables.customer_name:
                | The customer's name is {!@variables.customer_name}.
            else:
                | Ask the customer for their name.
            | Help the customer with their order inquiry.

        actions:
            check_order: @actions.fetch_order
                description: "Look up order status by customer ID"
                with customer_id = ...

            go_account: @utils.transition to @topic.account_help
                description: "Switch to account help if the customer asks about their account"

    after_reasoning:
        if @variables.customer_name:
            transition to @topic.account_help

    actions:
        fetch_order:
            target: "flow://GetOrderStatus"
            description: "Fetch the status of a customer's order"
            label: "Get Order Status"
            include_in_progress_indicator: True
            progress_indicator_message: "Looking up your order..."
            inputs:
                customer_id: string
                    description: "The customer's unique identifier"
                    is_required: True
            outputs:
                status: string
                    description: "Current order status"
                    is_displayable: True
                    filter_from_agent: False

topic account_help:
    description: "Help customers with account-related questions"

    reasoning:
        instructions: ->
            | Help the customer with their account questions.
              You can assist with password resets, profile updates, and billing inquiries.

        actions:
            go_order: @utils.transition to @topic.order_info
                description: "Switch to order info if the customer asks about an order"
            escalate: @utils.escalate
                description: "Connect with a human agent if the customer requests it"
```

---

## Writing Effective Instructions

Instructions in Agent Script are prompts to an LLM. The LLM's behavior is probabilistic — it complies more reliably with strong, specific directives than with soft suggestions.

### Strong vs. Soft Directives

- Use mandatory language ("You MUST", "ALWAYS", "NEVER") for required behaviors. Reserve softer language ("try to", "consider", "when appropriate") for genuine preferences.
- Be specific about timing: "In your FIRST response, ask for the guest's name" is stronger than "ask for the name early in the conversation."
- Pair positive instructions with negative constraints: "Present the results directly. Do NOT call the action again" is more reliable than either statement alone.

### Post-Action Instructions

The moment after an action returns results is where the LLM is most likely to go off-track. Always tell the agent explicitly what to do with the results:

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

Each reasoning cycle, the LLM sees all available actions and decides which to call. If an action remains available after executing and the instructions don't say "stop," the LLM may call it repeatedly.

### What Causes Loops

An action enters a loop when two conditions are both true:
1. The `available when` condition remains satisfied after the action runs (e.g., `available when @variables.interest != ""` — the variable stays set after the action executes).
2. The instructions don't tell the agent to stop calling the action after receiving results.

Variable-bound inputs (e.g., `with param = @variables.x`) increase loop risk because the action is "ready to go" every cycle — no slot-filling decision required. LLM-slot-filled inputs (`with param = ...`) add natural decision friction.

### Mitigations

- **Instructions (most common fix)**: Add explicit post-action instructions: "After receiving results from {!@actions.X}, present them to the guest. Do NOT call the action again."
- **Post-action transitions**: Use `transition to @topic.other_topic` after the action completes to move the agent out of the topic, breaking the cycle.
- **Input binding**: Use `...` (LLM slot-fill) instead of variable binding when appropriate — this requires the LLM to actively decide to fill the input each cycle.

---

## Grounding Considerations

The platform's grounding checker compares the agent's response text against action output data. If the agent paraphrases or transforms data values, the grounding checker may not be able to verify the claim and will flag the response as UNGROUNDED.

### Key Rules

- Instruct the agent to use specific data values from action results. "Use the actual date from the results" passes grounding; "say 'today'" may not — the grounding checker cannot always infer that a specific date equals "today."
- Avoid instructions that encourage transforming data into relative or colloquial forms (dates → "today"/"tomorrow", units → converted values without originals).
- Instructions that encourage embellishment (e.g., "respond like a pirate") increase grounding risk — embellished content has no action output to ground against.
- Always closely paraphrase or directly quote data from action results. The closer the response text matches the action output, the more reliably it passes grounding.

### Testing Grounding

Grounding behavior can only be validated with **live mode** preview (`--use-live-actions`). Simulated mode generates fake action outputs, so the grounding checker has no real data to validate against. See the Agent Preview Rules for details.

---

## Validation Checklist

Before finalizing an Agent Script, verify:

- [ ] Block ordering is correct (system → config → variables → connections → knowledge → language → start_agent → topics)
- [ ] `config` block has `agent_name` (and `default_agent_user` for service agents)
- [ ] `system` block has `messages.welcome`, `messages.error`, and `instructions`
- [ ] `start_agent` block exists with at least one transition action
- [ ] Each `topic` has a `description` and `reasoning` block
- [ ] All `mutable` variables have default values
- [ ] All `linked` variables have `source` specified (and NO default value)
- [ ] Action `target` uses valid format (`flow://`, `apex://`, etc.)
- [ ] Boolean values use `True`/`False` (capitalized)
- [ ] `...` is used for LLM slot-filling (not as variable default values)
- [ ] `@utils.transition to` is used in `reasoning.actions`
- [ ] `transition to` (without `@utils`) is used in directive blocks
- [ ] Indentation is consistent (4 spaces recommended)
- [ ] Names follow naming rules (letters, numbers, underscores; no spaces; start with letter)

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

4. **Using `...` as a variable default (it's for slot-filling only):**

    ```agentscript
    # WRONG - this is slot-filling syntax
    my_var: mutable string = ...

    # CORRECT
    my_var: mutable string = ""
    ```

5. **List type for linked variables:**

    ```agentscript
    # WRONG - linked cannot be list
    items: linked list[string]

    # CORRECT
    items: mutable list[string] = []
    ```

6. **Default value on linked variable:**

    ```agentscript
    # WRONG - linked variables get value from source
    session_id: linked string = ""
        source: @session.sessionID

    # CORRECT
    session_id: linked string
        source: @session.sessionID
    ```

7. **Post-action directives on utilities:**

    ```agentscript
    # WRONG - utilities don't support post-action directives
    go_next: @utils.transition to @topic.next
        set @variables.navigated = True

    # CORRECT - only @actions support post-action directives
    process: @actions.process_order
        set @variables.result = @outputs.result
    ```
