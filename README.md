# AFDX Pro-Code Testdrive

## How to Set Up a Testdrive Environment

### STEP ONE: Get a Developer Edition org
1. Sign up for a Developer Edition account at [developer.salesforce.com/signup](https://developer.salesforce.com/signup).
2. Once you have a DE org, enable the following features **IN ORDER**
   - **Knowledge** *(Setup > Knowledge > Knowledge Settings)*
   - **Data Cloud** *(Setup > Data Cloud > Data Cloud Setup Home)*
     ![Data Cloud setup can take up to 30-60 minutes to complete. DO NOT proceed until the setup process is finished.](images/data-cloud-setup.png)
   - **Einstein** *(Setup > Einstein > Einstein Generative AI > Einstein Setup)*
     - Reload your browser tab after enabling Einstein so Agentforce becomes available in your Setup tree.
   - **Agentforce** *(Setup > Einstein > Einstein Generative AI > Agentforce Studio > Agentforce Agents)*

### STEP TWO: Deploy the Testdrive sample code
1. Clone this repo.
   ```
   git clone https://github.com/VivekMChawla/afdx-pro-code-testdrive.git
   ```
2. Navigagte into the cloned Test Drive folder.
   ```   
   cd afdx-pro-code-testdrive
   ```
3. Authenticate the Salesforce CLI to your DE org.
   ```
   sf org login web -s -a AFDX-Pro-Code-Testdrive
   ```
3. Deploy everything *except* agents.
   ```
   sf project deploy start --manifest manifests/EverythingExceptAgents.package.xml
   ```
3. Deploy agents.
   ```
   sf project deploy start --manifest manifests/Agents.package.xml
   ```
4. Deploy agent tests.
   ```
   sf project deploy start --manifest manifests/AgentTests.package.xml
   ```
3. Open the Test Drive folder in VS Code.
   ```   
   code .
   ```

### STEP THREE: Configure the AFDX TestDrive Agent User
1. Get the ID of the **Einstein Agent User** profile in your org.
   ```
   sf data query -q "SELECT Id FROM Profile WHERE Name='Einstein Agent User'"
   ```
2. Update `data-import/User.json` as follows:
   ![Update line 8 with the Einstein Agent User profile ID from the previous step. Update line 9 with something unique to you to ensure a globally unique username is specified.](images/agent-user-data-import.png)

3. Create the AFDX TestDrive Agent user with the CLI.
   ```
   sf data import tree --files data-import/User.json
   ```
4. Assign permissions to the AFDX TestDrive Agent user with the CLI.
   ```
   sf org assign permset -n AFDX_Service_Agent_Perms -b USERNAME_OF_YOUR_AFDX_TESTDRIVE_AGENT
   ```

### STEP FOUR: Configure the next-gen **Local Info Agent**
1. Open the `Local_Info_Agent_NGA.agent` file, located in `force-app/main/default/aiAuthoringBundles/Local_Info_Agent_NGA`.

2. Go to **Line 9** and replace the value for `default_agent_user` with the user you created in **STEP THREE**.

3. Deploy the updated `Local_Info_Agent_NGA` authoring bundle.
   ```
   sf project deploy start -m AiAuthoringBundle:Local_Info_Agent_NGA
   ```

### STEP FIVE: Configure the classic **Local Info Agent**
1. Open the `Local_Info_Agent` in Agent Builder.
```
sf org open agent --api-name Local_Info_Agent
```
2. Open the settings and set **Agent User** to your AFDX TestDrive Agent user.

   ![Click the Settings button near the top-right of Agent Builder, then set the Agent User to your AFDX TestDrive user and click "Save"](images/set-local-info-agent-user.png)

3. Open the **Connections** tab and create a new API connection using the `Agent_Preview` Connected App.

   ![Open the Connections tab, then click the Add button at the bottom right of the page.](images/add-api-agent-connection.png)
   ![Create a new API connection called "CLI Agent Preview" and use the "Agent Preview" connected app.](images/agent-external-app-settings.png)

4. Activate the agent by clicking "Activate" near the top-right of Agent Builder. If prompted, you can safely ignore the configuration issues and proceed with activation.

   ![Click the Activate button near the top-right of Agent Builder](images/agent-activation.png)
   ![Ignore the activation issues](images/ignore-activation-issues.png)


### STEP SIX: Add a JWT-based auth token to your login
1. Edit the policies of the `Agent_Preview` Connected App to ensure that JWT-based access tokens are issued.
   ![Update the JWT-based token settings at the bottom of the "edit policies" page](images/set-jwt-based-token-policy.png)
2. Retrieve the `Agent_Preview` Connected App from your org.
   ```
   sf project retrieve start -m ConnectedApp:Agent_Preview
   ```
3. Copy the `consumerKey` from line 8 of `Agent_Preview.connectedApp-meta.xml`
   ![ONLY copy the part of the key that's between the two consumerKey tags.](images/consumer-key-copy.png)
4. Link the `Agent_Preview` connected app to your authenticated user.
   **IMPORTANT:** When asked for the client secret, just press **ENTER** since it's not required.
   ```
   sf org login web --client-app AgentPreview --username YOUR_USERNAME --client-id PASTE_CONSUMER_KEY_FROM_AGENT_PREVIEW_CONNECTED_APP --scopes "sfap_api chatbot_api refresh_token api web"
   ```
7. Confirm everything was set up correctly by previewing the Local Info Agent from the CLI.
   ```
   sf agent preview -c AgentPreview
   ```
---

## Things You Should Try After Setting Up Your Org

### Generate a new Agent Spec
```
sf agent generate agent-spec
```
### Generate a new Agent Spec from an existing Agent Spec.
```
sf agent generate agent-spec --spec specs/Local_Info_Agent-partialAgentSpec.yaml 
```
### Generate a new Authoring Bundle using an Agent Spec.
```
sf agent generate authoring-bundle --name "My First NGA Agent"
```
### Delete an Agent and related metadata
```
sf project delete source -m Agent:My_First_NGA_Agent  
```
### Run an Agent Test from the CLI
```
sf agent test run --api-name Local_Info_Agent_Test --wait 5
```
### Generate an Agent Test Spec from an `AiEvaluationDefinition` metadata XML file
```
 sf agent generate test-spec --from-definition PATH/TO/YOUR/TEST.aiEvaluationDefinition-meta.xml
```
