import { GmailClient } from './gmailClient.js';
import { GmailNormalizer } from './gmailNormalizer.js';
import { publishIntakeEvent } from './publish.js';
import { logger } from '../../logger.js';

/**
 * PHASE D — GMAIL ADAPTER
 * One-way plumbing: Fetch → Normalize → Publish.
 * No scheduling, no state, no retries.
 */

export class GmailAdapter {
  private client: GmailClient;
  private normalizer: GmailNormalizer;

  constructor(auth: any) {
    this.client = new GmailClient(auth);
    this.normalizer = new GmailNormalizer();
  }

  /**
   * Manual poll entrypoint.
   * scheduling is owned externally.
   */
  public async poll(maxResults = 5): Promise<void> {
    logger.info(`[GMAIL_ADAPTER] Starting Poll (max: ${maxResults})`);
    
    const messages = await this.client.listMessages(maxResults);
    
    for (const msgSummary of messages) {
      if (!msgSummary.id) continue;

      try {
        // 1. Fetch
        const fullMsg = await this.client.getMessage(msgSummary.id);
        if (!fullMsg) continue;

        const body = this.client.extractPlainText(fullMsg.payload);

        // 2. Normalize & Harden
        const intakeData = this.normalizer.normalize(fullMsg, body);
        
        if (intakeData) {
          // 3. Publish
          // We cast because normalizer returns the subset publishIntakeEvent expects
          const traceId = publishIntakeEvent(intakeData as any);
          logger.info(`[GMAIL_ADAPTER] Published message ${msgSummary.id} -> Trace:${traceId}`);
        }
      } catch (err: any) {
        // Drop & Log as per Failure Law
        logger.error(`[GMAIL_ADAPTER] Dropped message ${msgSummary.id} due to processing error: ${err.message}`);
      }
    }
    
    logger.info(`[GMAIL_ADAPTER] Poll Complete.`);
  }
}
