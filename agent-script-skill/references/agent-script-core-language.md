# Agent Script: Core Language Reference

## Table of Contents

1. How Agent Script Executes
2. File Structure and Block Ordering
3. Naming and Formatting Rules
4. Expressions and Operators
5. System and Config Blocks
6. Variables
7. Topics
8. Reasoning Instructions
9. Flow Control
10. Actions
11. Utility Functions
12. Anti-Patterns

---

## 1. How Agent Script Executes

Agent Script operates in two phases: deterministic resolution, then LLM reasoning [Source: ascript-flow.md, ascript-lang.md].

**Phase 1: Deterministic Resolution.** The runtime executes a topic's reasoning instructions top to bottom — evaluating `if`/`else` conditions, running actions via `run`, and setting variables via `set`. The LLM is NOT involved yet. The runtime builds a prompt string by accumulating `|` pipe text and resolving conditional logic. If a `transition` command occurs, the runtime discards the current prompt and starts fresh with the target topic [Source: ascript-flow.md].

**Phase 2: LLM Reasoning.** The runtime passes the resolved prompt to the LLM along with any reasoning actions (tools) the topic exposes. The LLM decides what to do — it can call available actions but cannot modify the prompt text. It only reasons against what Phase 1 resolved [Source: ascript-flow.md, ascript-ref-tools.md].

**Worked Example.** Consider this topic:

```agentscript
topic check_order:
    reasoning:
        instructions: ->
            if @variables.order_id != "":
                run @actions.fetch_order
                    with id = @variables.order_id
                    set @variables.status = @outputs.status

            | Your order status is {!@variables.status}.
              You can modify it using the {!@actions.update_order} action.

        actions:
            update: @actions.update_order
                with order_id = @variables.order_id
```

If `@variables.order_id` is `"1001"` and the `fetch_order` action returns `status = "shipped"`, the runtime resolves to this prompt:

```
Your order status is shipped.
You can modify it using the update_order action.
```

The LLM then receives this prompt plus the `update` tool and decides whether to call it based on what the user asks.

This split is critical: **deterministic logic controls WHAT the agent knows (via resolved prompt), and the LLM controls WHETHER and HOW to act on that knowledge** [Source: ascript-flow.md].

---

## 2. File Structure and Block Ordering

An Agent Script file (`.agent` extension) contains eight top-level blocks in this mandatory order [Source: ascript-blocks.md, .a4drules]:

```agentscript
system:
    ...

config:
    ...

variables:
    ...

connections:
    ...

knowledge:
    ...

language:
    ...

start_agent topic_selector:
    ...

topic my_topic:
    ...
```

**Required blocks:** `system`, `config`, `start_agent`, and at least one `topic` [Source: .a4drules].

**Optional blocks:** `variables`, `connections`, `knowledge`, `language`. Omit them if not needed [Source: ascript-blocks.md].

**Within `start_agent` and `topic` blocks**, the internal ordering is [Source: .a4drules]:

1. `description` (required)
2. `system` (optional — topic-level override of global system instructions)
3. `before_reasoning` (optional — runs before reasoning phase)
4. `reasoning` (required)
5. `after_reasoning` (optional — runs after reasoning phase)
6. `actions` (optional — action definitions)

---

## 3. Naming and Formatting Rules

**Naming constraints for all identifiers** (developer_name, topic names, variable names, action names, connection names) [Source: .a4drules, ascript-blocks.md]:

- Contain only letters, numbers, and underscores
- Begin with a letter (never underscore)
- Cannot end with an underscore
- Cannot contain two consecutive underscores (`__`)
- Maximum 80 characters
- `snake_case` is strongly recommended

Example: `check_order_status` is valid. `check_order__status` is invalid (consecutive underscores).

**Indentation:** Use 4 spaces per indent level. NEVER use tabs [Source: .a4drules]. Mixing spaces and tabs breaks the parser. All lines at the same nesting level must use the same indentation [Source: ascript-lang.md].

```agentscript
topic process_order:
    description: "Handle order processing"
    reasoning:
        instructions: ->
            | Welcome
```

**Comments:** Use `#` for single-line comments. The parser ignores everything after `#` on that line [Source: ascript-lang.md].

