import React, { useState } from 'react';
import { X, FileSpreadsheet, Download, CheckCircle, RefreshCw, Layers, Award } from 'lucide-react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { Winner } from '../types';

interface BulkCertificateModalProps {
  onClose: () => void;
  workshopTitle?: string;
}

export const BulkCertificateModal: React.FC<BulkCertificateModalProps> = ({
  onClose,
  workshopTitle = "State Level Literary Symposium 2026",
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [customTitle, setCustomTitle] = useState(workshopTitle);
  const [parsedData, setParsedData] = useState<Array<{ name: string; department: string; eventName: string; certificateCode: string }>>([
    { name: "Priya Dharshini M.", department: "Computer Science & Engineering", eventName: "Micro-Poetry Slam", certificateCode: "VSB-LC-2026-901" },
    { name: "Karthik Subramanian", department: "Electronics & Communication", eventName: "Parliamentary Debate", certificateCode: "VSB-LC-2026-902" },
    { name: "Sanjana Roy", department: "Information Technology", eventName: "Essay Writing Contest", certificateCode: "VSB-LC-2026-903" },
    { name: "Arun Kumar B.", department: "Mechanical Engineering", eventName: "Book Review Critique", certificateCode: "VSB-LC-2026-904" }
  ]);
  const [generating, setGenerating] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');

  // Handle Excel File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const bstr = event.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json<any>(worksheet);

        const mapped = json.map((row, idx) => ({
          name: row['Name'] || row['Student Name'] || row['Full Name'] || row['name'] || `Student ${idx + 1}`,
          department: row['Department'] || row['Dept'] || row['department'] || 'Engineering',
          eventName: row['Event'] || row['Event Name'] || row['Workshop'] || customTitle,
          certificateCode: `VSB-LC-2026-${1000 + idx}`,
        }));

        if (mapped.length > 0) {
          setParsedData(mapped);
        }
      } catch (err) {
        alert("Failed to parse Excel file. Please ensure columns include 'Name' and 'Department'.");
      }
    };

    reader.readAsBinaryString(uploadedFile);
  };

  // Add Row Manually
  const handleAddRow = () => {
    setParsedData([
      ...parsedData,
      {
        name: "New Student",
        department: "Computer Science & Engineering",
        eventName: customTitle,
        certificateCode: `VSB-LC-2026-${1000 + parsedData.length}`,
      },
    ]);
  };

  // Delete Row
  const handleDeleteRow = (index: number) => {
    setParsedData(parsedData.filter((_, i) => i !== index));
  };

  // Update Row
  const handleUpdateRow = (index: number, field: string, value: string) => {
    const updated = [...parsedData];
    updated[index] = { ...updated[index], [field]: value };
    setParsedData(updated);
  };

  // Bulk Download Zip
  const handleBulkZipDownload = async () => {
    if (parsedData.length === 0) return;
    setGenerating(true);
    setProgressMsg('Building certificate ZIP package...');

    try {
      const zip = new JSZip();

      parsedData.forEach((item, idx) => {
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Certificate - ${item.name}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Playfair+Display:ital,wght@0,600;1,600&family=Plus+Jakarta+Sans:wght@500;700&display=swap');
              body { margin: 0; background: #F8F6F0; font-family: 'Plus Jakarta Sans', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
              .font-serif-title { font-family: 'Cinzel', serif; }
              .font-serif-body { font-family: 'Playfair Display', serif; }
            </style>
          </head>
          <body>
            <div style="width: 1000px; height: 700px; padding: 40px; background: #F8F6F0; border: 12px solid #0A1F5A; border-radius: 16px; position: relative; text-align: center; color: #0A1F5A;">
              <div style="border: 2px solid #C9A24B; height: 100%; width: 100%; box-sizing: border-box; padding: 30px; display: flex; flex-direction: column; justify-content: space-between;">
                
                <div>
                  <h3 style="color: #7A102A; font-size: 14px; text-transform: uppercase; font-weight: bold; margin: 0;">VSB Engineering College, Karur</h3>
                  <h1 className="font-serif-title" style="font-size: 32px; margin: 5px 0; color: #0A1F5A;">LITERATURE CLUB</h1>
                  <p style="color: #C9A24B; font-style: italic; margin: 0;">Certificate of Merit & Winner Achievement</p>
                </div>

                <div>
                  <h2 className="font-serif-title" style="font-size: 28px; color: #7A102A; text-transform: uppercase;">Certificate of Completion</h2>
                  <p style="font-size: 14px; color: #555;">This is proudly presented to</p>
                  <h1 className="font-serif-body" style="font-size: 36px; border-bottom: 2px dashed #C9A24B; display: inline-block; padding: 0 30px; color: #0A1F5A; margin: 10px 0;">${item.name}</h1>
                  <p style="font-size: 15px; margin: 5px 0;">Department of <strong>${item.department}</strong></p>
                  <p style="font-size: 14px; color: #333;">for outstanding achievement in the event/workshop: <strong>"${item.eventName || customTitle}"</strong></p>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: flex-end; font-size: 12px;">
                  <div style="text-align: left;">
                    <p><strong>Issue Date:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>Certificate Code:</strong> ${item.certificateCode}</p>
                  </div>
                  <div style="text-align: right;">
                    <p style="font-weight: bold; color: #7A102A; border-bottom: 1px solid #999; padding-bottom: 2px;">Dr. K. Senthil Kumar</p>
                    <p style="color: #666; font-size: 11px;">Faculty Head / Literary Coordinator</p>
                  </div>
                </div>

              </div>
            </div>
          </body>
          </html>
        `;

        zip.file(`Certificate_${idx + 1}_${item.name.replace(/\s+/g, '_')}.html`, htmlContent);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VSB_Literature_Club_Winner_Certificates.zip`;
      a.click();

      setProgressMsg('Download initiated successfully!');
    } catch (err) {
      alert("Error generating bulk ZIP file.");
    } finally {
      setGenerating(false);
    }
  };

  // Bulk Print Sheet
  const handleBulkPrint = () => {
    const printWindow = window.open('', '_blank', 'width=1100,height=800');
    if (!printWindow) return;

    const cardsHtml = parsedData.map((item) => `
      <div style="width: 1000px; height: 700px; padding: 40px; background: #F8F6F0; border: 10px solid #0A1F5A; border-radius: 16px; position: relative; text-align: center; color: #0A1F5A; page-break-after: always; margin: 20px auto;">
        <div style="border: 2px solid #C9A24B; height: 100%; padding: 30px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h3 style="color: #7A102A; font-size: 14px; text-transform: uppercase; font-weight: bold; margin: 0;">VSB Engineering College, Karur</h3>
            <h1 style="font-size: 32px; margin: 5px 0; color: #0A1F5A; font-family: 'Cinzel', serif;">LITERATURE CLUB</h1>
            <p style="color: #C9A24B; font-style: italic; margin: 0;">Certificate of Merit & Excellence</p>
          </div>
          <div>
            <h2 style="font-size: 28px; color: #7A102A; font-family: 'Cinzel', serif;">CERTIFICATE OF MERIT</h2>
            <p style="font-size: 14px; color: #555;">This is proudly presented to</p>
            <h1 style="font-size: 36px; border-bottom: 2px dashed #C9A24B; display: inline-block; padding: 0 30px; color: #0A1F5A; margin: 10px 0; font-family: 'Playfair Display', serif;">${item.name}</h1>
            <p style="font-size: 15px;">Department of <strong>${item.department}</strong></p>
            <p style="font-size: 14px; color: #333;">for active participation and winning in: <strong>"${item.eventName || customTitle}"</strong></p>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: flex-end; font-size: 12px;">
            <div style="text-align: left;">
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>ID:</strong> ${item.certificateCode}</p>
            </div>
            <div style="text-align: right;">
              <p style="font-weight: bold; color: #7A102A; border-bottom: 1px solid #999;">Dr. K. Senthil Kumar</p>
              <p style="color: #666;">Faculty Coordinator</p>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bulk Winner Certificates</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Playfair+Display:ital,wght@0,600;1,600&family=Plus+Jakarta+Sans:wght@500;700&display=swap');
            body { margin: 0; background: #fff; font-family: 'Plus Jakarta Sans', sans-serif; }
            @page { size: landscape; margin: 0; }
          </style>
        </head>
        <body>
          ${cardsHtml}
          <script>
            setTimeout(() => { window.print(); }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#F8F6F0] rounded-xl border-2 border-[#C9A24B] shadow-2xl w-full max-w-4xl overflow-hidden text-[#0A1F5A]">
        
        {/* Header */}
        <div className="bg-[#0A1F5A] px-6 py-4 flex items-center justify-between text-[#F8F6F0] border-b-2 border-[#C9A24B]">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#C9A24B]" />
            <h3 className="font-serif-title text-lg font-bold">Excel Bulk Certificate Generator & Download</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Top Options Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-[#C9A24B]/30 shadow-sm">
            <div>
              <label className="block text-xs font-bold text-[#0A1F5A] uppercase tracking-wider mb-1">
                Upload Winners / Attendees Excel (.xlsx / .csv)
              </label>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="block w-full text-xs text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#0A1F5A] file:text-[#F8F6F0] hover:file:bg-[#7A102A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0A1F5A] uppercase tracking-wider mb-1">
                Event / Workshop Title
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none"
              />
            </div>
          </div>

          {/* Table Preview */}
          <div className="bg-white rounded-xl border border-[#C9A24B]/30 overflow-hidden shadow-sm">
            <div className="p-3 bg-[#0A1F5A] text-[#F8F6F0] flex items-center justify-between text-xs font-bold">
              <span>Parsed Excel Winners List ({parsedData.length} Recipients)</span>
              <button
                type="button"
                onClick={handleAddRow}
                className="px-3 py-1 bg-[#C9A24B] text-[#0A1F5A] rounded hover:bg-white transition-colors font-bold"
              >
                + Add Student
              </button>
            </div>

            <div className="overflow-x-auto max-h-60">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8F6F0] border-b border-[#C9A24B]/30 text-[#0A1F5A]">
                    <th className="p-2 font-bold">#</th>
                    <th className="p-2 font-bold">Student Name</th>
                    <th className="p-2 font-bold">Department</th>
                    <th className="p-2 font-bold">Event / Achievement</th>
                    <th className="p-2 font-bold">Cert ID</th>
                    <th className="p-2 font-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {parsedData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-2 text-gray-500 font-mono">{idx + 1}</td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => handleUpdateRow(idx, 'name', e.target.value)}
                          className="w-full px-2 py-1 bg-[#F8F6F0] border border-gray-300 rounded text-xs font-semibold"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.department}
                          onChange={(e) => handleUpdateRow(idx, 'department', e.target.value)}
                          className="w-full px-2 py-1 bg-[#F8F6F0] border border-gray-300 rounded text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.eventName}
                          onChange={(e) => handleUpdateRow(idx, 'eventName', e.target.value)}
                          className="w-full px-2 py-1 bg-[#F8F6F0] border border-gray-300 rounded text-xs"
                        />
                      </td>
                      <td className="p-2 font-mono text-[10px] text-[#7A102A] font-bold">
                        {row.certificateCode}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(idx)}
                          className="text-red-600 hover:text-red-800 font-bold px-2 py-0.5 rounded"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#C9A24B]/30">
            <span className="text-xs text-gray-600 font-medium">
              💡 {parsedData.length} certificates ready to be generated with official college seal.
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBulkPrint}
                className="px-4 py-2 bg-[#0A1F5A] text-white font-bold text-xs rounded-lg hover:bg-opacity-90 shadow"
              >
                🖨️ Bulk Print All ({parsedData.length})
              </button>

              <button
                type="button"
                onClick={handleBulkZipDownload}
                disabled={generating}
                className="flex items-center gap-2 px-6 py-2 bg-[#7A102A] hover:bg-[#7A102A]/90 text-white font-bold text-xs rounded-lg shadow-md transition-all border border-[#C9A24B]"
              >
                <Download className="w-4 h-4 text-[#C9A24B]" />
                <span>{generating ? 'Zipping...' : 'Download ZIP Package'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
