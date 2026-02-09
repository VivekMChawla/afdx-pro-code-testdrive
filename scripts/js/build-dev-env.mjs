//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          sfdx-falcon/build-dev-env.mjs
 * @copyright     Vivek M. Chawla - 2023
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Implements a series of CLI commands that build the DEV environment for this project.
 * @description   When an SFDX Toolbelt users seclect the option to build a DEV environment, the 
 *                `buildDevEnv()` function is called to perform the teardown/setup actions.
 * @version       1.0.0
 * @license       BSD-3-Clause
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries & Modules
import { fs }                   from "zx";

// Import Internal Classes & Functions
import { agentUsername, alternativeBrowser, deploymentStatusPage, devOrgAlias,
         devOrgConfigFile }     from './toolbelt.mjs';
import { TaskRunner }           from './sfdx-falcon/task-runner/index.mjs';
import { SfdxTask }             from './sfdx-falcon/task-runner/sfdx-task.mjs';
import { SfdxFalconError }      from './sfdx-falcon/error/index.mjs';
import { SfdxFalconDebug }      from './sfdx-falcon/debug/index.mjs';

// Set the File Local Debug Namespace
const dbgNs = 'BuildDevEnv';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);
//─────────────────────────────────────────────────────────────────────────────────────────────────┐
//─────────────────────────────────────────────────────────────────────────────────────────────────┘

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    buildDevEnv
 * @returns     {Promise<void>} 
 * @summary     Builds a scratch org-based development environment.
 * @description Executes multiple Salesforce CLI commands which typically include deleting the 
 *              previous dev scratch org, creating a new scratch org, installing package
 *              dependencies, pushing source, loading test data, and performing any other post
 *              deploy/install configuration changes required by developers.
 * @public
 * @example
 * ```
 * await buildDevEnv();
 * ```
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function buildDevEnv() {

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
  // Open the "Deployment Status" page in the developer's non-default browser.
  tr.addTask(new SfdxTask(
    `Open the Deployment Status page`,
    `sf org open -b ${alternativeBrowser} -p ${deploymentStatusPage}`,
    {suppressErrors: false}
  ));
  //*/
  //───────────────────────────────────────────────────────────────────────────────────────────────┘
  //───────────────────────────────────────────────────────────────────────────────────────────────┐
  /*
  // Install package dependendencies in the new scratch org.
  //
  //
  // TODO: Add implementation
  //
  //
  //*/
  //───────────────────────────────────────────────────────────────────────────────────────────────┘
  //───────────────────────────────────────────────────────────────────────────────────────────────┐
  //*
  // Deploy project source to the new scratch org.
  tr.addTask(new SfdxTask(
    `Deploy project source`,
    `sf project deploy start`,
    {suppressErrors: false, renderStdioOnError: false}
  ));
  //*/
  //───────────────────────────────────────────────────────────────────────────────────────────────┘
  //───────────────────────────────────────────────────────────────────────────────────────────────┐
  //*
  // Assign admin permissions to the current user.
  tr.addTask(new SfdxTask(
    `Assign "AFDX_User_Perms" to admin user`,
    `sf org assign permset -n AFDX_User_Perms`,
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
  // Assign agent permissions to the agent user.
  tr.addTask(new SfdxTask(
    `Assign "AFDX_Agent_Perms" to ${agentUsername}`,
    `sf org assign permset -n AFDX_Agent_Perms -b ${agentUsername}`,
    {suppressErrors: false, renderStdioOnError: true}
  ));
  //*/
  //───────────────────────────────────────────────────────────────────────────────────────────────┘
  //───────────────────────────────────────────────────────────────────────────────────────────────┐
  /* // Uncomment this if you disabled the "Open the Deployment Status page" task above.
  // Open the new scratch org in the developer's non-default browser.
  tr.addTask(new SfdxTask(
    `Open the new scratch org`,
    `sf org open -b ${alternativeBrowser}`,
    {suppressErrors: true}
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
