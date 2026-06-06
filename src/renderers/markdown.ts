import type { AnalysisReport } from '../types.js';

export function renderMarkdownReport(report: AnalysisReport, inputPath: string): string {
  const lines = [
    '# MCP Context Inspector Report',
    '',
    `Input: \`${inputPath}\``,
    '',
    '## Summary',
    '',
    '| Metric | Value |',
    '| --- | ---: |',
    `| Events | ${report.totalEvents} |`,
    `| Sessions | ${report.sessionCount} |`,
    `| Input tokens | ${report.tokens.input} |`,
    `| Output tokens | ${report.tokens.output} |`,
    `| Total tokens | ${report.tokens.total} |`,
    '',
    '## Roles',
    '',
    '| Role | Events |',
    '| --- | ---: |',
    `| system | ${report.roleCounts.system} |`,
    `| user | ${report.roleCounts.user} |`,
    `| assistant | ${report.roleCounts.assistant} |`,
    `| tool | ${report.roleCounts.tool} |`,
    '',
    '## Tool Calls',
    '',
    '| Tool | Calls | Failures | Average Duration |',
    '| --- | ---: | ---: | ---: |'
  ];

  if (report.tools.length === 0) {
    lines.push('| none | 0 | 0 | 0ms |');
  } else {
    for (const tool of report.tools) {
      lines.push(`| ${escapeCell(tool.name)} | ${tool.calls} | ${tool.failures} | ${Math.round(tool.averageDurationMs)}ms |`);
    }
  }

  lines.push(
    '',
    '## Sessions',
    '',
    '| Session | Events | Context Chars | Input Tokens | Output Tokens | Total Tokens |',
    '| --- | ---: | ---: | ---: | ---: | ---: |'
  );

  if (report.sessions.length === 0) {
    lines.push('| none | 0 | 0 | 0 | 0 | 0 |');
  } else {
    for (const session of report.sessions) {
      lines.push(
        `| ${escapeCell(session.sessionId)} | ${session.events} | ${session.estimatedContextChars} | ${session.tokens.input} | ${session.tokens.output} | ${session.tokens.total} |`
      );
    }
  }

  return `${lines.join('\n')}\n`;
}

function escapeCell(value: string): string {
  return value.replaceAll('|', '\\|');
}