```agentscript
# This is a comment
variables:
    order_id: mutable string = ""  # Slot-filled by LLM
```

---

## 4. Expressions and Operators

**Comparison operators** [Source: .a4drules, ascript-lang.md]:

- `==` (equal): `@variables.status == "complete"`
- `!=` (not equal): `@variables.count != 0`
- `<` (less than): `@variables.price < 100`
- `<=` (less than or equal): `@variables.age <= 18`
- `>` (greater than): `@variables.amount > 50`
- `>=` (greater than or equal): `@variables.balance >= 0`

**Logical operators** [Source: .a4drules]:

- `and`: Both conditions must be true. `@variables.verified == True and @variables.age >= 18`
- `or`: Either condition can be true. `@variables.status == "pending" or @variables.status == "review"`
- `not`: Negates a condition. `not @variables.is_guest == True` (though `@variables.is_guest == False` is more readable)

**Arithmetic operators** (limited support) [Source: ascript-lang.md, ascript-ref-operators.md]:

- `+` (addition): `@variables.count + 1`
- `-` (subtraction): `@variables.total - @variables.discount`

Do NOT use `*`, `/`, `%` — they are not supported [Source: ascript-lang.md].

**Access operators**:

- `.` (property access): `@object.property`
- `[]` (index access): `@variables.items[0]`

**Conditional expressions**:

- `x if condition else y`: `"premium" if @variables.is_premium == True else "standard"`

**Template injection in strings** (within `|` multiline text) [Source: ascript-lang.md, ascript-ref-instructions.md]:

Use `{!expression}` to inject variable values or expressions into prompt text:

```agentscript
instructions: |
    Your total is {!@variables.total}.
    Your status: {!@variables.status if @variables.status else "pending"}.
```

The expression inside `{! ... }` is evaluated during Phase 1 and the result replaces the entire `{! ... }` block in the prompt.

**Resource references** [Source: ascript-lang.md]:

- `@actions.<name>` — reference an action defined in the topic's `actions` block
- `@topic.<name>` — reference a topic by name
- `@variables.<name>` — reference a variable (use in logic)
- `{!@variables.<name>}` — reference a variable in prompt text (template injection)
- `@outputs.<name>` — reference an action output (only in post-action context)
- `@inputs.<name>` — reference an action input (in action definition)
- `@utils.<function>` — reference a utility (escalate, transition to, setVariables)

**Do NOT use `<>` as inequality operator.** Use `!=` instead [Source: .a4drules].

```agentscript
# WRONG
if @variables.status <> "pending":

# CORRECT
if @variables.status != "pending":
```

---

## 5. System and Config Blocks

**System block** provides global instructions and messages [Source: ascript-blocks.md, .a4drules]:

```agentscript
system:
    instructions: "You are a helpful assistant. Be professional and concise."
    messages:
        welcome: "Hello! How can I help?"
        error: "Sorry, something went wrong. Please try again."
```

The `instructions` field is required and contains text directives sent to the LLM in every reasoning phase [Source: .a4drules]. Topic-level system blocks can override this [Source: ascript-blocks.md].

Both `welcome` and `error` messages are required [Source: .a4drules].

**Config block** contains agent metadata [Source: ascript-blocks.md, .a4drules]:

```agentscript
config:
    developer_name: "Customer_Service_Agent"
    agent_label: "Customer Service"
    description: "Handles customer inquiries"
    agent_type: "AgentforceServiceAgent"
    default_agent_user: "agent@example.com"
```

**Required fields:**
- `developer_name` (NOT `agent_name`) — unique identifier following naming rules [Source: .a4drules, ascript-blocks.md]
- `default_agent_user` (for `AgentforceServiceAgent` type only) — Salesforce user ID or email [Source: .a4drules]

**Optional fields:**
- `agent_label` — human-readable display name. Defaults to normalized `developer_name` if omitted [Source: .a4drules]
- `description` — what the agent does [Source: ascript-blocks.md]
- `agent_type` — either `"AgentforceServiceAgent"` or `"AgentforceEmployeeAgent"` [Source: .a4drules]

---

