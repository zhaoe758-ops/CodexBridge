# Project maintenance and GitHub synchronization

This repository is the maintained WeChat/Codex bridge based on
https://github.com/Gan-Xing/CodexBridge.

## Authorized publication

The owner has requested that completed fixes and project changes be synchronized
to the public repository https://github.com/zhaoe758-ops/CodexBridge.
After completing changes, review the diff, run relevant checks, commit the
reviewed project files, and push to the owner's repository before reporting the
task complete. Report any failed checks or blocked push honestly.

- `origin` is the owner's repository; `upstream` is Gan-Xing/CodexBridge.
- Preserve upstream history and attribution. Do not push to `upstream`.
- Do not force-push or overwrite remote changes. Fetch and inspect divergence.
- Stage only reviewed files; do not blindly stage the entire workspace.
- Never commit credentials, login QR codes, environment files, account/session
  state, private chat archives, attachments, logs, or generated task outputs.
- Do not copy the first or second WeChat account's runtime directories into Git.
- Keep live service configuration outside Git; document portable setup steps.
- If another task is editing these files, do not commit its unfinished work.
- Tests assume UTC: use `TZ=UTC node scripts/test.mjs <relevant test files>`.
- The owner declined GitHub Actions workflow permission. Keep CI examples in
  `docs/ci-examples/`; do not create `.github/workflows/` or request workflow scope.
- The owner cancelled scheduled synchronization. Push as part of completing
  authorized project changes; do not create an hourly sync automation.
