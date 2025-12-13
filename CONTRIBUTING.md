# Contributing to Qirrel

Thank you for your interest in contributing to Qirrel! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Guidelines](#coding-guidelines)
- [Documentation](#documentation)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Issues](#issues)

## Code of Conduct

This project and everyone participating in it is governed by the Qirrel Code of Conduct. By participating, you are expected to uphold this code.

## How to Contribute

There are many ways you can contribute to Qirrel:

- Reporting bugs
- Suggesting enhancements
- Writing documentation
- Contributing code for new features
- Fixing bugs
- Improving performance

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/qirrel.git`
3. Navigate to the project directory: `cd qirrel`
4. Install dependencies: `npm install`
5. Build the project: `npm run build`

## Project Structure

```
qirrel/
├── src/
│   ├── adapters/     # Adapter functions for external services
│   ├── api/          # Public API entry points
│   ├── config/       # Configuration system
│   ├── core/         # Core functionality (Tokenizer, Pipeline)
│   ├── llms/         # LLM integration components
│   ├── processors/   # Text processing functions
│   └── types/        # Type definitions
├── docs/            # Documentation files
│   ├── api.md       # API reference
│   ├── configuration.md
│   ├── examples.md
│   ├── walkthrough.md
│   ├── usage/       # Usage guides
│   └── integrations/ # Integration guides
├── dist/            # Compiled JavaScript files
├── README.MD        # Main project overview
└── package.json
```

## Coding Guidelines

- Write TypeScript code with proper type annotations
- Follow existing code style and patterns
- Write clear, self-documenting code
- Add comments for complex logic
- Ensure code is performant and memory-efficient
- Maintain consistency with existing codebase patterns

## Documentation

Qirrel uses a modular documentation approach:

- Keep README.MD minimal and professional
- Add detailed documentation to the `/docs` folder
- Create focused, single-topic documentation files
- Include links to GitHub, NPM, and author in all relevant docs

## Testing

We use Jest for testing:

1. Run all tests: `npm run test`
2. Run tests with coverage: `npm run test:coverage`
3. Run tests in watch mode: `npm run test:watch`
4. Add tests for new functionality

## Pull Request Process

1. Ensure your code follows the guidelines above
2. Update documentation as needed
3. Add or update tests for new/changed functionality
4. Run all tests to ensure nothing is broken
5. Submit a pull request with a clear description of your changes
6. Link any relevant issues

## Issues

When creating an issue, please provide:

- A clear title and description
- Steps to reproduce (for bugs)
- Expected and actual behavior
- Any relevant code snippets or examples
- Environment information (Node.js version, etc.)

---

Thank you for contributing to Qirrel!