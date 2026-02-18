import { globalEventBus } from '../core/events.js';
import { EventKind, IntakeEvent, ClassificationEvent, VERSION_PIN } from '../core/schemas.js';
import { logger } from '../logger.js';
import { BoundaryGuard } from '../core/boundary.js';

/**
 * PHASE E — CLASSIFICATION AGENT
 * Deterministic, read-only consumers of IntakeEvents.
 * Emits ClassificationEvent.
 */

export class ClassificationAgent {
  constructor() {
    this.setupSubscription();
  }

  private setupSubscription() {
    globalEventBus.subscribe(EventKind.Intake, async (event) => {
      // 1. Double-Check Blindness (Defensive)
      if (event.kind !== EventKind.Intake) {
        return;
      }

      logger.info(`[CLASSIFICATION_AGENT] Processing Intake Trace:${event.traceId}`);
      
      try {
        const intakeEvent = event as IntakeEvent;
        this.process(intakeEvent);
      } catch (err: any) {
        // Failure Law: Log and Drop.
        logger.error(`[CLASSIFICATION_AGENT] Failed to process trace ${event.traceId}: ${err.message}`);
        // Optional: Fail trace via BoundaryGuard if critical, but for now we drop.
        BoundaryGuard.failTrace(event.traceId, `Classification Error: ${err.message}`);
      }
    });
  }

  private process(event: IntakeEvent) {
    // 2. Deterministic Logic (Pure Function)
    const { priority, abstract } = this.classify(event);

    // 3. Emit Output
    const classificationEvent: ClassificationEvent = {
        v: VERSION_PIN,
        kind: EventKind.Classification,
        traceId: event.traceId, // Propagate Trace ID
        ts: Date.now(),
        priority,
        abstract
    };

    globalEventBus.publish(classificationEvent);
    logger.info(`[CLASSIFICATION_AGENT] Published Classification Trace:${event.traceId} Priority:${priority}`);
  }

  /**
   * pure logic for skeleton phase
   */
  private classify(event: IntakeEvent): { priority: 'high' | 'low'; abstract: string } {
    const content = `${event.subject || ''} ${event.body}`.toLowerCase();
    
    // Keyword matching
    const isUrgent = content.includes('urgent') || 
                     content.includes('asap') || 
                     content.includes('important');

    const priority = isUrgent ? 'high' : 'low';
    
    // Simple abstract generation
    const sender = event.sender || 'Unknown';
    const subject = event.subject || 'No Subject';
    const abstract = `Email from ${sender}: ${subject}`;

    return { priority, abstract };
  }
}

// Singleton instantiation
export const classificationAgent = new ClassificationAgent();
