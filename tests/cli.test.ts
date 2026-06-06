import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, expect, test } from 'vitest';

const execFileAsync = promisify(execFile);

async function buildProject(): Promise<void> {
  await execFileAsync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json']);
}

describe('mcp-context-inspector CLI', () => {
  test('prints a terminal report for an inspect command', async () => {
    await buildProject();

    const result = await execFileAsync(process.execPath, [
      'dist/cli.js',
      'inspect',
      'tests/fixtures/basic-trace.jsonl'
    ]);

    expect(result.stdout).toContain('MCP Context Inspector Report');
    expect(result.stdout).toContain('Events: 3');
    expect(result.stdout).toContain('Sessions: 2');
    expect(result.stdout).toContain('- filesystem.read: 2 calls, 1 failed, avg 60ms');
    expect(result.stderr).toBe('');
  });

  test('writes a markdown report when --markdown is provided', async () => {
    await buildProject();
    const dir = await mkdtemp(path.join(tmpdir(), 'mcp-context-inspector-'));
    const markdownPath = path.join(dir, 'report.md');

    try {
      const result = await execFileAsync(process.execPath, [
        'dist/cli.js',
        'inspect',
        'tests/fixtures/basic-trace.jsonl',
        '--markdown',
        markdownPath
      ]);

      const markdown = await readFile(markdownPath, 'utf8');

      expect(result.stdout).toContain('Markdown report written:');
      expect(markdown).toContain('# MCP Context Inspector Report');
      expect(markdown).toContain('| filesystem.read | 2 | 1 | 60ms |');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('exits with an error for invalid JSONL input', async () => {
    await buildProject();

    await expect(
      execFileAsync(process.execPath, ['dist/cli.js', 'inspect', 'tests/fixtures/invalid-json.jsonl'])
    ).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining('Invalid JSON on line 2')
    });
  });

  test('exits with usage help when arguments are missing', async () => {
    await buildProject();

    await expect(execFileAsync(process.execPath, ['dist/cli.js'])).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining('Usage: mcp-context-inspector inspect <trace.jsonl>')
    });
  });
});
