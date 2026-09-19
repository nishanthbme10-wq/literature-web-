import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3, Users, CalendarDays, UserCog, Search, Download, UserPlus,
  ShieldCheck, CheckCircle2, RefreshCw, Filter
} from 'lucide-react';
import {
  collection, getDocs, query, where, orderBy, limit, setDoc, doc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { COLLECTIONS } from '../firebase/firestore-schema';
import { DEPARTMENT_OPTIONS } from '../types';
import { ContentManagement } from './ContentManagement';

type AnyRecord = Record<string, any>;

function csvEscape(value: unknown) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, rows: AnyRecord[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.map(csvEscape).join(','), ...rows.map(r => headers.map(h => csvEscape(r[h])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function Stat({ label, value, icon: Icon }: { label: string; value: number | string; icon: React.ElementType }) {
  return <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      <Icon className="w-5 h-5 text-[#D4AF37]" />
    </div>
    <div className="text-3xl font-bold mt-3 text-[#171717]">{value}</div>
  </div>;
}

export const AdminControlCenter: React.FC<{ currentUserId: string }> = ({ currentUserId }) => {
  const [tab, setTab] = useState<'overview'|'registrations'|'coordinators'|'departments'|'content'>('overview');
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<AnyRecord[]>([]);
  const [registrations, setRegistrations] = useState<AnyRecord[]>([]);
  const [users, setUsers] = useState<AnyRecord[]>([]);
  const [assignments, setAssignments] = useState<AnyRecord[]>([]);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');
  const [event, setEvent] = useState('All');
  const [attendance, setAttendance] = useState('All');
  const [selectedCoordinator, setSelectedCoordinator] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [ev, reg, usr, asg] = await Promise.all([
        getDocs(query(collection(db, COLLECTIONS.events), orderBy('date', 'asc'))),
        getDocs(query(collection(db, COLLECTIONS.registrations), orderBy('registeredAt', 'desc'), limit(2000))),
        getDocs(collection(db, COLLECTIONS.users)),
        getDocs(collection(db, COLLECTIONS.coordinatorAssignments))
      ]);
      setEvents(ev.docs.map(d => ({ id: d.id, ...d.data() })));
      setRegistrations(reg.docs.map(d => ({ id: d.id, ...d.data() })));
      setUsers(usr.docs.map(d => ({ id: d.id, ...d.data() })));
      setAssignments(asg.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Unable to load admin data.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const students = users.filter(u => u.role === 'student');
  const coordinators = users.filter(u => u.role === 'coordinator');
  const activeEvents = events.filter(e => ['open','upcoming'].includes(String(e.registrationStatus || '').toLowerCase()));
  const present = registrations.filter(r => String(r.attendanceStatus).toLowerCase() === 'present').length;

  const filtered = useMemo(() => registrations.filter(r => {
    const q = search.trim().toLowerCase();
    const hay = [r.registrationId, r.studentName, r.registerNumber, r.email, r.department, r.eventName].join(' ').toLowerCase();
    return (!q || hay.includes(q))
      && (dept === 'All' || r.departmentCode === dept || r.department === dept)
      && (event === 'All' || r.eventId === event || r.eventName === event)
      && (attendance === 'All' || String(r.attendanceStatus || 'pending').toLowerCase() === attendance);
  }), [registrations, search, dept, event, attendance]);

  const deptStats = useMemo(() => {
    const map: Record<string, number> = {};
    registrations.forEach(r => { const d = r.departmentCode || r.department || 'Other'; map[d] = (map[d] || 0) + 1; });
    return Object.entries(map).sort((a,b) => b[1]-a[1]);
  }, [registrations]);

  const eventStats = useMemo(() => {
    const map: Record<string, number> = {};
    registrations.forEach(r => { const e = r.eventName || r.eventId || 'Unknown'; map[e] = (map[e] || 0) + 1; });
    return Object.entries(map).sort((a,b) => b[1]-a[1]);
  }, [registrations]);

  const assignCoordinator = async () => {
    if (!selectedCoordinator || !selectedEvent) return;
    const id = `${selectedCoordinator}_${selectedEvent}`;
    await setDoc(doc(db, COLLECTIONS.coordinatorAssignments, id), {
      coordinatorUid: selectedCoordinator,
      eventId: selectedEvent,
      active: true,
      assignedBy: currentUserId,
      assignedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    setMessage('Coordinator assigned successfully.');
    setSelectedCoordinator(''); setSelectedEvent('');
    await load();
  };

  const deactivateAssignment = async (a: AnyRecord) => {
    await setDoc(doc(db, COLLECTIONS.coordinatorAssignments, a.id), { active: false, updatedAt: serverTimestamp() }, { merge: true });
    await load();
  };

  if (loading) return <div className="py-16 flex items-center justify-center gap-3 text-gray-500"><RefreshCw className="w-5 h-5 animate-spin" /> Loading admin data…</div>;

  return <section className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-2xl font-bold text-[#171717]">Admin Control Center</h2>
        <p className="text-sm text-gray-500">Live Firebase management, registrations and analytics.</p>
      </div>
      <button onClick={load} className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Refresh</button>
    </div>

    {message && <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">{message}</div>}

    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <Stat label="Total Events" value={events.length} icon={CalendarDays}/>
      <Stat label="Active Events" value={activeEvents.length} icon={CalendarDays}/>
      <Stat label="Registrations" value={registrations.length} icon={Users}/>
      <Stat label="Students" value={students.length} icon={Users}/>
      <Stat label="Present" value={present} icon={CheckCircle2}/>
    </div>

    <div className="flex flex-wrap gap-2 border-b pb-3">
      {[
        ['overview','Analytics & Overview'], ['registrations','Registrations'], ['coordinators','Coordinators'], ['departments','Departments'], ['content','Content Management']
      ].map(([key,label]) => <button key={key} onClick={() => setTab(key as any)} className={`px-4 py-2 rounded-xl text-sm font-bold ${tab===key?'bg-[#171717] text-white':'bg-gray-50 text-gray-600 border border-gray-200'}`}>{label}</button>)}
    </div>

    {tab === 'overview' && <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-bold flex items-center gap-2"><BarChart3 className="w-5 h-5 text-[#D4AF37]"/> Department-wise registrations</h3>
        <div className="mt-4 space-y-3">{deptStats.length ? deptStats.map(([d,n]) => <div key={d}><div className="flex justify-between text-sm mb-1"><span>{d}</span><b>{n}</b></div><div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#D4AF37]" style={{width:`${Math.min(100,(n/Math.max(1,registrations.length))*100)}%`}}/></div></div>) : <p className="text-gray-500 text-sm">No registration data yet.</p>}</div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-bold flex items-center gap-2"><CalendarDays className="w-5 h-5 text-[#D4AF37]"/> Event-wise registrations</h3>
        <div className="mt-4 space-y-3">{eventStats.length ? eventStats.slice(0,10).map(([e,n]) => <div key={e} className="flex justify-between border-b border-gray-100 pb-2 text-sm"><span>{e}</span><b>{n}</b></div>) : <p className="text-gray-500 text-sm">No registration data yet.</p>}</div>
      </div>
    </div>}

    {tab === 'registrations' && <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="grid md:grid-cols-4 gap-3 mb-4">
        <div className="relative"><Search className="absolute left-3 top-3 w-4 h-4 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search ID, name, register no…" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200"/></div>
        <select value={dept} onChange={e=>setDept(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2.5"><option>All</option>{DEPARTMENT_OPTIONS.map(d=><option key={d.code} value={d.code}>{d.code}</option>)}</select>
        <select value={event} onChange={e=>setEvent(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2.5"><option value="All">All events</option>{events.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select>
        <select value={attendance} onChange={e=>setAttendance(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2.5"><option value="All">All attendance</option><option value="present">Present</option><option value="pending">Pending</option></select>
      </div>
      <div className="flex justify-between items-center mb-3"><span className="text-xs font-bold text-gray-500">{filtered.length} records</span><button onClick={()=>downloadCsv('literature-club-registrations.csv', filtered.map(r=>({registrationId:r.registrationId,studentName:r.studentName,registerNumber:r.registerNumber,department:r.departmentCode||r.department,event:r.eventName,email:r.email,attendanceStatus:r.attendanceStatus||'pending'})))} className="px-3 py-2 rounded-lg bg-[#171717] text-white text-xs font-bold flex items-center gap-2"><Download className="w-4 h-4"/> Export CSV</button></div>
      <div className="overflow-x-auto rounded-xl border border-gray-100"><table className="w-full min-w-[900px] text-sm"><thead className="bg-gray-50"><tr>{['Registration ID','Student','Register No.','Department','Event','Attendance'].map(h=><th key={h} className="text-left px-4 py-3 font-bold">{h}</th>)}</tr></thead><tbody>{filtered.slice(0,500).map(r=><tr key={r.id} className="border-t"><td className="px-4 py-3 font-mono">{r.registrationId}</td><td className="px-4 py-3">{r.studentName}</td><td className="px-4 py-3">{r.registerNumber}</td><td className="px-4 py-3">{r.departmentCode||r.department}</td><td className="px-4 py-3">{r.eventName}</td><td className="px-4 py-3">{String(r.attendanceStatus).toLowerCase()==='present'?<span className="text-emerald-700 font-bold">Present</span>:<span className="text-gray-500">Pending</span>}</td></tr>)}</tbody></table></div>
      {filtered.length===0 && <div className="py-12 text-center text-gray-500">No registrations match the selected filters.</div>}
    </div>}

    {tab === 'coordinators' && <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-bold flex items-center gap-2"><UserPlus className="w-5 h-5 text-[#D4AF37]"/> Assign coordinator to event</h3>
        <div className="grid md:grid-cols-3 gap-3 mt-4">
          <select value={selectedCoordinator} onChange={e=>setSelectedCoordinator(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2.5"><option value="">Select coordinator</option>{coordinators.map(u=><option key={u.id} value={u.id}>{u.fullName} — {u.department||''}</option>)}</select>
          <select value={selectedEvent} onChange={e=>setSelectedEvent(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2.5"><option value="">Select event</option>{events.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select>
          <button onClick={assignCoordinator} disabled={!selectedCoordinator||!selectedEvent} className="rounded-xl bg-[#171717] text-white font-bold disabled:opacity-40">Assign</button>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden"><table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="text-left p-3">Coordinator</th><th className="text-left p-3">Event</th><th className="text-left p-3">Status</th><th className="p-3">Action</th></tr></thead><tbody>{assignments.map(a=>{const u=users.find(x=>x.id===a.coordinatorUid);const e=events.find(x=>x.id===a.eventId);return <tr key={a.id} className="border-t"><td className="p-3">{u?.fullName||a.coordinatorUid}</td><td className="p-3">{e?.name||a.eventId}</td><td className="p-3">{a.active===false?'Inactive':'Active'}</td><td className="p-3 text-right">{a.active!==false&&<button onClick={()=>deactivateAssignment(a)} className="text-xs font-bold text-red-600">Deactivate</button>}</td></tr>})}</tbody></table>{assignments.length===0&&<div className="p-8 text-center text-gray-500">No coordinator assignments yet.</div>}</div>
    </div>}

    {tab === 'content' && <ContentManagement adminUid={currentUserId} />}

    {tab === 'departments' && <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h3 className="font-bold flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[#D4AF37]"/> Department configuration</h3>
      <p className="text-sm text-gray-500 mt-1">These are the configured VSB Engineering College department codes currently used by the portal.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">{DEPARTMENT_OPTIONS.map(d=><div key={d.code} className="p-4 rounded-xl border border-gray-200"><div className="font-mono font-bold text-[#A67C00]">{d.code}</div><div className="text-sm mt-1">{d.name}</div><div className="text-xs text-gray-500 mt-2">{registrations.filter(r=>(r.departmentCode||r.department)===d.code).length} registrations</div></div>)}</div>
    </div>}
  </section>;
};
