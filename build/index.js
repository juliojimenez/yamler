"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k];
          },
        });
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const fs_1 = __importDefault(require("fs"));
const yaml_1 = __importDefault(require("yaml"));
let parentNodes = [];
async function safeString(unsafeString) {
  const makeLowerCase = unsafeString.toLowerCase();
  const replaceSpacesEtc = makeLowerCase.replace(/\s|\/|-|\.|:/g, "_");
  const removeParenthesesEtc = replaceSpacesEtc.replace(/\(|\)|\[|\]/g, "");
  const replacePlus = removeParenthesesEtc.replace(/\+/g, "p");
  const replaceSharp = replacePlus.replace(/#/g, "s");
  return replaceSharp;
}
async function traverseObject(theObject) {
  for (let key of Object.keys(theObject)) {
    const keyType = typeof theObject[key];
    if (keyType === "string") {
      const keyString = await safeString(
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
async function traverseArray(theArray) {
  for (let elem of theArray) {
    const elemType = typeof elem;
    if (elemType === "string") {
      const keyString = await safeString(
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
async function handleString(key, value) {
  core.setOutput(key, value);
  return true;
}
(async () => {
  const yamlFilePath = core.getInput("yaml-file");
  const yamlFile = fs_1.default.readFileSync(yamlFilePath, "utf8");
  const yamlParse = yaml_1.default.parse(yamlFile);
  console.log(yamlParse);
  console.log(`***** Output Variables *****`);
  await traverseObject(yamlParse);
})();
