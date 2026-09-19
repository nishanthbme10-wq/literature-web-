import { getAccessToken } from './firebase';

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
}

/**
 * Encode raw RFC 2822 email into base64url format for Gmail REST API
 */
function createRawEmail({ to, subject, body, cc, bcc }: EmailPayload): string {
  const emailLines: string[] = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
  ];

  if (cc) emailLines.push(`Cc: ${cc}`);
  if (bcc) emailLines.push(`Bcc: ${bcc}`);

  emailLines.push(''); // Empty line before body
  emailLines.push(body);

  const emailText = emailLines.join('\r\n');

  // Convert to Base64url (RFC 4648)
  const base64Encoded = window.btoa(unescape(encodeURIComponent(emailText)));
  return base64Encoded
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Send an email directly using Gmail API
 */
export async function sendGmail(payload: EmailPayload) {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Google OAuth Access Token required. Please sign in with Google to send emails via Gmail.');
  }

  const raw = createRawEmail(payload);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw })
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Gmail API error (${response.status}): ${response.statusText}`;
    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson.error?.message) {
        errorMessage = errorJson.error.message;
      }
    } catch (_) {}
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * List recent Gmail messages sent or received by user
 */
export async function listGmailMessages(maxResults = 10, q = '') {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Google OAuth Access Token required.');
  }

  const queryParams = new URLSearchParams({
    maxResults: maxResults.toString(),
    q
  });

  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${queryParams.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to list Gmail messages: ${response.statusText}`);
  }

  return response.json();
}
