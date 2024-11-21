# overide

## 0.2.0

### Minor Changes

- 1713261: Adds:

  1. Support for dependency graph generation with tree sitter.
  2. Support for Embedding generation in dependency graph using open-ai.
  3. Support for embedding based code relevancy selection for

  Updated:

  1. The Network layer is refactored to reduce redundancy.
  2. Config command now has two sub-commands 'local' & 'global' with respective options.
  3. overide config has a new option `--embedding` to enable embedding.

  Fixes:

  1. Fixed ignore file pattern matching.
  2. Fixed context generation for programming languages which dows not have tree-sitter support.
  3. Fixed embedding generation to exclude non-supported languages.

### Patch Changes

- 55ee800: Refactored the embedding and parsing service to handle the generation of prompt embedding and contexts properly.
- 6f1ea9b: Added a cool 3D view for dependency graph - This can be further improved to give user a proper experiance of manually adding context and viewing the project-wide code dependency.
- 183836d: Updated the watching file message.

## 0.1.8

### Patch Changes

- 3c096a5: Fixing Worflow

## 0.1.7

### Patch Changes

- fe8e6e9: Patching documentation and automation.

## 0.1.6

### Patch Changes

- 090f935: Remove typescript dependency as it's unneeded
