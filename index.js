#!/usr/bin/env node
const { Command } = require('commander');

const Initialize = require('./commands/initialize');
const Depend = require('./commands/depend');
const Watchmen = require('./core/storage/directory/watchmen');
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
  .action(() => {
    console.log('Starting file watcher...');
    Watchmen.watchFiles();
  });

program
  .command('depend')
  .description('Generate a dependency graph for the project')
  .option('-o, --output <path>', 'Specify a custom output file path')
  .option('-v, --verbose', 'Enable verbose output')
  .action((options) => {
    Depend.depend(options);
  });

program
  .command('config')
  .description('Update project settings in oi-config.json')
  .option('-n, --project-name <ProjectName>', 'Update project name')
  .option('-p, --port <PortNumber>', 'Set custom port for local LLM')
  .option('-u, --host <Url>', 'Set custom URL for local LLM')
  .option('-m, --model', 'Set model name')
  .option('-i, --ignore <files...>', 'Specify files or directories to ignore')  // Add the ignore option here
  .action(async (options) => {
    Config.handleConfigUpdate(options);
  });

program.parse(process.argv);
