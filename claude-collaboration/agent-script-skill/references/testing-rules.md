# Agent Testing Rules & Reference

Rules for creating and running agent test specifications using `sf agent test` commands.

---

## Test Specs vs. AiEvaluationDefinitions

A **test spec** is a local YAML file (in `specs/`) that defines test cases. An **AiEvaluationDefinition** is the Salesforce metadata in the org that executes tests.

| Artifact | Location | Purpose |
|----------|----------|---------|
| Test spec (YAML) | `specs/` (local project) | Author and version-control test definitions |
| AiEvaluationDefinition | Org + `aiEvaluationDefinitions/` | Execute tests in the org |

A test spec existing locally does NOT mean the test exists in the org. You must explicitly create it with `sf agent test create` before running with `sf agent test run`.

---

## Test Spec File Format

### Required Top-Level Fields

```yaml
name: "Human-readable test name"
description: "Description of what this test covers."
subjectType: AGENT
subjectName: Agent_API_Name
testCases:
  - ...
```

- `name`: Human-readable label
- `description`: Brief summary of the test's purpose
- `subjectType`: Always `AGENT`
- `subjectName`: Must match the `developer_name` in the agent's `.agent` file

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

- `utterance`: The user input to test. Write realistic user language.
- `expectedTopic`: API name of the topic the agent should route to.
- `expectedActions`: Array of action API names. Use `[]` if no action expected.
- `expectedOutcome`: Natural language description (evaluated by framework, not literal match).

#### Optional Fields

- `metrics`: Array of metric names (see below)
- `customEvaluations`: Custom evaluation criteria (see below)
- `conversationHistory`: Prior turns for multi-turn testing (see below)
- `contextVariables`: Context variable name/value pairs for Service agents

---

## Available Metrics

| Metric | What It Measures |
|--------|-----------------|
| `coherence` | Response is easy to understand with no grammatical errors |
| `completeness` | Response includes all essential information |
| `conciseness` | Response is brief but comprehensive |
| `output_latency_milliseconds` | Time from request to response |
| `instruction_following` | How well the response follows topic instructions |
| `factuality` | How factual the response is |

### Metric Selection Guidance

- Always include `output_latency_milliseconds` — useful for all test cases
- Include `instruction_following` for guardrail/constraint verification
- Include `factuality` when response must contain verifiable data
- `coherence` and `conciseness` are good defaults
- `completeness` for responses covering multiple pieces of information

---

## Conversation History

Use `conversationHistory` to test utterances within a prior conversation context:

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
        message: "Agent's response"
        topic: topic_used_for_response
      - role: user
        message: "Second user message"
      - role: agent
        message: "Agent's second response"
        topic: topic_used_for_response
```

- `role`: Either `user` or `agent`
- `message`: The text of the conversation turn
- `topic`: Required for `agent` role entries

The `utterance` field is the final message that the test evaluates. `conversationHistory` provides preceding context.

---

## Custom Evaluations

Test agent responses for specific values using JSONPath against generated action data:

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

To build the JSONPath expression, first run the test with `sf agent test run --verbose` to see the generated JSON data structure.

---

## Context Variables

For Service agents connected to messaging channels:

```yaml
contextVariables:
  - name: ContextVariableApiName
    value: "test value"
```

Context variable API names correspond to field names on the `MessagingSession` standard object.

---

## Workflow

### 1. Author the Test Spec

Create or edit a YAML file in `specs/`. Follow the schema above.

### 2. Create the Test in the Org

```bash
sf agent test create --spec specs/My_Agent-testSpec.yaml --api-name My_Agent_Test
```

This deploys the spec as an AiEvaluationDefinition and retrieves the metadata locally.

### 3. Run the Test

```bash
sf agent test run --api-name My_Agent_Test
```

Add `--verbose` to include generated data for building JSONPath expressions.

### Important: Create Before Run

- `sf agent test run` requires an AiEvaluationDefinition IN THE ORG
- NEVER assume a test exists. Verify by checking `aiEvaluationDefinitions/` metadata
- If you update a test spec, re-run `sf agent test create` to update the org

---

## CLI Commands

### Generate Test Spec Interactively

```bash
sf agent generate test-spec
```

### Generate from Existing Metadata

```bash
sf agent generate test-spec \
    --from-definition force-app/main/default/aiEvaluationDefinitions/MyTest.aiEvaluationDefinition-meta.xml \
    --output-file specs/My_Agent-testSpec.yaml
```

### Preview Without Deploying

```bash
sf agent test create --preview \
    --spec specs/My_Agent-testSpec.yaml \
    --api-name My_Agent_Test
```

### Create in Org

```bash
sf agent test create \
    --spec specs/My_Agent-testSpec.yaml \
    --api-name My_Agent_Test
```

### Run

```bash
sf agent test run --api-name My_Agent_Test
```

### View Results in Org

```bash
sf org open --path /lightning/setup/TestingCenter/home
```

---

## File Naming & Location

- Test specs: `specs/` directory at project root
- Convention: `{Agent_API_Name}-testSpec.yaml`
- AiEvaluationDefinition metadata: `aiEvaluationDefinitions/` under package directory

---

## Common Mistakes

- **Inventing schema fields**: Use ONLY documented fields. No `type`, `version`, `subject`, `expectations`, `turns`.
- **Using snake_case**: Test spec fields are **camelCase** (`expectedTopic`, `expectedActions`, `expectedOutcome`, `conversationHistory`, `customEvaluations`, `testCases`).
- **Omitting `expectedActions`**: Always include this field. Use `[]` when no action expected.
- **Treating `expectedOutcome` as literal match**: It's a natural language description evaluated by the framework.
- **Forgetting `topic` on agent history entries**: Every `role: agent` entry in `conversationHistory` must include `topic`.
- **Running before creating**: A test spec in `specs/` does NOT mean it exists in the org. Always `sf agent test create` before `sf agent test run`.
- **Guessing `--api-name`**: Must match an AiEvaluationDefinition in the org. Verify by checking `aiEvaluationDefinitions/` metadata.
