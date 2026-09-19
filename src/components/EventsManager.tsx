import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Edit3, ImagePlus, Loader2, Save, Trash2, X } from 'lucide-react';
import { getDepartments } from '../services/firestore';
import {
  createEvent,
  deactivateEvent,
  deleteEvent,
  listEvents,
  normalizeEventCode,
  updateEvent,
  uploadEventPoster,
  type EventFormInput,
} from '../services/events';
import type { DepartmentDocument, EventDocument } from '../firebase/firestore-schema';

const emptyForm: EventFormInput = {
  name: '', code: '', description: '', posterUrl: '', posterPath: '', date: '', startTime: '10:00', endTime: '12:00',
  venue: '', rules: [''], registrationDeadline: '', maxParticipants: 100, eligibleDepartments: [], registrationStatus: 'draft',
};

function toInput(event: EventDocument): EventFormInput {
  return {
    name: event.name,
    code: event.code,
    description: event.description,
    posterUrl: event.posterUrl,
    posterPath: event.posterPath,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    venue: event.venue,
    rules: event.rules.length ? event.rules : [''],
    registrationDeadline: event.registrationDeadline,
    maxParticipants: event.maxParticipants,
    eligibleDepartments: event.eligibleDepartments,
    registrationStatus: event.registrationStatus,
  };
}

