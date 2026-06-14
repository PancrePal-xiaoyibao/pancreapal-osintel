# Codex Project Instructions

## Development Ethics and Execution Rules

1. 禁止采用“临时打补丁、先过命令、功能降级”的修复方式。
2. 遇到架构/流程级问题时，必须优先做根因修复与一致性重构，不得用兼容层长期掩盖问题。
3. 需要与基线仓库保持一致时，先对齐主流程与行为，再处理扩展功能。
4. 若实现路径存在分歧，必须先与用户确认，不得自行降级决策。

## Project Baseline for Comparison

- 基线仓库路径：`/Users/qinxiaoqiang/Downloads/graphify`
- 用途：作为代码逻辑与流程一致性对比标准。

## Project Workflow

1. Read this file before implementation work.
2. Check `docs/decision-log.md`, `docs/progress.md`, `docs/handoff.md`, and `docs/git-log.md`.
3. Use those files as the source of truth for decisions, current progress, handoff notes, and important git history.
4. Update the relevant docs after meaningful work instead of leaving context only in chat.
5. Record important commits or pushes with date, change, reason, and impact.
6. If creating or editing `SKILL.md` or `skills.md`, ensure valid YAML frontmatter delimited by `---`.

## File Safety Rules

1. 禁止删除当前项目目录以外的任何目录或文件。
2. 尤其禁止删除分区、系统目录、用户主目录、Downloads 根目录、项目外目录。
3. 只允许在当前项目目录内新增、修改、删除文件。
4. 如确需操作项目外文件，必须先明确向用户确认。
5. 不得使用 `rm -rf`、`git clean -fdx`、批量删除脚本等高风险命令清理项目外路径。

