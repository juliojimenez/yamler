import { safeString } from "../src/index";

describe("index", () => {
  it("creates safe strings for github workflow output variables", () => {
    const unsafeString: string =
      "This-string.is:a valid YAML string, but we're going to make it #afe for (GitHub) [Workflow] Out+ut/Variables";
    const result: string = safeString(unsafeString);
    expect(result).toEqual(
      "this_string_is_a_valid_yaml_string_but_were_going_to_make_it_safe_for_github_workflow_output_variables"
    );
  });
});
