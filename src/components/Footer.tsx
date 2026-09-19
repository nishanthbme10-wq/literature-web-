import {
  ArrowUpRight,
  Award,
  BookOpen,
  Edit3,
  Heart,
  Mail,
  MapPin,
  Save,
  Shield,
  Sparkles,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import LiteratureClubLogo from '../assets/images/literature-club-logo.jpeg';
import VSBCollegeLogo from '../assets/images/vsb-college-logo.jpeg';

import {
  FooterConfig,
  HeaderConfig,
  User,
} from '../types';

interface FooterProps {
  headerConfig: HeaderConfig;
  footerConfig?: FooterConfig;
  currentUser?: User | null;
  setActiveTab: (tab: string) => void;
  onUpdateFooterConfig?: (
    updated: FooterConfig
  ) => void;
}

const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  aboutText:
    'Empowering engineers through literary artistry, persuasive rhetoric, scholarly publication, and creative writing at VSB Engineering College.',

  contactNote:
    'Log in to register for Google Form workshops, submit attendance feedback, and download your verified e-certificates.',

  copyrightText:
    'Literature Club • VSB Engineering College. All Rights Reserved.',

  collegeTagline:
    'Official College Portal • Crafted for VSBEC Students',
};

export const Footer: React.FC<FooterProps> = ({
  headerConfig,
  footerConfig = DEFAULT_FOOTER_CONFIG,
  currentUser,
  setActiveTab,
  onUpdateFooterConfig,
}) => {
  const isStaff =
    !!currentUser &&
    (
      currentUser.role === 'admin' ||
      currentUser.role === 'coordinator'
    );

  const [isEditing, setIsEditing] =
    useState(false);

  const [formData, setFormData] =
    useState<FooterConfig>(
      footerConfig
    );

  const [
    showBackToTop,
    setShowBackToTop,
  ] = useState(false);

  useEffect(() => {
    setFormData(
      footerConfig
    );
  }, [footerConfig]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(
        window.scrollY > 500
      );
    };

    window.addEventListener(
      'scroll',
      handleScroll,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        'scroll',
        handleScroll
      );
    };
  }, []);

  const handleSave = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const cleanedData: FooterConfig = {
      aboutText:
        formData.aboutText.trim(),

      contactNote:
        formData.contactNote.trim(),

      copyrightText:
        formData.copyrightText.trim(),

      collegeTagline:
        formData.collegeTagline.trim(),
    };

    onUpdateFooterConfig?.(
      cleanedData
    );

    setFormData(
      cleanedData
    );

    setIsEditing(false);
  };

  const openEditor = () => {
    setFormData({
      ...footerConfig,
    });

    setIsEditing(true);
  };

  const closeEditor = () => {
    setFormData({
      ...footerConfig,
    });

    setIsEditing(false);
  };

  const handleNavigation = (
    tab: string
  ) => {
    setActiveTab(tab);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="relative overflow-hidden bg-[#FBF8EF] text-[#171717] border-t border-[#D4AF37]/35">

        {/* =====================================================
            ANIMATED BACKGROUND
        ===================================================== */}

        <style>
          {`
            @keyframes footerGlowOne {
              0%, 100% {
                transform: translate3d(-20px, 0, 0) scale(1);
                opacity: 0.35;
              }
              50% {
                transform: translate3d(35px, 15px, 0) scale(1.08);
                opacity: 0.55;
              }
            }

            @keyframes footerGlowTwo {
              0%, 100% {
                transform: translate3d(20px, 10px, 0) scale(1);
                opacity: 0.25;
              }
              50% {
                transform: translate3d(-30px, -15px, 0) scale(1.12);
                opacity: 0.45;
              }
            }

            @keyframes footerShimmer {
              0% {
                transform: translateX(-120%);
              }
              100% {
                transform: translateX(120%);
              }
            }

            @keyframes footerFloat {
              0%, 100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-6px);
              }
            }

            @keyframes footerLine {
              0%, 100% {
                opacity: 0.25;
              }
              50% {
                opacity: 0.75;
              }
            }

            .footer-glow-one {
              animation: footerGlowOne 10s ease-in-out infinite;
            }

            .footer-glow-two {
              animation: footerGlowTwo 12s ease-in-out infinite;
            }

            .footer-shimmer {
              animation: footerShimmer 8s ease-in-out infinite;
            }

            .footer-float {
              animation: footerFloat 5s ease-in-out infinite;
            }

            .footer-line-pulse {
              animation: footerLine 4s ease-in-out infinite;
            }

            @media (prefers-reduced-motion: reduce) {
              .footer-glow-one,
              .footer-glow-two,
              .footer-shimmer,
              .footer-float,
              .footer-line-pulse {
                animation: none !important;
              }
            }
          `}
        </style>

        {/* Soft gold ambient glow */}

        <div className="pointer-events-none absolute -top-36 -left-28 w-[420px] h-[420px] rounded-full bg-[#D4AF37]/10 blur-3xl footer-glow-one" />

        <div className="pointer-events-none absolute -bottom-40 -right-32 w-[460px] h-[460px] rounded-full bg-[#D4AF37]/8 blur-3xl footer-glow-two" />

        {/* Top shimmer */}

        <div className="pointer-events-none absolute top-0 left-0 right-0 h-px overflow-hidden bg-[#D4AF37]/20">
          <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent footer-shimmer" />
        </div>

        {/* Decorative side shapes */}

        <div className="pointer-events-none absolute top-20 left-0 w-32 h-32 rounded-full border border-[#D4AF37]/10 -translate-x-1/2" />

        <div className="pointer-events-none absolute bottom-16 right-0 w-40 h-40 rounded-full border border-[#D4AF37]/10 translate-x-1/2" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

          {/* =================================================
              STAFF EDITOR
          ================================================= */}

          {isEditing && (
            <div className="py-8">

              <div className="max-w-3xl mx-auto rounded-3xl overflow-hidden border border-[#D4AF37]/40 bg-white shadow-[0_20px_60px_rgba(90,70,20,0.12)]">

                {/* Header */}

                <div className="px-6 py-5 bg-[#171717] text-white flex items-center justify-between gap-4">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center">
                      <Edit3 className="w-5 h-5 text-[#D4AF37]" />
                    </div>

                    <div>

                      <div className="text-[9px] uppercase tracking-[0.16em] text-[#D4AF37] font-extrabold">
                        Admin / Coordinator
                      </div>

                      <h3 className="font-serif-title text-lg sm:text-xl font-bold">
                        Edit Footer Content
                      </h3>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={
                      closeEditor
                    }
                    className="w-9 h-9 rounded-xl border border-white/15 text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>

                </div>

                {/* Form */}

                <form
                  onSubmit={
                    handleSave
                  }
                  className="p-6 space-y-5 bg-[#FFFDF8]"
                >

                  <div>

                    <label className="block text-xs font-bold text-[#171717] mb-1.5">
                      Footer About Text
                    </label>

                    <textarea
                      rows={3}
                      value={
                        formData.aboutText
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          aboutText:
                            e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-3 rounded-xl bg-white border border-gray-200 text-[#171717] text-xs leading-relaxed outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 resize-none"
                    />

                  </div>

                  <div>

                    <label className="block text-xs font-bold text-[#171717] mb-1.5">
                      Portal Services Note
                    </label>

                    <textarea
                      rows={3}
                      value={
                        formData.contactNote
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactNote:
                            e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-3 rounded-xl bg-white border border-gray-200 text-[#171717] text-xs leading-relaxed outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 resize-none"
                    />

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <label className="block text-xs font-bold text-[#171717] mb-1.5">
                        Copyright Line
                      </label>

                      <input
                        type="text"
                        value={
                          formData.copyrightText
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            copyrightText:
                              e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-3 rounded-xl bg-white border border-gray-200 text-[#171717] text-xs outline-none focus:border-[#D4AF37]"
                      />

                    </div>

                    <div>

                      <label className="block text-xs font-bold text-[#171717] mb-1.5">
                        College Tagline
                      </label>

                      <input
                        type="text"
                        value={
                          formData.collegeTagline
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            collegeTagline:
                              e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-3 rounded-xl bg-white border border-gray-200 text-[#171717] text-xs outline-none focus:border-[#D4AF37]"
                      />

                    </div>

                  </div>

                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-gray-100">

                    <button
                      type="button"
                      onClick={
                        closeEditor
                      }
                      className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-[#666666] text-xs font-bold hover:bg-gray-50 cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#A67C00] text-white text-xs font-extrabold shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      Save Footer Changes
                    </button>

                  </div>

                </form>

              </div>

            </div>
          )}

          {/* =================================================
              MAIN FOOTER
          ================================================= */}

          <div className="py-14 md:py-16">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">

              {/* =================================================
                  BRANDING
              ================================================= */}

              <div className="lg:col-span-5">

                {/* LOGOS + CENTER BRAND */}

                <div className="flex items-center justify-between gap-3 sm:gap-5">

                  {/* LEFT LOGO */}

                  <div className="shrink-0 footer-float">

                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 border-[#D4AF37]/55 p-1.5 shadow-[0_10px_28px_rgba(90,70,20,0.12)] hover:scale-105 transition-transform duration-300">

                      <img
                        src={
                          VSBCollegeLogo
                        }
                        alt="V.S.B. Engineering College Logo"
                        className="w-full h-full object-contain rounded-xl"
                      />

                    </div>

                    <div className="text-center mt-2">

                      <span className="text-[8px] uppercase tracking-widest font-extrabold text-[#9A7710]">
                        College
                      </span>

                    </div>

                  </div>

                  {/* CENTER */}

                  <div className="flex-1 min-w-0 text-center">

                    <div className="inline-flex items-center justify-center gap-2 mb-2">

                      <span className="w-5 sm:w-8 h-px bg-[#D4AF37]/50 footer-line-pulse" />

                      <Sparkles className="w-3 h-3 text-[#D4AF37]" />

                      <span className="w-5 sm:w-8 h-px bg-[#D4AF37]/50 footer-line-pulse" />

                    </div>

                    <h3 className="font-serif-title text-xl sm:text-2xl md:text-3xl font-bold text-[#171717] leading-tight">
                      LITERATURE CLUB
                    </h3>

                    <div className="flex items-center justify-center gap-2 mt-2">

                      <span className="h-px w-6 sm:w-8 bg-[#D4AF37]" />

                      <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.12em] sm:tracking-[0.16em] text-[#96730D] font-extrabold">
                        V.S.B. Engineering College
                      </span>

                      <span className="h-px w-6 sm:w-8 bg-[#D4AF37]" />

                    </div>

                    <p className="mt-3 text-[10px] sm:text-xs text-[#777777] font-medium">
                      Read • Reflect • Connect • Create
                    </p>

                  </div>

                  {/* RIGHT LOGO */}

                  <div className="shrink-0 footer-float">

                    <div
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 border-[#D4AF37]/55 p-1.5 shadow-[0_10px_28px_rgba(90,70,20,0.12)] hover:scale-105 transition-transform duration-300"
                    >

                      <img
                        src={
                          LiteratureClubLogo
                        }
                        alt="Literature Club Logo"
                        className="w-full h-full object-contain rounded-xl"
                      />

                    </div>

                    <div className="text-center mt-2">

                      <span className="text-[8px] uppercase tracking-widest font-extrabold text-[#9A7710]">
                        Club
                      </span>

                    </div>

                  </div>

                </div>

                {/* ABOUT */}

                <p className="mt-8 text-sm text-[#666666] leading-7 max-w-xl">
                  {
                    footerConfig.aboutText
                  }
                </p>

                {/* QUOTE */}

                <div className="mt-6 pl-4 border-l-2 border-[#D4AF37]/65">

                  <p className="font-serif-title text-sm sm:text-base italic text-[#555555] leading-6">
                    “Engineering minds. Literary
                    voices. Creative futures.”
                  </p>

                </div>

                {/* EDIT */}

                {isStaff &&
                  !isEditing && (
                    <button
                      type="button"
                      onClick={
                        openEditor
                      }
                      className="mt-7 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D4AF37]/35 bg-white/70 text-[#8C6B0D] text-xs font-bold hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/60 hover:-translate-y-0.5 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Footer
                    </button>
                  )}

              </div>

              {/* =================================================
                  QUICK LINKS
              ================================================= */}

              <div className="lg:col-span-3">

                <div className="flex items-center gap-2 mb-5">

                  <div className="w-9 h-9 rounded-xl bg-white border border-[#D4AF37]/30 shadow-sm flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 text-[#A67C00]" />
                  </div>

                  <h4 className="font-serif-title text-lg font-bold text-[#171717]">
                    Quick Links
                  </h4>

                </div>

                <nav aria-label="Footer navigation">

                  <ul className="space-y-1">

                    {[
                      [
                        'home',
                        'Home Portal',
                      ],
                      [
                        'about',
                        'About Literature Club',
                      ],
                      [
                        'workshops',
                        'Workshops & Masterclasses',
                      ],
                      [
                        'activities',
                        'Monthly Events Log',
                      ],
                      [
                        'winners',
                        'Winners & Honors',
                      ],
                      [
                        'gallery',
                        'Photo Archives',
                      ],
                    ].map(
                      ([
                        tab,
                        label,
                      ]) => (
                        <li
                          key={tab}
                        >

                          <button
                            type="button"
                            onClick={() =>
                              handleNavigation(
                                tab
                              )
                            }
                            className="group/link w-full text-left flex items-center justify-between gap-3 py-2.5 px-2 rounded-lg text-xs text-[#666666] hover:text-[#8C6B0D] hover:bg-white/70 transition-all cursor-pointer"
                          >

                            <span className="group-hover/link:translate-x-1 transition-transform duration-300">
                              {label}
                            </span>

                            <ArrowUpRight className="w-3.5 h-3.5 text-transparent group-hover/link:text-[#D4AF37] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-all duration-300" />

                          </button>

                        </li>
                      )
                    )}

                  </ul>

                </nav>

              </div>

              {/* =================================================
                  STUDENT SERVICES
              ================================================= */}

              <div className="lg:col-span-4">

                <div className="rounded-3xl border border-[#D4AF37]/25 bg-white/65 backdrop-blur-sm p-5 sm:p-6 shadow-[0_10px_30px_rgba(90,70,20,0.06)] hover:shadow-[0_15px_38px_rgba(90,70,20,0.09)] hover:-translate-y-0.5 transition-all duration-300">

                  <div className="flex items-start gap-3">

                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/25 flex items-center justify-center shrink-0">

                      <Shield className="w-5 h-5 text-[#A67C00]" />

                    </div>

                    <div>

                      <div className="text-[9px] uppercase tracking-[0.16em] text-[#A67C00] font-extrabold">
                        Student Services
                      </div>

                      <h4 className="font-serif-title text-lg sm:text-xl font-bold text-[#171717] mt-1">
                        Student & Coordinator
                        Portal
                      </h4>

                    </div>

                  </div>

                  <p className="text-xs text-[#666666] leading-6 mt-5">
                    {
                      footerConfig.contactNote
                    }
                  </p>

                  {/* SERVICE CHIPS */}

                  <div className="flex flex-wrap gap-2 mt-5">

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FBF8EF] border border-[#D4AF37]/20 text-[10px] text-[#666666] font-semibold">
                      <BookOpen className="w-3 h-3 text-[#A67C00]" />
                      Workshops
                    </span>

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FBF8EF] border border-[#D4AF37]/20 text-[10px] text-[#666666] font-semibold">
                      <Award className="w-3 h-3 text-[#A67C00]" />
                      E-Certificates
                    </span>

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FBF8EF] border border-[#D4AF37]/20 text-[10px] text-[#666666] font-semibold">
                      <Heart className="w-3 h-3 text-[#A67C00]" />
                      Literature
                    </span>

                  </div>

                  {/* CONTACT */}

                  <div className="mt-6 pt-5 border-t border-[#D4AF37]/15 space-y-3">

                    <div className="flex items-center gap-3">

                      <Mail className="w-4 h-4 text-[#A67C00] shrink-0" />

                      <span className="text-xs text-[#666666]">
                        vsbliterature@gmail.com
                      </span>

                    </div>

                    <div className="flex items-start gap-3">

                      <MapPin className="w-4 h-4 text-[#A67C00] shrink-0 mt-0.5" />

                      <span className="text-xs text-[#666666] leading-5">
                        V.S.B. Engineering College
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              GOLD DIVIDER
          ================================================= */}

          <div className="relative h-px bg-[#D4AF37]/20">

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-[#FBF8EF]">

              <div className="flex items-center gap-2">

                <span className="w-5 h-px bg-[#D4AF37]/40" />

                <Sparkles className="w-3 h-3 text-[#D4AF37]" />

                <span className="w-5 h-px bg-[#D4AF37]/40" />

              </div>

            </div>

          </div>

          {/* =================================================
              BOTTOM BAR
          ================================================= */}

          <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">

            <p className="text-[10px] sm:text-[11px] text-[#888888] text-center sm:text-left">

              © {new Date().getFullYear()}{' '}

              <strong className="text-[#555555]">
                {
                  footerConfig.copyrightText
                }
              </strong>

            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">

              <span className="inline-flex items-center gap-1.5 text-[10px] text-[#888888]">

                <Sparkles className="w-3 h-3 text-[#D4AF37]" />

                {
                  footerConfig.collegeTagline
                }

              </span>

              <button
                type="button"
                onClick={() =>
                  handleNavigation(
                    'home'
                  )
                }
                className="text-[10px] text-[#777777] hover:text-[#9A7710] transition-colors cursor-pointer"
              >
                Back to Home
              </button>

            </div>

          </div>

        </div>

      </footer>

      {/* =====================================================
          BACK TO TOP
      ===================================================== */}

      {showBackToTop && (
        <button
          type="button"
          onClick={
            scrollToTop
          }
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-2xl bg-[#D4AF37] text-white shadow-[0_8px_25px_rgba(90,70,20,0.22)] hover:bg-[#C9A227] hover:-translate-y-1 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center text-lg font-bold"
          aria-label="Back to top"
          title="Back to top"
        >
          ↑
        </button>
      )}
    </>
  );
};