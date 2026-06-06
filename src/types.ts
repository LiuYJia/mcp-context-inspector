export type TraceRole = 'system' | 'user' | 'assistant' | 'tool';

export type ToolCallStatus = 'started' | 'completed' | 'failed';

export interface TokenMetrics {
  input?: number;
  output?: number;
  total?: number;
}

export interface ToolCallTrace {
  name: string;
  status?: ToolCallStatus;
  durationMs?: number;
}

export interface TraceEvent {
  timestamp: string;
  sessionId: string;
  role: TraceRole;
  content?: string;
  tokens?: TokenMetrics;
  toolCall?: ToolCallTrace;
}

export interface ToolSummary {
  name: string;
  calls: number;
  failures: number;
  totalDurationMs: number;
  averageDurationMs: number;
}

export interface SessionSummary {
  sessionId: string;
  events: number;
  estimatedContextChars: number;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
}

export interface AnalysisReport {
  totalEvents: number;
  sessionCount: number;
  roleCounts: Record<TraceRole, number>;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  tools: ToolSummary[];
  sessions: SessionSummary[];
}
