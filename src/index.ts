import * as core from "@actions/core";
// import github from "@actions/github";
import fs from "fs";
import YAML from "yaml";

async function safeString(unsafeString: string): Promise<string> {
  const makeLowerCase = unsafeString.toLowerCase();
  const replaceSpacesEtc = makeLowerCase.replace(/\s|\/|\-|\./g, "_");
  const removeParenthesesEtc = replaceSpacesEtc.replace(/\(|\)|\[|\]/g, "");
  const replacePlus = removeParenthesesEtc.replace(/\+/g, "p");
  console.log(replacePlus);
  return replacePlus;
}

async function traverseObject(theObject: {
  [index: string]: any;
}): Promise<boolean> {
  for (let key of Object.keys(theObject)) {
    const keyType = typeof theObject[key];
    if (keyType === "string") {
      await handleString(key, theObject[key]);
    }
    if (keyType === "object") {
      if (Array.isArray(theObject[key])) {
        core.startGroup(await safeString(key));
        await traverseArray(theObject[key]);
        core.endGroup();
      } else {
        core.startGroup(await safeString(key));
        await traverseObject(theObject[key]);
        core.endGroup();
      }
    }
  }
  return true;
}

async function traverseArray(theArray: Array<any>): Promise<boolean> {
  for (let elem of theArray) {
    const elemType = typeof elem;
    if (elemType === "string") {
      await handleString(String(theArray.findIndex(elem)), elem);
    }
    if (elemType === "object") {
      if (Array.isArray(elem)) {
        core.startGroup(await safeString(String(elem)));
        await traverseArray(elem);
        core.endGroup();
      } else {
        core.startGroup(await safeString(String(theArray.findIndex(elem))));
        await traverseObject(elem);
        core.endGroup();
      }
    }
  }
  return true;
}

async function handleString(key: string, value: string): Promise<boolean> {
  const safeKey = await safeString(key);
  core.setOutput(safeKey, value);
  return true;
}

(async () => {
  // try {
  const yamlFilePath = core.getInput("yaml-file");
  const yamlFile = fs.readFileSync(yamlFilePath, "utf8");
  const yamlParse = YAML.parse(yamlFile);
  console.log(yamlParse);
  await traverseObject(yamlParse);
  // } catch (error) {
  //   core.setFailed(error.message);
  // }
})();
