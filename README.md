
# Oi-Override

**Oi-Override** is a lightweight yet powerful CLI tool designed to simplify AI-powered code generation directly within your development workflow. With Oi, you can quickly generate, update, and integrate code using predefined prompts, allowing you to focus on the creative aspects of coding while letting AI handle the heavy lifting.

## Key Features

- **IDE Agnostic**: Oi-Override is designed to work with any IDE, allowing you to seamlessly integrate code generation into your development workflow.
- **AI-Powered Code Generation**: Automatically generate code based on embedded prompts in your files, using OpenAI’s API.
- **Live File Monitoring**: Continuously monitor your project files for updates and code generation prompts.
- **Simple Prompting Syntax**: Use intuitive patterns like `//> <//` to guide AI in generating or completing code snippets in specific locations.

## Usage

### Initialize a Project

To initialize Oi-Override in your project, run the following command in your project directory:

```bash
oi init
```

This will create a configuration file and set up Oi to work with your project.

### Start Monitoring

Once Oi is initialized, you can start monitoring the project files for code generation prompts:

```bash
oi start
```

Oi will continuously watch the project directory and respond to any prompts it detects.

### Insert Prompts for Code Generation

Place prompts in your code files to indicate where Oi should generate code. For example:

```javascript
//> Generate a function to add two numbers <//
```

Oi will then generate the required code and insert it directly into the file at the prompt location.

```javascript
  //- Generate a function to add two numbers
  const function = sum(a, b) {
    return a + b;
  }
  //> Accept the changes (y/n): -//
```

Based on the user's response, Oi will either keep the changes or discard them.

### Generate Dependency Graph - IN DEV

You can generate or update the project dependency graph by running:

```bash
oi depend
```

This will create a \`.oi-dependency.json\` file that tracks the structure of your project and its dependencies.

## Configuration

Oi-Override uses an \`oi-config.json\` file for customization. You can define the AI service, ignore certain files or directories, and configure other options.

Example configuration:

```json
{
  "ignore": ["node_modules", "*.test.js"],
  "verbose": true
}
```

### Key Options

- **service**: The AI backend service to use (e.g., OpenAI Codex, local LLM).
- **ignore**: Files or directories to exclude from monitoring.
- **verbose**: Enable verbose logging to track detailed operations.

## Version 2.0 Plan

- **Project Context Management**: Oi allows to create a tracks the project’s structure and dependencies using a lightweight `.oi-dependency.json` file, keeping project-wide context in sync. 
- **Customizable AI Backends**: Easily switch between AI services such as OpenAI or self-hosted models (e.g., Code Llama), giving you flexibility over how code is generated.
- **Unlimited Generations**: Generate code as often as needed, with no hard limits on usage (service dependent).

## Contributing

We welcome contributions from the community! Here’s how you can help:

1. **Fork** the repository.
2. Create a **new branch** for your feature or fix.
3. Submit a **pull request** and describe your changes.

Feel free to open issues for bugs, feature requests, or general feedback!

## Community 

Join our [Discord](https://discord.com/invite/Z7F4vRq3n8) community to discuss and collaborate on projects, share ideas, and stay up-to-date with the latest developments in the Oi-Override ecosystem.

## License

Oi-Override is licensed under the GNU GPL-2.0 License. See the [LICENSE](LICENSE) file for more details.

---

## Join the Community!

We’re excited to build Oi-Override into a powerful, flexible tool that enhances developer workflows with the help of AI. Follow the repository, contribute, and help us improve Oi for everyone!
