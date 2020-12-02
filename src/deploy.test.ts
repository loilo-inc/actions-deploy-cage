import {getLatestVersion, parseRef} from "./deploy";
import * as nock from "nock"
describe("deploy", () => {
  test("parseRef", () => {
    expect(parseRef("refs/heads/master")).toBe("master");
    expect(parseRef("refs/tags/v0.1.0")).toBe("v0.1.0");
  });
  describe("getLatestVersions", () => {
    test("basic", async () => {
      nock("https://api.github.com")
        .get("/repos/loilo-inc/canarycage/releases")
        .reply(200, [{tag_name: "1.0.0"}, {tag_name: "2.0.0"}, {tag_name: "0-0"}])
      const latest = await getLatestVersion()
      expect(latest).toBe("2.0.0")
    })
    test("should throw if status is not 200", async () => {
      nock("https://api.github.com")
        .get("/repos/loilo-inc/canarycage/releases")
        .reply(500, {})
      await expect(getLatestVersion()).rejects.toThrowError(Error)
    })
  })
});
