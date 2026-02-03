import './agents/stubs.js';
import { globalEventBus } from './core/events.js';
import { logger } from './logger.js';

/**
 * PHASE C — SYSTEM ENTRY POINT
 * Initializes the lawful orchestration skeleton.
 */

async function main() {
  logger.info("--- PERSONAL OPS AUTOMATION AGENT ---");
  logger.info("Status: BOUNDARY ENFORCEMENT ACTIVE");
  logger.info("Mode: INERT SKELETON (PHASE C)");
  logger.info("-------------------------------------");

  // The system is now waiting for events published via the EventBus.
  // In Phase C, no external adapters exist. 
  // Events would be injected via tests or future Phase D adapters.
  
  process.on('SIGINT', () => {
    logger.info("System shutting down lawfully.");
    process.exit(0);
  });

  // Keep the process alive
  setInterval(() => {
    // Heartbeat logic removed as per Phase B. 
    // This interval just keeps the event loop alive for the skeleton.
  }, 1000000);
}

main().catch(err => {
  logger.error(`Fatal system error: ${err.message}`);
  process.exit(1);
});
