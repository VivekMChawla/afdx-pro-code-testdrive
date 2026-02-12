# Agent Debugging Rules & Guide

Rules for diagnosing agent behavior issues using session traces and preview logs.

---

## Session Trace Location

After ending a preview session, trace files are saved to:

```
.sfdx/agents/<AGENT_NAME>/sessions/<SESSION_ID>/
├── metadata.json           # Session metadata (agent ID, start time, mock mode)
├── transcript.jsonl        # Human-readable conversation log (one JSON object per line)
└── traces/
    └── <PLAN_ID>.json      # Detailed execution trace for each conversation turn
```

Each user utterance generates a separate trace file in `traces/`. The `planId` in
the transcript links to the corresponding trace file.

---

## Reading the Transcript

The transcript (`transcript.jsonl`) shows the conversation from the user's perspective:

```jsonl
{"role":"agent","text":"Hi, I'm an AI assistant..."}
{"role":"user","text":"What's the weather?"}
{"role":"agent","text":"I apologize, but I encountered an unexpected error."}
```

Use the transcript to identify WHICH turn failed, then open the corresponding trace
file for the detailed execution log.

---

## Reading Trace Files

Each trace file contains a `plan` array of execution steps in chronological order.
Here are the step types and what to look for:

### Step Types (in typical execution order)

| Step Type | What It Tells You |
|-----------|-------------------|
| `UserInputStep` | The user's utterance that triggered this turn |
| `SessionInitialStateStep` | Variable values and directive context at turn start |
| `NodeEntryStateStep` | Which agent/topic is executing and its full state snapshot |
| `VariableUpdateStep` | A variable was changed — shows old value, new value, and reason |
| `BeforeReasoningIterationStep` | `before_reasoning` block ran — lists actions executed |
| `EnabledToolsStep` | Which tools/actions are available to the LLM for this reasoning cycle |
| `LLMStep` | The actual LLM call — includes full prompt, response, and latency |
| `FunctionStep` | An action was executed — shows input, output, and latency |
| `ReasoningStep` | Grounding check result — `GROUNDED` or `UNGROUNDED` with reason |
| `TransitionStep` | Topic transition — shows from/to agents and transition type |
| `PlannerResponseStep` | Final response delivered to user — includes safety scores |

### Diagnostic Patterns

**To diagnose wrong topic routing:**
1. Find the `LLMStep` where `agent_name` is `topic_selector`
2. Check `tools_sent` — are the expected transition tools listed?
3. Check `response_messages` — which tool did the LLM select?
4. Check the `messages_sent` system prompt — does the topic selector have enough
   context to route correctly?

**To diagnose actions not firing:**
1. Find the `EnabledToolsStep` for the topic — is the expected action listed?
2. If missing, check the `available when` condition on the reasoning action —
   look at the `NodeEntryStateStep` to see if the gating variable has the expected value
3. If listed but not called, check the `LLMStep` response — did the LLM choose
   a different action or respond without using any tool?

**To diagnose grounding failures:**
1. Find the `ReasoningStep` — check `category` (`GROUNDED` or `UNGROUNDED`)
2. Read the `reason` field — it explains exactly what the grounding checker flagged
3. Compare the `FunctionStep` output with the `LLMStep` response — identify where
   the response diverges from the function output
4. Common causes:
   - Date inference: function returns a specific date, agent says "today" or "this week"
   - Unit conversion: function returns Celsius, agent responds in Fahrenheit without
     the grounding checker recognizing the conversion
   - Embellishment: agent adds details not in the function output (e.g., "gentle breeze"
     when the function only returned temperature data)
   - Paraphrasing too loosely: agent restates function output in words that don't
     closely match the original
5. Fix approach: update Agent Script instructions to tell the agent to use specific
   values from the action output (dates, numbers, names) verbatim rather than
   paraphrasing or inferring

**To diagnose loops:**
1. Look for repeated `TransitionStep` entries — is the same topic being entered
   multiple times?
2. Check `BeforeReasoningIterationStep` — are `before_reasoning` actions running
   on every cycle unconditionally?
3. Look at `after_reasoning` transitions — is there an unconditional transition
   back to a topic that triggers re-entry?
4. Check if the loop involves the grounding retry mechanism — the platform injects
   an "Error: The system determined your original response was ungrounded" message
   as a user turn and retries. After two UNGROUNDED failures, the agent gives up
   with an error message.

**To diagnose "unexpected error" responses:**
1. Find the `PlannerResponseStep` — check if the message is the system error message
   ("I apologize, but I encountered an unexpected error")
2. Look backward through the trace for `ReasoningStep` entries with
   `category: "UNGROUNDED"` — two consecutive UNGROUNDED results cause this
3. If no grounding failures, look for `FunctionStep` entries with error outputs
4. Check if a topic transition failed (missing target topic, circular reference)

---

## The Grounding Retry Mechanism

When the platform's grounding checker flags a response as UNGROUNDED:

1. The system injects an error message into the conversation as a `role: "user"` message:
   ```
   Error: The system determined your original response was ungrounded.
   Reason the response was flagged: [explanation]
   Try again. Make sure to follow all system instructions.
   Original query: [original user message]
   ```
2. The LLM is given another chance to respond
3. If the second attempt is also UNGROUNDED, the agent gives up and returns the
   system error message ("I apologize, but I encountered an unexpected error")
4. This retry is visible in the trace as repeated `LLMStep` → `ReasoningStep` pairs
   for the same topic

**Important**: The grounding checker is non-deterministic. The same response may be
flagged as UNGROUNDED on one attempt and GROUNDED on the next. When diagnosing
intermittent failures, look for responses that require the grounding checker to make
inferences (e.g., "today" = specific date, unit conversions, paraphrased values).

---

## The LLMStep in Detail

The `LLMStep` is the most information-rich step type. It contains:

- `agent_name` — which topic or selector is running
- `prompt_name` — internal prompt identifier
- `messages_sent` — the FULL prompt sent to the LLM (system message, conversation
  history, and injected instructions)
- `tools_sent` — action names available to the LLM
- `response_messages` — the LLM's response (text or tool invocation)
- `execution_latency` — milliseconds for the LLM call

**Key diagnostic use**: The `messages_sent` array shows you exactly what the LLM saw.
This is invaluable for debugging because:
- You can see how Agent Script instructions were compiled into the system prompt
- You can see the full conversation history (including grounding retry injections)
- You can verify that variable interpolation worked correctly
- You can see the platform's injected system prompts (tool usage protocol, safety
  routing, language guidelines) that your Agent Script instructions sit alongside

---

## Diagnostic Workflow

For any reported agent behavior issue:

1. **Reproduce** — use `sf agent preview start/send/end` with `--json`
2. **Locate** — end the session to get trace files; find the failing turn in transcript
3. **Read the trace** — open the trace file for the failing turn
4. **Follow the execution** — read steps in order, noting:
   - Which topic was selected?
   - What state were variables in?
   - What actions were available vs. invoked?
   - What did the LLM actually see in its prompt?
   - What did it respond with?
   - Did the grounding check pass?
5. **Identify the gap** — compare expected behavior to actual execution at each step
6. **Fix** — update Agent Script instructions, variable logic, or action definitions
7. **Validate** — `sf agent validate authoring-bundle --api-name <AGENT_NAME>`
8. **Re-test** — run a new preview session and compare traces
