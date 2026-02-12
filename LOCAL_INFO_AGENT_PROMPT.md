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
5. Preview the agent to observe actual behavior using the programmatic commands:
   ```bash
   sf agent preview start --authoring-bundle Local_Info_Agent --json
   sf agent preview send --authoring-bundle Local_Info_Agent --session-id <ID> -u "Hi there" --json
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
6. Preview and test with the programmatic commands — try utterances like "What events are happening this week?"

### Issue 3: Intermittent Grounding Errors on Weather (MEDIUM — Blocks First-Turn Success)

**Expected behavior**: Agent calls `check_weather` with today's date, gets results, and
responds with a weather summary that passes the platform's grounding check.

**Actual behavior**: The agent's response is sometimes flagged as UNGROUNDED by the
platform's grounding checker, causing a retry loop that ends in "I encountered an
unexpected error." The same response passes grounding on a subsequent turn. This is
non-deterministic.

**Root cause (diagnosed from session trace `df140521...`):**

The grounding checker can't reliably infer that a specific date in the function output
equals "today" in the agent's response. Here's the chain:

1. Agent calls `check_weather` with `dateToCheck: "2026-02-12"` (today)
2. CheckWeather returns: `"The weather at Coral Cloud Resort on 2026-02-12 is expected to be..."`
3. Agent responds: `"The weather at Coral Cloud Resort today will have..."`
4. Grounding checker sees `"2026-02-12"` in function output but `"today"` in response
5. Sometimes it infers they're the same date → GROUNDED. Sometimes not → UNGROUNDED.

The session trace is at:
`.sfdx/agents/Local_Info_Agent/sessions/df140521-1bc3-49cf-a818-18e8f03108aa/`

Key evidence: The `ReasoningStep` at the end of Turn 1 says:
> "The response uses these values but presents them as today's weather, while the function
> result is for a future date. There is no grounding for today's weather."

The grounding checker thinks 2026-02-12 is a "future date" rather than "today."

**Fix approach (Agent Script instructions, not Apex):**

Update the `local_weather` topic's reasoning instructions to tell the agent to always
include the specific date from the action results in its response. Instead of saying
"today's weather," say "the weather on February 12, 2026." This gives the grounding
checker a direct string match between the function output date and the response date.

Current instruction says:
> "When responding, ALWAYS say something like 'The weather at Coral Cloud Resort will
>  have temperatures between 48.5F and 70.0F.'"

Change to something like:
> "When responding, ALWAYS include the specific date from the weather results. Say
>  something like 'The weather at Coral Cloud Resort on [date] will have temperatures
>  between 48.5F and 70.0F.' NEVER use the word 'today' — always use the actual date."

**Note on pirate instructions and grounding tension:**

The `local_weather` topic instructions end with: "ALWAYS give answers like you're a pirate
on the high seas, using pirate-themed language and expressions." This is *intentional* for
the learning exercise — the learner's task is to remove it and observe the behavior change.

However, pirate voice is inherently at odds with grounding. It encourages the LLM to
embellish with colorful details ("a gentle breeze be blowin' across the deck") that aren't
in the function output. The grounding checker may flag these embellishments. This is a
known tension — don't try to "fix" it by removing the pirate instructions. Instead, focus
on the date-matching fix above and accept that the pirate voice may occasionally trigger
grounding retries until the learner removes it.

**Additional grounding guardrails to consider across all topics:**
1. Instructions should tell the agent to directly quote or closely paraphrase action output
2. Test with preview after each change — the grounding check runs during preview

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
5. **Preview** — test with the programmatic preview commands (NEVER use the interactive REPL —
   it requires terminal input that automation cannot provide):
   ```bash
   # Start a session
   sf agent preview start --authoring-bundle Local_Info_Agent --json

   # Send an utterance (use the session ID returned by start)
   sf agent preview send --authoring-bundle Local_Info_Agent --session-id <ID> -u "Hello" --json

   # Send follow-up turns in the same session
   sf agent preview send --authoring-bundle Local_Info_Agent --session-id <ID> -u "What's the weather?" --json

   # End the session when done testing
   sf agent preview end --authoring-bundle Local_Info_Agent --session-id <ID> --json
   ```
   Keep the session open between sends — you do NOT need to restart between turns.
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
