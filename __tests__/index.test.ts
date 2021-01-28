import { safeString, traverseObject } from "../src/index";
import fs from "fs";
import YAML from "yaml";

describe("index", () => {
  it("creates safe strings for github workflow output variables", () => {
    const unsafeString: string =
      "This-string.is:a valid YAML string, but we're going to make it #afe for (GitHub) [Workflow] Out+ut/Variables";
    const result: string = safeString(unsafeString);
    expect(result).toEqual(
      "this_string_is_a_valid_yaml_string_but_were_going_to_make_it_safe_for_github_workflow_output_variables"
    );
  });
  it("traverses an object", () => {
    const yamlFile = fs.readFileSync("__tests__/traverseobject.yaml", "utf8");
    const yamlParse = YAML.parse(yamlFile);
    console.log(`***** Output Variables *****`);
    const result = traverseObject(yamlParse);
    expect(result).toBeTruthy();
  });
});
