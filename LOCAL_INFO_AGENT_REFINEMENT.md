# Local Info Agent — Refinement Context

> Task-specific context for refining the Local Info Agent. Read this file at the start of a Claude Code session working on agent behavior.

---

## What This Is

The **Local Info Agent** is a demo agent for **Coral Cloud Resort**, built using **Agent Script** (Salesforce's next-gen agent authoring language). It's part of a Trailhead Hands-On Challenge project that teaches developers how to build agents with Agentforce DX pro-code tools.

The agent needs to work reliably as a teaching example. Learners will preview it, observe its behavior, then modify the Agent Script and see the change reflected immediately (compile and restart — no redeployment).

## Project Structure

```
force-app/main/default/
  aiAuthoringBundles/Local_Info_Agent/
    Local_Info_Agent.agent          ← Agent Script (the file you'll be editing)
    Local_Info_Agent.bundle-meta.xml
  classes/
    CheckWeather.cls                ← Invocable Apex: weather forecast
    CurrentDate.cls                 ← Invocable Apex: current date for prompt template grounding
    CurrentDateTest.cls
    WeatherService.cls              ← Mock weather data (hardcoded temps)
    WeatherServiceTest.cls
  flows/
    Get_Resort_Hours.flow-meta.xml  ← Flow: facility hours and reservation info
  genAiPromptTemplates/
    Get_Event_Info.genAiPromptTemplate-meta.xml  ← Prompt template: local events in Port Aurelia
  permissionsets/
    Coral_Cloud_Admin.permissionset-meta.xml
    Coral_Cloud_Agent.permissionset-meta.xml
  permissionsetgroups/
    AFDX_Agent_Perms.permissionsetgroup-meta.xml
    AFDX_User_Perms.permissionsetgroup-meta.xml
specs/
  Local_Info_Agent-testSpec.yaml    ← Agent test specification
.a4drules/
  agent-script-rules-no-edit.md     ← Agent Script language reference (AI rules)
  agent-preview-rules-no-edit.md    ← Agent preview CLI reference (AI rules)
  agent-testing-rules-no-edit.md    ← Agent testing CLI reference (AI rules)
```

## Agent Script Overview

The agent has six topics:

| Topic | Purpose | Action Type | Action Target |
|-------|---------|-------------|---------------|
| `topic_selector` | Routes to the right topic, collects guest name | `@utils.transition`, `@utils.setVariables` | — |
| `local_weather` | Weather forecasts for Coral Cloud Resort | Invocable Apex | `apex://CheckWeather` |
| `local_events` | Local events in Port Aurelia | Prompt Template | `prompt://Get_Event_Info` |
| `resort_hours` | Facility hours and reservation info | Flow | `flow://Get_Resort_Hours` |
| `escalation` | Transfer to human agent | `@utils.escalate` | — |
| `off_topic` | Redirect off-topic questions | — (instructions only) | — |
| `ambiguous_question` | Clarify vague requests | — (instructions only) | — |

Key Agent Script features demonstrated:
- **Mutable variables**: `guest_name`, `guest_interests`, `reservation_required`
- **Conditional flow control**: `available when @variables.guest_interests != ""` (gates `check_events` until interests are collected)
- **Deterministic branching**: `if @variables.reservation_required` / `else` in `resort_hours` topic
- **Variable setting from action outputs**: `set @variables.reservation_required = @outputs.reservation_required`

## Backing Implementations

### CheckWeather (Apex)
- Invocable method that takes a date, returns min/max temps and a description string.
- Delegates to `WeatherService` which returns **hardcoded mock data**: min 18.5C (65.3F), max 27.3C (81.1F).
- The description string uses the `°` character, but the Agent Script reasoning instructions say `NEVER use the ° character` — this is intentional, forcing the agent to reformulate rather than parrot the raw output.

### CurrentDate (Apex)
- Invocable method used as a **template data provider** for the `Get_Event_Info` prompt template.
- Returns current date in Eastern US timezone, formatted as "EEEE, MMMM d, yyyy" (e.g., "Wednesday, February 12, 2026").
- Takes an `Event_Type` input (passed through from the prompt template) but doesn't use it — it's there to satisfy the template data provider contract.

### Get_Event_Info (Prompt Template)
- Uses `sfdc_ai__DefaultOpenAIGPT4OmniMini` as primary model.
- Instructs the model to invent exactly three events matching the guest's interest type.
- Three response modes: movies/shows → showtimes today, culture/education → events in upcoming week, anything else → no matching events.
- Grounded with `CurrentDate` apex data provider so the LLM knows what "today" is.

### Get_Resort_Hours (Flow)
- Returns `opening_time`, `closing_time`, and `reservation_required` for a given `activity_type` and `day_of_week`.
- The `reservation_required` boolean output feeds back into the `@variables.reservation_required` mutable variable via `set @variables.reservation_required = @outputs.reservation_required`.

## Known Issues and Behaviors to Refine

### Issue: Agent not working exactly as expected
The agent has been deployed and previewed but isn't behaving as intended in all cases. Specific issues to investigate and fix:

1. **Topic routing reliability**: Test whether the `topic_selector` consistently routes to the correct topic for each of the suggested prompts:
   - "What's the weather like today?" → should route to `local_weather`
   - "I'm interested in movies. What's showing nearby?" → should route to `local_events`
   - "When does the spa open?" → should route to `resort_hours`

2. **Weather response formatting**: The reasoning instructions have specific formatting requirements (temperature ranges, no `°` character, pirate theme). Verify the agent follows these consistently.

3. **Local events flow**: The `local_events` topic has a two-step flow — first collect interests via `@utils.setVariables`, then call `check_events` (gated by `available when`). If the user provides their interest in the first message (e.g., "I'm interested in movies"), does the agent collect AND look up in one turn, or does it require a second turn?

4. **Resort hours with reservation branching**: After calling `get_resort_hours`, the agent should check `@variables.reservation_required` and either mention the phone number or say "walk in." Verify the `if/else` branching works as expected.

5. **Pirate theme in `local_weather`**: This is intentionally there for the learning exercise. Learners will remove it and see the change. Make sure this behavior is obvious and consistent.

## How to Validate Changes

### Preview (no deployment needed for Agent Script changes)
```
sf agent preview --authoring-bundle Local_Info_Agent
```
Or in VS Code: right-click inside the agent script → **AFDX: Preview this Agent** → **Start Simulation**.

After editing the agent script, use **Compile & Restart** in the Preview Panel to pick up changes without redeploying.

### Deploy (needed for Apex, Flow, or Prompt Template changes)
```
sf project deploy start --source-dir force-app
```

### Deploy agent script only
```
sf project deploy start -m AiAuthoringBundle:Local_Info_Agent
```

### Run agent tests
```
sf agent test create --spec specs/Local_Info_Agent-testSpec.yaml
sf agent test run --name "Local Info Agent Tests"
sf agent test results
```

## Test Specification

The test spec at `specs/Local_Info_Agent-testSpec.yaml` defines 9 test cases covering:
- Weather queries (today + specific date) → `local_weather` topic, `check_weather` action
- Events with stated interest → `local_events` topic, `check_events` action
- Events without stated interest → `local_events` topic, NO action (should ask for interests first)
- Spa hours → `resort_hours` topic, `get_resort_hours` action, reservation required
- Pool hours → `resort_hours` topic, `get_resort_hours` action, no reservation
- Escalation → `escalation` topic
- Off-topic → `off_topic` topic, no action
- Multi-turn (weather then restaurant) → `resort_hours` topic after topic switch

## AI Rules Reference

The `.a4drules/` directory contains AI rules files that define Agent Script syntax, preview commands, and testing commands. These are loaded automatically by the Agentforce DX extension. If you need to understand Agent Script syntax or available keywords, read `.a4drules/agent-script-rules-no-edit.md`.

## Refinement Goals

The agent should work reliably enough to serve as a teaching example. A learner should be able to:
1. Preview the agent and get coherent, correct responses to the three suggested prompts
2. See the pirate-themed weather response clearly
3. Remove the pirate instruction, compile and restart, and see the behavior change
4. Understand from the agent's responses that it's using different action types (Apex, Prompt Template, Flow)

Keep the agent script readable and well-structured — it's a learning artifact, not a production agent.
