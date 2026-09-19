import React from 'react';
import {
  BookOpen,
  ArrowRight,
  CalendarDays,
  Images,
  Sparkles,
  PenLine,
  Mic2,
  Star,
} from 'lucide-react';
import { HeaderConfig } from '../types';

import collegeImage from '../assets/images/vsb-college.jpeg';

interface HeroSectionProps {
  headerConfig: HeaderConfig;
  onExploreWorkshops: () => void;
  onQuickRegister: () => void;
  onViewGallery: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  headerConfig,
  onExploreWorkshops,
  onQuickRegister,
  onViewGallery,
}) => {
  return (
    <section className="relative min-h-[calc(100vh-120px)] md:min-h-[calc(100vh-130px)] overflow-hidden bg-[#071426] text-white">

      {/* =========================================================
          COLLEGE IMAGE
      ========================================================== */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${collegeImage})`,
        }}
      />

      {/* =========================================================
          CINEMATIC DARK OVERLAY
          Darker on left for text readability
      ========================================================== */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#050b14]/95 via-[#071426]/70 to-[#071426]/15" />

      {/* =========================================================
          SECOND OVERLAY
          Gives the complete image a warm premium appearance
      ========================================================== */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050b14]/85 via-transparent to-[#050b14]/10" />

      {/* =========================================================
          SUBTLE GOLD GLOW
      ========================================================== */}
      <div className="absolute left-[-180px] bottom-[-180px] w-[500px] h-[500px] rounded-full bg-[#D4AF37]/10 blur-[100px] pointer-events-none" />

      <div className="absolute right-[-150px] top-[-150px] w-[400px] h-[400px] rounded-full bg-[#D4AF37]/5 blur-[100px] pointer-events-none" />

      {/* =========================================================
          MAIN CONTENT
      ========================================================== */}
      <div className="relative z-10 min-h-[calc(100vh-120px)] md:min-h-[calc(100vh-130px)] flex items-center">

        <div className="w-full max-w-[1500px] mx-auto px-6 sm:px-10 md:px-14 lg:px-16 xl:px-20 py-16 md:py-20">

          <div className="max-w-5xl">

            {/* =====================================================
                COLLEGE BADGE
            ====================================================== */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-[#D4AF37] bg-[#071426]/50 backdrop-blur-sm shadow-lg mb-7">

              <Sparkles
                className="w-5 h-5 text-[#F4D77B]"
                strokeWidth={1.8}
              />

              <span className="text-sm md:text-base font-serif-title font-semibold tracking-wide text-white">
                V.S.B. Engineering College
              </span>

            </div>

            {/* =====================================================
                CLUB NAME
            ====================================================== */}
            <h1 className="font-serif-title font-black leading-[0.95] tracking-[-0.035em] text-[3.5rem] sm:text-[5rem] md:text-[6rem] lg:text-[8rem]">

              <span className="text-white block md:inline whitespace-nowrap">
                Literature
              </span>

              <span className="text-[#F2C94C] block md:inline whitespace-nowrap">
                Club
              </span>

            </h1>

            {/* =====================================================
                DEPARTMENT LINE
            ====================================================== */}
            <div className="mt-5">

              <p className="font-serif-title text-xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-semibold text-white leading-tight">

                <span className="block sm:inline">
                  Biomedical Engineering
                </span>

                <span className="text-[#D4AF37] mx-2">
                  &
                </span>

                <span className="block sm:inline">
                  Biotechnology
                </span>

              </p>

            </div>

            {/* =====================================================
                GOLD DIVIDER
            ====================================================== */}
            <div className="flex items-center gap-4 mt-7 mb-7">

              <div className="w-28 md:w-36 h-[3px] bg-[#D4AF37]" />

              <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />

            </div>

            {/* =====================================================
                TAGLINE
            ====================================================== */}
            <p className="font-serif-body italic font-semibold text-[#F5D77A] text-xl sm:text-2xl md:text-3xl lg:text-[2rem] leading-relaxed mb-5 drop-shadow-lg">
              “{headerConfig.heroSlogan || 'Engineering Minds, Literary Souls.'}”
            </p>

            {/* =====================================================
                INTRODUCTION
            ====================================================== */}
            <p className="font-serif-body text-base sm:text-lg md:text-xl lg:text-[1.25rem] leading-relaxed text-white/95 max-w-4xl drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)]">
              {headerConfig.heroSubtext ||
                'Where engineering minds meet the power of words, imagination finds its voice. We build with logic, create with creativity, and express with stories.'}
            </p>

            {/* =====================================================
                ACTION BUTTONS
            ====================================================== */}
            <div className="flex flex-wrap items-center gap-4 mt-9">

              {/* QUICK REGISTER */}
              <button
                onClick={onQuickRegister}
                className="
                  group
                  inline-flex
                  items-center
                  gap-3
                  px-6
                  md:px-8
                  py-4
                  rounded-full
                  bg-gradient-to-r
                  from-[#F6D365]
                  via-[#E9BE45]
                  to-[#C99824]
                  text-[#081426]
                  font-serif-title
                  font-bold
                  text-sm
                  md:text-base
                  shadow-[0_8px_30px_rgba(212,175,55,0.25)]
                  hover:shadow-[0_12px_40px_rgba(212,175,55,0.45)]
                  hover:-translate-y-1
                  transition-all
                  duration-300
                  border
                  border-[#F8E7A0]
                  cursor-pointer
                "
              >
                <BookOpen
                  className="w-5 h-5"
                  strokeWidth={2}
                />

                <span>
                  Quick Workshop Register
                </span>

                <ArrowRight
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                />
              </button>

              {/* EXPLORE WORKSHOPS */}
              <button
                onClick={onExploreWorkshops}
                className="
                  group
                  inline-flex
                  items-center
                  gap-3
                  px-6
                  md:px-8
                  py-4
                  rounded-full
                  bg-white/5
                  backdrop-blur-md
                  border
                  border-white/80
                  text-white
                  font-serif-title
                  font-bold
                  text-sm
                  md:text-base
                  hover:bg-white/15
                  hover:border-[#F0CC62]
                  hover:text-[#F8D96B]
                  hover:-translate-y-1
                  transition-all
                  duration-300
                  cursor-pointer
                "
              >
                <CalendarDays
                  className="w-5 h-5"
                  strokeWidth={1.8}
                />

                <span>
                  Explore Workshops
                </span>
              </button>

              {/* GALLERY */}
              <button
                onClick={onViewGallery}
                className="
                  group
                  inline-flex
                  items-center
                  gap-2
                  px-2
                  py-3
                  text-[#F5D77A]
                  font-serif-title
                  font-semibold
                  text-sm
                  md:text-base
                  hover:text-white
                  transition-colors
                  duration-300
                  cursor-pointer
                "
              >
                <Images className="w-5 h-5" />

                <span className="border-b border-[#D4AF37] pb-1">
                  View Photo Gallery
                </span>
              </button>

            </div>

            {/* =====================================================
                FEATURE AREA
            ====================================================== */}
            <div className="mt-10 md:mt-12 pt-7 border-t border-white/30 max-w-5xl">

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0">

                {/* CREATIVE WRITING */}
                <div className="flex items-center gap-3 md:pr-8 md:border-r md:border-[#D4AF37]/50">

                  <div className="shrink-0">

                    <PenLine
                      className="w-9 h-9 md:w-10 md:h-10 text-[#F4C84A]"
                      strokeWidth={1.5}
                    />

                  </div>

                  <div>
                    <p className="font-serif-body text-sm md:text-base text-white font-semibold">
                      Creative Writing
                    </p>
                  </div>

                </div>

                {/* PUBLIC SPEAKING */}
                <div className="flex items-center gap-3 md:px-8 md:border-r md:border-[#D4AF37]/50">

                  <div className="shrink-0">

                    <Mic2
                      className="w-9 h-9 md:w-10 md:h-10 text-[#F4C84A]"
                      strokeWidth={1.5}
                    />

                  </div>

                  <div>
                    <p className="font-serif-body text-sm md:text-base text-white font-semibold">
                      Public Speaking
                    </p>
                  </div>

                </div>

                {/* LITERARY EVENTS */}
                <div className="flex items-center gap-3 md:px-8 md:border-r md:border-[#D4AF37]/50">

                  <div className="shrink-0">

                    <BookOpen
                      className="w-9 h-9 md:w-10 md:h-10 text-[#F4C84A]"
                      strokeWidth={1.5}
                    />

                  </div>

                  <div>
                    <p className="font-serif-body text-sm md:text-base text-white font-semibold">
                      Literary Events
                    </p>
                  </div>

                </div>

                {/* STUDENT CREATIVITY */}
                <div className="flex items-center gap-3 md:pl-8">

                  <div className="shrink-0">

                    <Star
                      className="w-9 h-9 md:w-10 md:h-10 text-[#F4C84A]"
                      strokeWidth={1.5}
                    />

                  </div>

                  <div>
                    <p className="font-serif-body text-sm md:text-base text-white font-semibold">
                      Student Creativity
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      </div>

      {/* =========================================================
          BOTTOM RIGHT QUOTE
      ========================================================== */}
      <div className="
        absolute
        right-6
        md:right-10
        lg:right-16
        xl:right-20
        bottom-7
        md:bottom-10
        hidden
        lg:flex
        items-center
        gap-4
        z-20
      ">

        <div className="w-16 md:w-20 h-[2px] bg-[#D4AF37]" />

        <p className="font-serif-body italic text-[#F3D77A] text-sm md:text-base lg:text-lg">
          “Ideas. Words. Impact.”
        </p>

      </div>

      {/* =========================================================
          BOTTOM FADE
      ========================================================== */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#050b14]/60 to-transparent pointer-events-none" />

    </section>
  );
};