## 6. Variables

**Two types of variables** [Source: ascript-ref-variables.md, .a4drules]:

**Mutable variables** — the agent can read AND write. MUST have a default value [Source: .a4drules]:

```agentscript
variables:
    customer_name: mutable string = ""
    order_count: mutable number = 0
    is_premium: mutable boolean = False
    preferences: mutable object = {}
    items: mutable list[string] = []
```

**Linked variables** — read-only from external context. MUST have a `source`, MUST NOT have a default value [Source: .a4drules]:

```agentscript
variables:
    session_id: linked string
        source: @session.sessionID
    user_id: linked string
        source: @MessagingSession.MessagingEndUserId
```

The `source` field points to the external context. At runtime, the platform provides the value [Source: .a4drules].

**Type constraints by context** [Source: .a4drules]:

- Mutable variable types: `string`, `number`, `boolean`, `object`, `date`, `timestamp`, `currency`, `id`, `list[T]`
- Linked variable types: `string`, `number`, `boolean`, `date`, `timestamp`, `currency`, `id` (no `list`)
- Action parameter types: `string`, `number`, `boolean`, `object`, `date`, `timestamp`, `currency`, `id`, `list[T]`, `datetime`, `time`, `integer`, `long`

**Boolean capitalization** [Source: .a4drules]:

ALWAYS use `True` or `False` (capitalized). NEVER use `true` or `false`:

```agentscript
# WRONG
enabled: mutable boolean = true
verified: linked boolean = false

# CORRECT
enabled: mutable boolean = True
is_verified: mutable boolean = False
```

**Template injection for variables** in prompt text [Source: ascript-lang.md]:

Use `{!@variables.X}` to interpolate a variable's value into prompt text:

```agentscript
instructions: |
    Hello, {!@variables.customer_name}!
    Your balance: {!@variables.balance}
```

In prompt text (inside `|` pipe sections), always use `{!@variables.X}` with braces — the braces trigger template evaluation. Bare `@variables.X` without braces is valid in logic contexts (e.g., `if @variables.X == True:`) but will not interpolate in prompt text [Source: ascript-lang.md].

---

## 7. Topics

**Topic structure** — a named scope for reasoning, actions, and flow control [Source: ascript-blocks.md, .a4drules]:

```agentscript
topic order_lookup:
    description: "Handle customer order inquiries"

    reasoning:
        instructions: ->
            | Help the customer find their order.
        actions:
            search: @actions.find_order
                with order_id = ...

    actions:
        find_order:
            description: "Search for an order by ID"
            target: "flow://SearchOrder"
            inputs:
                order_id: string
            outputs:
                status: string
```

**Description is required** — the LLM uses this to understand when the topic is relevant [Source: ascript-blocks.md].

**Topic-level system override** (optional) — override global system instructions for this topic only [Source: .a4drules]:

```agentscript
topic product_specialist:
    description: "Answer product questions"
    system:
        instructions: "You are a product expert. Be technical and detailed."
    reasoning:
        instructions: ->
            | Help with product specs.
```

**Internal block ordering within a topic** [Source: .a4drules]:

1. `description`
2. `system` (optional override)
3. `before_reasoning` (optional)
4. `reasoning` (required)
5. `after_reasoning` (optional)
6. `actions` (optional definitions)

**Before/after reasoning directive blocks** [Source: .a4drules]:

`before_reasoning` and `after_reasoning` contain deterministic logic that runs outside the reasoning phase:

```agentscript
before_reasoning:
    if @variables.session_expired:
        transition to @topic.login

reasoning:
    instructions: ->
        | Main topic logic

after_reasoning:
    if @variables.transaction_complete:
        transition to @topic.confirmation
```

Directive blocks use the arrow syntax (`->`) for logic but no LLM reasoning. They run deterministically [Source: .a4drules].

---

## 8. Reasoning Instructions

Reasoning instructions combine deterministic logic and prompt text. The runtime resolves deterministic parts (Phase 1), then sends the resulting prompt to the LLM (Phase 2) [Source: ascript-ref-instructions.md, ascript-flow.md].

**Arrow syntax (`->`) for logic blocks** [Source: ascript-lang.md]:

