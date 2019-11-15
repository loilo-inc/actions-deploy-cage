import * as caporal from "caporal";
import {
  aggregateDeploymentParams,
  deploy,
  GithubDeploymentParams
} from "../deploy";

caporal
  .description("deploy service with cage")
  .option(
    "--deploy-context <deployContext>",
    "Directory path that contains service.json and task-definition.json",
    undefined,
    undefined,
    true
  )
  .option(
    "--create-deployment",
    "Whether to create deployment history on the repository",
    undefined,
    true
  )
  .option("--environment <environment>", "Release environment to deploy")
  .option(
    "--github-ref <githubRef>",
    "Github ref to deploy. tag or sha or branch name"
  )
  .option(
    "--github-repository <githubRepository>",
    ":owner/:repo",
    /^.+?\/.+?$/
  )
  .option(
    "--region <region>",
    "AWS region that cluster exists",
    undefined,
    undefined,
    true
  )
  .option(
    "--github-token <gitubToken>",
    "Github token to call Github API. Required if --create-deployment specified",
    caporal.STRING
  )
  .action(async (args, opts) => {
    const {
      environment,
      region,
      deployContext,
      githubRepository,
      githubToken,
      githubRef,
      createDeployment
    } = opts;
    let deployment: GithubDeploymentParams | undefined;
    if (createDeployment) {
      deployment = aggregateDeploymentParams({
        ref: githubRef,
        token: githubToken,
        repository: githubRepository,
        environment
      });
    }
    await deploy({
      region,
      deployContext,
      deployment
    });
  });

if (require.main === module) {
  caporal.parse(process.argv);
}
