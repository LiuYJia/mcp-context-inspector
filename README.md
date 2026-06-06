# mcp-context-inspector

`mcp-context-inspector` 是一个本地 CLI，用来检查 JSONL 格式的 MCP / Agent trace 日志。它可以把上下文大小、token 用量、角色分布、会话统计和工具调用情况输出为终端报告和 Markdown 报告。

English documentation is available after the Chinese section.

## 功能范围

当前 MVP 支持一个明确记录的本地 JSONL trace schema。它不包含云服务、账号系统、托管仪表盘、GitHub App、浏览器 UI，也不会猜测兼容尚未明确的厂商 trace 格式。

适合场景：

- 团队在落地 MCP / Agent 工具链，需要看清上下文和工具调用成本。
- 需要把一次 agent 会话分析结果贴到 issue、PR 或复盘文档里。
- 想快速定位工具调用失败、耗时过高、token 用量异常的 trace。

## 安装

```bash
npm install
npm run build
```

## 使用

直接运行编译后的 CLI：

```bash
node dist/cli.js inspect tests/fixtures/basic-trace.jsonl
node dist/cli.js inspect tests/fixtures/basic-trace.jsonl --markdown report.md
```

作为 npm 包安装后，预期命令是：

```bash
mcp-context-inspector inspect trace.jsonl --markdown report.md
```

## JSONL Trace Schema

每一行是一个 JSON 对象：

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

必填字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `timestamp` | string | 事件时间戳。 |
| `sessionId` | string | 会话或 agent session 标识。 |
| `role` | string | `system`、`user`、`assistant`、`tool` 之一。 |

可选字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `content` | string | 文本内容，用于估算上下文字符数。 |
| `tokens.input` | number | 输入 token 数。 |
| `tokens.output` | number | 输出 token 数。 |
| `tokens.total` | number | 总 token 数。省略时使用 input + output。 |
| `toolCall.name` | string | 工具名称。 |
| `toolCall.status` | string | `started`、`completed`、`failed` 之一。 |
| `toolCall.durationMs` | number | 工具调用耗时，单位毫秒。 |

## 终端输出示例

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

## 开发

```bash
npm install
npm test
npm run build
npm run check
```

## License

MIT

---

## English

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
