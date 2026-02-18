import { globalEventBus } from '../core/events.js';
import { EventKind, IntakeEvent, ClassificationEvent, PlanEvent, ApprovalEvent, ExecutionEvent } from '../core/schemas.js';
import { BoundaryGuard } from '../core/boundary.js';
import { logger } from '../logger.js';

/**
 * PHASE C — AGENT STUBS
 * Empty consumers that only log validated events.
 * Stubs assert blindness and hard-fail on unauthorized event types.
 */

const logStub = (name: string, event: any) => {
  logger.info(`[STUB:${name}] Trace:${event.traceId} acknowledged.`);
};

// -- INTAKE AGENT STUB --
globalEventBus.subscribe(EventKind.Intake, async (event) => {
  if (event.kind !== EventKind.Intake) {
    BoundaryGuard.failTrace(event.traceId, `IntakeAgent received unauthorized event: ${event.kind}`);
    return;
  }
  logStub("IntakeAgent", event);
});

// -- CLASSIFICATION AGENT STUB --
// Disabled in Phase E as the real ClassificationAgent is now active.
/*
globalEventBus.subscribe(EventKind.Classification, async (event) => {
  if (event.kind !== EventKind.Classification) {
    BoundaryGuard.failTrace(event.traceId, `ClassificationAgent received unauthorized event: ${event.kind}`);
    return;
  }
  logStub("ClassificationAgent", event);
});
*/

// -- PLANNER AGENT STUB --
globalEventBus.subscribe(EventKind.Plan, async (event) => {
  if (event.kind !== EventKind.Plan) {
    BoundaryGuard.failTrace(event.traceId, `PlannerAgent received unauthorized event: ${event.kind}`);
    return;
  }
  logStub("PlannerAgent", event);
});

// -- EXECUTION AGENT STUB --
globalEventBus.subscribe(EventKind.Execution, async (event) => {
  if (event.kind !== EventKind.Execution) {
    BoundaryGuard.failTrace(event.traceId, `ExecutionAgent received unauthorized event: ${event.kind}`);
    return;
  }
  logStub("ExecutionAgent", event);
});

// Approval Stub (for loop closure)
globalEventBus.subscribe(EventKind.Approval, async (event) => {
  if (event.kind !== EventKind.Approval) {
    BoundaryGuard.failTrace(event.traceId, `ApprovalStub received unauthorized event: ${event.kind}`);
    return;
  }
  logStub("ApprovalStub", event);
});
