import React, { useEffect, useState } from 'react';
import { BadgeCheck, CheckCircle2, IdCard, Loader2, Search, ShieldCheck, UserRoundSearch } from 'lucide-react';
import { getVerificationEvents, markAttendanceByRegisterNumber, markAttendanceByRegistrationId, type AttendanceVerificationResult } from '../services/attendance';

export const AttendanceBackupVerification: React.FC = () => {
  const [mode, setMode] = useState<'registration_id' | 'register_number'>('registration_id');
  const [registrationId, setRegistrationId] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [eventId, setEventId] = useState('');
  const [events, setEvents] = useState<Array<any>>([]);
  const [result, setResult] = useState<AttendanceVerificationResult | null>(null);
  const [error, setError] = useState('');
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    let mounted = true;
    getVerificationEvents()
      .then(items => { if (mounted) { setEvents(items as any[]); if (items.length === 1) setEventId(items[0].id); } })
      .catch(err => { if (mounted) setError(err instanceof Error ? err.message : 'Unable to load authorized events.'); })
      .finally(() => { if (mounted) setLoadingEvents(false); });
    return () => { mounted = false; };
  }, []);

  const verify = async () => {
    setError('');
    setResult(null);
    setVerifying(true);
    try {
      const verified = mode === 'registration_id'
        ? await markAttendanceByRegistrationId(registrationId)
        : await markAttendanceByRegisterNumber(registerNumber, eventId);
      setResult(verified);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to verify registration.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="rounded-3xl border border-[#D4AF37]/30 bg-white p-5 shadow-sm space-y-5">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-[#171717] p-3 text-[#D4AF37]"><ShieldCheck className="w-5 h-5" /></div>
        <div>
          <h4 className="font-serif-title text-lg font-bold">Backup Attendance Verification</h4>
          <p className="text-xs text-[#666] mt-1">Use this only when QR scanning is unavailable. Search is restricted to authorized staff.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        <button type="button" onClick={() => { setMode('registration_id'); setError(''); setResult(null); }} className={`rounded-xl px-4 py-3 text-xs font-bold flex items-center justify-center gap-2 border ${mode === 'registration_id' ? 'bg-[#171717] text-white border-[#171717]' : 'border-gray-200 text-gray-600'}`}><IdCard className="w-4 h-4" /> Registration ID</button>
        <button type="button" onClick={() => { setMode('register_number'); setError(''); setResult(null); }} className={`rounded-xl px-4 py-3 text-xs font-bold flex items-center justify-center gap-2 border ${mode === 'register_number' ? 'bg-[#171717] text-white border-[#171717]' : 'border-gray-200 text-gray-600'}`}><UserRoundSearch className="w-4 h-4" /> Register Number</button>
      </div>

      {mode === 'registration_id' ? (
        <div>
          <label className="block text-xs font-bold mb-2">Registration ID</label>
          <input value={registrationId} onChange={e => setRegistrationId(e.target.value.toUpperCase())} placeholder="LC26-BME-POE-001" className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm font-mono focus:outline-none focus:border-[#D4AF37]" />
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold mb-2">Authorized Event</label>
            <select value={eventId} onChange={e => setEventId(e.target.value)} disabled={loadingEvents} className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm bg-white focus:outline-none focus:border-[#D4AF37]">
              <option value="">{loadingEvents ? 'Loading authorized events…' : 'Select event'}</option>
              {events.map(event => <option key={event.id} value={event.id}>{event.name} ({event.code})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold mb-2">College Register Number</label>
            <input value={registerNumber} onChange={e => setRegisterNumber(e.target.value.toUpperCase())} placeholder="Enter register number" className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm font-mono focus:outline-none focus:border-[#D4AF37]" />
          </div>
        </div>
      )}

      <button type="button" onClick={verify} disabled={verifying || (mode === 'registration_id' ? !registrationId.trim() : !registerNumber.trim() || !eventId)} className="w-full rounded-xl bg-[#D4AF37] text-white py-3 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50">
        {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        {verifying ? 'Verifying…' : 'Verify & Mark Present'}
      </button>

      {error && <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">{error}</div>}

      {result && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm"><CheckCircle2 className="w-5 h-5" /> Attendance marked present</div>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div><span className="text-gray-500">Student</span><p className="font-bold">{result.studentName}</p></div>
            <div><span className="text-gray-500">Register No.</span><p className="font-bold">{result.registerNumber}</p></div>
            <div><span className="text-gray-500">Department</span><p className="font-bold">{result.departmentCode}</p></div>
            <div><span className="text-gray-500">Event</span><p className="font-bold">{result.eventName}</p></div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-emerald-200 pt-3"><span className="font-mono text-xs font-bold">{result.registrationId}</span><span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700"><BadgeCheck className="w-4 h-4" /> {result.verificationMethod === 'registration_id' ? 'Registration ID' : 'Register Number'}</span></div>
        </div>
      )}
    </div>
  );
};
