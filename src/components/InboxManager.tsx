import React, { useState, useMemo } from 'react';
import {
  Inbox,
  Mail,
  Search,
  CheckCircle2,
  Clock,
  Archive,
  Trash2,
  Reply,
  Filter,
  CheckCheck,
  Building,
  User as UserIcon,
  Send,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  RefreshCw,
  X
} from 'lucide-react';
import { User, Inquiry, DEPARTMENT_OPTIONS, normalizeDepartment } from '../types';

interface InboxManagerProps {
  currentUser: User;
  inquiries: Inquiry[];
  onUpdateInquiry?: (id: string, updates: Partial<Inquiry>) => void;
  onDeleteInquiry?: (id: string) => void;
  onRefresh?: () => void;
}

export const InboxManager: React.FC<InboxManagerProps> = ({
  currentUser,
  inquiries = [],
  onUpdateInquiry,
  onDeleteInquiry,
  onRefresh
}) => {
  const isAdmin = currentUser.role === 'admin';
  const userNormDept = normalizeDepartment(currentUser.department || '');

  // Filter state
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'unread' | 'replied' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);

  // Reply state
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replySuccessMsg, setReplySuccessMsg] = useState('');

  // Determine accessible inquiries based on Role-Based Access Control (RBAC)
  const accessibleInquiries = useMemo(() => {
    return inquiries.filter(inq => {
      if (isAdmin) {
        // Admin has access to admin inquiries and can oversee system inquiries
        return true;
      }
      // Coordinator: ONLY sees inquiries targeted for their specific department or UID
      const inqNormDept = normalizeDepartment(inq.recipientDepartment || inq.department || '');
      if (inq.recipientUid && inq.recipientUid === currentUser.id) return true;
      if (userNormDept && inqNormDept === userNormDept) return true;
      return false;
    });
  }, [inquiries, isAdmin, userNormDept, currentUser.id]);

  // Compute counts
  const unreadCount = useMemo(() => {
    return accessibleInquiries.filter(i => !i.archived && i.status === 'unread').length;
  }, [accessibleInquiries]);

  // Filtered inquiries list based on search and tab filter
  const displayedInquiries = useMemo(() => {
    return accessibleInquiries.filter(inq => {
      // Tab filter
      if (activeFilterTab === 'archived') {
        if (!inq.archived) return false;
      } else {
        if (inq.archived) return false;
        if (activeFilterTab === 'unread' && inq.status !== 'unread') return false;
        if (activeFilterTab === 'replied' && !inq.replyText) return false;
      }

      // Department filter (for admin)
      if (isAdmin && selectedDeptFilter !== 'all') {
        if (selectedDeptFilter === 'ADMIN') {
          if (inq.recipientType !== 'admin') return false;
        } else {
          const inqNorm = normalizeDepartment(inq.recipientDepartment || inq.department);
          if (inqNorm !== selectedDeptFilter) return false;
        }
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = inq.senderName.toLowerCase().includes(query);
        const matchesEmail = inq.senderEmail.toLowerCase().includes(query);
        const matchesMsg = inq.message.toLowerCase().includes(query);
        const matchesDept = (inq.department || '').toLowerCase().includes(query);
        return matchesName || matchesEmail || matchesMsg || matchesDept;
      }

      return true;
    });
  }, [accessibleInquiries, activeFilterTab, selectedDeptFilter, searchTerm, isAdmin]);

  const selectedInquiry = useMemo(() => {
    return accessibleInquiries.find(i => i.id === selectedInquiryId) || null;
  }, [accessibleInquiries, selectedInquiryId]);

  // Handler: Select inquiry and auto-mark as read
  const handleSelectInquiry = (inq: Inquiry) => {
    setSelectedInquiryId(inq.id);
    setReplyText(inq.replyText || '');
    setReplySuccessMsg('');

    if (inq.status === 'unread' && onUpdateInquiry) {
      onUpdateInquiry(inq.id, { status: 'read' });
      // Also update via API
      fetch(`/api/inquiries/${inq.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'read' })
      }).catch(console.warn);
    }
  };

  // Handler: Toggle status
  const handleToggleStatus = (inq: Inquiry, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newStatus = inq.status === 'read' ? 'unread' : 'read';
    if (onUpdateInquiry) {
      onUpdateInquiry(inq.id, { status: newStatus });
    }
    fetch(`/api/inquiries/${inq.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).catch(console.warn);
  };

  // Handler: Toggle archive
  const handleToggleArchive = (inq: Inquiry, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newArchived = !inq.archived;
    if (onUpdateInquiry) {
      onUpdateInquiry(inq.id, { archived: newArchived });
    }
    fetch(`/api/inquiries/${inq.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archived: newArchived })
    }).catch(console.warn);
  };

  // Handler: Delete inquiry
  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this inquiry?")) return;

    if (selectedInquiryId === id) {
      setSelectedInquiryId(null);
    }

    if (onDeleteInquiry) {
      onDeleteInquiry(id);
    }
    fetch(`/api/inquiries/${id}`, { method: 'DELETE' }).catch(console.warn);
  };

  // Handler: Send Reply
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !replyText.trim()) return;

    setIsSendingReply(true);
    const repliedBy = `${currentUser.fullName} (${isAdmin ? 'Admin' : `${currentUser.department || 'Dept'} Coordinator`})`;

    try {
      const res = await fetch(`/api/inquiries/${selectedInquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          replyText: replyText.trim(),
          repliedBy,
          status: 'read'
        })
      });

      if (res.ok) {
        if (onUpdateInquiry) {
          onUpdateInquiry(selectedInquiry.id, {
            replyText: replyText.trim(),
            repliedBy,
            repliedAt: new Date().toISOString(),
            status: 'read'
          });
        }
        setReplySuccessMsg("Reply recorded and saved successfully!");
        setTimeout(() => setReplySuccessMsg(''), 4000);
      }
    } catch (err) {
      console.warn("Failed to send reply:", err);
    } finally {
      setIsSendingReply(false);
    }
  };

  return (
    <div id="inbox-manager-container" className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#D4AF37]/35 shadow-[0_4px_25px_rgba(212,175,55,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#A67C00] text-white flex items-center justify-center shadow-md">
              <Inbox className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-serif-title text-2xl font-bold text-[#171717] flex items-center gap-2">
                <span>{isAdmin ? "Admin Communications Inbox" : `${currentUser.department || 'Department'} Coordinator Inbox`}</span>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 bg-gradient-to-r from-[#D4AF37] to-[#A67C00] text-white text-xs font-bold rounded-full shadow-sm animate-pulse">
                    {unreadCount} Unread
                  </span>
                )}
              </h2>
              <p className="text-xs text-[#666666]">
                {isAdmin
                  ? "Manage inquiries submitted for Club Administration and all 13 departments."
                  : `Secure inbox for student queries directed to the ${currentUser.department || 'Department'} Coordinator.`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-3.5 py-2 bg-[#FAFAFA] hover:bg-[#D4AF37]/10 text-[#171717] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-[#D4AF37]/30 cursor-pointer shadow-sm"
              title="Refresh Inquiries"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#A67C00]" />
              <span>Refresh</span>
            </button>
          )}
          <div className="px-3.5 py-1.5 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/30 text-xs font-semibold text-[#171717]">
            Total Inquiries: <strong className="font-black text-[#A67C00]">{accessibleInquiries.length}</strong>
          </div>
        </div>
      </div>

      {/* Main Inbox Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: List & Filters (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#D4AF37]/30 shadow-[0_4px_25px_rgba(212,175,55,0.06)] overflow-hidden flex flex-col">
          
          {/* Filter Bar */}
          <div className="p-4 border-b border-[#D4AF37]/20 bg-[#FAFAFA] space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#A67C00]/70 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search sender, email, or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sub-Tabs: All / Unread / Replied / Archived */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setActiveFilterTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeFilterTab === 'all'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white shadow-sm'
                    : 'bg-white text-[#666666] hover:bg-[#D4AF37]/10 hover:text-[#171717] border border-gray-200'
                }`}
              >
                All ({accessibleInquiries.filter(i => !i.archived).length})
              </button>
              <button
                onClick={() => setActiveFilterTab('unread')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  activeFilterTab === 'unread'
                    ? 'bg-gradient-to-r from-[#C9A227] to-[#A67C00] text-white shadow-sm'
                    : 'bg-white text-[#666666] hover:bg-[#D4AF37]/10 hover:text-[#171717] border border-gray-200'
                }`}
              >
                <span>Unread</span>
                {unreadCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-white text-[#A67C00] text-[10px] flex items-center justify-center font-black">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveFilterTab('replied')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeFilterTab === 'replied'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white shadow-sm'
                    : 'bg-white text-[#666666] hover:bg-[#D4AF37]/10 hover:text-[#171717] border border-gray-200'
                }`}
              >
                Replied ({accessibleInquiries.filter(i => !i.archived && i.replyText).length})
              </button>
              <button
                onClick={() => setActiveFilterTab('archived')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  activeFilterTab === 'archived'
                    ? 'bg-[#171717] text-white shadow-sm'
                    : 'bg-white text-[#666666] hover:bg-[#D4AF37]/10 hover:text-[#171717] border border-gray-200'
                }`}
              >
                <Archive className="w-3 h-3" />
                <span>Archive ({accessibleInquiries.filter(i => i.archived).length})</span>
              </button>
            </div>

            {/* Admin Department Filter */}
            {isAdmin && (
              <div className="pt-2 border-t border-[#D4AF37]/20 flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-[#A67C00] shrink-0" />
                <span className="text-[11px] font-bold text-[#666666] shrink-0">Filter Dept:</span>
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="w-full text-[11px] py-1 px-2 bg-white border border-gray-200 rounded-lg text-[#171717] font-medium focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="all">All Departments & Admin</option>
                  <option value="ADMIN">Admin / General Inquiries</option>
                  {DEPARTMENT_OPTIONS.map(d => (
                    <option key={d.code} value={d.code}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Inquiry List Items */}
          <div className="divide-y divide-gray-100 max-h-[640px] overflow-y-auto">
            {displayedInquiries.length === 0 ? (
              <div className="p-12 text-center space-y-3 text-[#666666]">
                <Inbox className="w-10 h-10 text-[#D4AF37]/40 mx-auto" />
                <div className="text-sm font-bold text-[#171717]">No Inquiries Found</div>
                <p className="text-xs text-[#666666] max-w-xs mx-auto">
                  {searchTerm
                    ? "No messages match your search filter criteria."
                    : activeFilterTab === 'unread'
                    ? "All inquiries have been read."
                    : activeFilterTab === 'archived'
                    ? "No archived inquiries."
                    : "Your inbox is clear. Messages submitted through the contact form will appear here."}
                </p>
              </div>
            ) : (
              displayedInquiries.map((inq) => {
                const isSelected = inq.id === selectedInquiryId;
                const isUnread = inq.status === 'unread';
                const createdDate = new Date(inq.createdAt);
                const timeString = isNaN(createdDate.getTime())
                  ? inq.createdAt
                  : createdDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={inq.id}
                    id={`inquiry-item-${inq.id}`}
                    onClick={() => handleSelectInquiry(inq)}
                    className={`p-4 transition-all cursor-pointer select-none relative ${
                      isSelected
                        ? 'bg-[#D4AF37]/15 border-l-4 border-[#D4AF37]'
                        : isUnread
                        ? 'bg-[#FFFBEB] hover:bg-[#FEF3C7] font-medium'
                        : 'bg-white hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        {isUnread ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] ring-2 ring-[#F5E7A8] shrink-0" />
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-gray-300 shrink-0" />
                        )}
                        <span className={`text-xs ${isUnread ? 'font-bold text-[#171717]' : 'font-semibold text-[#171717]'}`}>
                          {inq.senderName}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#666666] shrink-0">
                        {timeString}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#666666] mb-1.5 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[#666666] font-mono text-[10px]">{inq.senderEmail}</span>
                      <span className="text-[#D4AF37]">&bull;</span>
                      <span className="px-2 py-0.5 bg-[#FAFAFA] border border-[#D4AF37]/30 rounded text-[10px] font-bold text-[#A67C00]">
                        {inq.recipientType === 'admin' ? 'Admin' : (inq.recipientDepartment || inq.department)}
                      </span>
                      {inq.replyText && (
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-bold flex items-center gap-1">
                          <CheckCheck className="w-2.5 h-2.5" />
                          <span>Replied</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#666666] line-clamp-2 leading-relaxed">
                      {inq.message}
                    </p>

                    {/* Quick Hover/Action Buttons */}
                    <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                      <span className="text-[10px] text-[#666666]">
                        {inq.recipientType === 'admin' ? 'Admin Route' : `${inq.recipientDepartment || 'Dept'} Route`}
                      </span>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleToggleStatus(inq, e)}
                          title={isUnread ? "Mark as Read" : "Mark as Unread"}
                          className="p-1 text-gray-400 hover:text-[#A67C00] rounded hover:bg-white cursor-pointer"
                        >
                          {isUnread ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={(e) => handleToggleArchive(inq, e)}
                          title={inq.archived ? "Unarchive" : "Archive"}
                          className="p-1 text-gray-400 hover:text-[#A67C00] rounded hover:bg-white cursor-pointer"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(inq.id, e)}
                          title="Delete"
                          className="p-1 text-gray-400 hover:text-rose-600 rounded hover:bg-white cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Inquiry Details & Interactive Reply (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#D4AF37]/30 shadow-[0_4px_25px_rgba(212,175,55,0.06)] p-6 space-y-6">
          {selectedInquiry ? (
            <div className="space-y-6">
              
              {/* Inquiry Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#D4AF37]/20">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedInquiryId(null)}
                    className="lg:hidden px-2.5 py-1 bg-[#FAFAFA] rounded-lg text-xs font-bold flex items-center gap-1 text-[#666666]"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    selectedInquiry.status === 'unread'
                      ? 'bg-[#D4AF37]/15 text-[#A67C00] border border-[#D4AF37]/30'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {selectedInquiry.status === 'unread' ? 'Status: Unread' : 'Status: Read'}
                  </span>

                  {selectedInquiry.archived && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded">
                      Archived
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(selectedInquiry)}
                    className="px-3 py-1.5 bg-[#FAFAFA] hover:bg-[#D4AF37]/15 text-[#171717] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all border border-gray-200 cursor-pointer"
                  >
                    {selectedInquiry.status === 'unread' ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-[#A67C00]" />
                        <span>Mark Read</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                        <span>Mark Unread</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleToggleArchive(selectedInquiry)}
                    className="px-3 py-1.5 bg-[#FAFAFA] hover:bg-[#D4AF37]/15 text-[#171717] hover:text-[#A67C00] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all border border-gray-200 cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5 text-[#A67C00]" />
                    <span>{selectedInquiry.archived ? "Unarchive" : "Archive"}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(selectedInquiry.id)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all border border-rose-200 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Sender Details Header */}
              <div className="bg-[#FAFAFA] p-5 rounded-2xl border border-[#D4AF37]/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-[#A67C00]" />
                      <h3 className="font-serif-title font-bold text-lg text-[#171717]">
                        {selectedInquiry.senderName}
                      </h3>
                    </div>
                    <div className="text-xs text-[#666666] flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#A67C00]" />
                      <a href={`mailto:${selectedInquiry.senderEmail}`} className="text-[#A67C00] underline font-mono">
                        {selectedInquiry.senderEmail}
                      </a>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="text-xs text-[#666666] flex items-center gap-1 justify-end">
                      <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{new Date(selectedInquiry.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg border border-[#D4AF37]/30 text-xs font-bold text-[#A67C00]">
                      <Building className="w-3 h-3 text-[#D4AF37]" />
                      <span>{selectedInquiry.department}</span>
                    </div>
                  </div>
                </div>

                {/* Routing Notice */}
                <div className="p-3 bg-white rounded-xl border border-[#D4AF37]/25 text-xs text-[#666666] flex items-center gap-2">
                  <span className="font-bold text-[#A67C00]">Target Recipient:</span>
                  <span>
                    {selectedInquiry.recipientType === 'admin'
                      ? 'Admin Inbox (General Club / College-Wide Queries)'
                      : `${selectedInquiry.recipientDepartment || selectedInquiry.department} Department Coordinator Inbox`}
                  </span>
                </div>
              </div>

              {/* Inquiry Message Body */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#666666] uppercase tracking-wider">
                  Inquiry Message
                </h4>
                <div className="p-5 bg-white border border-gray-200 rounded-2xl text-sm text-[#171717] leading-relaxed whitespace-pre-wrap shadow-inner font-sans">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Previous Reply Display (if exists) */}
              {selectedInquiry.replyText && (
                <div className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-emerald-800 font-bold">
                    <div className="flex items-center gap-1.5">
                      <CheckCheck className="w-4 h-4 text-emerald-600" />
                      <span>Recorded Response from {selectedInquiry.repliedBy || 'Staff'}</span>
                    </div>
                    {selectedInquiry.repliedAt && (
                      <span className="text-[11px] font-normal text-emerald-700">
                        {new Date(selectedInquiry.repliedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {selectedInquiry.replyText}
                  </p>
                </div>
              )}

              {/* Interactive Reply Composer */}
              <div className="pt-4 border-t border-[#D4AF37]/20 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif-title font-bold text-sm text-[#171717] flex items-center gap-2">
                    <Reply className="w-4 h-4 text-[#D4AF37]" />
                    <span>{selectedInquiry.replyText ? "Update or Send Follow-Up Reply" : "Compose Internal Reply to Student"}</span>
                  </h4>
                  <span className="text-[11px] text-[#666666]">
                    Replying as: <strong className="text-[#171717]">{currentUser.fullName}</strong>
                  </span>
                </div>

                {replySuccessMsg && (
                  <div className="p-3 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{replySuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSendReply} className="space-y-3">
                  <textarea
                    rows={4}
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Type your reply to ${selectedInquiry.senderName} (${selectedInquiry.senderEmail})...`}
                    className="w-full text-xs p-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#D4AF37] bg-white leading-relaxed"
                  />

                  <div className="flex items-center justify-between gap-3">
                    <a
                      href={`mailto:${selectedInquiry.senderEmail}?subject=Re: Inquiry from VSB Lit Club Portal&body=${encodeURIComponent(
                        `Dear ${selectedInquiry.senderName},\n\nIn response to your inquiry:\n"${selectedInquiry.message}"\n\n${replyText}\n\nBest regards,\n${currentUser.fullName}\nVSB Literature Club`
                      )}`}
                      className="px-4 py-2 bg-[#FAFAFA] hover:bg-[#D4AF37]/10 text-[#171717] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-gray-200 cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#A67C00]" />
                      <span>Open in Email App</span>
                    </a>

                    <button
                      type="submit"
                      disabled={isSendingReply || !replyText.trim()}
                      className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] via-[#C9A227] to-[#A67C00] hover:shadow-[0_4px_16px_rgba(212,175,55,0.35)] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isSendingReply ? (
                        <span>Saving Reply...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 text-white" />
                          <span>Save & Mark Answered</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          ) : (
            <div className="py-24 text-center space-y-4 text-gray-400">
              <Mail className="w-12 h-12 text-[#D4AF37]/40 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-serif-title font-bold text-lg text-[#171717]">Select an Inquiry Message</h4>
                <p className="text-xs text-[#666666] max-w-sm mx-auto">
                  Click any inquiry in the left list to review complete student details, read the message, and compose a response.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
