import { describe, expect, it } from 'vitest';
import { workspaceRoleFromPath } from './workspaceRole';

describe('workspaceRoleFromPath', () => {
  it('maps facilitator spine paths', () => {
    expect(workspaceRoleFromPath('/app')).toBe('facilitator');
    expect(workspaceRoleFromPath('/app/facilitator')).toBe('facilitator');
    expect(workspaceRoleFromPath('/app/sessions')).toBe('facilitator');
  });

  it('maps participant and moderator', () => {
    expect(workspaceRoleFromPath('/app/participant')).toBe('participant');
    expect(workspaceRoleFromPath('/app/moderator')).toBe('moderator');
  });

  it('maps mediator inquiry', () => {
    expect(workspaceRoleFromPath('/app/mediator')).toBe('mediator');
  });
});
