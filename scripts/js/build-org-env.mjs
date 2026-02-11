//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          build-org-env.mjs
 * @copyright     Vivek M. Chawla - 2023
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Implements a series of CLI commands that set up an existing org for this project.
 * @description   Deploys source and configures users and permissions for the AFDX Pro-Code
 *                Testdrive project in an existing org (DE, sandbox, etc.).
 * @version       1.0.0
 * @license       BSD-3-Clause
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries & Modules
import { fs }                   from "zx";

// Import Internal Classes & Functions
import { agentUsername }        from './setup.mjs';
import { TaskRunner }           from './sfdx-falcon/task-runner/index.mjs';
import { SfdxTask }             from './sfdx-falcon/task-runner/sfdx-task.mjs';
import { SfdxFalconError }      from './sfdx-falcon/error/index.mjs';
import { SfdxFalconDebug }      from './sfdx-falcon/debug/index.mjs';

// Set the File Local Debug Namespace
const dbgNs = 'BuildOrgEnv';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);
//─────────────────────────────────────────────────────────────────────────────────────────────────┐
//─────────────────────────────────────────────────────────────────────────────────────────────────┘

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    buildOrgEnv
 * @returns     {Promise<void>}
 * @summary     Sets up an existing org for the AFDX Pro-Code Testdrive project.
 * @description Deploys project source using the manifest, configures permissions,
 *              creates the agent user, and assigns agent permissions.
 * @public
 * @example
 * ```
 * await buildOrgEnv();
 * ```
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function buildOrgEnv() {

  const ctx = {};
  const tr  = TaskRunner.getInstance();
  tr.ctx    = ctx;

  //───────────────────────────────────────────────────────────────────────────────────────────────┐
  //*
  // Deploy project source to the org using the manifest.
  tr.addTask(new SfdxTask(
    `Deploy project source`,
    `sf project deploy start --manifest manifests/Deploy.package.xml`,
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

  // Run the tasks.
  try {
    return tr.runTasks();
  } catch (ListrRuntimeError) {
    console.error(SfdxFalconError.renderError(ListrRuntimeError));
  }
}
