import { globalEventBus } from '../../core/events.js';
import { IntakeEvent, VERSION_PIN, EventKind } from '../../core/schemas.js';
import { randomUUID } from 'node:crypto';

/**
 * PHASE D — PUBLISH WRAPPER
 * Centralized point for publishing IntakeEvents.
 * Ensures initial validation and traceId assignment.
 */

export function publishIntakeEvent(eventData: Omit<IntakeEvent, 'v' | 'kind' | 'traceId' | 'ts'>): string {
  const traceId = randomUUID();
  
  const event: IntakeEvent = {
    v: VERSION_PIN,
    kind: EventKind.Intake,
    traceId,
    ts: Date.now(),
    ...eventData,
  };

  globalEventBus.publish(event);
  return traceId;
}
