import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { CalendarDays, CheckCircle2, Download, MapPin, QrCode } from 'lucide-react';
import type { RegistrationDocument } from '../firebase/firestore-schema';

type RegistrationWithId = RegistrationDocument & { id: string };

interface Props {
  registration: RegistrationWithId;
}

export const RegistrationQrCard: React.FC<Props> = ({ registration }) => {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setError('');
    const payload = JSON.stringify({
      v: 1,
      type: 'literature-club-registration',
      registrationId: registration.registrationId,
      registrationDocId: registration.id,
      token: registration.qrToken,
    });
    QRCode.toDataURL(payload, { errorCorrectionLevel: 'M', margin: 2, width: 280 })
      .then((url) => { if (active) setQrDataUrl(url); })
      .catch(() => { if (active) setError('Unable to generate the QR code.'); });
    return () => { active = false; };
  }, [registration.registrationId, registration.qrToken]);

  const download = () => {
    if (!qrDataUrl) return;
    const anchor = document.createElement('a');
    anchor.href = qrDataUrl;
    anchor.download = `${registration.registrationId}-QR.png`;
    anchor.click();
  };

  return (
    <section className="rounded-3xl border border-[#D4AF37]/35 bg-white shadow-sm overflow-hidden">
      <div className="bg-[#171717] text-white px-5 py-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold">Literature Club · VSB Engineering College</p>
          <h3 className="font-serif-title text-lg font-bold mt-1">Registration Confirmation</h3>
        </div>
        <QrCode className="w-7 h-7 text-[#D4AF37]" />
      </div>

      <div className="p-5 grid md:grid-cols-[1fr_auto] gap-6 items-center">
        <div className="space-y-3 min-w-0">
          <div>
            <p className="text-xs text-[#777]">Registration ID</p>
            <p className="font-mono font-black text-xl tracking-wide break-all">{registration.registrationId}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div><p className="text-xs text-[#777]">Student</p><p className="font-bold">{registration.studentName}</p></div>
            <div><p className="text-xs text-[#777]">Register Number</p><p className="font-bold">{registration.registerNumber}</p></div>
            <div><p className="text-xs text-[#777]">Department</p><p className="font-bold">{registration.department} ({registration.departmentCode})</p></div>
            <div><p className="text-xs text-[#777]">Event</p><p className="font-bold">{registration.eventName}</p></div>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-[#666]">
            <span><CalendarDays className="inline w-4 h-4 mr-1" />{registration.eventName}</span>
            <span><MapPin className="inline w-4 h-4 mr-1" />Keep this QR ready at the venue</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" /> Registration confirmed
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="w-[232px] h-[232px] rounded-2xl border border-gray-200 bg-white p-2 flex items-center justify-center">
            {error ? <span className="text-xs text-rose-600 text-center px-4">{error}</span> : qrDataUrl ? <img src={qrDataUrl} alt={`QR code for ${registration.registrationId}`} className="w-full h-full" /> : <div className="animate-pulse text-xs text-gray-500">Generating QR…</div>}
          </div>
          <button type="button" onClick={download} disabled={!qrDataUrl} className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold flex items-center gap-2 disabled:opacity-50">
            <Download className="w-4 h-4" /> Download QR
          </button>
        </div>
      </div>
      <div className="px-5 pb-5 text-[11px] text-[#777]">
        Present this QR at the event. The QR contains a secure registration token and should not be shared with another person.
      </div>
    </section>
  );
};
