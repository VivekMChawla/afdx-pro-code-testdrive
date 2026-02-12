# Prompt: Refine the Local Info Agent

> Copy everything below this line into a Claude Code session in this project directory.

---

## Task

The Local Info Agent (`Local_Info_Agent.agent`) is functional but has several behavioral
issues that need diagnosis and fixing. The agent is for a Trailhead Hands-On Challenge,
so it must work smoothly out of the box — learners will interact with it during their
first experience with Agent Script.

## Context

Read `LOCAL_INFO_AGENT_REFINEMENT.md` at the project root first. It contains the full
project structure, agent script overview, backing implementation details, known issues,
validation/preview/deploy commands, and refinement goals.

The Agent Script source file is at:
`force-app/main/default/aiAuthoringBundles/Local_Info_Agent/Local_Info_Agent.agent`

The Agent Script syntax rules are at:
`.a4drules/agent-script-rules-no-edit.md`

The org is connected — the default target org is set and all backing code
(Apex, Flow, Prompt Template) is deployed.

## Known Behavioral Issues (Priority Order)

### Issue 1: Name-Asking Flow Is Broken (HIGH — Entry Experience)

**Expected behavior**: The agent greets the user with the welcome message and asks for
their name on the very first turn. After learning the name, it stores it in a variable
and uses it throughout the conversation.

**Actual behavior**: The first turn returns a generic system message — NOT the welcome
message defined in the `system` block. The agent doesn't ask for the user's name until
the second or third turn. The sequence feels unnatural.

**Diagnosis approach**:
1. Read the `start_agent` block and the `system` block — is the welcome message configured correctly?
2. Check the `start_agent` reasoning instructions — do they instruct the agent to ask for the name?
3. Check the `variables` block — is there a mutable string variable for the user's name?
4. Look at how the name variable is used in topic instructions — is there a conditional pattern
   like `if @variables.user_name: ... else: ask for name`?
5. Preview the agent to observe actual behavior:
   ```bash
   sf agent preview --authoring-bundle Local_Info_Agent
   ```
6. If the welcome message issue is a platform behavior (not controllable via Agent Script),
   focus on making the name-asking work reliably on the first conversational turn.

### Issue 2: Event Loop Gets Stuck (MEDIUM — Functional Issue)

**Expected behavior**: When asked about local events, the agent invokes the `Get_Event_Info`
prompt template action and returns event information.

**Actual behavior**: The agent gets stuck in a loop when handling local event queries.
Likely a control flow issue — possibly a circular transition, a `before_reasoning` block
that re-runs the action endlessly, or an `after_reasoning` transition that kicks back
to the same topic.

**Diagnosis approach**:
1. Read the `local_events` topic — check `before_reasoning`, `reasoning`, and `after_reasoning` blocks
2. Look for circular transitions (topic transitions back to itself or ping-pong between topics)
3. Check if there are unconditional `run @actions.*` directives in `before_reasoning` that
   fire on every reasoning cycle
4. Check if `after_reasoning` transitions unconditionally back to a topic that re-enters `local_events`
5. Look at variable gating — are conditions set up so the action only fires when appropriate?
6. Preview and test with utterances like "What events are happening this week?"

### Issue 3: Intermittent Grounding Errors (LOW — Quality Issue)

**Expected behavior**: The agent provides accurate, grounded responses based on action
outputs and Agent Script instructions.

**Actual behavior**: Intermittent grounding errors — the agent sometimes provides
information that doesn't match what the actions return, or hallucinates details.

**Diagnosis approach**:
1. Check reasoning instructions across all topics — are they specific enough to prevent hallucination?
2. Look for instructions that are too open-ended (e.g., "help the user with weather" vs.
   "report ONLY the weather data returned by the CheckWeather action")
3. Check if action outputs are properly captured into variables and referenced in instructions
4. Add grounding guardrails to instructions if needed (e.g., "Do NOT make up information.
   Only share information returned by actions.")
5. Test with preview — compare action outputs to agent responses

## Scope Guidance

**Start with Agent Script changes only.** The backing implementations (Apex class CheckWeather,
Prompt Template Get_Event_Info, Flow Get_Resort_Hours) are historically known-good. The Flow
is newer and less battle-tested, but start by assuming the Agent Script is the issue.

If Agent Script changes don't resolve a behavior, THEN investigate backing implementations:
- Apex: `force-app/main/default/classes/CheckWeather.cls`
- Prompt Template: `force-app/main/default/genAiPromptTemplateActvs/Get_Event_Info.*`
- Flow: look for `Get_Resort_Hours` in `force-app/main/default/flows/`

## Workflow

For each issue:

1. **Read** the relevant Agent Script sections
2. **Diagnose** — form a hypothesis about what's causing the behavior
3. **Fix** — make targeted changes to the `.agent` file
4. **Validate** — run `sf agent validate authoring-bundle --api-name Local_Info_Agent`
5. **Preview** — test with the interactive REPL:
   ```bash
   sf agent preview --authoring-bundle Local_Info_Agent
   ```
6. **Iterate** — if the behavior isn't fixed, revise the hypothesis

After all three issues, deploy and run the full test suite:
```bash
sf project deploy start -m AiAuthoringBundle:Local_Info_Agent
sf agent test run --api-name Local_Info_Agent_Test
```

## What NOT to Do

- Don't rewrite the entire agent from scratch — make targeted fixes
- Don't modify `.a4drules/` files — they're shared reference docs
- Don't deploy the AiAuthoringBundle until all three issues are addressed
- Don't change backing implementations unless Agent Script fixes are insufficient
- Don't add new topics or actions — fix what's there
