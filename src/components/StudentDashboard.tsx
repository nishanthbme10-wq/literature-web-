import React, { useState } from 'react';
import {
  User,
  Award,
  Download,
  ShieldCheck,
} from 'lucide-react';

import { EventRegistrationPanel } from './EventRegistrationPanel';

import {
  User as UserType,
  Workshop,
  AttendanceRecord,
  FeedbackSubmission,
  Certificate,
  DEPARTMENTS,
} from '../types';

import { CertificateCanvas } from './CertificateCanvas';

interface StudentDashboardProps {
  user: UserType;
  workshops?: Workshop[];
  attendanceRecords?: AttendanceRecord[];
  feedbackSubmissions?: FeedbackSubmission[];
  certificates?: Certificate[];

  onUpdateProfile: (updated: Partial<UserType>) => void;

  onSubmitFeedback: (
    workshopId: string,
    rating: number,
    comments: string
  ) => Promise<void>;

  onRegisterWorkshop: (workshop: Workshop) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  workshops = [],
  attendanceRecords = [],
  feedbackSubmissions = [],
  certificates = [],
  onUpdateProfile,
  onSubmitFeedback,
}) => {
  const [activeTab, setActiveTab] = useState<
    'profile' | 'workshops' | 'registrations' | 'certificates' | 'feedback'
  >('registrations');

  const [selectedCert, setSelectedCert] =
    useState<Certificate | null>(null);

  /*
   * Stores the workshop selected from the
   * "Register for Event" button.
   */
  const [registrationWorkshopId, setRegistrationWorkshopId] =
    useState<string>('');

  // --------------------------------------------------
  // PROFILE EDIT STATE
  // --------------------------------------------------

  const [profileFullName, setProfileFullName] = useState(
    user.fullName || ''
  );

  const [profileUsername, setProfileUsername] = useState(
    user.username || ''
  );

  const [profileEmail, setProfileEmail] = useState(
    user.email || ''
  );

  const [profilePhone, setProfilePhone] = useState(
    user.phone || ''
  );

  const [profileDepartment, setProfileDepartment] = useState(
    user.department || DEPARTMENTS[6]
  );

  const [profileYear, setProfileYear] = useState(
    user.year || '1st Year'
  );

  const [profileSection, setProfileSection] = useState(
    user.section || 'A'
  );

  const [profileAvatar, setProfileAvatar] = useState(
    user.avatarUrl || ''
  );

  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  // --------------------------------------------------
  // PASSWORD CHANGE STATE
  // --------------------------------------------------

  const [currentPassword, setCurrentPassword] =
    useState('');

  const [newPassword, setNewPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] =
    useState(false);

  // --------------------------------------------------
  // FEEDBACK STATE
  // --------------------------------------------------

  const [selectedWsForFeedback, setSelectedWsForFeedback] =
    useState<string>('');

  const [feedbackRating, setFeedbackRating] =
    useState<number>(5);

  const [feedbackComment, setFeedbackComment] =
    useState<string>('');

  const [feedbackMsg, setFeedbackMsg] =
    useState<string>('');

  // --------------------------------------------------
  // STUDENT DATA
  // --------------------------------------------------

  const myAttendance = attendanceRecords.filter(
    (a) => a.studentId === user.id
  );

  const myCertificates = certificates.filter(
    (c) => c.studentId === user.id
  );

  const myFeedbacks = feedbackSubmissions.filter(
    (f) => f.studentId === user.id
  );

  // --------------------------------------------------
  // FEEDBACK ELIGIBILITY
  // --------------------------------------------------

  const presentWsIds = myAttendance
    .filter((a) => a.status === 'Present')
    .map((a) => a.workshopId);

  const eligibleForFeedback = workshops.filter(
    (ws) =>
      presentWsIds.includes(ws.id) &&
      !myFeedbacks.some(
        (f) => f.workshopId === ws.id
      )
  );

  // --------------------------------------------------
  // OPEN INTERNAL EVENT REGISTRATION
  // --------------------------------------------------

  const handleOpenRegistration = (
    workshopId: string
  ) => {
    setRegistrationWorkshopId(workshopId);
    setActiveTab('registrations');
  };

  // --------------------------------------------------
  // PROFILE SAVE
  // --------------------------------------------------

  const handleProfileSave = async () => {
    setProfileMsg('');
    setProfileError('');

    if (!profileFullName.trim()) {
      setProfileError(
        'Full Name cannot be empty.'
      );
      return;
    }

    if (!profileUsername.trim()) {
      setProfileError(
        'Username cannot be empty.'
      );
      return;
    }

    if (
      !profileEmail.trim() ||
      !profileEmail.includes('@')
    ) {
      setProfileError(
        'Please enter a valid email address.'
      );
      return;
    }

    try {
      const res = await fetch(
        `/api/users/${user.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName:
              profileFullName.trim(),

            username:
              profileUsername.trim(),

            email:
              profileEmail.trim(),

            phone:
              profilePhone.trim(),

            department:
              profileDepartment,

            year:
              profileYear,

            section:
              profileSection,

            avatarUrl:
              profileAvatar,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        setProfileError(
          data.error ||
            'Failed to update profile.'
        );
        return;
      }

      onUpdateProfile(data.user);

      setProfileMsg(
        'Student profile updated successfully!'
      );
    } catch (err) {
      setProfileError(
        'An error occurred while saving changes.'
      );
    }
  };

  // --------------------------------------------------
  // RESET PROFILE
  // --------------------------------------------------

  const handleResetProfileForm = () => {
    setProfileFullName(
      user.fullName || ''
    );

    setProfileUsername(
      user.username || ''
    );

    setProfileEmail(
      user.email || ''
    );

    setProfilePhone(
      user.phone || ''
    );

    setProfileDepartment(
      user.department ||
        DEPARTMENTS[6]
    );

    setProfileYear(
      user.year ||
        '1st Year'
    );

    setProfileSection(
      user.section ||
        'A'
    );

    setProfileAvatar(
      user.avatarUrl || ''
    );

    setProfileMsg('');
    setProfileError('');
  };

  // --------------------------------------------------
  // CHANGE PASSWORD
  // --------------------------------------------------

  const handleChangePasswordSubmit =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      setPasswordMsg('');
      setPasswordError('');

      if (!currentPassword) {
        setPasswordError(
          'Please enter your current password.'
        );
        return;
      }

      if (
        !newPassword ||
        newPassword.length < 6
      ) {
        setPasswordError(
          'New password must be at least 6 characters long.'
        );
        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        setPasswordError(
          'New password and confirm password do not match.'
        );
        return;
      }

      setPasswordLoading(true);

      try {
        const res = await fetch(
          `/api/users/${user.id}/change-password`,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              currentPassword,
              newPassword,
            }),
          }
        );

        const data = await res.json();

        if (
          !res.ok ||
          !data.success
        ) {
          setPasswordError(
            data.error ||
              'Password update failed.'
          );

          setPasswordLoading(false);
          return;
        }

        setPasswordMsg(
          'Your password has been changed successfully!'
        );

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } catch (err) {
        setPasswordError(
          'Failed to change password. Please check network connection.'
        );
      } finally {
        setPasswordLoading(false);
      }
    };

  // --------------------------------------------------
  // FEEDBACK SUBMIT
  // --------------------------------------------------

  const handleFeedbackSubmit =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      if (!selectedWsForFeedback) {
        return;
      }

      try {
        await onSubmitFeedback(
          selectedWsForFeedback,
          feedbackRating,
          feedbackComment
        );

        setFeedbackMsg(
          'Feedback submitted successfully! Your e-certificate has been unlocked.'
        );

        setSelectedWsForFeedback('');
        setFeedbackComment('');
      } catch (err: any) {
        setFeedbackMsg(
          err.message ||
            'Failed to submit feedback.'
        );
      }
    };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-white py-10 px-4 sm:px-6 text-[#171717]">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* =====================================================
            TOP STUDENT HEADER
        ====================================================== */}

        <div className="bg-[#FAFAFA] p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/35 shadow-[0_4px_25px_rgba(212,175,55,0.08)] flex flex-col md:flex-row items-center justify-between gap-6">

          <div className="flex items-center gap-5">

            <div className="relative">

              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-20 h-20 rounded-full object-cover border-2 border-[#D4AF37] shadow-md bg-white"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#A67C00] border-2 border-[#D4AF37] shadow-md flex items-center justify-center text-3xl font-black text-white font-serif-title uppercase">
                  {user.fullName
                    ? user.fullName
                        .trim()
                        .charAt(0)
                    : 'S'}
                </div>
              )}

              <span className="absolute bottom-0 right-0 bg-[#D4AF37] text-white p-1 rounded-full text-xs font-bold shadow-sm">
                ✓
              </span>

            </div>

            <div className="space-y-1 text-center sm:text-left">

              <div className="inline-block bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#A67C00] text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                Student Portal &bull;{' '}
                {user.department}
              </div>

              <h1 className="font-serif-title text-2xl font-bold text-[#171717]">
                {user.fullName}
              </h1>

              <div className="space-y-1.5">

                <p className="text-xs text-[#666666] font-medium">
                  Username:{' '}
                  <strong className="text-[#171717] font-mono">
                    {user.username}
                  </strong>{' '}
                  &bull; Year:{' '}
                  <strong className="text-[#171717]">
                    {user.year}
                  </strong>{' '}
                  (Sec {user.section})
                </p>

                {user.clubMemberId && (
                  <p className="inline-flex items-center gap-2 text-xs font-bold text-[#8F6D08]">
                    <span className="text-[#666666]">
                      Literature Club Member ID:
                    </span>

                    <span className="font-mono font-black tracking-wide text-[#A67C00] bg-[#D4AF37]/10 border border-[#D4AF37]/25 px-2.5 py-1 rounded-lg">
                      {user.clubMemberId}
                    </span>
                  </p>
                )}

              </div>

            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">

            <div className="bg-white px-4 py-2 rounded-2xl border border-[#D4AF37]/30 shadow-sm text-center">
              <div className="text-lg font-black font-serif-title text-[#A67C00]">
                {myCertificates.length}
              </div>

              <div className="text-[10px] text-[#666666] font-bold uppercase">
                Earned Certs
              </div>
            </div>

            <div className="bg-white px-4 py-2 rounded-2xl border border-[#D4AF37]/30 shadow-sm text-center">
              <div className="text-lg font-black font-serif-title text-[#171717]">
                {
                  myAttendance.filter(
                    (a) =>
                      a.status ===
                      'Present'
                  ).length
                }
              </div>

              <div className="text-[10px] text-[#666666] font-bold uppercase">
                Workshops Attended
              </div>
            </div>

          </div>
        </div>

        {/* =====================================================
            NAVIGATION TABS
        ====================================================== */}

        <div className="flex flex-wrap gap-2 border-b border-[#D4AF37]/20 pb-2">

          <button
            onClick={() =>
              setActiveTab(
                'registrations'
              )
            }
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab ===
              'registrations'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white shadow-md'
                : 'bg-white text-[#666666] hover:text-[#171717] hover:bg-[#D4AF37]/10 border border-gray-200'
            }`}
          >
            Event Registration
          </button>

          <button
            onClick={() =>
              setActiveTab(
                'workshops'
              )
            }
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab ===
              'workshops'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white shadow-md'
                : 'bg-white text-[#666666] hover:text-[#171717] hover:bg-[#D4AF37]/10 border border-gray-200'
            }`}
          >
            My Workshops & Registration
          </button>

          <button
            onClick={() =>
              setActiveTab(
                'certificates'
              )
            }
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab ===
              'certificates'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white shadow-md'
                : 'bg-white text-[#666666] hover:text-[#171717] hover:bg-[#D4AF37]/10 border border-gray-200'
            }`}
          >
            <Award className="w-4 h-4 text-[#D4AF37]" />

            <span>
              E-Certificates (
              {myCertificates.length})
            </span>
          </button>

          <button
            onClick={() =>
              setActiveTab(
                'feedback'
              )
            }
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab ===
              'feedback'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white shadow-md'
                : 'bg-white text-[#666666] hover:text-[#171717] hover:bg-[#D4AF37]/10 border border-gray-200'
            }`}
          >
            Submit Workshop Feedback
          </button>

          <button
            onClick={() =>
              setActiveTab(
                'profile'
              )
            }
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab ===
              'profile'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white shadow-md'
                : 'bg-white text-[#666666] hover:text-[#171717] hover:bg-[#D4AF37]/10 border border-gray-200'
            }`}
          >
            Edit Profile
          </button>

        </div>

        {/* =====================================================
            EVENT REGISTRATION
        ====================================================== */}

        {activeTab ===
          'registrations' && (
          <EventRegistrationPanel
            user={user}
            workshops={workshops}
            initialWorkshopId={
              registrationWorkshopId
            }
            onProfileUpdate={
              onUpdateProfile
            }
          />
        )}

        {/* =====================================================
            WORKSHOPS
        ====================================================== */}

        {activeTab ===
          'workshops' && (
          <div className="space-y-6">

            <div>
              <h3 className="font-serif-title font-bold text-xl text-[#171717]">
                Available & Registered Workshops
              </h3>

              <p className="text-xs text-[#666666] mt-1">
                Register directly through the
                Literature Club portal.
              </p>
            </div>

            {workshops.length === 0 ? (
              <div className="p-10 bg-[#FAFAFA] rounded-3xl border border-[#D4AF37]/20 text-center">

                <div className="text-3xl mb-2">
                  📚
                </div>

                <p className="text-sm font-bold text-[#171717]">
                  No workshops available
                </p>

                <p className="text-xs text-[#666666] mt-1">
                  New events will appear here
                  when they are published.
                </p>

              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {workshops.map(
                  (ws) => {
                    const att =
                      myAttendance.find(
                        (a) =>
                          a.workshopId ===
                          ws.id
                      );

                    const hasCert =
                      myCertificates.some(
                        (c) =>
                          c.workshopId ===
                          ws.id
                      );

                    const isClosed =
                      ws.status ===
                        'Closed' ||
                      ws.status ===
                        'Completed';

                    return (
                      <div
                        key={ws.id}
                        className="bg-white p-6 rounded-3xl border border-[#D4AF37]/30 shadow-[0_4px_20px_rgba(212,175,55,0.06)] space-y-4 flex flex-col justify-between"
                      >

                        <div>

                          <div className="flex items-center justify-between gap-2">

                            <span className="text-[10px] font-bold text-[#A67C00] uppercase bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-2 py-0.5 rounded-lg">
                              {ws.category}
                            </span>

                            {att ? (
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg ${
                                  att.status ===
                                  'Present'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                                }`}
                              >
                                Attendance:{' '}
                                {att.status}
                              </span>
                            ) : (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                                  isClosed
                                    ? 'bg-gray-100 text-gray-600 border-gray-200'
                                    : 'bg-[#D4AF37]/10 text-[#A67C00] border-[#D4AF37]/20'
                                }`}
                              >
                                {isClosed
                                  ? ws.status
                                  : 'Registration Open'}
                              </span>
                            )}

                          </div>

                          {/* Poster */}

                          {ws.posterUrl ? (
                            <img
                              src={
                                ws.posterUrl
                              }
                              alt={
                                ws.title
                              }
                              className="w-full h-44 object-cover rounded-2xl mt-4 border border-gray-100"
                            />
                          ) : null}

                          <h4 className="font-serif-title font-bold text-base text-[#171717] mt-4">
                            {ws.title}
                          </h4>

                          <p className="text-xs text-[#666666] mt-1 line-clamp-3 leading-relaxed">
                            {ws.description}
                          </p>

                          <div className="mt-3 text-xs space-y-1 text-[#666666]">

                            <div>
                              <strong className="text-[#171717]">
                                Date:
                              </strong>{' '}
                              {ws.dateTime}
                            </div>

                            <div>
                              <strong className="text-[#171717]">
                                Venue:
                              </strong>{' '}
                              {ws.venue}
                            </div>

                            <div>
                              <strong className="text-[#171717]">
                                Resource Person:
                              </strong>{' '}
                              {ws.resourcePerson}
                            </div>

                            <div>
                              <strong className="text-[#171717]">
                                Registration:
                              </strong>{' '}
                              {ws.registrationType ===
                              'team'
                                ? `Team (${ws.teamMinSize || 2}-${ws.teamMaxSize || 5} members)`
                                : 'Individual'}
                            </div>

                          </div>

                        </div>

                        {/* ACTION */}

                        <div className="pt-3 border-t border-gray-100">

                          {hasCert ? (
                            <button
                              onClick={() =>
                                setActiveTab(
                                  'certificates'
                                )
                              }
                              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <Award className="w-4 h-4" />

                              View Earned
                              Certificate
                            </button>
                          ) : isClosed ? (
                            <button
                              disabled
                              className="w-full py-2 bg-gray-200 text-gray-500 rounded-xl text-xs font-bold cursor-not-allowed"
                            >
                              Registration Closed
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleOpenRegistration(
                                  ws.id
                                )
                              }
                              className="w-full py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] hover:shadow-[0_4px_16px_rgba(212,175,55,0.3)] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                            >
                              Register for Event
                            </button>
                          )}

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>
        )}

        {/* =====================================================
            CERTIFICATES
        ====================================================== */}

        {activeTab ===
          'certificates' && (
          <div className="space-y-6">

            <div>
              <h3 className="font-serif-title font-bold text-xl text-[#171717]">
                Verified E-Certificates
              </h3>

              <p className="text-xs text-[#666666]">
                Only workshops where you were
                marked 'Present' and submitted
                feedback generate official
                certificates.
              </p>
            </div>

            {selectedCert ? (
              <div className="space-y-4">

                <button
                  onClick={() =>
                    setSelectedCert(
                      null
                    )
                  }
                  className="text-xs font-bold text-[#A67C00] hover:underline cursor-pointer"
                >
                  &larr; Back to Certificates
                  List
                </button>

                <CertificateCanvas
                  certificate={
                    selectedCert
                  }
                />

              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {myCertificates.map(
                  (cert) => (
                    <div
                      key={cert.id}
                      className="bg-white p-6 rounded-3xl border border-[#D4AF37]/35 shadow-[0_4px_20px_rgba(212,175,55,0.08)] space-y-4"
                    >

                      <div className="flex items-center justify-between">

                        <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />

                        <span className="text-xs font-mono font-bold text-[#A67C00]">
                          {
                            cert.certificateCode
                          }
                        </span>

                      </div>

                      <div>

                        <h4 className="font-serif-title font-bold text-base text-[#171717]">
                          {
                            cert.workshopTitle
                          }
                        </h4>

                        <p className="text-xs text-[#666666] mt-0.5">
                          Issued on:{' '}
                          {
                            cert.issueDate
                          }
                        </p>

                      </div>

                      <button
                        onClick={() =>
                          setSelectedCert(
                            cert
                          )
                        }
                        className="w-full py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] hover:shadow-[0_4px_16px_rgba(212,175,55,0.3)] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >

                        <Download className="w-4 h-4 text-white" />

                        <span>
                          View & Download
                          Certificate
                        </span>

                      </button>

                    </div>
                  )
                )}

                {myCertificates.length ===
                  0 && (
                  <div className="col-span-2 p-8 bg-[#FAFAFA] rounded-2xl border border-[#D4AF37]/20 text-center text-[#666666] space-y-2">

                    <Award className="w-10 h-10 text-[#D4AF37]/40 mx-auto" />

                    <p className="text-xs font-semibold text-[#171717]">
                      No certificates
                      issued yet.
                    </p>

                    <p className="text-[11px] text-[#666666]">
                      Ensure your attendance
                      is marked present by the
                      coordinator, then submit
                      the workshop feedback form
                      to unlock your
                      certificate.
                    </p>

                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* =====================================================
            FEEDBACK
        ====================================================== */}

        {activeTab ===
          'feedback' && (
          <div className="bg-white p-8 rounded-3xl border border-[#D4AF37]/35 shadow-[0_4px_25px_rgba(212,175,55,0.08)] space-y-6 max-w-2xl mx-auto">

            <div>

              <h3 className="font-serif-title font-bold text-xl text-[#171717]">
                Submit Workshop Feedback
              </h3>

              <p className="text-xs text-[#666666] mt-1">
                Submitting feedback unlocks your
                personalized e-certificate
                immediately.
              </p>

            </div>

            {feedbackMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
                {feedbackMsg}
              </div>
            )}

            {eligibleForFeedback.length >
            0 ? (
              <form
                onSubmit={
                  handleFeedbackSubmit
                }
                className="space-y-4"
              >

                <div>

                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    Select Workshop *
                  </label>

                  <select
                    required
                    value={
                      selectedWsForFeedback
                    }
                    onChange={(e) =>
                      setSelectedWsForFeedback(
                        e.target.value
                      )
                    }
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  >

                    <option value="">
                      -- Choose Workshop --
                    </option>

                    {eligibleForFeedback.map(
                      (ws) => (
                        <option
                          key={ws.id}
                          value={ws.id}
                        >
                          {ws.title}
                        </option>
                      )
                    )}

                  </select>

                </div>

                <div>

                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    Rating (1 to 5 Stars)
                  </label>

                  <select
                    value={
                      feedbackRating
                    }
                    onChange={(e) =>
                      setFeedbackRating(
                        Number(
                          e.target.value
                        )
                      )
                    }
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  >

                    <option value={5}>
                      ⭐⭐⭐⭐⭐ 5 -
                      Outstanding
                    </option>

                    <option value={4}>
                      ⭐⭐⭐⭐ 4 - Very
                      Good
                    </option>

                    <option value={3}>
                      ⭐⭐⭐ 3 -
                      Satisfactory
                    </option>

                  </select>

                </div>

                <div>

                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    Your Feedback & Key
                    Takeaways *
                  </label>

                  <textarea
                    rows={4}
                    required
                    value={
                      feedbackComment
                    }
                    onChange={(e) =>
                      setFeedbackComment(
                        e.target.value
                      )
                    }
                    placeholder="Describe what you learned and how it helped your academic or creative writing..."
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />

                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#D4AF37] via-[#C9A227] to-[#A67C00] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer hover:shadow-[0_4px_16px_rgba(212,175,55,0.35)] transition-all"
                >
                  Submit Feedback & Generate
                  Certificate
                </button>

              </form>
            ) : (
              <div className="p-6 bg-[#FAFAFA] rounded-2xl border border-[#D4AF37]/20 text-center text-xs text-[#666666]">
                No pending workshops requiring
                feedback right now. You have either
                submitted feedback for all attended
                workshops or have no new attendance
                records.
              </div>
            )}

          </div>
        )}

        {/* =====================================================
            PROFILE
        ====================================================== */}

        {activeTab ===
          'profile' && (
          <div className="space-y-8 max-w-2xl mx-auto">

            {/* STUDENT PROFILE */}

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/35 shadow-[0_4px_25px_rgba(212,175,55,0.08)] space-y-6">

              <div className="border-b border-[#D4AF37]/20 pb-3">

                <h3 className="font-serif-title font-bold text-xl text-[#171717]">
                  Edit Student Profile
                </h3>

                <p className="text-xs text-[#666666] mt-1">
                  Update your institutional
                  registration details, contact
                  number, and profile avatar.
                </p>

              </div>

              {profileError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
                  {profileError}
                </div>
              )}

              {profileMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold">
                  {profileMsg}
                </div>
              )}

              <div className="space-y-4 text-xs">

                {/* PHOTO */}

                <div>

                  <label className="block font-bold text-[#171717] mb-1">
                    Profile Picture Upload &
                    Preview
                  </label>

                  <div className="p-4 bg-[#FAFAFA] border border-[#D4AF37]/20 rounded-2xl flex items-center gap-4">

                    {profileAvatar ? (
                      <img
                        src={
                          profileAvatar
                        }
                        alt="Profile Avatar"
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#D4AF37] shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#A67C00] border-2 border-[#D4AF37] flex items-center justify-center text-2xl font-black text-white font-serif-title shrink-0">
                        {profileFullName
                          ? profileFullName
                              .trim()
                              .charAt(0)
                              .toUpperCase()
                          : 'S'}
                      </div>
                    )}

                    <div className="space-y-1.5 flex-1">

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file =
                            e.target.files?.[0];

                          if (!file) return;

                          if (
                            file.size >
                            20 *
                              1024 *
                              1024
                          ) {
                            alert(
                              'File size exceeds 20MB limit.'
                            );
                            return;
                          }

                          const reader =
                            new FileReader();

                          reader.onload = (
                            ev
                          ) => {
                            if (
                              ev.target
                                ?.result
                            ) {
                              setProfileAvatar(
                                ev.target
                                  .result as string
                              );
                            }
                          };

                          reader.readAsDataURL(
                            file
                          );
                        }}
                        className="text-xs text-[#666666] file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#D4AF37]/15 file:text-[#A67C00] cursor-pointer"
                      />

                      {profileAvatar && (
                        <button
                          type="button"
                          onClick={() =>
                            setProfileAvatar(
                              ''
                            )
                          }
                          className="text-[11px] text-rose-600 font-bold hover:underline block cursor-pointer"
                        >
                          Remove Uploaded Photo
                          (Use Initial Letter
                          Avatar)
                        </button>
                      )}

                    </div>
                  </div>
                </div>

                {/* NAME + USERNAME */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>

                    <label className="block font-bold text-[#171717] mb-1">
                      Full Name *
                    </label>

                    <input
                      type="text"
                      required
                      value={
                        profileFullName
                      }
                      onChange={(e) =>
                        setProfileFullName(
                          e.target.value
                        )
                      }
                      className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37] bg-white font-medium"
                    />

                  </div>

                  <div>

                    <label className="block font-bold text-[#171717] mb-1">
                      Username (ID) *
                    </label>

                    <input
                      type="text"
                      required
                      value={
                        profileUsername
                      }
                      onChange={(e) =>
                        setProfileUsername(
                          e.target.value
                        )
                      }
                      className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37] bg-white font-mono"
                    />

                  </div>

                </div>

                {/* PERMANENT LITERATURE CLUB MEMBER ID */}

                <div>

                  <label className="block font-bold text-[#171717] mb-1">
                    Literature Club Member ID
                  </label>

                  <div className="w-full p-2.5 border border-[#D4AF37]/30 rounded-xl bg-[#FBF8EF] font-mono font-black text-[#A67C00] tracking-wide">
                    {user.clubMemberId ||
                      'Member ID will be assigned automatically'}
                  </div>

                  <p className="text-[10px] text-[#777777] mt-1">
                    This is your permanent Literature Club ID and cannot be changed.
                  </p>

                </div>

                {/* EMAIL + PHONE */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>

                    <label className="block font-bold text-[#171717] mb-1">
                      Email ID *
                    </label>

                    <input
                      type="email"
                      required
                      value={
                        profileEmail
                      }
                      onChange={(e) =>
                        setProfileEmail(
                          e.target.value
                        )
                      }
                      className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37] bg-white"
                    />

                  </div>

                  <div>

                    <label className="block font-bold text-[#171717] mb-1">
                      Phone Number *
                    </label>

                    <input
                      type="tel"
                      value={
                        profilePhone
                      }
                      onChange={(e) =>
                        setProfilePhone(
                          e.target.value
                        )
                      }
                      placeholder="+91 98765 43210"
                      className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37] bg-white"
                    />

                  </div>

                </div>

                {/* DEPARTMENT */}

                <div>

                  <label className="block font-bold text-[#171717] mb-1">
                    Department *
                  </label>

                  <select
                    value={
                      profileDepartment
                    }
                    onChange={(e) =>
                      setProfileDepartment(
                        e.target.value
                      )
                    }
                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37] bg-white"
                  >

                    {DEPARTMENTS.map(
                      (dept) => (
                        <option
                          key={dept}
                          value={dept}
                        >
                          {dept}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* YEAR + SECTION */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>

                    <label className="block font-bold text-[#171717] mb-1">
                      Year Level *
                    </label>

                    <select
                      value={
                        profileYear
                      }
                      onChange={(e) =>
                        setProfileYear(
                          e.target.value
                        )
                      }
                      className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37] bg-white"
                    >

                      <option value="1st Year">
                        1st Year
                      </option>

                      <option value="2nd Year">
                        2nd Year
                      </option>

                      <option value="3rd Year">
                        3rd Year
                      </option>

                      <option value="4th Year">
                        4th Year
                      </option>

                      <option value="Faculty/Admin">
                        Faculty/Admin
                      </option>

                    </select>

                  </div>

                  <div>

                    <label className="block font-bold text-[#171717] mb-1">
                      Section *
                    </label>

                    <select
                      value={
                        profileSection
                      }
                      onChange={(e) =>
                        setProfileSection(
                          e.target.value
                        )
                      }
                      className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37] bg-white"
                    >

                      <option value="A">
                        Section A
                      </option>

                      <option value="B">
                        Section B
                      </option>

                      <option value="C">
                        Section C
                      </option>

                      <option value="D">
                        Section D
                      </option>

                      <option value="N/A">
                        N/A
                      </option>

                    </select>

                  </div>

                </div>

                {/* ACTION BUTTONS */}

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">

                  <button
                    type="button"
                    onClick={
                      handleResetProfileForm
                    }
                    className="px-4 py-2.5 border border-gray-200 rounded-xl font-bold text-[#666666] hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleProfileSave
                    }
                    className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-[0_4px_16px_rgba(212,175,55,0.3)] transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>

                </div>

              </div>
            </div>

            {/* =================================================
                PASSWORD
            ================================================== */}

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/35 shadow-[0_4px_25px_rgba(212,175,55,0.08)] space-y-4">

              <div className="border-b border-[#D4AF37]/20 pb-3">

                <h4 className="font-serif-title font-bold text-lg text-[#171717]">
                  Security & Password Management
                </h4>

                <p className="text-xs text-[#666666] mt-0.5">
                  Change your login password
                  securely. Your old password will
                  be verified.
                </p>

              </div>

              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
                  {passwordError}
                </div>
              )}

              {passwordMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold">
                  {passwordMsg}
                </div>
              )}

              <form
                onSubmit={
                  handleChangePasswordSubmit
                }
                className="space-y-4 text-xs"
              >

                <div>

                  <label className="block font-bold text-[#171717] mb-1">
                    Current Password *
                  </label>

                  <input
                    type="password"
                    required
                    value={
                      currentPassword
                    }
                    onChange={(e) =>
                      setCurrentPassword(
                        e.target.value
                      )
                    }
                    placeholder="Enter current password"
                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37] font-mono bg-white"
                  />

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>

                    <label className="block font-bold text-[#171717] mb-1">
                      New Password *
                    </label>

                    <input
                      type="password"
                      required
                      value={
                        newPassword
                      }
                      onChange={(e) =>
                        setNewPassword(
                          e.target.value
                        )
                      }
                      placeholder="Minimum 6 characters"
                      className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37] font-mono bg-white"
                    />

                  </div>

                  <div>

                    <label className="block font-bold text-[#171717] mb-1">
                      Confirm New Password *
                    </label>

                    <input
                      type="password"
                      required
                      value={
                        confirmPassword
                      }
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      placeholder="Re-enter new password"
                      className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37] font-mono bg-white"
                    />

                  </div>

                </div>

                <div className="pt-2 flex justify-end">

                  <button
                    type="submit"
                    disabled={
                      passwordLoading
                    }
                    className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#A67C00] text-white font-bold rounded-xl shadow-md hover:shadow-[0_4px_16px_rgba(212,175,55,0.3)] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {passwordLoading
                      ? 'Updating Password...'
                      : 'Update Password'}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};