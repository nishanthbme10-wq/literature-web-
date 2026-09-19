import React, { useEffect, useMemo, useState } from 'react';
import { Download, FileSpreadsheet, Loader2, RefreshCw, Search, Users, UserCheck, CalendarDays, MapPin, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getCoordinatorDashboardEvents, getEventRegistrations, type DashboardEvent, type DashboardRegistration } from '../services/coordinatorDashboard';
import { QrAttendanceScanner } from './QrAttendanceScanner';
import { AttendanceBackupVerification } from './AttendanceBackupVerification';
import type { User } from '../types';
import { listContent } from '../services/contentManagement';

interface Props { currentUser: User; }

function downloadCsv(rows: DashboardRegistration[], event?: DashboardEvent) {
  const headers = ['Registration ID','Student Name','Register Number','Email','Phone','Department','Department Code','Year','Section','Event','Registration Status','Attendance Status','Registered At'];
  const lines = rows.map(r => [r.registrationId,r.studentName,r.registerNumber,r.email,r.phone,r.department,r.departmentCode,r.year,r.section,r.eventName,r.registrationStatus,r.attendanceStatus,r.registeredAt ? String(r.registeredAt) : ''].map(v => `"${String(v ?? '').replace(/"/g,'""')}"`).join(','));
  const blob = new Blob([[headers.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = `${event?.code || 'event'}-registrations.csv`; a.click(); URL.revokeObjectURL(url);
}

function downloadXlsx(rows: DashboardRegistration[], event?: DashboardEvent) {
  const data = rows.map(r => ({
    'Registration ID': r.registrationId, 'Student Name': r.studentName, 'Register Number': r.registerNumber,
    Email: r.email, Phone: r.phone, Department: r.department, 'Department Code': r.departmentCode,
    Year: r.year, Section: r.section, Event: r.eventName, 'Registration Status': r.registrationStatus,
    'Attendance Status': r.attendanceStatus, 'Registered At': r.registeredAt ? String(r.registeredAt) : '',
  }));
  const workbook = XLSX.utils.book_new(); const sheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, sheet, 'Registrations');
  XLSX.writeFile(workbook, `${event?.code || 'event'}-registrations.xlsx`);
}

export const CoordinatorDashboard: React.FC<Props> = ({ currentUser }) => {
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [registrations, setRegistrations] = useState<DashboardRegistration[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [attendance, setAttendance] = useState('All');
  const [showScanner, setShowScanner] = useState(false);

  const selectedEvent = events.find(e => e.id === selectedEventId);

  const loadEvents = async () => {
    setLoadingEvents(true); setError('');
    try {
      const data = await getCoordinatorDashboardEvents();
      setEvents(data);
      setSelectedEventId(prev => prev && data.some(e => e.id === prev) ? prev : data[0]?.id || '');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load assigned events.'); }
    finally { setLoadingEvents(false); }
  };

  const loadRegistrations = async (eventId: string) => {
    if (!eventId) { setRegistrations([]); return; }
    setLoadingRegistrations(true); setError('');
    try { setRegistrations(await getEventRegistrations(eventId)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to load registrations.'); setRegistrations([]); }
    finally { setLoadingRegistrations(false); }
  };

  useEffect(() => { loadEvents(); }, []);
  useEffect(() => { loadRegistrations(selectedEventId); setSearch(''); setDepartment('All'); setAttendance('All'); }, [selectedEventId]);

  const departments = useMemo(() => ['All', ...Array.from(new Set(registrations.map(r => r.departmentCode).filter(Boolean))).sort()], [registrations]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return registrations.filter(r => {
      const matchesSearch = !q || [r.registrationId,r.studentName,r.registerNumber,r.email,r.department,r.departmentCode].some(v => String(v || '').toLowerCase().includes(q));
      const matchesDept = department === 'All' || r.departmentCode === department;
      const matchesAttendance = attendance === 'All' || r.attendanceStatus === attendance;
      return matchesSearch && matchesDept && matchesAttendance;
    });
  }, [registrations, search, department, attendance]);

  const present = registrations.filter(r => r.attendanceStatus === 'present').length;
  const registered = registrations.filter(r => r.registrationStatus === 'registered').length;
  const absent = Math.max(registered - present, 0);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-[#171717] text-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div><p className="text-[11px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold">Coordinator Workspace</p><h2 className="font-serif-title text-2xl font-bold mt-1">Assigned Events & Attendance</h2><p className="text-xs text-white/60 mt-1">Manage registrations and attendance only for events assigned to you.</p></div>
          <button onClick={loadEvents} className="px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-xs font-bold flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Refresh</button>
        </div>
      </div>

      {error && <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-700 font-medium">{error}</div>}

      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1"><label className="block text-xs font-bold mb-2">Assigned Event</label><select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} disabled={loadingEvents} className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm bg-white">{loadingEvents ? <option>Loading events…</option> : events.length === 0 ? <option value="">No assigned events</option> : events.map(e => <option key={e.id} value={e.id}>{e.name} ({e.code})</option>)}</select></div>
          {selectedEvent && <div className="grid grid-cols-2 gap-2 md:w-[360px]"><div className="rounded-xl bg-gray-50 p-3"><CalendarDays className="w-4 h-4 text-[#A67C00]" /><p className="text-[10px] text-gray-500 mt-1">Date</p><p className="text-xs font-bold">{selectedEvent.date}</p></div><div className="rounded-xl bg-gray-50 p-3"><MapPin className="w-4 h-4 text-[#A67C00]" /><p className="text-[10px] text-gray-500 mt-1">Venue</p><p className="text-xs font-bold truncate">{selectedEvent.venue}</p></div></div>}
        </div>
      </div>

      {selectedEvent && <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={<Users className="w-5 h-5" />} label="Registrations" value={registered} />
          <Stat icon={<UserCheck className="w-5 h-5" />} label="Present" value={present} />
          <Stat icon={<Users className="w-5 h-5" />} label="Pending Attendance" value={absent} />
          <Stat icon={<CalendarDays className="w-5 h-5" />} label="Capacity" value={`${registered}/${selectedEvent.maxParticipants}`} />
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowScanner(true)} className="px-4 py-2.5 rounded-xl bg-[#171717] text-white text-xs font-bold">Open QR Check-in</button>
          <button onClick={() => downloadCsv(filtered, selectedEvent)} disabled={!filtered.length} className="px-4 py-2.5 rounded-xl bg-[#D4AF37] text-white text-xs font-bold flex items-center gap-2 disabled:opacity-40"><Download className="w-4 h-4" /> CSV</button>
          <button onClick={() => downloadXlsx(filtered, selectedEvent)} disabled={!filtered.length} className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold flex items-center gap-2 disabled:opacity-40"><FileSpreadsheet className="w-4 h-4" /> Excel</button>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 space-y-3"><div className="flex flex-col lg:flex-row gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search registration ID, student, register number…" className="w-full rounded-xl border border-gray-200 pl-10 pr-3 py-2.5 text-xs" /></div><select value={department} onChange={e => setDepartment(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2.5 text-xs bg-white">{departments.map(d => <option key={d}>{d}</option>)}</select><select value={attendance} onChange={e => setAttendance(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2.5 text-xs bg-white"><option value="All">All attendance</option><option value="present">Present</option><option value="not_marked">Not marked</option></select></div><p className="text-[11px] text-gray-500">Showing <b>{filtered.length}</b> of <b>{registrations.length}</b> registrations</p></div>
          {loadingRegistrations ? <div className="p-12 text-center text-xs text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading registrations…</div> : filtered.length === 0 ? <div className="p-12 text-center text-xs text-gray-500"><Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />No registrations match the current filters.</div> : <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-gray-50 text-gray-500"><tr><th className="px-4 py-3">Registration</th><th className="px-4 py-3">Student</th><th className="px-4 py-3">Department</th><th className="px-4 py-3">Year</th><th className="px-4 py-3">Attendance</th></tr></thead><tbody>{filtered.map(r => <tr key={r.id} className="border-t border-gray-100"><td className="px-4 py-3 font-mono font-bold">{r.registrationId}</td><td className="px-4 py-3"><p className="font-bold">{r.studentName}</p><p className="text-gray-500">{r.registerNumber}</p></td><td className="px-4 py-3">{r.departmentCode}</td><td className="px-4 py-3">{r.year} / {r.section}</td><td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${r.attendanceStatus === 'present' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{r.attendanceStatus === 'present' ? 'Present' : 'Not marked'}</span></td></tr>)}</tbody></table></div>}
        </div>
      </>}

      {showScanner && <div className="fixed inset-0 z-[100] bg-black/60 p-4 overflow-y-auto"><div className="max-w-5xl mx-auto mt-8"><div className="flex justify-end mb-2"><button onClick={() => setShowScanner(false)} className="rounded-full bg-white p-2 shadow"><X className="w-5 h-5" /></button></div><QrAttendanceScanner /><div className="mt-4"><AttendanceBackupVerification /></div></div></div>}
    </div>
  );
};

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="text-[#A67C00]">{icon}</div><p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mt-3">{label}</p><p className="text-2xl font-bold font-serif-title mt-1">{value}</p></div>;
}
