import type { AnalysisReport, SessionSummary, ToolSummary, TraceEvent, TraceRole } from './types.js';

const ROLES: TraceRole[] = ['system', 'user', 'assistant', 'tool'];

export function analyzeTrace(events: TraceEvent[]): AnalysisReport {
  const roleCounts = Object.fromEntries(ROLES.map((role) => [role, 0])) as Record<TraceRole, number>;
  const sessions = new Map<string, SessionSummary>();
  const tools = new Map<string, ToolSummary>();
  const tokens = { input: 0, output: 0, total: 0 };

  for (const event of events) {
    roleCounts[event.role] += 1;

    const eventTokens = normalizeTokens(event.tokens);
    tokens.input += eventTokens.input;
    tokens.output += eventTokens.output;
    tokens.total += eventTokens.total;

    const session = getSession(sessions, event.sessionId);
    session.events += 1;
    session.estimatedContextChars += event.content?.length ?? 0;
    session.tokens.input += eventTokens.input;
    session.tokens.output += eventTokens.output;
    session.tokens.total += eventTokens.total;

    if (event.toolCall) {
      const tool = getTool(tools, event.toolCall.name);
      tool.calls += 1;
      tool.failures += event.toolCall.status === 'failed' ? 1 : 0;
      tool.totalDurationMs += event.toolCall.durationMs ?? 0;
      tool.averageDurationMs = tool.totalDurationMs / tool.calls;
    }
  }

  return {
    totalEvents: events.length,
    sessionCount: sessions.size,
    roleCounts,
    tokens,
    tools: [...tools.values()].sort((left, right) => left.name.localeCompare(right.name)),
    sessions: [...sessions.values()].sort((left, right) => left.sessionId.localeCompare(right.sessionId))
  };
}

function normalizeTokens(tokens: TraceEvent['tokens']): { input: number; output: number; total: number } {
  const input = tokens?.input ?? 0;
  const output = tokens?.output ?? 0;
  const total = tokens?.total ?? input + output;

  return { input, output, total };
}

function getSession(sessions: Map<string, SessionSummary>, sessionId: string): SessionSummary {
  const existing = sessions.get(sessionId);

  if (existing) {
    return existing;
  }

  const created: SessionSummary = {
    sessionId,
    events: 0,
    estimatedContextChars: 0,
    tokens: { input: 0, output: 0, total: 0 }
  };

  sessions.set(sessionId, created);
  return created;
}

function getTool(tools: Map<string, ToolSummary>, name: string): ToolSummary {
  const existing = tools.get(name);

  if (existing) {
    return existing;
  }

  const created: ToolSummary = {
    name,
    calls: 0,
    failures: 0,
    totalDurationMs: 0,
    averageDurationMs: 0
  };

  tools.set(name, created);
  return created;
}
