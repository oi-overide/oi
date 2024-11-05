# Overide

**Overide** is a lightweight yet powerful CLI tool designed to simplify AI-powered code generation directly within your development workflow. With Oi, you can quickly generate, update, and integrate code using predefined prompts, allowing you to focus on the creative aspects of coding while letting AI handle the heavy lifting.

## Table of Contents
- [Key Features](#key-features)
- [Installation](#installation)
- [Usage](#usage)
  - [Adding API Key](#adding-api-key)
  - [Initialize a Project](#initialize-a-project)
  - [Start Monitoring](#start-monitoring)
  - [Code Generation](#code-generation)
- [Configuration](#configuration)
- [Contributing](#contributing)
  - [Development Workflow](#development-workflow)
  - [Development Testing](#development-testing)
- [Future Plans (v2.0)](#future-plans-v20)
- [Community](#community)
- [License](#license)


## Key Features

- **IDE Agnostic**: Works with any IDE or text editor
- **AI-Powered Code Generation**: Uses OpenAI, DeepSeek, or Groq APIs
- **Live File Monitoring**: Continuously monitors files for code generation prompts
- **Simple Prompting Syntax**: Uses intuitive `//> <//` patterns for code generation

## Installation

Install globally using npm or pnpm:

```bash
npm install -g overide
# or
pnpm install -g overide
```

For more installation options, see our [installation guide](https://github.com/Overide/Overide/blob/main/Installation/Installation.md).

## Usage

### Adding API Key

Configure your AI platform credentials:

```bash
overide config --global
```

Select an active platform if you've configured multiple:

```bash
overide config --select-active
```

### Initialize a Project

Initialize Overide in your project directory:

```bash
overide init
```

### Start Monitoring

Begin monitoring files for code generation:

```bash
overide start
```

### Code Generation

Insert prompts in your code:

```javascript
//> Generate a function that logs 'Hello, World!' <//
```

Overide will generate and insert code:

```javascript
//- 'Hello, World!' Function
function helloWorld() {
    console.log("Hello, World!");
}
//> Accept the changes (y/n): -//
```

## Configuration

Configure Overide using `oi-config.json`:

```json
{
  "name": "project name",
  "ignore": ["node_modules", "*.test.js"]
}
```

## Contributing

### Development Workflow

1. Fork and clone the repository
2. Create feature branches from `dev`
3. Make changes and test thoroughly
4. Submit PR to merge into `dev`
5. Once approved, changes merge to `dev`
6. Periodically, `dev` merges to `staging`
7. When ready, `staging` merges to `main` with version prefix:
   - `patch:` for bug fixes (0.0.X)
   - `minor:` for new features (0.X.0)
   - `major:` for breaking changes (X.0.0)

Example PR titles:
- "patch: Bug fixes for v0.0.6"
- "minor: New features for v0.1.0"
- "major: Breaking changes for v2.0.0"

### Development & Testing

#### Local Development (Hot Reloading)
1. Start the development watcher:
```bash
npm run dev
# or
pnpm dev
```

2. In a separate terminal, run the CLI commands as you normally would, with `npm run` or `pnpm` prefixed:

```bash
npm run overide init
# or
pnpm overide init
```

The development watcher (`npm run dev`) will automatically rebuild the project when you make changes to the source code, allowing you to test changes in real-time.

#### Local Production Testing
1. Build and create global link:
```bash
npm run build
npm link
```

2. Link in test project:
```bash
npm link -g overide
```

3. Test the production version of the CLI:
```bash
overide --version
overide init
overide start
```

4. Cleanup:
```bash
# In test project
npm unlink -g overide

# In Overide project
npm unlink
```

#### Why Development Testing?
- **Hot Reload**: Test changes instantly without manual rebuilds
- **Real-time Feedback**: See immediate results of code modifications
- **Faster Development**: Reduce time between changes and testing
- **Debugging**: Easier to identify and fix issues during development

#### Why Link Testing?
- Test CLI as if installed globally
- Verify changes before publishing
- Validate package.json bin configuration
- Ensure proper dependency inclusion

## Future Plans (v2.0)

- **Project Context Management**: Local parsers for optimized prompts
- **Code Format**: Unified diff format for improved insertion
- **Multiple File Edit**: Support for multi-file operations
- **Script Execution**: Automated task execution capabilities

## Community

Join our [Discord](https://discord.com/invite/Z7F4vRq3n8) to collaborate, share ideas, and stay updated with Overide developments.

## License

Overide is licensed under the GNU GPL-2.0 License. See the [LICENSE](LICENSE) file for details.