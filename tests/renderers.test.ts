import { describe, expect, test } from 'vitest';
import { renderMarkdownReport } from '../src/renderers/markdown.js';
import { renderTerminalReport } from '../src/renderers/terminal.js';
import type { AnalysisReport } from '../src/types.js';

const report: AnalysisReport = {
  totalEvents: 3,
  sessionCount: 2,
  roleCounts: { system: 0, user: 1, assistant: 2, tool: 0 },
  tokens: { input: 12, output: 13, total: 25 },
  tools: [
    {
      name: 'filesystem.read',
      calls: 2,
      failures: 1,
      totalDurationMs: 120,
      averageDurationMs: 60
    }
  ],
  sessions: [
    {
      sessionId: 'session-a',
      events: 2,
      estimatedContextChars: 24,
      tokens: { input: 7, output: 6, total: 13 }
    },
    {
      sessionId: 'session-b',
      events: 1,
      estimatedContextChars: 13,
      tokens: { input: 5, output: 7, total: 12 }
    }
  ]
};

describe('report renderers', () => {
  test('renders terminal report with headline metrics and tool summaries', () => {
    const output = renderTerminalReport(report, 'tests/fixtures/basic-trace.jsonl');

    expect(output).toContain('MCP Context Inspector Report');
    expect(output).toContain('Input: tests/fixtures/basic-trace.jsonl');
    expect(output).toContain('Events: 3');
    expect(output).toContain('Sessions: 2');
    expect(output).toContain('Tokens: input 12, output 13, total 25');
    expect(output).toContain('- filesystem.read: 2 calls, 1 failed, avg 60ms');
  });

  test('renders markdown report with tables', () => {
    const output = renderMarkdownReport(report, 'tests/fixtures/basic-trace.jsonl');

    expect(output).toContain('# MCP Context Inspector Report');
    expect(output).toContain('| Metric | Value |');
    expect(output).toContain('| Events | 3 |');
    expect(output).toContain('| filesystem.read | 2 | 1 | 60ms |');
    expect(output).toContain('| session-a | 2 | 24 | 7 | 6 | 13 |');
  });
});
