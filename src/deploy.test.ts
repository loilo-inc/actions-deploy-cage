import { parseRef } from "./deploy";

describe("deploy", () => {
  test("parseRef", () => {
    expect(parseRef("refs/heads/master")).toBe("master");
    expect(parseRef("refs/tags/v0.1.0")).toBe("v0.1.0");
  });
});