export function EventsManager({ currentUserId }: { currentUserId: string }) {
  const [events, setEvents] = useState<Array<EventDocument & { id: string }>>([]);
  const [departments, setDepartments] = useState<Array<DepartmentDocument & { id: string }>>([]);
  const [form, setForm] = useState<EventFormInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [eventData, departmentData] = await Promise.all([listEvents(), getDepartments()]);
      setEvents(eventData);
      setDepartments(departmentData as Array<DepartmentDocument & { id: string }>);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load events.');
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const activeCount = useMemo(() => events.filter((event) => event.registrationStatus === 'open').length, [events]);

  const reset = () => { setForm(emptyForm); setEditingId(null); setPosterFile(null); setMessage(''); setError(''); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMessage(''); setError('');
    try {
      let next = { ...form, code: normalizeEventCode(form.code) };
      if (posterFile) {
        const tempId = editingId || `new-${Date.now()}`;
        next = { ...next, posterUrl: await uploadEventPoster(posterFile, tempId) };
      }
      if (editingId) await updateEvent(editingId, next);
      else await createEvent(next, currentUserId);
      setMessage(editingId ? 'Event updated successfully.' : 'Event created successfully.');
      reset();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save event.');
    } finally { setSaving(false); }
  };

  const edit = (event: EventDocument & { id: string }) => {
    setEditingId(event.id); setForm(toInput(event)); setPosterFile(null); setError(''); setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const close = async (id: string) => {
    if (!window.confirm('Close registration for this event?')) return;
    try { await deactivateEvent(id); await load(); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to close event.'); }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this event permanently?')) return;
    try { await deleteEvent(id); await load(); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to delete event.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h3 className="font-serif-title font-bold text-xl text-[#171717]">Events Manager</h3><p className="text-xs text-[#666]">Manage Literature Club events directly in Firebase.</p></div>
        <div className="text-xs font-bold bg-[#FAFAFA] border border-[#D4AF37]/30 rounded-xl px-4 py-2">{activeCount} registration-open event{activeCount === 1 ? '' : 's'}</div>
      </div>

      {(error || message) && <div className={`p-3 rounded-xl text-xs font-bold border ${error ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>{error || message}</div>}

      <form onSubmit={save} className="bg-[#FAFAFA] border border-[#D4AF37]/30 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between"><h4 className="font-bold text-[#171717]">{editingId ? 'Edit Event' : 'Create Event'}</h4>{editingId && <button type="button" onClick={reset} className="text-xs font-bold text-[#666] flex gap-1 items-center"><X className="w-4 h-4"/>Cancel edit</button>}</div>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Event Name"><input required value={form.name} onChange={e => setForm({...form,name:e.target.value})} className="input" placeholder="Poetry Writing"/></Field>
          <Field label="Event Code"><input required value={form.code} onChange={e => setForm({...form,code:e.target.value.toUpperCase()})} className="input" placeholder="POE" maxLength={20}/></Field>
          <Field label="Date"><input required type="date" value={form.date} onChange={e => setForm({...form,date:e.target.value})} className="input"/></Field>
          <div className="grid grid-cols-2 gap-2"><Field label="Start"><input required type="time" value={form.startTime} onChange={e => setForm({...form,startTime:e.target.value})} className="input"/></Field><Field label="End"><input required type="time" value={form.endTime} onChange={e => setForm({...form,endTime:e.target.value})} className="input"/></Field></div>
          <Field label="Venue"><input required value={form.venue} onChange={e => setForm({...form,venue:e.target.value})} className="input" placeholder="Seminar Hall"/></Field>
          <Field label="Registration Deadline"><input required type="datetime-local" value={form.registrationDeadline} onChange={e => setForm({...form,registrationDeadline:e.target.value})} className="input"/></Field>
          <Field label="Maximum Participants"><input required min={1} type="number" value={form.maxParticipants} onChange={e => setForm({...form,maxParticipants:Number(e.target.value)})} className="input"/></Field>
          <Field label="Registration Status"><select value={form.registrationStatus} onChange={e => setForm({...form,registrationStatus:e.target.value as EventFormInput['registrationStatus']})} className="input"><option value="draft">Draft</option><option value="upcoming">Upcoming</option><option value="open">Open</option><option value="closed">Closed</option><option value="completed">Completed</option></select></Field>
        </div>
        <Field label="Description"><textarea required rows={3} value={form.description} onChange={e => setForm({...form,description:e.target.value})} className="input"/></Field>
        <Field label="Rules"><div className="space-y-2">{form.rules.map((rule,i)=><div className="flex gap-2" key={i}><input value={rule} onChange={e=>setForm({...form,rules:form.rules.map((r,j)=>j===i?e.target.value:r)})} className="input" placeholder={`Rule ${i+1}`}/>{form.rules.length>1&&<button type="button" onClick={()=>setForm({...form,rules:form.rules.filter((_,j)=>j!==i)})} className="px-3 rounded-xl border border-gray-200"><X className="w-4 h-4"/></button>}</div>)}<button type="button" onClick={()=>setForm({...form,rules:[...form.rules,'']})} className="text-xs font-bold text-[#A67C00]">+ Add rule</button></div></Field>
        <Field label="Eligible Departments"><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{departments.map(d=><label key={d.id} className="flex items-center gap-2 text-xs bg-white border border-gray-200 rounded-xl px-3 py-2"><input type="checkbox" checked={form.eligibleDepartments.includes(d.code)} onChange={e=>setForm({...form,eligibleDepartments:e.target.checked?[...form.eligibleDepartments,d.code]:form.eligibleDepartments.filter(x=>x!==d.code)})}/>{d.code} — {d.name}</label>)}</div></Field>
        <Field label="Event Poster"><div className="flex flex-col sm:flex-row gap-3 items-start"><input type="file" accept="image/*" onChange={e=>setPosterFile(e.target.files?.[0] || null)} className="text-xs"/>{form.posterUrl && <img src={form.posterUrl} alt="Event poster" className="w-20 h-20 object-cover rounded-xl border"/>}</div></Field>
        <button disabled={saving} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white font-bold text-xs flex items-center gap-2 disabled:opacity-60">{saving?<Loader2 className="w-4 h-4 animate-spin"/>:<Save className="w-4 h-4"/>}{saving?'Saving…':editingId?'Update Event':'Create Event'}</button>
      </form>

      <div className="space-y-3">
        <h4 className="font-bold text-[#171717]">Existing Events</h4>
        {loading ? <div className="py-12 text-center text-xs text-[#666]"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2"/>Loading events…</div> : events.length === 0 ? <div className="py-12 text-center border border-dashed rounded-2xl text-xs text-[#666]"><CalendarDays className="w-7 h-7 mx-auto mb-2 text-[#D4AF37]"/>No events yet.</div> : events.map(event=><div key={event.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col lg:flex-row gap-4 lg:items-center"><div className="w-20 h-20 rounded-xl bg-[#FAFAFA] overflow-hidden shrink-0">{event.posterUrl?<img src={event.posterUrl} alt={event.name} className="w-full h-full object-cover"/>:<div className="w-full h-full flex items-center justify-center"><ImagePlus className="w-6 h-6 text-gray-300"/></div>}</div><div className="flex-1 min-w-0"><div className="flex flex-wrap items-center gap-2"><h5 className="font-bold text-[#171717]">{event.name}</h5><span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#FAFAFA] border">{event.code}</span><span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#FAFAFA] border">{event.registrationStatus}</span></div><p className="text-xs text-[#666] mt-1">{event.date} · {event.startTime}–{event.endTime} · {event.venue}</p><p className="text-xs text-[#666] mt-1">Max {event.maxParticipants} · Departments: {event.eligibleDepartments.join(', ')}</p></div><div className="flex gap-2"><button onClick={()=>edit(event)} className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold flex items-center gap-1"><Edit3 className="w-4 h-4"/>Edit</button>{event.registrationStatus==='open'&&<button onClick={()=>void close(event.id)} className="px-3 py-2 rounded-xl border border-amber-200 text-amber-700 text-xs font-bold">Close</button>}<button onClick={()=>void remove(event.id)} className="px-3 py-2 rounded-xl border border-rose-200 text-rose-700 text-xs font-bold"><Trash2 className="w-4 h-4"/></button></div></div>)}
      </div>
    </div>
  );
}

function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="block space-y-1 text-xs font-bold text-[#171717]"><span>{label}</span>{children}</label>}
