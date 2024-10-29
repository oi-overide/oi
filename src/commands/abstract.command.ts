import { Command } from 'commander';

abstract class OiCommand {
    public program: Command;

    constructor(program: Command) {
        this.program = program;
    }

    protected addCommonOptions(command: Command) {
        command.option('-v, --verbose', 'Enable verbose output'); // Add verbose option to the specific command
    }

    abstract configureCommand(): void;
}

export default OiCommand;