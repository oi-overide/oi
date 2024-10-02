#!/usr/bin/env node

const { Command } = require('commander');

const { initializeProject } = require('./commands/initialize');
const { depend } = require('./commands/depend');
const { addIgnoreFiles } = require('./commands/ignore');
const { startWatching } = require('./service/watchmen');
const { updateConfig } = require('./commands/config');

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
    startWatching();
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
  .command('ignore')
  .description('Add files or directories to the ignore list in oi-config.json')
  .option('-f, --files <files...>', 'Specify files or directories to ignore')
  .action((options) => {
    if (!options.files || options.files.length === 0) {
      console.error("Please provide at least one file to ignore.");
      process.exit(1);
    }
    addIgnoreFiles(options.files);  // Call the function to add files to ignore list
  });

  program
  .command('config')
  .description('Update project settings in oi-config.json')
  .option('-n, --project-name <ProjectName>', 'Update project name')
  .option('-p, --port <PortNumber>', 'Set custom port for local LLM')
  .option('-u, --host <Url>', 'Set custom URL for local LLM')
  .option('-m, --model <Model>', 'Set model name')
  .action((options) => {
    updateConfig(options)
  });


program.parse(process.argv);