```agentscript
reasoning:
    instructions: ->
        if @variables.user_verified:
            run @actions.get_account
                with user_id = @variables.user_id
                set @variables.account_info = @outputs.account

        | Now tell the user their account balance.
```

The `->` prefix indicates "start with logic, then switch to prompt". The runtime evaluates the `if` condition and `run` command, then appends the pipe-delimited text to the prompt.

**Pipe syntax (`|`) for multiline prompt text** [Source: ascript-lang.md, ascript-ref-instructions.md]:

Within a logic block, use `|` to switch from deterministic instructions to prompt text:

```agentscript
instructions: ->
    if @variables.needs_help:
        | Ask the user what they need help with.
    else:
        | Suggest self-service options.
```

**If/Else (no "else if")** [Source: .a4drules, ascript-lang.md]:

```agentscript
if @variables.status == "pending":
    run @actions.notify_pending
else:
    run @actions.notify_complete

# WRONG — else if not supported
if @variables.count < 5:
    run @actions.small
else if @variables.count < 10:
    run @actions.medium
```

To nest conditions, use separate `if` blocks:

```agentscript
if @variables.status == "pending":
    if @variables.priority == "high":
        run @actions.escalate_pending
    else:
        run @actions.queue_pending
```

**Inline action invocation (`run @actions.X`)** [Source: ascript-ref-instructions.md, .a4drules]:

```agentscript
run @actions.check_inventory
    with product_id = @variables.selected_product
    set @variables.stock_level = @outputs.available_quantity
```

The `run` command executes the action deterministically during Phase 1. Use `with` to pass inputs (bound to variables or literal values). Use `set` to capture outputs into variables [Source: ascript-ref-instructions.md].

**Post-action directives** (only for `@actions`, not `@utils`) [Source: .a4drules]:

```agentscript
run @actions.process_order
    with order_id = @variables.order_id
    set @variables.result = @outputs.status
    if @outputs.success == True:
        transition to @topic.confirmation
    else:
        transition to @topic.error_handling
```

After an action completes, you can check outputs and transition. These directives remain deterministic (Phase 1) [Source: .a4drules].

**How pipe sections become the LLM prompt** [Source: ascript-flow.md]:

Every line with `|` is concatenated in order as the prompt text. All logic (if/else, run, set) is resolved first, and only matching pipe lines are included:

```agentscript
instructions: ->
    | Welcome!
    if @variables.is_returning:
        | Nice to see you again.
    else:
        | Let's get started.
    | How can I help?

# If is_returning == False, the prompt becomes:
# "Welcome! Let's get started. How can I help?"
```

---

## 9. Flow Control

Flow control determines how execution moves between topics and responds to conditions.

**Start agent topic** — the mandatory entry point [Source: ascript-blocks.md]:

Every conversation begins at `start_agent`. The LLM classifies the user's intent and routes to the appropriate topic:

```agentscript
start_agent topic_selector:
    description: "Route to appropriate topic"
    reasoning:
        instructions: ->
            | Welcome. I can help with orders, accounts, or billing.
        actions:
            go_orders: @utils.transition to @topic.order_info
                description: "For order inquiries"
            go_accounts: @utils.transition to @topic.account_help
                description: "For account questions"
```

**LLM-chosen transitions in reasoning actions** [Source: .a4drules, ascript-ref-tools.md]:

When the decision to leave a topic depends on conversation context or user intent — and the LLM should judge the right moment — expose the transition as a reasoning action using `@utils.transition to`:

```agentscript
reasoning:
    actions:
        go_next: @utils.transition to @topic.next_topic
            description: "Move to the next topic"
            available when @variables.ready == True
```

**Deterministic transitions in directive blocks** [Source: .a4drules, ascript-flow.md]:

When the decision to leave a topic is based on known state — not a judgment call — use bare `transition to` in `before_reasoning` and `after_reasoning`:

```agentscript
before_reasoning:
    if @variables.not_authenticated:
        transition to @topic.login

after_reasoning:
    if @variables.session_complete:
        transition to @topic.summary
```

