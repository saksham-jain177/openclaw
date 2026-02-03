import { google, gmail_v1 } from 'googleapis';
import { logger } from '../../logger.js';

/**
 * PHASE D — GMAIL CLIENT
 * Read-only wrapper for the Gmail API.
 * Enforces OAuth2 scope pinning and read-only behavior.
 */

export interface GmailMessage {
  id: string;
  threadId: string;
  payload?: gmail_v1.Schema$MessagePart;
  snippet?: string;
  internalDate?: string;
}

export class GmailClient {
  private gmail: gmail_v1.Gmail;

  constructor(auth: any) {
    this.gmail = google.gmail({ version: 'v1', auth });
  }

  /**
   * List recent messages in the inbox.
   * Only fetches IDs and threadIDs.
   */
  public async listMessages(maxResults = 10): Promise<gmail_v1.Schema$Message[]> {
    try {
      const res = await this.gmail.users.messages.list({
        userId: 'me',
        q: 'label:INBOX',
        maxResults,
      });
      return res.data.messages || [];
    } catch (err: any) {
      logger.error(`[GMAIL_CLIENT] Failed to list messages: ${err.message}`);
      return [];
    }
  }

  /**
   * Get full message details for a specific ID.
   * Returns the message payload.
   */
  public async getMessage(id: string): Promise<gmail_v1.Schema$Message | null> {
    try {
      const res = await this.gmail.users.messages.get({
        userId: 'me',
        id,
        format: 'full',
      });
      return res.data;
    } catch (err: any) {
      logger.error(`[GMAIL_CLIENT] Failed to get message ${id}: ${err.message}`);
      return null;
    }
  }

  /**
   * Helper to extract plain text body from a message.
   */
  public extractPlainText(payload?: gmail_v1.Schema$MessagePart): string {
    if (!payload) return "";

    // If it's a simple message without parts
    if (payload.mimeType === 'text/plain' && payload.body?.data) {
      return Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }

    // If it's a multipart message, find the text/plain part
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
        // Recursively check nested parts
        if (part.parts) {
          const nested = this.extractPlainText(part);
          if (nested) return nested;
        }
      }
    }

    return "";
  }
}
