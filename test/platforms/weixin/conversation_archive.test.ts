import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { attachConversationArchive } from '../../../src/platforms/weixin/conversation_archive.js';

test('archives inbound messages and actual delivery outcomes without transport credentials', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'weixin-archive-'));
  const event = { externalScopeId: 'peer', text: '你好', attachments: [], metadata: { secret: 'DO-NOT-ARCHIVE' } };
  const plugin: any = {
    normalizeInboundEvent: async (payload: any) => payload.ignored ? null : event,
    sendText: async () => ({ success: false, deliveredText: '部分回复', deliveredCount: 1 }),
    sendMedia: async () => ({ success: true, sentPath: '/example/report.pdf', sentCaption: '报告' }),
  };
  try {
    attachConversationArchive(plugin, directory);
    assert.equal(await plugin.normalizeInboundEvent({ context_token: 'DO-NOT-ARCHIVE' }), event);
    await plugin.normalizeInboundEvent({ ignored: true });
    const textResult = await plugin.sendText({ externalScopeId: 'peer', content: '完整回复' });
    assert.equal(textResult.success, false);
    await plugin.sendMedia({ externalScopeId: 'peer', filePath: '/example/report.pdf', caption: '报告' });
    const content = fs.readFileSync(path.join(directory, fs.readdirSync(directory)[0]), 'utf8');
    const entries = content.trim().split('\n').map(line => JSON.parse(line));
    assert.equal(entries.length, 5);
    assert.equal(entries[0].text, '你好');
    assert.equal(entries[2].status, 'failed');
    assert.equal(entries[2].text, '部分回复');
    assert.equal(entries[4].status, 'delivered');
    assert.equal(content.includes('DO-NOT-ARCHIVE'), false);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
