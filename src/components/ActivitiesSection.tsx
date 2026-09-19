import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Calendar,
  Sparkles,
  RefreshCw,
  ArrowUpRight,
  ImageOff,
} from 'lucide-react';

import { MonthlyActivity } from '../types';
import { listContent } from '../services/contentManagement';

interface ActivitiesSectionProps {
  activities?: MonthlyActivity[];
}

export const ActivitiesSection: React.FC<
  ActivitiesSectionProps
> = ({
  activities: initialActivities = [],
}) => {
  /* =====================================================
     FILTER STATE
  ===================================================== */

  const [filter, setFilter] = useState<
    'all' | 'current' | 'previous'
  >('all');

  /* =====================================================
     FIREBASE STATE
  ===================================================== */

  const [
    firebaseActivities,
    setFirebaseActivities,
  ] = useState<MonthlyActivity[]>([]);

  const [
    loadingActivities,
    setLoadingActivities,
  ] = useState(true);

  const [
    activityError,
    setActivityError,
  ] = useState('');

  /* =====================================================
     LOAD ACTIVITIES
  ===================================================== */

  const loadActivities = async () => {
    setLoadingActivities(true);
    setActivityError('');

    try {
      const result =
        await listContent(
          'monthlyActivities'
        );

      const activeActivities =
        result
          .filter(
            (item: any) =>
              item.active !== false
          )
          .map(
            (item: any) => ({
              id: item.id,
              title:
                item.title || '',
              date:
                item.date || '',
              category:
                item.category || '',
              summary:
                item.summary || '',
              imageUrl:
                item.imageUrl || '',
              isPreviousMonth:
                item.isPreviousMonth ===
                true,
            })
          ) as MonthlyActivity[];

      setFirebaseActivities(
        activeActivities
      );
    } catch (error) {
      console.error(
        'Unable to load monthly activities:',
        error
      );

      setFirebaseActivities([]);

      setActivityError(
        'Unable to load the latest activities.'
      );
    } finally {
      setLoadingActivities(false);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    void loadActivities();
  }, []);

  /* =====================================================
     DATA SOURCE
  ===================================================== */

  const activities =
    useMemo<MonthlyActivity[]>(
      () => {
        if (
          firebaseActivities.length >
          0
        ) {
          return firebaseActivities;
        }

        return initialActivities;
      },
      [
        firebaseActivities,
        initialActivities,
      ]
    );

  /* =====================================================
     FILTER
  ===================================================== */

  const filtered =
    useMemo(
      () =>
        activities.filter(
          (activity) => {
            if (
              filter ===
              'current'
            ) {
              return !activity.isPreviousMonth;
            }

            if (
              filter ===
              'previous'
            ) {
              return (
                activity.isPreviousMonth
              );
            }

            return true;
          }
        ),
      [activities, filter]
    );

  /* =====================================================
     EMPTY MESSAGE
  ===================================================== */

  const emptyTitle =
    filter === 'current'
      ? 'No current month activities'
      : filter === 'previous'
        ? 'No previous month highlights'
        : 'No monthly activities yet';

  const emptyDescription =
    filter === 'current'
      ? 'Current month activity highlights will appear here.'
      : filter === 'previous'
        ? 'Previous month highlights will appear here.'
        : 'New Literature Club activity highlights will appear here.';

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <section
      id="activities"
      className="relative overflow-hidden bg-[#FBFAF6] text-[#171717] px-4 sm:px-6 py-16 md:py-24 border-t border-[#D4AF37]/20"
    >

      {/* =================================================
          ANIMATION STYLES
      ================================================= */}

      <style>
        {`
          @keyframes activitiesGlow {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1);
              opacity: 0.35;
            }

            50% {
              transform: translate3d(18px, 10px, 0) scale(1.08);
              opacity: 0.55;
            }
          }

          @keyframes activitiesGlowTwo {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1);
              opacity: 0.2;
            }

            50% {
              transform: translate3d(-15px, -12px, 0) scale(1.1);
              opacity: 0.4;
            }
          }

          @keyframes activitiesShimmer {
            0% {
              transform: translateX(-120%);
            }

            100% {
              transform: translateX(120%);
            }
          }

          @keyframes activitiesFloat {
            0%, 100% {
              transform: translateY(0);
            }

            50% {
              transform: translateY(-4px);
            }
          }

          .activities-glow {
            animation: activitiesGlow 10s ease-in-out infinite;
          }

          .activities-glow-two {
            animation: activitiesGlowTwo 12s ease-in-out infinite;
          }

          .activities-shimmer {
            animation: activitiesShimmer 6s ease-in-out infinite;
          }

          .activities-float {
            animation: activitiesFloat 5s ease-in-out infinite;
          }

          @media (prefers-reduced-motion: reduce) {
            .activities-glow,
            .activities-glow-two,
            .activities-shimmer,
            .activities-float {
              animation: none !important;
            }
          }
        `}
      </style>

      {/* =================================================
          BACKGROUND DECORATIONS
      ================================================= */}

      <div className="pointer-events-none absolute -top-32 -right-28 w-[380px] h-[380px] rounded-full bg-[#D4AF37]/8 blur-3xl activities-glow" />

      <div className="pointer-events-none absolute -bottom-40 -left-32 w-[420px] h-[420px] rounded-full bg-[#D4AF37]/6 blur-3xl activities-glow-two" />

      <div className="pointer-events-none absolute top-1/2 left-0 w-28 h-28 rounded-full border border-[#D4AF37]/10 -translate-x-1/2" />

      <div className="pointer-events-none absolute bottom-20 right-0 w-36 h-36 rounded-full border border-[#D4AF37]/10 translate-x-1/2" />

      <div className="relative max-w-7xl mx-auto">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-7 pb-7 border-b border-[#D4AF37]/20">

          {/* LEFT */}

          <div className="max-w-3xl">

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#D4AF37]/15 to-[#F5E7A8]/25 border border-[#D4AF37]/35 shadow-sm">

              <Sparkles className="w-3.5 h-3.5 text-[#A67C00]" />

              <span className="text-[10px] sm:text-xs font-extrabold tracking-[0.16em] uppercase text-[#92700B]">
                Monthly Events Log
              </span>

            </div>

            <h2 className="font-serif-title mt-4 text-3xl sm:text-4xl lg:text-5xl font-black text-[#171717] leading-[1.02]">
              Current & Previous
              <span className="block text-[#8F6D08]">
                Month Highlights
              </span>
            </h2>

            <p className="mt-4 text-sm sm:text-base text-[#666666] max-w-2xl leading-7">
              Explore recent symposia, research
              webinars, micro-poetry jams, debate
              championships, and other activities
              conducted by the Literature Club.
            </p>

          </div>

          {/* =================================================
              FILTERS
          ================================================= */}

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">

            <button
              type="button"
              onClick={() =>
                setFilter('all')
              }
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 cursor-pointer ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#C49A19] text-white shadow-[0_6px_18px_rgba(212,175,55,0.22)] -translate-y-0.5'
                  : 'bg-white text-[#666666] border border-gray-200 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:text-[#8F6D08]'
              }`}
            >
              All Activities
            </button>

            <button
              type="button"
              onClick={() =>
                setFilter('current')
              }
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 cursor-pointer ${
                filter === 'current'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#C49A19] text-white shadow-[0_6px_18px_rgba(212,175,55,0.22)] -translate-y-0.5'
                  : 'bg-white text-[#666666] border border-gray-200 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:text-[#8F6D08]'
              }`}
            >
              Current Month
            </button>

            <button
              type="button"
              onClick={() =>
                setFilter('previous')
              }
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 cursor-pointer ${
                filter === 'previous'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#C49A19] text-white shadow-[0_6px_18px_rgba(212,175,55,0.22)] -translate-y-0.5'
                  : 'bg-white text-[#666666] border border-gray-200 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:text-[#8F6D08]'
              }`}
            >
              Previous Highlights
            </button>

            {/* REFRESH */}

            <button
              type="button"
              onClick={() =>
                void loadActivities()
              }
              disabled={
                loadingActivities
              }
              className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-[#777777] hover:text-[#8F6D08] hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 transition-all duration-300 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh activities"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  loadingActivities
                    ? 'animate-spin'
                    : ''
                }`}
              />
            </button>

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {activityError && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
            {activityError}
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loadingActivities &&
          activities.length ===
            0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center">

              <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mb-4">

                <RefreshCw className="w-6 h-6 text-[#A67C00] animate-spin" />

              </div>

              <h3 className="font-serif-title text-xl font-bold text-[#171717]">
                Loading activity highlights...
              </h3>

              <p className="mt-2 text-sm text-[#777777]">
                Fetching the latest Literature Club activities.
              </p>

            </div>
          )}

        {/* =================================================
            CARDS
        ================================================= */}

        {(!loadingActivities ||
          activities.length >
            0) && (
          <div className="mt-10 grid grid-cols-1 xl:grid-cols-2 gap-7">

            {filtered.map(
              (activity, index) => (
                <article
                  key={
                    activity.id
                  }
                  className="group relative overflow-hidden bg-white rounded-[28px] border border-[#D4AF37]/25 shadow-[0_8px_30px_rgba(80,60,20,0.06)] hover:shadow-[0_18px_45px_rgba(80,60,20,0.12)] hover:-translate-y-1 transition-all duration-500"
                  style={{
                    animationDelay: `${index * 80}ms`,
                  }}
                >

                  {/* TOP GOLD SHIMMER */}

                  <div className="pointer-events-none absolute top-0 left-0 right-0 h-px overflow-hidden bg-[#D4AF37]/15">

                    <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent activities-shimmer" />

                  </div>

                  <div className="flex flex-col sm:flex-row min-h-[270px]">

                    {/* =================================================
                        IMAGE
                    ================================================= */}

                    <div className="relative sm:w-[42%] h-56 sm:h-auto overflow-hidden bg-[#F7F2E5] shrink-0">

                      {activity.imageUrl ? (
                        <img
                          src={
                            activity.imageUrl
                          }
                          alt={
                            activity.title ||
                            'Literature Club Activity'
                          }
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">

                          <div className="w-14 h-14 rounded-2xl bg-white/75 border border-[#D4AF37]/25 flex items-center justify-center mb-3">
                            <ImageOff className="w-6 h-6 text-[#A67C00]" />
                          </div>

                          <span className="text-xs font-bold text-[#8A6908]">
                            Literature Club
                          </span>

                          <span className="text-[10px] text-[#999999] mt-1">
                            Activity Highlight
                          </span>

                        </div>
                      )}

                      {/* IMAGE OVERLAY */}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-70 pointer-events-none" />

                      {/* MONTH BADGE */}

                      <div className="absolute top-4 left-4">

                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/95 backdrop-blur-sm px-3 py-1.5 text-[10px] font-extrabold text-[#8B6905] border border-[#D4AF37]/25 shadow-sm">

                          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />

                          {activity.isPreviousMonth
                            ? 'Previous Month'
                            : 'Current Month'}

                        </span>

                      </div>

                    </div>

                    {/* =================================================
                        BODY
                    ================================================= */}

                    <div className="flex-1 p-6 sm:p-7 flex flex-col justify-between">

                      <div>

                        {/* DATE + CATEGORY */}

                        <div className="flex flex-wrap items-center gap-2">

                          <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-[#777777]">

                            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />

                            {activity.date ||
                              'Date not available'}

                          </span>

                          {activity.category && (
                            <>
                              <span className="text-[#D9D9D9]">
                                •
                              </span>

                              <span className="px-2 py-1 rounded-lg bg-[#FBF8EF] border border-[#D4AF37]/20 text-[10px] font-extrabold uppercase tracking-wide text-[#97730A]">
                                {
                                  activity.category
                                }
                              </span>
                            </>
                          )}

                        </div>

                        {/* TITLE */}

                        <h3 className="mt-4 font-serif-title text-xl sm:text-2xl font-bold text-[#171717] leading-tight group-hover:text-[#936F05] transition-colors duration-300">
                          {activity.title ||
                            'Literature Club Activity'}
                        </h3>

                        {/* SUMMARY */}

                        <p className="mt-3 text-sm text-[#666666] leading-6 line-clamp-4">
                          {activity.summary ||
                            'Literature Club activity highlight.'}
                        </p>

                      </div>

                      {/* FOOTER */}

                      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">

                        <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-[#98740A]">

                          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />

                          Event Summary Verified

                        </span>

                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold text-[#A0A0A0] group-hover:text-[#98740A] transition-colors">

                          VSBEC

                          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />

                        </span>

                      </div>

                    </div>

                  </div>

                </article>
              )
            )}

          </div>
        )}

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {!loadingActivities &&
          filtered.length ===
            0 && (
            <div className="mt-10 py-20 rounded-[28px] border border-dashed border-[#D4AF37]/30 bg-white/60 text-center">

              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">

                <Calendar className="w-7 h-7 text-[#A67C00]" />

              </div>

              <h3 className="mt-5 font-serif-title text-xl font-bold text-[#171717]">
                {emptyTitle}
              </h3>

              <p className="mt-2 text-sm text-[#777777] max-w-md mx-auto px-4">
                {emptyDescription}
              </p>

            </div>
          )}

      </div>
    </section>
  );
};