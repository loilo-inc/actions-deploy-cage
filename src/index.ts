import * as core from "@actions/core";
import * as io from "@actions/io";
import {
  aggregateDeploymentParams,
  deploy,
  GithubDeploymentParams,
  downloadCage
} from "./deploy";

function boolify(s: string): boolean {
  return s !== "" && !s.match(/^(false|0|undefined|null)$/);
}

function assertInput(name: string): string {
  const v = core.getInput(name);
  if (!v) {
    throw new Error(`${name} is required`);
  }
  return v;
}

async function main() {
  const version = core.getInput("cage-version");
  const deployContext = assertInput("deploy-context");
  const region = assertInput("region");
  const createDeployment = boolify(core.getInput("create-deployment"));
  const environment = core.getInput("environment");
  const idleDuration = core.getInput("canary-task-idle-duration");
  const token = core.getInput("github-token");
  const ref = core.getInput("github-ref");
  const repository = core.getInput("github-repository");
  try {
    if (!(await io.which("cage", false))) {
      await downloadCage({ version });
    }
    let deployment: GithubDeploymentParams | undefined;
    if (createDeployment) {
      deployment = aggregateDeploymentParams({
        ref,
        repository,
        environment,
        token
      });
    }
    await deploy({
      deployContext,
      region,
      deployment,
      idleDuration,
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

if (require.main === module) {
  main();
}
