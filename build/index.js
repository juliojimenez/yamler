"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.traverseArray = exports.traverseObject = exports.safeString = void 0;
const core = __importStar(require("@actions/core"));
const fs_1 = __importDefault(require("fs"));
const yaml_1 = __importDefault(require("yaml"));
let parentNodes = [];
function safeString(unsafeString) {
    const makeLowerCase = unsafeString.toLowerCase();
    const replaceSpacesEtc = makeLowerCase.replace(/\s|\/|-|\.|:/g, "_");
    const removeParenthesesEtc = replaceSpacesEtc.replace(/\(|\)|\[|\]|'|,/g, "");
    const replacePlus = removeParenthesesEtc.replace(/\+/g, "p");
    const replaceSharp = replacePlus.replace(/#/g, "s");
    return replaceSharp;
}
exports.safeString = safeString;
function traverseObject(theObject) {
    for (let key of Object.keys(theObject)) {
        const keyType = typeof theObject[key];
        if (keyType === "string" ||
            keyType === "number" ||
            keyType === "boolean" ||
            keyType === "bigint") {
            const keyString = safeString(`${parentNodes.join("__")}${parentNodes.length > 0 ? "__" : ""}${key}`);
            console.log(keyString);
            handleString(keyString, theObject[key]);
        }
        else if (keyType === "object") {
            parentNodes.push(safeString(key));
            if (Array.isArray(theObject[key])) {
                traverseArray(theObject[key]);
            }
            else {
                traverseObject(theObject[key]);
            }
            parentNodes.pop();
        }
    }
    return true;
}
exports.traverseObject = traverseObject;
function traverseArray(theArray) {
    for (let elem of theArray) {
        const elemType = typeof elem;
        if (elemType === "string" ||
            elemType === "number" ||
            elemType === "boolean" ||
            elemType === "bigint") {
            const keyString = safeString(`${parentNodes.join("__")}${parentNodes.length > 0 ? "__" : ""}${String(theArray.indexOf(elem))}`);
            console.log(keyString);
            handleString(keyString, elem);
        }
        else if (elemType === "object") {
            parentNodes.push(String(theArray.indexOf(elem)));
            if (Array.isArray(elem)) {
                traverseArray(elem);
            }
            else {
                traverseObject(elem);
            }
            parentNodes.pop();
        }
    }
    return true;
}
exports.traverseArray = traverseArray;
function handleString(key, value) {
    core.setOutput(key, value);
    return true;
}
(async () => {
    try {
        const yamlFilePath = core.getInput("yaml-file");
        const yamlFile = fs_1.default.readFileSync(yamlFilePath, "utf8");
        const yamlParse = yaml_1.default.parse(yamlFile);
        console.log(`***** Output Variables *****`);
        traverseObject(yamlParse);
    }
    catch (error) {
        core.setFailed(`This just happened: ${error.message}`);
    }
})();
