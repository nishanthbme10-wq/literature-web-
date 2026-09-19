import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Loader2,
  MapPin,
  UserRound,
  XCircle,
} from 'lucide-react';

import {
  cancelStudentRegistration,
  getStudentRegistrations,
  registerStudentForEvent,
} from '../services/registrations';

import { getDepartments } from '../services/firestore';

import type {
  DepartmentDocument,
  RegistrationDocument,
} from '../firebase/firestore-schema';

import {
  DEPARTMENTS,
  type User,
  type Workshop,
} from '../types';

import { RegistrationQrCard } from './RegistrationQrCard';

type DepartmentWithId = DepartmentDocument & {
  id: string;
};

interface EventRegistrationPanelProps {
  user: User;
  workshops: Workshop[];
  onProfileUpdate?: (updates: Partial<User>) => void;
  initialWorkshopId?: string;
}

/*
 * Local fallback departments.
 *
 * Firebase departments are preferred.
 * If Firebase departments are unavailable,
 * these values keep registration working.
 */
const LOCAL_DEPARTMENTS: DepartmentWithId[] = [
  {
    id: 'dept-bme',
    name: 'Biomedical Engineering',
    code: 'BME',
    active: true,
    sortOrder: 1,
    createdAt: null,
    updatedAt: null,
  },
  {
    id: 'dept-bt',
    name: 'Biotechnology',
    code: 'BT',
    active: true,
    sortOrder: 2,
    createdAt: null,
    updatedAt: null,
  },
  {
    id: 'dept-cse',
    name: 'Computer Science and Engineering',
    code: 'CSE',
    active: true,
    sortOrder: 3,
    createdAt: null,
    updatedAt: null,
  },
  {
    id: 'dept-ece',
    name: 'Electronics and Communication Engineering',
    code: 'ECE',
    active: true,
    sortOrder: 4,
    createdAt: null,
    updatedAt: null,
  },
  {
    id: 'dept-eee',
    name: 'Electrical and Electronics Engineering',
    code: 'EEE',
    active: true,
    sortOrder: 5,
    createdAt: null,
    updatedAt: null,
  },
  {
    id: 'dept-mech',
    name: 'Mechanical Engineering',
    code: 'MECH',
    active: true,
    sortOrder: 6,
    createdAt: null,
    updatedAt: null,
  },
  {
    id: 'dept-civil',
    name: 'Civil Engineering',
    code: 'CIVIL',
    active: true,
    sortOrder: 7,
    createdAt: null,
    updatedAt: null,
  },
];

/*
 * If the project already has a department list in types.ts,
 * convert it into a safe fallback list as well.
 */
const getLocalDepartmentFallback =
  (): DepartmentWithId[] => {
    if (
      Array.isArray(DEPARTMENTS) &&
      DEPARTMENTS.length > 0
    ) {
      return DEPARTMENTS.map(
        (department, index) => {
          const value = String(department).trim();

          let code = value
            .toUpperCase()
            .replace(/[^A-Z]/g, '');

          /*
           * Common department code corrections.
           */
          if (
            value.toLowerCase().includes('biomedical')
          ) {
            code = 'BME';
          } else if (
            value.toLowerCase().includes('biotechnology')
          ) {
            code = 'BT';
          } else if (
            value.toLowerCase().includes(
              'computer science'
            )
          ) {
            code = 'CSE';
          } else if (
            value.toLowerCase().includes(
              'electronics and communication'
            )
          ) {
            code = 'ECE';
          } else if (
            value.toLowerCase().includes(
              'electrical and electronics'
            )
          ) {
            code = 'EEE';
          } else if (
            value.toLowerCase().includes('mechanical')
          ) {
            code = 'MECH';
          } else if (
            value.toLowerCase().includes('civil')
          ) {
            code = 'CIVIL';
          }

          return {
            id: `local-dept-${index}`,
            name: value,
            code,
            active: true,
            sortOrder: index + 1,
            createdAt: null,
            updatedAt: null,
          };
        }
      );
    }

    return LOCAL_DEPARTMENTS;
  };

