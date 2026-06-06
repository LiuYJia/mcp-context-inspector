# MCP Context Inspector MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an MVP local TypeScript CLI that imports JSONL MCP/agent trace logs, analyzes context, token, and tool-call behavior, and outputs terminal plus Markdown reports.

**Architecture:** The CLI pipeline reads a JSONL file, parses each line into a normalized trace event, aggregates metrics, then renders terminal and Markdown reports. The MVP supports one documented local JSONL schema only; no cloud service, account system, GitHub app, browser UI, or speculative vendor compatibility.

**Tech Stack:** Node.js 20+, TypeScript, Vitest, npm scripts, GitHub Actions CI.

---

## Files

- `package.json`: package metadata, CLI bin, scripts, dev dependencies.
- `tsconfig.json`: strict TypeScript config.
- `.gitignore`: generated and dependency ignores.
- `src/types.ts`: trace and report interfaces.
- `src/parser.ts`: JSONL parsing and schema validation with line-numbered errors.
- `src/analyzer.ts`: session, role, token, context, and tool-call aggregation.
- `src/renderers/terminal.ts`: terminal report rendering.
- `src/renderers/markdown.ts`: Markdown report rendering.
- `src/cli.ts`: `inspect <trace.jsonl> [--markdown <report.md>]` entrypoint.
- `tests/fixtures/*.jsonl`: valid and invalid trace fixtures.
- `tests/*.test.ts`: parser, analyzer, renderer, CLI, and integration tests.
- `README.md`: project scope, usage, schema, examples, development commands.
- `.github/workflows/ci.yml`: Node 20 CI.

## Tasks

### Task 1: Project Scaffold

**Files:** Create `package.json`, `tsconfig.json`, `.gitignore`, directories `src/`, `src/renderers/`, `tests/fixtures/`.

- [ ] Create package metadata with `build`, `test`, `test:watch`, and `check` scripts.
- [ ] Create strict NodeNext TypeScript config.
- [ ] Create `.gitignore` for `node_modules/`, `dist/`, `coverage/`, logs, and OS files.
- [ ] Run `npm install`.
- [ ] Verify `npm test` starts Vitest without runtime errors.

### Task 2: Trace Types And Parser

**Files:** Create `src/types.ts`, `src/parser.ts`, `tests/parser.test.ts`.

- [ ] Write parser tests for valid JSONL, blank-line skipping, invalid JSON line numbers, and missing required fields.
- [ ] Run parser tests and confirm they fail before implementation.
- [ ] Implement `TraceEvent`, token, tool-call, session, tool, and analysis report types.
- [ ] Implement `parseJsonlTrace(input: string): TraceEvent[]` with explicit validation.
- [ ] Verify parser tests pass and `npm run build` passes.

### Task 3: Analyzer Metrics

**Files:** Create `src/analyzer.ts`, `tests/analyzer.test.ts`.

- [ ] Write analyzer tests for total events, sessions, roles, token totals, context chars, failures, durations, and empty trace behavior.
- [ ] Run analyzer tests and confirm they fail before implementation.
- [ ] Implement deterministic `analyzeTrace(events)` aggregation.
- [ ] Verify analyzer tests and `npm run check` pass.

### Task 4: Report Renderers

**Files:** Create `src/renderers/terminal.ts`, `src/renderers/markdown.ts`, `tests/renderers.test.ts`.

- [ ] Write renderer tests for terminal headline metrics and Markdown tables.
- [ ] Run renderer tests and confirm they fail before implementation.
- [ ] Implement terminal renderer.
- [ ] Implement Markdown renderer with table-cell escaping.
- [ ] Verify renderer tests and `npm run check` pass.

### Task 5: CLI Integration

**Files:** Create `src/cli.ts`, `tests/cli.test.ts`, `tests/fixtures/basic-trace.jsonl`, `tests/fixtures/invalid-json.jsonl`.

- [ ] Write process-level CLI tests for terminal output, Markdown writing, invalid JSONL, and missing arguments.
- [ ] Add valid and invalid JSONL fixtures.
- [ ] Run CLI tests and confirm they fail before implementation.
- [ ] Implement executable CLI with usage help and non-zero error exits.
- [ ] Verify CLI tests and `npm run check` pass.

### Task 6: End-To-End Coverage

**Files:** Create `tests/integration.test.ts`.

- [ ] Add fixture-driven pipeline test covering parser, analyzer, terminal renderer, and Markdown renderer together.
- [ ] Verify integration test and `npm run check` pass.

### Task 7: README And CI

**Files:** Create `README.md`, `.github/workflows/ci.yml`.

- [ ] Document MVP scope and non-goals.
- [ ] Document install, usage, JSONL schema, example terminal output, and development commands.
- [ ] Add Node 20 GitHub Actions workflow running `npm ci`, `npm run build`, and `npm test`.
- [ ] Verify `npm run check` passes.

## Success Criteria

- `npm run check` exits with code 0.
- CLI supports `node dist/cli.js inspect tests/fixtures/basic-trace.jsonl`.
- CLI supports `--markdown <path>` and writes a Markdown report.
- Parser errors include useful line numbers.
- Tests cover parser, analyzer, renderers, CLI, and the integrated pipeline.
- README documents the exact supported schema and explicit non-goals.
- No commits are made unless the user explicitly requests commits.

## Self-Review

- Spec coverage: CLI, parser, analyzer, renderers, fixtures/tests, README, package metadata, and CI are covered.
- Placeholder scan: No placeholder requirements remain.
- Type consistency: `TraceEvent`, `AnalysisReport`, `ToolSummary`, and renderer/analyzer signatures are consistent across tasks.
