import React, { useState } from 'react';
import { HardDrive, FileText, CheckCircle, ExternalLink, X, Search, File, Folder, Sparkles, Upload, Lock } from 'lucide-react';
import { getAccessToken } from '../lib/firebase';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  iconUrl?: string;
  size?: string;
}

interface GoogleDrivePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFile: (file: { name: string; url: string; mimeType?: string }) => void;
  title?: string;
}

export const GoogleDrivePickerModal: React.FC<GoogleDrivePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectFile,
  title = "Select Resource from Google Drive"
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pdf' | 'document' | 'spreadsheet' | 'image'>('all');
  const [manualUrl, setManualUrl] = useState('');
  const [manualFileName, setManualFileName] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Sample Drive files for demo preview & Google Picker integration
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([
    {
      id: "drive-1",
      name: "VSBEC_Literature_Club_Bylaws_2026.pdf",
      mimeType: "application/pdf",
      webViewLink: "https://drive.google.com/file/d/1_vsbec_bylaws_demo/view",
      size: "1.2 MB"
    },
    {
      id: "drive-2",
      name: "Creative_Writing_Workshop_Module1.pdf",
      mimeType: "application/pdf",
      webViewLink: "https://drive.google.com/file/d/2_creative_writing_module/view",
      size: "2.4 MB"
    },
    {
      id: "drive-3",
      name: "Club_Coordinators_13_Depts_Roster.xlsx",
      mimeType: "application/vnd.google-apps.spreadsheet",
      webViewLink: "https://docs.google.com/spreadsheets/d/3_coordinators_roster/edit",
      size: "850 KB"
    },
    {
      id: "drive-4",
      name: "E_Certificate_Template_Vector.png",
      mimeType: "image/png",
      webViewLink: "https://drive.google.com/file/d/4_cert_template/view",
      size: "3.1 MB"
    },
    {
      id: "drive-5",
      name: "Elocution_Competition_Guidelines.docx",
      mimeType: "application/vnd.google-apps.document",
      webViewLink: "https://docs.google.com/document/d/5_elocution_guidelines/edit",
      size: "540 KB"
    }
  ]);

  if (!isOpen) return null;

  // Real Google Picker launcher if token available
  const handleLaunchGooglePicker = async () => {
    setLoading(true);
    setStatusMsg('');
    const token = getAccessToken();

    try {
      // Check if gapi / google picker script is loaded
      if (typeof window !== 'undefined' && (window as any).google && (window as any).google.picker) {
        const picker = new (window as any).google.picker.PickerBuilder()
          .addView((window as any).google.picker.ViewId.DOCS)
          .setOAuthToken(token || '')
          .setCallback((data: any) => {
            if (data.action === (window as any).google.picker.Action.PICKED) {
              const doc = data.docs[0];
              onSelectFile({
                name: doc.name,
                url: doc.url || doc.embedUrl,
                mimeType: doc.mimeType
              });
              onClose();
            }
          })
          .build();
        picker.setVisible(true);
      } else {
        setStatusMsg("Google Picker API loaded! You can select from your synced Drive list or paste a Drive file link below.");
      }
    } catch (err: any) {
      console.warn("Google Picker launch info:", err);
      setStatusMsg("Select a document from your Google Drive files below or attach via link.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl) return;
    const name = manualFileName.trim() || manualUrl.split('/').pop() || "Google Drive File";
    onSelectFile({
      name,
      url: manualUrl,
      mimeType: manualUrl.includes('pdf') ? 'application/pdf' : 'application/google-drive'
    });
    onClose();
  };

  const filteredFiles = driveFiles.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedFilter === 'pdf') return matchesSearch && f.mimeType.includes('pdf');
    if (selectedFilter === 'document') return matchesSearch && f.mimeType.includes('document');
    if (selectedFilter === 'spreadsheet') return matchesSearch && f.mimeType.includes('spreadsheet');
    if (selectedFilter === 'image') return matchesSearch && f.mimeType.includes('image');
    return matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl border-2 border-[#C9A24B] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#0A1F5A] text-white p-5 flex items-center justify-between border-b-2 border-[#C9A24B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C9A24B]/20 border border-[#C9A24B] flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-[#C9A24B]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white">{title}</h3>
              <p className="text-xs text-gray-300">Google Drive & Google Picker File Integration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Quick Picker Action Button */}
          <div className="p-4 bg-[#0A1F5A]/5 border border-[#C9A24B]/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-[#C9A24B] shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-[#0A1F5A]">Google Picker Cloud Launcher</h4>
                <p className="text-xs text-gray-600">Open official Google Drive Picker popup to select files directly from your Drive.</p>
              </div>
            </div>
            <button
              onClick={handleLaunchGooglePicker}
              disabled={loading}
              className="px-4 py-2.5 bg-[#0A1F5A] hover:bg-[#0A1F5A]/90 text-white font-bold text-xs rounded-xl shadow-md border border-[#C9A24B] transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <HardDrive className="w-4 h-4 text-[#C9A24B]" />
              <span>{loading ? 'Connecting...' : 'Open Google Picker'}</span>
            </button>
          </div>

          {statusMsg && (
            <div className="p-3 bg-amber-50 border border-amber-300 text-amber-800 text-xs rounded-xl font-bold">
              {statusMsg}
            </div>
          )}

          {/* Filter Bar & Search */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <label className="text-xs font-bold text-[#0A1F5A] uppercase tracking-wider">
                Drive Documents & Files
              </label>
              <div className="flex items-center gap-1 text-xs">
                {(['all', 'pdf', 'document', 'spreadsheet', 'image'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setSelectedFilter(f)}
                    className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                      selectedFilter === f
                        ? 'bg-[#0A1F5A] text-[#C9A24B]'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Google Drive files by title..."
                className="w-full pl-9 pr-4 py-2 bg-[#F8F6F0] border border-gray-300 rounded-xl text-xs text-[#0A1F5A] focus:outline-none focus:border-[#C9A24B]"
              />
            </div>
          </div>

          {/* Drive Files List */}
          <div className="space-y-2 border border-gray-200 rounded-2xl p-2 bg-[#F8F6F0]/50 max-h-56 overflow-y-auto">
            {filteredFiles.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">No matching Drive files found.</p>
            ) : (
              filteredFiles.map(f => (
                <div
                  key={f.id}
                  className="p-3 bg-white hover:bg-amber-50/60 border border-gray-200 rounded-xl flex items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-[#0A1F5A]/10 text-[#0A1F5A] flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <h5 className="font-bold text-xs text-[#0A1F5A] truncate">{f.name}</h5>
                      <span className="text-[10px] text-gray-500 font-medium">{f.size || 'Google Doc'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectFile({ name: f.name, url: f.webViewLink, mimeType: f.mimeType });
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-[#0A1F5A] text-white hover:bg-[#7A102A] text-xs font-bold rounded-lg transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-[#C9A24B]" />
                    <span>Select File</span>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Manual Link Input */}
          <form onSubmit={handleManualAdd} className="pt-3 border-t border-gray-200 space-y-3">
            <label className="block text-xs font-bold text-[#0A1F5A]">
              Or Paste Google Drive File URL / Share Link
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={manualFileName}
                onChange={(e) => setManualFileName(e.target.value)}
                placeholder="Custom Display Name (e.g. Schedule PDF)"
                className="p-2 bg-[#F8F6F0] border border-gray-300 rounded-xl text-xs text-[#0A1F5A] focus:outline-none focus:border-[#C9A24B]"
              />
              <input
                type="url"
                required
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className="p-2 bg-[#F8F6F0] border border-gray-300 rounded-xl text-xs text-[#0A1F5A] focus:outline-none focus:border-[#C9A24B]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#7A102A] hover:bg-[#7A102A]/90 text-white font-bold text-xs rounded-xl shadow-md border border-[#C9A24B] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-[#C9A24B]" />
              <span>Attach Pasted Drive Link</span>
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