The runtime evaluates the condition and transitions immediately. Do NOT use `@utils.transition to` in directive blocks — it causes compilation errors [Source: .a4drules].

**Delegation with return** [Source: ascript-ref-tools.md]:

When a topic needs another topic's expertise but still has work to do afterward, use `@topic.X` to delegate. The target topic runs its reasoning, then returns control to the caller:

```agentscript
reasoning:
    actions:
        ask_expert: @topic.expert_consultation
            description: "Consult the expert topic"
```

This is different from `@utils.transition to`, which is one-way — the calling topic does not resume [Source: ascript-ref-tools.md].

**Conditional branching within topics** [Source: .a4drules]:

Flow control also operates within a single topic. Conditions in reasoning instructions determine which prompt text the LLM receives — the runtime resolves them in Phase 1:

```agentscript
reasoning:
    instructions: ->
        if @variables.order_id != "":
            | Show order details for {!@variables.order_id}.
        else:
            | I need an order ID to help you.
```

---

## 10. Actions

Actions are tasks a topic can perform: invoking Flows, Apex classes, or Prompt Templates. Actions can run deterministically (Phase 1) or be exposed as tools for the LLM to choose (Phase 2) [Source: ascript-ref-actions.md, ascript-flow.md].

**Action definition in topic.actions block** [Source: ascript-ref-actions.md]:

```agentscript
actions:
    check_inventory:
        description: "Check product availability"
        target: "flow://CheckProductInventory"
        inputs:
            product_id: string
                description: "The product ID"
                is_required: True
        outputs:
            in_stock: boolean
                description: "Whether the product is in stock"
            quantity: number
                description: "Units available"
```

**Target protocols** [Source: ascript-ref-actions.md, .a4drules]:

- `flow://FlowName` — Salesforce Flow
- `apex://ClassName` — Invocable Apex class
- `prompt://PromptTemplateName` — Prompt Template (short form `prompt://` or long form `generatePromptResponse://`)

Example: `target: "flow://Get_Customer_Details"` or `target: "apex://CheckWeather"` [Source: ascript-ref-actions.md, .a4drules].

**Complex data types** — when an output is a Salesforce object type [Source: ascript-ref-actions.md, Local_Info_Agent.agent]:

```agentscript
actions:
    check_weather:
        target: "apex://CheckWeather"
        outputs:
            date_result: object
                complex_data_type_name: "lightning__dateType"
                description: "Date returned by Apex"
```

Use `type: object` and specify `complex_data_type_name` with the Apex/Flow type name [Source: ascript-ref-actions.md].

**Deterministic action invocation** (Phase 1 — always runs) [Source: ascript-ref-actions.md]:

```agentscript
reasoning:
    instructions: ->
        run @actions.check_inventory
            with product_id = @variables.product_id
            set @variables.stock_count = @outputs.quantity
```

The `run` command executes the action during Phase 1, before the LLM reasons [Source: ascript-ref-actions.md, ascript-flow.md].

**LLM exposure via reasoning.actions** (Phase 2 — LLM chooses) [Source: ascript-ref-tools.md]:

```agentscript
reasoning:
    actions:
        lookup: @actions.check_inventory
            description: "Check if product is in stock"
            with product_id = @variables.selected_product
            set @variables.stock_count = @outputs.quantity
```

The action is listed as a tool. The LLM sees the description and decides whether to call it [Source: ascript-ref-tools.md].

**Input binding patterns** [Source: ascript-ref-actions.md]:

```agentscript
reasoning:
    actions:
        search: @actions.search_products
            # LLM slot-fills both parameters
            with query = ...
            with category = ...

        lookup: @actions.get_customer
            # Bound to variable (LLM doesn't decide)
            with customer_id = @variables.selected_customer
            # Fixed value
            with include_archive = False
            # LLM slot-fills this one
            with order_id = ...
```

Use `...` for LLM slot-filling (LLM extracts value from conversation), variable binding (prefilled from state), or literal values [Source: ascript-ref-actions.md].

**Gating with `available when`** — conditionally expose actions to the LLM [Source: ascript-ref-tools.md]:

