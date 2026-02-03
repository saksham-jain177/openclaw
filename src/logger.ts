/**
 * PHASE C — MINIMAL LOGGER
 * Simple console logger with structured formatting.
 * Ready for future secret scrub implementation.
 */

export const logger = {
  info: (msg: string) => {
    console.log(`[INFO] ${new Date().toISOString()} | ${msg}`);
  },
  warn: (msg: string) => {
    console.warn(`[WARN] ${new Date().toISOString()} | ${msg}`);
  },
  error: (msg: string) => {
    console.error(`[ERROR] ${new Date().toISOString()} | ${msg}`);
  },
  debug: (msg: string) => {
    // Only logged if needed
    if (process.env.DEBUG) {
      console.debug(`[DEBUG] ${new Date().toISOString()} | ${msg}`);
    }
  }
};
