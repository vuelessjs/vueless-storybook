#!/usr/bin/env node
import { extractConfig } from "./lib/config.js";
import build from "./lib/build.js";

export default async function buildWebTypes(vuelessConfig) {
  const config = await extractConfig();

  build(config, vuelessConfig);
}
