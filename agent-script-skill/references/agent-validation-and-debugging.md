# Agent Validation and Debugging Reference

## Table of Contents

1. Validation
2. Error Taxonomy and Prevention
3. Preview
4. Session Traces
5. Diagnostic Patterns
6. Diagnostic Workflow

---

## 1. Validation

The `sf agent validate` command checks Agent Script files for syntax errors, structural issues, and missing declarations before you attempt to preview or deploy an agent.

### Running Validation

After modifying any `.agent` file, always run this command:

```bash
sf agent validate authoring-bundle --api-name <AGENT_NAME> --json
```

Replace `<AGENT_NAME>` with the directory name under `aiAuthoringBundles/` (without the `.agent` extension). Always include `--json` so the output is machine-readable. [SOURCE: agent-script-rules (line 60)]

Example:

```bash
sf agent validate authoring-bundle --api-name Local_Info_Agent --json
```

### Interpreting Output

When validation succeeds, the JSON output contains `result.success` set to `true`:

```json
{
  "status": 0,
  "result": {
    "success": true
  },
  "warnings": []
}
```

When validation fails, the CLI treats it as an error. The output uses the CLI error format, not a structured validation result. All useful information is in the `message` field. Ignore `stack`, `cause`, `code`, and `commandName` — these are CLI internals, not diagnostic content.

The `message` field contains the compilation errors. These errors may include ANSI terminal color codes (`\u001b[31m`, `\u001b[39m`, etc.) — strip these before interpreting the message. Errors typically include line and column references (e.g., `[Ln 92, Col 13]`) that map to the `.agent` file, but do not assume a fixed error format. Read the `message` content naturally and reason about what it tells you.

Do not attempt to preview or deploy until validation passes. [SOURCE: agent-preview-rules (line 9)]

### Validation Checklist (Pre-Validate Mental Model)

Before running the validation command, mentally check these 14 items. This checklist prevents the most common errors and speeds up the feedback loop:

- Block ordering is correct: `system` → `config` → `variables` → `connections` → `knowledge` → `language` → `start_agent` → `topic` blocks [SOURCE: agent-script-rules (line 77)]
- `config` block has `developer_name` (required for service agents: also needs `default_agent_user`) [SOURCE: agent-script-rules (line 687)]
- `system` block has `messages.welcome`, `messages.error`, and `instructions` [SOURCE: agent-script-rules (line 689)]
- `start_agent` block exists with description and at least one transition action [SOURCE: agent-script-rules (line 690)]
- Each `topic` has a `description` and `reasoning` block [SOURCE: agent-script-rules (line 691)]
- All `mutable` variables have default values (required) [SOURCE: agent-script-rules (line 692)]
- All `linked` variables have `source` specified and NO default value [SOURCE: agent-script-rules (line 693)]
- Action `target` uses valid format (`flow://`, `apex://`, `prompt://`, etc.) [SOURCE: agent-script-rules (line 694)]
- Boolean values use `True`/`False` (capitalized, not `true`/`false`) [SOURCE: agent-script-rules (line 695)]
- `...` is used for LLM slot-filling in reasoning action inputs, not as variable defaults [SOURCE: agent-script-rules (line 696)]
- Transition syntax is correct: `@utils.transition to` in `reasoning.actions`, bare `transition to` in directive blocks [SOURCE: agent-script-rules (lines 697-698)]
- Indentation is consistent (4 spaces recommended) [SOURCE: agent-script-rules (line 699)]
- Names follow naming rules (letters, numbers, underscores only; no spaces; start with letter) [SOURCE: agent-script-rules (line 700)]
- No duplicate block names or action names within the same scope [SOURCE: agent-script-rules (line 687)]

---

## 2. Error Taxonomy and Prevention

Validation errors fall into several categories: block ordering, indentation, syntax, missing declarations, type mismatches, and structural violations. The following examples show the most common mistakes and their fixes.

### Common Mistakes with WRONG/RIGHT Pairs

**1. Wrong Transition Syntax**

```agentscript
# WRONG — bare transition in reasoning.actions
go_next: transition to @topic.next

# CORRECT — use @utils.transition to in reasoning.actions
go_next: @utils.transition to @topic.next

# CORRECT — use bare transition in directive blocks
after_reasoning:
    transition to @topic.next
```

