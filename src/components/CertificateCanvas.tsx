import React, { useRef } from 'react';
import { Award, Download, CheckCircle, ShieldCheck } from 'lucide-react';
import { Certificate } from '../types';

interface CertificateCanvasProps {
  certificate: Certificate;
  leftLogoUrl?: string;
  rightLogoUrl?: string;
  onDownload?: () => void;
}

export const CertificateCanvas: React.FC<CertificateCanvasProps> = ({
  certificate,
  leftLogoUrl = "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&q=80&w=200",
  rightLogoUrl = "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=200",
  onDownload
}) => {
  const certRef = useRef<HTMLDivElement>(null);

  const handlePrintDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }

    // Standard high-res browser print / save as PDF
    const printContent = certRef.current?.outerHTML;
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=1100,height=800');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate - ${certificate.studentName}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Playfair+Display:ital,wght@0,600;0,800;1,600&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
            body { margin: 0; padding: 20px; background: #FFFFFF; font-family: 'Plus Jakarta Sans', sans-serif; }
            .font-serif-title { font-family: 'Cinzel', serif; }
            .font-serif-body { font-family: 'Playfair Display', serif; }
            @page { size: landscape; margin: 0; }
          </style>
        </head>
        <body class="flex items-center justify-center min-h-screen">
          <div style="width: 1000px; height: 700px;" class="mx-auto">
            ${printContent}
          </div>
          <script>
            setTimeout(() => {
              window.print();
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-4xl mx-auto">
      {/* Download Action Header */}
      <div className="flex items-center justify-between w-full bg-white p-4 rounded-2xl border border-[#D4AF37]/35 shadow-[0_4px_20px_rgba(212,175,55,0.08)]">
        <div className="flex items-center gap-2 text-[#171717] font-semibold text-sm">
          <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
          <span>Official E-Certificate Verified &bull; ID: <strong className="text-[#A67C00]">{certificate.certificateCode}</strong></span>
        </div>
        <button
          onClick={handlePrintDownload}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] via-[#C9A227] to-[#A67C00] hover:shadow-[0_4px_16px_rgba(212,175,55,0.35)] text-white font-medium text-sm rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 text-white" />
          <span>Download Certificate (PDF/Print)</span>
        </button>
      </div>

      {/* High-Resolution Printable Certificate Frame */}
      <div
        ref={certRef}
        id={`certificate-${certificate.id}`}
        className="relative w-full aspect-[1.414/1] bg-white p-8 md:p-12 text-[#171717] rounded-2xl shadow-2xl overflow-hidden border-8 border-[#D4AF37] select-none"
      >
        {/* Outer & Inner Antique Gold Double Border */}
        <div className="absolute inset-3 border-2 border-[#D4AF37] pointer-events-none rounded-xl" />
        <div className="absolute inset-5 border border-[#D4AF37]/50 pointer-events-none rounded-lg" />

        {/* Decorative Corner Filigrees */}
        <div className="absolute top-6 left-6 w-12 h-12 border-t-4 border-l-4 border-[#D4AF37]" />
        <div className="absolute top-6 right-6 w-12 h-12 border-t-4 border-r-4 border-[#D4AF37]" />
        <div className="absolute bottom-6 left-6 w-12 h-12 border-b-4 border-l-4 border-[#D4AF37]" />
        <div className="absolute bottom-6 right-6 w-12 h-12 border-b-4 border-r-4 border-[#D4AF37]" />

        {/* Background Watermark Shield Emblem */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <Award className="w-96 h-96 text-[#D4AF37]" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col justify-between h-full text-center">
          
          {/* Top Logos & College Header */}
          <div className="flex items-center justify-between px-6 pt-2">
            <img
              src={leftLogoUrl}
              alt="VSB Engineering College Logo"
              className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-full border-2 border-[#D4AF37] p-0.5 shadow-sm bg-white"
            />
            
            <div className="flex flex-col items-center">
              <span className="text-[#A67C00] text-xs md:text-sm font-bold tracking-widest uppercase">
                VSB Engineering College, Karur
              </span>
              <h2 className="font-serif-title text-xl md:text-2xl font-bold tracking-wider text-[#171717] mt-0.5">
                LITERATURE CLUB
              </h2>
              <span className="text-[#A67C00] text-xs md:text-sm italic font-serif">
                Certificate of Merit & Participation
              </span>
            </div>

            <img
              src={rightLogoUrl}
              alt="Literature Club Emblem"
              className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-full border-2 border-[#D4AF37] p-0.5 shadow-sm bg-white"
            />
          </div>

          {/* Certificate Title */}
          <div className="my-2">
            <h1 className="font-serif-title text-2xl md:text-4xl font-bold text-[#A67C00] tracking-wide uppercase drop-shadow-sm">
              Certificate of Completion
            </h1>
            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-2" />
          </div>

          {/* Recipient Declaration */}
          <div className="space-y-3 px-4">
            <p className="text-xs md:text-sm text-[#666666] italic">
              This is to proudly certify that
            </p>
            <h2 className="font-serif-title text-2xl md:text-4xl font-bold text-[#171717] border-b-2 border-dashed border-[#D4AF37]/60 inline-block px-8 py-1">
              {certificate.studentName}
            </h2>
            <p className="text-xs md:text-sm text-[#171717]">
              Department of <strong className="text-[#A67C00] font-semibold">{certificate.department}</strong>, VSB Engineering College,
            </p>
            <p className="text-xs md:text-sm text-[#666666] max-w-2xl mx-auto leading-relaxed">
              has actively participated, completed the required feedback, and successfully attended the workshop:
            </p>
            <div className="bg-[#FAFAFA] border border-[#D4AF37]/40 py-2.5 px-6 rounded-xl max-w-xl mx-auto shadow-sm">
              <h3 className="font-serif-title text-sm md:text-lg font-bold text-[#171717]">
                "{certificate.workshopTitle}"
              </h3>
            </div>
          </div>

          {/* Bottom Signatures, Seal & Metadata */}
          <div className="flex items-end justify-between px-6 pb-2">
            {/* Issue Date & Certificate ID */}
            <div className="text-left text-xs text-[#666666]">
              <p><strong>Date Issued:</strong> {certificate.issueDate}</p>
              <p><strong>Certificate ID:</strong> <span className="font-mono text-[#A67C00] font-bold">{certificate.certificateCode}</span></p>
            </div>

            {/* Center Golden Seal */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#F5E7A8] to-[#A67C00] flex items-center justify-center shadow-lg border-2 border-white p-1">
                <div className="w-full h-full rounded-full border border-white/60 flex flex-col items-center justify-center text-center p-1">
                  <Award className="w-6 h-6 md:w-8 md:h-8 text-[#A67C00]" />
                  <span className="text-[8px] font-black tracking-tighter uppercase text-[#171717] mt-0.5">
                    OFFICIAL SEAL
                  </span>
                </div>
              </div>
            </div>

            {/* Coordinator Signature */}
            <div className="text-right flex flex-col items-end">
              <div className="font-serif italic text-sm md:text-base text-[#A67C00] font-bold border-b border-gray-300 pb-1 px-4">
                {certificate.coordinatorSignatureName}
              </div>
              <p className="text-[10px] md:text-xs text-[#666666] font-medium mt-1">
                Faculty Coordinator / Club Head
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
