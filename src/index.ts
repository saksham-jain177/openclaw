import './agents/stubs.js';
import { globalEventBus } from './core/events.js';
import { logger } from './logger.js';
import { GmailAdapter } from './adapters/email/gmailAdapter.js';
import { getGmailAuth } from './adapters/email/auth.js';
import { classificationAgent } from './agents/classificationAgent.js';

/**
 * PHASE E — SYSTEM ENTRY POINT
 * Initializes the lawful orchestration skeleton with Gmail ingress and Classification logic.
 */

async function main() {
  logger.info("--- PERSONAL OPS AUTOMATION AGENT ---");
  logger.info("Status: BOUNDARY ENFORCEMENT ACTIVE");
  logger.info("Mode: CLASSIFICATION ENABLED (PHASE E)");
  logger.info("-------------------------------------");

  // Initialize Agents
  // Note: classificationAgent is initialized on import in its module.
  logger.info("[SYSTEM] Classification Agent active.");

  const auth = getGmailAuth();
  if (auth) {
    const adapter = new GmailAdapter(auth);
    // Manual poll trigger for Phase D demonstration
    // In production, this would be called by a separate orchestration tick
    logger.info("[SYSTEM] Gmail Adapter initialized. Ready for poll().");
    
    // Example: Manual poll on start for verification
    // adapter.poll(); 
  }

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
