"use strict";

import child_process from "node:child_process";

//TODO: make os dependant
const GIT = "git.exe";

export type Repository = {
  host: string;
  owner: string;
  name: string;
};

export function getRepository() {
  const originUrl: string = child_process.execFileSync(
    GIT,
    ["remote", "get-url", "origin"],
    { encoding: "utf8" }
  );
  return parseRepositoryUrl(originUrl);
}

function parseRepositoryUrl(url: string): Repository {
  const parsed = new URL(url);
  const path: string = parsed.pathname;
  const [_, owner, repo] = path.split("/");

  if (!owner) {
    throw new Error(`Cannot extract owner from repository url: ${url}`);
  }
  if (!repo) {
    throw new Error(`Cannot extract repo from repository url: ${url}`);
  }

  return {
    host: parsed.host,
    owner: owner,
    name: repo,
  };
}
