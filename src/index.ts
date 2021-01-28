import * as core from "@actions/core";
// import github from "@actions/github";
import fs from "fs";
import YAML from "yaml";

let parentNodes: Array<string> = [];

export function safeString(unsafeString: string): string {
  const makeLowerCase = unsafeString.toLowerCase();
  /*
    Replace whitespace OR / OR - OR . OR : WITH _
  */
  const replaceSpacesEtc = makeLowerCase.replace(/\s|\/|-|\.|:/g, "_");
  /*
    Replace ( OR ) OR [ OR ] OR ' OR , WITH ""
  */
  const removeParenthesesEtc = replaceSpacesEtc.replace(/\(|\)|\[|\]|'|,/g, "");
  /*
    Replace + WITH p
  */
  const replacePlus = removeParenthesesEtc.replace(/\+/g, "p");
  /*
    Replace # WITH s
  */
  const replaceSharp = replacePlus.replace(/#/g, "s");
  return replaceSharp;
}

export function traverseObject(theObject: { [index: string]: any }): boolean {
  for (let key of Object.keys(theObject)) {
    const keyType = typeof theObject[key];
    if (
      keyType === "string" ||
      keyType === "number" ||
      keyType === "boolean" ||
      keyType === "bigint"
    ) {
      const keyString: string = safeString(
        `${parentNodes.join("__")}${parentNodes.length > 0 ? "__" : ""}${key}`
      );
      console.log(keyString);
      handleString(keyString, theObject[key]);
    } else if (keyType === "object") {
      parentNodes.push(safeString(key));
      if (Array.isArray(theObject[key])) {
        traverseArray(theObject[key]);
      } else {
        traverseObject(theObject[key]);
      }
      parentNodes.pop();
    }
  }
  return true;
}

export function traverseArray(theArray: Array<any>): boolean {
  for (let elem of theArray) {
    const elemType = typeof elem;
    if (
      elemType === "string" ||
      elemType === "number" ||
      elemType === "boolean" ||
      elemType === "bigint"
    ) {
      const keyString: string = safeString(
        `${parentNodes.join("__")}${parentNodes.length > 0 ? "__" : ""}${String(
          theArray.indexOf(elem)
        )}`
      );
      console.log(keyString);
      handleString(keyString, elem);
    } else if (elemType === "object") {
      parentNodes.push(String(theArray.indexOf(elem)));
      if (Array.isArray(elem)) {
        traverseArray(elem);
      } else {
        traverseObject(elem);
      }
      parentNodes.pop();
    }
  }
  return true;
}

function handleString(key: string, value: string): boolean {
  core.setOutput(key, value);
  return true;
}

(async () => {
  try {
    const yamlFilePath = core.getInput("yaml-file");
    const yamlFile = fs.readFileSync(yamlFilePath, "utf8");
    const yamlParse = YAML.parse(yamlFile);
    console.log(`***** Output Variables *****`);
    traverseObject(yamlParse);
  } catch (error) {
    core.setFailed(`This just happened: ${error.message}`);
  }
})();
