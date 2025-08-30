#!/usr/bin/env node
import { extractConfig } from "./lib/config.js";
import build from "./lib/build.js";

export async function buildWebTypes(vuelessConfig, srcDir) {
  const config = await extractConfig();

  build(config, vuelessConfig, srcDir);
}
