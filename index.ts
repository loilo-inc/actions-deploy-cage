import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as io from "@actions/io";
import { deploy } from "./deploy";
export async function downloadCage({ version }: { version: string }) {
  console.log("🥚 Installing cage...");
  const url = `https://s3-us-west-2.amazonaws.com/loilo-public/oss/canarycage/${version}/canarycage_linux_amd64.zip`;
  const zip = await tc.downloadTool(url);
  const extracted = await tc.extractZip(zip);
  const installed = await tc.cacheDir(extracted, "cage", version);
  core.addPath(installed);
  console.log(`🐣 cage has been installed at '${installed}/cage'`);
}

async function main() {
  try {
    const version = core.getInput("cage-version");
    const region = core.getInput("region");
    const deployContext = core.getInput("deploy-context");
    const createDeployment = boolify(core.getInput("create-deployment"));
    const environment = core.getInput("environment");
    const githubToken = core.getInput("github-token");
    const setupOnly = core.getInput("setup-only");
    const repository = core.getInput("github-repository");
    if (!io.which("cage", false)) {
      await downloadCage({ version });
    }
    if (!setupOnly) {
      const [owner, repo] = repository.split("/");
      const {GITHUB_SHA, GITHUB_REF} = process.env;

      deploy({
        deployContext,
        createDeployment,
        owner,
        repo,
        environment,
        githubToken,
        region,
      });
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

if (require.main === module) {
  main();
}

function boolify(s: string):boolean {
  return s !== "" && !s.match(/^(false|0|undefined|null)$/)
}