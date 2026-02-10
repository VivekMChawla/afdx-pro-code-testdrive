# Agent Preview Rules & Guide

This document provides rules and guidance for previewing agents using the Salesforce CLI `sf agent preview` commands. Use these rules when simulating chat sessions with agents built using Agent Script or when interacting with published agents.

---

## Choosing the Right Interface

There are two interfaces for agent preview. Choose based on who is driving the conversation:

| Interface | Command | When to Use |
|-----------|---------|-------------|
| **Interactive REPL** | `sf agent preview` | A human is typing in a terminal |
| **Programmatic API** | `sf agent preview start` / `send` / `end` | An AI assistant, script, or CI pipeline is driving the conversation |

- ALWAYS use the programmatic API (`start` / `send` / `end`) when automating agent conversations.
- NEVER use the interactive REPL (`sf agent preview` with no subcommand) from an AI assistant or script — it requires interactive terminal input (arrow keys, ESC to exit) that automation cannot provide.

---

## Identifying the Agent

Every preview command requires you to identify the agent. There are two mutually exclusive flags:

| Flag | Agent Source | How to Find the API Name |
|------|-------------|--------------------------|
| `--authoring-bundle <name>` | Local Agent Script (AiAuthoringBundle) | Directory name under `aiAuthoringBundles/` in your DX project |
| `--api-name <name>` | Published and activated agent in the org | Directory name under `Bots/` in your DX project |

- ALWAYS use exactly one of `--authoring-bundle` or `--api-name`.
- NEVER combine both flags on the same command.
- NEVER use `--api-name` for an agent that is not published and activated in the target org.

---

## Execution Modes (Authoring Bundle Only)

When previewing from an authoring bundle, choose between two execution modes:

| Mode | Flag | Actions Behavior | When to Use |
|------|------|------------------|-------------|
| **Simulated** (default) | _(none)_ | LLM mocks all actions using topic descriptions from Agent Script | Backing Apex/Flows/Prompt Templates are not yet deployed or don't exist |
| **Live** | `--use-live-actions` | Executes real Apex, Flows, and Prompt Templates deployed in the org | Backing implementations are deployed and you want to test real behavior |

- The `--use-live-actions` flag is ONLY valid with `--authoring-bundle`.
- NEVER pass `--use-live-actions` with `--api-name` — published agents always execute real actions.
- If using live mode, all backing Apex classes, Flows, and Prompt Templates MUST be deployed to the target org first.

---

## Programmatic Workflow: Start → Send → End

Use these three commands in sequence to conduct a programmatic agent preview conversation.

### Step 1: Start a Session

```bash
sf agent preview start \
    --authoring-bundle <BUNDLE_NAME> \
    --target-org <ORG_ALIAS> \
    --json
```

Returns a JSON response containing the session ID. Extract it for use in subsequent commands.

Example (simulated mode):
```bash
sf agent preview start --authoring-bundle My_Agent_Bundle --target-org my-org --json
```

Example (live mode):
```bash
sf agent preview start --authoring-bundle My_Agent_Bundle --use-live-actions --target-org my-org --json
```

Example (published agent):
```bash
sf agent preview start --api-name My_Published_Agent --target-org my-org --json
```

### Step 2: Send Utterances (Repeat for Multi-Turn)

```bash
sf agent preview send \
    --authoring-bundle <BUNDLE_NAME> \
    --session-id <SESSION_ID> \
    --utterance "<MESSAGE>" \
    --json
```

- The `--utterance` (`-u`) flag is required and must contain the message text.
- The `--session-id` flag can be omitted ONLY when the agent has exactly one active session.
- You MUST also pass the same `--authoring-bundle` or `--api-name` flag used in the `start` command.

### Step 3: End the Session

```bash
sf agent preview end \
    --authoring-bundle <BUNDLE_NAME> \
    --session-id <SESSION_ID> \
    --json
```

Returns the local directory where session trace files are stored.

- ALWAYS end sessions when the conversation is complete. Abandoned sessions consume server resources.
- The `--session-id` flag can be omitted ONLY when the agent has exactly one active session.

---

## Session Management

### Listing Active Sessions

