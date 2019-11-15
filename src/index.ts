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

async function main() {
  try {
    const version = core.getInput("cage-version");
    const region = core.getInput("region");
    const deployContext = core.getInput("deploy-context");
    const createDeployment = boolify(core.getInput("create-deployment"));
    const environment = core.getInput("environment");
    const token = core.getInput("github-token");
    const ref = core.getInput("github-ref");
    const repository = core.getInput("github-repository");
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
      deployment
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

if (require.main === module) {
  main();
}
