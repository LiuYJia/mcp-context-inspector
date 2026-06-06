import type { AnalysisReport } from '../types.js';

export function renderTerminalReport(report: AnalysisReport, inputPath: string): string {
  const lines = [
    'MCP Context Inspector Report',
    `Input: ${inputPath}`,
    '',
    `Events: ${report.totalEvents}`,
    `Sessions: ${report.sessionCount}`,
    `Tokens: input ${report.tokens.input}, output ${report.tokens.output}, total ${report.tokens.total}`,
    '',
    'Roles:',
    `- system: ${report.roleCounts.system}`,
    `- user: ${report.roleCounts.user}`,
    `- assistant: ${report.roleCounts.assistant}`,
    `- tool: ${report.roleCounts.tool}`,
    '',
    'Tool Calls:'
  ];

  if (report.tools.length === 0) {
    lines.push('- none');
  } else {
    for (const tool of report.tools) {
      lines.push(`- ${tool.name}: ${tool.calls} calls, ${tool.failures} failed, avg ${formatMs(tool.averageDurationMs)}`);
    }
  }

  lines.push('', 'Sessions:');

  if (report.sessions.length === 0) {
    lines.push('- none');
  } else {
    for (const session of report.sessions) {
      lines.push(
        `- ${session.sessionId}: ${session.events} events, ${session.estimatedContextChars} chars, tokens ${session.tokens.total}`
      );
    }
  }

  return `${lines.join('\n')}\n`;
}

function formatMs(value: number): string {
  return `${Math.round(value)}ms`;
}
