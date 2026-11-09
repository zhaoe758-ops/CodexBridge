import fs from 'node:fs';
import path from 'node:path';
import type { WeixinPlatformPlugin } from './plugin.js';

/** Archive user-visible messages without serializing transport credentials. */
export function attachConversationArchive(
  plugin: Pick<WeixinPlatformPlugin, 'normalizeInboundEvent' | 'sendText' | 'sendMedia'>,
  directory: string,
): void {
  const root = path.resolve(directory);
  fs.mkdirSync(root, { recursive: true, mode: 0o700 });
  const record = (entry: Record<string, unknown>) => {
    const timestamp = new Date().toISOString();
    try {
      fs.appendFileSync(path.join(root, `${timestamp.slice(0, 10)}.jsonl`),
        JSON.stringify({ timestamp, ...entry }) + '\n', { mode: 0o600 });
    } catch (error) {
      // A full disk must not prevent /stop or the delivery of an existing reply.
      console.error('[weixin-archive] Failed to save conversation', error);
    }
  };
  const normalize = plugin.normalizeInboundEvent.bind(plugin);
  plugin.normalizeInboundEvent = async payload => {
    const event = await normalize(payload);
    if (event) record({
      direction: 'inbound', scopeId: event.externalScopeId, text: event.text,
      attachments: event.attachments ?? [],
    });
    return event;
  };
  const sendText = plugin.sendText.bind(plugin);
  plugin.sendText = async params => {
    record({ direction: 'outbound', kind: 'text', scopeId: params.externalScopeId, text: params.content, status: 'attempt' });
    const result = await sendText(params);
    record({ direction: 'outbound', kind: 'text', scopeId: params.externalScopeId,
      text: result.deliveredText, status: result.success ? 'delivered' : 'failed',
      deliveredCount: result.deliveredCount });
    return result;
  };
  const sendMedia = plugin.sendMedia.bind(plugin);
  plugin.sendMedia = async params => {
    record({ direction: 'outbound', kind: 'media', scopeId: params.externalScopeId,
      filePath: params.filePath, caption: params.caption ?? '', status: 'attempt' });
    const result = await sendMedia(params);
    record({ direction: 'outbound', kind: 'media', scopeId: params.externalScopeId,
      filePath: result.sentPath, caption: result.sentCaption,
      status: result.success ? 'delivered' : 'failed' });
    return result;
  };
}
