'use strict';

import * as path from 'path';
import * as fs from 'node:fs';
import { Command } from 'commander';

// own modules
import { getRepository } from './lib/gitContext';
import { Tracker } from './lib/tracking';
import { Persistence } from './lib/persistence';
import { TRACKING_LIST_DIR_NAME } from './lib/constants';
import * as github from './lib/github';
import { Reporter } from './lib/reporting';
import * as pr from './lib/pullRequests';

function readConfig() {
  const home: string = process.env.HOME as string;
  const configFileName = path.join(home, '.github_bot.json');
  const json = fs.readFileSync(configFileName, { encoding: 'utf8' });
  return JSON.parse(json);
}

const config = readConfig();

const pkg = require('../../package.json');
const appName = Object.keys(pkg.bin)[0];

const persistence = new Persistence(TRACKING_LIST_DIR_NAME);

const program = new Command();
program
  .description(pkg.description)
  .name(appName)
  .option('-c, --config <path>', 'set path to configuration file')
  .version(pkg.version);

program
  .command('track')
  .description('keep track of a pull request')
  .argument('<prIdentifier>', 'Pull request number or branch name')
  .action(async function (prIdentifier) {
    const tracker = new Tracker(persistence);
    await tracker.addNewPr(prIdentifier);
  });

program
  .command('report')
  .description('report on tracked pull requests')
  .action(async function () {
    const pullRequests = await persistence.listPullRequests();
    const fetcher = new github.PullRequestFetcher(config);
    const data = await fetcher.fetchPullRequests(pullRequests);
    const reporter = new Reporter();
    const report = reporter.compileReport(data);
    reporter.printReport(report);
  });

program
  .command('bump')
  .description('update the timestamp of a tracked pull request')
  .argument('<prIndex>', 'Index number of the tracked pull request')
  .action(async function (pullIndex: string) {
    const pullRequests = await persistence.listPullRequests();
    const pullIndexParsed = parseInt(pullIndex);
    if (isNaN(pullIndexParsed)) {
      console.error('argument %s is not a number', pullIndex);
      process.exitCode = 1;
      return;
    }
    const toBump: pr.TrackingInfo | undefined = pullRequests.find(
      (pull) => pull.number === pullIndexParsed
    );
    if (!toBump) {
      console.error(
        'No pull request with index %d is currently tracked',
        pullIndexParsed
      );
      process.exitCode = 1;
      return;
    }
    persistence.persistPullRequest(toBump);
  });

program.parseAsync();