```bash
sf agent preview sessions --json
```

Lists all cached programmatic preview sessions with their session IDs, agent names, and status. Use this to discover or disambiguate session IDs.

### Session ID Rules

- A session ID is returned by `sf agent preview start`.
- The `--session-id` flag on `send` and `end` is optional ONLY when the agent has exactly one active session.
- If an agent has multiple active sessions, you MUST pass `--session-id` — omitting it produces an error.
- Multiple sessions can be active simultaneously for the same agent or across different agents.

---

## Required Flags

| Flag | Required? | Notes |
|------|-----------|-------|
| `--target-org` (`-o`) | Yes (on `start`, `send`, `end`) | Always required, even for simulated preview — Agent Lifecycle APIs run server-side |
| `--authoring-bundle` or `--api-name` | Yes (on `start`, `send`, `end`) | Exactly one must be specified |
| `--utterance` (`-u`) | Yes (on `send` only) | The message to send to the agent |
| `--json` | No, but recommended | ALWAYS pass `--json` when calling from an AI assistant or script |

---

## Apex Debug Logging

- The `--apex-debug` (`-x`) flag is available ONLY on the interactive REPL (`sf agent preview`), not on the programmatic subcommands.
- NEVER pass `--apex-debug` to `sf agent preview start`, `send`, or `end`.

---

## Transcript and Trace Output

- **Interactive REPL**: Prompts to save transcripts on exit. Default location: `./temp/agent-preview`. Override with `--output-dir` (`-d`).
- **Programmatic `end` command**: Returns the trace file location in its JSON output. No interactive prompt.
- The `--output-dir` flag is ONLY available on the interactive REPL, not on the programmatic subcommands.

---

## Common Mistakes

1. **Using the interactive REPL from automation:**

    ```bash
    # WRONG — requires interactive terminal input
    sf agent preview --authoring-bundle My_Bundle

    # CORRECT — use the programmatic workflow
    sf agent preview start --authoring-bundle My_Bundle --json
    sf agent preview send --authoring-bundle My_Bundle -u "Hello" --json
    sf agent preview end --authoring-bundle My_Bundle --json
    ```

2. **Combining `--authoring-bundle` and `--api-name`:**

    ```bash
    # WRONG — flags are mutually exclusive
    sf agent preview start --authoring-bundle My_Bundle --api-name My_Agent --json

    # CORRECT — use one or the other
    sf agent preview start --authoring-bundle My_Bundle --json
    ```

3. **Using `--use-live-actions` with a published agent:**

    ```bash
    # WRONG — published agents always use live actions
    sf agent preview start --api-name My_Agent --use-live-actions --json

    # CORRECT — omit the flag for published agents
    sf agent preview start --api-name My_Agent --json
    ```

4. **Sending before starting:**

    ```bash
    # WRONG — no session exists yet
    sf agent preview send --authoring-bundle My_Bundle -u "Hello" --json

    # CORRECT — start first, then send
    sf agent preview start --authoring-bundle My_Bundle --json
    # ... extract session ID from response ...
    sf agent preview send --authoring-bundle My_Bundle --session-id <ID> -u "Hello" --json
    ```

5. **Passing `--apex-debug` to programmatic subcommands:**

    ```bash
    # WRONG — flag only exists on the interactive REPL
    sf agent preview start --authoring-bundle My_Bundle --apex-debug --json

    # CORRECT — omit --apex-debug from programmatic commands
    sf agent preview start --authoring-bundle My_Bundle --json
    ```

6. **Omitting `--json` in automation:**

    ```bash
    # WRONG — human-readable output is hard to parse
    sf agent preview start --authoring-bundle My_Bundle

    # CORRECT — always use --json for automation
    sf agent preview start --authoring-bundle My_Bundle --json
    ```

7. **Forgetting the agent identifier on `send` and `end`:**

    ```bash
    # WRONG — missing --authoring-bundle or --api-name
    sf agent preview send --session-id <ID> -u "Hello" --json

    # CORRECT — include the agent identifier
    sf agent preview send --authoring-bundle My_Bundle --session-id <ID> -u "Hello" --json
    ```
