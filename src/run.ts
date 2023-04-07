"use strict";

import { Octokit } from "octokit";
import * as path from "path";
import * as fs from "node:fs";
import { Command } from "commander";

// own modules
import { getRepository } from "./lib/gitContext";
import { Tracker } from "./lib/tracking";

function readConfig() {
  const home: string = process.env.HOME as string;
  const configFileName = path.join(home, ".github_bot.json");
  const json = fs.readFileSync(configFileName, { encoding: "utf8" });
  return JSON.parse(json);
}

const config = readConfig();

console.log(config);

const pkg = require("../package.json");
const appName = Object.keys(pkg.bin)[0];

const program = new Command();
program
  .description(pkg.description)
  .name(appName)
  .option("-c, --config <path>", "set path to configuration file")
  .version(pkg.version);

program
  .command("track")
  .description("keep track of a pull request")
  .argument("<prIdentifier>", "Pull request number or branch name")
  .action(async function (prIdentifier) {
    console.log("tracking ", prIdentifier);
    const repo = getRepository();
    const client = getClientForHost(repo.host);
    const tracker = new Tracker(client);
    await tracker.addNewPr(repo, prIdentifier);
  });

program.parseAsync();

function getClientForHost(host: string) {
  const server = config.servers.find((server: any) => server.host === host);
  if (!server) {
    throw new Error(`Cannot find configuration for host ${host}.`);
  }
  if ("token" in server) {
    return new Octokit({ auth: server.token, baseUrl: server.baseUrl });
  } else {
    throw new Error(`No token found in configuration for host ${host}.`);
  }
}
