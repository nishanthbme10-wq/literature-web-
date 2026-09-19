import { CheckCircle2, Download, Edit, Edit3, FileSpreadsheet, Inbox, LayoutTemplate, Plus, Redo2, Search, Settings, Shield, Trash2, Undo2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { ActivityLog, AttendanceRecord, Certificate, DEPARTMENTS, FeedbackSubmission, FooterConfig, GalleryItem, HeaderConfig, Inquiry, User, Winner, Workshop, normalizeDepartment } from '../types';
import { AdminControlCenter } from './AdminControlCenter';
import { AttendanceBackupVerification } from './AttendanceBackupVerification';
import { CoordinatorDashboard } from './CoordinatorDashboard';
import { ContentManagement } from './ContentManagement';
import { EventsManager } from './EventsManager';
import { InboxManager } from './InboxManager';
import { QrAttendanceScanner } from './QrAttendanceScanner';

interface AdminCoordinatorDashboardProps {
  currentUser: User;
  users: User[];
  workshops: Workshop[];
  winners: Winner[];
  galleryItems: GalleryItem[];
  attendanceRecords: AttendanceRecord[];
  feedbackSubmissions: FeedbackSubmission[];
  certificates: Certificate[];
  activityLogs: ActivityLog[];
  inquiries?: Inquiry[];
  headerConfig: HeaderConfig;
  footerConfig?: FooterConfig;
  onUpdateHeaderConfig: (newConfig: HeaderConfig) => void;
  onUpdateFooterConfig?: (newConfig: FooterConfig) => void;
  onOpenHeaderCustomizer: () => void;
  onOpenBulkExcelModal: () => void;
  onAddWorkshop: (ws: Partial<Workshop>) => void;
  onUpdateWorkshop: (id: string, updated: Partial<Workshop>) => void;
  onDeleteWorkshop: (id: string) => void;
  onAddWinner: (winner: Partial<Winner>) => void;
  onDeleteWinner: (id: string) => void;
  onAddGalleryItem: (item: Partial<GalleryItem>) => void;
  onDeleteGalleryItem: (id: string) => void;
  onUploadAttendance: (workshopId: string, records: any[]) => void;
  onAddUser: (user: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
  onUpdateInquiry?: (id: string, updates: Partial<Inquiry>) => void;
  onDeleteInquiry?: (id: string) => void;
  onRefreshInquiries?: () => void;
}

export const AdminCoordinatorDashboard: React.FC<AdminCoordinatorDashboardProps> = ({
  currentUser,
  users = [],
  workshops = [],
  winners = [],
  galleryItems = [],
  attendanceRecords = [],
  feedbackSubmissions = [],
  certificates = [],
  activityLogs = [],
  inquiries = [],
  headerConfig,
  footerConfig = {
    aboutText: "Empowering engineers through literary artistry, persuasive rhetoric, scholarly publication, and creative writing at VSB Engineering College.",
    contactNote: "Log in to register for Google Form workshops, submit attendance feedback, and download your verified e-certificates.",
    copyrightText: "Literature Club • VSB Engineering College. All Rights Reserved.",
    collegeTagline: "Official College Portal • Crafted for VSBEC Students"
  },
  onUpdateHeaderConfig,
  onUpdateFooterConfig,
  onOpenHeaderCustomizer,
  onOpenBulkExcelModal,
  onAddWorkshop,
  onUpdateWorkshop,
  onDeleteWorkshop,
  onAddWinner,
  onDeleteWinner,
  onAddGalleryItem,
  onDeleteGalleryItem,
  onUploadAttendance,
  onAddUser,
  onDeleteUser,
  onUpdateInquiry,
  onDeleteInquiry,
  onRefreshInquiries
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'admin_control' | 'coordinator' | 'events' | 'workshops' | 'members' | 'attendance' | 'qr_attendance' | 'winners' | 'gallery' | 'content_management' | 'logs' | 'site_editor' | 'inbox'>('analytics');

  // Compute unread inquiries count for current user
  const unreadInquiriesCount = useMemo(() => {
    const isAdmin = currentUser.role === 'admin';
    const userNormDept = normalizeDepartment(currentUser.department || '');
    return inquiries.filter(inq => {
      if (inq.archived || inq.status !== 'unread') return false;
      if (isAdmin) return true;
      const inqNormDept = normalizeDepartment(inq.recipientDepartment || inq.department || '');
      if (inq.recipientUid && inq.recipientUid === currentUser.id) return true;
      if (userNormDept && inqNormDept === userNormDept) return true;
      return false;
    }).length;
  }, [inquiries, currentUser]);

  // Search & Filter
  const [memberSearch, setMemberSearch] = useState('');
  const [memberDeptFilter, setMemberDeptFilter] = useState('All');
  const [memberSortBy, setMemberSortBy] = useState<'name_asc' | 'name_desc' | 'department' | 'year' | 'role' | 'newest'>('name_asc');

  // --- SITE EDITOR & UNDO / REDO STATE ---
  interface FullSiteConfig {
    header: HeaderConfig;
    footer: FooterConfig;
    aboutOverview: string;
    aboutMission: string;
    aboutVision: string;
    contactAddress: string;
    contactEmail: string;
    contactPhone: string;
    contactHours: string;
  }

  const initialSiteConfig: FullSiteConfig = {
    header: headerConfig,
    footer: footerConfig,
    aboutOverview: "The Literature Club at VSB Engineering College serves as an academic and creative platform dedicated to nurturing written excellence, oral eloquence, research literacy, and critical analysis.",
    aboutMission: "To train students across all engineering branches in academic writing, public speaking, research methodology, and competitive debate.",
    aboutVision: "To be recognized as a premier student literary guild that bridges technical expertise with visionary communication skills.",
    contactAddress: "Department of English, VSB Engineering College, NH-67 Karur-Trichy Main Road, Karur, Tamil Nadu 639111",
    contactEmail: "literatureclub@vsbec.ac.in",
    contactPhone: "+91 98765 43210 / +91 4324 280280",
    contactHours: "Monday – Saturday: 9:00 AM – 5:00 PM"
  };

  const [siteHistory, setSiteHistory] = useState<FullSiteConfig[]>([initialSiteConfig]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [siteEditorMsg, setSiteEditorMsg] = useState<string>('');

  const currentSiteConfig = siteHistory[historyIndex] || initialSiteConfig;

  // Push new state onto undo/redo stack
  const updateSiteConfig = (newConfig: FullSiteConfig, msg = 'Site updated!') => {
    const updatedHistory = siteHistory.slice(0, historyIndex + 1);
    setSiteHistory([...updatedHistory, newConfig]);
    setHistoryIndex(updatedHistory.length);
    setSiteEditorMsg(msg);
    setTimeout(() => setSiteEditorMsg(''), 2500);

    // Apply live to parent headers/footers
    onUpdateHeaderConfig(newConfig.header);
    if (onUpdateFooterConfig) onUpdateFooterConfig(newConfig.footer);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      const prevConfig = siteHistory[prevIndex];
      onUpdateHeaderConfig(prevConfig.header);
      if (onUpdateFooterConfig) onUpdateFooterConfig(prevConfig.footer);
      setSiteEditorMsg('Undo applied successfully.');
      setTimeout(() => setSiteEditorMsg(''), 2000);
    }
  };

  const handleRedo = () => {
    if (historyIndex < siteHistory.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      const nextConfig = siteHistory[nextIndex];
      onUpdateHeaderConfig(nextConfig.header);
      if (onUpdateFooterConfig) onUpdateFooterConfig(nextConfig.footer);
      setSiteEditorMsg('Redo applied successfully.');
      setTimeout(() => setSiteEditorMsg(''), 2000);
    }
  };

  // Workshop Form Modal state
  const [showWsModal, setShowWsModal] = useState(false);
  const [editingWsId, setEditingWsId] = useState<string | null>(null);
  const [wsTitle, setWsTitle] = useState('');
  const [wsPoster, setWsPoster] = useState('');
  const [wsDateTime, setWsDateTime] = useState('');
  const [wsVenue, setWsVenue] = useState('');
  const [wsResource, setWsResource] = useState('');
  const [wsDesc, setWsDesc] = useState('');
  const [wsFormUrl, setWsFormUrl] = useState('');
  const [wsStatus, setWsStatus] = useState<'Open' | 'Closed'>('Open');
  const [wsCategory, setWsCategory] = useState('Academic Research');
  const [wsEventCode, setWsEventCode] = useState('');
  const [wsRegistrationType, setWsRegistrationType] = useState<'individual' | 'team'>('individual');
  const [wsTeamMinSize, setWsTeamMinSize] = useState(2);
  const [wsTeamMaxSize, setWsTeamMaxSize] = useState(4);

  // Winner Form state
  const [showWinModal, setShowWinModal] = useState(false);
  const [winName, setWinName] = useState('');
  const [winDept, setWinDept] = useState('Computer Science & Engineering');
  const [winEvent, setWinEvent] = useState('');
  const [winTitle, setWinTitle] = useState('');
  const [winPhoto, setWinPhoto] = useState('');
  const [winMonth, setWinMonth] = useState('');

  // Gallery Upload state
  const [showGalModal, setShowGalModal] = useState(false);
  const [galAlbum, setGalAlbum] = useState('');
  const [galUrl, setGalUrl] = useState('');
  const [galTitle, setGalTitle] = useState('');

  // Attendance Upload State
  const [attWorkshopId, setAttWorkshopId] = useState<string>(workshops[0]?.id || '');
  const [attPasteText, setAttPasteText] = useState<string>('');
  const [attStatusMsg, setAttStatusMsg] = useState<string>('');

  // User Add state
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserDept, setNewUserDept] = useState('Computer Science & Engineering');
  const [newUserRole, setNewUserRole] = useState<'student' | 'coordinator'>('student');

  // User Edit state
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserUsername, setEditUserUsername] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserDept, setEditUserDept] = useState(DEPARTMENTS[0]);
  const [editUserYear, setEditUserYear] = useState('1st Year');
  const [editUserSection, setEditUserSection] = useState('A');
  const [editUserRole, setEditUserRole] = useState<'student' | 'coordinator' | 'admin'>('student');
  const [editUserPassword, setEditUserPassword] = useState('');
  const [editUserAvatar, setEditUserAvatar] = useState('');

  const handleOpenEditUserModal = (targetUser: User) => {
    setEditingUserId(targetUser.id);
    setEditUserName(targetUser.fullName);
    setEditUserUsername(targetUser.username);
    setEditUserEmail(targetUser.email);
    setEditUserPhone(targetUser.phone || '');
    setEditUserDept(targetUser.department || DEPARTMENTS[0]);
    setEditUserYear(targetUser.year || '1st Year');
    setEditUserSection(targetUser.section || 'A');
    setEditUserRole(targetUser.role);
    setEditUserPassword('');
    setEditUserAvatar(targetUser.avatarUrl || '');
    setShowEditUserModal(true);
  };

  const handleSaveEditedUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;

    try {
      const payload: any = {
        fullName: editUserName,
        username: editUserUsername,
        email: editUserEmail,
        phone: editUserPhone,
        department: editUserDept,
        year: editUserYear,
        section: editUserSection,
        role: editUserRole,
        avatarUrl: editUserAvatar
      };
      if (editUserPassword.trim()) {
        payload.password = editUserPassword.trim();
      }

      const res = await fetch(`/api/users/${editingUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to update user profile.');
        return;
      }

      setShowEditUserModal(false);
      setEditingUserId(null);
      alert('Member details updated successfully!');
      window.location.reload();
    } catch (err) {
      alert('Network error while saving member details.');
    }
  };

  // Analytics Metrics
  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalCoordinators = users.filter(u => u.role === 'coordinator' || u.role === 'admin').length;
  const totalWorkshops = workshops.length;
  const totalPresent = attendanceRecords.filter(a => a.status === 'Present').length;
  const attendancePct = attendanceRecords.length > 0 ? Math.round((totalPresent / attendanceRecords.length) * 100) : 0;

  // Filtered & Sorted members
  // This tab is intentionally for registered students only.
  const managementUsers: User[] = users.filter(
    (user) => user.role === 'student'
  );

  const filteredUsers = managementUsers
    .filter((u) => {
      const searchValue = memberSearch.toLowerCase();
      const matchesSearch =
        String(u.fullName || '').toLowerCase().includes(searchValue) ||
        String(u.department || '').toLowerCase().includes(searchValue) ||
        String(u.username || '').toLowerCase().includes(searchValue) ||
        String(u.email || '').toLowerCase().includes(searchValue) ||
        Boolean(
          u.phone && String(u.phone).includes(memberSearch)
        );

      const matchesDept =
        memberDeptFilter === 'All' ||
        u.department === memberDeptFilter;

      return matchesSearch && matchesDept;
    })
    .sort((a, b) => {
      if (memberSortBy === 'name_asc') {
        return a.fullName.localeCompare(b.fullName);
      }

      if (memberSortBy === 'name_desc') {
        return b.fullName.localeCompare(a.fullName);
      }

      if (memberSortBy === 'department') {
        return a.department.localeCompare(b.department);
      }

      if (memberSortBy === 'year') {
        return String(a.year || '').localeCompare(
          String(b.year || '')
        );
      }

      if (memberSortBy === 'newest') {
        return String(b.createdAt || '').localeCompare(
          String(a.createdAt || '')
        );
      }

      return 0;
    });

  // Workshop Edit Trigger
  const handleOpenEditWs = (ws: Workshop) => {
    setEditingWsId(ws.id);
    setWsTitle(ws.title);
    setWsPoster(ws.posterUrl || '');
    setWsDateTime(ws.dateTime || '');
    setWsVenue(ws.venue || '');
    setWsResource(ws.resourcePerson || '');
    setWsDesc(ws.description || '');
    setWsFormUrl(ws.googleFormUrl || '');
    setWsStatus(ws.status === 'Open' ? 'Open' : 'Closed');
    setWsCategory(ws.category || 'Academic Research');
    setWsEventCode(ws.eventCode || '');
    setWsRegistrationType(ws.registrationType || 'individual');
    setWsTeamMinSize(ws.teamMinSize || 2);
    setWsTeamMaxSize(ws.teamMaxSize || 4);
    setShowWsModal(true);
  };

  const normalizeWorkshopEventCode = (value: string) =>
    value
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '-')
      .replace(/[^A-Z0-9-]/g, '')
      .slice(0, 20);

  const validateGoogleFormUrl = (value: string) => {
    try {
      const url = new URL(value.trim());
      if (url.protocol !== 'https:') return false;
      if (url.hostname === 'forms.gle') return url.pathname.length > 1;
      if (url.hostname === 'docs.google.com') return url.pathname.startsWith('/forms');
      if (url.hostname === 'forms.google.com') return url.pathname.startsWith('/forms');
      return false;
    } catch {
      return false;
    }
  };

  const handleSaveWorkshop = (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedEventCode = normalizeWorkshopEventCode(wsEventCode);

    if (!wsTitle.trim()) {
      alert('Please enter the workshop title.');
      return;
    }

    if (!normalizedEventCode) {
      alert('Please enter a valid Event Code such as POETRY, DEBATE, or QUIZ.');
      return;
    }

    if (!wsFormUrl.trim() || !validateGoogleFormUrl(wsFormUrl)) {
      alert('Please enter a valid Google Forms link.');
      return;
    }

    if (wsRegistrationType === 'team') {
      if (wsTeamMinSize < 1 || wsTeamMaxSize < 1 || wsTeamMinSize > wsTeamMaxSize) {
        alert('Please enter a valid minimum and maximum team size.');
        return;
      }
    }

    const payload: Partial<Workshop> = {
      title: wsTitle.trim(),
      eventCode: normalizedEventCode,
      posterUrl: wsPoster.trim(),
      dateTime: wsDateTime.trim(),
      venue: wsVenue.trim(),
      resourcePerson: wsResource.trim(),
      description: wsDesc.trim(),
      googleFormUrl: wsFormUrl.trim(),
      status: wsStatus,
      category: wsCategory,
      registrationType: wsRegistrationType,
      teamMinSize: wsRegistrationType === 'team' ? wsTeamMinSize : undefined,
      teamMaxSize: wsRegistrationType === 'team' ? wsTeamMaxSize : undefined,
    };

    if (editingWsId) {
      onUpdateWorkshop(editingWsId, payload);
      alert('Workshop event updated successfully.');
    } else {
      onAddWorkshop(payload);
      alert('Workshop event added successfully.');
    }

    setShowWsModal(false);
    setEditingWsId(null);
    setWsEventCode('');
    setWsRegistrationType('individual');
    setWsTeamMinSize(2);
    setWsTeamMaxSize(4);
  };

  const handleSaveWinner = (e: React.FormEvent) => {
    e.preventDefault();
    onAddWinner({
      name: winName,
      department: winDept,
      eventName: winEvent,
      achievementTitle: winTitle,
      photoUrl: winPhoto.trim(),
      monthYear: winMonth
    });
    setShowWinModal(false);
  };

  const handleSaveGallery = (e: React.FormEvent) => {
    e.preventDefault();
    onAddGalleryItem({
      album: galAlbum,
      imageUrl: galUrl.trim(),
      title: galTitle,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });
    setShowGalModal(false);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedRole = currentUser.role === 'coordinator' ? 'student' : newUserRole;
    const creatorInfo = `${currentUser.fullName} (${currentUser.role === 'admin' ? 'Admin' : 'Coordinator'})`;

    onAddUser({
      fullName: newUserName,
      username: newUserUsername,
      email: newUserEmail,
      phone: newUserPhone,
      department: newUserDept,
      role: assignedRole,
      createdBy: creatorInfo,
      year: '',
      section: ''
    });

    // Reset fields
    setNewUserName('');
    setNewUserUsername('');
    setNewUserPassword('');
    setNewUserEmail('');
    setNewUserPhone('');
    setShowUserModal(false);
  };

  // Parse Attendance text paste
  const handleParseAttendance = () => {
    if (!attPasteText.trim() || !attWorkshopId) return;
    const lines = attPasteText.trim().split('\n');
    const records: any[] = [];

    lines.forEach(l => {
      const parts = l.split(/,|\t/);
      if (parts.length >= 2) {
        records.push({
          studentId: "",
          studentName: parts[0].trim(),
          department: parts[1].trim(),
          status: parts[2]?.trim().toLowerCase().includes('absent') ? 'Absent' : 'Present'
        });
      }
    });

    onUploadAttendance(attWorkshopId, records);
    setAttStatusMsg(`Uploaded attendance for ${records.length} students!`);
    setAttPasteText('');
  };

  // Export CSV Helper
  const handleExportCSV = (type: 'attendance' | 'members' | 'winners') => {
    let csv = '';
    if (type === 'attendance') {
      csv = "WorkshopTitle,StudentName,Department,Status,MarkedAt\n" +
        attendanceRecords.map(a => `"${a.workshopTitle}","${a.studentName}","${a.department}","${a.status}","${a.markedAt}"`).join("\n");
    } else if (type === 'members') {
      csv =
        "FullName,Username,LiteratureClubMemberID,CreatedBy,Email,Phone,Department,Year,Section,Role\n" +
        users
          .filter((u) => u.role === 'student')
          .map(
            (u) =>
              `"${u.fullName}","${u.username}","${
                u.clubMemberId || ''
              }","${
                u.createdBy || 'Self Registered'
              }","${u.email}","${
                u.phone || ''
              }","${u.department || ''}","${
                u.year || ''
              }","${u.section || ''}","${u.role}"`
          )
          .join("\n");
    } else if (type === 'winners') {
      csv = "Name,Department,EventName,AchievementTitle,MonthYear\n" +
        winners.map(w => `"${w.name}","${w.department}","${w.eventName}","${w.achievementTitle}","${w.monthYear}"`).join("\n");
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VSB_LitClub_${type}_report.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-white py-10 px-4 sm:px-6 text-[#171717]">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Bar */}
        <div className="bg-[#FAFAFA] text-[#171717] p-6 rounded-3xl shadow-[0_8px_30px_rgba(212,175,55,0.08)] border border-[#D4AF37] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#D4AF37]/15 rounded-2xl border border-[#D4AF37]/35 shadow-sm">
              <Shield className="w-8 h-8 text-[#A67C00]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  {currentUser.role} Portal
                </span>
                <span className="text-xs text-[#666666]">Equal Management Authorization</span>
              </div>
              <h1 className="font-serif-title text-2xl font-bold text-[#171717] mt-1">
                Literature Club Management Center
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenHeaderCustomizer}
              className="px-4 py-2.5 bg-white hover:bg-gray-50 text-[#171717] rounded-xl text-xs font-bold border border-[#D4AF37]/40 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-4 h-4 text-[#D4AF37]" />
              <span>Edit Site Header & Logos</span>
            </button>

            <button
              onClick={onOpenBulkExcelModal}
              className="px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] hover:shadow-md text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>Bulk Excel Certificates</span>
            </button>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-[#171717] text-white shadow-sm'
                : 'bg-[#FAFAFA] text-[#666666] hover:text-[#171717] border border-transparent hover:border-gray-200'
            }`}
          >
            Analytics & Reports
          </button>
          {currentUser.role === 'admin' && (
            <button onClick={() => setActiveTab('admin_control')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${activeTab === 'admin_control' ? 'bg-[#171717] text-white' : 'bg-[#FAFAFA] text-[#666666] border border-gray-200'}`}>
              <Shield className="w-4 h-4" /> Admin Control Center
            </button>
          )}
          {(currentUser.role === 'admin' || currentUser.role === 'coordinator') && (
            <button
              onClick={() => setActiveTab('coordinator')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${activeTab === 'coordinator' ? 'bg-[#171717] text-white shadow-sm' : 'bg-[#FAFAFA] text-[#666666] hover:text-[#171717] border border-transparent hover:border-gray-200'}`}
            >
              Coordinator Workspace
            </button>
          )}
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${activeTab === 'events' ? 'bg-[#171717] text-white shadow-sm' : 'bg-[#FAFAFA] text-[#666666] hover:text-[#171717] border border-transparent hover:border-gray-200'}`}
            >
              Events Manager
            </button>
          )}
          <button
            onClick={() => setActiveTab('workshops')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'workshops'
                ? 'bg-[#171717] text-white shadow-sm'
                : 'bg-[#FAFAFA] text-[#666666] hover:text-[#171717] border border-transparent hover:border-gray-200'
            }`}
          >
            Workshop Manager ({workshops.length})
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'members'
                ? 'bg-[#171717] text-white shadow-sm'
                : 'bg-[#FAFAFA] text-[#666666] hover:text-[#171717] border border-transparent hover:border-gray-200'
            }`}
          >
            Students ({users.filter((u) => u.role === 'student').length})
          </button>
          {currentUser.role === 'admin' || currentUser.role === 'coordinator' ? (
            <button
              onClick={() => setActiveTab('qr_attendance')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'qr_attendance' ? 'bg-[#171717] text-white shadow-sm' : 'bg-[#FAFAFA] text-[#666666] hover:text-[#171717] border border-transparent hover:border-gray-200'
              }`}
            >
              QR Check-in
            </button>
          ) : null}
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-[#171717] text-white shadow-sm'
                : 'bg-[#FAFAFA] text-[#666666] hover:text-[#171717] border border-transparent hover:border-gray-200'
            }`}
          >
            Attendance Tracker
          </button>
          <button
            onClick={() => setActiveTab('winners')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'winners'
                ? 'bg-[#171717] text-white shadow-sm'
                : 'bg-[#FAFAFA] text-[#666666] hover:text-[#171717] border border-transparent hover:border-gray-200'
            }`}
          >
            Winners ({winners.length})
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-[#171717] text-white shadow-sm'
                : 'bg-[#FAFAFA] text-[#666666] hover:text-[#171717] border border-transparent hover:border-gray-200'
            }`}
          >
            Gallery Manager
          </button>
          {(currentUser.role === 'admin' || currentUser.role === 'coordinator') && (
            <button
              onClick={() => setActiveTab('content_management')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'content_management'
                  ? 'bg-[#171717] text-white shadow-sm'
                  : 'bg-[#FAFAFA] text-[#666666] hover:text-[#171717] border border-transparent hover:border-gray-200'
              }`}
            >
              Content Management
            </button>
          )}
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveTab('site_editor')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 border cursor-pointer ${
                activeTab === 'site_editor'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white shadow-sm border-[#D4AF37]'
                  : 'bg-white text-[#A67C00] border-[#D4AF37]/40 hover:bg-[#FAFAFA]'
              }`}
            >
              <LayoutTemplate className="w-4 h-4 text-current" />
              <span>🎨 Edit Site & Logos (Admin Only)</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 border cursor-pointer ${
              activeTab === 'inbox'
                ? 'bg-[#171717] text-white shadow-sm border-[#171717]'
                : 'bg-white text-[#171717] border-[#D4AF37]/40 hover:bg-[#FAFAFA]'
            }`}
          >
            <Inbox className="w-4 h-4 text-[#D4AF37]" />
            <span>Inbox {unreadInquiriesCount > 0 ? `(${unreadInquiriesCount})` : ''}</span>
            {unreadInquiriesCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-[#171717] text-white shadow-sm'
                : 'bg-[#FAFAFA] text-[#666666] hover:text-[#171717] border border-transparent hover:border-gray-200'
            }`}
          >
            Activity Logs
          </button>
        </div>

        {activeTab === 'admin_control' && currentUser.role === 'admin' && (
          <AdminControlCenter currentUserId={currentUser.id} />
        )}

        {activeTab === 'coordinator' && (currentUser.role === 'admin' || currentUser.role === 'coordinator') && (
          <CoordinatorDashboard currentUser={currentUser} />
        )}

        {activeTab === 'events' && currentUser.role === 'admin' && (
          <EventsManager currentUserId={currentUser.id} />
        )}

        {activeTab === 'content_management' && (
          (currentUser.role === 'admin' || currentUser.role === 'coordinator') && (
            <ContentManagement adminUid={currentUser.id} />
          )
        )}

        {/* TAB 1: ANALYTICS & STATS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white p-6 rounded-2xl border border-[#D4AF37]/35 shadow-[0_4px_20px_rgba(212,175,55,0.06)] space-y-2">
                <div className="text-xs text-[#666666] font-bold uppercase tracking-wider">Total Registered Students</div>
                <div className="text-3xl font-bold font-serif-title text-[#171717]">{totalStudents}</div>
                <div className="text-[10px] text-emerald-700 font-bold">Live data from Firebase</div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#D4AF37]/35 shadow-[0_4px_20px_rgba(212,175,55,0.06)] space-y-2">
                <div className="text-xs text-[#666666] font-bold uppercase tracking-wider">Coordinators & Staff</div>
                <div className="text-3xl font-bold font-serif-title text-[#A67C00]">{totalCoordinators}</div>
                <div className="text-[10px] text-[#666666] font-bold">Faculty Advisors & Leads</div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                <div className="text-xs text-[#666666] font-bold uppercase tracking-wider">Workshops Conducted</div>
                <div className="text-3xl font-bold font-serif-title text-[#171717]">{totalWorkshops}</div>
                <div className="text-[10px] text-[#A67C00] font-bold">Active Google Form links</div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                <div className="text-xs text-[#666666] font-bold uppercase tracking-wider">Attendance Rate</div>
                <div className="text-3xl font-bold font-serif-title text-emerald-700">{attendancePct}%</div>
                <div className="text-[10px] text-[#666666] font-bold">{certificates.length} E-Certificates Issued</div>
              </div>

            </div>

            {/* Quick Export Cards */}
            <div className="bg-[#FAFAFA] p-6 rounded-2xl border border-[#D4AF37]/30 shadow-sm space-y-4">
              <h3 className="font-serif-title font-bold text-lg text-[#171717]">Download System Reports (CSV)</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => handleExportCSV('attendance')}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>Download Attendance CSV Report</span>
                </button>

                <button
                  onClick={() => handleExportCSV('members')}
                  className="px-4 py-2.5 bg-white text-[#171717] border border-[#D4AF37]/40 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer hover:bg-gray-50"
                >
                  <Download className="w-4 h-4 text-[#D4AF37]" />
                  <span>Download Member Directory CSV</span>
                </button>

                <button
                  onClick={() => handleExportCSV('winners')}
                  className="px-4 py-2.5 bg-[#171717] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#D4AF37]" />
                  <span>Download Winners List CSV</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WORKSHOP MANAGER */}
        {activeTab === 'workshops' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h3 className="font-serif-title font-bold text-xl text-[#171717]">Workshop Events & Registration Links</h3>
                <p className="text-xs text-[#666666]">
                  Update workshop details and Google Form links. When updated, the website registration buttons automatically redirect to the latest link.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingWsId(null);
                  setWsTitle('');
                  setWsPoster('');
                  setWsDateTime('');
                  setWsVenue('');
                  setWsResource('');
                  setWsDesc('');
                  setWsFormUrl('');
                  setWsStatus('Open');
                  setWsCategory('Academic Research');
                  setWsEventCode('');
                  setWsRegistrationType('individual');
                  setWsTeamMinSize(2);
                  setWsTeamMaxSize(4);
                  setShowWsModal(true);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Add Workshop Event</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workshops.map((ws) => (
                <div key={ws.id} className="bg-white p-6 rounded-2xl border border-[#D4AF37]/30 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#A67C00] uppercase bg-[#D4AF37]/15 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30">
                      {ws.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${ws.status === 'Open' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-gray-100 text-gray-700'}`}>
                      {ws.status}
                    </span>
                  </div>

                  <h4 className="font-serif-title font-bold text-base text-[#171717]">{ws.title}</h4>

                  <div className="flex flex-wrap items-center gap-2">
                    {ws.eventCode && (
                      <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-[#D4AF37]/10 text-[#A67C00] border border-[#D4AF37]/30">
                        {ws.eventCode}
                      </span>
                    )}
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-gray-100 text-gray-700">
                      {ws.registrationType === 'team' ? 'Team Registration' : 'Individual Registration'}
                    </span>
                    {ws.registrationType === 'team' && ws.teamMinSize && ws.teamMaxSize && (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-purple-50 text-purple-700">
                        Team {ws.teamMinSize}-{ws.teamMaxSize}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-xs text-[#666666] space-y-1 bg-[#FAFAFA] p-3 rounded-xl border border-gray-100">
                    <div><strong className="text-[#171717]">Date & Time:</strong> {ws.dateTime}</div>
                    <div><strong className="text-[#171717]">Venue:</strong> {ws.venue}</div>
                    <div><strong className="text-[#171717]">Resource Speaker:</strong> {ws.resourcePerson}</div>
                    <div className="truncate text-[#A67C00] font-mono"><strong className="text-[#171717]">Google Form:</strong> {ws.googleFormUrl}</div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleOpenEditWs(ws)}
                      className="px-3 py-1.5 bg-[#FAFAFA] border border-[#D4AF37]/40 text-[#171717] rounded-xl text-xs font-bold hover:bg-gray-100 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5 text-[#D4AF37]" /> Edit Event & Form Link
                    </button>
                    <button
                      onClick={() => onDeleteWorkshop(ws.id)}
                      className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MEMBERS & USERS */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <h3 className="font-serif-title font-bold text-xl text-[#171717]">Member Directory & Student Profiles</h3>
                <p className="text-xs text-[#666666]">
                  Showing <strong className="text-[#171717]">{filteredUsers.length}</strong> of <strong className="text-[#171717]">{managementUsers.length}</strong> registered student accounts in sorted order.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search name, phone, dept..."
                    className="text-xs p-2 pl-9 border border-gray-200 rounded-xl bg-white w-48 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                {/* Dept Filter */}
                <select
                  value={memberDeptFilter}
                  onChange={(e) => setMemberDeptFilter(e.target.value)}
                  className="text-xs p-2 border border-gray-200 rounded-xl bg-white font-medium max-w-[200px] truncate focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="All">All 13 Departments</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>

                {/* Sort Selector */}
                <select
                  value={memberSortBy}
                  onChange={(e) => setMemberSortBy(e.target.value as any)}
                  className="text-xs p-2 border border-[#D4AF37] rounded-xl bg-[#FAFAFA] font-bold text-[#171717] focus:outline-none"
                >
                  <option value="name_asc">Sort: Name (A to Z)</option>
                  <option value="name_desc">Sort: Name (Z to A)</option>
                  <option value="department">Sort: Department</option>
                  <option value="year">Sort: Year Level</option>
                  <option value="role">Sort: Role Priority</option>
                  <option value="newest">Sort: Newest Registered</option>
                </select>

                <button
                  onClick={() => setShowUserModal(true)}
                  className="px-3.5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>Add Member</span>
                </button>
              </div>
            </div>

            {/* Responsive Table Container */}
            <div className="bg-white rounded-3xl border border-[#D4AF37]/30 overflow-hidden shadow-sm space-y-2">
              <div className="bg-[#FAFAFA] px-4 py-2.5 text-[11px] font-bold text-[#171717] border-b border-gray-200 flex items-center justify-between">
                <span>Total Members: {filteredUsers.length}</span>
                <span className="text-[#A67C00] md:hidden font-medium">
                  ↔ Swipe left/right to view all 13 columns
                </span>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs min-w-[1000px]">
                  <thead className="bg-[#FAFAFA] text-[#171717] text-[11px] border-b border-[#D4AF37]/20">
                    <tr>
                      <th className="p-3 font-bold">1. Profile Photo</th>
                      <th className="p-3 font-bold">2. Name</th>
                      <th className="p-3 font-bold">3. Username</th>
                      <th className="p-3 font-bold">4. Literature Club Member ID</th>
                      <th className="p-3 font-bold">5. Department</th>
                      <th className="p-3 font-bold">6. Year</th>
                      <th className="p-3 font-bold">7. Section</th>
                      <th className="p-3 font-bold">8. Email</th>
                      <th className="p-3 font-bold">9. Phone Number</th>
                      <th className="p-3 font-bold">10. Role</th>
                      <th className="p-3 font-bold text-center">11. Attendance Count</th>
                      <th className="p-3 font-bold text-center">12. Certificate Status</th>
                      <th className="p-3 font-bold text-right">13. Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map((u) => {
                      const userAttCount = attendanceRecords.filter(a => a.studentId === u.id && a.status === 'Present').length;
                      const userCertCount = certificates.filter(c => c.studentId === u.id).length;

                      return (
                        <tr key={u.id} className="hover:bg-[#FAFAFA] transition-colors">
                          {/* 1. Profile Photo */}
                          <td className="p-3">
                            {u.avatarUrl ? (
                              <img
                                src={u.avatarUrl}
                                alt={u.fullName}
                                className="w-9 h-9 rounded-full object-cover border border-[#D4AF37] bg-white shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-[#FAFAFA] border border-[#D4AF37] flex items-center justify-center text-xs font-bold text-[#A67C00] font-serif-title uppercase shrink-0">
                                {u.fullName ? u.fullName.trim().charAt(0) : 'U'}
                              </div>
                            )}
                          </td>

                          {/* 2. Name */}
                          <td className="p-3 font-bold text-[#171717]">
                            <div>{u.fullName}</div>
                            <div className="text-[10px] text-gray-400 font-mono font-normal">By: {u.createdBy || 'Self Registered'}</div>
                          </td>

                          {/* 3. Username */}
                          <td className="p-3 font-mono font-semibold text-[#171717]">
                            {u.username}
                          </td>

                          {/* 4. Literature Club Member ID */}
                          <td className="p-3">
                            {u.clubMemberId ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#A67C00] font-mono font-black text-[10px] tracking-wide whitespace-nowrap">
                                {u.clubMemberId}
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-400 italic">
                                Not assigned
                              </span>
                            )}
                          </td>

                          {/* 5. Department */}
                          <td className="p-3 text-[#666666] font-medium max-w-[160px] truncate" title={u.department}>
                            {u.department}
                          </td>

                          {/* 6. Year */}
                          <td className="p-3 text-[#666666] font-medium">
                            {u.year || '1st'}
                          </td>

                          {/* 7. Section */}
                          <td className="p-3 text-[#666666] font-medium">
                            {u.section || 'A'}
                          </td>

                          {/* 8. Email */}
                          <td className="p-3 font-mono text-[#666666] text-[11px]">
                            {u.email}
                          </td>

                          {/* 9. Phone Number */}
                          <td className="p-3 text-[#666666]">
                            {u.phone || 'N/A'}
                          </td>

                          {/* 10. Role */}
                          <td className="p-3 font-bold uppercase text-[10px]">
                            <span className={`px-2.5 py-1 rounded-full ${u.role === 'admin' ? 'bg-[#D4AF37] text-white' : u.role === 'coordinator' ? 'bg-[#171717] text-white' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}`}>
                              {u.role}
                            </span>
                          </td>

                          {/* 11. Attendance Count */}
                          <td className="p-3 text-center">
                            <span className="px-2 py-1 bg-[#FAFAFA] text-[#171717] rounded-lg font-bold text-[11px] border border-[#D4AF37]/30">
                              {userAttCount} Attended
                            </span>
                          </td>

                          {/* 12. Certificate Status */}
                          <td className="p-3 text-center">
                            <span className={`px-2 py-1 rounded-lg font-bold text-[11px] ${userCertCount > 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-gray-100 text-gray-600'}`}>
                              {userCertCount > 0 ? `${userCertCount} Issued` : 'None'}
                            </span>
                          </td>

                          {/* 13. Actions */}
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditUserModal(u)}
                                className="px-2.5 py-1 bg-white border border-gray-200 hover:border-[#D4AF37] text-[#171717] rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                              >
                                Edit
                              </button>
                              {u.avatarUrl && (
                                <button
                                  onClick={() => {
                                    const a = document.createElement('a');
                                    a.href = u.avatarUrl!;
                                    a.download = `${u.fullName.replace(/\s+/g, '_')}_Photo.png`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                  }}
                                  className="px-2 py-1 bg-[#FAFAFA] border border-[#D4AF37]/40 text-[#A67C00] rounded-lg font-bold text-[10px] inline-flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                                  title="Download Photo"
                                >
                                  <Download className="w-3 h-3 text-[#D4AF37]" />
                                </button>
                              )}
                              {currentUser.role === 'admin' && u.id !== currentUser.id && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete profile for ${u.fullName}?`)) {
                                      onDeleteUser(u.id);
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* QR ATTENDANCE */}
        {activeTab === 'qr_attendance' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-serif-title font-bold text-xl text-[#171717]">QR Attendance Check-in</h3>
              <p className="text-xs text-[#666666]">Authorized staff can verify a registration QR and mark the student present.</p>
            </div>
            <QrAttendanceScanner />
            <AttendanceBackupVerification />
          </div>
        )}

        {/* TAB 4: ATTENDANCE TRACKER */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-serif-title font-bold text-xl text-[#171717]">Attendance Upload & Management</h3>
              <p className="text-xs text-[#666666]">Upload CSV/Excel attendance sheet or paste tabular student present lists.</p>
            </div>

            {attStatusMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
                {attStatusMsg}
              </div>
            )}

            <div className="bg-white p-6 rounded-3xl border border-[#D4AF37]/30 shadow-sm space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">Select Workshop Event *</label>
                <select
                  value={attWorkshopId}
                  onChange={(e) => setAttWorkshopId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                >
                  {workshops.map(ws => (
                    <option key={ws.id} value={ws.id}>{ws.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">Paste Attendance List (Name, Dept, Status)</label>
                <textarea
                  rows={5}
                  value={attPasteText}
                  onChange={(e) => setAttPasteText(e.target.value)}
                  placeholder="Student Name, Department, Present"
                  className="w-full text-xs p-3 bg-white border border-gray-200 rounded-xl font-mono focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <button
                onClick={handleParseAttendance}
                className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
              >
                Upload Attendance Records
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: WINNERS MANAGER */}
        {activeTab === 'winners' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h3 className="font-serif-title font-bold text-xl text-[#171717]">Monthly Winners Showcase</h3>
                <p className="text-xs text-[#666666]">Editable winner photos, names, departments, and achievement titles.</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onOpenBulkExcelModal}
                  className="px-3.5 py-2 bg-white text-[#171717] border border-[#D4AF37]/40 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer hover:bg-gray-50"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#D4AF37]" />
                  <span>Bulk Excel Certificates</span>
                </button>

                <button
                  onClick={() => setShowWinModal(true)}
                  className="px-3.5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>Add Winner Card</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {winners.map((win) => (
                <div key={win.id} className="bg-white p-5 rounded-3xl border border-[#D4AF37]/30 shadow-sm text-center space-y-3 relative">
                  <button
                    onClick={() => onDeleteWinner(win.id)}
                    className="absolute top-3 right-3 text-rose-500 hover:text-rose-700 text-xs font-bold p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <img
                    src={win.photoUrl}
                    alt={win.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#D4AF37] mx-auto bg-gray-50"
                  />
                  <div>
                    <h4 className="font-serif-title font-bold text-sm text-[#171717]">{win.name}</h4>
                    <p className="text-xs text-[#A67C00] font-semibold">{win.department}</p>
                    <div className="text-[11px] text-[#666666] mt-1">{win.eventName}</div>
                    <div className="text-xs font-bold text-[#171717] font-serif-title">{win.achievementTitle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: GALLERY MANAGER */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h3 className="font-serif-title font-bold text-xl text-[#171717]">Gallery Image Manager</h3>
                <p className="text-xs text-[#666666]">Upload new photos and organize into event albums.</p>
              </div>

              <button
                onClick={() => setShowGalModal(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Upload Gallery Photo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {galleryItems.map((item) => (
                <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-[#D4AF37]/30 shadow-sm relative group">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-44 object-cover" />
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] bg-[#D4AF37]/15 text-[#A67C00] border border-[#D4AF37]/30 font-bold px-2 py-0.5 rounded-full">{item.album}</span>
                      <h5 className="font-serif-title font-bold text-xs text-[#171717] mt-1.5 truncate">{item.title}</h5>
                    </div>
                    <button onClick={() => onDeleteGalleryItem(item.id)} className="text-rose-600 p-1 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: ACTIVITY LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <h3 className="font-serif-title font-bold text-xl text-[#171717]">Admin & Coordinator Activity Audit Logs</h3>
            <div className="bg-white rounded-3xl border border-[#D4AF37]/30 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAFA] text-[#171717] border-b border-gray-200">
                  <tr>
                    <th className="p-3.5 font-bold">Timestamp</th>
                    <th className="p-3.5 font-bold">User & Role</th>
                    <th className="p-3.5 font-bold">Action</th>
                    <th className="p-3.5 font-bold">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#FAFAFA]">
                      <td className="p-3.5 font-mono text-[#666666]">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="p-3.5 font-bold text-[#171717]">
                        {log.userName} <span className="text-[10px] text-[#A67C00] uppercase">({log.userRole})</span>
                      </td>
                      <td className="p-3.5 font-semibold text-[#171717]">{log.action}</td>
                      <td className="p-3.5 text-[#666666]">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: GLOBAL SITE EDITOR WITH UNDO / REDO */}
        {activeTab === 'site_editor' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D4AF37] shadow-xl space-y-8 text-[#171717]">
            
            {/* Top Toolbar with Undo & Redo Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAFAFA] text-[#171717] p-5 rounded-2xl border border-[#D4AF37]/30">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <LayoutTemplate className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="font-serif-title text-lg font-bold text-[#171717]">Centralized Site Content Editor</h3>
                </div>
                <p className="text-xs text-[#666666]">
                  Edit site title, header branding, end-of-page footer content, about details, and contact info with complete Undo & Redo capability.
                </p>
              </div>

              {/* Undo & Redo Buttons */}
              <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-200">
                <button
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    historyIndex > 0
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white cursor-pointer shadow'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  title="Undo previous change"
                >
                  <Undo2 className="w-4 h-4" />
                  <span>Undo</span>
                </button>

                <div className="text-[11px] font-mono text-[#A67C00] px-2 font-bold">
                  Step {historyIndex + 1} of {siteHistory.length}
                </div>

                <button
                  onClick={handleRedo}
                  disabled={historyIndex >= siteHistory.length - 1}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    historyIndex < siteHistory.length - 1
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white cursor-pointer shadow'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  title="Redo change"
                >
                  <Redo2 className="w-4 h-4" />
                  <span>Redo</span>
                </button>
              </div>
            </div>

            {siteEditorMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{siteEditorMsg}</span>
              </div>
            )}

            {/* Sub-Section 1: Site Title & Header Config */}
            <div className="bg-[#FAFAFA] p-6 rounded-2xl border border-[#D4AF37]/30 space-y-4">
              <h4 className="font-serif-title font-bold text-base text-[#171717] flex items-center gap-2 border-b border-gray-200 pb-2">
                <Edit3 className="w-4 h-4 text-[#D4AF37]" />
                <span>1. Site Title & Header Branding ("VSB Lit Club Portal")</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Site Title / Portal Name *</label>
                  <input
                    type="text"
                    value={currentSiteConfig.header.siteName}
                    onChange={(e) => {
                      const updatedHeader = { ...currentSiteConfig.header, siteName: e.target.value };
                      updateSiteConfig({ ...currentSiteConfig, header: updatedHeader }, 'Updated Portal Site Name');
                    }}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-serif-title font-bold text-[#171717] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Institution Subtitle *</label>
                  <input
                    type="text"
                    value={currentSiteConfig.header.siteSubtitle}
                    onChange={(e) => {
                      const updatedHeader = { ...currentSiteConfig.header, siteSubtitle: e.target.value };
                      updateSiteConfig({ ...currentSiteConfig, header: updatedHeader }, 'Updated Subtitle');
                    }}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Hero Banner Slogan *</label>
                  <input
                    type="text"
                    value={currentSiteConfig.header.heroSlogan}
                    onChange={(e) => {
                      const updatedHeader = { ...currentSiteConfig.header, heroSlogan: e.target.value };
                      updateSiteConfig({ ...currentSiteConfig, header: updatedHeader }, 'Updated Hero Slogan');
                    }}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-serif-title font-bold text-[#A67C00] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Left Circular Logo URL (College)</label>
                  <input
                    type="text"
                    value={currentSiteConfig.header.leftLogoUrl}
                    onChange={(e) => {
                      const updatedHeader = { ...currentSiteConfig.header, leftLogoUrl: e.target.value };
                      updateSiteConfig({ ...currentSiteConfig, header: updatedHeader }, 'Updated Left Logo');
                    }}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </div>

            {/* Sub-Section 2: End of Page & Footer Content */}
            <div className="bg-[#FAFAFA] p-6 rounded-2xl border border-[#D4AF37]/30 space-y-4">
              <h4 className="font-serif-title font-bold text-base text-[#171717] flex items-center gap-2 border-b border-gray-200 pb-2">
                <Edit3 className="w-4 h-4 text-[#D4AF37]" />
                <span>2. End of Page / Footer Content</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Footer Overview Paragraph *</label>
                  <textarea
                    rows={3}
                    value={currentSiteConfig.footer.aboutText}
                    onChange={(e) => {
                      const updatedFooter = { ...currentSiteConfig.footer, aboutText: e.target.value };
                      updateSiteConfig({ ...currentSiteConfig, footer: updatedFooter }, 'Updated Footer Overview');
                    }}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Footer Services & Contact Note *</label>
                  <textarea
                    rows={3}
                    value={currentSiteConfig.footer.contactNote}
                    onChange={(e) => {
                      const updatedFooter = { ...currentSiteConfig.footer, contactNote: e.target.value };
                      updateSiteConfig({ ...currentSiteConfig, footer: updatedFooter }, 'Updated Footer Note');
                    }}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Copyright Line *</label>
                  <input
                    type="text"
                    value={currentSiteConfig.footer.copyrightText}
                    onChange={(e) => {
                      const updatedFooter = { ...currentSiteConfig.footer, copyrightText: e.target.value };
                      updateSiteConfig({ ...currentSiteConfig, footer: updatedFooter }, 'Updated Copyright');
                    }}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#171717]">College Tagline *</label>
                  <input
                    type="text"
                    value={currentSiteConfig.footer.collegeTagline}
                    onChange={(e) => {
                      const updatedFooter = { ...currentSiteConfig.footer, collegeTagline: e.target.value };
                      updateSiteConfig({ ...currentSiteConfig, footer: updatedFooter }, 'Updated Tagline');
                    }}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </div>

            {/* Sub-Section 3: About Section Overview */}
            <div className="bg-[#FAFAFA] p-6 rounded-2xl border border-[#D4AF37]/30 space-y-4">
              <h4 className="font-serif-title font-bold text-base text-[#171717] flex items-center gap-2 border-b border-gray-200 pb-2">
                <Edit3 className="w-4 h-4 text-[#D4AF37]" />
                <span>3. About Club Page (Overview, Mission & Vision)</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Club Overview Statement</label>
                  <textarea
                    rows={2}
                    value={currentSiteConfig.aboutOverview}
                    onChange={(e) => {
                      updateSiteConfig({ ...currentSiteConfig, aboutOverview: e.target.value }, 'Updated About Overview');
                    }}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1 text-[#171717]">Mission Statement</label>
                    <textarea
                      rows={2}
                      value={currentSiteConfig.aboutMission}
                      onChange={(e) => {
                        updateSiteConfig({ ...currentSiteConfig, aboutMission: e.target.value }, 'Updated Mission');
                      }}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[#171717]">Vision Statement</label>
                    <textarea
                      rows={2}
                      value={currentSiteConfig.aboutVision}
                      onChange={(e) => {
                        updateSiteConfig({ ...currentSiteConfig, aboutVision: e.target.value }, 'Updated Vision');
                      }}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-Section 4: Contact Details */}
            <div className="bg-[#FAFAFA] p-6 rounded-2xl border border-[#D4AF37]/30 space-y-4">
              <h4 className="font-serif-title font-bold text-base text-[#171717] flex items-center gap-2 border-b border-gray-200 pb-2">
                <Edit3 className="w-4 h-4 text-[#D4AF37]" />
                <span>4. Contact Page & Official Office Details</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Office Address</label>
                  <input
                    type="text"
                    value={currentSiteConfig.contactAddress}
                    onChange={(e) => {
                      updateSiteConfig({ ...currentSiteConfig, contactAddress: e.target.value }, 'Updated Address');
                    }}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Helpline Email</label>
                  <input
                    type="email"
                    value={currentSiteConfig.contactEmail}
                    onChange={(e) => {
                      updateSiteConfig({ ...currentSiteConfig, contactEmail: e.target.value }, 'Updated Email');
                    }}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Phone Contact</label>
                  <input
                    type="text"
                    value={currentSiteConfig.contactPhone}
                    onChange={(e) => {
                      updateSiteConfig({ ...currentSiteConfig, contactPhone: e.target.value }, 'Updated Phone');
                    }}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Office Working Hours</label>
                  <input
                    type="text"
                    value={currentSiteConfig.contactHours}
                    onChange={(e) => {
                      updateSiteConfig({ ...currentSiteConfig, contactHours: e.target.value }, 'Updated Hours');
                    }}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 8: INTERNAL INQUIRIES INBOX */}
        {activeTab === 'inbox' && (
          <InboxManager
            currentUser={currentUser}
            inquiries={inquiries}
            onUpdateInquiry={onUpdateInquiry}
            onDeleteInquiry={onDeleteInquiry}
            onRefresh={onRefreshInquiries}
          />
        )}

        {/* MODAL: ADD/EDIT WORKSHOP */}
        {showWsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-lg rounded-3xl border border-[#D4AF37] p-6 space-y-4 my-8 shadow-2xl text-[#171717]">
              <h3 className="font-serif-title font-bold text-lg text-[#171717]">
                {editingWsId ? 'Edit Workshop Event & Registration Link' : 'Add New Workshop Event'}
              </h3>

              <form onSubmit={handleSaveWorkshop} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Workshop Title *</label>
                  <input
                    type="text"
                    required
                    value={wsTitle}
                    onChange={(e) => setWsTitle(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#A67C00]">Event Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={20}
                    value={wsEventCode}
                    onChange={(e) => setWsEventCode(normalizeWorkshopEventCode(e.target.value))}
                    placeholder="e.g. POETRY"
                    className="w-full p-2.5 bg-white border border-[#D4AF37]/40 rounded-xl font-mono font-bold uppercase focus:outline-none focus:border-[#D4AF37]"
                  />
                  <p className="text-[10px] text-[#777777] mt-1">
                    Used for department-based registration IDs, e.g. LC26-BT-POETRY-001.
                  </p>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Google Form Registration Link *</label>
                  <input
                    type="url"
                    required
                    value={wsFormUrl}
                    onChange={(e) => setWsFormUrl(e.target.value)}
                    placeholder="https://forms.google.com/..."
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1 text-[#171717]">Date & Time *</label>
                    <input
                      type="text"
                      required
                      value={wsDateTime}
                      onChange={(e) => setWsDateTime(e.target.value)}
                      placeholder="e.g. 2026-08-25 at 10:00 AM"
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[#171717]">Status</label>
                    <select
                      value={wsStatus}
                      onChange={(e) => setWsStatus(e.target.value as any)}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="Open">Registration Open</option>
                      <option value="Closed">Registration Closed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Venue *</label>
                  <input
                    type="text"
                    required
                    value={wsVenue}
                    onChange={(e) => setWsVenue(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Resource Speaker *</label>
                  <input
                    type="text"
                    required
                    value={wsResource}
                    onChange={(e) => setWsResource(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="p-3 bg-[#FAFAFA] border border-[#D4AF37]/30 rounded-2xl space-y-3">
                  <div>
                    <label className="block font-bold mb-1 text-[#A67C00]">Registration Type *</label>
                    <p className="text-[10px] text-[#777777]">Choose individual or team registration for this event.</p>
                  </div>

                  <select
                    required
                    value={wsRegistrationType}
                    onChange={(e) => setWsRegistrationType(e.target.value as 'individual' | 'team')}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="individual">Individual Registration</option>
                    <option value="team">Team Registration</option>
                  </select>

                  {wsRegistrationType === 'team' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold mb-1">Minimum Team Size *</label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={wsTeamMinSize}
                          onChange={(e) => setWsTeamMinSize(Number(e.target.value))}
                          className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">Maximum Team Size *</label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={wsTeamMaxSize}
                          onChange={(e) => setWsTeamMaxSize(Number(e.target.value))}
                          className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Poster Photo Upload or Image URL</label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 20 * 1024 * 1024) {
                            alert('File size exceeds 20MB limit.');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) setWsPoster(ev.target.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-xs text-[#666666] file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:bg-[#D4AF37]/15 file:text-[#A67C00] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={wsPoster}
                      onChange={(e) => setWsPoster(e.target.value)}
                      placeholder="Or paste https://... poster image URL"
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                    {wsPoster && (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#D4AF37]">
                        <img src={wsPoster} alt="Poster preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Description</label>
                  <textarea
                    rows={3}
                    value={wsDesc}
                    onChange={(e) => setWsDesc(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                  <button type="button" onClick={() => setShowWsModal(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-[#666666] hover:bg-gray-50 cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white font-bold rounded-xl shadow-sm cursor-pointer">Save Event</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD WINNER */}
        {showWinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-md rounded-3xl border border-[#D4AF37] p-6 space-y-4 my-8 shadow-2xl text-[#171717]">
              <h3 className="font-serif-title font-bold text-lg text-[#171717]">Add Winner Record</h3>
              <form onSubmit={handleSaveWinner} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Winner Student Name *</label>
                  <input type="text" required value={winName} onChange={(e) => setWinName(e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]" />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Department *</label>
                  <select
                    required
                    value={winDept}
                    onChange={(e) => setWinDept(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Event Name *</label>
                  <input type="text" required value={winEvent} onChange={(e) => setWinEvent(e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]" />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Achievement Title *</label>
                  <input type="text" required value={winTitle} onChange={(e) => setWinTitle(e.target.value)} placeholder="e.g. 1st Place - Golden Quill" className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]" />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Winner Photo Upload or Image URL</label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 20 * 1024 * 1024) {
                            alert('File size exceeds 20MB limit.');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) setWinPhoto(ev.target.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-xs text-[#666666] file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:bg-[#D4AF37]/15 file:text-[#A67C00] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={winPhoto}
                      onChange={(e) => setWinPhoto(e.target.value)}
                      placeholder="Or paste https://... photo URL"
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                    {winPhoto && (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#D4AF37]">
                        <img src={winPhoto} alt="Winner Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                  <button type="button" onClick={() => setShowWinModal(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-[#666666] hover:bg-gray-50 cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white font-bold rounded-xl shadow-sm cursor-pointer">Save Winner</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD GALLERY PHOTO */}
        {showGalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-md rounded-3xl border border-[#D4AF37] p-6 space-y-4 my-8 shadow-2xl text-[#171717]">
              <h3 className="font-serif-title font-bold text-lg text-[#171717]">Upload Event Photo to Gallery</h3>
              <form onSubmit={handleSaveGallery} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Album Title *</label>
                  <input type="text" required value={galAlbum} onChange={(e) => setGalAlbum(e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]" />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Gallery Photo Upload or Image URL *</label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 20 * 1024 * 1024) {
                            alert('File size exceeds 20MB limit.');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) setGalUrl(ev.target.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-xs text-[#666666] file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:bg-[#D4AF37]/15 file:text-[#A67C00] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={galUrl}
                      onChange={(e) => setGalUrl(e.target.value)}
                      placeholder="Or paste https://... photo URL"
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                    {galUrl && (
                      <div className="relative w-24 h-20 rounded-xl overflow-hidden border border-[#D4AF37]">
                        <img src={galUrl} alt="Gallery Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Caption / Title</label>
                  <input type="text" value={galTitle} onChange={(e) => setGalTitle(e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]" />
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                  <button type="button" onClick={() => setShowGalModal(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-[#666666] hover:bg-gray-50 cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white font-bold rounded-xl shadow-sm cursor-pointer">Upload Photo</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD USER */}
        {showUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-md rounded-3xl border border-[#D4AF37] p-6 space-y-4 my-8 shadow-2xl text-[#171717]">
              <div>
                <h3 className="font-serif-title font-bold text-lg text-[#171717]">Add Student / Coordinator Member</h3>
                <p className="text-[11px] text-[#666666]">
                  Creating profile as <strong className="text-[#171717]">{currentUser.fullName} ({currentUser.role === 'admin' ? 'Admin' : 'Coordinator'})</strong>.
                </p>
              </div>

              <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Full Name *</label>
                  <input type="text" required value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Enter full name" className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]" />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Username (ID) *</label>
                  <input type="text" required value={newUserUsername} onChange={(e) => setNewUserUsername(e.target.value)} placeholder="e.g. priya_vsb" className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-mono focus:outline-none focus:border-[#D4AF37]" />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Set Login Password *</label>
                  <input type="text" required value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder="Managed securely by Firebase Authentication" className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-mono focus:outline-none focus:border-[#D4AF37]" />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Email ID *</label>
                  <input type="email" required value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="e.g. priya@vsbec.ac.in" className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]" />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Phone Number</label>
                  <input type="tel" value={newUserPhone} onChange={(e) => setNewUserPhone(e.target.value)} placeholder="Enter phone number" className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]" />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Department *</label>
                  <select
                    required
                    value={newUserDept}
                    onChange={(e) => setNewUserDept(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Role *</label>
                  {currentUser.role === 'coordinator' ? (
                    <div className="p-2.5 bg-[#FAFAFA] border border-[#D4AF37]/30 rounded-xl text-xs font-bold text-[#171717]">
                      Student (Coordinators can create Student IDs)
                    </div>
                  ) : (
                    <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as any)} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]">
                      <option value="student">Student</option>
                      <option value="coordinator">Coordinator</option>
                    </select>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                  <button type="button" onClick={() => setShowUserModal(false)} className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-[#666666] hover:bg-gray-50 cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white font-bold rounded-xl shadow-sm cursor-pointer">Create Member Account</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EDIT USER */}
        {showEditUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-lg rounded-3xl border border-[#D4AF37] p-6 space-y-4 my-8 shadow-2xl text-[#171717]">
              <div>
                <h3 className="font-serif-title font-bold text-lg text-[#171717]">Edit Member Details & Role</h3>
                <p className="text-[11px] text-[#666666]">
                  Modifying profile as <strong className="text-[#171717]">{currentUser.fullName} ({currentUser.role.toUpperCase()})</strong>.
                </p>
              </div>

              <form onSubmit={handleSaveEditedUser} className="space-y-3 text-xs">
                {/* Photo Preview & Edit */}
                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Profile Photo URL / Upload</label>
                  <div className="flex items-center gap-3">
                    {editUserAvatar ? (
                      <img src={editUserAvatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-[#D4AF37]" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#FAFAFA] border-2 border-[#D4AF37] flex items-center justify-center font-bold text-[#A67C00]">
                        {editUserName ? editUserName.charAt(0) : 'U'}
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 20 * 1024 * 1024) {
                          alert('File size exceeds 20MB.');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) setEditUserAvatar(ev.target.result as string);
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="text-xs text-[#666666] file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:bg-[#D4AF37]/15 file:text-[#A67C00] cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1 text-[#171717]">Full Name *</label>
                    <input type="text" required value={editUserName} onChange={(e) => setEditUserName(e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]" />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-[#171717]">Username (ID) *</label>
                    <input type="text" required value={editUserUsername} onChange={(e) => setEditUserUsername(e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-mono focus:outline-none focus:border-[#D4AF37]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1 text-[#171717]">Email ID *</label>
                    <input type="email" required value={editUserEmail} onChange={(e) => setEditUserEmail(e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]" />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-[#171717]">Phone Number</label>
                    <input type="tel" value={editUserPhone} onChange={(e) => setEditUserPhone(e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Department *</label>
                  <select
                    required
                    value={editUserDept}
                    onChange={(e) => setEditUserDept(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1 text-[#171717]">Year Level *</label>
                    <select
                      value={editUserYear}
                      onChange={(e) => setEditUserYear(e.target.value)}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Faculty/Admin">Faculty/Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-[#171717]">Section *</label>
                    <select
                      value={editUserSection}
                      onChange={(e) => setEditUserSection(e.target.value)}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                      <option value="D">Section D</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1 text-[#171717]">Role Permission</label>
                    {currentUser.role === 'admin' ? (
                      <select value={editUserRole} onChange={(e) => setEditUserRole(e.target.value as any)} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]">
                        <option value="student">Student</option>
                        <option value="coordinator">Coordinator</option>
                        <option value="admin">Administrator</option>
                      </select>
                    ) : (
                      <div className="p-2.5 bg-[#FAFAFA] rounded-xl text-[#171717] font-bold uppercase">{editUserRole}</div>
                    )}
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-[#171717]">Reset Password (Optional)</label>
                    <input
                      type="password"
                      value={editUserPassword}
                      onChange={(e) => setEditUserPassword(e.target.value)}
                      placeholder="Leave blank to keep same"
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-mono focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                  <button type="button" onClick={() => setShowEditUserModal(false)} className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-[#666666] hover:bg-gray-50 cursor-pointer">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white font-bold rounded-xl shadow-sm cursor-pointer">Save Member Updates</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
