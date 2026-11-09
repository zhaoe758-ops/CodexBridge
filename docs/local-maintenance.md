# Maintained WeChat bridge

Source: [Gan-Xing/CodexBridge](https://github.com/Gan-Xing/CodexBridge).
Maintained copy: [zhaoe758-ops/CodexBridge](https://github.com/zhaoe758-ops/CodexBridge).

This copy includes cancellation fixes for `/stop`, QR login retry handling,
configurable model and image-generation settings, and optional WeChat message
archiving. Original commit history and attribution are preserved.

## Separate WeChat accounts

Run each account with its own state directory, working directory, service label,
and native API port. Keep account credentials and service environment files
outside the repository. The existing launchd installer supports `LABEL`,
`CODEXBRIDGE_STATE_DIR`, `SERVICE_ENV_FILE`, and `CODEXBRIDGE_DEFAULT_CWD`.

Set `CODEXBRIDGE_CONVERSATION_ARCHIVE_DIR` to an absolute private directory to
enable daily JSONL archives of incoming messages and outgoing delivery results.
Archives are grouped by UTC date. A `delivered` entry records transport success,
not confirmation that the user has read the message.

## macOS service recovery

Check `launchctl print gui/$(id -u)/com.ganxing.codexbridge-weixin` and the service
logs. A service file renamed from `.plist` to `.disabled` is not automatically
loaded on login. Restore the intended `.plist` and load it with `launchctl
bootstrap`, or rerun `scripts/service/install-launchd-user.sh` with the correct
account-specific settings. Do not replace another account's configuration.

## Publishing changes

Review the diff and run relevant tests with `TZ=UTC node scripts/test.mjs ...`.
The tests need local loopback ports for mocked transports. Commit only reviewed
source, documentation, and tests, then push to `origin`. Never force-push.
The public repository excludes environment files, login tokens, account state,
conversation archives, logs, attachments, and generated task outputs.
