import { describe, expect, test } from 'vitest';
import { analyzeTrace } from '../src/analyzer.js';
import type { TraceEvent } from '../src/types.js';

describe('analyzeTrace', () => {
  test('aggregates sessions, roles, tokens, context characters, and tools', () => {
    const events: TraceEvent[] = [
      {
        timestamp: '2026-06-06T10:00:00.000Z',
        sessionId: 'session-a',
        role: 'user',
        content: 'Inspect repo',
        tokens: { input: 3, output: 0, total: 3 }
      },
      {
        timestamp: '2026-06-06T10:00:01.000Z',
        sessionId: 'session-a',
        role: 'assistant',
        content: 'Reading file',
        tokens: { input: 4, output: 6, total: 10 },
        toolCall: { name: 'filesystem.read', status: 'completed', durationMs: 40 }
      },
      {
        timestamp: '2026-06-06T10:00:02.000Z',
        sessionId: 'session-b',
        role: 'assistant',
        content: 'Search failed',
        tokens: { input: 5, output: 7 },
        toolCall: { name: 'filesystem.read', status: 'failed', durationMs: 80 }
      }
    ];

    const report = analyzeTrace(events);

    expect(report.totalEvents).toBe(3);
    expect(report.sessionCount).toBe(2);
    expect(report.roleCounts).toEqual({
      system: 0,
      user: 1,
      assistant: 2,
      tool: 0
    });
    expect(report.tokens).toEqual({ input: 12, output: 13, total: 25 });
    expect(report.tools).toEqual([
      {
        name: 'filesystem.read',
        calls: 2,
        failures: 1,
        totalDurationMs: 120,
        averageDurationMs: 60
      }
    ]);
    expect(report.sessions).toEqual([
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
    ]);
  });

  test('returns empty metrics for an empty trace', () => {
    const report = analyzeTrace([]);

    expect(report.totalEvents).toBe(0);
    expect(report.sessionCount).toBe(0);
    expect(report.tokens).toEqual({ input: 0, output: 0, total: 0 });
    expect(report.tools).toEqual([]);
    expect(report.sessions).toEqual([]);
  });
});
