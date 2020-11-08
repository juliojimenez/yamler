import * as core from "@actions/core";
// import github from "@actions/github";
import fs from "fs";
import YAML from "yaml";

let parentNodes: Array<string> = [];

async function safeString(unsafeString: string): Promise<string> {
  const makeLowerCase = unsafeString.toLowerCase();
  const replaceSpacesEtc = makeLowerCase.replace(/\s|\/|-|\.|:/g, "_");
  const removeParenthesesEtc = replaceSpacesEtc.replace(/\(|\)|\[|\]/g, "");
  const replacePlus = removeParenthesesEtc.replace(/\+/g, "p");
  const replaceSharp = replacePlus.replace(/#/g, "s");
  console.log(replaceSharp);
  return replaceSharp;
}

async function traverseObject(theObject: {
  [index: string]: any;
}): Promise<boolean> {
  for (let key of Object.keys(theObject)) {
    const keyType = typeof theObject[key];
    if (keyType === "string") {
      await handleString(
        `${parentNodes.join("__")}${parentNodes.length > 0 ? "__" : ""}${key}`,
        theObject[key]
      );
    } else if (keyType === "object") {
      console.log(parentNodes);
      if (Object.keys(theObject)[0] === key) {
        parentNodes.pop();
        parentNodes.push(key);
      } else {
      }
      if (Array.isArray(theObject[key])) {
        await traverseArray(theObject[key]);
      } else {
        await traverseObject(theObject[key]);
      }
    }
  }
  return true;
}

async function traverseArray(theArray: Array<any>): Promise<boolean> {
  for (let elem of theArray) {
    const elemType = typeof elem;
    if (elemType === "string") {
      await handleString(
        `${parentNodes.join("__")}${parentNodes.length > 0 ? "__" : ""}${String(
          theArray.indexOf(elem)
        )}`,
        elem
      );
    } else if (elemType === "object") {
      console.log(parentNodes);
      if (theArray.indexOf(elem) === 0) {
        parentNodes.pop();
        parentNodes.push(String(theArray.indexOf(elem)));
      } else if (theArray.indexOf(elem) === theArray.length - 1) {
      }
      if (Array.isArray(elem)) {
        await traverseArray(elem);
      } else {
        await traverseObject(elem);
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
