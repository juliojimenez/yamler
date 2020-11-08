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
  return replaceSharp;
}

async function traverseObject(theObject: {
  [index: string]: any;
}): Promise<boolean> {
  for (let key of Object.keys(theObject)) {
    const keyType = typeof theObject[key];
    if (keyType === "string") {
      const keyString: string = await safeString(
        `${parentNodes.join("__")}${parentNodes.length > 0 ? "__" : ""}${key}`
      );
      console.log(keyString);
      await handleString(keyString, theObject[key]);
    } else if (keyType === "object") {
      parentNodes.push(await safeString(key));
      if (Array.isArray(theObject[key])) {
        await traverseArray(theObject[key]);
      } else {
        await traverseObject(theObject[key]);
      }
      parentNodes.pop();
    }
  }
  return true;
}

async function traverseArray(theArray: Array<any>): Promise<boolean> {
  for (let elem of theArray) {
    const elemType = typeof elem;
    if (elemType === "string") {
      const keyString: string = await safeString(
        `${parentNodes.join("__")}${parentNodes.length > 0 ? "__" : ""}${String(
          theArray.indexOf(elem)
        )}`
      );
      console.log(keyString);
      await handleString(keyString, elem);
    } else if (elemType === "object") {
      parentNodes.push(String(theArray.indexOf(elem)));
      if (Array.isArray(elem)) {
        await traverseArray(elem);
      } else {
        await traverseObject(elem);
      }
      parentNodes.pop();
    }
  }
  return true;
}

async function handleString(key: string, value: string): Promise<boolean> {
  core.setOutput(key, value);
  return true;
}

(async () => {
  // try {
  const yamlFilePath = core.getInput("yaml-file");
  const yamlFile = fs.readFileSync(yamlFilePath, "utf8");
  const yamlParse = YAML.parse(yamlFile);
  console.log(yamlParse);
  console.log(`***** Output Variables *****`);
  await traverseObject(yamlParse);
  // } catch (error) {
  //   core.setFailed(error.message);
  // }
})();
