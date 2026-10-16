import assert from 'node:assert/strict';
import test from 'node:test';
import { withinBcryptByteLimit } from '../lib/password-length.ts';

test('password byte limit matches backend validation for ASCII and Unicode', () => {
  assert.equal(withinBcryptByteLimit('a'.repeat(72)), true);
  assert.equal(withinBcryptByteLimit('a'.repeat(73)), false);
  assert.equal(withinBcryptByteLimit('é'.repeat(36)), true);
  assert.equal(withinBcryptByteLimit('é'.repeat(37)), false);
});
