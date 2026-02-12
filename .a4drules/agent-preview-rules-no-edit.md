# Agent Preview Rules & Guide

Rules for previewing agents using `sf agent preview` commands.

---

## Interface Selection

- If an AI assistant, script, or CI pipeline is driving the conversation, use the programmatic API: `sf agent preview start` / `send` / `end`.
- If a human is typing in a terminal, use the interactive REPL: `sf agent preview`.
- NEVER use the interactive REPL from automation — it requires terminal input (ESC to exit) that automation cannot provide.

---

## Target Org

The CLI automatically uses the project's default target org.

- ALWAYS omit `--target-org` and rely on the project default.
- ONLY pass `--target-org` if the user explicitly tells you which org to use.
- NEVER guess, invent, or hallucinate an org username or alias.

If a command fails because no default org is set, do NOT guess. Run `sf org list --skip-connection-status` and ask the user which org to use.

---

## Agent Identification

Use exactly one of these mutually exclusive flags:

- `--authoring-bundle <name>` — for a local Agent Script. The name is the directory name under `aiAuthoringBundles/`.
- `--api-name <name>` — for a published agent in the org. The name is the directory name under `Bots/`.

---

## Metadata Locations

Metadata source paths depend on the package directories defined in `sfdx-project.json` at the project root. Check the `packageDirectories` array for the correct base path. `force-app` is a common default but is not guaranteed. Metadata type subdirectories (e.g., `aiAuthoringBundles/`, `bots/`) are relative to `<packageDirectory>/main/default/`.

---

## Execution Modes (Authoring Bundle Only)

- Use **simulated mode** (the default) when backing Apex/Flows/Prompt Templates are not deployed or don't exist yet. Do not pass any extra flag.
- Pass `--use-live-actions` ONLY when backing implementations are deployed and you want to test real behavior.
- `--use-live-actions` is ONLY valid with `--authoring-bundle`. Published agents (`--api-name`) always execute real actions — do NOT pass `--use-live-actions` with `--api-name`.

### Choosing a Mode

**Simulated mode** (default) generates action outputs via LLM — the data is fake. **Live mode** (`--use-live-actions`) executes real backing code (Apex, Flows, Prompt Templates) and returns real outputs.

Use simulated mode when:
- **Backing code doesn't exist yet**: You're experimenting with instructions, topic routing, and conversation flow before building the actions. Simulated mode avoids needing to stub out actions.
- **No default agent user configured**: Live preview requires a real, active user created and assigned as the agent's `default_agent_user`. Simulated mode skips this requirement, reducing setup friction for initial experimentation and test drives.

**Prefer live mode** (`--use-live-actions`) whenever backing code is deployed and a default agent user is configured. Live mode gives you real grounding behavior, real data flow through variables, and real action output formatting. If neither of the simulated mode scenarios above applies, use live mode.

Live mode is specifically required when your test depends on what action outputs actually contain:
- **Grounding**: The platform's grounding checker validates the agent's response against real action output data. Simulated mode cannot reproduce grounding failures.
- **Variable-driven branching**: Actions that set variables via `set @variables.x = @outputs.y` need real outputs to produce correct values for downstream conditional logic.
- **Output formatting**: Real action output strings may differ from what the LLM invents in simulated mode.

---

## Programmatic Workflow

ALWAYS pass `--json` when calling from an AI assistant or script.

### Start a Session

```bash
sf agent preview start --authoring-bundle <BUNDLE_NAME> --json
```

Returns a session ID. ALWAYS capture this value — you need it for every subsequent command.

### Send Utterances

```bash
sf agent preview send --authoring-bundle <BUNDLE_NAME> --session-id <SESSION_ID> -u "<MESSAGE>" --json
```

- ALWAYS pass `--session-id` with the value returned by `start`. Multiple agents may have concurrent sessions against the same agent.
- You MUST pass the same `--authoring-bundle` or `--api-name` used in `start`.
- You can send multiple utterances across a session. The session stays open between sends — you do NOT need to end and restart between turns. Keep the session open if the user may want additional turns after reviewing results.

### End a Session (Optional)

```bash
sf agent preview end --authoring-bundle <BUNDLE_NAME> --session-id <SESSION_ID> --json
```

- ALWAYS pass `--session-id` with the value returned by `start`.
- `end` returns the location of session trace logs. Call it when you need the trace files or when the conversation is fully complete.
- Do NOT end a session preemptively. If the user may ask follow-up questions, keep the session open. Sessions time out automatically on the server.

---

## Session Traces

A trace file is written after every conversation turn. Traces are available immediately after each `send` — you do not need to end the session to access them. The `sf agent preview end` command returns the `tracesPath` for convenience, but you can read traces at any point during the session.

### Trace Location

Traces are stored locally at `.sfdx/agents/<BUNDLE_NAME>/sessions/<SESSION_ID>/` within the project directory.

### When to Use Traces

- **Debugging unexpected behavior**: If the agent routes to the wrong topic, calls the wrong action, or produces an unexpected response, traces show the full reasoning chain — topic selection, action decisions, and response generation.
- **Diagnosing grounding failures**: Traces include grounding check results showing which parts of the response were flagged as UNGROUNDED and why. This is essential for understanding intermittent grounding errors.
- **Understanding action data flow**: Traces show the raw inputs sent to actions and outputs received, which helps verify variable binding and conditional branching.

---

## Common Mistakes

1. **Using the interactive REPL from automation:**

    ```bash
    # WRONG
    sf agent preview --authoring-bundle My_Bundle

    # CORRECT
    sf agent preview start --authoring-bundle My_Bundle --json
    ```

2. **Combining `--authoring-bundle` and `--api-name`:**

    ```bash
    # WRONG — mutually exclusive
    sf agent preview start --authoring-bundle My_Bundle --api-name My_Agent --json

    # CORRECT
    sf agent preview start --authoring-bundle My_Bundle --json
    ```

3. **Sending before starting:**

    ```bash
    # WRONG — no session exists
    sf agent preview send --authoring-bundle My_Bundle -u "Hello" --json

    # CORRECT — start first
    sf agent preview start --authoring-bundle My_Bundle --json
    sf agent preview send --authoring-bundle My_Bundle --session-id <ID> -u "Hello" --json
    ```

4. **Guessing a `--target-org` value:**

    ```bash
    # WRONG — hallucinated org
    sf agent preview start --authoring-bundle My_Bundle --target-org admin@mycompany.com --json

    # CORRECT — omit to use project default
    sf agent preview start --authoring-bundle My_Bundle --json
    ```

5. **Forgetting the agent identifier on `send` and `end`:**

    ```bash
    # WRONG
    sf agent preview send --session-id <ID> -u "Hello" --json

    # CORRECT
    sf agent preview send --authoring-bundle My_Bundle --session-id <ID> -u "Hello" --json
    ```

6. **Omitting `--session-id` on `send` or `end`:**

    ```bash
    # WRONG — concurrent sessions will collide
    sf agent preview send --authoring-bundle My_Bundle -u "Hello" --json

    # CORRECT — always pass the session ID from start
    sf agent preview send --authoring-bundle My_Bundle --session-id <ID> -u "Hello" --json
    ```
