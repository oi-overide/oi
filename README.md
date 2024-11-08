# Overide

**Overide** is a lightweight yet powerful CLI tool designed to simplify AI-powered code generation directly within your development workflow. With Overide, you can quickly generate, update, and integrate code using predefined prompts, allowing you to focus on the creative aspects of coding while letting AI handle the heavy lifting.

## Table of Contents

- [Key Features](#key-features)
- [Installation](#installation)
- [Usage](#usage)
  - [Adding API Key](#adding-api-key)
  - [Configure a Project](#configure-a-project)
  - [Start Monitoring](#start-monitoring)
  - [Code Generation](#code-generation)
- [Configuration](#configuration)
- [Contributing](#contributing)
  - [Development Workflow](#development-workflow)
  - [Version Management with Changesets](#version-management-with-changesets)
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

### Configure a Project

Configure Overide in your project directory:

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

1. Clone the repository
2. Create feature branches from `dev`
3. Make changes and test thoroughly
4. Submit PR to merge into `dev`
5. Once approved, changes merge to `dev`
6. Periodically, `dev` will be merged to `staging`
7. Finally, `staging` will eventually be merged to `main`

### Version Management with Changesets

We use [changesets](https://github.com/changesets/changesets) for version management.

After making changes in a feature branch, before submitting a PR:

1. Create a changeset:

```bash
pnpm changeset
```

2. Follow the prompts to:

   - Select change type (patch/minor/major)
   - Describe your changes
   - This creates a file in `.changeset` directory

3. Commit both your changes and the changeset file

When changes are merged to `main`:

- A "Version Packages" PR is automatically created, which:
  - Updates package version
  - Updates changelog
  - Publishes to npm

#### Change Types

- `patch`: Bug fixes and minor updates (0.0.X)
- `minor`: New features (0.X.0)
- `major`: Breaking changes (X.0.0)

#### Example Workflow (for reference)

1. Make changes in feature branch
2. Run `pnpm changeset`
3. Select change type and add description
4. Commit and push changes with changeset
5. Create PR to `dev`
6. When eventually merged to `main`, changes are published

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
npm run overide [init | config | start]
# or
pnpm overide [init | config | start]
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