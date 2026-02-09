# Agent Testing Rules & Guide

This document provides rules and guidance for creating and managing agent test specifications (test spec YAML files) used with the Salesforce CLI `agent test` commands.

---

## Test Spec File Format

Test specs are YAML files that define test cases for a specific agent. They are the local, human-readable equivalent of the `AiEvaluationDefinition` metadata component.

### Required Top-Level Fields

```yaml
name: "Human-readable test name"
description: "Description of what this test covers."
subjectType: AGENT
subjectName: Agent_API_Name
testCases:
  - ...
```

- `name`: Human-readable label for the test.
- `description`: Brief summary of the test's purpose.
- `subjectType`: Always `AGENT`.
- `subjectName`: The API name of the agent being tested. Must match the `developer_name` in the agent's `.agent` file.

### Test Case Schema

Each entry in `testCases` uses **camelCase** field names:

```yaml
testCases:
  - utterance: "Natural language input to the agent"
    expectedTopic: topic_api_name
    expectedActions:
      - action_api_name
    expectedOutcome: "Natural language description of the expected result."
    customEvaluations: []
    conversationHistory: []
    metrics:
      - coherence
      - conciseness
      - output_latency_milliseconds
```

#### Required Fields

- `utterance`: The user input to test. Write utterances that reflect realistic user language.
- `expectedTopic`: API name of the topic the agent should route to.
- `expectedActions`: Array of action API names the agent should invoke. Use `[]` if no action is expected (e.g., the agent should ask a clarifying question instead).
- `expectedOutcome`: Natural language description of the expected result. This is evaluated by the testing framework, not matched literally.

#### Optional Fields

- `metrics`: Array of metric names to evaluate. See [Available Metrics](#available-metrics).
- `customEvaluations`: Array of custom evaluation criteria. See [Custom Evaluations](#custom-evaluations).
- `conversationHistory`: Array of prior conversation turns for multi-turn testing. See [Conversation History](#conversation-history).
- `contextVariables`: Array of context variable name/value pairs for Service agents. See [Context Variables](#context-variables).

---

## Available Metrics

Include metrics in the `metrics` array for each test case. Omitting the `metrics` section disables metric evaluation for that test case.

| Metric | What It Measures |
|---|---|
| `coherence` | Response is easy to understand with no grammatical errors |
| `completeness` | Response includes all essential information |
| `conciseness` | Response is brief but comprehensive |
| `output_latency_milliseconds` | Time from request to response |
| `instruction_following` | How well the response follows topic instructions |
| `factuality` | How factual the response is |

### Metric Selection Guidance

- Always include `output_latency_milliseconds` — latency data is useful for all test cases.
- Include `instruction_following` for test cases that verify guardrails, constraints, or specific behavioral rules (e.g., off-topic rejection, gating logic).
- Include `factuality` when the response must contain verifiably correct data (e.g., from an action output).
- `coherence` and `conciseness` are good defaults for most test cases.
- `completeness` is useful when the response must cover multiple pieces of information.

---

## Conversation History

Use `conversationHistory` to test utterances within the context of a prior conversation. This enables multi-turn test scenarios.

```yaml
testCases:
  - utterance: "Follow-up question"
    expectedTopic: target_topic
    expectedActions:
      - expected_action
    expectedOutcome: "Expected result given the conversation context."
    conversationHistory:
      - role: user
        message: "First user message"
      - role: agent
        message: "Agent's response to first message"
        topic: topic_used_for_response
      - role: user
        message: "Second user message"
      - role: agent
        message: "Agent's response to second message"
        topic: topic_used_for_response
```

- `role`: Either `user` or `agent`.
- `message`: The text of the conversation turn.
- `topic`: Required for `agent` role entries. The topic the agent used to generate the response.

The `utterance` field is the final user message that the test actually evaluates. The `conversationHistory` provides context leading up to it.

---

## Custom Evaluations

Custom evaluations test agent responses for specific strings or numbers using JSONPath expressions against the generated data from invoked actions.

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

To construct the JSONPath expression, first run the test without custom evaluations using `sf agent test run --verbose` to see the generated JSON data structure for invoked actions.

---

## Context Variables

For Service agents connected to messaging channels, test context variables by adding a `contextVariables` section:

```yaml
contextVariables:
  - name: ContextVariableApiName
    value: "test value"
```

Context variable API names correspond to field names on the `MessagingSession` standard object.

---

## CLI Commands

### Generate a Test Spec Interactively

```bash
sf agent generate test-spec
```

Prompts for agent selection, test case details, and generates the YAML file. By default, the spec is saved to `specs/{Agent_API_Name}-testSpec.yaml`.

### Generate a Test Spec from Existing Metadata

```bash
sf agent generate test-spec \
    --from-definition force-app/main/default/aiEvaluationDefinitions/MyTest.aiEvaluationDefinition-meta.xml \
    --output-file specs/My_Agent-testSpec.yaml
```

### Preview a Test Without Deploying

```bash
sf agent test create --preview \
    --spec specs/My_Agent-testSpec.yaml \
    --api-name My_Agent_Test
```

Generates a local `AiEvaluationDefinition` preview file without updating the org.

### Create a Test in the Org

```bash
sf agent test create \
    --spec specs/My_Agent-testSpec.yaml \
    --api-name My_Agent_Test
```

Creates the test in the org and retrieves the `AiEvaluationDefinition` metadata to your local project.

### Run a Test

```bash
sf agent test run --api-name My_Agent_Test
```

Add `--verbose` to include generated data (invoked actions, inputs, outputs) in the results. Use this data to build JSONPath expressions for custom evaluations.

### View Test Results in the Org

```bash
sf org open --path /lightning/setup/TestingCenter/home
```

---

## File Naming & Location

- Test specs live in the `specs/` directory at the project root.
- Default naming convention: `{Agent_API_Name}-testSpec.yaml`
- The corresponding `AiEvaluationDefinition` metadata is stored in `force-app/main/default/aiEvaluationDefinitions/` after `sf agent test create` runs.

---

## Common Mistakes

- **Inventing schema fields**: The test spec schema is fixed. Do not add fields like `type`, `version`, `subject`, `expectations`, or `turns`. Use only the fields documented above.
- **Using snake_case for field names**: Test spec fields are **camelCase** (`expectedTopic`, `expectedActions`, `expectedOutcome`, `conversationHistory`, `customEvaluations`, `testCases`).
- **Omitting `expectedActions`**: Always include this field. Use `[]` when no action is expected.
- **Using `expectedOutcome` as a literal match**: The expected outcome is a natural language description evaluated by the testing framework. Write it as a description of what should happen, not as an exact string to match.
- **Forgetting `topic` on agent conversation history entries**: Every `role: agent` entry in `conversationHistory` must include a `topic` field.
