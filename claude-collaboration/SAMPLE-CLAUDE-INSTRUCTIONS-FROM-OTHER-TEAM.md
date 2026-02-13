---
title: Project Template (CLAUDE.md)
description: Template for CLAUDE.md in Agentforce agent projects
---

# Project Template

Copy this to your agent project as `CLAUDE.md` to give Claude Code the right context for building Agentforce agents.

```markdown
# CLAUDE.md - Agentforce Agent Project

Claude Code context for building and deploying Agentforce agents.

## Quick Start

Use the Agentforce Builder skill (if available) for guided agent development:
```
/agentforce-builder
```

Or work directly with MCP tools and CLI commands documented below.

## MCP Server Configuration

The Agentforce MCP server enables Claude to preview, publish, and test agents.

### Hosted Server (Recommended)

```bash
claude mcp add agentforcemcp --transport sse https://agentforcemcp-80f2fba98ce0.herokuapp.com/sse
```

### Local Server

Add to `.claude/mcp.json` in your project (or global config):

```json
{
  "mcpServers": {
    "agentforce": {
      "command": "uv",
      "args": ["run", "fastmcp", "run", "server.py", "--transport", "sse"],
      "env": {
        "SF_INSTANCE_URL": "${SF_INSTANCE_URL}",
        "SF_CLIENT_ID": "${SF_CLIENT_ID}",
        "SF_CLIENT_SECRET": "${SF_CLIENT_SECRET}"
      }
    }
  }
}
```

### ECA Environment Variables

The MCP server authenticates via External Connected App (ECA) credentials:

| Variable | Description |
|----------|-------------|
| `SF_INSTANCE_URL` | Your Salesforce org URL (e.g., `https://your-org.my.salesforce.com`) |
| `SF_CLIENT_ID` | ECA client ID from Setup > App Manager |
| `SF_CLIENT_SECRET` | ECA client secret |

Set these in your shell or `.env` file. Never commit secrets to git.

## MCP Tools Reference

### Agent Lifecycle

| Tool | Purpose |
|------|---------|
| `list_agents(agent_name?)` | List agents in org, optionally filter by name |
| `publish_agent(agentscript_content)` | Deploy agent to Salesforce |
| `generate_agent(type, company_description, company_name, role, agent_name)` | Generate agent scaffolding via SF CLI |

### Development & Testing

| Tool | Purpose |
|------|---------|
| `preview_agent(message, agent_content)` | Test local .agent files before publishing |
| `chat_with_agent(message, agent_id, session_id?)` | Chat with published agents |
| `end_agent_session(session_id)` | Clean up chat sessions |

### Evaluation

| Tool | Purpose |
|------|---------|
| `generate_test_plan(agent_id?, agent_name?, agent_content?, org_id, user_id, instance_url, access_token)` | Get agent metadata for test generation |
| `run_agent_tests(test_payload, org_id, user_id, instance_url, access_token)` | Execute Einstein Evaluation tests |

### Setup & Auth

| Tool | Purpose |
|------|---------|
| `authenticate_user()` | Check auth status and get SF CLI setup instructions |
| `generate_salesforce_project()` | Create SFDX project structure |
| `retrieve_ai_authoring_bundle(target_org)` | Retrieve agent metadata from org |
| `get_salesforce_cli_install_link()` | Get SF CLI installation URL |

## Project Structure

Agents are defined in `.agent` files using Agent Script DSL:

```
force-app/
  main/
    default/
      aiAuthoringBundles/
        My_Agent/
          My_Agent.agent          # Agent definition (Agent Script)
          My_Agent.agent-meta.xml # Metadata (auto-generated)
```

## Agent Script Block Order

Blocks must appear in this order:

1. `system:` - Global messages and instructions
2. `config:` - Agent metadata and settings
3. `language:` - Localization settings (optional)
4. `variables:` - State management
5. `knowledge:` - Knowledge sources (optional)
6. `connection:` - External connections (optional)
7. `start_agent:` - Entry point
8. `topic:` - Specialist behaviors (one or more)

## Agent Script Quick Reference

