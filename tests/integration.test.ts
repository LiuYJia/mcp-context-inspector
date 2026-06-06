import { readFile } from 'node:fs/promises';
import { describe, expect, test } from 'vitest';
import { analyzeTrace } from '../src/analyzer.js';
import { parseJsonlTrace } from '../src/parser.js';
import { renderMarkdownReport } from '../src/renderers/markdown.js';
import { renderTerminalReport } from '../src/renderers/terminal.js';

describe('trace inspection pipeline', () => {
  test('turns a JSONL trace fixture into terminal and markdown reports', async () => {
    const inputPath = 'tests/fixtures/basic-trace.jsonl';
    const input = await readFile(inputPath, 'utf8');

    const events = parseJsonlTrace(input);
    const report = analyzeTrace(events);
    const terminal = renderTerminalReport(report, inputPath);
    const markdown = renderMarkdownReport(report, inputPath);

    expect(report.totalEvents).toBe(3);
    expect(report.sessionCount).toBe(2);
    expect(report.tokens).toEqual({ input: 12, output: 13, total: 25 });
    expect(terminal).toContain('Tool Calls:');
    expect(markdown).toContain('## Sessions');
  });
});
