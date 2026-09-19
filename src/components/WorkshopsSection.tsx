import React, { useState } from 'react';
import { Calendar, MapPin, UserCheck, ExternalLink, Edit3, Trash2, Plus, Search, Filter } from 'lucide-react';
import { Workshop, User } from '../types';

interface WorkshopsSectionProps {
  workshops: Workshop[];
  currentUser: User | null;
  onAddWorkshop?: (ws: Omit<Workshop, 'id'>) => void;
  onUpdateWorkshop?: (id: string, updated: Partial<Workshop>) => void;
  onDeleteWorkshop?: (id: string) => void;
}

export const WorkshopsSection: React.FC<WorkshopsSectionProps> = ({
  workshops,
  currentUser,
  onAddWorkshop,
  onUpdateWorkshop,
  onDeleteWorkshop,
}) => {
  const isStaff = currentUser && (currentUser.role === 'admin' || currentUser.role === 'coordinator');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Workshop Create/Edit modal state
  const [editingWs, setEditingWs] = useState<Workshop | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    posterUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800',
    dateTime: 'September 10, 2026 at 10:00 AM',
    venue: 'Main Auditorium, VSB Engineering College',
    resourcePerson: 'Dr. S. Ranganathan',
    description: '',
    googleFormUrl: 'https://forms.google.com/vsb-litclub',
    status: 'Open' as 'Open' | 'Closed' | 'Completed',
    category: 'Academic Research',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWs && onUpdateWorkshop) {
      onUpdateWorkshop(editingWs.id, formData);
      setEditingWs(null);
    } else if (onAddWorkshop) {
      onAddWorkshop(formData);
      setIsAdding(false);
    }
  };

  const startEdit = (ws: Workshop) => {
    setEditingWs(ws);
    setFormData({
      title: ws.title,
      posterUrl: ws.posterUrl,
      dateTime: ws.dateTime,
      venue: ws.venue,
      resourcePerson: ws.resourcePerson,
      description: ws.description,
      googleFormUrl: ws.googleFormUrl,
      status: ws.status,
      category: ws.category,
    });
    setIsAdding(false);
  };

  const filtered = workshops.filter((ws) => {
    const matchesQuery = ws.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ws.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ws.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || ws.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <section id="workshops-section" className="py-12 bg-[#FFFFFF] text-[#171717]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#D4AF37]/25 pb-4 mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-gradient-to-b from-[#D4AF37] to-[#A67C00] rounded-full" />
            <div>
              <h2 className="font-serif-title text-2xl sm:text-3xl font-black uppercase tracking-wider text-[#171717]">
                Workshops & Masterclasses
              </h2>
              <p className="text-xs text-[#666666] font-medium">
                Interactive sessions on academic research, debate, micro-poetry, and public speaking
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#A67C00]/70 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search workshops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-[#FAFAFA] border border-[#D4AF37]/35 rounded-xl text-xs font-medium text-[#171717] focus:outline-none focus:border-[#D4AF37] focus:bg-white transition-all"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#FAFAFA] border border-[#D4AF37]/35 rounded-xl text-xs font-bold text-[#171717] focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Completed">Completed</option>
            </select>

            {/* Add Workshop Button for Admin/Coordinator */}
            {isStaff && (
              <button
                onClick={() => {
                  setIsAdding(true);
                  setEditingWs(null);
                  setFormData({
                    title: '',
                    posterUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800',
                    dateTime: 'September 15, 2026 at 10:00 AM',
                    venue: 'Seminar Hall 1, VSBEC',
                    resourcePerson: 'Prof. Ananya V. Raman',
                    description: '',
                    googleFormUrl: 'https://forms.google.com/vsb-litclub',
                    status: 'Open',
                    category: 'Academic Research',
                  });
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] via-[#C9A227] to-[#A67C00] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-[0_4px_16px_rgba(212,175,55,0.35)] transition-all border border-[#F5E7A8]/40 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Create Workshop</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal for Creating / Editing Workshop */}
        {(isAdding || editingWs) && (
          <div className="mb-8 p-6 bg-[#FAFAFA] border border-[#D4AF37] rounded-3xl shadow-xl max-w-2xl mx-auto">
            <h3 className="font-serif-title text-base font-bold text-[#171717] mb-4">
              {editingWs ? 'Edit Workshop & Update Google Form Link' : 'Create New Workshop Event'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">Workshop Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">Date & Time</label>
                  <input
                    type="text"
                    required
                    value={formData.dateTime}
                    onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">Venue</label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">Resource Person</label>
                  <input
                    type="text"
                    required
                    value={formData.resourcePerson}
                    onChange={(e) => setFormData({ ...formData, resourcePerson: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Crucial Google Form Registration Link field */}
              <div className="p-3 bg-white border border-[#D4AF37] rounded-2xl space-y-1">
                <label className="block text-xs font-bold text-[#A67C00] uppercase tracking-wider">
                  🔗 Google Form Registration Link (Auto-opens on click)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://forms.google.com/..."
                  value={formData.googleFormUrl}
                  onChange={(e) => setFormData({ ...formData, googleFormUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAFAFA] border border-gray-300 rounded-xl text-xs font-mono font-semibold text-[#171717] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">Poster / Banner Image URL</label>
                <input
                  type="text"
                  value={formData.posterUrl}
                  onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">Workshop Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsAdding(false); setEditingWs(null); }}
                  className="px-4 py-2 bg-gray-200 text-[#666666] text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save Workshop
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Workshop Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((ws) => (
            <div
              key={ws.id}
              className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_24px_rgba(212,175,55,0.08)] border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:shadow-[0_10px_35px_rgba(212,175,55,0.18)] transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Poster Header */}
                <div className="h-48 bg-[#FAFAFA] relative overflow-hidden">
                  <img
                    src={ws.posterUrl}
                    alt={ws.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 text-[#A67C00] text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[#D4AF37]/40 shadow-sm backdrop-blur-sm">
                    {ws.category}
                  </div>
                  <div
                    className={`absolute top-3 right-3 text-[10px] font-extrabold px-3 py-1 rounded-full shadow ${
                      ws.status === 'Open'
                        ? 'bg-emerald-600 text-white'
                        : ws.status === 'Closed'
                        ? 'bg-rose-600 text-white'
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    {ws.status}
                  </div>

                  {/* Staff Management Overlay */}
                  {isStaff && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/75 p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity border border-[#D4AF37]/40">
                      <button
                        onClick={() => startEdit(ws)}
                        className="p-1 text-white hover:text-[#D4AF37] cursor-pointer"
                        title="Edit Workshop / Link"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {onDeleteWorkshop && (
                        <button
                          onClick={() => onDeleteWorkshop(ws.id)}
                          className="p-1 text-rose-400 hover:text-rose-200 cursor-pointer"
                          title="Delete Workshop"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Details Content */}
                <div className="p-6 space-y-3">
                  <h3 className="font-serif-title text-base sm:text-lg font-bold text-[#171717] leading-snug group-hover:text-[#A67C00] transition-colors">
                    {ws.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-[#666666]">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                      <span>{ws.dateTime}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                      <span className="truncate">{ws.venue}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                      <span className="truncate"><strong>Key Speaker:</strong> {ws.resourcePerson}</span>
                    </p>
                  </div>

                  <p className="text-xs text-[#666666] line-clamp-3 leading-relaxed pt-1">
                    {ws.description}
                  </p>
                </div>
              </div>

              {/* Bottom Quick Register Link */}
              <div className="p-4 bg-[#FAFAFA] border-t border-[#D4AF37]/20">
                <a
                  href={ws.googleFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    ws.status === 'Open'
                      ? 'bg-gradient-to-r from-[#D4AF37] via-[#C9A227] to-[#A67C00] hover:shadow-[0_4px_16px_rgba(212,175,55,0.35)] text-white shadow-md'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  onClick={(e) => {
                    if (ws.status !== 'Open') {
                      e.preventDefault();
                      alert("Registration for this workshop is currently closed.");
                    }
                  }}
                >
                  <span>{ws.status === 'Open' ? 'Register via Google Form' : `Registration ${ws.status}`}</span>
                  <ExternalLink className="w-4 h-4 text-white" />
                </a>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
