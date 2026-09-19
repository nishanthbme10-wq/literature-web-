import {
  AlertCircle,
  CheckCircle,
  KeyRound,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { DEPARTMENTS, User as UserType } from '../types';

import {
  emailPasswordSignIn,
  getCurrentUserProfile,
  registerStudentAccount,
  requestPasswordReset,
} from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onLoginSuccess: (user: UserType) => void;
}

type Gateway = 'student' | 'coordinator';

type StudentYear = '1st' | '2nd' | '3rd' | '4th';

type StudentSection = 'A' | 'B' | 'C' | 'D';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onLoginSuccess,
}) => {
  /* =========================================================
     MODE
  ========================================================= */

  const [mode, setMode] = useState<
    'login' | 'register' | 'forgot_password'
  >(initialMode);

  const [gateway, setGateway] =
    useState<Gateway>('student');

  /* =========================================================
     LOGIN
  ========================================================= */

  const [loginIdentifier, setLoginIdentifier] =
    useState('');

  const [loginPassword, setLoginPassword] =
    useState('');

  /* =========================================================
     STUDENT REGISTRATION
  ========================================================= */

  const [fullName, setFullName] =
    useState('');

  const [username, setUsername] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [phone, setPhone] =
    useState('');

  const [department, setDepartment] =
    useState<string>(
      DEPARTMENTS[6] ??
        DEPARTMENTS[0] ??
        ''
    );

  const [year, setYear] =
    useState<StudentYear>('2nd');

  const [section, setSection] =
    useState<StudentSection>('A');

  const [password, setPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [avatarUrl, setAvatarUrl] =
    useState('');

  /* =========================================================
     FORGOT PASSWORD
  ========================================================= */

  const [forgotEmail, setForgotEmail] =
    useState('');

  /* =========================================================
     UI STATE
  ========================================================= */

  const [errorMsg, setErrorMsg] =
    useState('');

  const [successMsg, setSuccessMsg] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  /* =========================================================
     INITIAL MODE
  ========================================================= */

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      clearMessages();
    }
  }, [isOpen, initialMode]);

  if (!isOpen) {
    return null;
  }

  /* =========================================================
     HELPERS
  ========================================================= */

  function clearMessages() {
    setErrorMsg('');
    setSuccessMsg('');
  }

  const switchGateway = (
    newGateway: Gateway
  ) => {
    clearMessages();

    setGateway(newGateway);
    setMode('login');

    setLoginIdentifier('');
    setLoginPassword('');
  };

  const switchMode = (
    newMode:
      | 'login'
      | 'register'
      | 'forgot_password'
  ) => {
    clearMessages();
    setMode(newMode);
  };

  /* =========================================================
     CONVERT FIREBASE PROFILE -> APP USER
  ========================================================= */

  const buildAppUser = (
    firebaseUser: any,
    profile: any
  ): UserType => {
    return {
      id: firebaseUser.uid,

      fullName:
        profile.fullName ||
        firebaseUser.displayName ||
        '',

      username:
        profile.username ||
        firebaseUser.email?.split('@')[0] ||
        '',

      email:
        profile.email ||
        firebaseUser.email ||
        '',

      phone:
        profile.phone ||
        '',

      department:
        profile.department ||
        '',

      year:
        profile.year ||
        'Faculty/Admin',

      section:
        profile.section ||
        'N/A',

      role:
        profile.role,

      clubMemberId:
        profile.clubMemberId ||
        undefined,

      avatarUrl:
        profile.photoURL ||
        firebaseUser.photoURL ||
        undefined,

      createdAt:
        profile.createdAt?.toDate
          ? profile.createdAt.toDate().toISOString()
          : new Date().toISOString(),
    };
  };

  /* =========================================================
     LOGIN
  ========================================================= */

  const handleLoginSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    clearMessages();

    if (!loginIdentifier.trim()) {
      setErrorMsg(
        'Please enter your email address.'
      );
      return;
    }

    if (!loginPassword) {
      setErrorMsg(
        'Please enter your password.'
      );
      return;
    }

    setLoading(true);

    try {
      /* -----------------------------------------
         STEP 1
         Firebase Authentication
      ----------------------------------------- */

      const firebaseUser =
        await emailPasswordSignIn(
          loginIdentifier.trim(),
          loginPassword
        );

      /* -----------------------------------------
         STEP 2
         Get Firestore Profile

         users/{uid}
      ----------------------------------------- */

      const profile =
        await getCurrentUserProfile(
          firebaseUser.uid
        );

      if (!profile) {
        throw new Error(
          'User profile not found. Please contact the Literature Club administrator.'
        );
      }

      /* -----------------------------------------
         STEP 3
         Active Check
      ----------------------------------------- */

      if (profile.active === false) {
        throw new Error(
          'Your account is currently inactive. Please contact the Literature Club coordinator.'
        );
      }

      /* -----------------------------------------
         STEP 4
         Student Gateway Security
      ----------------------------------------- */

      if (
        gateway === 'student' &&
        profile.role !== 'student'
      ) {
        throw new Error(
          'This account belongs to a coordinator or administrator. Please use Coordinator Login.'
        );
      }

      /* -----------------------------------------
         STEP 5
         Coordinator Gateway Security
      ----------------------------------------- */

      if (
        gateway === 'coordinator' &&
        profile.role !== 'coordinator' &&
        profile.role !== 'admin'
      ) {
        throw new Error(
          'This account is not authorized for Coordinator Login.'
        );
      }

      /* -----------------------------------------
         STEP 6
         Convert to App User
      ----------------------------------------- */

      const appUser =
        buildAppUser(
          firebaseUser,
          profile
        );

      /* -----------------------------------------
         STEP 7
         Send REAL USER to App.tsx
      ----------------------------------------- */

      onLoginSuccess(appUser);

      /* -----------------------------------------
         STEP 8
         Close Modal
      ----------------------------------------- */

      onClose();

    } catch (err: any) {
      console.error(
        'Login error:',
        err
      );

      const code =
        err?.code || '';

      if (
        code ===
        'auth/invalid-credential'
      ) {
        setErrorMsg(
          'Invalid email or password.'
        );
      }

      else if (
        code ===
        'auth/user-not-found'
      ) {
        setErrorMsg(
          'No account found with this email address.'
        );
      }

      else if (
        code ===
        'auth/wrong-password'
      ) {
        setErrorMsg(
          'Incorrect password.'
        );
      }

      else if (
        code ===
        'auth/invalid-email'
      ) {
        setErrorMsg(
          'Please enter a valid email address.'
        );
      }

      else if (
        code ===
        'auth/too-many-requests'
      ) {
        setErrorMsg(
          'Too many failed attempts. Please try again later.'
        );
      }

      else {
        setErrorMsg(
          err?.message ||
          'Login failed. Please try again.'
        );
      }

    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     STUDENT REGISTRATION
  ========================================================= */

  const handleRegisterSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    clearMessages();

    /* -----------------------------------------
       VALIDATION
    ----------------------------------------- */

    if (!fullName.trim()) {
      setErrorMsg(
        'Please enter your full name.'
      );
      return;
    }

    if (!username.trim()) {
      setErrorMsg(
        'Please enter a username.'
      );
      return;
    }

    if (
      !/^[a-zA-Z0-9_.-]{3,30}$/.test(
        username.trim()
      )
    ) {
      setErrorMsg(
        'Username must contain 3-30 characters using letters, numbers, dot, underscore or hyphen.'
      );
      return;
    }

    if (!email.trim()) {
      setErrorMsg(
        'Please enter your email address.'
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email.trim()
      )
    ) {
      setErrorMsg(
        'Please enter a valid email address.'
      );
      return;
    }

    if (
      !/^\d{10}$/.test(
        phone.trim()
      )
    ) {
      setErrorMsg(
        'Please enter a valid 10-digit phone number.'
      );
      return;
    }

    if (!department) {
      setErrorMsg(
        'Please select your department.'
      );
      return;
    }

    if (!year) {
      setErrorMsg(
        'Please select your year.'
      );
      return;
    }

    if (!section) {
      setErrorMsg(
        'Please select your section.'
      );
      return;
    }

    if (password.length < 6) {
      setErrorMsg(
        'Password must contain at least 6 characters.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(
        'Passwords do not match.'
      );
      return;
    }

    setLoading(true);

    try {
      /* -----------------------------------------
         CREATE FIREBASE ACCOUNT
      ----------------------------------------- */

      const result =
      await registerStudentAccount({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        department,
        year,
        section,
        avatarUrl,
      });
      /* -----------------------------------------
         SUCCESS
      ----------------------------------------- */

      setSuccessMsg(
        'Student account created successfully. You are now signed in.'
      );

      /* -----------------------------------------
         CLEAR PASSWORD
      ----------------------------------------- */

      setPassword('');
      setConfirmPassword('');

      /* -----------------------------------------
         CREATE APP USER FROM REAL PROFILE
      ----------------------------------------- */

      if (
        result.user &&
        result.profile
      ) {
        const appUser =
          buildAppUser(
            result.user,
            result.profile
          );

        onLoginSuccess(appUser);
      }

      /* -----------------------------------------
         CLOSE AFTER SUCCESS
      ----------------------------------------- */

      setTimeout(() => {
        onClose();
      }, 800);

    } catch (err: any) {
      console.error(
        'Registration error:',
        err
      );

      const code =
        err?.code || '';

      if (
        code ===
        'auth/email-already-in-use'
      ) {
        setErrorMsg(
          'An account already exists with this email address.'
        );
      }

      else if (
        code ===
        'auth/weak-password'
      ) {
        setErrorMsg(
          'Password is too weak. Please use at least 6 characters.'
        );
      }

      else if (
        code ===
        'auth/invalid-email'
      ) {
        setErrorMsg(
          'Please enter a valid email address.'
        );
      }

      else {
        setErrorMsg(
          err?.message ||
          'Registration failed. Please try again.'
        );
      }

    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     PASSWORD RESET
  ========================================================= */

  const handlePasswordReset = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    clearMessages();

    if (!forgotEmail.trim()) {
      setErrorMsg(
        'Please enter your registered email address.'
      );
      return;
    }

    setLoading(true);

    try {
      await requestPasswordReset(
        forgotEmail.trim()
      );

      setSuccessMsg(
        'Password reset email sent. Please check your inbox.'
      );

      setTimeout(() => {
        setMode('login');
        setForgotEmail('');
        setSuccessMsg('');
      }, 2500);

    } catch (err: any) {
      console.error(
        'Password reset error:',
        err
      );

      const code =
        err?.code || '';

      if (
        code ===
        'auth/user-not-found'
      ) {
        setErrorMsg(
          'No Firebase account exists with this email address.'
        );
      }

      else if (
        code ===
        'auth/invalid-email'
      ) {
        setErrorMsg(
          'Please enter a valid email address.'
        );
      }

      else {
        setErrorMsg(
          err?.message ||
          'Unable to send password reset email.'
        );
      }

    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     AVATAR
  ========================================================= */

  const handleAvatarFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    clearMessages();

    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setErrorMsg(
        'Avatar file size exceeds 10MB. Please upload a smaller image.'
      );
      return;
    }

    if (
      !file.type.startsWith(
        'image/'
      )
    ) {
      setErrorMsg(
        'Please select a valid image file.'
      );
      return;
    }

    const reader =
      new FileReader();

    reader.onload = (
      event
    ) => {
      if (
        event.target?.result
      ) {
        setAvatarUrl(
          event.target
            .result as string
        );
      }
    };

    reader.readAsDataURL(file);
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">

      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#D4AF37] overflow-hidden my-6 text-[#171717]">

        {/* HEADER */}

        <div className="p-6 text-center space-y-2 border-b border-gray-100 bg-[#FAFAFA]">

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D4AF37]/15 border border-[#D4AF37]/35 rounded-full text-[11px] text-[#A67C00] font-semibold">

            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />

            <span>
              Secure Firebase Authentication
            </span>

          </div>

          <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight pt-1">
            Welcome to VSB Literature Club Portal
          </h2>

          <p className="text-xs text-[#666666] max-w-lg mx-auto">
            Access Literature Club
            registrations, certificates
            and management services.
          </p>

        </div>

        {/* MAIN */}

        <div className="p-6 bg-white space-y-5">

          {/* GATEWAYS */}

          <div className="grid grid-cols-3 gap-1.5 bg-[#FAFAFA] p-1.5 rounded-2xl border border-gray-200">

            <button
              type="button"
              onClick={() =>
                switchGateway('student')
              }
              className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                gateway === 'student' &&
                mode === 'login'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white shadow-sm'
                  : 'text-[#666666] hover:text-[#171717]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Student Login
            </button>

            <button
              type="button"
              onClick={() =>
                switchGateway(
                  'coordinator'
                )
              }
              className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                gateway === 'coordinator' &&
                mode === 'login'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white shadow-sm'
                  : 'text-[#666666] hover:text-[#171717]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Coordinator Login
            </button>

            <button
              type="button"
              onClick={() => {
                clearMessages();
                setMode('register');
                setGateway('student');
              }}
              className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#171717] text-white shadow-sm'
                  : 'text-[#666666] hover:text-[#171717]'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              Student Register
            </button>

          </div>

          {/* TABS */}

          <div className="flex border-b border-gray-200 text-xs font-bold">

            <button
              type="button"
              onClick={() =>
                switchMode('login')
              }
              className={`pb-2.5 px-4 border-b-2 ${
                mode === 'login'
                  ? 'border-[#D4AF37] text-[#A67C00]'
                  : 'border-transparent text-[#666666]'
              }`}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() =>
                switchMode('register')
              }
              className={`pb-2.5 px-4 border-b-2 ${
                mode === 'register'
                  ? 'border-[#D4AF37] text-[#A67C00]'
                  : 'border-transparent text-[#666666]'
              }`}
            >
              New Account
            </button>

            <button
              type="button"
              onClick={onClose}
              className="ml-auto text-gray-400 hover:text-gray-700 pb-2"
            >
              <X className="w-5 h-5" />
            </button>

          </div>

          {/* ERROR */}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SUCCESS */}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* =================================================
              LOGIN
          ================================================= */}

          {mode === 'login' && (
            <form
              onSubmit={
                handleLoginSubmit
              }
              className="space-y-4"
            >

              <div className="p-3 bg-[#FAFAFA] border border-[#D4AF37]/30 rounded-xl">

                <div className="flex items-center gap-2">

                  {gateway ===
                  'student' ? (
                    <User className="w-4 h-4 text-[#D4AF37]" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  )}

                  <div>

                    <p className="text-xs font-bold">
                      {gateway ===
                      'student'
                        ? 'Student Login'
                        : 'Coordinator Login'}
                    </p>

                    <p className="text-[10px] text-[#666666]">
                      {gateway ===
                      'student'
                        ? 'Sign in using your student Firebase account.'
                        : 'Authorized coordinators and administrators only.'}
                    </p>

                  </div>

                </div>

              </div>

              {/* EMAIL */}

              <div>

                <label className="block text-xs font-bold mb-1">
                  Email Address
                </label>

                <div className="relative">

                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />

                  <input
                    type="email"
                    required
                    value={
                      loginIdentifier
                    }
                    onChange={(e) =>
                      setLoginIdentifier(
                        e.target.value
                      )
                    }
                    placeholder="student@example.com"
                    className="w-full text-xs p-3 pl-9 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div>

                <div className="flex items-center justify-between mb-1">

                  <label className="block text-xs font-bold">
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      switchMode(
                        'forgot_password'
                      )
                    }
                    className="text-[11px] text-[#A67C00] font-bold hover:underline"
                  >
                    Forgot Password?
                  </button>

                </div>

                <div className="relative">

                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />

                  <input
                    type="password"
                    required
                    value={
                      loginPassword
                    }
                    onChange={(e) =>
                      setLoginPassword(
                        e.target.value
                      )
                    }
                    placeholder="••••••••"
                    className="w-full text-xs p-3 pl-9 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />

                </div>

              </div>

              <div className="p-3 bg-[#FAFAFA] border border-[#D4AF37]/30 rounded-xl text-[11px] text-[#666666] flex items-center gap-2">

                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />

                Authentication is securely handled by Firebase.

              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white rounded-xl font-bold text-xs shadow-sm disabled:opacity-60"
              >
                {loading
                  ? 'Signing In...'
                  : gateway ===
                    'student'
                  ? '➔ Sign In as Student'
                  : '➔ Sign In as Coordinator'}
              </button>

            </form>
          )}

          {/* =================================================
              REGISTER
          ================================================= */}

          {mode === 'register' && (
            <form
              onSubmit={
                handleRegisterSubmit
              }
              className="space-y-3"
            >

              {/* NAME + USERNAME */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <div>

                  <label className="block text-xs font-bold mb-1">
                    Full Name *
                  </label>

                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) =>
                      setFullName(
                        e.target.value
                      )
                    }
                    placeholder="Enter your full name"
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />

                </div>

                <div>

                  <label className="block text-xs font-bold mb-1">
                    Username *
                  </label>

                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) =>
                      setUsername(
                        e.target.value
                      )
                    }
                    placeholder="e.g. priya_cse2026"
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />

                </div>

              </div>

              <p className="text-[10px] text-[#A67C00] italic">
                Username will be saved to your
                Literature Club profile.
              </p>

              {/* EMAIL + PHONE */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <div>

                  <label className="block text-xs font-bold mb-1">
                    Email ID *
                  </label>

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    placeholder="student@example.com"
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />

                </div>

                <div>

                  <label className="block text-xs font-bold mb-1">
                    Phone Number *
                  </label>

                  <div className="relative">

                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />

                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) =>
                        setPhone(
                          e.target.value
                            .replace(
                              /\D/g,
                              ''
                            )
                            .slice(
                              0,
                              10
                            )
                        )
                      }
                      placeholder="10-digit mobile"
                      className="w-full text-xs p-2.5 pl-9 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                    />

                  </div>

                </div>

              </div>

              {/* DEPARTMENT */}

              <div>

                <label className="block text-xs font-bold mb-1">
                  Engineering Department *
                </label>

                <select
                  required
                  value={department}
                  onChange={(e) =>
                    setDepartment(
                      e.target.value
                    )
                  }
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
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

              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="block text-xs font-bold mb-1">
                    Year *
                  </label>

                  <select
                    value={year}
                    onChange={(e) =>
                      setYear(
                        e.target
                          .value as StudentYear
                      )
                    }
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl"
                  >

                    <option value="1st">
                      1st Year
                    </option>

                    <option value="2nd">
                      2nd Year
                    </option>

                    <option value="3rd">
                      3rd Year
                    </option>

                    <option value="4th">
                      4th Year
                    </option>

                  </select>

                </div>

                <div>

                  <label className="block text-xs font-bold mb-1">
                    Section *
                  </label>

                  <select
                    value={section}
                    onChange={(e) =>
                      setSection(
                        e.target
                          .value as StudentSection
                      )
                    }
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl"
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

                  </select>

                </div>

              </div>

              {/* PHOTO */}

              <div>

                <label className="block text-xs font-bold mb-1">
                  Profile Photo
                </label>

                <div className="flex items-center gap-3 bg-[#FAFAFA] p-2.5 rounded-xl border border-gray-200">

                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar Preview"
                      className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-500">
                      Photo
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={
                      handleAvatarFileUpload
                    }
                    className="text-xs"
                  />

                </div>

                <p className="text-[10px] text-gray-500 mt-1">
                  Maximum file size: 10 MB
                </p>

              </div>

              {/* PASSWORD */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <div>

                  <label className="block text-xs font-bold mb-1">
                    Password *
                  </label>

                  <div className="relative">

                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />

                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      placeholder="••••••••"
                      className="w-full text-xs p-2.5 pl-9 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                    />

                  </div>

                </div>

                <div>

                  <label className="block text-xs font-bold mb-1">
                    Confirm Password *
                  </label>

                  <div className="relative">

                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />

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
                      placeholder="••••••••"
                      className="w-full text-xs p-2.5 pl-9 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                    />

                  </div>

                </div>

              </div>

              {/* REGISTER */}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white rounded-xl text-xs font-bold shadow-sm mt-2 disabled:opacity-60"
              >

                {loading
                  ? 'Creating Student Account...'
                  : '➔ Register Student Account'}

              </button>

            </form>
          )}

          {/* =================================================
              FORGOT PASSWORD
          ================================================= */}

          {mode ===
            'forgot_password' && (
            <form
              onSubmit={
                handlePasswordReset
              }
              className="space-y-4"
            >

              <div className="p-4 bg-[#FAFAFA] border border-[#D4AF37]/30 rounded-xl">

                <div className="flex items-center gap-2 mb-2">

                  <KeyRound className="w-4 h-4 text-[#D4AF37]" />

                  <h3 className="text-xs font-bold">
                    Reset Your Password
                  </h3>

                </div>

                <p className="text-[11px] text-[#666666]">
                  Enter your registered
                  email address.
                  Firebase will send a
                  secure reset link.
                </p>

              </div>

              <div>

                <label className="block text-xs font-bold mb-1">
                  Registered Email ID
                </label>

                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) =>
                    setForgotEmail(
                      e.target.value
                    )
                  }
                  placeholder="student@example.com"
                  className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                />

              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white rounded-xl text-xs font-bold disabled:opacity-60"
              >

                {loading
                  ? 'Sending Reset Email...'
                  : 'Send Password Reset Email'}

              </button>

              <button
                type="button"
                onClick={() =>
                  switchMode('login')
                }
                className="w-full py-2 text-xs font-bold text-[#A67C00] hover:underline"
              >
                ← Back to Login
              </button>

            </form>
          )}

        </div>

      </div>

    </div>
  );
};

export default AuthModal;