import { google, Auth } from 'googleapis';
import { logger } from '../../logger.js';

/**
 * PHASE D — GMAIL AUTH HELPER
 * Loads OAuth2 credentials from Environment Variables.
 */

export function getGmailAuth(): Auth.OAuth2Client | null {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    logger.warn("[GMAIL_AUTH] Missing credentials. Adapter will remain inert.");
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return oauth2Client;
}
