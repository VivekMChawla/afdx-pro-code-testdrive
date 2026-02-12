//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          build-scratch-env.mjs
 * @copyright     Vivek M. Chawla - 2023
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Implements a series of CLI commands that build a scratch org environment.
 * @description   Creates a new scratch org, deploys source, and configures users and permissions
 *                for the AFDX Pro-Code Testdrive project.
 * @version       1.0.0
 * @license       BSD-3-Clause
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries & Modules
import { fs }                   from "zx";

// Import Internal Classes & Functions
import { agentUsername, alternativeBrowser, deploymentStatusPage, devOrgAlias,
         devOrgConfigFile }     from './setup.mjs';
import { TaskRunner }           from './sfdx-falcon/task-runner/index.mjs';
import { SfdxTask }             from './sfdx-falcon/task-runner/sfdx-task.mjs';
import { SfdxFalconError }      from './sfdx-falcon/error/index.mjs';
import { SfdxFalconDebug }      from './sfdx-falcon/debug/index.mjs';
import { isDuplicatePermSetAssignment }
                                from './sfdx-falcon/utilities/sfdx.mjs';

// Set the File Local Debug Namespace
const dbgNs = 'BuildScratchEnv';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);
//─────────────────────────────────────────────────────────────────────────────────────────────────┐
//─────────────────────────────────────────────────────────────────────────────────────────────────┘

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    buildScratchEnv
 * @returns     {Promise<void>}
 * @summary     Builds a scratch org-based development environment.
 * @description Creates a new scratch org, deploys project source, configures permissions,
 *              creates the agent user, and assigns agent permissions.
 * @public
 * @example
 * ```
 * await buildScratchEnv();
 * ```
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function buildScratchEnv() {

  const ctx = {};
  const tr  = TaskRunner.getInstance();
  tr.ctx    = ctx;

  //───────────────────────────────────────────────────────────────────────────────────────────────┐
  //*
  // Delete the existing scratch org (if present).
  tr.addTask(new SfdxTask(
    `Delete existing scratch org`,
    `sf org delete scratch -p -o ${devOrgAlias}`,
    {suppressErrors: true}
  ));
  //*/
  //───────────────────────────────────────────────────────────────────────────────────────────────┘
  //───────────────────────────────────────────────────────────────────────────────────────────────┐
  //*
  // Create a new DEVELOPMENT scratch org.
  tr.addTask(new SfdxTask(
    `Create new scratch org`,
    `sf org create scratch -d -a ${devOrgAlias} -f config/${devOrgConfigFile}`,
    {suppressErrors: false, renderStdioOnError: true}
  ));
  //*/
  //───────────────────────────────────────────────────────────────────────────────────────────────┘
  //───────────────────────────────────────────────────────────────────────────────────────────────┐
  //*
  // Assign Prompt Template perm sets to the scratch org user before deployment.
  // Without these, AiAuthoringBundle deployment fails validation because it can't
  // "see" the GenAiPromptTemplate metadata even though it's already in the org.
  tr.addTask(new SfdxTask(
    `Assign Prompt Template perm sets`,
    `sf org assign permset -n EinsteinGPTPromptTemplateManager -n EinsteinGPTPromptTemplateUser`,
    {suppressErrors: isDuplicatePermSetAssignment, renderStdioOnError: true}
  ));
  //*/
  //───────────────────────────────────────────────────────────────────────────────────────────────┘
  //───────────────────────────────────────────────────────────────────────────────────────────────┐
  //*
  // Open the "Deployment Status" page in the developer's non-default browser.
  tr.addTask(new SfdxTask(
    `Open the Deployment Status page`,
    `sf org open -b ${alternativeBrowser} -p ${deploymentStatusPage}`,
    {suppressErrors: false}
  ));
  //*/
  //───────────────────────────────────────────────────────────────────────────────────────────────┘
  //───────────────────────────────────────────────────────────────────────────────────────────────┐
  //*
  // Deploy project source to the new scratch org.
  tr.addTask(new SfdxTask(
    `Deploy project source`,
    `sf project deploy start`,
    {suppressErrors: false, renderStdioOnError: true}
  ));
  //*/
  //───────────────────────────────────────────────────────────────────────────────────────────────┘
  //───────────────────────────────────────────────────────────────────────────────────────────────┐
  //*
  // Query for the Einstein Agent User profile ID.
  tr.addTask(new SfdxTask(
    `Query for Einstein Agent User profile ID`,
    `sf data query -q "SELECT Id FROM Profile WHERE Name='Einstein Agent User'"`,
    {suppressErrors: false, renderStdioOnError: true,
      onSuccess: async (processPromise, ctx, task) => {
        ctx.profileId = processPromise.stdoutJson.result.records[0].Id;
        task.title = `Query for Einstein Agent User profile ID (${ctx.profileId})`;
      }
    }
  ));
  //*/
  //───────────────────────────────────────────────────────────────────────────────────────────────┘
  //───────────────────────────────────────────────────────────────────────────────────────────────┐
  //*
  // Update data-import/User.json with the profile ID and a unique username.
  tr.addTask({
    title: `Update User.json (${agentUsername})`,
    task: async (ctx, task) => {
      const userJson = fs.readJsonSync('data-import/User.json');
      userJson.records[0].ProfileId = ctx.profileId;
      userJson.records[0].Username = agentUsername;
      fs.writeJsonSync('data-import/User.json', userJson, { spaces: 4 });
    }
  });
  //*/
  //───────────────────────────────────────────────────────────────────────────────────────────────┘
  //───────────────────────────────────────────────────────────────────────────────────────────────┐
  //*
  // Create the agent user from data-import/User.json.
  tr.addTask(new SfdxTask(
    `Create agent user (${agentUsername})`,
    `sf data import tree --files data-import/User.json`,
    {suppressErrors: false, renderStdioOnError: true}
  ));
  //*/
  //───────────────────────────────────────────────────────────────────────────────────────────────┘
  //───────────────────────────────────────────────────────────────────────────────────────────────┐
  //*
  // Assign admin permissions to the current user.
  tr.addTask(new SfdxTask(
    `Assign "AFDX_User_Perms" to admin user`,
    `sf org assign permset -n AFDX_User_Perms`,
    {suppressErrors: isDuplicatePermSetAssignment, renderStdioOnError: true}
  ));
  //*/
  //───────────────────────────────────────────────────────────────────────────────────────────────┘
  //───────────────────────────────────────────────────────────────────────────────────────────────┐
  //*
  // Assign agent permissions to the agent user.
  tr.addTask(new SfdxTask(
    `Assign "AFDX_Agent_Perms" to ${agentUsername}`,
    `sf org assign permset -n AFDX_Agent_Perms -b ${agentUsername}`,
    {suppressErrors: isDuplicatePermSetAssignment, renderStdioOnError: true}
  ));
  //*/
  //───────────────────────────────────────────────────────────────────────────────────────────────┘
  // Run the tasks.
  try {
    return tr.runTasks();
  } catch (ListrRuntimeError) {
    console.error(SfdxFalconError.renderError(ListrRuntimeError));
  }
}
