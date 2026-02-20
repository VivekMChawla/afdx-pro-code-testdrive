# Agent Test Authoring Reference

## Table of Contents

- [Test Spec Structure](#test-spec-structure)
- [Writing Effective Test Cases](#writing-effective-test-cases)
- [Metric Selection](#metric-selection)
- [Multi-Turn Testing](#multi-turn-testing)
- [Custom Evaluations](#custom-evaluations)
- [Coverage Strategy](#coverage-strategy)
- [Common Mistakes](#common-mistakes)

---

## Test Spec Structure

A test spec is a YAML file that defines test cases for an agent. The top-level structure is:

```yaml
name: "Human-readable test name"
description: "Description of what this test spec covers."
subjectType: AGENT
subjectName: Agent_API_Name
testCases:
  - utterance: "User input"
    expectedTopic: topic_api_name
    expectedActions: []
    expectedOutcome: "Natural language description"
    conversationHistory: []
    customEvaluations: []
    metrics: []
```

Required fields:
- `name`: Human-readable identifier for the test spec. Used in CLI output and logs.
- `description`: What this test spec validates. Reference the Agent Spec by name.
- `subjectType`: Always `AGENT` for agent test specs.
- `subjectName`: The API name of the agent being tested. Must match the agent's API name exactly.
- `testCases`: List of individual test cases. At least one required.

Per-test-case required fields:
- `utterance`: The user input being tested. Natural language, one-turn input. Do not include multi-turn context here; use `conversationHistory` for that.
- `expectedTopic`: The topic API name the agent should route to. String, not a list. Single topic per test case.
- `expectedActions`: List of action API names the agent should invoke. Use empty list `[]` when no action is expected.
- `expectedOutcome`: Natural language description of the expected result. This is NOT a literal string match; the framework evaluates intent and content alignment.
- `metrics`: List of metrics to evaluate. See Metric Selection section.

Optional per-test-case fields:
- `conversationHistory`: Prior messages providing context for the current utterance. Format documented in Multi-Turn Testing section.
- `customEvaluations`: Custom validation rules beyond standard metrics. Format documented in Custom Evaluations section.

---

## Writing Effective Test Cases

Each test case exercises one user intent and validates the agent's response.

Utterance design:
- Write natural conversational input. Avoid scripts or rigid phrasing.
- Keep each utterance focused on a single user intent. Multi-intent requests belong in separate test cases.
- Test realistic variations: "What's the weather?" and "Can you tell me the forecast?" both target weather but use different phrasing.
- Include edge cases: ambiguous input, off-topic queries, requests requiring guardrails.

Example utterances for Local_Info_Agent:
- Clear intent: "What's the weather like today?"
- Variation: "How's the forecast?"
- Edge case requiring context: "Great, what time does the restaurant open?" (requires prior conversation context)
- Off-topic: "What is the capital of France?"
- Guardrail test: "I'd like to speak with a real person please."

expectedOutcome phrasing:
- Describe the expected behavior in natural language. Do not write literal response text.
- Reference what should happen: "The agent should provide a forecast with a temperature range."
- Reference what should NOT happen: "The agent should NOT answer the off-topic question."
- Name the action(s) if relevant: "The agent should call get_resort_hours and return opening times."
- When guardrails apply, state the constrained behavior: "The agent should escalate to a human agent without attempting to answer."

WRONG: `expectedOutcome: "The temperature is 72 degrees."`
RIGHT: `expectedOutcome: "The agent should provide a forecast with a temperature range for Coral Cloud Resort."`

expectedActions rationale:
- List ONLY actions the agent should invoke. If no action is expected, use `[]`.
- Base this on the Agent Spec's topic-to-action mapping. If a topic has no actions, expectedActions is `[]`.
- If a topic conditionally invokes an action (e.g., only if user provides input), think carefully: does your test case provide that input?

Example from Local_Info_Agent:
- Topic `local_weather` → action `check_weather`. Test case expects `[check_weather]`.
- Topic `local_events` → action `check_events`, but gated by user interest. If test doesn't provide interest, expect `[]`.
- Topic `escalation` → no action. Expect `[]`.

---

## Metric Selection

Metrics quantify response quality. Always include `output_latency_milliseconds`. Add others based on test purpose.

Available metrics:
- `coherence`: Response is grammatically correct and easy to understand. Default choice for all tests.
- `completeness`: Response includes all essential information. Use when the test expects multiple pieces of data.
- `conciseness`: Response is brief but comprehensive. Use when verbosity is a concern.
- `output_latency_milliseconds`: Time from request to response. ALWAYS include.
- `instruction_following`: How well the response follows topic instructions and guardrails. Use for behavioral tests, constraints, edge cases.
- `factuality`: Response contains verifiably correct data. Use when the agent returns facts (weather, hours, event details).

Selection guide:
- Baseline set: `coherence`, `conciseness`, `output_latency_milliseconds`.
- Add `completeness` if the expected outcome references multiple data points.
- Add `instruction_following` if testing guardrails, constraints, or behavioral rules (e.g., "don't answer off-topic").
- Add `factuality` if the response must contain real or simulated factual data.

Example: Local_Info_Agent off-topic test case:
```yaml
metrics:
  - coherence
  - instruction_following
  - output_latency_milliseconds
```
Reason: coherence ensures the redirection is clear; instruction_following validates the guardrail (don't answer off-topic); latency is always included.

---

## Multi-Turn Testing

Test multi-turn conversations using `conversationHistory`. This provides context for the current `utterance`.

Conversation history format:
```yaml
conversationHistory:
  - role: user
    message: "First user message"
  - role: agent
    message: "Agent's response"
    topic: topic_used_for_response
  - role: user
    message: "Second user message"
  - role: agent
    message: "Agent's second response"
    topic: topic_used_for_second_response
```

Rules:
- `role`: Either `user` or `agent`. Required.
- `message`: The text of the message. Required.
- `topic`: REQUIRED for agent entries. This is the topic the agent used to formulate that response. Omit for user entries.
- Do NOT include the current test utterance in conversationHistory. The `utterance` field is the final user message.

When to use conversationHistory:
- Test topic transitions that depend on prior context.
- Test multi-turn flows where earlier responses constrain later behavior.
- Test contextual clarity: does the agent maintain facts from earlier turns?

Example: Local_Info_Agent restaurant hours test case:
```yaml
- utterance: Great, what time does the restaurant open?
  expectedTopic: resort_hours
  expectedActions:
    - get_resort_hours
  expectedOutcome: The agent should provide restaurant opening and closing times
    and mention that a reservation is required.
  conversationHistory:
    - role: user
      message: How's the weather looking?
    - role: agent
      message: The weather at Coral Cloud Resort will have temperatures between 65.3F and 81.1F.
      topic: local_weather
  metrics:
    - coherence
    - conciseness
    - output_latency_milliseconds
```

Without conversationHistory, "Great, what time does the restaurant open?" is ambiguous. The prior weather exchange provides context showing the user is satisfied and moving to a new topic.

---

## Custom Evaluations

Custom evaluations validate specific response properties using JSONPath expressions and comparison operators.

Custom evaluation format:
```yaml
customEvaluations:
  - label: "Human-readable evaluation name"
    name: string_comparison
    parameters:
      - name: operator
        value: equals
        isReference: false
      - name: actual
        value: "$.generatedData.invokedActions[*][?(@.function.name == 'Action_Name')].function.input.inputField"
        isReference: true
      - name: expected
        value: "expected_value"
        isReference: false
```

Parameters:
- `operator`: Comparison operator. Common values: `equals`, `contains`, `startsWith`, `endsWith`.
- `actual`: JSONPath expression or literal value. If JSONPath, set `isReference: true`. If literal, set `isReference: false`.
- `expected`: JSONPath expression or literal value. Same rules as `actual`.

When to use custom evaluations:
- Validate action input parameters: Did the agent invoke the action with the correct arguments?
- Verify response properties: Does the response contain a specific string or value?
- Check data transformation: Was user input correctly passed to an action?

Example: Validate that check_weather was called:
```yaml
- label: "Verify check_weather was invoked"
  name: string_comparison
  parameters:
    - name: operator
      value: equals
      isReference: false
    - name: actual
      value: "$.generatedData.invokedActions[*][?(@.function.name == 'check_weather')].function.name"
      isReference: true
    - name: expected
      value: "check_weather"
      isReference: false
```

---

## Coverage Strategy

Map test cases to the Agent Spec to ensure comprehensive coverage.

Coverage dimensions:
- Topics: Test every topic defined in the Agent Spec. Include normal flow and edge cases.
- Actions: For each action, test at least one case where the action is invoked AND one where it is not (if applicable).
- Flow control: Test conditional routing (e.g., "if user input missing, ask for clarification").
- Guardrails: Test that constraints and behavioral rules are enforced (off-topic rejection, escalation, data validation).
- Variations: Test phrasing variations of the same intent.

Checklist for Local_Info_Agent coverage:
- [ ] Test `local_weather` topic with clear intent (invoke `check_weather`).
- [ ] Test `local_events` topic without user interest (no action invoked; agent asks for clarification).
- [ ] Test `local_events` topic with user interest (invoke `check_events`).
- [ ] Test `resort_hours` topic (invoke `get_resort_hours`).
- [ ] Test `escalation` topic (no action; escalate to human).
- [ ] Test `off_topic` guardrail (reject off-topic query; redirect to supported topics).
- [ ] Test multi-turn flow: weather → restaurant hours (conversationHistory validates context preservation).

---

## Common Mistakes

Anti-patterns and corrections.

Mistake: Inventing schema fields.
```yaml
WRONG:
type: AGENT
version: 1
subject: Local_Info_Agent
expectations: []
turns: []

RIGHT:
subjectType: AGENT
subjectName: Local_Info_Agent
```

Mistake: Using snake_case instead of camelCase.
```yaml
WRONG:
expected_topic: local_weather
expected_actions: []
expected_outcome: "..."
conversation_history: []

RIGHT:
expectedTopic: local_weather
expectedActions: []
expectedOutcome: "..."
conversationHistory: []
```

Mistake: Omitting expectedActions.
```yaml
WRONG:
- utterance: "What's the weather?"
  expectedTopic: local_weather
  expectedOutcome: "..."

RIGHT:
- utterance: "What's the weather?"
  expectedTopic: local_weather
  expectedActions:
    - check_weather
  expectedOutcome: "..."
```

Mistake: Writing expectedOutcome as a literal string match.
```yaml
WRONG:
expectedOutcome: "The temperature is 72 degrees."

RIGHT:
expectedOutcome: "The agent should provide a forecast with a temperature range for the resort location."
```

Mistake: Forgetting topic on agent conversationHistory entries.
```yaml
WRONG:
conversationHistory:
  - role: agent
    message: "The weather is nice."

RIGHT:
conversationHistory:
  - role: agent
    message: "The weather is nice."
    topic: local_weather
```

Mistake: Running a test before it is created in the org.
- Always create the test spec in the org first using `sf agent test create --json`.
- Then run it with `sf agent test run --json --api-name Test_Spec_API_Name`.

Mistake: Guessing the --api-name flag value.
- The `--api-name` is NOT the human-readable `name` field. It is the API name assigned by the platform when the test is created.
- List tests with `sf agent test list --json` to confirm the correct API name before running.
