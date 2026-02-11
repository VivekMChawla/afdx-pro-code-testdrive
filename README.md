# AFDX Pro-Code Testdrive

A hands-on project for learning how to create next-gen Agentforce agents using **Agent Script** and **Agentforce DX**.

This project contains a pre-built agent for **Coral Cloud Resort** called the **Local Info Agent**. It demonstrates three types of agent actions (Invocable Apex, Prompt Template, and Flow), mutable variables, flow control with `available when`, and deterministic branching with `if/else` in reasoning instructions.

## Prerequisites

- A **Salesforce Developer Edition (DE)** org *(free at [developer.salesforce.com/signup](https://developer.salesforce.com/signup))*
- **Salesforce CLI** (`sf`) installed *(see [developer.salesforce.com/tools/sfdxcli](https://developer.salesforce.com/tools/sfdxcli))*
- **VS Code** with the **Salesforce Extensions** pack and the **Agentforce DX** extension

## Setup

### STEP ONE: Prepare your Developer Edition org
1. Sign up for a DE org at [developer.salesforce.com/signup](https://developer.salesforce.com/signup).
2. Enable the following features:
   - **Einstein** *(Setup > Einstein > Einstein Generative AI > Einstein Setup)*
     - Some orgs have Einstein enabled by default. If yours already shows Einstein as enabled, you can skip this step.
     - Reload your browser tab after enabling Einstein so Agentforce becomes available in your Setup tree.
   - **Agentforce** *(Setup > Einstein > Einstein Generative AI > Agentforce Studio > Agentforce Agents)*

### STEP TWO: Clone and deploy the project
1. Clone this repo.
   ```
   git clone https://github.com/VivekMChawla/afdx-pro-code-testdrive.git
   ```
2. Navigate into the cloned folder.
   ```
   cd afdx-pro-code-testdrive
   ```
3. Authenticate the Salesforce CLI to your DE org.
   ```
   sf org login web -s -a AFDX-Testdrive
   ```
4. Deploy the project.
   ```
   sf project deploy start --source-dir force-app
   ```

### STEP THREE: Assign permissions and create the Agent User
1. Assign AFDX permissions to yourself.
   ```
   sf org assign permset -n AFDX_User_Perms
   ```
2. Get the ID of the **Einstein Agent User** profile.
   ```
   sf data query -q "SELECT Id FROM Profile WHERE Name='Einstein Agent User'"
   ```
3. Update `data-import/User.json`:
   ![Update line 8 with the Einstein Agent User profile ID from the previous step. Update line 9 with something unique to you to ensure a globally unique username is specified.](images/agent-user-data-import.png)
4. Create the agent user.
   ```
   sf data import tree --files data-import/User.json
   ```
5. Assign permissions to the agent user.
   ```
   sf org assign permset -n AFDX_Agent_Perms -b USERNAME_OF_YOUR_AGENT_USER
   ```

### STEP FOUR: Configure and deploy the `Local_Info_Agent` authoring bundle
1. Open `force-app/main/default/aiAuthoringBundles/Local_Info_Agent/Local_Info_Agent.agent`.
2. Replace the value on **Line 11** for `default_agent_user` with the username of the agent user you created in **STEP THREE**.
3. Deploy the updated agent.
   ```
   sf project deploy start -m AiAuthoringBundle:Local_Info_Agent
   ```

### STEP FIVE: Preview the agent
1. Open the Local Info Agent in Agent Builder.
   ```
   sf org open agent --api-name Local_Info_Agent
   ```
2. Use the **Preview** panel to interact with the agent. Try asking:
   - *"What's the weather like today?"* — triggers the **Apex** action
   - *"I'm interested in movies. What's showing nearby?"* — triggers the **Prompt Template** action
   - *"When does the spa open?"* — triggers the **Flow** action

## What's Inside

| Component | Type | Purpose |
|---|---|---|
| `Local_Info_Agent.agent` | Agent Script | The agent definition — topics, reasoning, variables, and flow control |
| `CheckWeather` | Apex Class | Invocable Apex. Checks current weather conditions for a given location |
| `CurrentDate` | Apex Class | Invocable Apex. Returns the current date for use by the agent |
| `WeatherService` | Apex Class | Provides mock weather data for Coral Cloud Resort |
| `Get_Event_Info` | Prompt Template | Retrieves local events in Port Aurelia |
| `Get_Resort_Hours` | Flow | Returns facility hours and reservation requirements |
| `Coral_Cloud_Agent` | Permission Set | Agent user permissions (Einstein Agent license) |
| `Coral_Cloud_Admin` | Permission Set | Admin/developer Apex class access |
| `AFDX_Agent_Perms` | Permission Set Group | Bundles agent user permissions for assignment |
| `AFDX_User_Perms` | Permission Set Group | Bundles admin user permissions for assignment |

## Learning Exercise

Open `Local_Info_Agent.agent` and look at the `local_weather` topic. Notice the pirate-themed instruction at the end of the reasoning block. Try the following:

1. Preview the agent and ask about the weather — notice the pirate-themed response.
2. Remove the pirate instruction from the Agent Script.
3. Redeploy the agent: `sf project deploy start -m AiAuthoringBundle:Local_Info_Agent`
4. Preview again and ask the same question — the response should now be in a normal tone.

This demonstrates how Agent Script reasoning instructions directly control agent behavior.