```agentscript
reasoning:
    actions:
        check_status: @actions.order_status
            description: "Check your order status"
            available when @variables.order_id != ""

        place_order: @actions.create_order
            description: "Place a new order"
            available when @variables.cart_total > 0
```

The LLM only sees actions whose `available when` condition is true [Source: ascript-ref-tools.md].

**Output capture with `set`** (Phase 1) [Source: ascript-ref-actions.md]:

```agentscript
run @actions.fetch_order
    with id = @variables.order_id
    set @variables.status = @outputs.status
    set @variables.total = @outputs.total
```

After an action returns, use `set` to store outputs in variables for later use [Source: ascript-ref-actions.md].

---

## 11. Utility Functions

Utility functions are special actions the agent can invoke. They do not call external systems; they control flow and state [Source: ascript-ref-utils.md, .a4drules].

**`@utils.transition to`** — permanent one-way handoff to another topic [Source: ascript-ref-utils.md]:

```agentscript
reasoning:
    actions:
        go_checkout: @utils.transition to @topic.checkout
            description: "Proceed to checkout"
            available when @variables.cart_has_items == True
```

Transition discards the current topic's prompt and starts fresh with the target topic [Source: ascript-ref-utils.md, ascript-flow.md].

**`@utils.escalate`** — route to a human agent [Source: ascript-ref-utils.md]:

```agentscript
reasoning:
    actions:
        get_help: @utils.escalate
            description: "Connect with a live agent"
            available when @variables.needs_human == True
```

Escalation ends the current conversation and routes to the escalation system defined in the connection block [Source: ascript-ref-utils.md].

**`@utils.setVariables`** — LLM-driven variable capture (slot-filling) [Source: ascript-ref-utils.md, .a4drules]:

```agentscript
reasoning:
    actions:
        collect_info: @utils.setVariables
            description: "Collect customer preferences"
            with preferred_color = ...
            with budget = ...
```

The LLM extracts values from the conversation and populates the specified variables [Source: ascript-ref-utils.md, .a4drules].

**`@topic.X`** — delegation to another topic with return [Source: ascript-ref-tools.md]:

```agentscript
reasoning:
    actions:
        consult_expert: @topic.expert_topic
            description: "Get expert guidance"
            available when @variables.needs_expert_help == True
```

Calling a topic as a tool runs that topic's reasoning, then returns control to the calling topic [Source: ascript-ref-tools.md].

**Post-action directives apply only to `@actions`, not `@utils`** [Source: .a4drules]:

```agentscript
# WRONG — utilities don't support set
escalate: @utils.escalate
    set @variables.escalated = True

# CORRECT — only @actions support set
process: @actions.process_order
    set @variables.result = @outputs.status
```

Utilities cannot have output, so `set` is invalid [Source: .a4drules].

---

## 12. Anti-Patterns

These patterns compile but cause incorrect behavior. Each shows WRONG then CORRECT with semantic explanation tied to the execution model.

**WRONG: Using `transition to` in `reasoning.actions`**

```agentscript
# WRONG — this doesn't compile
reasoning:
    actions:
        go_next: transition to @topic.next
            description: "Go to next"
```

**Why it fails:** `reasoning.actions` expose tools to the LLM (Phase 2). The LLM needs an action reference, not a bare command. The runtime rejects bare `transition to` syntax in this context [Source: .a4drules].

**CORRECT:**

```agentscript
reasoning:
    actions:
        go_next: @utils.transition to @topic.next
            description: "Go to next"
```

The `@utils.transition to` syntax creates a callable tool [Source: .a4drules].

---

**WRONG: Using `@utils.transition to` in directive blocks**

```agentscript
# WRONG — compile error
after_reasoning:
    @utils.transition to @topic.next
```

**Why it fails:** Directive blocks (`before_reasoning`, `after_reasoning`) execute deterministically (Phase 1), not as tools. They use bare `transition to` syntax [Source: .a4drules, ascript-flow.md].

**CORRECT:**

```agentscript
after_reasoning:
    transition to @topic.next
```

Bare `transition to` is deterministic (Phase 1) [Source: .a4drules].

---

**WRONG: Using lowercase booleans**

