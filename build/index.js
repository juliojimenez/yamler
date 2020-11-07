"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __importDefault(require("@actions/core"));
const fs_1 = __importDefault(require("fs"));
const yaml_1 = __importDefault(require("yaml"));
(async () => {
  const yamlFilePath = core_1.default.getInput("yaml-file");
  const yamlFile = fs_1.default.readFileSync(yamlFilePath, "utf8");
  const yamlParse = yaml_1.default.parse(yamlFile);
  console.log(yamlParse);
})();
