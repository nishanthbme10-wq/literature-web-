import React from 'react';
import { BookOpen, Sparkles, Award, Users, FileText, ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';
import { HeaderConfig, Workshop } from '../types';

interface HeroBannerProps {
  headerConfig: HeaderConfig;
  upcomingWorkshop?: Workshop;
  onRegisterClick: () => void;
  onDownloadCertificateClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  headerConfig,
  upcomingWorkshop,
  onRegisterClick,
  onDownloadCertificateClick,
}) => {
  return (
    <section className="relative bg-[#0A1F5A] text-[#F8F6F0] overflow-hidden border-b-4 border-[#C9A24B] shadow-2xl">
      {/* Decorative Radial Grid Pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #C9A24B 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Hero Slogan & Call To Action */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7A102A]/80 border border-[#C9A24B]/50 text-[#F8F6F0] text-xs font-bold tracking-wider uppercase shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A24B] animate-spin" />
              <span>OFFICIAL COLLEGE LITERARY PORTAL</span>
            </div>

            <h1 className="font-serif-title text-3xl sm:text-5xl font-black text-[#F8F6F0] tracking-tight leading-tight">
              Elevating Minds through the Written Word
            </h1>

            <p className="font-serif-body text-xl sm:text-2xl text-[#C9A24B] italic font-semibold border-l-4 border-[#7A102A] pl-4 py-1 max-w-2xl">
              “{headerConfig.heroSlogan}”
            </p>

            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed max-w-2xl font-normal opacity-90">
              {headerConfig.heroSubtext}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onRegisterClick}
                className="flex items-center gap-2 px-6 py-3 bg-[#C9A24B] hover:bg-[#C9A24B]/90 text-[#0A1F5A] font-bold text-sm rounded-full shadow-lg hover:shadow-xl transition-all border border-[#0A1F5A]/20 hover:scale-[1.02]"
              >
                <BookOpen className="w-4 h-4" />
                <span>Register for Next Workshop</span>
              </button>

              <button
                onClick={onDownloadCertificateClick}
                className="flex items-center gap-2 px-6 py-3 border-2 border-[#C9A24B] text-[#C9A24B] hover:bg-[#C9A24B] hover:text-[#0A1F5A] font-bold text-sm rounded-full transition-all shadow-md"
              >
                <Award className="w-4 h-4" />
                <span>Download E-Certificate</span>
              </button>
            </div>
          </div>

          {/* Featured Upcoming Workshop Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#F8F6F0] text-[#0A1F5A] rounded-2xl border-2 border-[#C9A24B] shadow-2xl p-6 relative overflow-hidden group">
              
              <div className="flex items-center justify-between border-b border-[#C9A24B]/30 pb-3 mb-4">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A102A] bg-[#7A102A]/10 px-2.5 py-1 rounded">
                  UPCOMING ANNOUNCEMENT
                </span>
                <span className="text-xs font-bold text-[#0A1F5A] bg-[#C9A24B]/20 px-2.5 py-1 rounded-full border border-[#C9A24B]">
                  {upcomingWorkshop?.status || 'Open'}
                </span>
              </div>

              <h3 className="font-serif-title text-lg sm:text-xl font-black text-[#0A1F5A] mb-2 leading-snug">
                {upcomingWorkshop?.title || 'Masterclass on Academic & Research Paper Writing'}
              </h3>

              <div className="space-y-2 text-xs text-gray-700 mb-4">
                <p><strong>📅 Date & Time:</strong> {upcomingWorkshop?.dateTime || 'August 25, 2026 at 10:00 AM'}</p>
                <p><strong>📍 Venue:</strong> {upcomingWorkshop?.venue || 'Main Auditorium, VSBEC'}</p>
                <p><strong>🎙️ Resource Person:</strong> {upcomingWorkshop?.resourcePerson || 'Dr. S. Ranganathan'}</p>
              </div>

              <p className="text-xs text-gray-600 line-clamp-2 mb-4 italic">
                {upcomingWorkshop?.description || 'Learn IEEE paper structure, LaTeX layout, avoiding plagiarism, and journal submissions.'}
              </p>

              <button
                onClick={onRegisterClick}
                className="w-full py-2.5 bg-[#7A102A] hover:bg-[#0A1F5A] text-[#F8F6F0] font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-all flex items-center justify-center gap-2 border border-[#C9A24B]"
              >
                <span>Quick Register via Google Form</span>
                <ArrowRight className="w-4 h-4 text-[#C9A24B]" />
              </button>

            </div>
          </div>

        </div>

        {/* Quick Highlights Counter Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t border-[#C9A24B]/30">
          <div className="bg-white/10 backdrop-blur-md border border-[#C9A24B]/30 rounded-xl p-4 text-center">
            <Users className="w-6 h-6 text-[#C9A24B] mx-auto mb-1" />
            <p className="text-2xl font-extrabold font-serif-title text-[#F8F6F0]">450+</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#C9A24B]">Active Student Members</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-[#C9A24B]/30 rounded-xl p-4 text-center">
            <BookOpen className="w-6 h-6 text-[#C9A24B] mx-auto mb-1" />
            <p className="text-2xl font-extrabold font-serif-title text-[#F8F6F0]">28+</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#C9A24B]">Workshops Conducted</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-[#C9A24B]/30 rounded-xl p-4 text-center">
            <Award className="w-6 h-6 text-[#C9A24B] mx-auto mb-1" />
            <p className="text-2xl font-extrabold font-serif-title text-[#F8F6F0]">1,200+</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#C9A24B]">E-Certificates Generated</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-[#C9A24B]/30 rounded-xl p-4 text-center">
            <ShieldCheck className="w-6 h-6 text-[#C9A24B] mx-auto mb-1" />
            <p className="text-2xl font-extrabold font-serif-title text-[#F8F6F0]">100%</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#C9A24B]">Official College Seal</p>
          </div>
        </div>

      </div>
    </section>
  );
};
