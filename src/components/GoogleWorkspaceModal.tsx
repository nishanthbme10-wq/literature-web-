import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  FolderPlus,
  Upload,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Sparkles,
  X,
  Plus,
  Mail,
  Send,
  Image as ImageIcon,
  FolderOpen
} from 'lucide-react';
import {
  listDriveFiles,
  createDriveFolder,
  uploadFileToDrive,
  createGoogleSheet,
  createGoogleForm,
  DriveFile
} from '../lib/googleWorkspace';
import { sendGmail } from '../lib/gmail';
import { openGooglePicker, PickerFile } from '../lib/googlePicker';
import { getAccessToken, googleSignIn } from '../lib/firebase';

interface GoogleWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workshopsData?: any[];
  winnersData?: any[];
  attendanceData?: any[];
}

export const GoogleWorkspaceModal: React.FC<GoogleWorkspaceModalProps> = ({
  isOpen,
  onClose,
  workshopsData = [],
  winnersData = [],
  attendanceData = []
}) => {
  const [activeTab, setActiveTab] = useState<'drive' | 'sheets' | 'forms' | 'gmail' | 'picker'>('drive');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Drive state
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [newFolderName, setNewFolderName] = useState('VSB Literature Club');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  // Sheets state
  const [sheetTitle, setSheetTitle] = useState('VSB Literature Club Report');
  const [exportTarget, setExportTarget] = useState<'winners' | 'attendance' | 'workshops'>('winners');
  const [createdSheetUrl, setCreatedSheetUrl] = useState<string | null>(null);

  // Forms state
  const [formTitle, setFormTitle] = useState('Literature Club Registration Form');
  const [formDesc, setFormDesc] = useState('Official registration for VSB Literary Events & Workshops');
  const [createdFormUrl, setCreatedFormUrl] = useState<string | null>(null);

  // Gmail state
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('VSB Literature Club Announcement');
  const [emailBody, setEmailBody] = useState('Dear Student,\n\nWe are pleased to invite you to the upcoming Literature Club event.\n\nBest Regards,\nVSB Literature Club Team');

  // Google Picker state
  const [pickedFile, setPickedFile] = useState<PickerFile | null>(null);

  if (!isOpen) return null;

  const hasToken = !!getAccessToken();

  const handleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await googleSignIn();
      setStatusMsg('Successfully authenticated with Google Workspace!');
    } catch (e: any) {
      setErrorMsg(e.message || 'Google Auth Failed');
    } finally {
      setLoading(false);
    }
  };

  // GMAIL ACTION
  const handleSendGmailAction = async () => {
    if (!emailTo.trim() || !emailSubject.trim() || !emailBody.trim()) {
      setErrorMsg('Please fill in Recipient, Subject, and Body fields.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      await sendGmail({
        to: emailTo.trim(),
        subject: emailSubject.trim(),
        body: emailBody.replace(/\n/g, '<br/>')
      });
      setStatusMsg(`Email sent successfully via Gmail to ${emailTo}!`);
      setEmailTo('');
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to send Gmail message');
    } finally {
      setLoading(false);
    }
  };

  // PICKER ACTION
  const handleTriggerPicker = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await openGooglePicker((file) => {
        setPickedFile(file);
        setStatusMsg(`Picked file "${file.name}" from Google Drive!`);
      }, 'images');
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to open Google Picker');
    } finally {
      setLoading(false);
    }
  };

  // DRIVE ACTIONS
  const handleFetchDriveFiles = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const files = await listDriveFiles(15);
      setDriveFiles(files);
      setStatusMsg(`Loaded ${files.length} files from Google Drive`);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to list Drive files');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const folder = await createDriveFolder(newFolderName.trim());
      setStatusMsg(`Created folder "${folder.name}" in Google Drive!`);
      handleFetchDriveFiles();
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to create folder');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDriveFile = async () => {
    if (!fileToUpload) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const text = await fileToUpload.text();
      const uploaded = await uploadFileToDrive(fileToUpload.name, text, fileToUpload.type || 'text/plain');
      setStatusMsg(`Uploaded "${uploaded.name}" to Google Drive!`);
      setFileToUpload(null);
      handleFetchDriveFiles();
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  // SHEETS ACTIONS
  const handleExportToSheet = async () => {
    setLoading(true);
    setErrorMsg(null);
    setCreatedSheetUrl(null);

    try {
      let headers: string[] = [];
      let rows: string[][] = [];

      if (exportTarget === 'winners') {
        headers = ['Name', 'Department', 'Year', 'Event Name', 'Achievement', 'Month / Year'];
        rows = winnersData.map((w) => [
          w.name || '',
          w.department || '',
          w.year || '',
          w.eventName || '',
          w.achievementTitle || '',
          w.monthYear || ''
        ]);
      } else if (exportTarget === 'attendance') {
        headers = ['Workshop Title', 'Student Name', 'Department', 'Status', 'Marked At'];
        rows = attendanceData.map((a) => [
          a.workshopTitle || '',
          a.studentName || '',
          a.department || '',
          a.status || '',
          a.markedAt || ''
        ]);
      } else {
        headers = ['Title', 'Topic', 'Date', 'Time', 'Venue', 'Speaker', 'Status'];
        rows = workshopsData.map((ws) => [
          ws.title || '',
          ws.topic || '',
          ws.date || '',
          ws.time || '',
          ws.venue || '',
          ws.speaker || '',
          ws.status || ''
        ]);
      }

      const result = await createGoogleSheet(sheetTitle, headers, rows);
      setCreatedSheetUrl(result.spreadsheetUrl);
      setStatusMsg(`Successfully created Google Sheet "${sheetTitle}"!`);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to export to Google Sheets');
    } finally {
      setLoading(false);
    }
  };

  // FORMS ACTIONS
  const handleCreateFormAction = async () => {
    setLoading(true);
    setErrorMsg(null);
    setCreatedFormUrl(null);

    try {
      const questions = [
        { title: 'Full Name', type: 'text' as const, required: true },
        { title: 'Register Number / Roll No', type: 'text' as const, required: true },
        { title: 'Department', type: 'radio' as const, options: ['CSE', 'ECE', 'EEE', 'IT', 'MECH', 'CIVIL', 'AIDS'], required: true },
        { title: 'Year of Study', type: 'radio' as const, options: ['1st Year', '2nd Year', '3rd Year', '4th Year'], required: true },
        { title: 'College Email ID', type: 'text' as const, required: true },
        { title: 'Why do you want to participate?', type: 'paragraph' as const, required: false }
      ];

      const form = await createGoogleForm(formTitle, formDesc, questions);
      setCreatedFormUrl(form.responderUri);
      setStatusMsg(`Created Google Form "${formTitle}"!`);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to create Google Form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-[#D4AF37] my-8 text-[#171717]">
        
        {/* Header */}
        <div className="bg-[#FAFAFA] px-6 py-5 flex items-center justify-between border-b border-[#D4AF37]/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#D4AF37]/15 rounded-xl border border-[#D4AF37]/35 text-[#A67C00]">
              <Sparkles className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif-title text-[#171717]">Google Workspace Suite</h2>
              <p className="text-xs text-[#666666]">Gmail, Google Picker, Drive, Sheets & Forms Integration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-[#171717] hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Notice Bar */}
        {!hasToken ? (
          <div className="bg-[#FAFAFA] border-b border-[#D4AF37]/25 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#A67C00] flex-shrink-0" />
              <p className="text-xs text-[#171717]">
                Sign in with Google to enable Gmail, Picker, Drive, Sheets, and Forms.
              </p>
            </div>
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              Sign In with Google
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Google Workspace OAuth Authorized & Ready
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-[#FAFAFA] px-6 pt-3 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('gmail')}
            className={`px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 rounded-t-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'gmail'
                ? 'bg-white text-[#171717] border-t border-x border-[#D4AF37]/30 shadow-sm'
                : 'text-[#666666] hover:text-[#171717]'
            }`}
          >
            <Mail className="w-4 h-4 text-[#D4AF37]" />
            Gmail Send
          </button>
          <button
            onClick={() => setActiveTab('picker')}
            className={`px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 rounded-t-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'picker'
                ? 'bg-white text-[#171717] border-t border-x border-[#D4AF37]/30 shadow-sm'
                : 'text-[#666666] hover:text-[#171717]'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-[#D4AF37]" />
            Google Picker
          </button>
          <button
            onClick={() => setActiveTab('drive')}
            className={`px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 rounded-t-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'drive'
                ? 'bg-white text-[#171717] border-t border-x border-[#D4AF37]/30 shadow-sm'
                : 'text-[#666666] hover:text-[#171717]'
            }`}
          >
            <FolderPlus className="w-4 h-4 text-[#D4AF37]" />
            Google Drive
          </button>
          <button
            onClick={() => setActiveTab('sheets')}
            className={`px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 rounded-t-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'sheets'
                ? 'bg-white text-[#171717] border-t border-x border-[#D4AF37]/30 shadow-sm'
                : 'text-[#666666] hover:text-[#171717]'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-[#D4AF37]" />
            Google Sheets
          </button>
          <button
            onClick={() => setActiveTab('forms')}
            className={`px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 rounded-t-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'forms'
                ? 'bg-white text-[#171717] border-t border-x border-[#D4AF37]/30 shadow-sm'
                : 'text-[#666666] hover:text-[#171717]'
            }`}
          >
            <FileText className="w-4 h-4 text-[#D4AF37]" />
            Google Forms
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {/* Messages */}
          {statusMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              {statusMsg}
            </div>
          )}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* GMAIL TAB */}
          {activeTab === 'gmail' && (
            <div className="space-y-4 bg-[#FAFAFA] p-5 rounded-2xl border border-[#D4AF37]/30">
              <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D4AF37]" />
                Send Email Announcement via Gmail API
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1">
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="e.g., student@vsb.ac.in"
                    className="w-full text-xs px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1">
                    Email Content / Message Body
                  </label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={4}
                    className="w-full text-xs px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37] font-sans"
                  />
                </div>

                <button
                  onClick={handleSendGmailAction}
                  disabled={loading || !hasToken}
                  className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Send Email via Gmail
                </button>
              </div>
            </div>
          )}

          {/* PICKER TAB */}
          {activeTab === 'picker' && (
            <div className="space-y-4 bg-[#FAFAFA] p-5 rounded-2xl border border-[#D4AF37]/30">
              <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-[#D4AF37]" />
                Google Picker File Chooser
              </h3>
              <p className="text-xs text-[#666666]">
                Select images, workshop posters, or event photos directly from your Google Drive or Google Photos library using the official Google Picker dialog.
              </p>

              <button
                onClick={handleTriggerPicker}
                disabled={loading || !hasToken}
                className="px-5 py-3 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
                Launch Google Picker Window
              </button>

              {pickedFile && (
                <div className="p-4 bg-white border border-[#D4AF37]/30 rounded-2xl space-y-2">
                  <p className="text-xs font-bold text-[#A67C00] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    File Selected via Google Picker:
                  </p>
                  <div className="text-xs text-[#666666] space-y-1">
                    <p><strong className="text-[#171717]">Name:</strong> {pickedFile.name}</p>
                    <p><strong className="text-[#171717]">Type:</strong> {pickedFile.mimeType}</p>
                    <p><strong className="text-[#171717]">URL:</strong> <a href={pickedFile.url} target="_blank" rel="noreferrer" className="text-[#A67C00] underline break-all">{pickedFile.url}</a></p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DRIVE TAB */}
          {activeTab === 'drive' && (
            <div className="space-y-6">
              
              {/* Create Folder */}
              <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-[#D4AF37]/30 space-y-3">
                <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-[#D4AF37]" />
                  Create Club Folder in Google Drive
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name..."
                    className="flex-1 text-xs px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />
                  <button
                    onClick={handleCreateFolder}
                    disabled={loading || !hasToken}
                    className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white text-xs font-semibold rounded-xl shadow-md disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Create Folder
                  </button>
                </div>
              </div>

              {/* Upload File */}
              <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-[#D4AF37]/30 space-y-3">
                <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#D4AF37]" />
                  Upload Document or CSV to Drive
                </h3>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
                    className="text-xs text-[#666666] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#D4AF37]/15 file:text-[#A67C00] cursor-pointer"
                  />
                  <button
                    onClick={handleUploadDriveFile}
                    disabled={loading || !fileToUpload || !hasToken}
                    className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white text-xs font-semibold rounded-xl shadow-md disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload
                  </button>
                </div>
              </div>

              {/* List Files */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#171717]">Your Google Drive Files</h3>
                  <button
                    onClick={handleFetchDriveFiles}
                    disabled={loading || !hasToken}
                    className="text-xs text-[#A67C00] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Files
                  </button>
                </div>

                {driveFiles.length === 0 ? (
                  <p className="text-xs text-[#666666] italic bg-[#FAFAFA] p-4 rounded-2xl text-center border border-gray-100">
                    Click "Refresh Files" to list your Google Drive files.
                  </p>
                ) : (
                  <div className="max-h-52 overflow-y-auto border border-gray-200 rounded-2xl divide-y divide-gray-100">
                    {driveFiles.map((file) => (
                      <div key={file.id} className="p-3 hover:bg-[#FAFAFA] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5 truncate max-w-md">
                          <FileCode className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                          <span className="font-medium text-[#171717] truncate">{file.name}</span>
                        </div>
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#A67C00] hover:underline flex items-center gap-1 font-semibold text-[11px]"
                          >
                            Open <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* SHEETS TAB */}
          {activeTab === 'sheets' && (
            <div className="space-y-6">
              <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-[#D4AF37]/30 space-y-4">
                <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-[#D4AF37]" />
                  Export Club Data Directly to Google Sheets
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#171717] mb-1">
                      Spreadsheet Title
                    </label>
                    <input
                      type="text"
                      value={sheetTitle}
                      onChange={(e) => setSheetTitle(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#171717] mb-1">
                      Select Data to Export
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setExportTarget('winners')}
                        className={`p-2.5 text-xs rounded-xl border text-center font-bold transition-all cursor-pointer ${
                          exportTarget === 'winners'
                            ? 'border-[#D4AF37] bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white shadow-sm'
                            : 'border-gray-200 bg-white text-[#666666] hover:bg-gray-50'
                        }`}
                      >
                        Winners List ({winnersData.length})
                      </button>
                      <button
                        onClick={() => setExportTarget('attendance')}
                        className={`p-2.5 text-xs rounded-xl border text-center font-bold transition-all cursor-pointer ${
                          exportTarget === 'attendance'
                            ? 'border-[#D4AF37] bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white shadow-sm'
                            : 'border-gray-200 bg-white text-[#666666] hover:bg-gray-50'
                        }`}
                      >
                        Attendance Logs ({attendanceData.length})
                      </button>
                      <button
                        onClick={() => setExportTarget('workshops')}
                        className={`p-2.5 text-xs rounded-xl border text-center font-bold transition-all cursor-pointer ${
                          exportTarget === 'workshops'
                            ? 'border-[#D4AF37] bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white shadow-sm'
                            : 'border-gray-200 bg-white text-[#666666] hover:bg-gray-50'
                        }`}
                      >
                        Workshops ({workshopsData.length})
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleExportToSheet}
                    disabled={loading || !hasToken}
                    className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Create Live Google Sheet
                  </button>
                </div>
              </div>

              {createdSheetUrl && (
                <div className="p-4 bg-[#FAFAFA] border border-[#D4AF37]/40 rounded-2xl text-center space-y-2 shadow-sm">
                  <p className="text-xs font-bold text-[#A67C00]">Google Sheet Created Successfully!</p>
                  <a
                    href={createdSheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#A67C00] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    Open Live Google Sheet <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* FORMS TAB */}
          {activeTab === 'forms' && (
            <div className="space-y-6">
              <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-[#D4AF37]/30 space-y-4">
                <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#D4AF37]" />
                  Create Live Registration Google Form
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#171717] mb-1">
                      Form Title
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#171717] mb-1">
                      Description
                    </label>
                    <textarea
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      rows={2}
                      className="w-full text-xs px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#D4AF37]/20 text-xs text-[#666666] space-y-1">
                    <p className="font-semibold text-[#171717]">Default Included Questions:</p>
                    <ul className="list-disc list-inside text-[11px] space-y-0.5">
                      <li>Full Name</li>
                      <li>Register Number / Roll No</li>
                      <li>Department (CSE, ECE, EEE, IT, MECH, CIVIL, AIDS)</li>
                      <li>Year of Study (1st - 4th Year)</li>
                      <li>College Email ID</li>
                      <li>Statement of Purpose</li>
                    </ul>
                  </div>

                  <button
                    onClick={handleCreateFormAction}
                    disabled={loading || !hasToken}
                    className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Create Google Form
                  </button>
                </div>
              </div>

              {createdFormUrl && (
                <div className="p-4 bg-[#FAFAFA] border border-[#D4AF37]/40 rounded-2xl text-center space-y-2 shadow-sm">
                  <p className="text-xs font-bold text-[#A67C00]">Google Form Created Successfully!</p>
                  <a
                    href={createdFormUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#A67C00] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    Open Live Google Form <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#FAFAFA] px-6 py-4 border-t border-[#D4AF37]/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-[#666666] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
