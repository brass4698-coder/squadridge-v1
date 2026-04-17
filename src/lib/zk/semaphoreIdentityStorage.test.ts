import { describe, expect, it, beforeEach } from 'vitest';
import { getOrCreateSessionIdentity } from './semaphoreIdentityStorage';

describe('semaphoreIdentityStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates and persists a new identity when storage empty', () => {
    const a = getOrCreateSessionIdentity();
    const b = getOrCreateSessionIdentity();
    expect(a.commitment).toEqual(b.commitment);
    expect(localStorage.getItem('squadridge_semaphore_identity_v1')).toBeTruthy();
  });

  it('inMemoryOnly avoids localStorage', () => {
    localStorage.clear();
    const a = getOrCreateSessionIdentity({ inMemoryOnly: true });
    const b = getOrCreateSessionIdentity({ inMemoryOnly: true });
    expect(a.commitment).toEqual(b.commitment);
    expect(localStorage.getItem('squadridge_semaphore_identity_v1')).toBeNull();
  });
});
