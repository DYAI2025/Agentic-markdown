# Source Map

| Source ID | Type | Title | Locator | Claim supported | Confidence | Status |
|---|---|---|---|---|---:|---|
| SRC-REPO-01 | user_provided | agent-markdown-network-builder (3).zip | uploaded ZIP / source tree | Current implementation, architecture and limitations | 5 | source-inspected |
| SRC-ANTHROPIC-01 | primary | Claude Code: How Claude remembers your project | https://code.claude.com/docs/zh-CN/memory | CLAUDE.md loading, @ imports, nested rules and enforcement limits | 5 | verified_2026-07-26 |
| SRC-OPENAI-01 | primary | Unrolling the Codex agent loop | https://openai.com/index/unrolling-the-codex-agent-loop/ | AGENTS.md discovery, scope, precedence and size handling | 5 | verified_2026-07-26 |
| SRC-CURSOR-01 | primary | Cursor Rules | https://docs.cursor.com/context/rules | .cursor/rules and MDC rule semantics | 5 | verified_2026-07-26 |
| SRC-GITHUB-01 | primary | Adding repository custom instructions for GitHub Copilot | https://docs.github.com/en/copilot/how-tos/configure-custom-instructions-in-your-ide/add-repository-instructions-in-your-ide | .github/copilot-instructions.md, path instructions, AGENTS.md support boundaries | 5 | verified_2026-07-26 |
| SRC-WINDSURF-01 | primary | Windsurf AGENTS.md | https://docs.windsurf.com/de/windsurf/cascade/agents-md | AGENTS.md auto-scoping and .windsurf/rules engine | 5 | verified_2026-07-26 |

## Compatibility conclusions

- Claude Code: root `CLAUDE.md` is correct, but actual file inclusion requires `@path` imports; backticked paths are literal.
- Codex: root `AGENTS.md` is correct for global repository instructions; nested scope and precedence should be modeled for larger repositories.
- Cursor: `.cursor/rules/*.mdc` is aligned with the current project-rule mechanism.
- GitHub Copilot: `.github/copilot-instructions.md` is correct for repository-wide instructions; path-specific instructions and AGENTS.md support vary by environment.
- Windsurf: current primary documentation emphasizes root/nested `AGENTS.md` and `.windsurf/rules/*.md`; `.windsurfrules` should not be the sole production adapter target.
