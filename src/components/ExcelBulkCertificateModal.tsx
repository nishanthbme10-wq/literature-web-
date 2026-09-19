import React, { useState } from 'react';
import { FileSpreadsheet, Download, Upload, CheckCircle2, AlertCircle, FileArchive, X, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { Certificate, DEPARTMENTS } from '../types';

interface ExcelBulkCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  workshopTitle?: string;
}

interface WinnerExcelRow {
  name: string;
  department: string;
  eventName?: string;
  achievement?: string;
}

export const ExcelBulkCertificateModal: React.FC<ExcelBulkCertificateModalProps> = ({
  isOpen,
  onClose,
  workshopTitle = "Literature Club National Symposium 2026"
}) => {
  const [rows, setRows] = useState<WinnerExcelRow[]>([
    { name: "Priya Dharshini M.", department: "Computer Science & Engineering", eventName: "Micro-Poetry Slam", achievement: "1st Prize" },
    { name: "Karthik Subramanian", department: "Electronics & Communication", eventName: "Oratory Debate", achievement: "Best Speaker" },
    { name: "Sanjana Roy", department: "Information Technology", eventName: "Essay Competition", achievement: "Runner Up" }
  ]);
  const [pastedText, setPastedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  if (!isOpen) return null;

  // Handle Excel File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        if (data && data.length > 0) {
          const parsedRows: WinnerExcelRow[] = data.map(item => ({
            name: item.Name || item.name || item['Student Name'] || item['Winner Name'] || "Student",
            department: item.Department || item.department || item['Dept'] || "Engineering",
            eventName: item.Event || item.eventName || item['Event Name'] || "Literary Competition",
            achievement: item.Achievement || item.achievement || item['Prize'] || "Winner Certificate"
          }));
          setRows(parsedRows);
          setStatusMessage(`Successfully loaded ${parsedRows.length} rows from Excel file!`);
        }
      } catch (err) {
        console.error(err);
        setStatusMessage("Error reading Excel file. Please ensure columns have Name and Department headers.");
      }
    };
    reader.readAsBinaryString(file);
  };

  // Handle Manual Text Parse
  const handleParsePastedText = () => {
    if (!pastedText.trim()) return;
    const lines = pastedText.trim().split('\n');
    const parsed: WinnerExcelRow[] = [];

    lines.forEach(line => {
      const parts = line.split(/,|\t/);
      if (parts.length >= 2) {
        parsed.push({
          name: parts[0].trim(),
          department: parts[1].trim(),
          eventName: parts[2]?.trim() || "Literature Event",
          achievement: parts[3]?.trim() || "Certificate of Excellence"
        });
      }
    });

    if (parsed.length > 0) {
      setRows(parsed);
      setStatusMessage(`Parsed ${parsed.length} entries from text!`);
    }
  };

  // Add Row manually
  const handleAddRow = () => {
    setRows([...rows, { name: "", department: "Computer Science & Engineering", eventName: "Literary Event", achievement: "1st Prize" }]);
  };

  // Update row
  const handleUpdateRow = (index: number, field: keyof WinnerExcelRow, val: string) => {
    const updated = [...rows];
    updated[index][field] = val;
    setRows(updated);
  };

  // Delete row
  const handleDeleteRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  // Generate and Download ZIP of All Certificates
  const handleBulkZipDownload = async () => {
    if (rows.length === 0) return;
    setIsGenerating(true);
    setDownloadProgress(10);
    setStatusMessage("Generating certificates & building ZIP archive...");

    try {
      const zip = new JSZip();
      const folder = zip.folder("Literature_Club_Certificates");

      for (let i = 0; i < rows.length; i++) {
        const item = rows[i];
        if (!item.name.trim()) continue;

        const certCode = `VSB-LC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        
        // Generate clean HTML file for each certificate in ZIP with Gold/White theme
        const certHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Certificate - ${item.name}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Playfair+Display:ital,wght@0,700;1,400&family=Plus+Jakarta+Sans:wght@500;700&display=swap');
      body { margin: 0; padding: 40px; background: #FFFFFF; font-family: 'Plus Jakarta Sans', sans-serif; }
      .cert-box {
        width: 900px; height: 600px; margin: auto; background: #FFFFFF; border: 8px solid #D4AF37;
        position: relative; padding: 30px; box-sizing: border-box; text-align: center; color: #171717;
      }
      .inner-border { position: absolute; inset: 10px; border: 2px solid #C9A227; pointer-events: none; }
      .header-title { font-family: 'Cinzel', serif; font-size: 24px; font-weight: 800; color: #171717; }
      .sub-title { font-family: 'Cinzel', serif; font-size: 28px; color: #A67C00; margin-top: 10px; }
      .recipient { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; border-bottom: 2px dashed #D4AF37; display: inline-block; padding: 5px 30px; margin: 15px 0; color: #171717; }
      .workshop-title { background: rgba(212,175,55,0.1); padding: 10px; font-weight: bold; border-radius: 6px; font-size: 18px; margin: 15px auto; max-width: 600px; color: #A67C00; }
      .footer { position: absolute; bottom: 30px; left: 30px; right: 30px; display: flex; justify-content: space-between; font-size: 12px; align-items: flex-end; color: #666666; }
    </style>
  </head>
  <body>
    <div class="cert-box">
      <div class="inner-border"></div>
      <div style="color: #A67C00; font-size: 12px; font-weight: bold; letter-spacing: 2px;">VSB ENGINEERING COLLEGE, KARUR</div>
      <div class="header-title">LITERATURE CLUB</div>
      <div class="sub-title">CERTIFICATE OF MERIT</div>
      <p style="font-size: 14px; margin-top: 20px; color: #666666;">This certificate is proudly awarded to</p>
      <div class="recipient">${item.name}</div>
      <p style="font-size: 14px;">Department of <strong>${item.department}</strong></p>
      <p style="font-size: 13px; color: #666666;">for outstanding achievement [${item.achievement || 'Winner'}] in <strong>${item.eventName || workshopTitle}</strong>.</p>
      <div class="workshop-title">${workshopTitle}</div>
      <div class="footer">
        <div style="text-align: left;">
          <div><strong>Date:</strong> August 2026</div>
          <div><strong>Cert ID:</strong> ${certCode}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-family: 'Playfair Display', serif; color: #A67C00; font-weight: bold; font-size: 16px;">Dr. K. Senthil Kumar</div>
          <div>Faculty In-Charge, Literature Club</div>
        </div>
      </div>
    </div>
  </body>
</html>`;

        folder?.file(`${item.name.replace(/[^a-zA-Z0-9]/g, '_')}_Certificate.html`, certHtml);
        setDownloadProgress(Math.round(((i + 1) / rows.length) * 80));
      }

      // Generate text summary sheet
      const csvContent = "Name,Department,Event,Achievement,CertificateCode\n" + 
        rows.map(r => `"${r.name}","${r.department}","${r.eventName || ''}","${r.achievement || ''}","VSB-LC-2026-${Math.floor(1000+Math.random()*9000)}"`).join("\n");
      
      folder?.file("Winners_Certificate_Directory.csv", csvContent);

      setDownloadProgress(90);
      const content = await zip.generateAsync({ type: "blob" });

      // Trigger download
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `VSB_LitClub_Winner_Certificates_Batch.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadProgress(100);
      setStatusMessage(`Downloaded ${rows.length} winner certificates in a ZIP archive!`);
    } catch (err) {
      console.error(err);
      setStatusMessage("Failed to generate ZIP archive. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-[#D4AF37] overflow-hidden my-8 text-[#171717]">
        
        {/* Modal Header */}
        <div className="bg-[#FAFAFA] px-6 py-4 flex items-center justify-between border-b border-[#D4AF37]/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#D4AF37]/15 rounded-xl border border-[#D4AF37]/35">
              <FileSpreadsheet className="w-5 h-5 text-[#A67C00]" />
            </div>
            <div>
              <h2 className="font-serif-title text-lg font-bold text-[#171717]">Excel Sheet Bulk Certificate Generator</h2>
              <p className="text-xs text-[#666666]">Upload Excel or enter Name & Department to generate & batch-download certificates</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-[#171717] transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Action Row: Upload Excel or Paste Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Upload Box */}
            <div className="bg-[#FAFAFA] p-4 rounded-2xl border border-[#D4AF37]/30 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-sm text-[#171717] flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#A67C00]" />
                  <span>1. Upload Excel / CSV File</span>
                </h3>
                <p className="text-xs text-[#666666] mt-1">
                  Upload `.xlsx` or `.csv` file with <strong>Name</strong> and <strong>Department</strong> columns.
                </p>
              </div>
              <label className="mt-3 cursor-pointer bg-white hover:bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-[#A67C00] py-2 px-4 rounded-xl text-xs font-bold text-center block transition-all shadow-sm">
                <span>Select Excel File (.xlsx, .csv)</span>
                <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Paste Data Box */}
            <div className="bg-[#FAFAFA] p-4 rounded-2xl border border-[#D4AF37]/30 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-sm text-[#171717] flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-[#A67C00]" />
                  <span>2. Or Paste Rows (Name, Dept, Event)</span>
                </h3>
                <p className="text-xs text-[#666666] mt-1">Paste tabular text from Excel (tab or comma separated).</p>
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Priya Dharshini, CSE, Poetry Slam, 1st Prize"
                  className="w-full text-xs p-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  onClick={handleParsePastedText}
                  className="bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer shadow-sm"
                >
                  Parse
                </button>
              </div>
            </div>

          </div>

          {statusMessage && (
            <div className="p-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl text-xs text-[#A67C00] font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#A67C00]" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Editable Table */}
          <div className="bg-white rounded-2xl border border-[#D4AF37]/30 overflow-hidden shadow-sm">
            <div className="p-3 bg-[#FAFAFA] border-b border-[#D4AF37]/20 flex items-center justify-between">
              <span className="text-xs font-bold text-[#171717] uppercase tracking-wider">
                Winner & Participant Entries ({rows.length})
              </span>
              <button
                onClick={handleAddRow}
                className="text-xs text-[#A67C00] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                + Add Winner Row
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gradient-to-r from-[#FAFAFA] to-white text-[#171717] border-b border-[#D4AF37]/20 sticky top-0 font-bold">
                  <tr>
                    <th className="p-2.5 font-bold">#</th>
                    <th className="p-2.5 font-bold">Student Name</th>
                    <th className="p-2.5 font-bold">Department</th>
                    <th className="p-2.5 font-bold">Event / Achievement</th>
                    <th className="p-2.5 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="p-2.5 text-gray-400 font-mono">{idx + 1}</td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => handleUpdateRow(idx, 'name', e.target.value)}
                          placeholder="Student Name"
                          className="w-full p-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D4AF37] font-medium bg-white"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={row.department}
                          onChange={(e) => handleUpdateRow(idx, 'department', e.target.value)}
                          className="w-full p-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D4AF37] bg-white text-xs font-medium"
                        >
                          {DEPARTMENTS.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.achievement || ''}
                          onChange={(e) => handleUpdateRow(idx, 'achievement', e.target.value)}
                          placeholder="Achievement (e.g. 1st Place)"
                          className="w-full p-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D4AF37] bg-white"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <button
                          onClick={() => handleDeleteRow(idx)}
                          className="text-rose-600 hover:text-rose-800 p-1 rounded font-bold text-xs cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-400">
                        No entries yet. Click "Add Winner Row" or upload an Excel file.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Progress Bar */}
          {isGenerating && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[#171717] font-semibold">
                <span>Building Certificates...</span>
                <span>{downloadProgress}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#D4AF37] to-[#A67C00] h-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-[#FAFAFA] px-6 py-4 border-t border-[#D4AF37]/20 flex items-center justify-between">
          <span className="text-xs text-[#666666]">
            Generates individual certificate HTMLs & Directory CSV in a single ZIP file.
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-[#666666] hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkZipDownload}
              disabled={rows.length === 0 || isGenerating}
              className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] via-[#C9A227] to-[#A67C00] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <FileArchive className="w-4 h-4 text-white" />
              <span>Bulk Download All Certificates (ZIP)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
