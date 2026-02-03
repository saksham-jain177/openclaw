import { gmail_v1 } from 'googleapis';
import { IntakeEvent, VERSION_PIN, EventKind } from '../../core/schemas.js';
import { logger } from '../../logger.js';

/**
 * PHASE D — GMAIL NORMALIZER
 * Converts Gmail messages to lawful IntakeEvents.
 * Enforces the 5 Hardening Rules and flat mapping.
 */

export class GmailNormalizer {
  /**
   * Normalize and harden a Gmail message into an IntakeEvent.
   * Returns null if the message fails hardening (e.g., empty body).
   */
  public normalize(message: gmail_v1.Schema$Message, plainTextBody: string): Partial<IntakeEvent> | null {
    if (!message.id) {
      logger.warn(`[GMAIL_NORMALIZER] Dropping message: missing message ID`);
      return null;
    }

    const headers = message.payload?.headers || [];
    const from = headers.find(h => h.name?.toLowerCase() === 'from')?.value || 'unknown';
    const subject = headers.find(h => h.name?.toLowerCase() === 'subject')?.value || 'No Subject';

    // Apply Hardening Rules to Body
    const hardenedBody = this.hardenBody(plainTextBody);
    if (!hardenedBody) {
      logger.warn(`[GMAIL_NORMALIZER] Dropping message ${message.id}: empty body after hardening`);
      return null;
    }

    // Flat Mapping as per Clarification 1
    return {
      v: VERSION_PIN,
      kind: EventKind.Intake,
      source: "email",
      traceId: "", // Will be assigned by EventBus
      ts: Date.now(),
      sender: this.normalizeEmail(from),
      body: hardenedBody,
      externalId: message.id,
      subject: subject,
    } as any; 
  }

  /**
   * Rule 1-4: HTML/Control chars removal, UTF-8 encoding, and Safe Truncation.
   */
  private hardenBody(text: string): string {
    if (!text) return "";

    // 1. Strip Control Characters (except \n and \t)
    // 2. Ensuring UTF-8 is implicit in JS strings, but we can filter non-printable
    let hardened = text.replace(/[\x00-\x08\x0B\x0C\x0D\x0E-\x1F\x7F]/g, "");

    // 3. HTML Removal (Simple strip if any slipped in, though we fetched plain/text)
    hardened = hardened.replace(/<[^>]*>?/gm, '');

    // 4. Max Length: 10,000 characters
    if (hardened.length > 10000) {
      hardened = hardened.slice(0, 10000);
    }

    return hardened.trim();
  }

  /**
   * Extract raw email from "Name <email@example.com>" format.
   */
  private normalizeEmail(from: string): string {
    const match = from.match(/<(.+@.+)>/);
    if (match) {
      return match[1].trim();
    }
    return from.trim();
  }
}
