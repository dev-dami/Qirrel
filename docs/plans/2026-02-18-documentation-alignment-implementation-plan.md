# Documentation Alignment and Ecosystem Comparison Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Align all Qirrel documentation to the current codebase, deepen single-purpose docs, and add a sourced ecosystem comparison.

**Architecture:** Update documentation in-place using a shared structure: purpose, exact behavior, practical examples, edge cases, and related links. Add one comparison page for market positioning and documentation quality benchmarks using official sources only.

**Tech Stack:** Markdown docs, Jest docs-connectivity tests, TypeScript source-of-truth checks.

### Task 1: Audit-driven alignment of core docs

**Files:**
- Modify: `README.MD`
- Modify: `docs/README.md`
- Modify: `docs/api.md`
- Modify: `docs/configuration.md`

**Steps:**
1. Normalize terminology and behavior descriptions to match `src/api/index.ts`, `src/core/pipeline.ts`, and `src/config/*`.
2. Add missing operational details (errors, defaults, lifecycle notes).
3. Ensure cross-links are complete and consistent.

### Task 2: Deepen single-purpose docs

**Files:**
- Modify: `docs/usage/basic.md`
- Modify: `docs/usage/caching.md`
- Modify: `docs/events.md`
- Modify: `docs/integrations/llm.md`
- Modify: `docs/agent-native.md`
- Modify: `docs/benchmarks.md`

**Steps:**
1. Add practical “when to use”, “common pitfalls”, and “production notes” sections.
2. Add examples that reflect current behavior and constraints.
3. Keep navigation headers aligned with docs home.

### Task 3: Add ecosystem/package comparison page

**Files:**
- Create: `docs/ecosystem-comparison.md`
- Modify: `docs/framework-comparison.md`

**Steps:**
1. Compare Qirrel docs and positioning with selected packages/frameworks.
2. Use only official docs/spec sources and keep claims scoped.
3. Cross-link with existing benchmark/framework pages.

### Task 4: Wire links and verify

**Files:**
- Modify: `README.MD`
- Modify: `docs/README.md`
- Modify: `tests/docs-connectivity.test.ts`

**Steps:**
1. Add new doc links in root and docs home.
2. Update docs connectivity test list to include new page.
3. Run docs connectivity tests, full tests, and build.
