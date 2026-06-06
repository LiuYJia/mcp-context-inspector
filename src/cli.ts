#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { analyzeTrace } from './analyzer.js';
import { parseJsonlTrace } from './parser.js';
import { renderMarkdownReport } from './renderers/markdown.js';
import { renderTerminalReport } from './renderers/terminal.js';

interface CliOptions {
  inputPath: string;
  markdownPath?: string;
}

async function main(args: string[]): Promise<number> {
  try {
    const options = parseArgs(args);
    const input = await readFile(options.inputPath, 'utf8');
    const events = parseJsonlTrace(input);
    const report = analyzeTrace(events);

    process.stdout.write(renderTerminalReport(report, options.inputPath));

    if (options.markdownPath) {
      await writeFile(options.markdownPath, renderMarkdownReport(report, options.inputPath), 'utf8');
      process.stdout.write(`Markdown report written: ${options.markdownPath}\n`);
    }

    return 0;
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
}

function parseArgs(args: string[]): CliOptions {
  const [command, inputPath, ...rest] = args;

  if (command !== 'inspect' || !inputPath) {
    throw new Error(usage());
  }

  let markdownPath: string | undefined;

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];

    if (arg === '--markdown') {
      markdownPath = rest[index + 1];
      index += 1;

      if (!markdownPath) {
        throw new Error('--markdown requires an output path');
      }

      continue;
    }

    throw new Error(`Unknown option: ${arg}\n${usage()}`);
  }

  return { inputPath, markdownPath };
}

function usage(): string {
  return [
    'Usage: mcp-context-inspector inspect <trace.jsonl> [--markdown <report.md>]',
    '',
    'Examples:',
    '  mcp-context-inspector inspect trace.jsonl',
    '  mcp-context-inspector inspect trace.jsonl --markdown report.md'
  ].join('\n');
}

main(process.argv.slice(2)).then((code) => {
  process.exitCode = code;
});
