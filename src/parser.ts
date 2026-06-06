import type { ToolCallStatus, TraceEvent, TraceRole } from './types.js';

const VALID_ROLES = new Set<TraceRole>(['system', 'user', 'assistant', 'tool']);
const VALID_TOOL_STATUSES = new Set<ToolCallStatus>(['started', 'completed', 'failed']);

export function parseJsonlTrace(input: string): TraceEvent[] {
  const events: TraceEvent[] = [];

  input.split(/\r?\n/).forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      return;
    }

    let value: unknown;
    try {
      value = JSON.parse(trimmed);
    } catch {
      throw new Error(`Invalid JSON on line ${lineNumber}`);
    }

    events.push(validateTraceEvent(value, lineNumber));
  });

  return events;
}

function validateTraceEvent(value: unknown, lineNumber: number): TraceEvent {
  if (!isRecord(value)) {
    throw invalid(lineNumber, 'record must be an object');
  }

  const { timestamp, sessionId, role } = value;

  if (typeof timestamp !== 'string') {
    throw invalid(lineNumber, 'timestamp must be a string');
  }

  if (typeof sessionId !== 'string') {
    throw invalid(lineNumber, 'sessionId must be a string');
  }

  if (typeof role !== 'string' || !VALID_ROLES.has(role as TraceRole)) {
    throw invalid(lineNumber, 'role must be one of system, user, assistant, tool');
  }

  const event: TraceEvent = {
    timestamp,
    sessionId,
    role: role as TraceRole
  };

  if ('content' in value) {
    if (typeof value.content !== 'string') {
      throw invalid(lineNumber, 'content must be a string');
    }
    event.content = value.content;
  }

  if ('tokens' in value) {
    if (!isRecord(value.tokens)) {
      throw invalid(lineNumber, 'tokens must be an object');
    }

    event.tokens = {
      input: optionalNumber(value.tokens.input, lineNumber, 'tokens.input'),
      output: optionalNumber(value.tokens.output, lineNumber, 'tokens.output'),
      total: optionalNumber(value.tokens.total, lineNumber, 'tokens.total')
    };
  }

  if ('toolCall' in value) {
    if (!isRecord(value.toolCall)) {
      throw invalid(lineNumber, 'toolCall must be an object');
    }

    if (typeof value.toolCall.name !== 'string') {
      throw invalid(lineNumber, 'toolCall.name must be a string');
    }

    event.toolCall = {
      name: value.toolCall.name,
      status: optionalToolStatus(value.toolCall.status, lineNumber),
      durationMs: optionalNumber(value.toolCall.durationMs, lineNumber, 'toolCall.durationMs')
    };
  }

  return event;
}

function optionalNumber(value: unknown, lineNumber: number, field: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw invalid(lineNumber, `${field} must be a non-negative number`);
  }

  return value;
}

function optionalToolStatus(value: unknown, lineNumber: number): ToolCallStatus | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string' || !VALID_TOOL_STATUSES.has(value as ToolCallStatus)) {
    throw invalid(lineNumber, 'toolCall.status must be one of started, completed, failed');
  }

  return value as ToolCallStatus;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function invalid(lineNumber: number, message: string): Error {
  return new Error(`Invalid trace event on line ${lineNumber}: ${message}`);
}
