import * as core from "@actions/core";
import * as deploy from "../deploy";
import { main } from "..";

describe("index", () => {
  const input = (key: string, value: string) => {
    jest.spyOn(core, "getInput").mockImplementationOnce((name: string) => {
      expect(name).toBe(key);
      return value;
    });
  };
  test("basic", async () => {
    input("deploy-context", ".");
    input("region", "us-west-2");
    input("create-deployment", "true");
    input("environment", "production");
    input("canary-task-idle-duration", "10");
    input("update-service", "true");
    input("cage-options", "--foo 'bar' --baz");
    input("github-token", "token");
    input("github-ref", "refs/heads/main");
    input("github-repository", "owner/repo");
    const deploySpy = jest.spyOn(deploy, "deploy").mockResolvedValueOnce();
    await main();
    expect(deploySpy).toHaveBeenCalledWith({
      deployment: {
        environment: "production",
        ref: "main",
        owner: "owner",
        repo: "repo",
        token: "token",
      },
      args: [
        "--region",
        "us-west-2",
        "--canary-task-idle-duration",
        "10",
        "--update-service",
        "--foo",
        "bar",
        "--baz",
        ".",
      ],
    });
  });
  test("minimal", async () => {
    input("deploy-context", ".");
    input("region", "us-west-2");
    const deploySpy = jest.spyOn(deploy, "deploy").mockResolvedValueOnce();
    await main();
    expect(deploySpy).toHaveBeenCalledWith({
      deployment: undefined,
      args: ["--region", "us-west-2", "."],
    });
  });
});
