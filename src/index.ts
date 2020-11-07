import * as core from "@actions/core";
// import github from "@actions/github";
import fs from "fs";
import YAML from "yaml";

async function safeString(unsafeString: string): Promise<string> {
  const makeLowerCase = unsafeString.toLowerCase();
  const replaceSpaces = makeLowerCase.replace(/\S/g, "_");
  console.log(replaceSpaces);
  return replaceSpaces;
}

(async () => {
  // try {
  const yamlFilePath = core.getInput("yaml-file");
  const yamlFile = fs.readFileSync(yamlFilePath, "utf8");
  const yamlParse = YAML.parse(yamlFile);
  for (let key of Object.keys(yamlParse)) {
    console.log(key);
    const keyType = typeof yamlParse[key];
    if (keyType === "string") {
      const safeKey = await safeString(key);
      core.setOutput(safeKey, yamlParse[key]);
    }
  }
  console.log(yamlParse);
  // const time = (new Date()).toTimeString();
  // core.setOutput("time", time);
  // // Get the JSON webhook payload for the event that triggered the workflow
  // const payload = JSON.stringify(github.context.payload, undefined, 2)
  // console.log(`The event payload: ${payload}`);
  // } catch (error) {
  //   core.setFailed(error.message);
  // }
})();
