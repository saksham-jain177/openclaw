import { describe, it, expect } from 'vitest';
import { GmailNormalizer } from './gmailNormalizer.js';

describe('GmailNormalizer Hardening Rules', () => {
  const normalizer = new GmailNormalizer();
  const mockMsg = {
    id: '12345',
    payload: {
      headers: [
        { name: 'From', value: 'John Doe <john@example.com>' },
        { name: 'Subject', value: 'Hello World' }
      ]
    }
  };

  it('Rule 1 & 3: Strips HTML and Control Characters', () => {
    const rawBody = "Hello <b>World</b>\r\n\x00\x07This is a test.";
    const result = normalizer.normalize(mockMsg as any, rawBody);
    
    expect(result).not.toBeNull();
    // HTML <b> stripped, \r stripped, \x00\x07 stripped. \n kept.
    expect(result!.body).toBe("Hello World\nThis is a test.");
  });

  it('Rule 4: Safely truncates body at 10,000 characters', () => {
    const longBody = "A".repeat(11000);
    const result = normalizer.normalize(mockMsg as any, longBody);
    
    expect(result).not.toBeNull();
    expect(result!.body.length).toBe(10000);
  });

  it('Rule 5: Drops message if body is empty after hardening', () => {
    const emptyBody = "   ";
    const controlOnly = "\x00\x01\x02";
    const htmlOnly = "<html><body></body></html>";

    expect(normalizer.normalize(mockMsg as any, emptyBody)).toBeNull();
    expect(normalizer.normalize(mockMsg as any, controlOnly)).toBeNull();
    expect(normalizer.normalize(mockMsg as any, htmlOnly)).toBeNull();
  });

  it('Mapping Rule: Correctly flattens Gmail fields into IntakeEvent', () => {
    const result = normalizer.normalize(mockMsg as any, "Hello");
    
    expect(result).toMatchObject({
      kind: 'INTAKE_EVENT',
      source: 'email',
      sender: 'john@example.com',
      externalId: '12345',
      subject: 'Hello World',
      body: 'Hello'
    });
  });

  it('Mapping Rule: Handles missing subject with default', () => {
    const msgNoSub = { id: 'x', payload: { headers: [{ name: 'From', value: 'me@me.com' }] } };
    const result = normalizer.normalize(msgNoSub as any, "Hello");
    expect(result!.subject).toBe('No Subject');
  });
});
