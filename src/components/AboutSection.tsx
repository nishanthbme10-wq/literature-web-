import {
  ArrowRight,
  Brain,
  Edit3,
  Eye,
  Feather,
  Lightbulb,
  MessageSquare,
  PenLine,
  Target,
  Users
} from 'lucide-react';
import React, { useState } from 'react';
import { User } from '../types';

import aboutBg from '../assets/images/about-bg.jpeg';

interface AboutSectionProps {
  currentUser?: User | null;
  onNavigate?: (tab: string) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  currentUser,
  onNavigate,
}) => {
  const isStaff =
    currentUser &&
    (currentUser.role === 'admin' || currentUser.role === 'coordinator');

  const [isEditing, setIsEditing] = useState(false);

  const [overview, setOverview] = useState(
    `Our Literature Club is a space where engineering minds meet creative thinking. We explore literature not just as stories and words, but as a powerful tool to think differently, communicate better, and create smarter solutions.

Through discussions, storytelling, debates, creative writing, presentations, and idea-based activities, we show how language, imagination, observation, and critical thinking can strengthen engineering skills.

Because great engineering is not only about building things — it is also about understanding people, identifying problems, communicating ideas, and imagining better possibilities.

Our goal is to help students turn ideas into innovation, thoughts into solutions, and technical knowledge into meaningful impact.`
  );

  /* =========================================================
     ENGINEERING-ORIENTED MISSION
  ========================================================== */

  const [mission, setMission] = useState(
    'To develop engineers who can think critically, communicate clearly, express ideas creatively, and approach challenges with imagination. Through literature and meaningful expression, we aim to strengthen the human, analytical, and problem-solving abilities that complement technical engineering knowledge.'
  );

  /* =========================================================
     ENGINEERING-ORIENTED VISION
  ========================================================== */

  const [vision, setVision] = useState(
    'To build a community where engineering and literature come together to shape thoughtful innovators — students who can understand people, question ideas, communicate solutions, and transform creative thinking into meaningful engineering impact.'
  );

  /* =========================================================
     ENGINEERING-ORIENTED VALUES
  ========================================================== */

  const [values, setValues] = useState(
    'Curiosity • Critical Thinking • Creativity • Clear Communication • Empathy • Collaboration • Innovation'
  );

  return (
    <section
      id="about"
      className="relative min-h-screen overflow-hidden"
    >

      {/* =====================================================
          FULL BACKGROUND IMAGE
      ====================================================== */}

      <div
        className="
          absolute
          inset-0
          bg-cover
          bg-center
          bg-no-repeat
        "
        style={{
          backgroundImage: `url(${aboutBg})`,
        }}
      />

      {/* =====================================================
          LIGHT VINTAGE FILTER
          Keeps the original image visible
      ====================================================== */}

      <div className="absolute inset-0 bg-[#F4EBDD]/15" />

      {/* =====================================================
          SOFT READABILITY GRADIENT
      ====================================================== */}

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-r
          from-[#FFFDF7]/78
          via-[#FFFDF7]/42
          to-transparent
        "
      />

      {/* =====================================================
          SOFT BOTTOM TINT
      ====================================================== */}

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-t
          from-[#172438]/18
          via-transparent
          to-transparent
        "
      />

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div
        className="
          relative
          z-10
          max-w-7xl
          mx-auto
          px-5
          sm:px-8
          lg:px-12
          py-16
          md:py-24
        "
      >

        {/* =====================================================
            EDIT BUTTON
        ====================================================== */}

        {isStaff && !isEditing && (
          <div className="flex justify-end mb-5">

            <button
              onClick={() => setIsEditing(true)}
              className="
                inline-flex
                items-center
                gap-2
                px-4
                py-2
                rounded-full
                bg-white/85
                backdrop-blur-md
                border
                border-[#D4AF37]/50
                text-[#806014]
                text-xs
                font-bold
                shadow-md
                hover:bg-white
                transition-all
                cursor-pointer
              "
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Page Content
            </button>

          </div>
        )}

        {/* =====================================================
            ABOUT INTRODUCTION
        ====================================================== */}

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-12
            gap-10
            lg:gap-16
            items-center
          "
        >

          {/* ===================================================
              LEFT CONTENT
          ==================================================== */}

          <div className="lg:col-span-7">

            {/* WHO WE ARE */}

            <div className="flex items-center gap-3 mb-5">

              <span
                className="
                  text-[11px]
                  md:text-xs
                  font-bold
                  tracking-[0.28em]
                  uppercase
                  text-[#76570E]
                "
              >
                Who We Are
              </span>

              <div className="w-14 h-[2px] bg-[#C9A227]" />

            </div>

            {/* MAIN HEADING */}

            <h1
              className="
                font-serif-title
                text-4xl
                sm:text-5xl
                md:text-6xl
                lg:text-[4rem]
                xl:text-[4.5rem]
                leading-[0.98]
                font-black
                tracking-tight
                text-[#10233F]
              "
            >
              Where Engineering
              <br />
              Meets{' '}
              <span className="text-[#C39527]">
                Expression.
              </span>
            </h1>

            {/* DIVIDER */}

            <div className="flex items-center gap-3 mt-7 mb-7">

              <div className="w-20 h-[3px] bg-[#C9A227] rounded-full" />

              <div className="w-2 h-2 rounded-full bg-[#C9A227]" />

            </div>

            {/* =================================================
                OVERVIEW
            ================================================== */}

            {isEditing ? (

              <div
                className="
                  max-w-2xl
                  bg-white/90
                  backdrop-blur-md
                  rounded-2xl
                  border
                  border-[#D4AF37]/40
                  p-5
                  shadow-xl
                "
              >

                <label
                  className="
                    block
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-[#10233F]
                    mb-3
                  "
                >
                  Club Overview
                </label>

                <textarea
                  rows={15}
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  className="
                    w-full
                    p-4
                    rounded-xl
                    border
                    border-[#D4AF37]/40
                    text-sm
                    text-[#333]
                    leading-[1.8]
                    resize-none
                    focus:outline-none
                  "
                />

              </div>

            ) : (

              <div className="space-y-5 max-w-2xl">

                <p
                  className="
                    text-[#26384D]
                    text-sm
                    md:text-base
                    leading-[1.85]
                    font-medium
                  "
                >
                  Our Literature Club is a space where{' '}
                  <strong className="text-[#10233F]">
                    engineering minds meet creative thinking
                  </strong>
                  . We explore literature not just as stories and
                  words, but as a powerful tool to{' '}
                  <strong className="text-[#10233F]">
                    think differently, communicate better, and create
                    smarter solutions
                  </strong>
                  .
                </p>

                <p
                  className="
                    text-[#26384D]
                    text-sm
                    md:text-base
                    leading-[1.85]
                    font-medium
                  "
                >
                  Through discussions, storytelling, debates,
                  creative writing, presentations, and idea-based
                  activities, we show how{' '}
                  <strong className="text-[#10233F]">
                    language, imagination, observation, and critical
                    thinking can strengthen engineering skills
                  </strong>
                  .
                </p>

                <p
                  className="
                    text-[#26384D]
                    text-sm
                    md:text-base
                    leading-[1.85]
                    font-medium
                  "
                >
                  Because great engineering is not only about
                  building things — it is also about{' '}
                  <strong className="text-[#10233F]">
                    understanding people, identifying problems,
                    communicating ideas, and imagining better
                    possibilities
                  </strong>
                  .
                </p>

                <p
                  className="
                    text-[#26384D]
                    text-sm
                    md:text-base
                    leading-[1.85]
                    font-medium
                  "
                >
                  Our goal is to help students turn{' '}
                  <strong className="text-[#10233F]">
                    ideas into innovation, thoughts into solutions,
                    and technical knowledge into meaningful impact
                  </strong>
                  .
                </p>

              </div>

            )}

            {/* DEPARTMENTS */}

            <div className="flex flex-wrap gap-3 mt-7">

              <span
                className="
                  px-4
                  py-2
                  rounded-full
                  bg-white/80
                  backdrop-blur-md
                  border
                  border-[#C9A227]/50
                  text-xs
                  md:text-sm
                  font-semibold
                  text-[#263B59]
                  shadow-sm
                "
              >
                Biomedical Engineering
              </span>

              <span
                className="
                  px-4
                  py-2
                  rounded-full
                  bg-white/80
                  backdrop-blur-md
                  border
                  border-[#C9A227]/50
                  text-xs
                  md:text-sm
                  font-semibold
                  text-[#263B59]
                  shadow-sm
                "
              >
                Biotechnology
              </span>

            </div>

            {/* JOIN */}

            <button
              type="button"
              onClick={() => onNavigate?.('contact')}
              className="
                group
                mt-8
                flex
                w-fit
                flex-row
                items-center
                justify-center
                gap-3
                whitespace-nowrap
                px-6
                py-3.5
                rounded-full
                bg-gradient-to-r
                from-[#D4AF37]
                to-[#B8891C]
                text-white
                font-semibold
                text-sm
                shadow-[0_8px_25px_rgba(180,135,25,0.28)]
                hover:shadow-[0_12px_30px_rgba(180,135,25,0.4)]
                hover:-translate-y-1
                transition-all
                duration-300
                cursor-pointer
              "
            >

              <Users className="w-4 h-4 shrink-0" />

              <span className="whitespace-nowrap">
                Join Our Journey
              </span>

              <ArrowRight
                className="
                  w-4
                  h-4
                  shrink-0
                  group-hover:translate-x-1
                  transition-transform
                "
              />

            </button>

          </div>

          {/* ===================================================
              RIGHT QUOTE
          ==================================================== */}

          <div className="lg:col-span-5 flex justify-center">

            <div
              className="
                relative
                w-full
                max-w-sm
                min-h-[360px]
                rounded-[30px]
                overflow-hidden
                bg-[#101923]/78
                backdrop-blur-sm
                border
                border-white/30
                shadow-[0_25px_70px_rgba(16,35,63,0.25)]
              "
            >

              <div
                className="
                  absolute
                  inset-0
                  bg-cover
                  bg-center
                  opacity-20
                "
                style={{
                  backgroundImage: `url(${aboutBg})`,
                }}
              />

              <div className="absolute inset-0 bg-[#0B1727]/65" />

              <div
                className="
                  relative
                  z-10
                  min-h-[360px]
                  flex
                  items-end
                  p-7
                  md:p-8
                "
              >

                <div>

                  <div
                    className="
                      text-[#D4AF37]
                      font-serif-title
                      text-6xl
                      leading-none
                      mb-3
                    "
                  >
                    “
                  </div>

                  <p
                    className="
                      font-serif-body
                      text-white
                      text-2xl
                      md:text-3xl
                      italic
                      leading-[1.3]
                    "
                  >
                    A good engineer
                    <br />
                    solves problems.
                    <br />
                    A good writer
                    <br />
                    understands them.
                  </p>

                  <div className="w-14 h-[2px] bg-[#D4AF37] mt-6 mb-5" />

                  <p
                    className="
                      text-[9px]
                      uppercase
                      tracking-[0.2em]
                      leading-relaxed
                      text-white/75
                      font-semibold
                    "
                  >
                    V.S.B. Engineering College
                    <br />
                    Literature Club
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            MISSION / VISION / VALUES
        ====================================================== */}

        <div className="mt-24 md:mt-32">

          <div className="text-center max-w-3xl mx-auto mb-10">

            <div className="flex items-center justify-center gap-3 mb-4">

              <div className="w-12 h-[2px] bg-[#C9A227]" />

              <span
                className="
                  text-[11px]
                  font-bold
                  tracking-[0.25em]
                  uppercase
                  text-[#76570E]
                "
              >
                Our Direction
              </span>

              <div className="w-12 h-[2px] bg-[#C9A227]" />

            </div>

            <h2
              className="
                font-serif-title
                text-3xl
                sm:text-4xl
                md:text-5xl
                font-black
                text-[#10233F]
              "
            >
              Think Beyond the Textbook
            </h2>

            <p
              className="
                mt-4
                text-sm
                md:text-base
                text-[#46576A]
                leading-relaxed
                font-medium
              "
            >
              We believe strong engineers need more than technical
              knowledge. They need curiosity, communication,
              imagination, empathy, and the ability to see problems
              from different perspectives.
            </p>

          </div>

          {/* =================================================
              THREE CARDS
          ================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* =================================================
                MISSION
            ================================================== */}

            <div
              className="
                bg-white/86
                backdrop-blur-md
                rounded-3xl
                p-7
                md:p-8
                border
                border-[#D4AF37]/30
                shadow-[0_12px_40px_rgba(16,35,63,0.10)]
                hover:-translate-y-1
                hover:bg-white/95
                transition-all
                duration-300
              "
            >

              <div
                className="
                  w-14
                  h-14
                  rounded-full
                  bg-[#F5D77D]/55
                  flex
                  items-center
                  justify-center
                  mb-6
                "
              >
                <Target
                  className="w-7 h-7 text-[#A97C12]"
                  strokeWidth={1.7}
                />
              </div>

              <h3
                className="
                  font-serif-title
                  text-xl
                  md:text-2xl
                  font-bold
                  text-[#10233F]
                "
              >
                Our Mission
              </h3>

              <div className="w-10 h-[2px] bg-[#D4AF37] my-4" />

              {isEditing ? (

                <textarea
                  rows={8}
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  className="
                    w-full
                    p-3
                    rounded-xl
                    border
                    border-[#D4AF37]/40
                    text-sm
                    leading-relaxed
                    focus:outline-none
                  "
                />

              ) : (

                <p
                  className="
                    text-[#596675]
                    text-sm
                    md:text-base
                    leading-[1.75]
                  "
                >
                  To develop engineers who can{' '}
                  <strong className="text-[#10233F]">
                    think critically, communicate clearly, express
                    ideas creatively, and approach challenges with
                    imagination
                  </strong>
                  . Through literature and meaningful expression,
                  we aim to strengthen the human, analytical, and
                  problem-solving abilities that complement
                  technical engineering knowledge.
                </p>

              )}

            </div>

            {/* =================================================
                VISION
            ================================================== */}

            <div
              className="
                bg-white/86
                backdrop-blur-md
                rounded-3xl
                p-7
                md:p-8
                border
                border-[#D4AF37]/30
                shadow-[0_12px_40px_rgba(16,35,63,0.10)]
                hover:-translate-y-1
                hover:bg-white/95
                transition-all
                duration-300
              "
            >

              <div
                className="
                  w-14
                  h-14
                  rounded-full
                  bg-[#F5D77D]/55
                  flex
                  items-center
                  justify-center
                  mb-6
                "
              >
                <Eye
                  className="w-7 h-7 text-[#A97C12]"
                  strokeWidth={1.7}
                />
              </div>

              <h3
                className="
                  font-serif-title
                  text-xl
                  md:text-2xl
                  font-bold
                  text-[#10233F]
                "
              >
                Our Vision
              </h3>

              <div className="w-10 h-[2px] bg-[#D4AF37] my-4" />

              {isEditing ? (

                <textarea
                  rows={8}
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  className="
                    w-full
                    p-3
                    rounded-xl
                    border
                    border-[#D4AF37]/40
                    text-sm
                    leading-relaxed
                    focus:outline-none
                  "
                />

              ) : (

                <p
                  className="
                    text-[#596675]
                    text-sm
                    md:text-base
                    leading-[1.75]
                  "
                >
                  To build a community where{' '}
                  <strong className="text-[#10233F]">
                    engineering and literature come together to
                    shape thoughtful innovators
                  </strong>
                  {' '}— students who can understand people,
                  question ideas, communicate solutions, and
                  transform creative thinking into meaningful
                  engineering impact.
                </p>

              )}

            </div>

            {/* =================================================
                VALUES
            ================================================== */}

            <div
              className="
                bg-white/86
                backdrop-blur-md
                rounded-3xl
                p-7
                md:p-8
                border
                border-[#D4AF37]/30
                shadow-[0_12px_40px_rgba(16,35,63,0.10)]
                hover:-translate-y-1
                hover:bg-white/95
                transition-all
                duration-300
              "
            >

              <div
                className="
                  w-14
                  h-14
                  rounded-full
                  bg-[#F5D77D]/55
                  flex
                  items-center
                  justify-center
                  mb-6
                "
              >
                <Lightbulb
                  className="w-7 h-7 text-[#A97C12]"
                  strokeWidth={1.7}
                />
              </div>

              <h3
                className="
                  font-serif-title
                  text-xl
                  md:text-2xl
                  font-bold
                  text-[#10233F]
                "
              >
                Our Values
              </h3>

              <div className="w-10 h-[2px] bg-[#D4AF37] my-4" />

              {isEditing ? (

                <textarea
                  rows={8}
                  value={values}
                  onChange={(e) => setValues(e.target.value)}
                  className="
                    w-full
                    p-3
                    rounded-xl
                    border
                    border-[#D4AF37]/40
                    text-sm
                    leading-relaxed
                    focus:outline-none
                  "
                />

              ) : (

                <div
                  className="
                    text-[#596675]
                    text-sm
                    md:text-base
                    leading-[2]
                  "
                >

                  <p>
                    <span className="text-[#C39527] mr-2">•</span>
                    <strong className="text-[#10233F]">
                      Curiosity
                    </strong>
                    {' '}— Questioning, exploring, and learning.
                  </p>

                  <p>
                    <span className="text-[#C39527] mr-2">•</span>
                    <strong className="text-[#10233F]">
                      Critical Thinking
                    </strong>
                    {' '}— Looking beyond the obvious.
                  </p>

                  <p>
                    <span className="text-[#C39527] mr-2">•</span>
                    <strong className="text-[#10233F]">
                      Creativity
                    </strong>
                    {' '}— Imagining new possibilities.
                  </p>

                  <p>
                    <span className="text-[#C39527] mr-2">•</span>
                    <strong className="text-[#10233F]">
                      Communication
                    </strong>
                    {' '}— Expressing ideas with clarity.
                  </p>

                  <p>
                    <span className="text-[#C39527] mr-2">•</span>
                    <strong className="text-[#10233F]">
                      Empathy
                    </strong>
                    {' '}— Understanding people behind problems.
                  </p>

                  <p>
                    <span className="text-[#C39527] mr-2">•</span>
                    <strong className="text-[#10233F]">
                      Collaboration
                    </strong>
                    {' '}— Building ideas together.
                  </p>

                  <p>
                    <span className="text-[#C39527] mr-2">•</span>
                    <strong className="text-[#10233F]">
                      Innovation
                    </strong>
                    {' '}— Turning ideas into meaningful impact.
                  </p>

                </div>

              )}

            </div>

          </div>

        </div>

        {/* =====================================================
            WHAT WE ENCOURAGE
        ====================================================== */}

        <div className="mt-24 md:mt-28">

          <div className="text-center max-w-3xl mx-auto mb-10">

            <div className="flex items-center justify-center gap-3 mb-4">

              <div className="w-12 h-[2px] bg-[#C9A227]" />

              <span
                className="
                  text-[11px]
                  font-bold
                  tracking-[0.25em]
                  uppercase
                  text-[#76570E]
                "
              >
                What We Encourage
              </span>

              <div className="w-12 h-[2px] bg-[#C9A227]" />

            </div>

            <h2
              className="
                font-serif-title
                text-3xl
                md:text-4xl
                font-black
                text-[#10233F]
              "
            >
              From Words to Ideas
            </h2>

            <p
              className="
                mt-4
                text-sm
                md:text-base
                text-[#46576A]
                leading-relaxed
                font-medium
              "
            >
              We use literature as a bridge between imagination
              and engineering — helping students become better
              thinkers, communicators, creators, and problem solvers.
            </p>

          </div>

          {/* =================================================
              FOUR ENGINEERING + LITERATURE AREAS
          ================================================== */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* THINK */}

            <div
              className="
                bg-white/86
                backdrop-blur-md
                rounded-2xl
                p-6
                border
                border-[#D4AF37]/25
                text-center
                shadow-[0_8px_30px_rgba(16,35,63,0.08)]
                hover:-translate-y-1
                hover:bg-white/95
                transition-all
                duration-300
              "
            >

              <div
                className="
                  w-12
                  h-12
                  rounded-full
                  bg-[#F5D77D]/55
                  mx-auto
                  flex
                  items-center
                  justify-center
                  mb-4
                "
              >
                <Brain className="w-6 h-6 text-[#A97C12]" />
              </div>

              <h4
                className="
                  font-serif-title
                  font-bold
                  text-base
                  text-[#10233F]
                "
              >
                Think Differently
              </h4>

              <p
                className="
                  text-xs
                  text-[#68717C]
                  leading-relaxed
                  mt-3
                "
              >
                Literature encourages students to question,
                observe, analyse, and look at problems from
                multiple perspectives.
              </p>

            </div>

            {/* COMMUNICATE */}

            <div
              className="
                bg-white/86
                backdrop-blur-md
                rounded-2xl
                p-6
                border
                border-[#D4AF37]/25
                text-center
                shadow-[0_8px_30px_rgba(16,35,63,0.08)]
                hover:-translate-y-1
                hover:bg-white/95
                transition-all
                duration-300
              "
            >

              <div
                className="
                  w-12
                  h-12
                  rounded-full
                  bg-[#F5D77D]/55
                  mx-auto
                  flex
                  items-center
                  justify-center
                  mb-4
                "
              >
                <MessageSquare className="w-6 h-6 text-[#A97C12]" />
              </div>

              <h4
                className="
                  font-serif-title
                  font-bold
                  text-base
                  text-[#10233F]
                "
              >
                Communicate Clearly
              </h4>

              <p
                className="
                  text-xs
                  text-[#68717C]
                  leading-relaxed
                  mt-3
                "
              >
                Strong ideas become meaningful solutions only when
                they can be explained, discussed, and understood.
              </p>

            </div>

            {/* CREATE */}

            <div
              className="
                bg-white/86
                backdrop-blur-md
                rounded-2xl
                p-6
                border
                border-[#D4AF37]/25
                text-center
                shadow-[0_8px_30px_rgba(16,35,63,0.08)]
                hover:-translate-y-1
                hover:bg-white/95
                transition-all
                duration-300
              "
            >

              <div
                className="
                  w-12
                  h-12
                  rounded-full
                  bg-[#F5D77D]/55
                  mx-auto
                  flex
                  items-center
                  justify-center
                  mb-4
                "
              >
                <PenLine className="w-6 h-6 text-[#A97C12]" />
              </div>

              <h4
                className="
                  font-serif-title
                  font-bold
                  text-base
                  text-[#10233F]
                "
              >
                Create & Express
              </h4>

              <p
                className="
                  text-xs
                  text-[#68717C]
                  leading-relaxed
                  mt-3
                "
              >
                Writing, storytelling, poetry, presentations, and
                creative activities turn thoughts into tangible ideas.
              </p>

            </div>

            {/* SOLVE */}

            <div
              className="
                bg-white/86
                backdrop-blur-md
                rounded-2xl
                p-6
                border
                border-[#D4AF37]/25
                text-center
                shadow-[0_8px_30px_rgba(16,35,63,0.08)]
                hover:-translate-y-1
                hover:bg-white/95
                transition-all
                duration-300
              "
            >

              <div
                className="
                  w-12
                  h-12
                  rounded-full
                  bg-[#F5D77D]/55
                  mx-auto
                  flex
                  items-center
                  justify-center
                  mb-4
                "
              >
                <Lightbulb className="w-6 h-6 text-[#A97C12]" />
              </div>

              <h4
                className="
                  font-serif-title
                  font-bold
                  text-base
                  text-[#10233F]
                "
              >
                Imagine & Solve
              </h4>

              <p
                className="
                  text-xs
                  text-[#68717C]
                  leading-relaxed
                  mt-3
                "
              >
                Connecting imagination with engineering thinking
                to approach challenges creatively and develop
                meaningful solutions.
              </p>

            </div>

          </div>

        </div>

        {/* =====================================================
            CLOSING STATEMENT
        ====================================================== */}

        <div
          className="
            max-w-4xl
            mx-auto
            text-center
            mt-20
            md:mt-24
            px-6
            py-10
            bg-[#10233F]/90
            backdrop-blur-md
            rounded-[28px]
            border
            border-[#D4AF37]/35
            shadow-2xl
          "
        >

          <Feather
            className="
              w-7
              h-7
              text-[#D4AF37]
              mx-auto
              mb-4
            "
          />

          <p
            className="
              font-serif-title
              text-2xl
              md:text-3xl
              text-white
              leading-relaxed
            "
          >
            “Engineering builds what is possible.
            <br />
            Literature helps us imagine what is meaningful.”
          </p>

          <div className="w-14 h-[2px] bg-[#D4AF37] mx-auto mt-6" />

        </div>

        {/* =====================================================
            EDIT CONTROLS
        ====================================================== */}

        {isEditing && (

          <div
            className="
              flex
              justify-center
              gap-3
              mt-12
              pt-8
              border-t
              border-[#D4AF37]/25
            "
          >

            <button
              onClick={() => setIsEditing(false)}
              className="
                px-5
                py-2.5
                rounded-xl
                border
                border-gray-300
                bg-white
                text-gray-600
                text-xs
                font-bold
                hover:bg-gray-50
                transition
                cursor-pointer
              "
            >
              Cancel Edits
            </button>

            <button
              onClick={() => setIsEditing(false)}
              className="
                px-6
                py-2.5
                rounded-xl
                bg-gradient-to-r
                from-[#D4AF37]
                to-[#B8891C]
                text-white
                text-xs
                font-bold
                shadow-md
                hover:shadow-lg
                transition
                cursor-pointer
              "
            >
              Save Section Content
            </button>

          </div>

        )}

      </div>

    </section>
  );
};