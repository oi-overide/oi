#!/usr/bin/env node

// import { Command } from 'commander';
// import Initialize from './commands/initialize';
// import { InitializeOption } from './interfaces/interfaces';
// // import Start from './commands/start';
// // import Config from './commands/config';

// // Initialize commander
// const program = new Command();

// program
//   .command('init')
//   .description('Initialize a new project')
//   .option('-i, --ignore <files...>', 'Specify files or directories to ignore')
//   .option('-v, --verbose', 'Enable verbose output')
//   .option('-n, --project-name <name>', 'Specify a project name')
//   .action((options: InitializeOption) => {
//     Initialize.initializeProject(options);
//   });

// // Uncomment and adjust the following sections as needed
// // program
// //   .command('start')
// //   .description('Start watching files')
// //   .option('-v, --verbose', 'Enable verbose output')
// //   .action((options: StartOption) => {
// //     console.log('Oi is looking for prompts...');
// //     Start.startWatch(options);
// //   });

// // program
// //   .command('config')
// //   .description('Update project settings in oi-config.json')
// //   .option('-n, --project-name <name>', 'Update project name')
// //   .option('-i, --ignore <files...>', 'Specify files or directories to ignore')
// //   .option('-g, --global', 'Set global variable like API keys and org IDs')
// //   .option('-sa, --set-active', 'Set active')
// //   .action(async (options: ConfigOption) => {
// //     Config.config(options);
// //   });

// program.parse(process.argv);


// index.ts

import { Command } from 'commander';
import Initialize from './commands/command.init';
import Config from './commands/command.config';
import Start from './commands/command.start';
// import StartCommand from './StartCommand';

const program = new Command();

const initCommand = new Initialize(program);
const configCommand = new Config(program);
const startCommand = new Start(program);

// Configure commands
initCommand.configureCommand();
configCommand.configureCommand();
startCommand.configureCommand();

program.parse(process.argv);
