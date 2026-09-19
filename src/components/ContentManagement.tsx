import React, {
  useEffect,
  useState,
} from 'react';

import {
  Megaphone,
  Trophy,
  Images,
  UserRound,
  CalendarDays,
  Trash2,
  Edit3,
  RefreshCw,
  X,
  Link as LinkIcon,
} from 'lucide-react';

import {
  DEPARTMENT_OPTIONS,
} from '../types';

import {
  listContent,
  createGallery,
  removeGallery,
  createWinner,
  removeWinner,
  saveAnnouncement,
  removeAnnouncement,
  saveCoordinator,
  removeCoordinator,
  saveMonthlyActivity,
  removeMonthlyActivity,
} from '../services/contentManagement';

type RecordItem =
  Record<string, any> & {
    id: string;
  };

/* =========================================================
   INPUT STYLE
========================================================= */

const input =
  'w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37]';

/* =========================================================
   DEFAULT ACTIVITY
========================================================= */

const emptyActivityForm = {
  title: '',
  date: new Date()
    .toISOString()
    .slice(0, 10),
  category: '',
  summary: '',
  imageUrl: '',
};

/* =========================================================
   COMPONENT
========================================================= */

export const ContentManagement: React.FC<{
  adminUid: string;
}> = ({
  adminUid,
}) => {

  /* =======================================================
     ACTIVE TAB
  ======================================================= */

  const [
    tab,
    setTab,
  ] = useState<
    | 'gallery'
    | 'winners'
    | 'announcements'
    | 'coordinators'
    | 'activities'
  >('gallery');

  /* =======================================================
     CONTENT STATE
  ======================================================= */

  const [
    gallery,
    setGallery,
  ] = useState<RecordItem[]>(
    []
  );

  const [
    winners,
    setWinners,
  ] = useState<RecordItem[]>(
    []
  );

  const [
    announcements,
    setAnnouncements,
  ] = useState<RecordItem[]>(
    []
  );

  const [
    coordinators,
    setCoordinators,
  ] = useState<RecordItem[]>(
    []
  );

  const [
    activities,
    setActivities,
  ] = useState<RecordItem[]>(
    []
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    message,
    setMessage,
  ] = useState('');

  /* =======================================================
     GALLERY FORM
  ======================================================= */

  const [
    galleryForm,
    setGalleryForm,
  ] = useState({
    title: '',
    album: '',
    date: new Date()
      .toISOString()
      .slice(0, 10),
    imageUrl: '',
  });

  /* =======================================================
     WINNER FORM
  ======================================================= */

  const [
    winnerForm,
    setWinnerForm,
  ] = useState({
    name: '',
    department:
      DEPARTMENT_OPTIONS[0]
        ?.name || '',
    departmentCode:
      DEPARTMENT_OPTIONS[0]
        ?.code || '',
    eventName: '',
    achievementTitle: '',
    monthYear: '',
    photoUrl: '',
  });

  /* =======================================================
     ANNOUNCEMENT FORM
  ======================================================= */

  const [
    announcementForm,
    setAnnouncementForm,
  ] = useState({
    title: '',
    message: '',
    priority:
      'normal' as
        | 'normal'
        | 'important'
        | 'urgent',
    published: true,
    publishFrom: '',
    publishUntil: '',
  });

  /* =======================================================
     COORDINATOR FORM
  ======================================================= */

  const [
    coordForm,
    setCoordForm,
  ] = useState({
    userId: '',
    name: '',
    designation: '',
    department:
      DEPARTMENT_OPTIONS[0]
        ?.name || '',
    departmentCode:
      DEPARTMENT_OPTIONS[0]
        ?.code || '',
    role: 'Coordinator',
    academicYear: '2026-27',
    bio: '',
    photoUrl: '',
  });

  /* =======================================================
     MONTHLY ACTIVITY
  ======================================================= */

  const [
    activityForm,
    setActivityForm,
  ] = useState(
    emptyActivityForm
  );

  const [
    editingActivityId,
    setEditingActivityId,
  ] = useState<string | null>(
    null
  );

  /* =======================================================
     LOAD
  ======================================================= */

  const load = async () => {
    setLoading(true);

    try {
      const [
        g,
        w,
        a,
        c,
        act,
      ] = await Promise.all([
        listContent('gallery'),
        listContent('winners'),
        listContent('announcements'),
        listContent('coordinators'),
        listContent('monthlyActivities'),
      ]);

      setGallery(
        g as RecordItem[]
      );

      setWinners(
        w as RecordItem[]
      );

      setAnnouncements(
        a as RecordItem[]
      );

      setCoordinators(
        c as RecordItem[]
      );

      setActivities(
        act as RecordItem[]
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load content.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  /* =======================================================
     NOTICE
  ======================================================= */

  const notice = (
    text: string
  ) => {
    setMessage(text);

    window.setTimeout(
      () => {
        setMessage('');
      },
      3000
    );
  };

  /* =======================================================
     URL VALIDATION
  ======================================================= */

  const validateImageUrl = (
    value: string
  ) => {
    const url =
      value.trim();

    if (!url) {
      return true;
    }

    try {
      const parsed =
        new URL(url);

      return (
        parsed.protocol ===
          'http:' ||
        parsed.protocol ===
          'https:'
      );
    } catch {
      return false;
    }
  };

  /* =======================================================
     GALLERY SAVE
  ======================================================= */

  const submitGallery = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !galleryForm.title.trim()
    ) {
      return notice(
        'Enter a gallery title.'
      );
    }

    if (
      !galleryForm.album.trim()
    ) {
      return notice(
        'Enter an album name.'
      );
    }

    if (
      !galleryForm.imageUrl.trim()
    ) {
      return notice(
        'Paste a gallery image URL.'
      );
    }

    if (
      !validateImageUrl(
        galleryForm.imageUrl
      )
    ) {
      return notice(
        'Enter a valid image URL.'
      );
    }

    try {
      await createGallery({
        title:
          galleryForm.title,

        album:
          galleryForm.album,

        date:
          galleryForm.date,

        imageUrl:
          galleryForm.imageUrl,

        adminUid,
      });

      setGalleryForm({
        title: '',
        album: '',
        date: new Date()
          .toISOString()
          .slice(0, 10),
        imageUrl: '',
      });

      notice(
        'Gallery image published.'
      );

      await load();
    } catch (error) {
      notice(
        error instanceof Error
          ? error.message
          : 'Unable to publish gallery image.'
      );
    }
  };

  /* =======================================================
     WINNER SAVE
  ======================================================= */

  const submitWinner = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !winnerForm.name.trim()
    ) {
      return notice(
        'Enter the winner name.'
      );
    }

    if (
      !winnerForm.eventName.trim()
    ) {
      return notice(
        'Enter the event name.'
      );
    }

    if (
      !winnerForm.achievementTitle.trim()
    ) {
      return notice(
        'Enter the achievement title.'
      );
    }

    if (
      !winnerForm.monthYear.trim()
    ) {
      return notice(
        'Enter the month and year.'
      );
    }

    if (
      winnerForm.photoUrl &&
      !validateImageUrl(
        winnerForm.photoUrl
      )
    ) {
      return notice(
        'Enter a valid winner photo URL.'
      );
    }

    try {
      await createWinner({
        name:
          winnerForm.name,

        department:
          winnerForm.department,

        departmentCode:
          winnerForm.departmentCode,

        eventName:
          winnerForm.eventName,

        achievementTitle:
          winnerForm.achievementTitle,

        monthYear:
          winnerForm.monthYear,

        photoUrl:
          winnerForm.photoUrl,

        adminUid,
      });

      setWinnerForm({
        name: '',
        department:
          DEPARTMENT_OPTIONS[0]
            ?.name || '',
        departmentCode:
          DEPARTMENT_OPTIONS[0]
            ?.code || '',
        eventName: '',
        achievementTitle: '',
        monthYear: '',
        photoUrl: '',
      });

      notice(
        'Winner added successfully.'
      );

      await load();
    } catch (error) {
      notice(
        error instanceof Error
          ? error.message
          : 'Unable to add winner.'
      );
    }
  };

  /* =======================================================
     ANNOUNCEMENT SAVE
  ======================================================= */

  const submitAnnouncement =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      if (
        !announcementForm.title.trim()
      ) {
        return notice(
          'Enter announcement title.'
        );
      }

      if (
        !announcementForm.message.trim()
      ) {
        return notice(
          'Enter announcement message.'
        );
      }

      try {
        await saveAnnouncement({
          ...announcementForm,
          adminUid,
        });

        setAnnouncementForm({
          title: '',
          message: '',
          priority: 'normal',
          published: true,
          publishFrom: '',
          publishUntil: '',
        });

        notice(
          'Announcement published.'
        );

        await load();
      } catch (error) {
        notice(
          error instanceof Error
            ? error.message
            : 'Unable to publish announcement.'
        );
      }
    };

  /* =======================================================
     COORDINATOR SAVE
  ======================================================= */

  const submitCoordinator =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      if (
        !coordForm.userId.trim()
      ) {
        return notice(
          'Enter the Firebase User UID.'
        );
      }

      if (
        !coordForm.name.trim()
      ) {
        return notice(
          'Enter coordinator name.'
        );
      }

      if (
        !coordForm.designation.trim()
      ) {
        return notice(
          'Enter coordinator designation.'
        );
      }

      if (
        coordForm.photoUrl &&
        !validateImageUrl(
          coordForm.photoUrl
        )
      ) {
        return notice(
          'Enter a valid coordinator photo URL.'
        );
      }

      try {
        await saveCoordinator({
          ...coordForm,
          adminUid,
        });

        setCoordForm({
          userId: '',
          name: '',
          designation: '',
          department:
            DEPARTMENT_OPTIONS[0]
              ?.name || '',
          departmentCode:
            DEPARTMENT_OPTIONS[0]
              ?.code || '',
          role: 'Coordinator',
          academicYear:
            '2026-27',
          bio: '',
          photoUrl: '',
        });

        notice(
          'Coordinator profile saved.'
        );

        await load();
      } catch (error) {
        notice(
          error instanceof Error
            ? error.message
            : 'Unable to save coordinator.'
        );
      }
    };

  /* =======================================================
     MONTHLY ACTIVITY SAVE
  ======================================================= */

  const submitActivity =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      if (
        !activityForm.title.trim()
      ) {
        return notice(
          'Enter an activity title.'
        );
      }

      if (
        !activityForm.category.trim()
      ) {
        return notice(
          'Enter an activity category.'
        );
      }

      if (
        !activityForm.summary.trim()
      ) {
        return notice(
          'Enter an activity description.'
        );
      }

      if (
        activityForm.imageUrl &&
        !validateImageUrl(
          activityForm.imageUrl
        )
      ) {
        return notice(
          'Enter a valid activity image URL.'
        );
      }

      try {
        await saveMonthlyActivity({
          id:
            editingActivityId ||
            undefined,

          title:
            activityForm.title,

          date:
            activityForm.date,

          category:
            activityForm.category,

          summary:
            activityForm.summary,

          imageUrl:
            activityForm.imageUrl,

          adminUid,
        });

        setActivityForm({
          ...emptyActivityForm,

          date: new Date()
            .toISOString()
            .slice(0, 10),
        });

        setEditingActivityId(
          null
        );

        notice(
          editingActivityId
            ? 'Monthly activity updated.'
            : 'Monthly activity added.'
        );

        await load();
      } catch (error) {
        notice(
          error instanceof Error
            ? error.message
            : 'Unable to save monthly activity.'
        );
      }
    };

  /* =======================================================
     EDIT ACTIVITY
  ======================================================= */

  const startEditActivity = (
    activity: RecordItem
  ) => {
    setEditingActivityId(
      activity.id
    );

    setActivityForm({
      title:
        activity.title || '',

      date:
        activity.date ||
        new Date()
          .toISOString()
          .slice(0, 10),

      category:
        activity.category ||
        '',

      summary:
        activity.summary ||
        '',

      imageUrl:
        activity.imageUrl ||
        '',
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  /* =======================================================
     CANCEL ACTIVITY EDIT
  ======================================================= */

  const cancelEditActivity =
    () => {
      setEditingActivityId(
        null
      );

      setActivityForm({
        ...emptyActivityForm,

        date: new Date()
          .toISOString()
          .slice(0, 10),
      });
    };

  /* =======================================================
     DELETE ACTIVITY
  ======================================================= */

  const deleteActivity =
    async (
      activity: RecordItem
    ) => {
      const confirmed =
        window.confirm(
          `Delete "${activity.title}" from Monthly Activities?`
        );

      if (!confirmed) {
        return;
      }

      try {
        await removeMonthlyActivity(
          activity.id
        );

        notice(
          'Monthly activity deleted.'
        );

        await load();
      } catch (error) {
        notice(
          error instanceof Error
            ? error.message
            : 'Unable to delete monthly activity.'
        );
      }
    };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="py-12 flex items-center justify-center gap-2 text-gray-500">
        <RefreshCw className="w-5 h-5 animate-spin" />
        Loading content…
      </div>
    );
  }

  /* =======================================================
     TABS
  ======================================================= */

  const tabs = [
    [
      'gallery',
      'Gallery',
      Images,
    ],
    [
      'winners',
      'Winners',
      Trophy,
    ],
    [
      'announcements',
      'Announcements',
      Megaphone,
    ],
    [
      'coordinators',
      'Coordinators',
      UserRound,
    ],
    [
      'activities',
      'Monthly Activities',
      CalendarDays,
    ],
  ] as const;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>

          <h2 className="text-2xl font-bold text-[#171717]">
            Content Management
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Manage public Literature Club content using Firestore.
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            void load()
          }
          className="self-start sm:self-auto px-3 py-2 bg-white border border-gray-200 rounded-xl hover:border-[#D4AF37]/40 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

      </div>

      {/* MESSAGE */}

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
          {message}
        </div>
      )}

      {/* TABS */}

      <div className="flex flex-wrap gap-2">

        {tabs.map(
          ([
            key,
            label,
            Icon,
          ]) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                setTab(key)
              }
              className={`px-4 py-2 rounded-xl text-sm font-bold flex gap-2 items-center transition-all ${
                tab === key
                  ? 'bg-[#171717] text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-[#666666] hover:border-[#D4AF37]/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          )
        )}

      </div>

      {/* ===================================================
          GALLERY
      =================================================== */}

      {tab === 'gallery' && (
        <div className="grid lg:grid-cols-[380px_1fr] gap-6">

          <form
            onSubmit={
              submitGallery
            }
            className="bg-white border border-[#D4AF37]/20 rounded-3xl p-5 space-y-4 shadow-sm"
          >

            <div>

              <h3 className="font-bold text-lg">
                Add Gallery Photo
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                Payment-free image URL method.
              </p>

            </div>

            <input
              className={input}
              placeholder="Photo title"
              value={
                galleryForm.title
              }
              onChange={(e) =>
                setGalleryForm({
                  ...galleryForm,
                  title:
                    e.target.value,
                })
              }
              required
            />

            <input
              className={input}
              placeholder="Album name"
              value={
                galleryForm.album
              }
              onChange={(e) =>
                setGalleryForm({
                  ...galleryForm,
                  album:
                    e.target.value,
                })
              }
              required
            />

            <input
              className={input}
              type="date"
              value={
                galleryForm.date
              }
              onChange={(e) =>
                setGalleryForm({
                  ...galleryForm,
                  date:
                    e.target.value,
                })
              }
              required
            />

            <div className="p-4 bg-[#FBF8EF] border border-[#D4AF37]/25 rounded-2xl">

              <div className="flex items-center gap-2 mb-2">

                <LinkIcon className="w-4 h-4 text-[#A67C00]" />

                <label className="text-xs font-bold">
                  Image URL *
                </label>

              </div>

              <input
                type="url"
                className={input}
                placeholder="https://i.ibb.co/example/photo.jpg"
                value={
                  galleryForm.imageUrl
                }
                onChange={(e) =>
                  setGalleryForm({
                    ...galleryForm,
                    imageUrl:
                      e.target.value,
                  })
                }
                required
              />

            </div>

            {galleryForm.imageUrl && (
              <img
                src={
                  galleryForm.imageUrl
                }
                alt="Gallery preview"
                className="w-full h-40 object-cover rounded-2xl border border-[#D4AF37]/30"
                onError={(e) => {
                  e.currentTarget.style.display =
                    'none';
                }}
              />
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#A67C00] text-white font-bold"
            >
              Publish Gallery Photo
            </button>

          </form>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">

            {gallery.map((x) => (
              <article
                key={x.id}
                className="bg-white border rounded-2xl overflow-hidden shadow-sm"
              >

                {x.imageUrl ? (
                  <img
                    src={x.imageUrl}
                    alt={x.title}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}

                <div className="p-3">

                  <b>
                    {x.title}
                  </b>

                  <p className="text-xs text-gray-500 mt-1">
                    {x.album} · {x.date}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      void removeGallery(
                        x.id
                      ).then(
                        () => load()
                      )
                    }
                    className="mt-3 text-xs text-red-600 font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>

                </div>

              </article>
            ))}

            {!gallery.length && (
              <div className="sm:col-span-2 xl:col-span-3 text-center py-12 text-gray-500">
                No gallery photos yet.
              </div>
            )}

          </div>

        </div>
      )}

      {/* ===================================================
          WINNERS
      =================================================== */}

      {tab === 'winners' && (
        <div className="grid lg:grid-cols-[400px_1fr] gap-6">

          <form
            onSubmit={
              submitWinner
            }
            className="bg-white border border-[#D4AF37]/20 rounded-3xl p-5 space-y-4 shadow-sm"
          >

            <div>

              <h3 className="font-bold text-lg">
                Add Winner
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                Photo URL only — no Firebase Storage.
              </p>

            </div>

            <input
              className={input}
              placeholder="Student name"
              value={
                winnerForm.name
              }
              onChange={(e) =>
                setWinnerForm({
                  ...winnerForm,
                  name:
                    e.target.value,
                })
              }
              required
            />

            <select
              className={input}
              value={
                winnerForm.departmentCode
              }
              onChange={(e) => {

                const d =
                  DEPARTMENT_OPTIONS.find(
                    (x) =>
                      x.code ===
                      e.target.value
                  );

                setWinnerForm({
                  ...winnerForm,
                  departmentCode:
                    e.target.value,
                  department:
                    d?.name || '',
                });

              }}
            >
              {DEPARTMENT_OPTIONS.map(
                (d) => (
                  <option
                    key={d.code}
                    value={d.code}
                  >
                    {d.code} — {d.name}
                  </option>
                )
              )}
            </select>

            <input
              className={input}
              placeholder="Event name"
              value={
                winnerForm.eventName
              }
              onChange={(e) =>
                setWinnerForm({
                  ...winnerForm,
                  eventName:
                    e.target.value,
                })
              }
              required
            />

            <input
              className={input}
              placeholder="Achievement / Prize"
              value={
                winnerForm.achievementTitle
              }
              onChange={(e) =>
                setWinnerForm({
                  ...winnerForm,
                  achievementTitle:
                    e.target.value,
                })
              }
              required
            />

            <input
              className={input}
              placeholder="Month & Year"
              value={
                winnerForm.monthYear
              }
              onChange={(e) =>
                setWinnerForm({
                  ...winnerForm,
                  monthYear:
                    e.target.value,
                })
              }
              required
            />

            <div className="p-4 bg-[#FBF8EF] border border-[#D4AF37]/25 rounded-2xl">

              <div className="flex items-center gap-2 mb-2">

                <LinkIcon className="w-4 h-4 text-[#A67C00]" />

                <label className="text-xs font-bold">
                  Winner Photo URL
                </label>

              </div>

              <input
                type="url"
                className={input}
                placeholder="https://i.ibb.co/example/winner.jpg"
                value={
                  winnerForm.photoUrl
                }
                onChange={(e) =>
                  setWinnerForm({
                    ...winnerForm,
                    photoUrl:
                      e.target.value,
                  })
                }
              />

            </div>

            {winnerForm.photoUrl && (
              <img
                src={
                  winnerForm.photoUrl
                }
                alt="Winner preview"
                className="w-24 h-24 rounded-2xl object-cover border-2 border-[#D4AF37]/40"
                onError={(e) => {
                  e.currentTarget.style.display =
                    'none';
                }}
              />
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#A67C00] text-white font-bold"
            >
              Add Winner
            </button>

          </form>

          <div className="grid sm:grid-cols-2 gap-4">

            {winners.map((x) => (
              <article
                key={x.id}
                className="bg-white border rounded-2xl p-4 flex gap-3 shadow-sm"
              >

                {x.photoUrl ? (
                  <img
                    src={
                      x.photoUrl
                    }
                    alt={x.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-[#FBF8EF] flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                )}

                <div className="min-w-0 flex-1">

                  <b>
                    {x.name}
                  </b>

                  <p className="text-xs text-gray-500 mt-1">
                    {x.departmentCode} ·{' '}
                    {x.eventName}
                  </p>

                  <p className="text-sm mt-1">
                    {x.achievementTitle}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      void removeWinner(
                        x.id
                      ).then(
                        () => load()
                      )
                    }
                    className="mt-2 text-xs text-red-600 font-bold"
                  >
                    Delete
                  </button>

                </div>

              </article>
            ))}

            {!winners.length && (
              <p className="text-gray-500">
                No winners yet.
              </p>
            )}

          </div>

        </div>
      )}

      {/* ===================================================
          ANNOUNCEMENTS
      =================================================== */}

      {tab === 'announcements' && (
        <div className="grid lg:grid-cols-[380px_1fr] gap-6">

          <form
            onSubmit={
              submitAnnouncement
            }
            className="bg-white border rounded-2xl p-5 space-y-3"
          >

            <h3 className="font-bold">
              Publish Announcement
            </h3>

            <input
              className={input}
              placeholder="Title"
              value={
                announcementForm.title
              }
              onChange={(e) =>
                setAnnouncementForm({
                  ...announcementForm,
                  title:
                    e.target.value,
                })
              }
              required
            />

            <textarea
              className={input}
              rows={5}
              placeholder="Message"
              value={
                announcementForm.message
              }
              onChange={(e) =>
                setAnnouncementForm({
                  ...announcementForm,
                  message:
                    e.target.value,
                })
              }
              required
            />

            <select
              className={input}
              value={
                announcementForm.priority
              }
              onChange={(e) =>
                setAnnouncementForm({
                  ...announcementForm,
                  priority:
                    e.target.value as
                      | 'normal'
                      | 'important'
                      | 'urgent',
                })
              }
            >
              <option value="normal">
                Normal
              </option>

              <option value="important">
                Important
              </option>

              <option value="urgent">
                Urgent
              </option>
            </select>

            <label className="flex gap-2 text-sm items-center">
              <input
                type="checkbox"
                checked={
                  announcementForm.published
                }
                onChange={(e) =>
                  setAnnouncementForm({
                    ...announcementForm,
                    published:
                      e.target.checked,
                  })
                }
              />
              Published
            </label>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#171717] text-white font-bold"
            >
              Publish
            </button>

          </form>

          <div className="space-y-3">

            {announcements.map(
              (x) => (
                <article
                  key={x.id}
                  className="bg-white border rounded-2xl p-4"
                >

                  <div className="flex justify-between gap-3">

                    <div>

                      <b>
                        {x.title}
                      </b>

                      <span className="ml-2 text-[10px] uppercase font-bold px-2 py-1 rounded-full bg-gray-100">
                        {x.priority}
                      </span>

                      <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
                        {x.message}
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void removeAnnouncement(
                          x.id
                        ).then(
                          () => load()
                        )
                      }
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>

                </article>
              )
            )}

            {!announcements.length && (
              <p className="text-gray-500">
                No announcements yet.
              </p>
            )}

          </div>

        </div>
      )}

      {/* ===================================================
          COORDINATORS
      =================================================== */}

      {tab === 'coordinators' && (
        <div className="grid lg:grid-cols-[400px_1fr] gap-6">

          <form
            onSubmit={
              submitCoordinator
            }
            className="bg-white border border-[#D4AF37]/20 rounded-3xl p-5 space-y-4 shadow-sm"
          >

            <div>

              <h3 className="font-bold text-lg">
                Coordinator Profile
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                Photo URL only — no Firebase Storage.
              </p>

            </div>

            <input
              className={input}
              placeholder="Firebase User UID"
              value={
                coordForm.userId
              }
              onChange={(e) =>
                setCoordForm({
                  ...coordForm,
                  userId:
                    e.target.value,
                })
              }
              required
            />

            <input
              className={input}
              placeholder="Coordinator name"
              value={
                coordForm.name
              }
              onChange={(e) =>
                setCoordForm({
                  ...coordForm,
                  name:
                    e.target.value,
                })
              }
              required
            />

            <input
              className={input}
              placeholder="Designation"
              value={
                coordForm.designation
              }
              onChange={(e) =>
                setCoordForm({
                  ...coordForm,
                  designation:
                    e.target.value,
                })
              }
              required
            />

            <select
              className={input}
              value={
                coordForm.departmentCode
              }
              onChange={(e) => {

                const d =
                  DEPARTMENT_OPTIONS.find(
                    (x) =>
                      x.code ===
                      e.target.value
                  );

                setCoordForm({
                  ...coordForm,
                  departmentCode:
                    e.target.value,
                  department:
                    d?.name || '',
                });

              }}
            >
              {DEPARTMENT_OPTIONS.map(
                (d) => (
                  <option
                    key={d.code}
                    value={d.code}
                  >
                    {d.code} — {d.name}
                  </option>
                )
              )}
            </select>

            <input
              className={input}
              placeholder="Role"
              value={
                coordForm.role
              }
              onChange={(e) =>
                setCoordForm({
                  ...coordForm,
                  role:
                    e.target.value,
                })
              }
            />

            <input
              className={input}
              placeholder="Academic Year"
              value={
                coordForm.academicYear
              }
              onChange={(e) =>
                setCoordForm({
                  ...coordForm,
                  academicYear:
                    e.target.value,
                })
              }
            />

            <textarea
              className={input}
              rows={4}
              placeholder="Short bio"
              value={
                coordForm.bio
              }
              onChange={(e) =>
                setCoordForm({
                  ...coordForm,
                  bio:
                    e.target.value,
                })
              }
            />

            <div className="p-4 bg-[#FBF8EF] border border-[#D4AF37]/25 rounded-2xl">

              <div className="flex items-center gap-2 mb-2">

                <LinkIcon className="w-4 h-4 text-[#A67C00]" />

                <label className="text-xs font-bold">
                  Coordinator Photo URL
                </label>

              </div>

              <input
                type="url"
                className={input}
                placeholder="https://i.ibb.co/example/coordinator.jpg"
                value={
                  coordForm.photoUrl
                }
                onChange={(e) =>
                  setCoordForm({
                    ...coordForm,
                    photoUrl:
                      e.target.value,
                  })
                }
              />

            </div>

            {coordForm.photoUrl && (
              <img
                src={
                  coordForm.photoUrl
                }
                alt="Coordinator preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-[#D4AF37]/40"
                onError={(e) => {
                  e.currentTarget.style.display =
                    'none';
                }}
              />
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#A67C00] text-white font-bold"
            >
              Save Coordinator
            </button>

          </form>

          <div className="grid sm:grid-cols-2 gap-4">

            {coordinators.map(
              (x) => (
                <article
                  key={x.id}
                  className="bg-white border rounded-2xl p-4 flex gap-3 shadow-sm"
                >

                  {x.photoUrl ? (
                    <img
                      src={
                        x.photoUrl
                      }
                      alt={
                        x.name
                      }
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#FBF8EF] flex items-center justify-center">
                      <UserRound className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                  )}

                  <div>

                    <b>
                      {x.name}
                    </b>

                    <p className="text-xs text-gray-500 mt-1">
                      {x.designation} ·{' '}
                      {x.departmentCode}
                    </p>

                    <p className="text-xs mt-1">
                      {x.academicYear}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        void removeCoordinator(
                          x.id
                        ).then(
                          () => load()
                        )
                      }
                      className="mt-2 text-xs text-red-600 font-bold"
                    >
                      Delete
                    </button>

                  </div>

                </article>
              )
            )}

            {!coordinators.length && (
              <p className="text-gray-500">
                No coordinator profiles yet.
              </p>
            )}

          </div>

        </div>
      )}

      {/* ===================================================
          MONTHLY ACTIVITIES
      =================================================== */}

      {tab === 'activities' && (
        <div className="grid lg:grid-cols-[400px_1fr] gap-6">

          <form
            onSubmit={
              submitActivity
            }
            className="bg-white border border-[#D4AF37]/20 rounded-3xl p-5 space-y-4 shadow-sm"
          >

            <div className="flex items-center justify-between">

              <div>

                <h3 className="font-bold text-lg">
                  {editingActivityId
                    ? 'Edit Monthly Activity'
                    : 'Add Monthly Activity'}
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Use a public image URL. No Firebase Storage or billing required.
                </p>

              </div>

              {editingActivityId && (
                <button
                  type="button"
                  onClick={
                    cancelEditActivity
                  }
                  className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

            </div>

            <input
              className={input}
              placeholder="Activity title"
              value={
                activityForm.title
              }
              onChange={(e) =>
                setActivityForm({
                  ...activityForm,
                  title:
                    e.target.value,
                })
              }
              required
            />

            <input
              className={input}
              type="date"
              value={
                activityForm.date
              }
              onChange={(e) =>
                setActivityForm({
                  ...activityForm,
                  date:
                    e.target.value,
                })
              }
              required
            />

            <input
              className={input}
              placeholder="Workshop / Competition / Club Event"
              value={
                activityForm.category
              }
              onChange={(e) =>
                setActivityForm({
                  ...activityForm,
                  category:
                    e.target.value,
                })
              }
              required
            />

            <textarea
              className={input}
              rows={5}
              placeholder="Write activity description..."
              value={
                activityForm.summary
              }
              onChange={(e) =>
                setActivityForm({
                  ...activityForm,
                  summary:
                    e.target.value,
                })
              }
              required
            />

            <div className="p-4 rounded-2xl bg-[#FBF8EF] border border-[#D4AF37]/25">

              <div className="flex items-center gap-2 mb-2">

                <LinkIcon className="w-4 h-4 text-[#A67C00]" />

                <label className="text-xs font-bold">
                  Activity Image URL
                </label>

              </div>

              <input
                type="url"
                className={input}
                placeholder="https://i.ibb.co/example/activity.jpg"
                value={
                  activityForm.imageUrl
                }
                onChange={(e) =>
                  setActivityForm({
                    ...activityForm,
                    imageUrl:
                      e.target.value,
                  })
                }
              />

              <p className="text-[10px] text-[#A67C00] mt-2">
                Paste the direct image URL only.
              </p>

            </div>

            {activityForm.imageUrl && (
              <img
                src={
                  activityForm.imageUrl
                }
                alt="Activity preview"
                className="w-full h-40 object-cover rounded-2xl border border-[#D4AF37]/30"
                onError={(e) => {
                  e.currentTarget.style.display =
                    'none';
                }}
              />
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#A67C00] text-white font-bold flex items-center justify-center gap-2"
            >

              {editingActivityId ? (
                <>
                  <Edit3 className="w-4 h-4" />
                  Update Activity
                </>
              ) : (
                <>
                  <CalendarDays className="w-4 h-4" />
                  Save Activity
                </>
              )}

            </button>

          </form>

          <div>

            <div className="mb-4">

              <h3 className="text-lg font-bold">
                Published Monthly Activities
              </h3>

              <p className="text-sm text-gray-500">
                {activities.length}{' '}
                {activities.length ===
                1
                  ? 'activity'
                  : 'activities'}{' '}
                published
              </p>

            </div>

            <div className="grid sm:grid-cols-2 gap-4">

              {activities.map(
                (x) => (
                  <article
                    key={x.id}
                    className="bg-white border border-[#D4AF37]/20 rounded-2xl overflow-hidden shadow-sm"
                  >

                    {x.imageUrl ? (
                      <img
                        src={
                          x.imageUrl
                        }
                        alt={
                          x.title
                        }
                        className="w-full h-44 object-cover"
                      />
                    ) : (
                      <div className="w-full h-44 bg-[#FBF8EF] flex items-center justify-center text-[#A67C00]">
                        <CalendarDays className="w-7 h-7" />
                      </div>
                    )}

                    <div className="p-4">

                      <div className="flex items-center justify-between gap-2">

                        <span className="text-[10px] uppercase tracking-wide font-bold px-2 py-1 rounded-full bg-[#FBF8EF] text-[#8A6A00]">
                          {x.category ||
                            'Activity'}
                        </span>

                        <span className="text-[10px] font-bold text-gray-500">
                          {x.date}
                        </span>

                      </div>

                      <h4 className="font-bold text-lg mt-3">
                        {x.title}
                      </h4>

                      <p className="text-sm text-gray-600 mt-3 line-clamp-3">
                        {x.summary}
                      </p>

                      <div className="flex gap-2 mt-4">

                        <button
                          type="button"
                          onClick={() =>
                            startEditActivity(
                              x
                            )
                          }
                          className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-bold flex items-center justify-center gap-1 hover:bg-[#FBF8EF]"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void deleteActivity(
                              x
                            )
                          }
                          className="flex-1 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-bold flex items-center justify-center gap-1 hover:bg-red-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>

                      </div>

                    </div>

                  </article>
                )
              )}

              {!activities.length && (
                <div className="sm:col-span-2 bg-white border border-dashed border-[#D4AF37]/30 rounded-2xl p-10 text-center">

                  <CalendarDays className="w-10 h-10 mx-auto text-[#D4AF37]/50" />

                  <h4 className="font-bold mt-3">
                    No Monthly Activities yet
                  </h4>

                  <p className="text-sm text-gray-500 mt-1">
                    Add your first activity using the form.
                  </p>

                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </section>
  );
};