In reasoning actions (where the LLM decides what to do), use `@utils.transition to`. In directive blocks (`before_reasoning`, `after_reasoning`), use bare `transition to`. These are two different syntaxes for two different contexts. [SOURCE: agent-script-rules (lines 708-720)]

**2. Missing Default for Mutable Variable**

```agentscript
# WRONG — mutable variables must have default values
count: mutable number

# CORRECT
count: mutable number = 0
```

Mutable variables are initialized at runtime. They must have a default value so the runtime knows the initial state. [SOURCE: agent-script-rules (lines 722-730)]

**3. Wrong Boolean Capitalization**

```agentscript
# WRONG — lowercase booleans
enabled: mutable boolean = true

# CORRECT — capitalized booleans
enabled: mutable boolean = True
```

Agent Script requires `True`/`False` (capitalized). This is consistent across all boolean contexts: variable defaults, conditional comparisons, and field values. [SOURCE: agent-script-rules (lines 732-740)]

**4. Using `...` as Variable Default (It's for Slot-Filling Only)**

```agentscript
# WRONG — `...` is slot-filling syntax, not a default value
my_var: mutable string = ...

# CORRECT
my_var: mutable string = ""
```

`...` tells the LLM "extract this value from the conversation" during reasoning actions. It cannot be a variable default. [SOURCE: agent-script-rules (lines 742-750)]

**5. List Type for Linked Variables**

```agentscript
# WRONG — linked variables cannot be lists
items: linked list[string]

# CORRECT — mutable can be list
items: mutable list[string] = []
```

Linked variables come from external context (session ID, user record, etc.) which are scalar values. Lists must be mutable. [SOURCE: agent-script-rules (lines 752-760)]

**6. Default Value on Linked Variable**

```agentscript
# WRONG — linked variables get value from source, no default
session_id: linked string = ""
    source: @session.sessionID

# CORRECT — no default, only source
session_id: linked string
    source: @session.sessionID
```

Linked variables are populated from their `source` at runtime. Do not assign a default value. [SOURCE: agent-script-rules (lines 762-772)]

**7. Post-Action Directives on Utility Actions**

```agentscript
# WRONG — utilities don't support post-action directives
go_next: @utils.transition to @topic.next
    set @variables.navigated = True

# CORRECT — only @actions support post-action directives
process: @actions.process_order
    set @variables.result = @outputs.result
```

Post-action directives (`set`, `run`, `if`, `transition`) only work after `@actions.*` invocations. Utility actions (`@utils.*`) and topic delegates (`@topic.*`) do not produce outputs, so post-action directives are not applicable. [SOURCE: agent-script-rules (lines 774-784)]

---

## 3. Preview

Preview lets you test an agent's behavior by sending utterances and observing responses. The preview workflow starts a session, sends one or more utterances, and captures session traces for analysis.

### Programmatic Workflow

ALWAYS use `--json` when calling from a script or AI assistant (not interactive REPL). [SOURCE: agent-preview-rules (line 67)]

#### Step 1: Start a Session

```bash
sf agent preview start --authoring-bundle <BUNDLE_NAME> --json
```

This command returns a session ID. Capture it immediately — you need it for every subsequent command. [SOURCE: agent-preview-rules (lines 69-75)]

Example:

```bash
sf agent preview start --authoring-bundle Local_Info_Agent --json
```

#### Step 2: Send Utterances

```bash
sf agent preview send --authoring-bundle <BUNDLE_NAME> --session-id <SESSION_ID> -u "<MESSAGE>" --json
```

Include the same `--authoring-bundle` name and the session ID from Step 1. You can send multiple utterances in the same session — do not end and restart between turns. [SOURCE: agent-preview-rules (lines 77-86)]

Example:

```bash
sf agent preview send --authoring-bundle Local_Info_Agent --session-id abc123def456 -u "What's the weather?" --json
```

#### Step 3: End a Session (Optional)

```bash
sf agent preview end --authoring-bundle <BUNDLE_NAME> --session-id <SESSION_ID> --json
```

This command returns the path to session trace files. Call it when the conversation is complete. Do not end prematurely — if the user may ask follow-up questions, keep the session open. [SOURCE: agent-preview-rules (lines 87-95)]

### Execution Modes

Agent Script agents in authoring bundles support two execution modes: simulated (default) and live.

**Simulated Mode (Default).** The LLM generates fake action outputs. Use simulated mode when:
- Backing Apex, Flows, or Prompt Templates don't exist yet (you're experimenting with instructions and flow before building actions)
- No default agent user is configured (live mode requires a real, active user; simulated mode skips this requirement)

