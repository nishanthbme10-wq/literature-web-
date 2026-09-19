import { BrowserMultiFormatReader } from '@zxing/browser';
import {
  Camera,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { markAttendanceByQr } from '../services/attendance';

export const QrAttendanceScanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  const [running, setRunning] = useState(false);
  const [manual, setManual] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [verified, setVerified] = useState<any>(null);

  const busyRef = useRef(false);

  const stop = () => {
    try {
      readerRef.current?.reset();
    } catch {
      // Ignore reset errors
    }

    const stream = videoRef.current?.srcObject as MediaStream | null;

    stream?.getTracks().forEach((track) => track.stop());

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setRunning(false);
  };

  const verify = async (raw: string) => {
    if (busyRef.current) return;

    if (!raw.trim()) {
      setError('Please provide a valid QR payload.');
      return;
    }

    busyRef.current = true;

    setError('');
    setMessage('');
    setVerified(null);

    try {
      const result = await markAttendanceByQr(raw);

      setVerified(result);
      setMessage('Attendance marked successfully.');

      stop();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Unable to verify this QR.'
      );
    } finally {
      busyRef.current = false;
    }
  };

  const start = async () => {
    setError('');
    setMessage('');
    setVerified(null);

    try {
      if (!videoRef.current) {
        setError('Camera preview is not available.');
        return;
      }

      const reader = new BrowserMultiFormatReader();

      readerRef.current = reader;
      setRunning(true);

      await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        async (result) => {
          if (result) {
            await verify(result.getText());
          }
        }
      );
    } catch (e) {
      setRunning(false);

      setError(
        e instanceof Error
          ? e.message
          : 'Camera permission is required to scan QR codes.'
      );
    }
  };

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return (
    <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-5">

      {/* QR SCANNER */}
      <div className="rounded-3xl border border-[#D4AF37]/30 bg-white p-5 shadow-sm space-y-4">

        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="font-serif-title text-lg font-bold">
              QR Attendance Scanner
            </h4>

            <p className="text-xs text-[#666] mt-1">
              Scan a registered student's Literature Club QR.
            </p>
          </div>

          <ShieldCheck className="w-7 h-7 text-[#D4AF37]" />
        </div>

        {/* CAMERA */}
        <div className="aspect-video bg-[#171717] rounded-2xl overflow-hidden flex items-center justify-center relative">

          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
          />

          {!running && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-5">

              <Camera className="w-10 h-10 text-[#D4AF37] mb-2" />

              <p className="font-bold">
                Camera ready
              </p>

              <p className="text-xs text-white/60 mt-1">
                Start scanning when the student presents their QR.
              </p>

            </div>
          )}
        </div>

        {/* BUTTONS */}
        <div className="flex gap-2">

          {!running ? (
            <button
              onClick={start}
              className="flex-1 rounded-xl bg-[#171717] text-white py-3 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Start Camera
            </button>
          ) : (
            <button
              onClick={stop}
              className="flex-1 rounded-xl border border-gray-200 py-3 text-xs font-bold flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Stop Camera
            </button>
          )}

          <button
            onClick={() => {
              setError('');
              setMessage('');
              setVerified(null);
            }}
            className="px-4 rounded-xl border border-gray-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

        </div>
      </div>


      {/* VERIFICATION RESULT */}
      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">

        <div>
          <h4 className="font-serif-title text-lg font-bold">
            Verification Result
          </h4>

          <p className="text-xs text-[#666] mt-1">
            Attendance is recorded in Firestore only after successful verification.
          </p>
        </div>


        {/* SUCCESS RESULT */}
        {verified ? (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 space-y-3">

            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">

              <CheckCircle2 className="w-5 h-5" />

              Attendance marked present

            </div>


            <div className="grid grid-cols-2 gap-3 text-xs">

              <div>
                <span className="text-gray-500">
                  Student
                </span>

                <p className="font-bold">
                  {verified.studentName}
                </p>
              </div>


              <div>
                <span className="text-gray-500">
                  Register No.
                </span>

                <p className="font-bold">
                  {verified.registerNumber}
                </p>
              </div>


              <div>
                <span className="text-gray-500">
                  Department
                </span>

                <p className="font-bold">
                  {verified.departmentCode}
                </p>
              </div>


              <div>
                <span className="text-gray-500">
                  Event
                </span>

                <p className="font-bold">
                  {verified.eventName}
                </p>
              </div>

            </div>


            <div className="font-mono text-xs font-bold">
              {verified.registrationId}
            </div>

          </div>
        ) : (

          <div className="rounded-2xl bg-gray-50 p-5 text-center text-xs text-gray-500">

            <UserCheck className="w-8 h-8 mx-auto mb-2 text-gray-300" />

            No verification yet.

          </div>

        )}


        {/* SUCCESS MESSAGE */}
        {message && (
          <div className="text-xs font-bold text-emerald-700">
            {message}
          </div>
        )}


        {/* ERROR MESSAGE */}
        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}


        {/* MANUAL QR */}
        <div className="border-t pt-4">

          <label className="block text-xs font-bold mb-2">
            Manual QR payload fallback
          </label>

          <textarea
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            rows={4}
            placeholder="Paste the QR payload only if camera scanning is unavailable."
            className="w-full rounded-xl border border-gray-200 p-3 text-xs font-mono"
          />


          <button
            onClick={() => verify(manual)}
            disabled={!manual.trim() || busyRef.current}
            className="mt-2 w-full rounded-xl bg-[#D4AF37] text-white py-2.5 text-xs font-bold disabled:opacity-50"
          >
            Verify QR Payload
          </button>

        </div>

      </div>

    </div>
  );
};