/**
 * Literature Club Web Application - VSB Engineering College
 * Full-Stack Implementation with Express backend & Vite React frontend
 */

import { useEffect, useState } from 'react';

import LitBot from "./components/LitBot";
import { AboutSection } from './components/AboutSection';
import { ActivitiesSection } from './components/ActivitiesSection';
import { ContactSection } from './components/ContactSection';
import Coordinators from './components/Coordinators';
import { Footer } from './components/Footer';
import { GallerySection } from './components/GallerySection';
import { HeroSection } from './components/HeroSection';
import { Navbar } from './components/Navbar';
import { NotificationBanner } from './components/NotificationBanner';
import { UpcomingWorkshopSection } from './components/UpcomingWorkshopSection';
import { WinnersSection } from './components/WinnersSection';

import { AdminCoordinatorDashboard } from './components/AdminCoordinatorDashboard';
import { AuthModal } from './components/AuthModal';
import { ExcelBulkCertificateModal } from './components/ExcelBulkCertificateModal';
import { GoldDust } from './components/GoldDust';
import { GoogleWorkspaceModal } from './components/GoogleWorkspaceModal';
import { HeaderCustomizerModal } from './components/HeaderCustomizerModal';
import { StudentDashboard } from './components/StudentDashboard';

import {
  getCurrentUserProfile,
  initAuth,
  subscribeToStudentProfiles,
  logoutUser,
  testFirestoreConnection,
} from './lib/firebase';
import { listContent } from './services/contentManagement';

import {
  createWorkshopInFirebase,
  deleteWorkshopInFirebase,
  getWorkshopsFromFirebase,
  seedInitialWorkshopsToFirebase,
  updateWorkshopInFirebase,
} from './services/workshopService';

import {
  ActivityLog,
  AttendanceRecord,
  Certificate,
  FeedbackSubmission,
  FooterConfig,
  GalleryItem,
  HeaderConfig,
  Inquiry,
  MonthlyActivity,
  User,
  Winner,
  Workshop,
} from './types';

import {
  initialFooterConfig,
  initialGalleryItems,
  initialHeaderConfig,
  initialMonthlyActivities,
  initialWinners,
  initialWorkshops,
} from './data/mockData';