Simulated mode speeds up inner-loop development but cannot validate real action outputs, variable-driven branching, or grounding behavior. [SOURCE: agent-preview-rules (lines 44-54)]

**Live Mode.** Real backing code executes and returns real outputs. Pass `--use-live-actions`:

```bash
sf agent preview start --authoring-bundle <BUNDLE_NAME> --use-live-actions --json
```

Use live mode when:
- Backing code is deployed and a default agent user is configured
- Your test depends on real action output values (grounding validation, variable-driven branching, output formatting)

Live mode is specifically required for testing grounding — the grounding checker compares the agent's response against real action output data. Simulated mode cannot reproduce grounding failures. [SOURCE: agent-preview-rules (lines 56-61)]

CRITICAL: `--use-live-actions` is ONLY valid with `--authoring-bundle`. Published agents (`--api-name`) always execute real actions — do NOT pass `--use-live-actions` with `--api-name`. [SOURCE: agent-preview-rules (line 46)]

### Agent Identification

Use exactly one of these mutually exclusive flags:

- `--authoring-bundle <name>` — for a local Agent Script agent. The name is the directory name under `aiAuthoringBundles/` (without the `.agent` extension).
- `--api-name <name>` — for a published agent in the org. The name is the directory name under `Bots/`.

These flags identify which agent to preview. [SOURCE: agent-preview-rules (lines 29-32)]

To use a published agent, switch from `--authoring-bundle` to `--api-name`. No additional setup is required. The agent runs real actions; `--use-live-actions` is not passed. [SOURCE: agent-preview-rules (line 46)]

### Target Org

The CLI automatically uses the project's default target org. Always omit `--target-org` and rely on the project default. Only pass `--target-org` if the user explicitly tells you which org to use. Never guess or invent an org username. [SOURCE: agent-preview-rules (lines 15-23)]

### Common Preview Mistakes with WRONG/RIGHT Pairs

**1. Using the Interactive REPL from Automation**

```bash
# WRONG — requires terminal interaction (ESC to exit)
sf agent preview --authoring-bundle My_Bundle

# CORRECT — programmatic API
sf agent preview start --authoring-bundle My_Bundle --json
```

The bare `sf agent preview` command is an interactive REPL for humans. Automation cannot provide terminal input (ESC), so it hangs. Use `start`/`send`/`end` with `--json`. [SOURCE: agent-preview-rules (lines 117-125)]

**2. Combining `--authoring-bundle` and `--api-name`**

```bash
# WRONG — mutually exclusive flags
sf agent preview start --authoring-bundle My_Bundle --api-name My_Agent --json

# CORRECT — choose one
sf agent preview start --authoring-bundle My_Bundle --json
```

These flags are mutually exclusive. Use the one matching your agent type. [SOURCE: agent-preview-rules (lines 127-135)]

**3. Sending Before Starting**

```bash
# WRONG — no session exists
sf agent preview send --authoring-bundle My_Bundle -u "Hello" --json

# CORRECT — start first, capture session ID
sf agent preview start --authoring-bundle My_Bundle --json
sf agent preview send --authoring-bundle My_Bundle --session-id <ID> -u "Hello" --json
```

Each session has a unique ID. You must start before sending. [SOURCE: agent-preview-rules (lines 137-146)]

**4. Forgetting the Agent Identifier on `send` and `end`**

```bash
# WRONG — missing --authoring-bundle
sf agent preview send --session-id <ID> -u "Hello" --json

# CORRECT
sf agent preview send --authoring-bundle My_Bundle --session-id <ID> -u "Hello" --json
```

Every command after `start` must include the same `--authoring-bundle` or `--api-name` flag. [SOURCE: agent-preview-rules (lines 158-166)]

**5. Omitting `--session-id` on `send` or `end`**

```bash
# WRONG — concurrent sessions collide
sf agent preview send --authoring-bundle My_Bundle -u "Hello" --json

# CORRECT — always include session ID
sf agent preview send --authoring-bundle My_Bundle --session-id <ID> -u "Hello" --json
```

If multiple agents have concurrent sessions against the same agent, omitting the session ID causes them to interfere. Always pass the session ID from `start`. [SOURCE: agent-preview-rules (lines 168-176)]

