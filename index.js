#!/usr/bin/env node

const { Command } = require('commander');

const {initializeProject} = require('./commands/init');
const {codeCommand} = require('./commands/code');

const program = new Command();

program
  .command('init')
  .description('Initialize a new project')
  .option('-o, --output <path>', 'Specify a custom configuration file path')
  .option('-i, --ignore <files...>', 'Specify files or directories to ignore')
  .option('-v, --verbose', 'Enable verbose output')
  .option('-n, --project-name <name>', 'Specify a project name')
  .option('--dry-run', 'Simulate the initialization process without making changes')
  .action((options) => {
    initializeProject(options);
  });

program
    .command('code')
    .description('Generate code based on comments')
    .action(() => {
        console.log('Generating code...');
        codeCommand();
    });

program
    .command('start')
    .description('Start watching files and upload them to Ollama')
    .action(() => {
        const { startWatching } = require('./utils/watchmen');
        console.log('Starting file watcher...');
        startWatching();
    });

program.parse(process.argv);