export default function App() {
  /* =========================================================
     GLOBAL STATE
  ========================================================= */

  const [headerConfig, setHeaderConfig] =
    useState<HeaderConfig>(initialHeaderConfig);

  const [footerConfig, setFooterConfig] =
    useState<FooterConfig>(initialFooterConfig);

  const [users, setUsers] = useState<User[]>([]);

  /*
   * IMPORTANT:
   * null means the user is NOT logged in.
   */
  const [currentUser, setCurrentUser] =
    useState<User | null>(null);

  const [workshops, setWorkshops] =
    useState<Workshop[]>(initialWorkshops);

  const [winners, setWinners] =
    useState<Winner[]>(initialWinners);

  const [galleryItems, setGalleryItems] =
    useState<GalleryItem[]>(initialGalleryItems);

  const [activities] =
    useState<MonthlyActivity[]>(
      initialMonthlyActivities
    );

  const [attendanceRecords, setAttendanceRecords] =
    useState<AttendanceRecord[]>([]);

  const [feedbackSubmissions, setFeedbackSubmissions] =
    useState<FeedbackSubmission[]>([]);

  const [certificates, setCertificates] =
    useState<Certificate[]>([]);

  const [activityLogs, setActivityLogs] =
    useState<ActivityLog[]>([]);

  const [inquiries, setInquiries] =
    useState<Inquiry[]>([]);

  /* =========================================================
     ACTIVE TAB
  ========================================================= */

  const [activeTab, setActiveTab] =
    useState<string>('home');

  /* =========================================================
     MODAL STATES
  ========================================================= */

  const [authModalOpen, setAuthModalOpen] =
    useState(false);

  const [authMode, setAuthMode] =
    useState<'login' | 'register'>('login');

  const [headerCustomizerOpen, setHeaderCustomizerOpen] =
    useState(false);

  const [excelModalOpen, setExcelModalOpen] =
    useState(false);

  const [workspaceModalOpen, setWorkspaceModalOpen] =
    useState(false);

  /* =========================================================
     FIREBASE AUTH LISTENER
  ========================================================= */

  useEffect(() => {
    /*
     * Test Firestore connection when application starts.
     */
    void testFirestoreConnection();

    /*
     * Listen for Firebase Authentication state changes.
     */
    const unsubscribe = initAuth(
      async (firebaseUser) => {
        try {
          /*
           * If Firebase says there is no user,
           * keep the application logged out.
           */
          if (!firebaseUser) {
            setCurrentUser(null);
            setActiveTab('home');
            return;
          }

          /*
           * Get Firestore profile.
           *
           * users/{uid}
           */
          const profile =
            await getCurrentUserProfile(
              firebaseUser.uid
            );

          /*
           * Profile does not exist.
           */
          if (!profile) {
            console.warn(
              'Firebase user exists but Firestore profile was not found.'
            );

            setCurrentUser(null);

            await logoutUser();

            setActiveTab('home');

            return;
          }

          /*
           * Account is inactive.
           */
          if (profile.active === false) {
            console.warn(
              'Firebase account is inactive.'
            );

            setCurrentUser(null);

            await logoutUser();

            setActiveTab('home');

            return;
          }

          /*
           * Convert Firebase + Firestore profile
           * into application User object.
           */
          const legacyUser: User = {
            id:
              profile.uid ||
              firebaseUser.uid,

            fullName:
              profile.fullName ||
              firebaseUser.displayName ||
              '',

            username:
              profile.username ||
              profile.email?.split('@')[0] ||
              firebaseUser.email?.split('@')[0] ||
              firebaseUser.uid.slice(0, 8),

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
              (profile.year as User['year']) ||
              'Faculty/Admin',

            section:
              (profile.section as User['section']) ||
              'N/A',

            role:
              profile.role,

              clubMemberId: profile.clubMemberId || '',

            avatarUrl:
              profile.photoURL ||
              firebaseUser.photoURL ||
              undefined,

            createdAt:
              new Date().toISOString(),
          };

          /*
           * Set currently authenticated user.
           */
          setCurrentUser(legacyUser);

          /*
           * Keep local user list synchronized.
           */
          setUsers((prev) => {
            const existing =
              prev.find(
                (u) => u.id === legacyUser.id
              );

            if (existing) {
              return prev.map((u) =>
                u.id === legacyUser.id
                  ? {
                      ...u,
                      ...legacyUser,
                    }
                  : u
              );
            }

            return [
              legacyUser,
              ...prev,
            ];
          });

          /*
           * IMPORTANT:
           *
           * Firebase authentication succeeded,
           * so dashboard is opened.
           */
          setActiveTab('dashboard');

        } catch (error) {
          console.error(
            'Unable to load Firebase user profile',
            error
          );

          setCurrentUser(null);
          setActiveTab('home');
        }
      },

      /*
       * Firebase logout / auth state changed.
       */
      () => {
        setCurrentUser(null);
        setActiveTab('home');
      }
    );

    /*
     * Cleanup Firebase listener.
     */
    return () => {
      unsubscribe?.();
    };
  }, []);
    /* =========================================================
     LOAD EXISTING COORDINATORS INTO MANAGEMENT MEMBER LIST
     
     IMPORTANT:
     This affects only the Management Portal member list.
     Public Coordinators page remains unchanged.
  ========================================================= */

  useEffect(() => {
    const loadExistingCoordinators =
      async () => {
        try {
          const coordinatorRecords =
            await listContent(
              'coordinators'
            );

          const coordinatorUsers: User[] =
            coordinatorRecords
              .filter(
                (item: any) =>
                  item?.active !== false
              )
              .map(
                (
                  item: any,
                  index: number
                ) => ({
                  id:
                    String(
                      item?.userId ||
                      item?.id ||
                      `coordinator-${index}`
                    ),

                  fullName:
                    String(
                      item?.name ||
                      item?.fullName ||
                      'Literature Club Coordinator'
                    ).trim(),

                  username:
                    String(
                      item?.username ||
                      ''
                    ).trim(),

                  email:
                    String(
                      item?.email ||
                      ''
                    ).trim(),

                  phone:
                    String(
                      item?.phone ||
                      ''
                    ).trim(),

                  department:
                    String(
                      item?.department ||
                      ''
                    ).trim(),

                  year:
                    (item?.year ||
                      item?.academicYear ||
                      'Faculty/Admin') as User['year'],

                  section:
                    (item?.section ||
                      'N/A') as User['section'],

                  role:
                    'coordinator',

                  avatarUrl:
                    String(
                      item?.photoUrl ||
                      item?.photoURL ||
                      item?.avatarUrl ||
                      ''
                    ).trim() ||
                    undefined,

                  createdAt:
                    String(
                      item?.createdAt ||
                      new Date().toISOString()
                    ),
                })
              );

          setUsers(
            (previousUsers) => {
              const merged =
                new Map<
                  string,
                  User
                >();

              /*
               * Keep all existing users exactly as they are.
               */
              previousUsers.forEach(
                (user) => {
                  merged.set(
                    user.id,
                    user
                  );
                }
              );

              /*
               * Add old coordinator records.
               * Existing users are not replaced.
               */
              coordinatorUsers.forEach(
                (coordinator) => {
                  if (
                    !merged.has(
                      coordinator.id
                    )
                  ) {
                    merged.set(
                      coordinator.id,
                      coordinator
                    );
                  }
                }
              );

              return Array.from(
                merged.values()
              );
            }
          );
        } catch (error) {
          console.error(
            'Unable to load existing coordinator records:',
            error
          );
        }
      };

    void loadExistingCoordinators();
  }, []);

  /* =========================================================
     LIVE REGISTERED STUDENT LIST

     Admin / Coordinator member directory receives all
     Firebase student accounts automatically.
  ========================================================= */

  useEffect(() => {
    if (
      !currentUser ||
      (currentUser.role !== 'admin' &&
        currentUser.role !== 'coordinator')
    ) {
      return;
    }

    const unsubscribe =
      subscribeToStudentProfiles(
        (profiles) => {
          const studentUsers: User[] =
            profiles.map((profile) => ({
              id: profile.uid,
              fullName: profile.fullName || '',
              username:
                profile.username ||
                profile.email?.split('@')[0] ||
                profile.uid.slice(0, 8),
              email: profile.email || '',
              phone: profile.phone || '',
              department: profile.department || '',
              year:
                (profile.year as User['year']) ||
                'Faculty/Admin',
              section:
                (profile.section as User['section']) ||
                'N/A',
              role: 'student',
              clubMemberId:
                profile.clubMemberId || '',
              avatarUrl:
                profile.photoURL ||
                undefined,
              createdAt:
                profile.createdAt &&
                typeof profile.createdAt !== 'string' &&
                'toDate' in profile.createdAt
                  ? profile.createdAt.toDate().toISOString()
                  : typeof profile.createdAt === 'string'
                    ? profile.createdAt
                    : new Date().toISOString(),
            }));

          setUsers((previousUsers) => {
            const nonStudentUsers =
              previousUsers.filter(
                (user) => user.role !== 'student'
              );

            return [
              ...nonStudentUsers,
              ...studentUsers,
            ];
          });
        },
        (error) => {
          console.error(
            'Unable to load registered students:',
            error
          );
        }
      );

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  /* =========================================================
     LOAD PUBLIC DATA
  ========================================================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          hRes,
          winRes,
          gRes,
        ] = await Promise.all([
          fetch('/api/header')
            .then((r) => r.json())
            .catch(() => null),

          fetch('/api/winners')
            .then((r) => r.json())
            .catch(() => null),

          fetch('/api/gallery')
            .then((r) => r.json())
            .catch(() => null),
        ]);

        if (hRes) {
          setHeaderConfig(hRes);
        }

        if (Array.isArray(winRes)) {
          setWinners(winRes);
        }

        if (Array.isArray(gRes)) {
          setGalleryItems(gRes);
        }

        try {
          const firebaseWorkshops =
            await getWorkshopsFromFirebase();

          if (firebaseWorkshops.length > 0) {
            setWorkshops(firebaseWorkshops);
          }
        } catch (error) {
          console.error(
            'Unable to load workshops from Firebase:',
            error
          );
        }

      } catch (error) {
        console.log(
          'Using initial state fallback',
          error
        );
      }
    };

    void fetchData();
  }, []);

  /* =========================================================
     FIREBASE WORKSHOP SYNC
  ========================================================= */

  useEffect(() => {
    const syncWorkshops = async () => {
      if (!currentUser) {
        return;
      }

      if (
        currentUser.role !== 'admin' &&
        currentUser.role !== 'coordinator'
      ) {
        return;
      }

      try {
        const existing =
          await getWorkshopsFromFirebase();

        if (existing.length === 0) {
          const seeded =
            await seedInitialWorkshopsToFirebase();

          setWorkshops(seeded);

          console.log(
            'Initial workshops seeded to Firebase.'
          );
        } else {
          setWorkshops(existing);
        }
      } catch (error) {
        console.error(
          'Workshop Firebase sync failed:',
          error
        );
      }
    };

    void syncWorkshops();
  }, [currentUser]);

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = async () => {
    try {
      /*
       * VERY IMPORTANT:
       *
       * This actually signs the user out
       * from Firebase Authentication.
       */
      await logoutUser();

      /*
       * Clear React state.
       */
      setCurrentUser(null);

      /*
       * Return to public home page.
       */
      setActiveTab('home');

      /*
       * Close authentication modal if open.
       */
      setAuthModalOpen(false);

    } catch (error) {
      console.error(
        'Logout failed:',
        error
      );
    }
  };

  /* =========================================================
     INQUIRIES
  ========================================================= */

  const handleRefreshInquiries =
    async () => {
      try {
        const res =
          await fetch('/api/inquiries');

        if (res.ok) {
          const data =
            await res.json();

          if (Array.isArray(data)) {
            setInquiries(data);
          }
        }
      } catch (_) {}
    };

  const handleUpdateInquiry = (
    id: string,
    updates: Partial<Inquiry>
  ) => {
    setInquiries((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              ...updates,
            }
          : i
      )
    );
  };

  const handleDeleteInquiry = (
    id: string
  ) => {
    setInquiries((prev) =>
      prev.filter(
        (i) => i.id !== id
      )
    );
  };

  const handleAddInquiry = (
    inq: Inquiry
  ) => {
    setInquiries((prev) => [
      inq,
      ...prev,
    ]);
  };

  /* =========================================================
     HEADER CONFIG
  ========================================================= */

  const handleUpdateHeaderConfig =
    async (
      newConfig: HeaderConfig
    ) => {
      setHeaderConfig(newConfig);

      try {
        await fetch('/api/header', {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            ...newConfig,

            userName:
              currentUser?.fullName ||
              'Admin',

            userRole:
              currentUser?.role ||
              'admin',
          }),
        });

      } catch (error) {
        console.error(error);
      }
    };

  /* =========================================================
     WORKSHOP
  ========================================================= */

  const handleAddWorkshop =
    async (
      wsData: Partial<Workshop>
    ) => {
      if (!currentUser) {
        alert(
          'Please login before creating an event.'
        );
        return;
      }

      if (
        currentUser.role !== 'admin' &&
        currentUser.role !== 'coordinator'
      ) {
        alert(
          'Only Admin or Coordinator can create events.'
        );
        return;
      }

      try {
        const newWorkshop =
          await createWorkshopInFirebase(
            wsData,
            currentUser.id
          );

        setWorkshops((prev) => [
          newWorkshop,
          ...prev,
        ]);

        alert(
          'Event created successfully and saved to Firebase.'
        );
      } catch (error) {
        console.error(
          'Failed to create workshop:',
          error
        );

        alert(
          'Failed to save event to Firebase. Please check Firebase permissions.'
        );
      }
    };

  const handleUpdateWorkshop =
    async (
      id: string,
      updated: Partial<Workshop>
    ) => {
      if (!currentUser) {
        alert(
          'Please login before updating an event.'
        );
        return;
      }

      try {
        await updateWorkshopInFirebase(
          id,
          updated
        );

        setWorkshops((prev) =>
          prev.map((workshop) =>
            workshop.id === id
              ? {
                  ...workshop,
                  ...updated,
                  id,
                }
              : workshop
          )
        );

        alert(
          'Event updated successfully.'
        );
      } catch (error) {
        console.error(
          'Failed to update workshop:',
          error
        );

        alert(
          'Failed to update event in Firebase.'
        );
      }
    };

  const handleDeleteWorkshop =
    async (
      id: string
    ) => {
      if (!currentUser) {
        alert(
          'Please login before deleting an event.'
        );
        return;
      }

      try {
        await deleteWorkshopInFirebase(id);

        setWorkshops((prev) =>
          prev.filter(
            (workshop) => workshop.id !== id
          )
        );

        alert(
          'Event deleted successfully.'
        );
      } catch (error) {
        console.error(
          'Failed to delete workshop:',
          error
        );

        alert(
          'Failed to delete event from Firebase.'
        );
      }
    };

  const handleAddWinner =
    async (
      winData: Partial<Winner>
    ) => {
      try {
        const res =
          await fetch(
            '/api/winners',
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body: JSON.stringify({
                ...winData,

                operatorName:
                  currentUser?.fullName,

                operatorRole:
                  currentUser?.role,
              }),
            }
          );

        const data =
          await res.json();

        if (
          data.success &&
          data.winner
        ) {
          setWinners([
            data.winner,
            ...winners,
          ]);
        }

      } catch (error) {
        console.error(error);
      }
    };

  const handleDeleteWinner =
    async (
      id: string
    ) => {
      try {
        await fetch(
          `/api/winners/${id}`,
          {
            method: 'DELETE',
          }
        );

        setWinners(
          winners.filter(
            (w) => w.id !== id
          )
        );

      } catch (error) {
        console.error(error);
      }
    };

  /* =========================================================
     GALLERY
  ========================================================= */

  const handleAddGalleryItem =
    async (
      galData: Partial<GalleryItem>
    ) => {
      try {
        const res =
          await fetch(
            '/api/gallery',
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body: JSON.stringify({
                ...galData,

                operatorName:
                  currentUser?.fullName,

                operatorRole:
                  currentUser?.role,
              }),
            }
          );

        const data =
          await res.json();

        if (
          data.success &&
          data.item
        ) {
          setGalleryItems([
            data.item,
            ...galleryItems,
          ]);
        }

      } catch (error) {
        console.error(error);
      }
    };

  const handleDeleteGalleryItem =
    async (
      id: string
    ) => {
      try {
        await fetch(
          `/api/gallery/${id}`,
          {
            method: 'DELETE',
          }
        );

        setGalleryItems(
          galleryItems.filter(
            (g) => g.id !== id
          )
        );

      } catch (error) {
        console.error(error);
      }
    };

  /* =========================================================
     ATTENDANCE
  ========================================================= */

  const handleUploadAttendance =
    async (
      workshopId: string,
      records: any[]
    ) => {
      try {
        const res =
          await fetch(
            '/api/attendance',
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body: JSON.stringify({
                workshopId,
                records,

                operatorName:
                  currentUser?.fullName,

                operatorRole:
                  currentUser?.role,
              }),
            }
          );

        const data =
          await res.json();

        if (data.success) {
          const fresh =
            await fetch(
              '/api/attendance'
            ).then((r) =>
              r.json()
            );

          if (
            Array.isArray(fresh)
          ) {
            setAttendanceRecords(
              fresh
            );
          }
        }

      } catch (error) {
        console.error(error);
      }
    };

  /* =========================================================
     FEEDBACK
  ========================================================= */

  const handleSubmitFeedback =
    async (
      workshopId: string,
      rating: number,
      comments: string
    ) => {
      if (!currentUser) {
        return;
      }

      const res =
        await fetch(
          '/api/feedback',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              workshopId,

              studentId:
                currentUser.id,

              studentName:
                currentUser.fullName,

              rating,

              comments,
            }),
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            'Failed to submit feedback'
        );
      }

      if (data.feedback) {
        setFeedbackSubmissions(
          [
            ...feedbackSubmissions,
            data.feedback,
          ]
        );
      }

      if (data.certificate) {
        setCertificates([
          ...certificates,
          data.certificate,
        ]);
      }
    };

  /* =========================================================
     USERS
  ========================================================= */

  const handleAddUser =
    async (
      userData: Partial<User>
    ) => {
      try {
        const res =
          await fetch(
            '/api/users',
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body: JSON.stringify({
                ...userData,

                operatorName:
                  currentUser?.fullName,

                operatorRole:
                  currentUser?.role,
              }),
            }
          );

        const data =
          await res.json();

        if (
          data.success &&
          data.user
        ) {
          setUsers([
            ...users,
            data.user,
          ]);
        }

      } catch (error) {
        console.error(error);
      }
    };

  const handleDeleteUser =
    async (
      id: string
    ) => {
      try {
        await fetch(
          `/api/users/${id}`,
          {
            method: 'DELETE',
          }
        );

        setUsers(
          users.filter(
            (u) => u.id !== id
          )
        );

      } catch (error) {
        console.error(error);
      }
    };

  /* =========================================================
     WORKSHOP REGISTRATION
  ========================================================= */

  const handleWorkshopRegister =
    (
      ws: Workshop
    ) => {
      if (ws.googleFormUrl) {
        window.open(
          ws.googleFormUrl,
          '_blank'
        );
      }
    };

  /* =========================================================
     PROFILE UPDATE
  ========================================================= */

  const handleUpdateProfile =
    async (
      updated: Partial<User>
    ) => {
      if (!currentUser) {
        return;
      }

      const mergedUser = {
        ...currentUser,
        ...updated,
      };

      setCurrentUser(
        mergedUser
      );

      setUsers((prev) =>
        prev.map((u) =>
          u.id === currentUser.id
            ? mergedUser
            : u
        )
      );

      try {
        await fetch(
          `/api/users/${currentUser.id}`,
          {
            method: 'PUT',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify(
              updated
            ),
          }
        );

      } catch (error) {
        console.error(
          'Failed to persist user profile update',
          error
        );
      }
    };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-white text-[#171717] font-sans antialiased flex flex-col selection:bg-[#F5E7A8] selection:text-[#171717] relative">

      <GoldDust />

      {/* =====================================================
          ANNOUNCEMENT
      ===================================================== */}

      {headerConfig.showAnnouncement && (
        <NotificationBanner
          text={
            headerConfig.announcementText
          }

          onActionClick={() => {
            const openWs =
              workshops.find(
                (w) =>
                  w.status === 'Open'
              );

            if (openWs) {
              handleWorkshopRegister(
                openWs
              );
            }
          }}
        />
      )}

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <Navbar
        headerConfig={headerConfig}

        currentUser={currentUser}

        onOpenAuthModal={(mode) => {
          setAuthMode(mode);
          setAuthModalOpen(true);
        }}

        /*
         * IMPORTANT FIX:
         *
         * Do NOT use:
         *
         * onLogout={() => setCurrentUser(null)}
         *
         * because Firebase session remains active.
         *
         * We now call the real Firebase logout.
         */
        onLogout={handleLogout}

        onOpenHeaderCustomizer={() =>
          setHeaderCustomizerOpen(true)
        }

        onOpenGoogleWorkspaceModal={() =>
          setWorkspaceModalOpen(true)
        }

        activeTab={activeTab}

        setActiveTab={setActiveTab}
      />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="flex-grow relative z-10">

        {/* ===================================================
            DASHBOARD
        =================================================== */}

        {activeTab === 'dashboard' &&
        currentUser ? (

          currentUser.role ===
          'student' ? (

            <StudentDashboard
              user={currentUser}

              workshops={workshops}

              attendanceRecords={
                attendanceRecords
              }

              feedbackSubmissions={
                feedbackSubmissions
              }

              certificates={
                certificates
              }

              onUpdateProfile={
                handleUpdateProfile
              }

              onSubmitFeedback={
                handleSubmitFeedback
              }

              onRegisterWorkshop={
                handleWorkshopRegister
              }
            />

          ) : (

            <AdminCoordinatorDashboard
              currentUser={
                currentUser
              }

              users={users}

              workshops={
                workshops
              }

              winners={
                winners
              }

              galleryItems={
                galleryItems
              }

              attendanceRecords={
                attendanceRecords
              }

              feedbackSubmissions={
                feedbackSubmissions
              }

              certificates={
                certificates
              }

              activityLogs={
                activityLogs
              }

              inquiries={
                inquiries
              }

              headerConfig={
                headerConfig
              }

              footerConfig={
                footerConfig
              }

              onUpdateHeaderConfig={
                handleUpdateHeaderConfig
              }

              onUpdateFooterConfig={
                setFooterConfig
              }

              onOpenHeaderCustomizer={() =>
                setHeaderCustomizerOpen(
                  true
                )
              }

              onOpenBulkExcelModal={() =>
                setExcelModalOpen(
                  true
                )
              }

              onAddWorkshop={
                handleAddWorkshop
              }

              onUpdateWorkshop={
                handleUpdateWorkshop
              }

              onDeleteWorkshop={
                handleDeleteWorkshop
              }

              onAddWinner={
                handleAddWinner
              }

              onDeleteWinner={
                handleDeleteWinner
              }

              onAddGalleryItem={
                handleAddGalleryItem
              }

              onDeleteGalleryItem={
                handleDeleteGalleryItem
              }

              onUploadAttendance={
                handleUploadAttendance
              }

              onAddUser={
                handleAddUser
              }

              onDeleteUser={
                handleDeleteUser
              }

              onUpdateInquiry={
                handleUpdateInquiry
              }

              onDeleteInquiry={
                handleDeleteInquiry
              }

              onRefreshInquiries={
                handleRefreshInquiries
              }
            />

          )

        ) : (

          /* =================================================
             PUBLIC WEBSITE
          ================================================= */

          <>

            {/* HERO */}

            {(activeTab === 'home'  && (

              <HeroSection
                headerConfig={
                  headerConfig
                }

                onExploreWorkshops={() => {
                  const el =
                    document.getElementById(
                      'workshops'
                    );

                  if (el) {
                    el.scrollIntoView({
                      behavior:
                        'smooth',
                    });
                  } else {
                    setActiveTab(
                      'workshops'
                    );
                  }
                }}

                onQuickRegister={() => {
                  const openWs =
                    workshops.find(
                      (w) =>
                        w.status ===
                        'Open'
                    );

                  if (openWs) {
                    handleWorkshopRegister(
                      openWs
                    );
                  }
                }}

                onViewGallery={() => {
                  const el =
                    document.getElementById(
                      'gallery'
                    );

                  if (el) {
                    el.scrollIntoView({
                      behavior:
                        'smooth',
                    });
                  } else {
                    setActiveTab(
                      'gallery'
                    );
                  }
                }}
              />
            )
            )}

           {/* ABOUT */}

           {activeTab === 'about' && (
             <AboutSection
               currentUser={currentUser}
               onNavigate={setActiveTab}
            />
          )}

            {/* WORKSHOPS */}

            {(activeTab === 'home' ||
              activeTab === 'workshops') && (

              <UpcomingWorkshopSection
                workshops={
                  workshops
                }

                onRegisterClick={
                  handleWorkshopRegister
                }
              />

            )}

            {/* ACTIVITIES */}

            {(activeTab === 'home' ||
              activeTab === 'activities') && (

              <ActivitiesSection
                activities={
                  activities
                }
              />

            )}

            {/* WINNERS */}

            {(activeTab === 'home' ||
              activeTab === 'winners') && (

              <WinnersSection
                winners={
                  winners
                }

                onOpenBulkExcelModal={() =>
                  setExcelModalOpen(
                    true
                  )
                }

                currentUser={
                  currentUser
                }

                currentUserRole={
                  currentUser?.role
                }

                allUsers={
                  users
                }

                onAddWinner={
                  handleAddWinner
                }

                onDeleteWinner={
                  handleDeleteWinner
                }
              />

            )}

            {/* GALLERY */}

            {(activeTab === 'home' ||
              activeTab === 'gallery') && (

              <GallerySection
                items={
                  galleryItems
                }

                galleryItems={
                  galleryItems
                }

                currentUser={
                  currentUser
                }

                currentUserRole={
                  currentUser?.role
                }

                onAddGalleryItem={
                  handleAddGalleryItem
                }

                onDeleteGalleryItem={
                  handleDeleteGalleryItem
                }

                onAddImageClick={() => {
                  setActiveTab(
                    'dashboard'
                  );
                }}
              />

            )}
{/* COORDINATORS */}

{activeTab === 'coordinators' && (
  <Coordinators />
)}

         
            {/* CONTACT */}

            {(activeTab === 'home' ||
              activeTab === 'contact') && (

              <ContactSection
                currentUser={
                  currentUser
                }

                onAddInquiry={
                  handleAddInquiry
                }
              />

            )}

          </>

        )}

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <Footer
        headerConfig={
          headerConfig
        }

        footerConfig={
          footerConfig
        }

        currentUser={
          currentUser
        }

        setActiveTab={
          setActiveTab
        }

        onUpdateFooterConfig={
          setFooterConfig
        }
      />

            {/* =====================================================
          LITBOT AI ASSISTANT
      ===================================================== */}

<LitBot />

      {/* =====================================================
          AUTH MODAL
      ===================================================== */}

      <AuthModal
        isOpen={
          authModalOpen
        }

        onClose={() =>
          setAuthModalOpen(false)
        }

        initialMode={
          authMode
        }

        onLoginSuccess={(u) => {
          /*
           * Login success:
           * save user and go dashboard.
           */
          setCurrentUser(u);

          setActiveTab(
            'dashboard'
          );

          setAuthModalOpen(
            false
          );
        }}
      />

      {/* =====================================================
          HEADER CUSTOMIZER
      ===================================================== */}

      <HeaderCustomizerModal
        isOpen={
          headerCustomizerOpen
        }

        onClose={() =>
          setHeaderCustomizerOpen(
            false
          )
        }

        config={
          headerConfig
        }

        onSave={
          handleUpdateHeaderConfig
        }
      />

      {/* =====================================================
          EXCEL CERTIFICATE
      ===================================================== */}

      <ExcelBulkCertificateModal
        isOpen={
          excelModalOpen
        }

        onClose={() =>
          setExcelModalOpen(
            false
          )
        }
      />

      {/* =====================================================
          GOOGLE WORKSPACE
      ===================================================== */}

      <GoogleWorkspaceModal
        isOpen={
          workspaceModalOpen
        }

        onClose={() =>
          setWorkspaceModalOpen(
            false
          )
        }

        workshopsData={
          workshops
        }

        winnersData={
          winners
        }

        attendanceData={
          attendanceRecords
        }
      />

    </div>
  );
}