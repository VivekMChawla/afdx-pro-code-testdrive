# Agent Preview Rules & Reference

Rules for previewing agents using `sf agent preview` commands.

---

## Interface Selection

- If an AI assistant, script, or CI pipeline is driving the conversation: use the **programmatic API** (`sf agent preview start` / `send` / `end`).
- If a human is typing in a terminal: use the **interactive REPL** (`sf agent preview`).
- NEVER use the interactive REPL from automation — it requires terminal input (ESC to exit).

---

## Target Org

The CLI automatically uses the project's default target org.

- ALWAYS omit `--target-org` and rely on the project default.
- ONLY pass `--target-org` if the user explicitly tells you which org to use.
- NEVER guess, invent, or hallucinate an org username or alias.

If a command fails because no default org is set, run `sf org list --skip-connection-status` and ask the user which org to use.

---

## Agent Identification

Use exactly one of these mutually exclusive flags:

- `--authoring-bundle <name>` — for a local Agent Script. The name is the directory name under `aiAuthoringBundles/`.
- `--api-name <name>` — for a published agent in the org. The name is the directory name under `Bots/`.

---

## Metadata Locations

Metadata source paths depend on `sfdx-project.json` `packageDirectories`. Check the array for the correct base path. `force-app` is common but not guaranteed. Metadata subdirectories (e.g., `aiAuthoringBundles/`, `bots/`) are relative to `<packageDirectory>/main/default/`.

---

## Execution Modes (Authoring Bundle Only)

### Simulated Mode (Default)

Do not pass any extra flag. The LLM generates fake action outputs.

Use when:
- Backing code (Apex, Flows, Prompt Templates) doesn't exist yet or isn't deployed
- No default agent user is configured
- You're experimenting with instructions, topic routing, and conversation flow

### Live Mode (`--use-live-actions`)

Pass `--use-live-actions` with `--authoring-bundle`.

Use when:
- Backing code IS deployed and a default agent user IS configured
- Testing grounding behavior (grounding checker needs real action output data)
- Testing variable-driven branching (actions set variables via `set @variables.x = @outputs.y`)
- Testing output formatting (real outputs may differ from simulated)

**Important**: `--use-live-actions` is ONLY valid with `--authoring-bundle`. Published agents (`--api-name`) always execute real actions.

---

## Programmatic Workflow

ALWAYS pass `--json` when calling from an AI assistant or script.

### Start a Session

```bash
sf agent preview start --authoring-bundle <BUNDLE_NAME> --json
```

Returns a session ID. Capture this value — every subsequent command needs it.

### Send Utterances

```bash
sf agent preview send --authoring-bundle <BUNDLE_NAME> --session-id <SESSION_ID> -u "<MESSAGE>" --json
```

- ALWAYS pass `--session-id` from the start command
- MUST pass the same `--authoring-bundle` or `--api-name` used in start
- Sessions stay open between sends — do NOT restart between turns

### End a Session (Optional)

```bash
sf agent preview end --authoring-bundle <BUNDLE_NAME> --session-id <SESSION_ID> --json
```

- Returns the location of session trace logs
- Do NOT end preemptively — sessions time out automatically
- End when you need trace files or the conversation is fully complete

---

## Session Traces

Trace files are written after every conversation turn and are available immediately — you do not need to end the session to access them.

### Trace Location

```
.sfdx/agents/<BUNDLE_NAME>/sessions/<SESSION_ID>/
```

### When to Use Traces

- **Wrong topic routing**: Traces show the full reasoning chain for topic selection
- **Grounding failures**: Traces include grounding check results with flagged sections
- **Action data flow**: Traces show raw inputs sent to actions and outputs received

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
    # CORRECT — start first, then send
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
    # WRONG
    sf agent preview send --authoring-bundle My_Bundle -u "Hello" --json
    # CORRECT
    sf agent preview send --authoring-bundle My_Bundle --session-id <ID> -u "Hello" --json
    ```
