#!/usr/bin/env node
import minimist from "minimist";
import { extractConfig } from "./lib/config.js";
import build from "./lib/build.js";

const {
  _: pathArray,
  configFile,
  watch,
  cwd,
} = minimist(process.argv.slice(2), {
  alias: { c: "configFile", w: "watch" },
});

export default async function buildWebTypes(vuelessConfig) {
  const conf = await extractConfig(cwd || process.cwd(), watch, configFile, pathArray);

  build(conf, vuelessConfig);
}
