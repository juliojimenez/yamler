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
async function safeString(unsafeString) {
  const makeLowerCase = unsafeString.toLowerCase();
  const replaceSpacesEtc = makeLowerCase.replace(/\s|\/|\-|\./g, "_");
  const removeParenthesesEtc = replaceSpacesEtc.replace(/\(|\)|\[|\]/g, "");
  const replacePlus = removeParenthesesEtc.replace(/\+/g, "p");
  return replacePlus;
}
async function traverseObject(theObject) {
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
async function traverseArray(theArray) {
  for (let elem of theArray) {
    console.log(elem);
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
async function handleString(key, value) {
  const safeKey = await safeString(key);
  core.setOutput(safeKey, value);
  return true;
}
(async () => {
  const yamlFilePath = core.getInput("yaml-file");
  const yamlFile = fs_1.default.readFileSync(yamlFilePath, "utf8");
  const yamlParse = yaml_1.default.parse(yamlFile);
  console.log(yamlParse);
  await traverseObject(yamlParse);
})();
