import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClassificationAgent } from './classificationAgent.js';
import { globalEventBus } from '../core/events.js';
import { EventKind, VERSION_PIN } from '../core/schemas.js';

vi.mock('../logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }
}));

describe('ClassificationAgent', () => {
  let agent: ClassificationAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    // We don't need a singleton here for unit tests
    agent = new ClassificationAgent();
  });

  it('classifies URGENT emails as high priority', async () => {
    const publishSpy = vi.spyOn(globalEventBus, 'publish');
    
    const intakeEvent = {
      v: VERSION_PIN,
      kind: EventKind.Intake,
      traceId: '550e8400-e29b-41d4-a716-446655440000',
      ts: Date.now(),
      sender: 'boss@example.com',
      externalId: 'msg-1',
      subject: 'URGENT: Please read',
      body: 'We need to talk ASAP.'
    };

    // Simulate event delivery
    // @ts-ignore
    await agent['process'](intakeEvent);

    expect(publishSpy).toHaveBeenCalledWith(expect.objectContaining({
      kind: EventKind.Classification,
      priority: 'high',
      traceId: '550e8400-e29b-41d4-a716-446655440000',
      abstract: expect.stringContaining('boss@example.com')
    }));
  });

  it('classifies normal emails as low priority', async () => {
    const publishSpy = vi.spyOn(globalEventBus, 'publish');
    
    const intakeEvent = {
      v: VERSION_PIN,
      kind: EventKind.Intake,
      traceId: 'c9bf9e57-1685-4c89-bafb-ff5af830be8a',
      ts: Date.now(),
      sender: 'friend@example.com',
      externalId: 'msg-2',
      subject: 'Lunch tomorrow?',
      body: 'Are you free for lunch at the usual place?'
    };

    // @ts-ignore
    await agent['process'](intakeEvent);

    expect(publishSpy).toHaveBeenCalledWith(expect.objectContaining({
      kind: EventKind.Classification,
      priority: 'low',
      traceId: 'c9bf9e57-1685-4c89-bafb-ff5af830be8a'
    }));
  });
});
