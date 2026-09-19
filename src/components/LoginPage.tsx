import { AlertCircle, ArrowRight, CheckCircle, FileText, KeyRound, Lock, ShieldCheck, Sparkles, User, UserPlus } from 'lucide-react';
import React, { useState } from 'react';
import { emailPasswordSignIn, registerStudentAccount, requestCoordinatorAccess, requestPasswordReset } from '../lib/firebase';
import { DEPARTMENTS, User as UserType } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: UserType) => void;
  headerConfig: {
    siteName: string;
    siteSubtitle: string;
    leftLogoUrl: string;
    rightLogoUrl: string;
    heroSlogan: string;
  };
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  headerConfig
}) => {
  // Active Tab: 'student' | 'coordinator' | 'admin'
  const [activeRoleTab, setActiveRoleTab] = useState<'student' | 'coordinator' | 'admin'>('student');
  
  // Secondary Views: 'login' | 'student_register' | 'coordinator_request' | 'forgot_password'
  const [viewMode, setViewMode] = useState<'login' | 'student_register' | 'coordinator_request' | 'forgot_password'>('login');

  // Login inputs
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<'student' | 'coordinator'>('student');

  // Student Registration fields
  const [studentFullName, setStudentFullName] = useState('');
  const [studentUsername, setStudentUsername] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentDept, setStudentDept] = useState<string>(DEPARTMENTS[6]); // CSE default
  const [studentYear, setStudentYear] = useState<'1st' | '2nd' | '3rd' | '4th'>('3rd');
  const [studentSection, setStudentSection] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentConfirmPassword, setStudentConfirmPassword] = useState('');
  const [studentAvatarUrl, setStudentAvatarUrl] = useState('');

  // Coordinator Request fields
  const [coordFullName, setCoordFullName] = useState('');
  const [coordDept, setCoordDept] = useState<string>(DEPARTMENTS[0]); // AI&DS
  const [coordYear, setCoordYear] = useState<string>('Faculty/Admin');
  const [coordEmail, setCoordEmail] = useState('');
  const [coordPhone, setCoordPhone] = useState('');
  const [coordUsername, setCoordUsername] = useState('');
  const [coordPassword, setCoordPassword] = useState('');
  const [coordReason, setCoordReason] = useState('');

  // Forgot Password fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Status messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Clear messages when tab or view mode changes
  const switchTab = (role: 'student' | 'coordinator' | 'admin') => {
    setActiveRoleTab(role);
    setViewMode('login');
    setErrorMsg('');
    setSuccessMsg('');
    setLoginIdentifier('');
    setLoginPassword('');
  };

  // Firebase Authentication: passwords are never stored in Firestore.
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (activeRoleTab === 'admin' && !loginIdentifier.trim()) {
        throw new Error('Enter your admin email address.');
      }
      const firebaseUser = await emailPasswordSignIn(loginIdentifier, loginPassword);
      setSuccessMsg(`Login successful! Loading your ${activeRoleTab} dashboard...`);
      setTimeout(() => {
        // App resolves the authoritative Firestore role from the Firebase UID.
        onLoginSuccess({
          id: firebaseUser.uid, fullName: firebaseUser.displayName || '', username: firebaseUser.email?.split('@')[0] || '',
          email: firebaseUser.email || '', phone: '', department: '', year: 'Faculty/Admin', section: 'N/A',
          role: activeRoleTab, avatarUrl: firebaseUser.photoURL || undefined, createdAt: new Date().toISOString()
        });
      }, 300);
    } catch (err: any) {
      setErrorMsg(err?.code === 'auth/invalid-credential' ? 'Invalid email or password.' : (err.message || 'Login failed.'));
    } finally {
      setLoading(false);
    }
  };

  const handleStudentRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (studentPassword !== studentConfirmPassword) return setErrorMsg('Passwords do not match.');
    if (studentPhone.length !== 10 || !/^\d{10}$/.test(studentPhone)) return setErrorMsg('Please enter a valid 10-digit phone number.');
    setLoading(true);
    try {
      await registerStudentAccount({
        fullName: studentFullName,       
         username: studentUsername,
        email: studentEmail,
        password: studentPassword,
        phone: studentPhone,
        department: studentDept,
        year: studentYear,
        section: studentSection
      });
      setSuccessMsg('Student account created successfully. You are now signed in.');
      setViewMode('login');
    } catch (err: any) {
      const message = err?.code === 'auth/email-already-in-use' ? 'An account already exists with this email.' : err.message;
      setErrorMsg(message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const handleCoordinatorRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(''); setSuccessMsg('');
    if (!/^\d{10}$/.test(coordPhone)) return setErrorMsg('Please enter a valid 10-digit phone number.');
    setLoading(true);
    try {
      await requestCoordinatorAccess({
        fullName: coordFullName, department: coordDept, year: coordYear, email: coordEmail,
        phone: coordPhone, username: coordUsername, reason: coordReason
      });
      setSuccessMsg('Coordinator request submitted. An Admin must approve the request before coordinator access is granted.');
      setViewMode('login');
    } catch (err: any) { setErrorMsg(err.message || 'Submission failed.'); }
    finally { setLoading(false); }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(''); setSuccessMsg(''); setLoading(true);
    try {
      await requestPasswordReset(forgotEmail);
      setSuccessMsg('If an account exists for that email, Firebase has sent a password reset link.');
      setViewMode('login');
    } catch (err: any) { setErrorMsg(err.message || 'Password reset failed.'); }
    finally { setLoading(false); }
  };

  // Demo autofill credentials helper
  const fillDemo = (_role: 'student' | 'coordinator' | 'admin') => {
    setLoginIdentifier('');
    setLoginPassword('');
    setErrorMsg('Demo credentials are disabled. Use your Firebase account.');
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] py-10 px-4 flex flex-col items-center justify-center font-sans relative z-10">
      
      {/* College Emblem Header Banner */}
      <div className="w-full max-w-4xl text-center mb-8 space-y-3">
        <div className="flex items-center justify-center gap-4">
          <img
            src={headerConfig.leftLogoUrl}
            alt="VSBEC College Logo"
            className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-full border-2 border-[#D4AF37] bg-white p-1 shadow-md"
          />
          <div className="text-left">
            <h1 className="font-serif-title font-black text-2xl md:text-4xl text-[#171717] tracking-tight">
              VSB Engineering College
            </h1>
            <p className="text-xs md:text-base font-bold text-[#A67C00] tracking-wide uppercase">
              {headerConfig.siteName} • Official Portal
            </p>
          </div>
          <img
            src={headerConfig.rightLogoUrl}
            alt="Literature Club Crest"
            className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-full border-2 border-[#D4AF37] bg-white p-1 shadow-md"
          />
        </div>
        <p className="text-xs md:text-sm text-[#666666] max-w-xl mx-auto italic font-medium">
          "{headerConfig.heroSlogan}"
        </p>
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-2xl bg-white border border-[#D4AF37]/35 rounded-3xl shadow-[0_10px_35px_rgba(212,175,55,0.12)] overflow-hidden">
        
        {/* VIEW 1: ROLE LOGIN TAB SELECTOR */}
        {viewMode === 'login' && (
          <>
            <div className="bg-[#FAFAFA] p-2 flex border-b border-[#D4AF37]/30 gap-1.5">
              <button
                type="button"
                onClick={() => switchTab('student')}
                className={`flex-1 py-3 px-2 rounded-2xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeRoleTab === 'student'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white shadow-md'
                    : 'text-[#666666] hover:text-[#171717] hover:bg-[#D4AF37]/10'
                }`}
              >
                <span>🎓</span>
                <span>Student Login</span>
              </button>

              <button
                type="button"
                onClick={() => switchTab('coordinator')}
                className={`flex-1 py-3 px-2 rounded-2xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeRoleTab === 'coordinator'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white shadow-md'
                    : 'text-[#666666] hover:text-[#171717] hover:bg-[#D4AF37]/10'
                }`}
              >
                <span>👔</span>
                <span>Coordinator Login</span>
              </button>

              <button
                type="button"
                onClick={() => switchTab('admin')}
                className={`flex-1 py-3 px-2 rounded-2xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeRoleTab === 'admin'
                    ? 'bg-gradient-to-r from-[#C9A227] to-[#A67C00] text-white shadow-md border border-[#F5E7A8]/50'
                    : 'text-[#666666] hover:text-[#171717] hover:bg-[#D4AF37]/10'
                }`}
              >
                <span>🛡️</span>
                <span>Admin Login</span>
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              
              {/* Header Description per Tab */}
              <div className="flex items-center gap-3 border-b pb-4 border-[#D4AF37]/20">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                  activeRoleTab === 'admin'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#A67C00] border-[#F5E7A8] text-white shadow-sm'
                    : activeRoleTab === 'coordinator'
                    ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#A67C00]'
                    : 'bg-[#D4AF37]/10 border-[#D4AF37]/40 text-[#A67C00]'
                }`}>
                  {activeRoleTab === 'admin' ? (
                    <ShieldCheck className="w-6 h-6" />
                  ) : activeRoleTab === 'coordinator' ? (
                    <KeyRound className="w-6 h-6" />
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h2 className="font-serif-title font-bold text-xl text-[#171717]">
                    {activeRoleTab === 'admin'
                      ? 'Administrator Control Portal'
                      : activeRoleTab === 'coordinator'
                      ? 'Faculty & Student Coordinator Portal'
                      : 'Student Member Portal'}
                  </h2>
                  <p className="text-xs text-[#666666] font-medium">
                    {activeRoleTab === 'admin'
                      ? 'Access full club analytics, manage users, approve coordinators, and issue certificates.'
                      : activeRoleTab === 'coordinator'
                      ? 'Manage workshop attendance, mark participant status, and update event records.'
                      : 'View workshop history, register for events, and download verified e-certificates.'}
                  </p>
                </div>
              </div>

              {/* Status Notifications */}
              {errorMsg && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-800 text-xs md:text-sm rounded-r-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Access Restriction:</span>
                    <span>{errorMsg}</span>
                  </div>
                </div>
              )}

              {successMsg && (
                <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-xs md:text-sm rounded-r-xl flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-bold">{successMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#666666] mb-1">
                    {activeRoleTab === 'admin' ? 'Admin Username or Email' : 'Username or Registered Email'}
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-[#A67C00]/70 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder={
                        activeRoleTab === 'admin'
                          ? 'admin@vsbliterature'
                          : activeRoleTab === 'coordinator'
                          ? 'ananya.lit@vsbec.ac.in'
                          : 'priya.cse2026@vsbec.ac.in'
                      }
                      className="w-full pl-10 pr-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl text-sm text-[#171717] focus:outline-none focus:border-[#D4AF37] focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#666666]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => { setViewMode('forgot_password'); setErrorMsg(''); setSuccessMsg(''); }}
                      className="text-xs text-[#A67C00] hover:underline font-bold"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-[#A67C00]/70 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl text-sm text-[#171717] focus:outline-none focus:border-[#D4AF37] focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                </div>

                {activeRoleTab === 'admin' && (
                  <div className="p-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl text-xs text-[#171717] flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#A67C00] shrink-0 mt-0.5" />
                    <span>
                      <strong>Admin Access Notice:</strong> Admin accounts are provisioned by an authorized administrator in Firebase. Use your assigned Firebase email and password.
                    </span>
                  </div>
                )}

                <div className="pt-2 space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 font-bold text-white rounded-xl shadow-[0_4px_16px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_22px_rgba(212,175,55,0.45)] bg-gradient-to-r from-[#D4AF37] via-[#C9A227] to-[#A67C00] transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#F5E7A8]/40"
                  >
                    <span>{loading ? 'Authenticating...' : `Log In to ${activeRoleTab.toUpperCase()} Portal`}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => fillDemo(activeRoleTab)}
                    className="w-full py-2 bg-[#FFFFFF] hover:bg-[#D4AF37]/10 text-[#A67C00] font-bold text-xs rounded-xl border border-[#D4AF37]/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>Fill Demo {activeRoleTab.charAt(0).toUpperCase() + activeRoleTab.slice(1)} Credentials</span>
                  </button>
                </div>
              </form>

              {/* Secondary Navigation Options */}
              <div className="pt-4 border-t border-[#D4AF37]/20 flex flex-wrap items-center justify-between text-xs font-bold text-[#666666] gap-2">
                {activeRoleTab === 'student' && (
                  <div className="flex items-center justify-between w-full">
                    <span>Don't have a Student Account?</span>
                    <button
                      type="button"
                      onClick={() => { setViewMode('student_register'); setErrorMsg(''); setSuccessMsg(''); }}
                      className="text-[#A67C00] hover:text-[#171717] underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Register as New Student</span>
                    </button>
                  </div>
                )}

                {activeRoleTab === 'coordinator' && (
                  <div className="flex items-center justify-between w-full">
                    <span>Not an approved Coordinator yet?</span>
                    <button
                      type="button"
                      onClick={() => { setViewMode('coordinator_request'); setErrorMsg(''); setSuccessMsg(''); }}
                      className="text-[#A67C00] hover:text-[#171717] underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Submit Coordinator Request</span>
                    </button>
                  </div>
                )}

                {activeRoleTab === 'admin' && (
                  <p className="text-[#666666] italic text-center w-full">
                    Only system administrators can provision admin credentials. Public registration disabled.
                  </p>
                )}
              </div>

            </div>
          </>
        )}

        {/* VIEW 2: STUDENT REGISTRATION FORM */}
        {viewMode === 'student_register' && (
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-[#D4AF37]/20">
              <div>
                <h2 className="font-serif-title font-bold text-2xl text-[#171717]">Student Registration</h2>
                <p className="text-xs text-[#666666]">Create your official VSB Literature Club student member profile.</p>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('login')}
                className="px-3 py-1.5 bg-[#FAFAFA] hover:bg-[#D4AF37]/10 text-[#A67C00] rounded-xl text-xs font-bold border border-[#D4AF37]/40 cursor-pointer"
              >
                ← Back to Login
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-lg font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleStudentRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#666666] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={studentFullName}
                    onChange={(e) => setStudentFullName(e.target.value)}
                    placeholder="e.g. Priya Dharshini M."
                    className="w-full p-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#D4AF37] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#666666] mb-1">Username (Unique) *</label>
                  <input
                    type="text"
                    required
                    value={studentUsername}
                    onChange={(e) => setStudentUsername(e.target.value)}
                    placeholder="e.g. priya_cse2026"
                    className="w-full p-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#D4AF37] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#666666] mb-1">Email ID (Unique) *</label>
                  <input
                    type="email"
                    required
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="e.g. priya.cse2026@vsbec.ac.in"
                    className="w-full p-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#D4AF37] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#666666] mb-1">Phone Number (10 digits) *</label>
                  <input
                    type="tel"
                    required
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    placeholder="+91 91234 56789"
                    className="w-full p-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#D4AF37] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#666666] mb-1">Department *</label>
                  <select
                    value={studentDept}
                    onChange={(e) => setStudentDept(e.target.value)}
                    className="w-full p-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-xs text-[#171717] font-bold focus:outline-none focus:border-[#D4AF37]"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#666666] mb-1">Year of Study *</label>
                  <select
                    value={studentYear}
                    onChange={(e) => setStudentYear(e.target.value as any)}
                    className="w-full p-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-xs text-[#171717] font-bold focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="4th">4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#666666] mb-1">Section *</label>
                  <select
                    value={studentSection}
                    onChange={(e) => setStudentSection(e.target.value as any)}
                    className="w-full p-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-xs text-[#171717] font-bold focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#666666] mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#D4AF37] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#666666] mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    value={studentConfirmPassword}
                    onChange={(e) => setStudentConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#D4AF37] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#666666] mb-1">Profile Photo (Optional Image URL)</label>
                <input
                  type="url"
                  value={studentAvatarUrl}
                  onChange={(e) => setStudentAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#D4AF37] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#D4AF37] via-[#C9A227] to-[#A67C00] text-white font-bold rounded-xl shadow-[0_4px_16px_rgba(212,175,55,0.3)] transition-all cursor-pointer text-sm"
              >
                {loading ? 'Creating Student Account...' : 'Complete Student Registration'}
              </button>
            </form>
          </div>
        )}

        {/* VIEW 3: COORDINATOR REGISTRATION REQUEST FORM */}
        {viewMode === 'coordinator_request' && (
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-[#D4AF37]/20">
              <div>
                <h2 className="font-serif-title font-bold text-2xl text-[#171717]">Coordinator Access Request</h2>
                <p className="text-xs text-[#666666]">Submit an official application to become a Literature Club Coordinator. Requires Admin approval.</p>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('login')}
                className="px-3 py-1.5 bg-[#FAFAFA] hover:bg-[#D4AF37]/10 text-[#A67C00] rounded-xl text-xs font-bold border border-[#D4AF37]/40 cursor-pointer"
              >
                ← Back to Login
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-lg font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCoordinatorRequestSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#666666] mb-1">Applicant Name *</label>
                  <input
                    type="text"
                    required
                    value={coordFullName}
                    onChange={(e) => setCoordFullName(e.target.value)}
                    placeholder="e.g. Prof. Ananya V. Raman"
                    className="w-full p-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#D4AF37] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#666666] mb-1">Desired Username *</label>
                  <input
                    type="text"
                    required
                    value={coordUsername}
                    onChange={(e) => setCoordUsername(e.target.value)}
                    placeholder="e.g. coord_ananya"
                    className="w-full p-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#D4AF37] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#666666] mb-1">Official Email ID *</label>
                  <input
                    type="email"
                    required
                    value={coordEmail}
                    onChange={(e) => setCoordEmail(e.target.value)}
                    placeholder="e.g. ananya.lit@vsbec.ac.in"
                    className="w-full p-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#D4AF37] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#666666] mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={coordPhone}
                    onChange={(e) => setCoordPhone(e.target.value)}
                    placeholder="+91 98123 45678"
                    className="w-full p-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#D4AF37] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#666666] mb-1">Department *</label>
                  <select
                    value={coordDept}
                    onChange={(e) => setCoordDept(e.target.value)}
                    className="w-full p-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-xs text-[#171717] font-bold focus:outline-none focus:border-[#D4AF37]"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#666666] mb-1">Year / Position *</label>
                  <select
                    value={coordYear}
                    onChange={(e) => setCoordYear(e.target.value)}
                    className="w-full p-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-xs text-[#171717] font-bold focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Faculty/Admin">Faculty / Staff</option>
                    <option value="4th">4th Year Student</option>
                    <option value="3rd">3rd Year Student</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#666666] mb-1">Requested Password *</label>
                  <input
                    type="password"
                    required
                    value={coordPassword}
                    onChange={(e) => setCoordPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#D4AF37] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#666666] mb-1">Reason for Becoming Coordinator *</label>
                <textarea
                  required
                  rows={3}
                  value={coordReason}
                  onChange={(e) => setCoordReason(e.target.value)}
                  placeholder="Describe your motivation, past event management experience, or departmental responsibilities..."
                  className="w-full p-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#D4AF37] focus:bg-white"
                />
              </div>

              <div className="p-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl text-xs text-[#171717] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#A67C00] shrink-0" />
                <span>
                  <strong>Approval Workflow:</strong> Upon submission, your application status will be set to <em>"Pending Admin Approval"</em>. You will receive access once the Admin approves your request.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#D4AF37] via-[#C9A227] to-[#A67C00] text-white font-bold rounded-xl shadow-[0_4px_16px_rgba(212,175,55,0.3)] transition-all cursor-pointer text-sm"
              >
                {loading ? 'Submitting Application...' : 'Submit Coordinator Request'}
              </button>
            </form>
          </div>
        )}

        {/* VIEW 4: FORGOT PASSWORD RESET */}
        {viewMode === 'forgot_password' && (
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-[#D4AF37]/20">
              <div>
                <h2 className="font-serif-title font-bold text-2xl text-[#171717]">Reset Account Password</h2>
                <p className="text-xs text-[#666666]">Enter your registered email ID to immediately update your account password.</p>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('login')}
                className="px-3 py-1.5 bg-[#FAFAFA] hover:bg-[#D4AF37]/10 text-[#A67C00] rounded-xl text-xs font-bold border border-[#D4AF37]/40 cursor-pointer"
              >
                ← Back to Login
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-lg font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#666666] mb-1">Registered Email Address *</label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="e.g. priya.cse2026@vsbec.ac.in"
                  className="w-full p-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#D4AF37] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#666666] mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#D4AF37] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#666666] mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#D4AF37] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#D4AF37] via-[#C9A227] to-[#A67C00] text-white font-bold rounded-xl shadow-[0_4px_16px_rgba(212,175,55,0.3)] transition-all cursor-pointer text-sm"
              >
                {loading ? 'Updating Password...' : 'Save New Password & Return to Login'}
              </button>
            </form>
          </div>
        )}

      </div>

      {/* Footer copyright note */}
      <div className="mt-8 text-center text-xs text-[#666666] font-medium">
        <p>© 2026 VSB Engineering College Literature Club. All Rights Reserved.</p>
        <p className="text-[#A67C00] font-bold mt-0.5">Secure Role-Based Academic Authentication System</p>
      </div>

    </div>
  );
};
