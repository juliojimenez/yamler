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

async function traverseObject(
  theObject: {
    [index: string]: any;
  },
  parents: Array<string>
): Promise<boolean> {
  for (let key of Object.keys(theObject)) {
    const keyType = typeof theObject[key];
    if (keyType === "string") {
      await handleString(`${parents.join("__")}${key}`, theObject[key]);
    }
    if (keyType === "object") {
      parents.push(key);
      if (Array.isArray(theObject[key])) {
        await traverseArray(theObject[key], parents);
      } else {
        await traverseObject(theObject[key], parents);
      }
    }
  }
  return true;
}

async function traverseArray(
  theArray: Array<any>,
  parents: Array<string>
): Promise<boolean> {
  for (let elem of theArray) {
    console.log(elem);
    const elemType = typeof elem;
    if (elemType === "string") {
      await handleString(
        `${parents.join("__")}${String(theArray.indexOf(elem))}`,
        elem
      );
    }
    if (elemType === "object") {
      parents.push(String(theArray.indexOf(elem)));
      if (Array.isArray(elem)) {
        await traverseArray(elem, parents);
      } else {
        await traverseObject(elem, parents);
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
  await traverseObject(yamlParse, []);
  // } catch (error) {
  //   core.setFailed(error.message);
  // }
})();