---

## 4. Session Traces

After each utterance in a preview session, the runtime writes trace files. Traces show the complete execution path: what topic was selected, what variables were set, what the LLM saw in its prompt, what it decided to do, and whether the response passed grounding.

### Trace File Location

Traces are stored locally at:

```
.sfdx/agents/<AGENT_NAME>/sessions/<SESSION_ID>/
├── metadata.json           # Session metadata
├── transcript.jsonl        # Conversation log (one JSON object per line)
└── traces/
    └── <PLAN_ID>.json      # Detailed execution trace for each turn
```

Replace `<AGENT_NAME>` with your authoring bundle name (e.g., `Local_Info_Agent`). The `<SESSION_ID>` is the value returned by `sf agent preview start`. A separate trace file (identified by `<PLAN_ID>`) is written for each conversation turn. [SOURCE: agent-debugging-rules (lines 7-20)]

Traces are available immediately after each `send` — you do NOT need to end the session to read them. [SOURCE: agent-preview-rules (lines 99-101)]

### File Structure

**metadata.json** contains session-level information: `sessionId`, `agentId`, `startTime`, and `mockMode` (either `"Mock"` for simulated or `"Live Test"` for live).

**transcript.jsonl** is a conversation log with one JSON object per line. Each entry includes `timestamp`, `agentId`, `sessionId`, `role` (`"user"` or `"agent"`), and `text`. Agent responses also include a `raw` array with additional metadata — most importantly, the `planId` field that links to the corresponding trace file.

```json
{"timestamp":"...","agentId":"Local_Info_Agent","sessionId":"abc123","role":"user","text":"What's the weather?"}
{"timestamp":"...","agentId":"Local_Info_Agent","sessionId":"abc123","role":"agent","text":"The weather on 2026-02-19...","raw":[{"planId":"def456","isContentSafe":true,...}]}
```

To connect a failed turn to its trace, find the agent response in the transcript and read the `planId` from its `raw` array. That `planId` is the filename under `traces/`. [SOURCE: agent-debugging-rules (lines 24-35)]

**traces/<PLAN_ID>.json** is the detailed execution log for a single turn. It contains top-level fields (`type`, `planId`, `sessionId`, `intent`, `topic`) and a `plan` array with execution steps in chronological order.

### Step Types (Reference Table)

Each trace step type reveals specific execution information:

- **`UserInputStep`** — The user's utterance that triggered this turn.
- **`SessionInitialStateStep`** — Variable values and directive context at turn start.
- **`NodeEntryStateStep`** — Which agent/topic is executing and its full state snapshot.
- **`VariableUpdateStep`** — A variable was changed — shows old/new value and reason.
- **`BeforeReasoningIterationStep`** — `before_reasoning` block ran — lists actions executed.
- **`EnabledToolsStep`** — Which tools/actions are available to the LLM for this reasoning cycle.
- **`LLMStep`** — The LLM call — full prompt, response, available tools, latency.
- **`FunctionStep`** — An action executed — shows input, output, and latency.
- **`ReasoningStep`** — Grounding check result — `GROUNDED` or `UNGROUNDED` with reason.
- **`TransitionStep`** — Topic transition — shows from/to topics and transition type.
- **`PlannerResponseStep`** — Final response delivered to user — includes safety scores.

[SOURCE: agent-debugging-rules (lines 44-58)]

### How to Read a Trace

Read steps in chronological order:

1. Locate `UserInputStep` — the trigger for this turn
2. Check `NodeEntryStateStep` — which topic is running and what is the current variable state?
3. Look for `EnabledToolsStep` — what actions are available to the LLM?
4. Find `LLMStep` — examine `messages_sent` (the full prompt), `tools_sent` (available actions), and `response_messages` (what the LLM chose to do)
5. If an action was called, find the corresponding `FunctionStep` — compare inputs sent and outputs received
6. Check `ReasoningStep` — did the response pass grounding?
7. Look for `TransitionStep` — did the agent move to another topic?
8. Check `PlannerResponseStep` — what did the user receive?

### The LLMStep in Detail

The `LLMStep` is the most diagnostic step type. It contains:

- `agent_name` — which topic or selector is running
- `messages_sent` — the FULL prompt sent to the LLM (system message, conversation history, and injected instructions)
- `tools_sent` — action names available to the LLM
- `response_messages` — the LLM's response (text or tool invocation)
- `execution_latency` — milliseconds for the LLM call

