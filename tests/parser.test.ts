import { describe, expect, test } from 'vitest';
import { parseJsonlTrace } from '../src/parser.js';

describe('parseJsonlTrace', () => {
  test('parses valid JSONL trace events and skips blank lines', () => {
    const input = [
      '{"timestamp":"2026-06-06T10:00:00.000Z","sessionId":"session-a","role":"user","content":"Inspect this repo","tokens":{"input":4,"output":0,"total":4}}',
      '',
      '{"timestamp":"2026-06-06T10:00:01.000Z","sessionId":"session-a","role":"assistant","content":"Calling tool","toolCall":{"name":"filesystem.read","status":"completed","durationMs":42},"tokens":{"input":6,"output":8,"total":14}}'
    ].join('\n');

    const events = parseJsonlTrace(input);

    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({
      timestamp: '2026-06-06T10:00:00.000Z',
      sessionId: 'session-a',
      role: 'user',
      content: 'Inspect this repo'
    });
    expect(events[1]?.toolCall).toEqual({
      name: 'filesystem.read',
      status: 'completed',
      durationMs: 42
    });
  });

  test('reports invalid JSON with the source line number', () => {
    const input = '{"timestamp":"2026-06-06T10:00:00.000Z","sessionId":"session-a","role":"user"}\n{bad json}';

    expect(() => parseJsonlTrace(input)).toThrow('Invalid JSON on line 2');
  });

  test('rejects records missing required fields', () => {
    const input = '{"timestamp":"2026-06-06T10:00:00.000Z","role":"user"}';

    expect(() => parseJsonlTrace(input)).toThrow('Invalid trace event on line 1: sessionId must be a string');
  });
});
