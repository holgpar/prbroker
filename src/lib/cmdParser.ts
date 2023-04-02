'use strict'

import { Command } from 'commander'
import { parseArgs } from 'node:util'

const pkg = require('../package.json');
const appName = Object.keys(pkg.bin)[0];

export const program = new Command()
program
    .description(pkg.description)
    .name(appName)
    .option('-c, --config <path>', 'set path to configuration file')
    .version(pkg.version)
    .parse(process.argv);

program.command('track')
    .description('keep track of a pull request')

program.parse();