The `messages_sent` array shows you exactly what the LLM saw. This is invaluable for debugging because:
- You can see how Agent Script instructions were compiled into the system prompt
- You can see the full conversation history (including grounding retry injections)
- You can verify that variable interpolation (`{!@variables.x}`) worked correctly
- You can see platform-injected system prompts (tool usage protocol, safety routing, language guidelines) that your Agent Script instructions sit alongside

[SOURCE: agent-debugging-rules (lines 139-158)]

### When to Use Traces vs. Transcript

Use the **transcript** to quickly identify WHICH turn failed (unexpected response, wrong topic, agent crash).

Use the **trace files** when:
- The agent routes to the wrong topic
- An action isn't firing
- The response is unexpectedly worded
- Grounding is failing
- You need to understand variable values at a specific point in execution
- You need to see what the LLM actually saw in its prompt

The transcript is sufficient for conversation-level understanding. Traces provide execution-level detail needed for diagnosis.

---

## 5. Diagnostic Patterns

These patterns map symptoms to trace analysis techniques. Each pattern follows the same structure: symptom → which trace steps to examine → root cause → fix (with code example).

### Pattern: Wrong Topic Routing

**Symptom:** The agent enters the wrong topic. For example, asking about weather sends the agent to the events topic instead.

**Trace Analysis:**

1. Find the `LLMStep` where `agent_name` is `topic_selector` (the entry point that routes to topics)
2. Examine `tools_sent` — are the transition actions for all expected topics listed? (e.g., `go_to_local_weather`, `go_to_local_events`, `go_to_resort_hours`)
3. Examine `response_messages` — which action tool did the LLM select?
4. Examine `messages_sent` — does the system prompt (what topic selector instructions were compiled to) give the LLM enough context to route correctly?

**Root Cause:** Topic selector instructions are ambiguous, missing context, or don't map user requests to the correct topics.

**Fix:** A minimal topic selector with well-named actions often routes correctly. When it doesn't, add routing instructions and action descriptions to give the LLM more context:

```agentscript
# BEFORE — relies on action names alone for routing
start_agent topic_selector:
    description: "Route to appropriate topics"
    reasoning:
        actions:
            go_to_weather: @utils.transition to @topic.local_weather
            go_to_events: @utils.transition to @topic.local_events

# AFTER — explicit instructions and descriptions improve routing accuracy
start_agent topic_selector:
    description: "Route to appropriate topics"
    reasoning:
        instructions: ->
            | If the user asks about weather conditions, temperature, or forecasts, go to the weather topic.
              If the user asks about local events, activities, or entertainment, go to the events topic.
              If the user asks about facility hours, reservations, or amenities, go to the hours topic.

        actions:
            go_to_weather: @utils.transition to @topic.local_weather
                description: "Route to weather topic for weather questions"
            go_to_events: @utils.transition to @topic.local_events
                description: "Route to events topic for local event questions"
            go_to_hours: @utils.transition to @topic.resort_hours
                description: "Route to hours topic for facility hours questions"
```

[SOURCE: agent-debugging-rules (lines 62-67)]

### Pattern: Actions Not Firing

**Symptom:** The agent doesn't call an action you expect it to. For example, the agent should fetch data but responds without calling the action.

**Trace Analysis:**

1. Find the `EnabledToolsStep` for the topic — is the expected action listed?
2. If missing:
   - Check the action definition's `available when` condition (e.g., `available when @variables.guest_interests != ""`)
   - Look at the `NodeEntryStateStep` to see if the gating variable has the expected value
   - If the variable is empty or has the wrong value, the action is hidden
3. If listed but not called:
   - Find the `LLMStep` response — did the LLM choose a different action or respond without using any tool?
   - Compare `messages_sent` — does the instructions tell the LLM when to use this action?

**Root Cause:** Either the action is gated behind a condition that hasn't been satisfied, or the instructions don't tell the LLM to call it.

**Fix Example:**

```agentscript
# WRONG — action is hidden until guest_interests is set, but there's no way to set it
reasoning:
    actions:
        check_events: @actions.check_events
            available when @variables.guest_interests != ""
            with Event_Type = @variables.guest_interests

# CORRECT — first step collects interests, second action uses them
reasoning:
    instructions: ->
        | Ask about the guest's interests if you don't know them yet.
          Once you know what they're interested in, look up matching events.

    actions:
        collect_interests: @utils.setVariables
            description: "Collect the guest's interests"
            with guest_interests = ...

        check_events: @actions.check_events
            description: "Look up local events matching the guest's interests"
            available when @variables.guest_interests != ""
            with Event_Type = @variables.guest_interests
```

