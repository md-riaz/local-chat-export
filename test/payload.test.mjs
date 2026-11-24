import assert from 'node:assert/strict';
import test from 'node:test';
import { createPayloadId, consumePayload } from '../extension/payload.js';

function fakeStorage() {
  const values = new Map();
  return {
    values,
    async set(object) { Object.entries(object).forEach(([key, value]) => values.set(key, value)); },
    async get(key) { return { [key]: values.get(key) }; },
    async remove(key) { values.delete(key); },
  };
}

test('payload handoff consumes the one-time storage value', async () => {
  const storage = fakeStorage();
  const id = await createPayloadId(storage, { title: 'Plan', messages: [] }, () => 'fixed-id');
  assert.equal(id, 'fixed-id');
  assert.deepEqual(await consumePayload(storage, id), { title: 'Plan', messages: [] });
  assert.equal(await consumePayload(storage, id), null);
  assert.equal(storage.values.size, 0);
});
