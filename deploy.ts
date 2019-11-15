import * as OctoKit from "@octokit/rest";
import * as exec from "@actions/exec"
import * as path from "path";
import * as caporal from "caporal";

export async function deploy({
  deployContext,
  environment,
  region,
  owner,
  repo,
  ref,
  githubToken,
  createDeployment
}: {
  deployContext: string;
  region: string;
  owner: string;
  repo: string;
  ref: string;
  environment?: string;
  githubToken?: string;
  createDeployment: boolean;
}) {
  console.log(
    `Preparing for deployment: context=${deployContext} environment=${environment} ref=${ref}`
  );
  if (createDeployment && !githubToken) {
    throw new Error(
      "--github-tokenは--create-deploymentを指定した場合必須です"
    );
  }
  const octkit = new OctoKit({
    auth: `token ${githubToken}`
  });
  let deployId: number | undefined;
  if (createDeployment) {
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
  console.log(`Start rolling out...`);
  await exec.exec(`cage rollout --region ${region} ${deployContext}`);
}

caporal
  .description("サービスをデプロイする")
  .option(
    "--service <service>",
    "service to deploy",
    /^lns-share|lns-web$/,
    null,
    true
  )
  .option(
    "--environment <environment>",
    "リリースステージ",
    /^development|staging|production$/,
    undefined,
    true
  )
  .option(
    "--create-deployment",
    "Githubにデプロイメント履歴を作成するか",
    undefined,
    true
  )
  .option(
    "--github-token <gitubToken>",
    "Github APIを呼ぶためのtoken。--create-deploymentを指定した場合は必須",
    caporal.STRING
  )
  .action(async (args, opts) => {
    const {
      service,
      environment,
      githubToken,
      imageTag,
      appVersion,
      createDeployment
    } = opts;
    await deploy({
      service,
      createDeployment,
      githubToken,
      imageTag,
      appVersion,
      environment
    });
  });

if (require.main === module) {
  caporal.parse(process.argv);
}
