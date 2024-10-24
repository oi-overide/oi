#!/usr/bin/env node
const { Command } = require('commander');

const Initialize = require('./commands/initialize');
const Start = require('./commands/start');
const Config = require('./commands/config');  // Import addIgnoreFiles here

// Init commander
const program = new Command();

program
  .command('init')
  .description('Initialize a new project')
  .option('-o, --output <path>', 'Specify a custom configuration file path')
  .option('-i, --ignore <files...>', 'Specify files or directories to ignore')
  .option('-v, --verbose', 'Enable verbose output')
  .option('-n, --project-name <name>', 'Specify a project name')
  .action((options) => {
    Initialize.initializeProject(options);
  });

program
  .command('start')
  .description('Start watching files and upload them to Ollama')
  .option('-v, --verbose', 'Enable verbose output')
  .action((options) => {
    console.log('Oi is looking for prompts...');
    Start.startWatch(options);
  });

program
  .command('config')
  .description('Update project settings in oi-config.json')
  .option('-n, --project-name <name>', 'Update project name')
  .option('-i, --ignore <files...>', 'Specify files or directories to ignore')  // Add the ignore option here
  .option('-g, --global', 'Set global variable like api keys and org ids')  // Add the ignore option here
  .option('-sa, --set-active', 'Set active')
  .action(async (options) => {
    Config.config(options);
  });

program.parse(process.argv);