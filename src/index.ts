#!/usr/bin/env node

import { Command } from 'commander';
import { getVersion } from './utilis/util.get.version';
import Initialize from './commands/command.init';
import Config from './commands/command.config';
import Start from './commands/command.start';
// import StartCommand from './StartCommand';

const program = new Command();

program.version(getVersion());

const initCommand = new Initialize(program);
const configCommand = new Config(program);
const startCommand = new Start(program);

// Configure commands
initCommand.configureCommand();
configCommand.configureCommand();
startCommand.configureCommand();

program.parse(process.argv);
