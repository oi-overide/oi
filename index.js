#!/usr/bin/env node
const { Command } = require('commander');
const { initializeProject } = require('./commands/initialize');
const { depend } = require('./commands/depend');

const watchmen = require('./core/storage/directory/watchmen');
const config = require('./commands/config');  // Import addIgnoreFiles here

const program = new Command();

program
  .command('init')
  .description('Initialize a new project')
  .option('-o, --output <path>', 'Specify a custom configuration file path')
  .option('-i, --ignore <files...>', 'Specify files or directories to ignore')
  .option('-v, --verbose', 'Enable verbose output')
  .option('-n, --project-name <name>', 'Specify a project name')
  .action((options) => {
    initializeProject(options);
  });

program
  .command('start')
  .description('Start watching files and upload them to Ollama')
  .action(() => {
    console.log('Starting file watcher...');
    watchmen.watchFiles();
  });

program
  .command('depend')
  .description('Generate a dependency graph for the project')
  .option('-o, --output <path>', 'Specify a custom output file path')
  .option('-v, --verbose', 'Enable verbose output')
  .action((options) => {
    depend(options);
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
    config.handleConfigUpdate(options);
  });

program.parse(process.argv);
