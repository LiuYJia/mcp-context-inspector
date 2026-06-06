# mcp-context-inspector

`mcp-context-inspector` is a local CLI for inspecting JSONL MCP and agent trace logs. It makes context size, token usage, role counts, sessions, and tool-call behavior visible in terminal and Markdown reports.

## MVP Scope

This MVP supports local JSONL files with one documented trace schema. It does not include cloud services, accounts, hosted dashboards, GitHub app integration, browser UI, or speculative compatibility with unreleased trace formats.

## Install

```bash
npm install
npm run build
```

## Usage

```bash
node dist/cli.js inspect tests/fixtures/basic-trace.jsonl
node dist/cli.js inspect tests/fixtures/basic-trace.jsonl --markdown report.md
```

After package installation from npm, the intended command is:

```bash
mcp-context-inspector inspect trace.jsonl --markdown report.md
```

## JSONL Trace Schema

Each line is one JSON object:

```json
{
  "timestamp": "2026-06-06T10:00:00.000Z",
  "sessionId": "session-a",
  "role": "assistant",
  "content": "Reading a file",
  "tokens": {
    "input": 12,
    "output": 8,
    "total": 20
  },
  "toolCall": {
    "name": "filesystem.read",
    "status": "completed",
    "durationMs": 42
  }
}
```

Required fields:

| Field | Type | Description |
| --- | --- | --- |
| `timestamp` | string | Event timestamp. |
| `sessionId` | string | Conversation or agent session identifier. |
| `role` | string | One of `system`, `user`, `assistant`, or `tool`. |

Optional fields:

| Field | Type | Description |
| --- | --- | --- |
| `content` | string | Text content used for context character estimates. |
| `tokens.input` | number | Input token count. |
| `tokens.output` | number | Output token count. |
| `tokens.total` | number | Total token count. If omitted, input plus output is used. |
| `toolCall.name` | string | Tool name. |
| `toolCall.status` | string | One of `started`, `completed`, or `failed`. |
| `toolCall.durationMs` | number | Tool duration in milliseconds. |

## Example Terminal Output

```text
MCP Context Inspector Report
Input: tests/fixtures/basic-trace.jsonl

Events: 3
Sessions: 2
Tokens: input 12, output 13, total 25

Roles:
- system: 0
- user: 1
- assistant: 2
- tool: 0

Tool Calls:
- filesystem.read: 2 calls, 1 failed, avg 60ms

Sessions:
- session-a: 2 events, 24 chars, tokens 13
- session-b: 1 events, 13 chars, tokens 12
```

## Development

```bash
npm install
npm test
npm run build
npm run check
```

## License

MIT
