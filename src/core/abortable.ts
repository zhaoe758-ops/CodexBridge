// Stop waiting promptly, while still observing a late rejection from the operation.
// Callers must check the signal before starting subsequent side effects.
export async function abortable<T>(operation: () => Promise<T>, signal?: AbortSignal): Promise<T> {
  signal?.throwIfAborted();
  if (!signal) {
    return operation();
  }
  let onAbort: () => void = () => {};
  const interrupted = new Promise<never>((_resolve, reject) => {
    onAbort = () => reject(signal.reason);
    signal.addEventListener('abort', onAbort, { once: true });
  });
  try {
    return await Promise.race([operation(), interrupted]);
  } finally {
    signal.removeEventListener('abort', onAbort);
  }
}
