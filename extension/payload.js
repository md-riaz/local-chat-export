export async function createPayloadId(storage, payload, random = globalThis.crypto?.randomUUID?.bind(globalThis.crypto)) {
  const id = random?.() ?? `export-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  await storage.set({ [`export:${id}`]: payload });
  return id;
}

export async function consumePayload(storage, id) {
  const key = `export:${id}`;
  const result = await storage.get(key);
  await storage.remove(key);
  return result[key] ?? null;
}
