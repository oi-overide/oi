---
"overide": minor
---

Adds: 
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

