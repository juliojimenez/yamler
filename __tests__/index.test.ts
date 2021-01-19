import {safeString} from "../src/index"

describe("index", () => {
  it("creates safe strings for github workflow output variables", () => {
    const unsafeString: string = "This string is a valid YAML string, but we're going to make it safe for GitHub Workflow Output Variables";
    const result: string = safeString(unsafeString);
    console.log(result);
  });
});