[SOURCE: agent-debugging-rules (lines 69-74)]

### Pattern: Behavioral Loops

**Symptom:** The agent keeps asking the same question or repeating the same response across multiple turns, even though the user already provided the requested information.

**Diagnosis:** Observe the conversation output rather than relying on trace data (trace structure varies). A common cause is instructions that collect information and act on it within the same topic — when the topic is re-entered, the collection logic runs again even though the data was already gathered.

**Fix Example:** In this real scenario, the `local_events` topic asks about interests and then looks up events. But each time the topic is re-entered, the agent asks about interests again instead of checking whether it already knows them:

```agentscript
# BEFORE — agent asks about interests every time the topic is entered
reasoning:
    instructions: ->
        | If you do not already know the guest's interests, ask them about their
          interests so you can provide relevant event information.
          Use the {!@actions.check_events} action to get a list of events once
          you know what the guest is interested in.

    actions:
        collect_interests: @utils.setVariables
            description: "Collect the guest's interests when they share them"
            with guest_interests = ...

        check_events: @actions.check_events
            available when @variables.guest_interests != ""
            with Event_Type = @variables.guest_interests

# AFTER — condition on the variable, not on re-asking
reasoning:
    instructions: ->
        | If @variables.guest_interests is empty, ask the guest about their interests.
          If @variables.guest_interests is already set, use {!@actions.check_events}
          to find matching events and present the results.
          Do NOT ask about interests again if you already have them.

    actions:
        collect_interests: @utils.setVariables
            description: "Collect the guest's interests when they share them"
            with guest_interests = ...

        check_events: @actions.check_events
            available when @variables.guest_interests != ""
            with Event_Type = @variables.guest_interests
```

The key difference: the AFTER version explicitly references the variable value to decide whether to ask or act, and includes a stop condition ("Do NOT ask about interests again").

Note: repeated `LLMStep` → `ReasoningStep` pairs in a trace may indicate grounding retry rather than a behavioral loop — see Diagnostic Workflow: Grounding subsection. [SOURCE: agent-debugging-rules (lines 93-103)]

### Pattern: "Unexpected Error" Responses

**Symptom:** The agent returns "I apologize, but I encountered an unexpected error" instead of a normal response.

**Trace Analysis:**

