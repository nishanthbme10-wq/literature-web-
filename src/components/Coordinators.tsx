import React, {
  useMemo,
} from "react";

import {
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";

import {
  coordinators as fallbackCoordinators,
} from "../data/coordinators";


/* =========================================================
   TYPES
========================================================= */

interface CoordinatorRecord {
  id: string;
  name: string;

  designation?: string;

  department?: string;
  departmentCode?: string;

  role?: string;

  academicYear?: string;
  year?: string;

  bio?: string;

  type?: "faculty" | "student" | string;

  title?: "Mr." | "Ms.";

  photoUrl?: string;
  photoURL?: string;
  avatarUrl?: string;

  active?: boolean;

  userId?: string;
}

/* =========================================================
   NORMALIZE COORDINATOR
========================================================= */

const normalizeCoordinator = (
  item: any,
  index = 0
): CoordinatorRecord => {
  return {
    id: String(
      item?.id ??
        item?.userId ??
        `coordinator-${index}`
    ),

    name: String(
      item?.name ??
        item?.fullName ??
        "Literature Club Coordinator"
    ).trim(),

    designation: String(
      item?.designation ?? ""
    ).trim(),

    department: String(
      item?.department ?? ""
    ).trim(),

    departmentCode: String(
      item?.departmentCode ?? ""
    ).trim(),

    role: String(
      item?.role ??
        "Literature Club Coordinator"
    ).trim(),

    academicYear: String(
      item?.academicYear ?? ""
    ).trim(),

    year: String(
      item?.year ??
        item?.academicYear ??
        ""
    ).trim(),

    bio: String(
      item?.bio ?? ""
    ).trim(),

    type: item?.type,

    title:
      item?.title === "Mr." ||
      item?.title === "Ms."
        ? item.title
        : undefined,

    photoUrl: String(
      item?.photoUrl ??
        item?.photoURL ??
        item?.avatarUrl ??
        ""
    ).trim(),

    photoURL: String(
      item?.photoURL ??
        item?.photoUrl ??
        ""
    ).trim(),

    avatarUrl: String(
      item?.avatarUrl ??
        item?.photoURL ??
        item?.photoUrl ??
        ""
    ).trim(),

    active:
      item?.active !== false,

    userId:
      item?.userId,
  };
};

/* =========================================================
   FACULTY DETECTION
========================================================= */

const isFacultyCoordinator = (
  coordinator: CoordinatorRecord
): boolean => {
  const explicitType =
    String(
      coordinator.type ?? ""
    )
      .toLowerCase()
      .trim();

  if (
    explicitType === "faculty"
  ) {
    return true;
  }

  if (
    explicitType === "student"
  ) {
    return false;
  }

  const role =
    String(
      coordinator.role ?? ""
    ).toLowerCase();

  const designation =
    String(
      coordinator.designation ?? ""
    ).toLowerCase();

  const combined =
    `${role} ${designation}`;

  return (
    combined.includes("faculty") ||
    combined.includes("professor") ||
    combined.includes(
      "assistant professor"
    ) ||
    combined.includes(
      "associate professor"
    ) ||
    combined.includes(
      "head of department"
    ) ||
    combined.includes("hod") ||
    combined.includes("advisor") ||
    combined.includes("mentor") ||
    combined.includes("dean")
  );
};

/* =========================================================
   DEPARTMENT DETECTION
========================================================= */

const getDepartmentGroup = (
  coordinator: CoordinatorRecord
): "BME" | "BT" | "OTHER" => {
  const department =
    `${coordinator.department ?? ""} ${
      coordinator.departmentCode ?? ""
    }`
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  if (
    department.includes(
      "biomedical engineering"
    ) ||
    department.includes("bme")
  ) {
    return "BME";
  }

  if (
    department.includes(
      "biotechnology"
    ) ||
    department.includes(" bt") ||
    department === "bt"
  ) {
    return "BT";
  }

  return "OTHER";
};

/* =========================================================
   INITIALS
========================================================= */

const getInitials = (
  name: string
): string => {
  const cleaned =
    name
      .replace(
        /[^A-Za-z.\s]/g,
        ""
      )
      .replace(
        /\b(dr|prof)\.?/gi,
        ""
      )
      .trim();

  const words =
    cleaned
      .split(/\s+/)
      .filter(Boolean);

  if (
    words.length === 0
  ) {
    return "LC";
  }

  const first =
    words[0]
      ?.replace(/\./g, "")
      ?.charAt(0) ?? "";

  const second =
    words[1]
      ?.replace(/\./g, "")
      ?.charAt(0) ?? "";

  return (
    `${first}${second}`
  ).toUpperCase();
};

/* =========================================================
   DUPLICATE NAME NORMALIZATION
========================================================= */

const normalizeNameForComparison = (
  name: string
): string => {
  return name
    .toLowerCase()
    .replace(
      /\bmr|mrs|ms|miss|dr|prof\b/g,
      ""
    )
    .replace(
      /[^a-z0-9]/g,
      ""
    )
    .trim();
};

/* =========================================================
   DISPLAY NAME
========================================================= */

const getDisplayName = (
  coordinator: CoordinatorRecord
): string => {
  const name =
    coordinator.name.trim();

  if (
    /^(Mr\.|Ms\.)\s/i.test(
      name
    )
  ) {
    return name;
  }

  if (
    coordinator.title
  ) {
    return `${coordinator.title} ${name}`;
  }

  return name;
};

/* =========================================================
   COMPONENT
========================================================= */

const Coordinators: React.FC = () => {
  /* =======================================================
     LOCAL OFFICIAL COORDINATORS

     IMPORTANT:
     The public coordinator page uses ONLY the official
     local coordinator list. Firebase coordinator records
     are not loaded or merged here, so old duplicate names
     cannot appear on the public page.
  ======================================================= */

  /* =======================================================
     LOCAL COORDINATORS
  ======================================================= */

  const localCoordinators =
    useMemo<
      CoordinatorRecord[]
    >(() => {
      return fallbackCoordinators.map(
        (
          item: any,
          index: number
        ) =>
          normalizeCoordinator(
            item,
            index
          )
      );
    }, []);

  /* =======================================================
     PUBLIC COORDINATOR DATA

     Use the official local list only.
     Keep duplicate-name protection inside the local list.
  ======================================================= */

  const effectiveCoordinators =
    useMemo<
      CoordinatorRecord[]
    >(() => {
      const seen =
        new Set<string>();

      const finalRecords: CoordinatorRecord[] =
        [];

      for (const coordinator of localCoordinators) {
        const name =
          coordinator.name.trim();

        if (!name) {
          continue;
        }

        const normalizedName =
          normalizeNameForComparison(
            name
          );

        if (
          !normalizedName ||
          seen.has(normalizedName)
        ) {
          continue;
        }

        seen.add(
          normalizedName
        );

        finalRecords.push(
          coordinator
        );
      }

      return finalRecords;
    }, [localCoordinators]);

  /* =======================================================
     FACULTY
  ======================================================= */

  const facultyCoordinators =
    useMemo(() => {
      return effectiveCoordinators.filter(
        (
          coordinator
        ) =>
          isFacultyCoordinator(
            coordinator
          )
      );
    }, [
      effectiveCoordinators,
    ]);

  /* =======================================================
     STUDENTS
  ======================================================= */

  const studentCoordinators =
    useMemo(() => {
      return effectiveCoordinators.filter(
        (
          coordinator
        ) =>
          !isFacultyCoordinator(
            coordinator
          )
      );
    }, [
      effectiveCoordinators,
    ]);

  /* =======================================================
     BME STUDENTS
  ======================================================= */

  const bmeStudents =
    useMemo(() => {
      return studentCoordinators.filter(
        (
          coordinator
        ) =>
          getDepartmentGroup(
            coordinator
          ) === "BME"
      );
    }, [
      studentCoordinators,
    ]);

  /* =======================================================
     BT STUDENTS
  ======================================================= */

  const btStudents =
    useMemo(() => {
      return studentCoordinators.filter(
        (
          coordinator
        ) =>
          getDepartmentGroup(
            coordinator
          ) === "BT"
      );
    }, [
      studentCoordinators,
    ]);

  /* =======================================================
     OTHER STUDENTS
  ======================================================= */

  const otherStudents =
    useMemo(() => {
      return studentCoordinators.filter(
        (
          coordinator
        ) =>
          getDepartmentGroup(
            coordinator
          ) === "OTHER"
      );
    }, [
      studentCoordinators,
    ]);

  /* =======================================================
     PHOTO URL
  ======================================================= */

  const getPhotoUrl = (
    coordinator: CoordinatorRecord
  ): string => {
    return (
      coordinator.photoUrl ||
      coordinator.photoURL ||
      coordinator.avatarUrl ||
      ""
    );
  };

  /* =======================================================
     FACULTY CARD
  ======================================================= */

  const FacultyCard = ({
    coordinator,
  }: {
    coordinator: CoordinatorRecord;
  }) => {
    const photo =
      getPhotoUrl(
        coordinator
      );

    const initials =
      getInitials(
        coordinator.name
      );

    return (
      <article
        className="
          group
          relative
          overflow-hidden
          rounded-[28px]
          border
          border-[#D4AF37]/30
          bg-white
          p-7
          shadow-[0_8px_30px_rgba(80,60,20,0.06)]
          transition-all
          duration-500
          hover:-translate-y-1
          hover:border-[#D4AF37]/50
          hover:shadow-[0_18px_42px_rgba(80,60,20,0.13)]
        "
      >
        {/* GOLD TOP LINE */}
        <div
          className="
            absolute
            left-0
            right-0
            top-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-[#D4AF37]
            to-transparent
          "
        />

        {/* DECORATION */}
        <div
          className="
            pointer-events-none
            absolute
            -right-14
            -top-14
            h-36
            w-36
            rounded-full
            bg-[#FBF8EF]
            transition-transform
            duration-700
            group-hover:scale-150
          "
        />

        <div
          className="
            relative
            flex
            flex-col
            items-center
            text-center
          "
        >
          {/* AVATAR */}
          <div
            className="
              relative
              mb-6
            "
          >
            <div
              className="
                flex
                h-32
                w-32
                items-center
                justify-center
                rounded-full
                bg-gradient-to-br
                from-[#D4AF37]/20
                via-white
                to-[#F5E7A8]/30
                p-1.5
                ring-8
                ring-[#FBF8EF]
              "
            >
              {photo ? (
                <img
                  src={photo}
                  alt={getDisplayName(
                    coordinator
                  )}
                  className="
                    h-full
                    w-full
                    rounded-full
                    object-cover
                    shadow-lg
                  "
                  onError={(
                    event
                  ) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />
              ) : (
                <div
                  className="
                    flex
                    h-full
                    w-full
                    items-center
                    justify-center
                    rounded-full
                    bg-white
                    text-2xl
                    font-black
                    text-[#A67C00]
                    shadow-lg
                  "
                >
                  {initials}
                </div>
              )}
            </div>

            <span
              className="
                absolute
                bottom-1
                right-1
                h-5
                w-5
                rounded-full
                border-2
                border-white
                bg-emerald-500
                shadow-md
              "
            />
          </div>

          {/* NAME */}
          <h3
            className="
              break-words
              font-serif-title
              text-xl
              font-bold
              leading-snug
              text-[#171717]
              transition-colors
              duration-300
              group-hover:text-[#936F05]
            "
          >
            {getDisplayName(
              coordinator
            )}
          </h3>

          {/* DESIGNATION */}
          {coordinator.designation && (
            <p
              className="
                mt-2
                text-sm
                font-bold
                leading-6
                text-[#A67C00]
              "
            >
              {
                coordinator.designation
              }
            </p>
          )}

          {/* DEPARTMENT */}
          {coordinator.department && (
            <span
              className="
                mt-4
                inline-flex
                max-w-full
                items-center
                rounded-full
                border
                border-[#D4AF37]/20
                bg-[#FBF8EF]
                px-4
                py-1.5
                text-[10px]
                font-extrabold
                uppercase
                tracking-wide
                text-[#8F6D08]
              "
            >
              {coordinator.department}
            </span>
          )}

          {/* FOOTER */}
          <div
            className="
              mt-6
              flex
              items-center
              justify-center
              gap-2
              border-t
              border-[#D4AF37]/15
              pt-4
              text-[10px]
              font-extrabold
              uppercase
              tracking-wider
              text-[#999999]
            "
          >
            <BookOpen
              className="
                h-3.5
                w-3.5
                text-[#D4AF37]
              "
            />

            Faculty Coordinator

            <ArrowUpRight
              className="
                h-3
                w-3
                text-[#D4AF37]
              "
            />
          </div>
        </div>
      </article>
    );
  };

  /* =======================================================
     STUDENT CARD
  ======================================================= */

  const StudentCard = ({
    coordinator,
  }: {
    coordinator: CoordinatorRecord;
  }) => {
    const photo =
      getPhotoUrl(
        coordinator
      );

    const initials =
      getInitials(
        coordinator.name
      );

    return (
      <article
        className="
          group
          min-w-0
          overflow-hidden
          rounded-[24px]
          border
          border-[#D4AF37]/20
          bg-white
          p-5
          text-center
          shadow-[0_8px_25px_rgba(80,60,20,0.05)]
          transition-all
          duration-500
          hover:-translate-y-1
          hover:border-[#D4AF37]/45
          hover:shadow-[0_16px_38px_rgba(80,60,20,0.11)]
        "
      >
        {/* TOP GOLD LINE */}
        <div
          className="
            absolute
            left-0
            right-0
            top-0
            h-px
            bg-[#D4AF37]/20
          "
        />

        {/* PHOTO */}
        <div
          className="
            relative
            mx-auto
            mb-5
            h-24
            w-24
          "
        >
          <div
            className="
              h-full
              w-full
              rounded-full
              bg-gradient-to-br
              from-[#D4AF37]/20
              via-white
              to-[#F5E7A8]/30
              p-1.5
              ring-8
              ring-[#FBF8EF]
            "
          >
            {photo ? (
              <img
                src={photo}
                alt={getDisplayName(
                  coordinator
                )}
                className="
                  h-full
                  w-full
                  rounded-full
                  object-cover
                  shadow-md
                "
                onError={(
                  event
                ) => {
                  event.currentTarget.style.display =
                    "none";
                }}
              />
            ) : (
              <div
                className="
                  flex
                  h-full
                  w-full
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-xl
                  font-black
                  text-[#A67C00]
                  shadow-md
                "
              >
                {initials}
              </div>
            )}
          </div>

          <span
            className="
              absolute
              bottom-0
              right-0
              h-4
              w-4
              rounded-full
              border-2
              border-white
              bg-emerald-500
              shadow-sm
            "
          />
        </div>

        {/* NAME */}
        <h3
          className="
            break-words
            font-serif-title
            text-lg
            font-bold
            leading-snug
            text-[#171717]
            transition-colors
            duration-300
            group-hover:text-[#936F05]
          "
        >
          {getDisplayName(
            coordinator
          )}
        </h3>

        {/* YEAR */}
        {(coordinator.year ||
          coordinator.academicYear) && (
          <span
            className="
              mt-3
              inline-flex
              rounded-full
              bg-[#F8F8F8]
              px-3
              py-1
              text-[10px]
              font-bold
              text-[#777777]
            "
          >
            {coordinator.year ||
              coordinator.academicYear}
          </span>
        )}

        {/* GOLD DIVIDER */}
        <div
          className="
            mx-auto
            mt-4
            flex
            items-center
            justify-center
            gap-2
          "
        >
          <div
            className="
              h-px
              w-7
              bg-[#D4AF37]
            "
          />

          <span
            className="
              h-1.5
              w-1.5
              rotate-45
              bg-[#D4AF37]
            "
          />

          <div
            className="
              h-px
              w-7
              bg-[#D4AF37]
            "
          />
        </div>

        {/* ROLE */}
        <div
          className="
            mt-3
            flex
            items-center
            justify-center
            gap-1.5
            text-[9px]
            font-extrabold
            uppercase
            tracking-[0.12em]
            text-[#999999]
          "
        >
          <UserRound
            className="
              h-3
              w-3
              text-[#D4AF37]
            "
          />

          Student Coordinator
        </div>
      </article>
    );
  };

  /* =======================================================
     DEPARTMENT PANEL
  ======================================================= */

  const DepartmentPanel = ({
    title,
    subtitle,
    students,
  }: {
    title: string;
    subtitle: string;
    students: CoordinatorRecord[];
  }) => {
    return (
      <div
        className="
          relative
          overflow-hidden
          rounded-[28px]
          border
          border-[#D4AF37]/30
          bg-white
          p-5
          shadow-[0_10px_35px_rgba(80,60,20,0.05)]
          sm:p-7
        "
      >
        {/* TOP LEFT CORNER */}
        <div
          className="
            absolute
            left-3
            top-3
            h-6
            w-6
            rounded-tl-lg
            border-l
            border-t
            border-[#D4AF37]/60
          "
        />

        {/* TOP RIGHT CORNER */}
        <div
          className="
            absolute
            right-3
            top-3
            h-6
            w-6
            rounded-tr-lg
            border-r
            border-t
            border-[#D4AF37]/60
          "
        />

        {/* BOTTOM LEFT CORNER */}
        <div
          className="
            absolute
            bottom-3
            left-3
            h-6
            w-6
            rounded-bl-lg
            border-b
            border-l
            border-[#D4AF37]/60
          "
        />

        {/* BOTTOM RIGHT CORNER */}
        <div
          className="
            absolute
            bottom-3
            right-3
            h-6
            w-6
            rounded-br-lg
            border-b
            border-r
            border-[#D4AF37]/60
          "
        />

        {/* HEADER */}
        <div
          className="
            relative
            mb-8
            flex
            flex-col
            items-center
            text-center
          "
        >
          <div
            className="
              flex
              w-full
              items-center
              justify-center
              gap-3
            "
          >
            <div
              className="
                hidden
                h-px
                flex-1
                bg-gradient-to-r
                from-transparent
                to-[#D4AF37]
                sm:block
              "
            />

            <span
              className="
                shrink-0
                rounded-full
                border
                border-[#D4AF37]/45
                bg-[#FBF8EF]
                px-5
                py-2
                font-serif-title
                text-sm
                font-bold
                text-[#171717]
              "
            >
              {title}
            </span>

            <div
              className="
                hidden
                h-px
                flex-1
                bg-gradient-to-l
                from-transparent
                to-[#D4AF37]
                sm:block
              "
            />
          </div>

          <p
            className="
              mt-2
              text-xs
              text-[#777777]
            "
          >
            {subtitle}
          </p>

          <div
            className="
              mt-3
              flex
              items-center
              gap-2
            "
          >
            <div
              className="
                h-px
                w-8
                bg-[#D4AF37]
              "
            />

            <span
              className="
                h-1.5
                w-1.5
                rotate-45
                bg-[#D4AF37]
              "
            />

            <div
              className="
                h-px
                w-8
                bg-[#D4AF37]
              "
            />
          </div>
        </div>

        {/* STUDENTS */}

        {students.length > 0 ? (
          <div
            className="
              grid
              grid-cols-1
              gap-5
              sm:grid-cols-2
            "
          >
            {students.map(
              (
                student
              ) => (
                /*
                 * IMPORTANT:
                 * key is attached to the
                 * Fragment, not StudentCard.
                 *
                 * This fixes:
                 *
                 * Property 'key' does not exist
                 * on type '{ coordinator: ... }'
                 */
                <React.Fragment
                  key={
                    student.id
                  }
                >
                  <StudentCard
                    coordinator={
                      student
                    }
                  />
                </React.Fragment>
              )
            )}
          </div>
        ) : (
          <div
            className="
              rounded-2xl
              border
              border-dashed
              border-[#D4AF37]/30
              bg-[#FBFAF6]
              px-5
              py-12
              text-center
            "
          >
            <UsersRound
              className="
                mx-auto
                h-9
                w-9
                text-[#D4AF37]
              "
            />

            <p
              className="
                mt-3
                text-sm
                font-medium
                text-[#777777]
              "
            >
              No student coordinators
              available.
            </p>
          </div>
        )}
      </div>
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      id="coordinators"
      className="
        relative
        overflow-hidden
        bg-[#FBFAF6]
        px-4
        py-16
        text-[#171717]
        sm:px-6
        md:py-24
        lg:px-8
      "
    >
      {/* ===================================================
          BACKGROUND DECORATION
      =================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-40
          -top-40
          h-[420px]
          w-[420px]
          rounded-full
          bg-[#D4AF37]/7
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-40
          -right-40
          h-[440px]
          w-[440px]
          rounded-full
          bg-[#D4AF37]/6
          blur-3xl
        "
      />

      {/* ===================================================
          MAIN
      =================================================== */}

      <div
        className="
          relative
          mx-auto
          max-w-7xl
        "
      >
        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div
          className="
            mx-auto
            mb-16
            max-w-3xl
            text-center
          "
        >
          <div
            className="
              inline-flex
              items-center
              gap-2
              text-[10px]
              font-extrabold
              uppercase
              tracking-[0.22em]
              text-[#A67C00]
            "
          >
            <Sparkles
              className="
                h-4
                w-4
              "
            />

            Literature Club Leadership
          </div>

          <h1
            className="
              mt-3
              font-serif-title
              text-4xl
              font-bold
              text-[#171717]
              sm:text-5xl
            "
          >
            Coordinators
          </h1>

          <div
            className="
              mx-auto
              mt-4
              flex
              items-center
              justify-center
              gap-3
            "
          >
            <div
              className="
                h-px
                w-14
                bg-gradient-to-r
                from-transparent
                to-[#D4AF37]
              "
            />

            <span
              className="
                h-2
                w-2
                rotate-45
                bg-[#D4AF37]
              "
            />

            <div
              className="
                h-px
                w-14
                bg-gradient-to-l
                from-transparent
                to-[#D4AF37]
              "
            />
          </div>

          <p
            className="
              mx-auto
              mt-5
              max-w-2xl
              text-sm
              leading-7
              text-[#777777]
              sm:text-base
            "
          >
            The people who guide, support,
            and coordinate the activities
            of the Literature Club at
            V.S.B. Engineering College.
          </p>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {/* =================================================
            FACULTY SECTION
        ================================================= */}

        <div className="mb-20">
          <div
            className="
              mb-9
              flex
              flex-col
              items-center
              text-center
            "
          >
            <div
              className="
                inline-flex
                items-center
                gap-2
                text-[10px]
                font-extrabold
                uppercase
                tracking-[0.2em]
                text-[#A67C00]
              "
            >
              <GraduationCap
                className="
                  h-4
                  w-4
                "
              />

              Guidance & Leadership
            </div>

            <h2
              className="
                mt-2
                font-serif-title
                text-2xl
                font-bold
                text-[#171717]
                sm:text-3xl
              "
            >
              Faculty Coordinators
            </h2>

            <div
              className="
                mt-4
                h-px
                w-20
                bg-gradient-to-r
                from-transparent
                via-[#D4AF37]
                to-transparent
              "
            />
          </div>

          <div
            className="
              mx-auto
              grid
              max-w-5xl
              grid-cols-1
              gap-7
              md:grid-cols-2
            "
          >
            {facultyCoordinators.map(
              (
                coordinator
              ) => (
                <React.Fragment
                  key={
                    coordinator.id
                  }
                >
                  <FacultyCard
                    coordinator={
                      coordinator
                    }
                  />
                </React.Fragment>
              )
            )}
          </div>
        </div>

        {/* =================================================
            STUDENT SECTION
        ================================================= */}

        <div>
          <div
            className="
              mb-10
              flex
              flex-col
              items-center
              text-center
            "
          >
            <div
              className="
                inline-flex
                items-center
                gap-2
                text-[10px]
                font-extrabold
                uppercase
                tracking-[0.2em]
                text-[#A67C00]
              "
            >
              <UsersRound
                className="
                  h-4
                  w-4
                "
              />

              Student Leadership
            </div>

            <h2
              className="
                mt-2
                font-serif-title
                text-2xl
                font-bold
                text-[#171717]
                sm:text-3xl
              "
            >
              Student Coordinators
            </h2>

            <div
              className="
                mt-4
                h-px
                w-20
                bg-gradient-to-r
                from-transparent
                via-[#D4AF37]
                to-transparent
              "
            />

            <p
              className="
                mx-auto
                mt-4
                max-w-xl
                text-sm
                leading-6
                text-[#777777]
              "
            >
              Our student coordinators who
              actively contribute their ideas,
              energy and creativity to every
              Literature Club activity.
            </p>
          </div>

          {/* ===============================================
              BME + BT
          =============================================== */}

          <div
            className="
              grid
              grid-cols-1
              gap-7
              lg:grid-cols-2
            "
          >
            <DepartmentPanel
              title="BME Department"
              subtitle="Biomedical Engineering"
              students={
                bmeStudents
              }
            />

            <DepartmentPanel
              title="BT Department"
              subtitle="Biotechnology"
              students={
                btStudents
              }
            />
          </div>

          {/* ===============================================
              OTHER DEPARTMENTS
          =============================================== */}

          {otherStudents.length >
            0 && (
            <div className="mt-7">
              <DepartmentPanel
                title="Other Departments"
                subtitle="Literature Club"
                students={
                  otherStudents
                }
              />
            </div>
          )}
        </div>

        {/* =================================================
            BOTTOM NOTE
        ================================================= */}

        <div
          className="
            mx-auto
            mt-16
            max-w-2xl
            text-center
          "
        >
          <div
            className="
              mx-auto
              mb-5
              flex
              items-center
              justify-center
              gap-3
            "
          >
            <div
              className="
                h-px
                w-16
                bg-gradient-to-r
                from-transparent
                to-[#D4AF37]
              "
            />

            <Sparkles
              className="
                h-4
                w-4
                text-[#D4AF37]
              "
            />

            <div
              className="
                h-px
                w-16
                bg-gradient-to-l
                from-transparent
                to-[#D4AF37]
              "
            />
          </div>

          <p
            className="
              text-xs
              leading-6
              text-[#888888]
              sm:text-sm
            "
          >
            Together, our faculty and student
            coordinators help organize events,
            encourage participation and make
            the Literature Club a vibrant
            community of readers, writers and
            creative thinkers.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Coordinators;