# Agent Debugging Rules & Reference

Rules for diagnosing agent behavior issues using session traces and preview logs.

---

## Session Trace Location

After a preview session, trace files are at:

```
.sfdx/agents/<AGENT_NAME>/sessions/<SESSION_ID>/
├── metadata.json           # Session metadata (agent ID, start time, mock mode)
├── transcript.jsonl        # Human-readable conversation log (one JSON per line)
└── traces/
    └── <PLAN_ID>.json      # Detailed execution trace for each conversation turn
```

Each user utterance generates a separate trace file. The `planId` in the transcript links to the corresponding trace file.

---

## Reading the Transcript

The transcript (`transcript.jsonl`) shows the conversation from the user's perspective:

```jsonl
{"role":"agent","text":"Hi, I'm an AI assistant..."}
{"role":"user","text":"What's the weather?"}
{"role":"agent","text":"I apologize, but I encountered an unexpected error."}
```

Use it to identify WHICH turn failed, then open the corresponding trace for details.

---

## Trace Step Types

Each trace contains a `plan` array of execution steps in chronological order:

| Step Type | What It Tells You |
|-----------|-------------------|
| `UserInputStep` | The user's utterance that triggered this turn |
| `SessionInitialStateStep` | Variable values and directive context at turn start |
| `NodeEntryStateStep` | Which agent/topic is executing and its full state |
| `VariableUpdateStep` | A variable changed — old value, new value, reason |
| `BeforeReasoningIterationStep` | `before_reasoning` ran — lists actions executed |
| `EnabledToolsStep` | Actions available to the LLM for this reasoning cycle |
| `LLMStep` | The LLM call — full prompt, response, and latency |
| `FunctionStep` | An action executed — input, output, and latency |
| `ReasoningStep` | Grounding check — `GROUNDED` or `UNGROUNDED` with reason |
| `TransitionStep` | Topic transition — from/to and transition type |
| `PlannerResponseStep` | Final response to user — includes safety scores |

---

## Diagnostic Patterns

### Wrong Topic Routing

1. Find the `LLMStep` where `agent_name` is `topic_selector`
2. Check `tools_sent` — are the expected transition tools listed?
3. Check `response_messages` — which tool did the LLM select?
4. Check `messages_sent` system prompt — does the selector have enough context?

### Actions Not Firing

1. Find `EnabledToolsStep` for the topic — is the expected action listed?
2. If missing: check the `available when` condition; look at `NodeEntryStateStep` for variable values
3. If listed but not called: check `LLMStep` response — did the LLM choose differently?

### Grounding Failures

1. Find `ReasoningStep` — check `category` (`GROUNDED` or `UNGROUNDED`)
2. Read `reason` field — explains what was flagged
3. Compare `FunctionStep` output with `LLMStep` response — find divergence
4. Common causes:
   - Date inference: function returns specific date, agent says "today"
   - Unit conversion: function returns Celsius, agent responds Fahrenheit
   - Embellishment: agent adds details not in function output
   - Loose paraphrasing: response doesn't closely match original data
5. Fix: update instructions to use action output values verbatim

### Loops

1. Look for repeated `TransitionStep` entries — same topic entered multiple times?
2. Check `BeforeReasoningIterationStep` — unconditional actions running every cycle?
3. Check `after_reasoning` — unconditional transition causing re-entry?
4. Check for grounding retry loop (see below)

### "Unexpected Error" Responses

1. Find `PlannerResponseStep` — is it the system error message?
2. Look backward for `ReasoningStep` with `category: "UNGROUNDED"` — two consecutive failures cause this
3. If no grounding failures, look for `FunctionStep` errors
4. Check for failed topic transitions (missing target, circular reference)

---

## The Grounding Retry Mechanism

When the grounding checker flags a response as UNGROUNDED:

1. The system injects an error message as a `role: "user"` message:
   ```
   Error: The system determined your original response was ungrounded.
   Reason the response was flagged: [explanation]
   Try again. Make sure to follow all system instructions.
   Original query: [original user message]
   ```
2. The LLM gets another chance to respond
3. If the second attempt is also UNGROUNDED, the agent returns the system error message
4. Visible in traces as repeated `LLMStep` → `ReasoningStep` pairs for the same topic

**Important**: The grounding checker is non-deterministic. The same response may be flagged differently across attempts. Look for responses that require inference (date → "today", unit conversions, paraphrased values).

---

## The LLMStep in Detail

The `LLMStep` is the most information-rich step:

- `agent_name` — which topic or selector is running
- `prompt_name` — internal prompt identifier
- `messages_sent` — FULL prompt sent to the LLM (system message, history, injected instructions)
- `tools_sent` — action names available to the LLM
- `response_messages` — the LLM's response (text or tool invocation)
- `execution_latency` — milliseconds for the LLM call

**Key diagnostic use**: `messages_sent` shows exactly what the LLM saw — how instructions compiled into the system prompt, full conversation history (including grounding retries), variable interpolation results, and platform-injected prompts.

---

## Diagnostic Workflow

For any agent behavior issue:

1. **Reproduce** — `sf agent preview start/send/end` with `--json`
2. **Locate** — end session to get traces; find failing turn in transcript
3. **Read the trace** — open trace file for the failing turn
4. **Follow execution** — read steps in order:
   - Which topic was selected?
   - What were variable values?
   - What actions were available vs. invoked?
   - What did the LLM see in its prompt?
   - What did it respond with?
   - Did grounding check pass?
5. **Identify the gap** — compare expected vs. actual at each step
6. **Fix** — update Agent Script instructions, variables, or action definitions
7. **Validate** — `sf agent validate authoring-bundle --api-name <NAME>`
8. **Re-test** — new preview session, compare traces