1. Find the `PlannerResponseStep` — is the message the system error message?
2. Look backward through the trace for consecutive `ReasoningStep` entries with `category: "UNGROUNDED"` — two consecutive UNGROUNDED results cause this error
3. If no grounding failures, look for `FunctionStep` entries with error outputs (action execution failed)
4. Check if a topic transition failed (the target topic doesn't exist or has a circular reference)

**Root Cause:** Grounding failed twice in a row, OR an action returned an error, OR a topic transition is misconfigured.

**Fix:** See Diagnostic Workflow: Grounding subsection for grounding failures. For action errors, verify the backing Apex/Flow/Prompt Template is deployed and handles edge cases correctly. For transition errors, verify all referenced topics exist and are spelled correctly.

[SOURCE: agent-debugging-rules (lines 105-111)]

---

## 6. Diagnostic Workflow

Use this systematic 8-step approach when diagnosing any agent behavior issue.

1. **Reproduce** — Use `sf agent preview start/send/end` with `--json` to recreate the issue with the exact user input that triggered it

2. **Locate** — End the session to write trace files. Open `transcript.jsonl` and find the failing turn. Note the `planId` (or look up the turn in the transcript).

3. **Read the Trace** — Open `traces/<PLAN_ID>.json` for the failing turn. Read the plan array in order.

4. **Follow Execution** — As you read each step, note:
   - Which topic was selected? (Look at `NodeEntryStateStep`)
   - What state were variables in? (Look at `SessionInitialStateStep` and `VariableUpdateStep`)
   - What actions were available vs. invoked? (Look at `EnabledToolsStep` and `LLMStep` response)
   - What did the LLM see in its prompt? (Look at `LLMStep.messages_sent`)
   - What did it respond with? (Look at `LLMStep.response_messages`)
   - Did the response pass grounding? (Look at `ReasoningStep.category`)

5. **Identify the Gap** — Compare expected behavior to actual execution at each step. Use the diagnostic patterns (Section 5) to map symptoms to root causes.

6. **Fix** — Update Agent Script instructions, variable logic, or action definitions based on what you found.

7. **Validate** — Run `sf agent validate authoring-bundle --api-name <AGENT_NAME> --json` to ensure the fix doesn't introduce syntax errors.

8. **Re-Test** — Run a new preview session with the same input and compare traces. Verify the fix resolved the issue.

[SOURCE: agent-debugging-rules (lines 161-178)]

### Grounding Subsection

Grounding is a platform service that validates an agent's response against real action output data. When grounding fails, the platform gives the LLM a second chance. Understanding how grounding works, why it fails, and how to fix it is critical for behavioral diagnosis.

#### The Grounding Retry Mechanism

When the platform's grounding checker flags a response as UNGROUNDED:

1. The system injects an error message as a `role: "user"` message:
   ```
   Error: The system determined your original response was ungrounded.
   Reason the response was flagged: [explanation]
   Try again. Make sure to follow all system instructions.
   Original query: [original user message]
   ```
2. The LLM is given another chance to respond
3. If the second attempt is also UNGROUNDED, the agent returns the system error message ("I apologize, but I encountered an unexpected error") and gives up
4. This retry is visible in traces as repeated `LLMStep` → `ReasoningStep` pairs for the same topic

[SOURCE: agent-debugging-rules (lines 115-130)]

#### Non-Deterministic Behavior

The grounding checker is non-deterministic. The same response may be flagged as UNGROUNDED on one attempt and GROUNDED on the next. When diagnosing intermittent grounding failures, look for responses that require the grounding checker to make inferences (date inference, unit conversions, paraphrased values). [SOURCE: agent-debugging-rules (lines 132-135)]

#### Common Grounding Failure Causes

- **Date Inference:** Function returns a specific date (e.g., "2025-02-19"), agent says "today" or "this week". The grounding checker cannot always infer that a relative date equals a specific date.
- **Unit Conversion:** Function returns Celsius, agent responds in Fahrenheit without the grounding checker recognizing the conversion.
- **Embellishment:** Agent adds details not in the function output (e.g., "gentle breeze" when the function only returned temperature data).
- **Loose Paraphrasing:** Agent restates function output in words that don't closely match the original.

[SOURCE: agent-debugging-rules (lines 81-88)]

#### Diagnosing Grounding Failures

1. Find the `ReasoningStep` with `category: "UNGROUNDED"`
2. Read the `reason` field — it explains exactly what the grounding checker flagged
3. Find the `FunctionStep` output for the action that was called
4. Find the `LLMStep` response — compare it to the function output
5. Identify where the response diverges from the function output (dates, numbers, names, facts)

**Example:** Function returns:
```json
{"date": "2025-02-19", "temperature": "48.5F"}
```

Agent responds: "Today will be around 50 degrees."

Grounding fails because: "today" requires inference (the checker doesn't know if 2025-02-19 is today), and "around 50" doesn't match the specific value "48.5F".

#### Fix Approach

Update Agent Script instructions to tell the agent to use specific values from action output verbatim rather than paraphrasing or inferring. [SOURCE: agent-debugging-rules (lines 89-91)]

```agentscript
# WRONG — allows paraphrasing and inference
reasoning:
    instructions: ->
        | Tell the user about the weather.

# CORRECT — explicit instructions to use specific values
reasoning:
    instructions: ->
        | After getting weather results, respond with the exact date and temperature values from the results.
          For example: "The weather on {!@outputs.date} will be {!@outputs.temperature}."
          Do NOT paraphrase dates (say "2025-02-19", not "today").
          Do NOT round temperatures (say the exact value from the results).
```

#### Why Simulated Mode Cannot Reproduce Grounding Failures

Simulated mode generates fake action outputs via LLM, so the grounding checker has no real data to validate against. The grounding checker only runs against live action outputs. If you need to test grounding, use live mode (`--use-live-actions`) with real backing Apex/Flows/Prompt Templates deployed. [SOURCE: agent-preview-rules (line 59)]

---

**Citation Format:** All claims in this file are attributed to source files via `[SOURCE: filename (line N)]` citations. These citations make the file auditable and will be regex-stripped after review.
