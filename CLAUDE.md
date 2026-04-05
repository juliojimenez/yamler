# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Instructions

- Update tests with changes
- Update README.md
- Update CLAUDE.md

## What is yamler

yamler is a GitHub Action that parses YAML documents and exposes all elements as GitHub Workflow output variables. It supports single and multi-document YAML files (via the `multidoc` input). Multi-document outputs are prefixed with `docN__`. Nested keys use double-underscore (`__`) notation (e.g., `foo.bar` becomes `foo__bar`, arrays use numeric indices).

## Commands

- **Build:** `npm run build` (compiles TypeScript from `src/` to `build/`)
- **Test:** `npm run test` (Jest with coverage)
- **Run single test:** `npx jest -t "test name"`
- **Watch mode:** `npm run dev`
- **Test with GitHub Actions locally:** `npm run test:ga` (requires `act`)

## Architecture

Single source file: `src/index.ts` contains all logic. Key exports:

- `safeString(s)` — normalizes YAML keys into GitHub-compatible output variable names (lowercase, replace special chars)
- `traverseObject(obj, docIndex)` — recursively walks object properties, calls `core.setOutput` for leaf values
- `traverseArray(arr, docIndex)` — recursively walks array elements by index
- IIFE at bottom is the action entrypoint: reads `yaml-file` input, optionally parses as multidoc, traverses the result

Module-level `parentNodes: string[]` tracks the current path during traversal (used to build the `__`-separated output key).

Tests are in `__tests__/index.test.ts` with YAML fixture files in the same directory. The built output in `build/` is committed and referenced by `action.yml`.

## Build note

The `build/` directory is checked into git because GitHub Actions requires the compiled JS. After changing `src/index.ts`, run `npm run build` and commit the updated `build/` output.
