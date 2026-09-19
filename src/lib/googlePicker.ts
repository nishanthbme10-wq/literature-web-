import { getAccessToken } from './firebase';

export interface PickerFile {
  id: string;
  name: string;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
}

/**
 * Load Google Picker API script dynamically if needed
 */
export function loadGooglePickerApi(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).gapi && (window as any).gapi.picker) {
      resolve();
      return;
    }

    if ((window as any).gapi) {
      (window as any).gapi.load('picker', {
        callback: () => resolve(),
        onerror: () => reject(new Error('Failed to load Google Picker API module'))
      });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      (window as any).gapi.load('picker', {
        callback: () => resolve(),
        onerror: () => reject(new Error('Failed to load Google Picker API module'))
      });
    };
    script.onerror = () => reject(new Error('Failed to load Google API script'));
    document.body.appendChild(script);
  });
}

/**
 * Open Google Picker Dialog to pick image or file from Google Drive
 */
export async function openGooglePicker(
  onFilePicked: (file: PickerFile) => void,
  viewType: 'images' | 'docs' | 'all' = 'images'
) {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Google OAuth Token required. Please sign in with Google first.');
  }

  await loadGooglePickerApi();

  const gapi = (window as any).gapi;
  if (!gapi || !gapi.picker) {
    throw new Error('Google Picker API not available.');
  }

  let view = new gapi.picker.DocsView();
  if (viewType === 'images') {
    view = new gapi.picker.DocsView(gapi.picker.ViewId.DOCS_IMAGES);
  } else if (viewType === 'docs') {
    view = new gapi.picker.DocsView(gapi.picker.ViewId.DOCUMENTS);
  }

  view.setIncludeFolders(true);

  const picker = new gapi.picker.PickerBuilder()
    .addView(view)
    .setOAuthToken(token)
    .setCallback((data: any) => {
      if (data.action === gapi.picker.Action.PICKED) {
        const doc = data.docs[0];
        if (doc) {
          const file: PickerFile = {
            id: doc.id,
            name: doc.name,
            mimeType: doc.mimeType,
            url: doc.url || `https://drive.google.com/uc?id=${doc.id}`,
            thumbnailUrl: doc.thumbnails?.[0]?.url
          };
          onFilePicked(file);
        }
      }
    })
    .build();

  picker.setVisible(true);
}
