import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ArrowUpRight,
  Award,
  CalendarDays,
  FileSpreadsheet,
  Link as LinkIcon,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Trophy,
  UserCheck,
  X
} from 'lucide-react';

import {
  DEPARTMENTS,
  User,
  UserRole,
  Winner,
} from '../types';

import {
  listContent,
} from '../services/contentManagement';

interface WinnersSectionProps {
  winners?: Winner[];
  onOpenBulkExcelModal: () => void;
  currentUser?: User | null;
  currentUserRole?: UserRole;
  allUsers?: User[];
  onAddWinner?: (
    win: Omit<Winner, 'id'>
  ) => void;
  onDeleteWinner?: (
    id: string
  ) => void;
}

type WinnerFormData = {
  name: string;
  department: string;
  eventName: string;
  achievementTitle: string;
  monthYear: string;
  photoUrl: string;
};

type WinnerRecord = Winner & {
  displayName: string;
  displayDepartment: string;
  displayEvent: string;
  displayAchievement: string;
  displayMonth: string;
  displayPhoto: string;
};

const DEFAULT_PHOTO_URL =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';

export const WinnersSection: React.FC<
  WinnersSectionProps
> = ({
  winners: initialWinners = [],
  onOpenBulkExcelModal,
  currentUser,
  currentUserRole,
  allUsers = [],
  onAddWinner,
  onDeleteWinner,
}) => {
  /* =====================================================
     ACCESS CONTROL
  ===================================================== */

  const isStaff =
    currentUserRole === 'admin' ||
    currentUserRole === 'coordinator' ||
    (
      !!currentUser &&
      (
        currentUser.role === 'admin' ||
        currentUser.role === 'coordinator'
      )
    );

  /* =====================================================
     FIREBASE STATE
  ===================================================== */

  const [
    firebaseWinners,
    setFirebaseWinners,
  ] = useState<Winner[]>([]);

  const [
    loadingWinners,
    setLoadingWinners,
  ] = useState(true);

  const [
    firebaseError,
    setFirebaseError,
  ] = useState('');

  /* =====================================================
     ADD FORM
  ===================================================== */

  const [
    isAdding,
    setIsAdding,
  ] = useState(false);

  const [
    formData,
    setFormData,
  ] = useState<WinnerFormData>({
    name: '',
    department:
      'Computer Science & Engineering',
    eventName: '',
    achievementTitle: '',
    monthYear: '',
    photoUrl: DEFAULT_PHOTO_URL,
  });

  /* =====================================================
     LOAD WINNERS
  ===================================================== */

  const loadWinners = async () => {
    setLoadingWinners(true);
    setFirebaseError('');

    try {
      const result = await listContent(
        'winners'
      );

      const records =
        result
          .filter(
            (item: any) =>
              item.active !== false
          )
          .map(
            (item: any) => ({
              id: item.id,
              name: item.name || '',
              department:
                item.department || '',
              departmentCode:
                item.departmentCode ||
                '',
              eventName:
                item.eventName || '',
              eventId:
                item.eventId || '',
              achievementTitle:
                item.achievementTitle ||
                '',
              monthYear:
                item.monthYear || '',
              photoUrl:
                item.photoUrl || '',
            })
          ) as Winner[];

      setFirebaseWinners(records);
    } catch (error) {
      console.error(
        'Unable to load winners:',
        error
      );

      setFirebaseWinners([]);

      setFirebaseError(
        'Unable to load winner records from Firebase.'
      );
    } finally {
      setLoadingWinners(false);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    void loadWinners();
  }, []);

  /* =====================================================
     EFFECTIVE WINNERS
  ===================================================== */

  const effectiveWinners =
    useMemo<Winner[]>(
      () => {
        if (
          firebaseWinners.length > 0
        ) {
          return firebaseWinners;
        }

        return initialWinners;
      },
      [
        firebaseWinners,
        initialWinners,
      ]
    );

  /* =====================================================
     NORMALIZED WINNERS
  ===================================================== */

  const normalizedWinners =
    useMemo<WinnerRecord[]>(
      () =>
        effectiveWinners.map(
          (winner) => ({
            ...winner,

            displayName:
              String(
                winner.name || ''
              ).trim() ||
              'Literary Champion',

            displayDepartment:
              String(
                winner.department || ''
              ).trim() ||
              'Department Not Specified',

            displayEvent:
              String(
                winner.eventName || ''
              ).trim() ||
              'Literature Club Event',

            displayAchievement:
              String(
                winner.achievementTitle ||
                  ''
              ).trim() ||
              'Literary Achievement',

            displayMonth:
              String(
                winner.monthYear || ''
              ).trim() ||
              'Achievement',

            displayPhoto:
              String(
                winner.photoUrl || ''
              ).trim(),
          })
        ),
      [effectiveWinners]
    );

  /* =====================================================
     OPEN FORM
  ===================================================== */

  const openAddForm = () => {
    setFormData({
      name: '',
      department:
        DEPARTMENTS[0] ||
        'Computer Science & Engineering',
      eventName: '',
      achievementTitle: '',
      monthYear: '',
      photoUrl:
        DEFAULT_PHOTO_URL,
    });

    setIsAdding(true);
  };

  /* =====================================================
     CLOSE FORM
  ===================================================== */

  const closeAddForm = () => {
    setIsAdding(false);

    setFormData({
      name: '',
      department:
        DEPARTMENTS[0] ||
        'Computer Science & Engineering',
      eventName: '',
      achievementTitle: '',
      monthYear: '',
      photoUrl:
        DEFAULT_PHOTO_URL,
    });
  };

  /* =====================================================
     REGISTERED STUDENT AUTO FILL
  ===================================================== */

  const handleSelectRegisteredUser = (
    user: User
  ) => {
    setFormData((previous) => ({
      ...previous,

      name:
        user.fullName || '',

      department:
        user.department ||
        previous.department,

      photoUrl:
        user.avatarUrl ||
        previous.photoUrl,
    }));
  };

  /* =====================================================
     SAVE WINNER
  ===================================================== */

  const handleSaveWinner = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!onAddWinner) {
      return;
    }

    const name =
      formData.name.trim();

    const department =
      formData.department.trim();

    const eventName =
      formData.eventName.trim();

    const achievementTitle =
      formData.achievementTitle.trim();

    const monthYear =
      formData.monthYear.trim();

    const photoUrl =
      formData.photoUrl.trim();

    if (!name) {
      alert(
        'Please enter the student name.'
      );
      return;
    }

    if (!department) {
      alert(
        'Please select a department.'
      );
      return;
    }

    if (!eventName) {
      alert(
        'Please enter the event name.'
      );
      return;
    }

    if (!achievementTitle) {
      alert(
        'Please enter the achievement title.'
      );
      return;
    }

    if (!monthYear) {
      alert(
        'Please enter the month and year.'
      );
      return;
    }

    if (photoUrl) {
      try {
        const parsed =
          new URL(photoUrl);

        if (
          parsed.protocol !== 'https:' &&
          parsed.protocol !== 'http:'
        ) {
          throw new Error();
        }
      } catch {
        alert(
          'Please enter a valid image URL.'
        );
        return;
      }
    }

    try {
      await Promise.resolve(
        onAddWinner({
          name,
          department,
          eventName,
          achievementTitle,
          monthYear,
          photoUrl,
        } as Omit<
          Winner,
          'id'
        >)
      );

      closeAddForm();

      window.setTimeout(
        () => {
          void loadWinners();
        },
        500
      );
    } catch (error) {
      console.error(
        'Unable to add winner:',
        error
      );

      alert(
        'Unable to add winner record.'
      );
    }
  };

  /* =====================================================
     DELETE WINNER
  ===================================================== */

  const handleDeleteWinner = (
    winner: WinnerRecord
  ) => {
    if (!onDeleteWinner) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete winner entry for ${winner.displayName}?`
      );

    if (!confirmed) {
      return;
    }

    onDeleteWinner(
      winner.id
    );

    window.setTimeout(
      () => {
        void loadWinners();
      },
      500
    );
  };

  /* =====================================================
     LOADING SCREEN
  ===================================================== */

  if (
    loadingWinners &&
    normalizedWinners.length === 0
  ) {
    return (
      <section
        id="winners"
        className="min-h-[500px] bg-[#FBFAF6] px-4 py-20 sm:px-6"
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center text-center">

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D4AF37]/25 bg-[#D4AF37]/10">
            <RefreshCw className="h-7 w-7 animate-spin text-[#A67C00]" />
          </div>

          <h2 className="mt-5 font-serif-title text-2xl font-bold text-[#171717]">
            Loading Literary Champions...
          </h2>

          <p className="mt-2 text-sm text-[#777777]">
            Fetching winner records from Firebase.
          </p>

        </div>
      </section>
    );
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <section
      id="winners"
      className="relative overflow-hidden bg-[#FBFAF6] px-4 py-16 text-[#171717] sm:px-6 md:py-24"
    >

      {/* =================================================
          ANIMATIONS
      ================================================= */}

      <style>
        {`
          @keyframes winnersGlowOne {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1);
              opacity: 0.22;
            }

            50% {
              transform: translate3d(18px, 12px, 0) scale(1.08);
              opacity: 0.4;
            }
          }

          @keyframes winnersGlowTwo {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1);
              opacity: 0.16;
            }

            50% {
              transform: translate3d(-18px, -12px, 0) scale(1.1);
              opacity: 0.3;
            }
          }

          @keyframes winnersShimmer {
            0% {
              transform: translateX(-130%);
            }

            100% {
              transform: translateX(130%);
            }
          }

          @keyframes winnerFloat {
            0%, 100% {
              transform: translateY(0);
            }

            50% {
              transform: translateY(-4px);
            }
          }

          .winners-glow-one {
            animation: winnersGlowOne 10s ease-in-out infinite;
          }

          .winners-glow-two {
            animation: winnersGlowTwo 12s ease-in-out infinite;
          }

          .winners-shimmer {
            animation: winnersShimmer 6s ease-in-out infinite;
          }

          .winner-float {
            animation: winnerFloat 5s ease-in-out infinite;
          }

          @media (prefers-reduced-motion: reduce) {
            .winners-glow-one,
            .winners-glow-two,
            .winners-shimmer,
            .winner-float {
              animation: none !important;
            }
          }
        `}
      </style>

      <div className="pointer-events-none absolute -left-32 -top-32 h-[380px] w-[380px] rounded-full bg-[#D4AF37]/8 blur-3xl winners-glow-one" />

      <div className="pointer-events-none absolute -bottom-40 -right-32 h-[420px] w-[420px] rounded-full bg-[#D4AF37]/6 blur-3xl winners-glow-two" />

      <div className="relative mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-7 border-b border-[#D4AF37]/20 pb-7 xl:flex-row xl:items-end xl:justify-between">

          <div className="max-w-3xl">

            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/35 bg-white px-3.5 py-1.5 shadow-sm">

              <Trophy className="h-3.5 w-3.5 text-[#A67C00]" />

              <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#92700B] sm:text-xs">
                Honors & Accomplishments
              </span>

            </div>

            <h2 className="mt-4 font-serif-title text-3xl font-black leading-[1.02] text-[#171717] sm:text-4xl lg:text-5xl">

              Monthly Winners &

              <span className="block text-[#936F05]">
                Literary Champions
              </span>

            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#666666] sm:text-base">
              Celebrating exceptional students
              across BME, BT, CSE, ECE, IT, Mechanical,
              Civil, and other departments for
              outstanding debate, essay, poetry,
              oratory, and literary achievements.
            </p>

          </div>

          <div className="flex flex-wrap items-center gap-2">

            {isStaff && (
              <button
                type="button"
                onClick={openAddForm}
                className="inline-flex items-center gap-2 rounded-xl border border-[#D4AF37]/45 bg-white px-4 py-2.5 text-xs font-extrabold text-[#8F6D08] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#D4AF37]/10"
              >
                <Plus className="h-4 w-4 text-[#D4AF37]" />
                Add Winner
              </button>
            )}

            <button
              type="button"
              onClick={
                onOpenBulkExcelModal
              }
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C9A227] to-[#A67C00] px-4 py-2.5 text-xs font-extrabold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Bulk Certificate
            </button>

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {firebaseError && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
            {firebaseError}
          </div>
        )}

        {/* =================================================
            ADD FORM
        ================================================= */}

        {isAdding && (
          <div className="mx-auto mt-8 max-w-3xl">

            <div className="relative overflow-hidden rounded-[28px] border border-[#D4AF37]/30 bg-white shadow-[0_12px_40px_rgba(80,60,20,0.08)]">

              <div className="absolute left-0 right-0 top-0 h-px overflow-hidden bg-[#D4AF37]/20">
                <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent winners-shimmer" />
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D4AF37]/10">
                    <Trophy className="h-5 w-5 text-[#A67C00]" />
                  </div>

                  <div>

                    <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#A67C00]">
                      Achievement Records
                    </p>

                    <h3 className="font-serif-title text-xl font-bold">
                      Add New Literary Champion
                    </h3>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={closeAddForm}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50"
                >
                  <X className="h-4 w-4" />
                </button>

              </div>

              <div className="p-6">

                {/* STUDENT PROFILE */}

                {allUsers.length > 0 && (
                  <div className="mb-5 rounded-2xl border border-[#D4AF37]/25 bg-[#FBF8EF] p-4">

                    <div className="mb-2 flex items-center gap-2">

                      <UserCheck className="h-4 w-4 text-[#A67C00]" />

                      <span className="text-xs font-bold">
                        Select Registered Student
                      </span>

                    </div>

                    <p className="mb-3 text-[10px] text-[#777777]">
                      Auto-fill details from a registered Literature Club student.
                    </p>

                    <select
                      defaultValue=""
                      onChange={(e) => {

                        const user =
                          allUsers.find(
                            (item) =>
                              item.id ===
                              e.target.value
                          );

                        if (user) {
                          handleSelectRegisteredUser(
                            user
                          );
                        }

                      }}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold outline-none focus:border-[#D4AF37]"
                    >

                      <option
                        value=""
                        disabled
                      >
                        -- Select Registered Student --
                      </option>

                      {allUsers.map(
                        (user) => (
                          <option
                            key={
                              user.id
                            }
                            value={
                              user.id
                            }
                          >
                            {
                              user.fullName
                            }{' '}
                            (
                            {
                              user.department
                            }
                            )
                          </option>
                        )
                      )}

                    </select>

                  </div>
                )}

                <form
                  onSubmit={
                    handleSaveWinner
                  }
                  className="space-y-5"
                >

                  {/* NAME */}

                  <div>

                    <label className="mb-1.5 block text-xs font-bold">
                      Student Full Name *
                    </label>

                    <input
                      type="text"
                      required
                      value={
                        formData.name
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name:
                            e.target
                              .value,
                        })
                      }
                      placeholder="e.g. Priya Dharshini S."
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm outline-none focus:border-[#D4AF37]"
                    />

                  </div>

                  {/* DEPARTMENT + MONTH */}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div>

                      <label className="mb-1.5 block text-xs font-bold">
                        Department *
                      </label>

                      <select
                        value={
                          formData.department
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            department:
                              e.target
                                .value,
                          })
                        }
                        className="w-full rounded-xl border border-gray-200 px-3.5 py-3 text-xs outline-none focus:border-[#D4AF37]"
                      >

                        {DEPARTMENTS.map(
                          (department) => (
                            <option
                              key={
                                department
                              }
                              value={
                                department
                              }
                            >
                              {
                                department
                              }
                            </option>
                          )
                        )}

                      </select>

                    </div>

                    <div>

                      <label className="mb-1.5 block text-xs font-bold">
                        Month & Year *
                      </label>

                      <div className="relative">

                        <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A67C00]" />

                        <input
                          type="text"
                          required
                          value={
                            formData.monthYear
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              monthYear:
                                e.target
                                  .value,
                            })
                          }
                          placeholder="September 2026"
                          className="w-full rounded-xl border border-gray-200 py-3 pl-9 pr-3.5 text-xs outline-none focus:border-[#D4AF37]"
                        />

                      </div>

                    </div>

                  </div>

                  {/* EVENT + ACHIEVEMENT */}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div>

                      <label className="mb-1.5 block text-xs font-bold">
                        Event / Competition Name *
                      </label>

                      <input
                        type="text"
                        required
                        value={
                          formData.eventName
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            eventName:
                              e.target
                                .value,
                          })
                        }
                        placeholder="e.g. Oratory Competition"
                        className="w-full rounded-xl border border-gray-200 px-3.5 py-3 text-xs outline-none focus:border-[#D4AF37]"
                      />

                    </div>

                    <div>

                      <label className="mb-1.5 block text-xs font-bold">
                        Achievement Title *
                      </label>

                      <input
                        type="text"
                        required
                        value={
                          formData.achievementTitle
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            achievementTitle:
                              e.target
                                .value,
                          })
                        }
                        placeholder="e.g. 1st Prize"
                        className="w-full rounded-xl border border-gray-200 px-3.5 py-3 text-xs outline-none focus:border-[#D4AF37]"
                      />

                    </div>

                  </div>

                  {/* PHOTO URL */}

                  <div className="rounded-2xl border border-[#D4AF37]/25 bg-[#FBF8EF] p-4">

                    <div className="mb-2 flex items-center gap-2">

                      <LinkIcon className="h-4 w-4 text-[#A67C00]" />

                      <label className="text-xs font-bold">
                        Winner Photo URL
                      </label>

                    </div>

                    <p className="mb-3 text-[10px] leading-5 text-[#777777]">
                      Paste a direct public image URL.
                      Firebase Storage is not required.
                    </p>

                    <input
                      type="url"
                      value={
                        formData.photoUrl
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          photoUrl:
                            e.target
                              .value,
                        })
                      }
                      placeholder="https://i.ibb.co/example/winner.jpg"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-xs font-mono outline-none focus:border-[#D4AF37]"
                    />

                    {formData.photoUrl && (
                      <div className="mt-4 flex items-center gap-4">

                        <img
                          src={
                            formData.photoUrl
                          }
                          alt="Winner preview"
                          className="h-20 w-20 rounded-2xl border-2 border-[#D4AF37]/40 object-cover"
                          onError={(
                            e
                          ) => {
                            e.currentTarget.style.display =
                              'none';
                          }}
                        />

                        <div>
                          <p className="text-xs font-bold">
                            Photo Preview
                          </p>

                          <p className="mt-1 text-[10px] text-[#777777]">
                            Use the direct image URL,
                            not the ImgBB viewer URL.
                          </p>
                        </div>

                      </div>
                    )}

                  </div>

                  {/* ACTIONS */}

                  <div className="flex flex-col-reverse justify-end gap-2 border-t border-gray-100 pt-4 sm:flex-row">

                    <button
                      type="button"
                      onClick={
                        closeAddForm
                      }
                      className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-bold text-[#666666] hover:bg-gray-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#A67C00] px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <Trophy className="h-4 w-4" />
                      Add Winner Record
                    </button>

                  </div>

                </form>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            COUNT
        ================================================= */}

        <div className="mt-9 flex items-center justify-between gap-4">

          <div>

            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#A67C00]">
              Hall of Literary Honors
            </p>

            <p className="mt-1 text-sm text-[#777777]">
              {normalizedWinners.length}{' '}
              winner
              {normalizedWinners.length === 1
                ? ''
                : 's'}{' '}
              recorded
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              void loadWinners()
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#777777] hover:border-[#D4AF37]/50 hover:text-[#8F6D08]"
            title="Refresh winners"
          >
            <RefreshCw
              className={
                loadingWinners
                  ? 'h-4 w-4 animate-spin'
                  : 'h-4 w-4'
              }
            />
          </button>

        </div>

        {/* =================================================
            WINNER CARDS
        ================================================= */}

        {normalizedWinners.length >
          0 && (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {normalizedWinners.map(
              (
                winner,
                index
              ) => (
                <article
                  key={
                    winner.id
                  }
                  className="group relative overflow-hidden rounded-[28px] border border-[#D4AF37]/25 bg-white shadow-[0_8px_28px_rgba(80,60,20,0.06)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(80,60,20,0.13)]"
                  style={{
                    animationDelay: `${index * 70}ms`,
                  }}
                >

                  <div className="absolute left-0 right-0 top-0 h-px overflow-hidden bg-[#D4AF37]/15">
                    <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent winners-shimmer" />
                  </div>

                  {isStaff &&
                    onDeleteWinner && (
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteWinner(
                            winner
                          )
                        }
                        className="absolute left-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-xl border border-red-100 bg-white/95 text-red-500 shadow-sm hover:bg-red-50"
                        title="Delete winner"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}

                  <div className="absolute right-4 top-4 z-10">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#A67C00] shadow-md">

                      <Trophy className="h-4 w-4 text-white" />

                    </div>

                  </div>

                  {/* PHOTO */}

                  <div className="relative px-6 pt-8">

                    <div className="winner-float relative mx-auto h-28 w-28">

                      <div className="h-full w-full rounded-full bg-gradient-to-br from-[#D4AF37]/20 via-white to-[#F5E7A8]/30 p-1.5 ring-8 ring-[#FBF8EF]">

                        {winner.displayPhoto ? (
                          <img
                            src={
                              winner.displayPhoto
                            }
                            alt={
                              winner.displayName
                            }
                            className="h-full w-full rounded-full border-2 border-white object-cover shadow-lg transition-transform duration-500 group-hover:scale-105"
                            onError={(
                              e
                            ) => {
                              e.currentTarget.style.display =
                                'none';
                            }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                            <Trophy className="h-8 w-8 text-[#D4AF37]" />
                          </div>
                        )}

                      </div>

                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#D4AF37] to-[#A67C00] px-3 py-1 text-[9px] font-extrabold uppercase text-white shadow-sm">
                        {
                          winner.displayMonth
                        }
                      </span>

                    </div>

                  </div>

                  {/* BODY */}

                  <div className="p-6 pt-7 text-center">

                    <div className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/20 bg-[#FBF8EF] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#A67C00]">

                      <Award className="h-3 w-3" />

                      Literary Champion

                    </div>

                    <h3 className="mt-3 font-serif-title text-lg font-bold leading-snug text-[#171717] group-hover:text-[#946F05]">

                      {
                        winner.displayName
                      }

                    </h3>

                    <p className="mt-1 text-xs font-bold text-[#A67C00]">

                      {
                        winner.displayDepartment
                      }

                    </p>

                    <div className="mt-4 rounded-2xl border border-[#D4AF37]/15 bg-[#FBFAF6] p-4 text-left">

                      <p className="text-[9px] font-extrabold uppercase tracking-wider text-[#999999]">
                        Event
                      </p>

                      <p className="mt-1 line-clamp-2 text-xs font-bold text-[#555555]">
                        {
                          winner.displayEvent
                        }
                      </p>

                      <div className="mt-3 border-t border-[#D4AF37]/10 pt-3">

                        <p className="text-[9px] font-extrabold uppercase tracking-wider text-[#999999]">
                          Achievement
                        </p>

                        <p className="mt-1 font-serif-title text-sm font-bold leading-snug text-[#171717]">
                          {
                            winner.displayAchievement
                          }
                        </p>

                      </div>

                    </div>

                    <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-semibold text-[#999999]">

                      <Sparkles className="h-3 w-3 text-[#D4AF37]" />

                      Excellence in Literature

                      <ArrowUpRight className="h-3 w-3 text-[#D4AF37]" />

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

        {normalizedWinners.length ===
          0 && (
          <div className="mt-10 rounded-[28px] border border-dashed border-[#D4AF37]/30 bg-white/70 px-6 py-20 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/10">

              <Trophy className="h-7 w-7 text-[#A67C00]" />

            </div>

            <h3 className="mt-5 font-serif-title text-xl font-bold">
              No Winners Recorded Yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-[#777777]">
              Literary achievements added by the
              Admin or Coordinator will appear here.
            </p>

            {isStaff && (
              <button
                type="button"
                onClick={
                  openAddForm
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#A67C00] px-5 py-2.5 text-xs font-extrabold text-white shadow-md"
              >
                <Plus className="h-4 w-4" />
                Add First Winner
              </button>
            )}

          </div>
        )}

      </div>
    </section>
  );
};