```agentscript
system:
    messages:
        welcome: "Hello! How can I help?"
        error: "Something went wrong."
    instructions: "You are a helpful assistant."

config:
    agent_name: "My_Agent"
    agent_label: "My Agent"
    agent_type: "AgentforceServiceAgent"
    description: "Agent description"
    default_agent_user: "user@example.com"

variables:
    query: mutable string = ""
        description: "User's current request"

start_agent topic_selector:
    label: "Topic Selector"
    description: "Entry point that routes users"

    reasoning:
        instructions: ->
            | Analyze user intent and route appropriately.

        actions:
            go_help: @utils.transition to @topic.general_help
                description: "Handle general questions"

topic general_help:
    label: "General Help"
    description: "Handle general assistance"

    actions:
        get_info:
            target: "flow://Get_Info_Flow"
            description: "Fetch information"
            inputs:
                query: string
                    description: "Search query"
            outputs:
                result: string

    reasoning:
        instructions: ->
            | Help the user with their question.

        actions:
            lookup: @actions.get_info
                description: "Look up information"
                with query = ...
                set @variables.result = @outputs.result
```

### Key Syntax

| Syntax | Purpose |
|--------|---------|
| `label:` | Human-readable name for topics (required) |
| `->` | Procedural block marker |
| `\|` | Multiline text content |
| `{! }` | Template expression (e.g., `{!@variables.name}`) |
| `@` | Resource reference (`@variables`, `@actions`, `@topic`, `@utils`) |
| `...` | LLM slot-fills this value |

### Transition Syntax

In `reasoning.actions` (LLM-selected):
```agentscript
go_next: @utils.transition to @topic.target
    description: "Why to go here"
```

In directive blocks (`before_reasoning`, `after_reasoning`):
```agentscript
after_reasoning:
    if @variables.done:
        transition to @topic.next
```

### Variable Types

```agentscript
name: mutable string = ""           # Text
count: mutable number = 0           # Numeric
active: mutable boolean = False     # Boolean (must be True/False)
items: mutable list[string] = []    # Array
data: mutable object = {}           # Key-value
session_id: linked string           # Read-only from external context
    source: @session.sessionID
```

## CLI Commands

### Project Setup

```bash
# Install SF CLI (if needed)
# See: https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_install_cli.htm

# Generate project
sf project generate --name my-agent-project

# Authenticate to org
sf org login web --alias my-org
```

### Agent Development

```bash
# Generate agent spec and authoring bundle
sf agent generate agent-spec --type customer --company-description "..." --company-name "..." --role "..."
sf agent generate authoring-bundle --spec specs/agentSpec.yaml --name "My Agent" --api-name My_Agent

# Retrieve existing agents
sf project retrieve start --metadata "AiAuthoringBundle:*" --target-org my-org

# Validate agent syntax (CRITICAL before deploying)
sf agent validate authoring-bundle --api-name My_Agent

# Deploy agent
sf project deploy start -d force-app/main/default/aiAuthoringBundles -o my-org
```

### Testing

```bash
# Get org credentials for testing
sf org display user --target-org my-org --json

# Run agent tests (via Agentforce DX)
sf agent test run --api-name My_Agent --target-org my-org
```

## Development Workflow

### 1. Create Agent
- Use `generate_agent` MCP tool or `sf agent generate` CLI
- Or write `.agent` file manually using syntax above

### 2. Validate Syntax
- Run `sf agent validate authoring-bundle --api-name AGENT_NAME`
- Fix any syntax errors before proceeding

### 3. Preview & Iterate
- Use `preview_agent(message, agent_content)` MCP tool
- Test with realistic user utterances
- Iterate on instructions and routing

### 4. Create Tests
- Use `generate_test_plan()` to get agent metadata
- Write test cases covering:
  - Happy paths
  - Topic routing
  - Action invocation
  - Edge cases and error handling

### 5. Run Evaluations
- Use `run_agent_tests(test_payload, ...)` to execute tests
- Analyze results and fix failures
- Repeat until tests pass

### 6. Publish
- Use `publish_agent(agentscript_content)` MCP tool
- Or deploy via CLI: `sf project deploy start`

### 7. Verify
- Use `chat_with_agent(message, agent_id)` to test published agent
- Confirm behavior matches expectations

## Testing Credentials

For `generate_test_plan` and `run_agent_tests`, get credentials locally:

```bash
sf org display user --target-org my-org --json
```

Then pass these fields to the MCP tools:
- `org_id`: result.orgId
- `user_id`: result.id
- `access_token`: result.accessToken
- `instance_url`: result.instanceUrl

## Common Issues

### "Not a valid Salesforce DX project"
Run `sf project generate --name my-project` first, then `cd` into it.

### Authentication errors
Run `sf org login web --alias my-org` to re-authenticate.

### Agent validation fails
Check block order, ensure `label:` is present on all topics, verify boolean values use `True`/`False`.

### Tests return 401/403
Re-authenticate with `sf org login web` and get fresh credentials from `sf org display user`.
```