export const EventRegistrationPanel: React.FC<
  EventRegistrationPanelProps
> = ({
  user,
  workshops = [],
  onProfileUpdate,
  initialWorkshopId,
}) => {
  const [departments, setDepartments] =
    useState<DepartmentWithId[]>([]);

  const [departmentsFromFirebase, setDepartmentsFromFirebase] =
    useState(true);

  const [registrations, setRegistrations] =
    useState<
      Array<
        RegistrationDocument & {
          id: string;
        }
      >
    >([]);

  const [selectedWorkshopId, setSelectedWorkshopId] =
    useState(initialWorkshopId || '');

  const [registerNumber, setRegisterNumber] =
    useState('');

  const [phone, setPhone] =
    useState(user.phone || '');

  /*
   * Important:
   * user.department may contain BT/BME/etc.
   */
  const [departmentCode, setDepartmentCode] =
    useState(user.department || '');

  const [year, setYear] =
    useState(user.year || '');

  const [section, setSection] =
    useState(user.section || '');

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState('');

  const [error, setError] =
    useState('');

  const [confirmation, setConfirmation] =
    useState<
      (RegistrationDocument & {
        id: string;
      }) | null
    >(null);

  /*
   * Keep selected workshop synchronized.
   */
  useEffect(() => {
    if (
      initialWorkshopId &&
      workshops.some(
        (workshop) =>
          workshop.id === initialWorkshopId
      )
    ) {
      setSelectedWorkshopId(
        initialWorkshopId
      );
    }
  }, [
    initialWorkshopId,
    workshops,
  ]);

  /*
   * If there is no selected workshop,
   * automatically select the first open one.
   */
  useEffect(() => {
    if (
      !selectedWorkshopId &&
      workshops.length > 0
    ) {
      const firstOpenWorkshop =
        workshops.find(
          (workshop) =>
            workshop.status === 'Open'
        );

      if (firstOpenWorkshop) {
        setSelectedWorkshopId(
          firstOpenWorkshop.id
        );
      }
    }
  }, [
    workshops,
    selectedWorkshopId,
  ]);

  /*
   * Currently selected workshop.
   */
  const selectedWorkshop = useMemo(
    () =>
      workshops.find(
        (workshop) =>
          workshop.id ===
          selectedWorkshopId
      ),
    [
      workshops,
      selectedWorkshopId,
    ]
  );

  /*
   * Currently selected department.
   */
  const selectedDepartment =
    departments.find(
      (department) =>
        department.code ===
          departmentCode ||
        department.name ===
          departmentCode
    );

  /*
   * Load departments + registrations.
   *
   * Firebase department failure is NOT allowed
   * to break the registration page.
   */
  const load = async () => {
    setLoading(true);
    setError('');

    try {
      /*
       * Registration data is important.
       */
      const registrationData =
        await getStudentRegistrations();

      setRegistrations(
        registrationData
      );

      /*
       * Department data is optional.
       *
       * Try Firebase first.
       */
      try {
        const departmentData =
          await getDepartments();

        if (
          Array.isArray(departmentData) &&
          departmentData.length > 0
        ) {
          const firebaseDepartments =
            departmentData
              .filter(
                (department) =>
                  department.active !== false
              )
              .map(
                (department) =>
                  department as DepartmentWithId
              );

          setDepartments(
            firebaseDepartments
          );

          setDepartmentsFromFirebase(
            true
          );
        } else {
          /*
           * Firebase returned empty list.
           * Use local fallback.
           */
          setDepartments(
            getLocalDepartmentFallback()
          );

          setDepartmentsFromFirebase(
            false
          );
        }
      } catch (departmentError) {
        console.warn(
          'Firebase departments could not be loaded. Using local fallback departments.',
          departmentError
        );

        setDepartments(
          getLocalDepartmentFallback()
        );

        setDepartmentsFromFirebase(
          false
        );
      }

      /*
       * Select first open event if nothing selected.
       */
      if (
        !selectedWorkshopId &&
        workshops.length > 0
      ) {
        const firstOpenWorkshop =
          workshops.find(
            (workshop) =>
              workshop.status === 'Open'
          );

        if (firstOpenWorkshop) {
          setSelectedWorkshopId(
            firstOpenWorkshop.id
          );
        }
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Unable to load registration data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * Submit internal Firebase registration.
   */
  const submit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setSaving(true);
    setMessage('');
    setError('');

    if (!selectedWorkshop) {
      setError(
        'Please select an event.'
      );
      setSaving(false);
      return;
    }

    if (
      selectedWorkshop.status !==
      'Open'
    ) {
      setError(
        'Registration is currently closed for this event.'
      );
      setSaving(false);
      return;
    }

    if (!registerNumber.trim()) {
      setError(
        'Please enter your register number.'
      );
      setSaving(false);
      return;
    }

    if (!phone.trim()) {
      setError(
        'Please enter your phone number.'
      );
      setSaving(false);
      return;
    }

    if (!departmentCode) {
      setError(
        'Please select your department.'
      );
      setSaving(false);
      return;
    }

    if (!year) {
      setError(
        'Please select your year.'
      );
      setSaving(false);
      return;
    }

    if (!section) {
      setError(
        'Please select your section.'
      );
      setSaving(false);
      return;
    }

    /*
     * Team registration is not yet enabled.
     */
    if (
      selectedWorkshop.registrationType ===
      'team'
    ) {
      setError(
        'This event uses team registration. Team registration will be enabled separately.'
      );
      setSaving(false);
      return;
    }

    try {
      const result =
        await registerStudentForEvent({
          fullName:
            user.fullName,

          registerNumber:
            registerNumber.trim(),

          email:
            user.email,

          phone:
            phone.trim(),

          department:
            selectedDepartment?.name ||
            user.department ||
            departmentCode,

          departmentCode:
            selectedDepartment?.code ||
            departmentCode,

          year,

          section,

          eventId:
            selectedWorkshop.id,
        });

      const savedRegistration =
        result as RegistrationDocument & {
          id: string;
        };

      setRegistrations(
        (previous) => [
          ...previous.filter(
            (registration) =>
              registration.id !==
              result.id
          ),
          savedRegistration,
        ]
      );

      setConfirmation(
        savedRegistration
      );

      /*
       * Update student's profile details.
       */
      onProfileUpdate?.({
        phone,

        department:
          selectedDepartment?.code ||
          departmentCode,

        year:
          year as User['year'],

        section:
          section as User['section'],
      });

      setMessage(
        `Registration submitted successfully for ${selectedWorkshop.title}.`
      );

      setRegisterNumber('');
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Unable to complete registration.'
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * Cancel registration.
   */
  const cancel = async (
    eventId: string
  ) => {
    if (
      !window.confirm(
        'Cancel your registration for this event?'
      )
    ) {
      return;
    }

    setError('');
    setMessage('');

    try {
      await cancelStudentRegistration(
        eventId
      );

      if (
        confirmation?.eventId ===
        eventId
      ) {
        setConfirmation(null);
      }

      await load();

      setMessage(
        'Registration cancelled successfully.'
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Unable to cancel registration.'
      );
    }
  };

  /*
   * Loading state.
   */
  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-[#666]">
        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />

        <div>
          Loading available events…
        </div>
      </div>
    );
  }

  /*
   * Only Open workshops can be registered.
   */
  const openWorkshops =
    workshops.filter(
      (workshop) =>
        workshop.status === 'Open'
    );

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#8A6D16] text-[10px] font-bold uppercase tracking-wider">
          <UserRound className="w-3.5 h-3.5" />
          Literature Club
        </div>

        <h3 className="font-serif-title font-bold text-xl text-[#171717] mt-3">
          Event Registration
        </h3>

        <p className="text-xs text-[#666] mt-1">
          Register directly through the
          Literature Club portal.
        </p>
      </div>

      {/* FIREBASE FALLBACK NOTICE */}
      {!departmentsFromFirebase &&
        departments.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            Department list is using the
            local college department list.
            Your registration will still be
            saved normally.
          </div>
        )}

      {/* MESSAGE / ERROR */}
      {(message || error) && (
        <div
          className={`p-3 rounded-xl text-xs font-bold border ${
            error
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          {error || message}
        </div>
      )}

      {/* NO OPEN EVENTS */}
      {openWorkshops.length === 0 && (
        <div className="py-12 text-center border border-dashed border-gray-300 rounded-2xl">
          <CalendarDays className="w-8 h-8 mx-auto mb-3 text-gray-400" />

          <h4 className="font-bold text-sm text-[#171717]">
            No registrations available
          </h4>

          <p className="text-xs text-[#666] mt-1">
            There are currently no open
            events for registration.
          </p>
        </div>
      )}

      {/* REGISTRATION FORM */}
      {openWorkshops.length > 0 && (
        <form
          onSubmit={submit}
          className="bg-[#FAFAFA] border border-[#D4AF37]/30 rounded-2xl p-5 space-y-5"
        >

          <div className="grid md:grid-cols-2 gap-4">

            {/* EVENT */}
            <label className="text-xs font-bold space-y-1">
              <span>Event *</span>

              <select
                className="input"
                value={selectedWorkshopId}
                onChange={(e) =>
                  setSelectedWorkshopId(
                    e.target.value
                  )
                }
                required
              >
                <option value="">
                  Select event
                </option>

                {openWorkshops.map(
                  (workshop) => (
                    <option
                      key={workshop.id}
                      value={workshop.id}
                    >
                      {workshop.title}
                    </option>
                  )
                )}
              </select>
            </label>

            {/* REGISTER NUMBER */}
            <label className="text-xs font-bold space-y-1">
              <span>
                Register Number *
              </span>

              <input
                className="input"
                required
                value={registerNumber}
                onChange={(e) =>
                  setRegisterNumber(
                    e.target.value
                  )
                }
                placeholder="e.g. 24BME001"
              />
            </label>

            {/* FULL NAME */}
            <label className="text-xs font-bold space-y-1">
              <span>Full Name</span>

              <input
                className="input bg-gray-100"
                value={
                  user.fullName || ''
                }
                readOnly
              />
            </label>

            {/* EMAIL */}
            <label className="text-xs font-bold space-y-1">
              <span>Email</span>

              <input
                className="input bg-gray-100"
                value={
                  user.email || ''
                }
                readOnly
              />
            </label>

            {/* PHONE */}
            <label className="text-xs font-bold space-y-1">
              <span>Phone *</span>

              <input
                className="input"
                required
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                  )
                }
                placeholder="Phone number"
              />
            </label>

            {/* DEPARTMENT */}
            <label className="text-xs font-bold space-y-1">
              <span>
                Department *
              </span>

              <select
                className="input"
                required
                value={departmentCode}
                onChange={(e) =>
                  setDepartmentCode(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select department
                </option>

                {departments.map(
                  (department) => (
                    <option
                      key={department.id}
                      value={
                        department.code
                      }
                    >
                      {department.name} (
                      {department.code})
                    </option>
                  )
                )}
              </select>
            </label>

            {/* YEAR */}
            <label className="text-xs font-bold space-y-1">
              <span>Year *</span>

              <select
                className="input"
                required
                value={year}
                onChange={(e) =>
                  setYear(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select year
                </option>

                <option value="1st">
                  1st
                </option>

                <option value="2nd">
                  2nd
                </option>

                <option value="3rd">
                  3rd
                </option>

                <option value="4th">
                  4th
                </option>
              </select>
            </label>

            {/* SECTION */}
            <label className="text-xs font-bold space-y-1">
              <span>Section *</span>

              <select
                className="input"
                required
                value={section}
                onChange={(e) =>
                  setSection(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select section
                </option>

                <option value="A">
                  A
                </option>

                <option value="B">
                  B
                </option>

                <option value="C">
                  C
                </option>

                <option value="D">
                  D
                </option>
              </select>
            </label>
          </div>

          {/* SELECTED EVENT DETAILS */}
          {selectedWorkshop && (
            <div className="rounded-xl bg-white border border-gray-200 p-4 space-y-3">

              <div>
                <div className="font-bold text-base text-[#171717]">
                  {selectedWorkshop.title}
                </div>

                <div className="text-xs text-[#666] mt-1">
                  {selectedWorkshop.category ||
                    'Literature Club Event'}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-[#666]">

                <span>
                  <CalendarDays className="inline w-4 h-4 mr-1" />

                  {selectedWorkshop.dateTime
                    ? new Date(
                        selectedWorkshop.dateTime
                      ).toLocaleString()
                    : 'Date to be announced'}
                </span>

                <span>
                  <MapPin className="inline w-4 h-4 mr-1" />

                  {selectedWorkshop.venue ||
                    'Venue to be announced'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">

                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                  Registration Open
                </span>

                {selectedWorkshop.registrationType ===
                'team' ? (
                  <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold">
                    Team Registration
                    {selectedWorkshop.teamMinSize &&
                    selectedWorkshop.teamMaxSize
                      ? ` · ${selectedWorkshop.teamMinSize}-${selectedWorkshop.teamMaxSize} members`
                      : ''}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold">
                    Individual Registration
                  </span>
                )}

              </div>

              {selectedWorkshop.resourcePerson && (
                <div className="text-xs text-[#666]">
                  Resource Person:{' '}
                  <b className="text-[#171717]">
                    {
                      selectedWorkshop.resourcePerson
                    }
                  </b>
                </div>
              )}

              {selectedWorkshop.description && (
                <div className="text-xs text-[#666] leading-relaxed">
                  {
                    selectedWorkshop.description
                  }
                </div>
              )}

            </div>
          )}

          {/* REGISTER BUTTON */}
          <button
            type="submit"
            disabled={
              saving ||
              !selectedWorkshop ||
              selectedWorkshop.status !==
                'Open' ||
              selectedWorkshop.registrationType ===
                'team'
            }
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white font-bold text-xs flex items-center gap-2 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering…
              </>
            ) : (
              <>
                <UserRound className="w-4 h-4" />
                Register for Event
              </>
            )}
          </button>

          {selectedWorkshop?.registrationType ===
            'team' && (
            <p className="text-xs text-purple-700 bg-purple-50 border border-purple-200 rounded-xl p-3">
              This event is configured for
              team registration. Team
              registration will be added in
              the next step.
            </p>
          )}

        </form>
      )}

      {/* REGISTRATION CONFIRMATION + QR */}
      {confirmation && (
        <RegistrationQrCard
          registration={
            confirmation
          }
        />
      )}

      {/* MY REGISTRATIONS */}
      <div className="space-y-3">

        <h4 className="font-bold text-[#171717]">
          My Registrations
        </h4>

        {registrations.length === 0 ? (
          <div className="py-10 text-center border border-dashed rounded-2xl text-xs text-[#666]">
            You have not registered
            for any event yet.
          </div>
        ) : (
          registrations.map(
            (registration) => (
              <div
                key={registration.id}
                className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center"
              >

                <div className="flex-1">

                  <div className="font-bold text-[#171717]">
                    {
                      registration.eventName
                    }
                  </div>

                  <div className="text-xs text-[#666] mt-1">
                    {
                      registration.departmentCode
                    }{' '}
                    ·{' '}
                    {
                      registration.registerNumber
                    }{' '}
                    ·{' '}
                    {
                      registration.registrationStatus
                    }
                  </div>

                  <div className="text-[10px] text-gray-500 mt-1">
                    Registration ID:{' '}
                    <b>
                      {
                        registration.registrationId
                      }
                    </b>
                  </div>

                </div>

                {registration.registrationStatus ===
                'registered' ? (
                  <button
                    type="button"
                    onClick={() =>
                      void cancel(
                        registration.eventId
                      )
                    }
                    className="px-3 py-2 rounded-xl border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel
                  </button>
                ) : (
                  <span className="text-xs font-bold text-gray-500">
                    Cancelled
                  </span>
                )}

                {registration.registrationStatus ===
                  'registered' && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                )}

              </div>
            )
          )
        )}

      </div>
    </div>
  );
};