```agentscript
# WRONG
enabled: mutable boolean = true
verified: mutable boolean = false
is_premium: linked boolean

if @variables.is_premium == false:
    run @actions.show_basic_features
```

**Why it fails:** Agent Script requires `True` and `False` (capitalized first letter). The parser rejects lowercase `true`/`false` [Source: .a4drules].

**CORRECT:**

```agentscript
enabled: mutable boolean = True
verified: mutable boolean = False
is_premium: linked boolean

if @variables.is_premium == False:
    run @actions.show_basic_features
```

Always use capitalized boolean values [Source: .a4drules].

---

**WRONG: Mutable variable without default**

```agentscript
# WRONG — missing default
variables:
    customer_name: mutable string
```

**Why it fails:** During Phase 1, the runtime needs an initial value. Mutable variables must have defaults [Source: .a4drules].

**CORRECT:**

```agentscript
variables:
    customer_name: mutable string = ""
```

Provide a default value [Source: .a4drules].

---

**WRONG: Linked variable with default**

```agentscript
# WRONG — linked variables get value from source
variables:
    session_id: linked string = "default_session"
        source: @session.sessionID
```

**Why it fails:** Linked variables are populated by external context at runtime. Providing a default is contradictory [Source: .a4drules].

**CORRECT:**

```agentscript
variables:
    session_id: linked string
        source: @session.sessionID
```

Omit the default [Source: .a4drules].

---

**WRONG: Linked variable without source**

```agentscript
# WRONG — missing source
variables:
    user_role: linked string
```

**Why it fails:** The runtime cannot populate a linked variable without knowing where to get the value [Source: .a4drules].

**CORRECT:**

```agentscript
variables:
    user_role: linked string
        source: @context.userRole
```

Specify a source [Source: .a4drules].

---

**WRONG: Post-action directive on utility**

```agentscript
# WRONG — utilities have no outputs
reasoning:
    actions:
        go_next: @utils.transition to @topic.next
            set @variables.transitioned = True
```

**Why it fails:** Utilities like `@utils.transition to` do not return outputs. The `set` directive only works with `@actions` [Source: .a4drules].

**CORRECT:**

```agentscript
# If you need to record state, set before transitioning
before_reasoning:
    set @variables.last_topic = "current_topic"
    transition to @topic.next
```

---

**WRONG: Action loop (action remains available after execution)**

```agentscript
# WRONG — no gating, no post-action guidance, variable-bound input
reasoning:
    instructions: ->
        | Place an order using the create_order action.
    actions:
        create_order: @actions.create_order
            with items = @variables.cart_items
```

**Why it fails:** Each reasoning cycle, the LLM sees all available actions and decides which to call. This action has no `available when` gate, so it is always available. The variable-bound input (`with items = @variables.cart_items`) means the action is "ready to go" every cycle with no slot-filling decision required. The instructions don't tell the LLM what to do after the action completes, so the LLM may call it repeatedly [Source: .a4drules].

**CORRECT:**

```agentscript
reasoning:
    instructions: ->
        | Place an order using the create_order action.
          After the order is created, confirm the order number.
          Do NOT call the action again — you have the result.
    actions:
        create_order: @actions.create_order
            with items = @variables.cart_items
            available when @variables.cart_total > 0
```

Three mitigations applied: (1) explicit post-action instructions telling the LLM to stop, (2) an `available when` gate so the action is only available when relevant, (3) clear instructions about what to do with the result [Source: .a4drules].

---

**WRONG: Expecting LLM to reason without Phase 1 context**

```agentscript
# WRONG — no instructions prepare the LLM
topic check_status:
    reasoning:
        actions:
            lookup: @actions.fetch_status
```

**Why it fails:** The LLM needs instructions about when and how to use the action. Without Phase 1 prompt text guiding the LLM, it may not call the action even when relevant [Source: ascript-flow.md].

**CORRECT:**

```agentscript
topic check_status:
    reasoning:
        instructions: ->
            | If the customer asks about their order status, use the fetch_status action.
        actions:
            lookup: @actions.fetch_status
                with order_id = @variables.order_id
```

Always pair actions with guiding instructions in Phase 1 [Source: ascript-flow.md, ascript-ref-instructions.md].

