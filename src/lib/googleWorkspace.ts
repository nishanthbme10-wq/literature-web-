import { getAccessToken } from './firebase';

/**
 * Interface for Google Drive File
 */
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  createdTime?: string;
}

/**
 * Interface for Google Form Question
 */
export interface FormQuestion {
  title: string;
  type: 'text' | 'paragraph' | 'radio' | 'checkbox';
  options?: string[];
  required?: boolean;
}

/**
 * Check if OAuth access token is active
 */
export function hasWorkspaceAccess(): boolean {
  return !!getAccessToken();
}

/**
 * Helper to execute authorized Google Workspace API fetch requests
 */
async function workspaceFetch(url: string, options: RequestInit = {}) {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Google Workspace OAuth access token required. Please sign in with Google first.');
  }

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Workspace API error (${response.status}): ${response.statusText}`;
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

// ==========================================
// GOOGLE DRIVE INTEGRATION
// ==========================================

/**
 * List Google Drive Files
 */
export async function listDriveFiles(pageSize = 15): Promise<DriveFile[]> {
  const queryParams = new URLSearchParams({
    pageSize: pageSize.toString(),
    fields: 'files(id, name, mimeType, webViewLink, iconLink, createdTime)',
    orderBy: 'createdTime desc'
  });
  const data = await workspaceFetch(`https://www.googleapis.com/drive/v3/files?${queryParams.toString()}`);
  return data.files || [];
}

/**
 * Create a Folder in Google Drive
 */
export async function createDriveFolder(folderName: string): Promise<DriveFile> {
  return workspaceFetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    })
  });
}

/**
 * Upload a text or CSV file to Google Drive
 */
export async function uploadFileToDrive(
  fileName: string,
  content: string,
  mimeType = 'text/csv'
): Promise<DriveFile> {
  const token = getAccessToken();
  if (!token) throw new Error('Missing Google OAuth token');

  const metadata = {
    name: fileName,
    mimeType: mimeType
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([content], { type: mimeType }));

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: form
  });

  if (!response.ok) {
    throw new Error(`Drive Upload Failed: ${response.statusText}`);
  }

  return response.json();
}

// ==========================================
// GOOGLE SHEETS INTEGRATION
// ==========================================

/**
 * Create a new Google Spreadsheet and populate it with header and rows
 */
export async function createGoogleSheet(
  title: string,
  headers: string[],
  rows: string[][]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  // 1. Create empty spreadsheet
  const sheetObj = await workspaceFetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    body: JSON.stringify({
      properties: {
        title: title
      }
    })
  });

  const spreadsheetId = sheetObj.spreadsheetId;
  const spreadsheetUrl = sheetObj.spreadsheetUrl;

  // 2. Insert headers & rows if provided
  if (headers.length > 0 || rows.length > 0) {
    const values = [headers, ...rows];
    await workspaceFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        body: JSON.stringify({
          values
        })
      }
    );
  }

  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Append rows to an existing Google Spreadsheet
 */
export async function appendRowsToGoogleSheet(
  spreadsheetId: string,
  range: string,
  rows: string[][]
) {
  return workspaceFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      body: JSON.stringify({
        values: rows
      })
    }
  );
}

/**
 * Read data from a Google Spreadsheet
 */
export async function readGoogleSheetValues(
  spreadsheetId: string,
  range = 'Sheet1!A1:Z100'
): Promise<string[][]> {
  const data = await workspaceFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`
  );
  return data.values || [];
}

// ==========================================
// GOOGLE FORMS INTEGRATION
// ==========================================

/**
 * Create a Google Form for Workshop Registration or Feedback
 */
export async function createGoogleForm(
  title: string,
  description: string,
  questions: FormQuestion[]
): Promise<{ formId: string; responderUri: string }> {
  // 1. Create Form Shell
  const initialForm = await workspaceFetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    body: JSON.stringify({
      info: {
        title,
        description
      }
    })
  });

  const formId = initialForm.formId;
  const responderUri = initialForm.responderUri;

  // 2. Add questions via batchUpdate
  if (questions.length > 0) {
    const requests = questions.map((q, idx) => {
      let questionKind: any = {};
      if (q.type === 'text') {
        questionKind = { textQuestion: { paragraph: false } };
      } else if (q.type === 'paragraph') {
        questionKind = { textQuestion: { paragraph: true } };
      } else if (q.type === 'radio' || q.type === 'checkbox') {
        questionKind = {
          choiceQuestion: {
            type: q.type === 'radio' ? 'RADIO' : 'CHECKBOX',
            options: (q.options || ['Yes', 'No']).map((opt) => ({ value: opt }))
          }
        };
      }

      return {
        createItem: {
          item: {
            title: q.title,
            questionItem: {
              question: {
                required: q.required ?? true,
                ...questionKind
              }
            }
          },
          location: { index: idx }
        }
      };
    });

    await workspaceFetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({
        requests
      })
    });
  }

  return { formId, responderUri };
}

/**
 * Fetch Google Form Responses
 */
export async function getGoogleFormResponses(formId: string) {
  const data = await workspaceFetch(`https://forms.googleapis.com/v1/forms/${formId}/responses`);
  return data.responses || [];
}
