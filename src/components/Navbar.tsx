import {
  CalendarDays,
  Edit3,
  GalleryHorizontal,
  Home,
  Info,
  LogOut,
  Mail,
  Menu,
  Settings,
  Sparkles,
  Trophy,
  Users,
  X,
  UserRound,
} from 'lucide-react';

import React, { useState } from 'react';

import {
  HeaderConfig,
  User as UserType,
} from '../types';

import { VsbCollegeLogo } from './VsbCollegeLogo';

import literatureClubLogo from '../assets/images/literature-club-logo.jpeg';

interface NavbarProps {
  headerConfig: HeaderConfig;
  currentUser: UserType | null;

  onOpenAuthModal: (
    mode: 'login' | 'register'
  ) => void;

  onLogout: () => void;

  onOpenHeaderCustomizer: () => void;

  onOpenGoogleWorkspaceModal?: () => void;

  activeTab: string;

  setActiveTab: (
    tab: string
  ) => void;
}

export const Navbar: React.FC<
  NavbarProps
> = ({
  headerConfig,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onOpenHeaderCustomizer,
  onOpenGoogleWorkspaceModal,
  activeTab,
  setActiveTab,
}) => {
  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  /* =====================================================
     ROLE
  ===================================================== */

  const isManagementRole =
    currentUser?.role === 'admin' ||
    currentUser?.role === 'coordinator';

  /* =====================================================
     NAV LINKS
  ===================================================== */

  const navLinks = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
    },
    {
      id: 'about',
      label: 'About Club',
      icon: Info,
    },
    {
      id: 'workshops',
      label: 'Workshops',
      icon: CalendarDays,
    },
    {
      id: 'activities',
      label: 'Monthly Activities',
      icon: CalendarDays,
    },
    {
      id: 'winners',
      label: 'Winners',
      icon: Trophy,
    },
    {
      id: 'gallery',
      label: 'Gallery',
      icon: GalleryHorizontal,
    },
    {
      id: 'coordinators',
      label: 'Coordinators',
      icon: Users,
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: Mail,
    },
  ];

  /* =====================================================
     NAVIGATION
  ===================================================== */

  const handleNavigation = (
    id: string
  ) => {
    setActiveTab(id);
    setMobileMenuOpen(false);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  /* =====================================================
     CLOSE MOBILE MENU
  ===================================================== */

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header
      className="
        relative z-30
        w-full max-w-full min-w-0
        overflow-x-hidden
        bg-[#FFFDF8]
        text-[#172033]
        border-b border-[#D4AF37]/25
        shadow-[0_3px_18px_rgba(30,40,60,0.06)]
      "
    >

      {/* =================================================
          TOP BRANDING
      ================================================= */}

      <div className="w-full max-w-full border-b border-[#D4AF37]/20 bg-[#FFFDF8]">

        <div
          className="
            mx-auto flex w-full max-w-[1500px]
            min-w-0 items-center justify-between
            gap-4 px-4 py-3
            sm:px-6
            lg:px-8
            xl:px-10
          "
        >

          {/* =================================================
              LEFT BRAND
          ================================================= */}

          <div className="flex min-w-0 items-center gap-3">

            {/* COLLEGE LOGO */}

            <div
              className="
                relative flex shrink-0
                cursor-pointer items-center
                justify-center group
              "
              onClick={
                isManagementRole
                  ? onOpenHeaderCustomizer
                  : undefined
              }
            >

              <VsbCollegeLogo
                className="
                  h-[52px] w-[52px]
                  transition-transform duration-300
                  group-hover:scale-105
                  sm:h-[62px] sm:w-[62px]
                  md:h-[70px] md:w-[70px]
                "
              />

              {isManagementRole && (
                <span
                  className="
                    absolute bottom-0 right-0
                    rounded-full bg-[#C99A18]
                    p-1 text-white
                    shadow-md
                  "
                  title="Edit Logo"
                >
                  <Settings className="h-3 w-3" />
                </span>
              )}

            </div>

            {/* BRAND TEXT */}

            <div className="min-w-0 leading-tight">

              <div className="truncate text-[10px] font-bold uppercase tracking-[0.10em] text-[#B47F00] sm:text-xs md:text-sm md:tracking-[0.12em]">
                V.S.B. ENGINEERING COLLEGE
              </div>

              <div className="flex min-w-0 items-center gap-1.5">

                <h1
                  className="
                    min-w-0 truncate
                    font-serif-title
                    text-xl font-bold leading-none
                    tracking-tight text-[#101722]
                    sm:text-2xl
                    md:text-[30px]
                  "
                >
                  {headerConfig.siteName ||
                    'LITERATURE CLUB'}
                </h1>

                {isManagementRole && (
                  <button
                    type="button"
                    onClick={
                      onOpenHeaderCustomizer
                    }
                    className="
                      shrink-0 rounded-md
                      p-1 text-[#B47F00]
                      transition
                      hover:bg-[#D4AF37]/10
                    "
                    title="Edit Header"
                  >
                    <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                )}

              </div>

              <p
                className="
                  mt-1 hidden
                  truncate text-xs italic
                  text-[#667085]
                  sm:block
                  md:text-sm
                "
              >
                An Official Academic & Literary Guild
              </p>

            </div>

          </div>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div className="flex shrink-0 items-center gap-2">

            {/* MANAGEMENT ACTIONS */}

            {isManagementRole && (
              <div className="hidden items-center gap-2 xl:flex">

                {onOpenGoogleWorkspaceModal && (
                  <button
                    type="button"
                    onClick={
                      onOpenGoogleWorkspaceModal
                    }
                    className="
                      inline-flex items-center gap-1.5
                      rounded-full
                      border border-[#D4AF37]/50
                      px-3 py-2
                      text-[11px] font-semibold
                      text-[#9A6D00]
                      transition
                      hover:bg-[#D4AF37]/10
                    "
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Google Workspace
                  </button>
                )}

                <button
                  type="button"
                  onClick={
                    onOpenHeaderCustomizer
                  }
                  className="
                    inline-flex items-center gap-1.5
                    rounded-full
                    border border-[#D4AF37]/40
                    bg-[#D4AF37]/10
                    px-3 py-2
                    text-[11px] font-semibold
                    text-[#9A6D00]
                    transition
                    hover:bg-[#D4AF37]/20
                  "
                >
                  <Settings className="h-3.5 w-3.5" />
                  Edit Header
                </button>

              </div>
            )}

            {/* LITERATURE CLUB LOGO */}

            <div
              className="
                relative shrink-0
                cursor-pointer group
              "
              onClick={
                isManagementRole
                  ? onOpenHeaderCustomizer
                  : undefined
              }
            >

              <img
                src={
                  literatureClubLogo
                }
                alt="Literature Club"
                className="
                  h-[50px] w-[50px]
                  rounded-full
                  border-2 border-[#D4AF37]
                  bg-white p-1
                  object-contain shadow-sm
                  transition-transform duration-300
                  group-hover:scale-105
                  sm:h-[60px] sm:w-[60px]
                  md:h-[70px] md:w-[70px]
                "
              />

            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          MAIN NAVIGATION
      ================================================= */}

      <nav className="w-full max-w-full overflow-hidden border-b border-[#E7D9AD]/60 bg-white">

        <div
          className="
            mx-auto flex w-full max-w-[1500px]
            min-w-0 items-center gap-2
            px-3
            sm:px-4
            md:px-6
            lg:px-8
            xl:px-10
            min-h-[56px]
          "
        >

          {/* =================================================
              DESKTOP NAV SCROLL AREA

              This prevents the PAGE itself from overflowing.
          ================================================= */}

          <div
            className="
              hidden min-w-0 flex-1
              overflow-x-auto overflow-y-hidden
              md:flex md:items-center
              md:gap-1
              pb-1 md:pb-0
            "
          >

            <div className="flex min-w-max items-center gap-1">

              {navLinks.map(
                (link) => {
                  const Icon =
                    link.icon;

                  const isActive =
                    activeTab ===
                    link.id;

                  return (
                    <button
                      key={
                        link.id
                      }
                      type="button"
                      onClick={() =>
                        handleNavigation(
                          link.id
                        )
                      }
                      className={`
                        flex shrink-0
                        items-center
                        gap-1.5
                        rounded-full
                        px-3 py-2
                        text-xs
                        font-semibold
                        whitespace-nowrap
                        transition-all
                        duration-200
                        lg:px-3.5
                        lg:py-2.5
                        lg:text-[13px]
                        ${
                          isActive
                            ? 'bg-gradient-to-r from-[#D4A017] to-[#C18B09] text-white shadow-[0_3px_10px_rgba(193,139,9,0.22)]'
                            : 'text-[#4B5563] hover:bg-[#D4AF37]/10 hover:text-[#9A6D00]'
                        }
                      `}
                    >

                      <Icon
                        className={`
                          h-4 w-4 shrink-0
                          ${
                            isActive
                              ? 'text-white'
                              : 'text-[#475569]'
                          }
                        `}
                      />

                      <span>
                        {link.label}
                      </span>

                    </button>
                  );
                }
              )}

              {/* DASHBOARD / MANAGEMENT */}

              {currentUser && (
                <button
                  type="button"
                  onClick={() =>
                    handleNavigation(
                      'dashboard'
                    )
                  }
                  className={`
                    flex shrink-0
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    px-3 py-2
                    text-xs
                    font-semibold
                    whitespace-nowrap
                    transition-all
                    lg:px-3.5
                    lg:py-2.5
                    lg:text-[13px]
                    ${
                      activeTab ===
                      'dashboard'
                        ? 'border-[#C18B09] bg-gradient-to-r from-[#C18B09] to-[#A87500] text-white shadow-md'
                        : 'border-[#D4AF37]/30 bg-[#FFFDF5] text-[#9A6D00] hover:bg-[#D4AF37]/10'
                    }
                  `}
                >

                  <Sparkles className="h-4 w-4 shrink-0" />

                  <span>
                    {currentUser.role ===
                    'student'
                      ? 'My Dashboard'
                      : 'Management Portal'}
                  </span>

                </button>
              )}

            </div>

          </div>

          {/* =================================================
              DESKTOP AUTH
          ================================================= */}

          <div
            className="
              hidden shrink-0
              md:flex md:items-center
              md:justify-end
            "
          >

            {currentUser ? (

              /* LOGGED IN */

              <div
                className="
                  flex max-w-[205px]
                  shrink-0
                  items-center gap-2
                  rounded-full
                  border border-[#D4AF37]/30
                  bg-[#FFFDF8]
                  px-2.5 py-1.5
                "
              >

                {/* AVATAR */}

                {currentUser.avatarUrl ? (
                  <img
                    src={
                      currentUser.avatarUrl
                    }
                    alt={
                      currentUser.fullName
                    }
                    className="
                      h-8 w-8 shrink-0
                      rounded-full
                      border border-[#D4AF37]
                      object-cover
                    "
                  />
                ) : (
                  <div
                    className="
                      flex h-8 w-8 shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#C18B09]
                      text-sm font-bold
                      text-white
                    "
                  >
                    {currentUser.fullName
                      ? currentUser.fullName
                          .trim()
                          .charAt(0)
                          .toUpperCase()
                      : 'U'}
                  </div>
                )}

                {/* USER TEXT */}

                <div className="hidden min-w-0 lg:block">

                  <div
                    className="
                      max-w-[105px]
                      truncate
                      text-[11px]
                      font-bold
                      text-[#172033]
                    "
                  >
                    {currentUser.fullName}
                  </div>

                  <div
                    className="
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-[#A87500]
                    "
                  >
                    {currentUser.role}
                  </div>

                </div>

                {/* LOGOUT */}

                <button
                  type="button"
                  onClick={
                    onLogout
                  }
                  className="
                    flex h-8 w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    text-[#667085]
                    transition
                    hover:bg-red-50
                    hover:text-red-600
                  "
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>

              </div>

            ) : (

              /* LOGGED OUT */

              <div className="flex shrink-0 items-center gap-2">

                <button
                  type="button"
                  onClick={() =>
                    onOpenAuthModal(
                      'login'
                    )
                  }
                  className="
                    inline-flex
                    shrink-0
                    items-center gap-1.5
                    rounded-full
                    border border-[#D4AF37]
                    bg-white
                    px-4 py-2
                    text-xs
                    font-semibold
                    text-[#956B00]
                    transition
                    hover:bg-[#FFF8E6]
                    lg:px-5
                    lg:py-2.5
                  "
                >
                  <UserRound className="h-3.5 w-3.5" />
                  Login
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onOpenAuthModal(
                      'register'
                    )
                  }
                  className="
                    inline-flex
                    shrink-0
                    items-center gap-1.5
                    rounded-full
                    bg-gradient-to-r
                    from-[#D4A017]
                    to-[#B98200]
                    px-4 py-2
                    text-xs
                    font-semibold
                    text-white
                    shadow-sm
                    transition
                    hover:shadow-md
                    lg:px-5
                    lg:py-2.5
                  "
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Register
                </button>

              </div>

            )}

          </div>

          {/* =================================================
              MOBILE NAV BAR
          ================================================= */}

          <div
            className="
              flex w-full
              items-center
              justify-between
              md:hidden
            "
          >

            <div className="min-w-0">

              <span
                className="
                  block truncate
                  font-serif-title
                  text-sm font-bold
                  text-[#A87500]
                "
              >
                VSB Literature Club
              </span>

            </div>

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(
                  (open) => !open
                )
              }
              className="
                ml-3 flex h-10 w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                text-[#172033]
                transition
                hover:bg-[#D4AF37]/10
              "
              aria-label={
                mobileMenuOpen
                  ? 'Close menu'
                  : 'Open menu'
              }
              aria-expanded={
                mobileMenuOpen
              }
            >

              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}

            </button>

          </div>

        </div>

      </nav>

      {/* =====================================================
          MOBILE MENU
      ===================================================== */}

      {mobileMenuOpen && (
        <div
          className="
            md:hidden
            border-t border-[#D4AF37]/20
            bg-white
            px-4 py-4
            shadow-lg
          "
        >

          <div className="space-y-1">

            {navLinks.map(
              (link) => {
                const Icon =
                  link.icon;

                const isActive =
                  activeTab ===
                  link.id;

                return (
                  <button
                    key={
                      link.id
                    }
                    type="button"
                    onClick={() =>
                      handleNavigation(
                        link.id
                      )
                    }
                    className={`
                      flex w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-4 py-3
                      text-left
                      text-sm
                      font-semibold
                      transition
                      ${
                        isActive
                          ? 'bg-gradient-to-r from-[#D4A017] to-[#C18B09] text-white'
                          : 'text-[#4B5563] hover:bg-[#FFF8E6]'
                      }
                    `}
                  >

                    <Icon className="h-5 w-5 shrink-0" />

                    <span>
                      {link.label}
                    </span>

                  </button>
                );
              }
            )}

            {/* MOBILE DASHBOARD */}

            {currentUser && (
              <button
                type="button"
                onClick={() =>
                  handleNavigation(
                    'dashboard'
                  )
                }
                className="
                  mt-2 flex w-full
                  items-center gap-3
                  rounded-xl
                  bg-gradient-to-r
                  from-[#C18B09]
                  to-[#A87500]
                  px-4 py-3
                  text-left
                  text-sm
                  font-semibold
                  text-white
                "
              >
                <Sparkles className="h-5 w-5" />

                {currentUser.role ===
                'student'
                  ? 'My Dashboard'
                  : 'Management Portal'}
              </button>
            )}

          </div>

          {/* =================================================
              MOBILE ACCOUNT
          ================================================= */}

          <div
            className="
              mt-4
              border-t border-[#D4AF37]/20
              pt-4
            "
          >

            {currentUser ? (

              <div className="flex items-center justify-between gap-3">

                <div className="flex min-w-0 items-center gap-3">

                  {currentUser.avatarUrl ? (
                    <img
                      src={
                        currentUser.avatarUrl
                      }
                      alt={
                        currentUser.fullName
                      }
                      className="
                        h-10 w-10
                        shrink-0
                        rounded-full
                        border border-[#D4AF37]
                        object-cover
                      "
                    />
                  ) : (
                    <div
                      className="
                        flex h-10 w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-[#C18B09]
                        text-white
                        font-bold
                      "
                    >
                      {currentUser.fullName
                        ? currentUser.fullName
                            .trim()
                            .charAt(0)
                            .toUpperCase()
                        : 'U'}
                    </div>
                  )}

                  <div className="min-w-0">

                    <div className="truncate text-sm font-bold text-[#172033]">
                      {currentUser.fullName}
                    </div>

                    <div className="text-[10px] uppercase tracking-wider text-[#A87500]">
                      {currentUser.role}
                    </div>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    closeMobileMenu();
                  }}
                  className="
                    inline-flex
                    shrink-0
                    items-center
                    gap-2
                    rounded-xl
                    bg-red-50
                    px-3 py-2
                    text-xs
                    font-bold
                    text-red-600
                  "
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>

              </div>

            ) : (

              <div className="grid grid-cols-2 gap-2">

                <button
                  type="button"
                  onClick={() => {
                    onOpenAuthModal(
                      'login'
                    );
                    closeMobileMenu();
                  }}
                  className="
                    rounded-xl
                    border border-[#D4AF37]
                    px-3 py-2.5
                    text-sm
                    font-semibold
                    text-[#956B00]
                  "
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenAuthModal(
                      'register'
                    );
                    closeMobileMenu();
                  }}
                  className="
                    rounded-xl
                    bg-[#C18B09]
                    px-3 py-2.5
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Register
                </button>

              </div>

            )}

          </div>

        </div>
      )}

    </header>
  );
};

export default Navbar;