import * as github from "@actions/github";
import * as exec from "@actions/exec";
import * as tc from "@actions/tool-cache";
import * as core from "@actions/core";

export function parseRef(ref: string): string {
  // refs/heads/master -> master
  // refs/tags/v0.1.0 -> v0.1.0
  const m = ref.match(/^refs\/.+?\/(.+?)$/);
  if (m) {
    return m[1];
  }
  return ref;
}

export async function downloadCage({ version }: { version: string }) {
  console.log("🥚 Installing cage...");
  const url = `https://s3-us-west-2.amazonaws.com/loilo-public/oss/canarycage/${version}/canarycage_linux_amd64.zip`;
  const zip = await tc.downloadTool(url);
  const extracted = await tc.extractZip(zip);
  const installed = await tc.cacheDir(extracted, "cage", version);
  core.addPath(installed);
  const { PATH } = process.env;
  process.env["PATH"] = PATH + ":" + installed;
  console.log(`🐣 cage has been installed at '${installed}/cage'`);
}

export function aggregateDeploymentParams({
  environment,
  ref,
  token,
  repository
}: Partial<{
  environment: string;
  ref: string;
  token: string;
  repository: string;
}>): GithubDeploymentParams {
  let missings: string[] = [];
  !environment && missings.push("--environment");
  !ref && missings.push("--github-ref");
  !token && missings.push("--github-token");
  !repository && missings.push("--github-repository");
  if (missings.length > 0) {
    throw new Error(
      `${missings.join(",")} are required if --create-deployment specified.`
    );
  }
  const [owner, repo] = repository.split("/");
  const parsedRef = parseRef(ref);
  return {
    owner,
    repo,
    ref: parsedRef,
    token,
    environment
  };
}

export type GithubDeploymentParams = {
  owner: string;
  repo: string;
  ref: string;
  environment: string;
  token: string;
};

export async function deploy({
  deployContext,
  region,
  deployment
}: {
  deployContext: string;
  region: string;
  deployment?: GithubDeploymentParams;
}) {
  let octkit: github.GitHub;
  let deployId: number | undefined;
  if (deployment) {
    octkit = new github.GitHub(deployment.token);
    const { owner, repo, ref, environment } = deployment;
    console.log("Creating deployment...", owner, repo, ref, environment);
    try {
      const { data: deploy } = await octkit.repos.createDeployment({
        owner,
        repo,
        required_contexts: [],
        ref,
        auto_merge: false,
        environment: environment
      });
      deployId = deploy.id;
      console.log(`Deployment created: ${deploy.url}`);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
  let code: number | undefined;
  try {
    console.log(`Start rolling out...`);
    if (deployId) {
      const { owner, repo } = deployment;
      await octkit.repos.createDeploymentStatus({
        owner,
        repo,
        deployment_id: deployId,
        state: "in_progress",
        headers: {
          accept: "application/vnd.github.flash-preview+json"
        }
      });
    }
    code = await exec.exec(`cage rollout --region ${region} ${deployContext}`);
  } catch (e) {
    console.error(e);
  } finally {
    if (deployId) {
      const { owner, repo } = deployment;
      if (code === 0) {
        console.log(`Updating deployment state to 'success'...`);
        await octkit.repos.createDeploymentStatus({
          owner,
          repo,
          auto_inactive: true,
          deployment_id: deployId,
          state: "success",
          headers: {
            accept:
              "application/vnd.github.ant-man-preview+json, application/vnd.github.flash-preview+json"
          }
        });
      } else {
        console.log(`Updating deployment state to 'failure'...`);
        await octkit.repos.createDeploymentStatus({
          owner,
          repo,
          deployment_id: deployId,
          state: "failure"
        });
      }
      console.log(`Deployment state updated.`);
    }
  }
}
