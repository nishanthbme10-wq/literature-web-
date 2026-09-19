import React, { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  User as UserIcon,
  ExternalLink,
  Clock,
  Plus,
  Edit3,
  Trash2,
  X,
} from "lucide-react";

import { Workshop, User } from "../types";

interface UpcomingWorkshopSectionProps {
  workshops?: Workshop[];
  currentUser?: User | null;

  onRegisterClick: (
    workshop: Workshop
  ) => void;

  onAddWorkshop?: (
    ws: Partial<Workshop>
  ) => void;

  onUpdateWorkshop?: (
    id: string,
    updated: Partial<Workshop>
  ) => void;

  onDeleteWorkshop?: (
    id: string
  ) => void;
}

type RegistrationType =
  | "individual"
  | "team";

interface WorkshopFormData {
  title: string;
  eventCode: string;
  posterUrl: string;
  dateTime: string;
  venue: string;
  resourcePerson: string;
  description: string;
  registrationType: RegistrationType;
  teamMinSize: number;
  teamMaxSize: number;
  googleFormUrl: string;
  status:
    | "Open"
    | "Closed"
    | "Completed";
  category: string;
}

const emptyFormData: WorkshopFormData = {
  title: "",
  eventCode: "",
  posterUrl: "",
  dateTime: "",
  venue: "",
  resourcePerson: "",
  description: "",
  registrationType: "individual",
  teamMinSize: 2,
  teamMaxSize: 4,
  googleFormUrl: "",
  status: "Open",
  category: "Academic Research",
};

export const UpcomingWorkshopSection: React.FC<
  UpcomingWorkshopSectionProps
> = ({
  workshops = [],
  currentUser,
  onRegisterClick,
  onAddWorkshop,
  onUpdateWorkshop,
  onDeleteWorkshop,
}) => {
  // ==========================================================
  // ACCESS CONTROL
  // ==========================================================

  const isStaff =
    !!currentUser &&
    (currentUser.role === "admin" ||
      currentUser.role === "coordinator");

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    activeCategory,
    setActiveCategory,
  ] = useState<string>("All");

  const [
    editingWs,
    setEditingWs,
  ] = useState<Workshop | null>(null);

  const [
    isAdding,
    setIsAdding,
  ] = useState(false);

  const [
    formData,
    setFormData,
  ] = useState<WorkshopFormData>(
    emptyFormData
  );

  // ==========================================================
  // SELECTED WORKSHOP FOR FULL DETAILS POPUP
  // ==========================================================

  const [
    selectedWorkshop,
    setSelectedWorkshop,
  ] = useState<Workshop | null>(null);

  // ==========================================================
  // CLOSE POPUP WITH ESCAPE
  // ==========================================================

  useEffect(() => {
    if (!selectedWorkshop) {
      return;
    }

    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setSelectedWorkshop(null);
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [selectedWorkshop]);

  // ==========================================================
  // BODY SCROLL LOCK WHILE MODAL IS OPEN
  // ==========================================================

  useEffect(() => {
    if (!selectedWorkshop) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [selectedWorkshop]);

  // ==========================================================
  // CATEGORY FILTERS
  // ==========================================================

  const categories = [
    "All",
    "Open Registrations",
    "Academic Research",
    "Elocution & Debate",
    "Creative Writing",
    "Literature Workshop",
  ];

  // ==========================================================
  // FILTERED WORKSHOPS
  // ==========================================================

  const filteredWorkshops =
    workshops.filter((ws) => {
      if (activeCategory === "All") {
        return true;
      }

      if (
        activeCategory ===
        "Open Registrations"
      ) {
        return ws.status === "Open";
      }

      return (
        ws.category
          ?.toLowerCase()
          .includes(
            activeCategory.toLowerCase()
          ) || false
      );
    });

  // ==========================================================
  // EVENT CODE NORMALIZER
  // ==========================================================

  const normalizeEventCode = (
    value: string
  ) => {
    return value
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "-")
      .replace(
        /[^A-Z0-9-]/g,
        ""
      )
      .slice(0, 20);
  };

  // ==========================================================
  // GOOGLE FORM VALIDATION
  // ==========================================================

  const isValidGoogleFormUrl = (
    value: string
  ) => {
    try {
      const url = new URL(
        value.trim()
      );

      if (
        url.protocol !== "https:"
      ) {
        return false;
      }

      if (
        url.hostname === "forms.gle"
      ) {
        return url.pathname.length > 1;
      }

      if (
        url.hostname ===
        "docs.google.com"
      ) {
        return url.pathname.startsWith(
          "/forms"
        );
      }

      if (
        url.hostname ===
        "forms.google.com"
      ) {
        return url.pathname.startsWith(
          "/forms"
        );
      }

      return false;
    } catch {
      return false;
    }
  };

  // ==========================================================
  // SAFE DISPLAY TITLE
  // ==========================================================

  const getDisplayTitle = (
    workshop: Workshop
  ) => {
    const title = String(
      workshop.title || ""
    ).trim();

    if (!title) {
      return "Literature Club Event";
    }

    if (
      /^https?:\/\//i.test(title)
    ) {
      return "Literature Club Event";
    }

    if (title.startsWith("www.")) {
      return "Literature Club Event";
    }

    return title;
  };

  // ==========================================================
  // DATE FORMATTER
  // ==========================================================

  const formatDateTime = (
    value?: string
  ) => {
    if (!value?.trim()) {
      return "Date to be announced";
    }

    const raw = value.trim();

    const parsed = new Date(raw);

    if (
      !Number.isNaN(
        parsed.getTime()
      )
    ) {
      return parsed.toLocaleString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }
      );
    }

    const customMatch =
      raw.match(
        /^(\d{4}-\d{2}-\d{2})\s+at\s+(.+)$/i
      );

    if (customMatch) {
      const parsedCustom =
        new Date(
          `${customMatch[1]} ${customMatch[2]}`
        );

      if (
        !Number.isNaN(
          parsedCustom.getTime()
        )
      ) {
        return parsedCustom.toLocaleString(
          "en-IN",
          {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }
        );
      }
    }

    return raw;
  };

  // ==========================================================
  // RESET FORM
  // ==========================================================

  const resetForm = () => {
    setIsAdding(false);
    setEditingWs(null);
    setFormData({
      ...emptyFormData,
    });
  };

  // ==========================================================
  // START ADD
  // ==========================================================

  const startAdd = () => {
    setIsAdding(true);
    setEditingWs(null);

    setFormData({
      ...emptyFormData,
      category:
        "Elocution & Debate",
    });
  };

  // ==========================================================
  // START EDIT
  // ==========================================================

  const startEdit = (
    ws: Workshop
  ) => {
    setEditingWs(ws);
    setIsAdding(false);

    setFormData({
      title:
        ws.title || "",
      eventCode:
        ws.eventCode || "",
      posterUrl:
        ws.posterUrl || "",
      dateTime:
        ws.dateTime || "",
      venue:
        ws.venue || "",
      resourcePerson:
        ws.resourcePerson || "",
      description:
        ws.description || "",
      registrationType:
        ws.registrationType ||
        "individual",
      teamMinSize:
        ws.teamMinSize || 2,
      teamMaxSize:
        ws.teamMaxSize || 4,
      googleFormUrl:
        ws.googleFormUrl || "",
      status:
        ws.status || "Open",
      category:
        ws.category ||
        "Academic Research",
    });
  };

  // ==========================================================
  // SAVE EVENT
  // ==========================================================

  const handleSave = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert(
        "Please enter the event title."
      );
      return;
    }

    const normalizedEventCode =
      normalizeEventCode(
        formData.eventCode
      );

    if (!normalizedEventCode) {
      alert(
        "Please enter a valid Event Code such as POETRY, DEBATE, or QUIZ."
      );
      return;
    }

    if (
      !formData.googleFormUrl.trim()
    ) {
      alert(
        "Please enter the Google Form registration link."
      );
      return;
    }

    if (
      !isValidGoogleFormUrl(
        formData.googleFormUrl
      )
    ) {
      alert(
        "Please enter a valid Google Forms link.\n\nExample:\nhttps://forms.gle/xxxxxxxx"
      );
      return;
    }

    if (
      formData.registrationType ===
      "team"
    ) {
      if (
        formData.teamMinSize < 1 ||
        formData.teamMaxSize < 1 ||
        formData.teamMinSize >
          formData.teamMaxSize
      ) {
        alert(
          "Please enter a valid minimum and maximum team size."
        );
        return;
      }
    }

    const payload: Partial<Workshop> =
      {
        title:
          formData.title.trim(),

        eventCode:
          normalizedEventCode,

        posterUrl:
          formData.posterUrl.trim(),

        dateTime:
          formData.dateTime.trim(),

        venue:
          formData.venue.trim(),

        resourcePerson:
          formData.resourcePerson.trim(),

        description:
          formData.description.trim(),

        registrationType:
          formData.registrationType,

        teamMinSize:
          formData.registrationType ===
          "team"
            ? formData.teamMinSize
            : undefined,

        teamMaxSize:
          formData.registrationType ===
          "team"
            ? formData.teamMaxSize
            : undefined,

        googleFormUrl:
          formData.googleFormUrl.trim(),

        status:
          formData.status,

        category:
          formData.category,
      };

    // UPDATE
    if (
      editingWs &&
      onUpdateWorkshop
    ) {
      onUpdateWorkshop(
        editingWs.id,
        payload
      );

      resetForm();
      return;
    }

    // ADD
    if (onAddWorkshop) {
      onAddWorkshop(
        payload
      );

      resetForm();
    }
  };

  // ==========================================================
  // REGISTER
  // ==========================================================

  const registerForWorkshop = (
    workshop: Workshop
  ) => {
    if (
      workshop.status !==
      "Open"
    ) {
      return;
    }

    if (
      !workshop.googleFormUrl?.trim()
    ) {
      alert(
        "Registration form is not available for this event."
      );
      return;
    }

    setSelectedWorkshop(null);

    onRegisterClick(
      workshop
    );
  };

  // ==========================================================
  // DELETE EVENT
  // ==========================================================

  const deleteWorkshop = (
    workshop: Workshop
  ) => {
    const displayTitle =
      getDisplayTitle(
        workshop
      );

    const confirmed =
      window.confirm(
        `Delete event "${displayTitle}"?`
      );

    if (!confirmed) {
      return;
    }

    onDeleteWorkshop?.(
      workshop.id
    );
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <section
      id="workshops"
      className="
        py-16 md:py-24
        bg-white
        text-[#171717]
        px-4 sm:px-6
        border-b border-[#D4AF37]/25
      "
    >
      <div className="max-w-7xl mx-auto space-y-12">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div
          className="
            flex
            flex-col
            md:flex-row
            md:items-end
            md:justify-between
            gap-6
            border-b
            border-[#D4AF37]/20
            pb-6
          "
        >

          <div className="space-y-2 min-w-0">

            <span
              className="
                inline-flex
                max-w-fit
                text-[#A67C00]
                text-xs
                font-bold
                tracking-widest
                uppercase
                bg-gradient-to-r
                from-[#D4AF37]/15
                to-[#F5E7A8]/30
                px-3.5
                py-1.5
                rounded-full
                border
                border-[#D4AF37]/40
                shadow-sm
              "
            >
              Workshops &
              Masterclasses
            </span>

            <h2
              className="
                font-serif-title
                text-3xl
                md:text-4xl
                font-black
                text-[#171717]
                break-words
              "
            >
              Upcoming Literary
              Workshops
            </h2>

            <p
              className="
                text-[#666666]
                text-sm
                max-w-2xl
                leading-7
                break-words
              "
            >
              Enroll in expert-led
              sessions on paper
              writing, public
              speaking, poetry, and
              debate. Complete
              attendance and
              feedback to earn
              verified e-certificates.
            </p>

          </div>

          <div className="flex flex-wrap items-center gap-3 min-w-0">

            {/* CATEGORY FILTERS */}

            <div className="flex flex-wrap gap-2 min-w-0">

              {categories.map(
                (category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      setActiveCategory(
                        category
                      )
                    }
                    className={`
                      px-3.5
                      py-1.5
                      rounded-xl
                      text-xs
                      font-bold
                      transition-all
                      cursor-pointer
                      whitespace-nowrap
                      ${
                        activeCategory ===
                        category
                          ? "bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white shadow-[0_2px_10px_rgba(212,175,55,0.3)]"
                          : "bg-[#FAFAFA] text-[#666666] hover:text-[#171717] hover:bg-[#D4AF37]/10 border border-gray-200"
                      }
                    `}
                  >
                    {category}
                  </button>
                )
              )}

            </div>

            {/* ADD EVENT */}

            {isStaff && (
              <button
                type="button"
                onClick={startAdd}
                className="
                  px-4
                  py-2
                  bg-gradient-to-r
                  from-[#D4AF37]
                  to-[#A67C00]
                  text-white
                  font-bold
                  text-xs
                  uppercase
                  tracking-wider
                  rounded-xl
                  shadow-md
                  hover:shadow-[0_4px_16px_rgba(212,175,55,0.35)]
                  transition-all
                  flex
                  items-center
                  gap-1.5
                  border
                  border-[#F5E7A8]/40
                  cursor-pointer
                  whitespace-nowrap
                "
              >
                <Plus className="w-4 h-4" />

                <span>
                  Add Event
                </span>
              </button>
            )}

          </div>
        </div>

        {/* ==================================================
            ADD / EDIT FORM
        ================================================== */}

        {(isAdding ||
          editingWs) && (
          <div
            className="
              p-6
              bg-[#FAFAFA]
              border
              border-[#D4AF37]
              rounded-3xl
              shadow-xl
              max-w-3xl
              mx-auto
              space-y-5
            "
          >

            <div className="flex items-start justify-between gap-4">

              <div className="min-w-0">

                <h3 className="font-serif-title text-lg font-bold text-[#171717] break-words">

                  {editingWs
                    ? `Edit Event Details: ${getDisplayTitle(
                        editingWs
                      )}`
                    : "Add New Event / Workshop"}

                </h3>

                <p className="text-xs text-[#666666] mt-1 leading-5">
                  Create an event,
                  assign an event code,
                  and connect its
                  Google registration
                  form.
                </p>

              </div>

              <button
                type="button"
                onClick={resetForm}
                className="
                  shrink-0
                  w-9
                  h-9
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  flex
                  items-center
                  justify-center
                  hover:bg-gray-50
                  cursor-pointer
                "
                aria-label="Close form"
              >
                <X className="w-4 h-4" />
              </button>

            </div>

            <form
              onSubmit={handleSave}
              className="space-y-4 text-xs"
            >

              {/* EVENT TITLE */}

              <div>

                <label className="block font-bold text-[#171717] mb-1">
                  Event Title *
                </label>

                <input
                  type="text"
                  required
                  value={
                    formData.title
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title:
                        e.target
                          .value,
                    })
                  }
                  placeholder="e.g. Poetry Writing Competition"
                  className="
                    w-full
                    p-2.5
                    bg-white
                    border
                    border-gray-300
                    rounded-xl
                    text-xs
                    font-semibold
                    focus:border-[#D4AF37]
                    focus:outline-none
                  "
                />

              </div>

              {/* EVENT CODE */}

              <div>

                <label className="block font-bold text-[#A67C00] mb-1">
                  Event Code *
                </label>

                <input
                  type="text"
                  required
                  value={
                    formData.eventCode
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      eventCode:
                        normalizeEventCode(
                          e.target.value
                        ),
                    })
                  }
                  placeholder="e.g. POETRY"
                  maxLength={20}
                  className="
                    w-full
                    p-2.5
                    bg-white
                    border
                    border-[#D4AF37]/40
                    rounded-xl
                    text-xs
                    font-mono
                    font-bold
                    uppercase
                    focus:border-[#D4AF37]
                    focus:outline-none
                  "
                />

                <p className="text-[10px] text-[#777777] mt-1">
                  Used later for
                  automatic registration
                  IDs.
                </p>

              </div>

              {/* DATE + VENUE */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>

                  <label className="block font-bold text-[#171717] mb-1">
                    Date & Time *
                  </label>

                  <input
                    type="text"
                    required
                    value={
                      formData.dateTime
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dateTime:
                          e.target
                            .value,
                      })
                    }
                    placeholder="October 20, 2026 at 10:00 AM"
                    className="
                      w-full
                      p-2.5
                      bg-white
                      border
                      border-gray-300
                      rounded-xl
                      text-xs
                      focus:border-[#D4AF37]
                      focus:outline-none
                    "
                  />

                </div>

                <div>

                  <label className="block font-bold text-[#171717] mb-1">
                    Venue *
                  </label>

                  <input
                    type="text"
                    required
                    value={
                      formData.venue
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        venue:
                          e.target
                            .value,
                      })
                    }
                    placeholder="Seminar Hall 1"
                    className="
                      w-full
                      p-2.5
                      bg-white
                      border
                      border-gray-300
                      rounded-xl
                      text-xs
                      focus:border-[#D4AF37]
                      focus:outline-none
                    "
                  />

                </div>

              </div>

              {/* RESOURCE + STATUS */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>

                  <label className="block font-bold text-[#171717] mb-1">
                    Resource Speaker *
                  </label>

                  <input
                    type="text"
                    required
                    value={
                      formData.resourcePerson
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        resourcePerson:
                          e.target
                            .value,
                      })
                    }
                    placeholder="Prof. / Dr. Name"
                    className="
                      w-full
                      p-2.5
                      bg-white
                      border
                      border-gray-300
                      rounded-xl
                      text-xs
                      focus:border-[#D4AF37]
                      focus:outline-none
                    "
                  />

                </div>

                <div>

                  <label className="block font-bold text-[#171717] mb-1">
                    Status
                  </label>

                  <select
                    value={
                      formData.status
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status:
                          e.target.value as WorkshopFormData["status"],
                      })
                    }
                    className="
                      w-full
                      p-2.5
                      bg-white
                      border
                      border-gray-300
                      rounded-xl
                      text-xs
                      font-bold
                      focus:border-[#D4AF37]
                      focus:outline-none
                    "
                  >

                    <option value="Open">
                      Registration Open
                    </option>

                    <option value="Closed">
                      Registration Closed
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                  </select>

                </div>

              </div>

              {/* CATEGORY + POSTER */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>

                  <label className="block font-bold text-[#171717] mb-1">
                    Category
                  </label>

                  <select
                    value={
                      formData.category
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category:
                          e.target
                            .value,
                      })
                    }
                    className="
                      w-full
                      p-2.5
                      bg-white
                      border
                      border-gray-300
                      rounded-xl
                      text-xs
                      focus:border-[#D4AF37]
                      focus:outline-none
                    "
                  >

                    <option value="Academic Research">
                      Academic Research
                    </option>

                    <option value="Elocution & Debate">
                      Elocution & Debate
                    </option>

                    <option value="Creative Writing">
                      Creative Writing
                    </option>

                    <option value="Literature Workshop">
                      Literature Workshop
                    </option>

                  </select>

                </div>

                <div>

                  <label className="block font-bold text-[#171717] mb-1">
                    Poster Image URL
                  </label>

                  <input
                    type="url"
                    value={
                      formData.posterUrl
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        posterUrl:
                          e.target
                            .value,
                      })
                    }
                    placeholder="https://..."
                    className="
                      w-full
                      p-2.5
                      bg-white
                      border
                      border-gray-300
                      rounded-xl
                      text-xs
                      focus:border-[#D4AF37]
                      focus:outline-none
                    "
                  />

                </div>

              </div>

              {/* REGISTRATION TYPE */}

              <div className="p-4 bg-white border border-[#D4AF37]/50 rounded-2xl space-y-3">

                <div>

                  <label className="block font-bold text-[#A67C00] uppercase">
                    Registration Type
                  </label>

                  <p className="text-[11px] text-[#777777] mt-1">
                    Choose individual
                    or team
                    registration.
                  </p>

                </div>

                <select
                  value={
                    formData.registrationType
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registrationType:
                        e.target
                          .value as RegistrationType,
                    })
                  }
                  className="
                    w-full
                    p-2.5
                    bg-[#FAFAFA]
                    border
                    border-gray-300
                    rounded-xl
                    text-xs
                    font-bold
                    focus:border-[#D4AF37]
                    focus:outline-none
                  "
                >

                  <option value="individual">
                    Individual Registration
                  </option>

                  <option value="team">
                    Team Registration
                  </option>

                </select>

                {formData.registrationType ===
                  "team" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">

                    <div>

                      <label className="block font-bold mb-1">
                        Minimum Team Size *
                      </label>

                      <input
                        type="number"
                        min={1}
                        required
                        value={
                          formData.teamMinSize
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            teamMinSize:
                              Number(
                                e.target
                                  .value
                              ),
                          })
                        }
                        className="
                          w-full
                          p-2.5
                          bg-[#FAFAFA]
                          border
                          border-gray-300
                          rounded-xl
                          focus:border-[#D4AF37]
                          focus:outline-none
                        "
                      />

                    </div>

                    <div>

                      <label className="block font-bold mb-1">
                        Maximum Team Size *
                      </label>

                      <input
                        type="number"
                        min={1}
                        required
                        value={
                          formData.teamMaxSize
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            teamMaxSize:
                              Number(
                                e.target
                                  .value
                              ),
                          })
                        }
                        className="
                          w-full
                          p-2.5
                          bg-[#FAFAFA]
                          border
                          border-gray-300
                          rounded-xl
                          focus:border-[#D4AF37]
                          focus:outline-none
                        "
                      />

                    </div>

                  </div>
                )}

              </div>

              {/* GOOGLE FORM */}

              <div className="p-4 bg-white border border-[#D4AF37]/50 rounded-2xl space-y-2">

                <label className="block font-bold text-[#A67C00] uppercase">
                  🔗 Registration
                  Google Form Link *
                </label>

                <p className="text-[11px] text-[#666666]">
                  Create one Google
                  Form for this event
                  and paste the
                  public/share link.
                </p>

                <input
                  type="url"
                  required
                  value={
                    formData.googleFormUrl
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      googleFormUrl:
                        e.target
                          .value,
                    })
                  }
                  placeholder="https://forms.gle/xxxxxxxx"
                  className="
                    w-full
                    p-2.5
                    bg-[#FAFAFA]
                    border
                    border-gray-300
                    rounded-xl
                    font-mono
                    text-xs
                    focus:border-[#D4AF37]
                    focus:outline-none
                  "
                />

                <p className="text-[10px] text-[#999999]">
                  Supported:
                  forms.gle and
                  docs.google.com/forms
                </p>

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="block font-bold text-[#171717] mb-1">
                  Event Description
                </label>

                <textarea
                  rows={5}
                  value={
                    formData.description
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description:
                        e.target
                          .value,
                    })
                  }
                  placeholder="Describe the event..."
                  className="
                    w-full
                    p-2.5
                    bg-white
                    border
                    border-gray-300
                    rounded-xl
                    text-xs
                    focus:border-[#D4AF37]
                    focus:outline-none
                    resize-y
                  "
                />

              </div>

              {/* BUTTONS */}

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">

                <button
                  type="button"
                  onClick={resetForm}
                  className="
                    px-4
                    py-2
                    bg-gray-200
                    text-[#666666]
                    font-bold
                    rounded-xl
                    cursor-pointer
                    hover:bg-gray-300
                    transition-colors
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="
                    px-6
                    py-2
                    bg-gradient-to-r
                    from-[#D4AF37]
                    to-[#C9A227]
                    text-white
                    font-bold
                    rounded-xl
                    shadow-md
                    cursor-pointer
                    hover:shadow-lg
                    transition-all
                  "
                >
                  {editingWs
                    ? "Update Event"
                    : "Save Event Details"}
                </button>

              </div>

            </form>
          </div>
        )}

        {/* ==================================================
            EVENT CARDS
        ================================================== */}

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-6
            xl:gap-8
          "
        >

          {filteredWorkshops.map(
            (ws) => {
              const displayTitle =
                getDisplayTitle(ws);

              return (
                <article
                  key={ws.id}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    setSelectedWorkshop(
                      ws
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                        "Enter" ||
                      event.key ===
                        " "
                    ) {
                      event.preventDefault();

                      setSelectedWorkshop(
                        ws
                      );
                    }
                  }}
                  className="
                    group
                    relative
                    min-w-0
                    overflow-hidden
                    rounded-3xl
                    bg-white
                    border
                    border-[#D4AF37]/30
                    hover:border-[#D4AF37]
                    shadow-[0_4px_24px_rgba(212,175,55,0.08)]
                    hover:shadow-[0_10px_35px_rgba(212,175,55,0.18)]
                    transition-all
                    duration-300
                    cursor-pointer
                  "
                >

                  {/* ========================================
                      POSTER
                  ======================================== */}

                  <div className="relative h-52 overflow-hidden bg-[#FAFAFA]">

                    {ws.posterUrl ? (
                      <img
                        src={
                          ws.posterUrl
                        }
                        alt={
                          displayTitle
                        }
                        className="
                          w-full
                          h-full
                          object-cover
                          group-hover:scale-105
                          transition-transform
                          duration-500
                        "
                      />
                    ) : (
                      <div className="
                        w-full
                        h-full
                        flex
                        items-center
                        justify-center
                        text-[#A67C00]
                        text-sm
                        font-bold
                      ">
                        Literature Club
                        Event
                      </div>
                    )}

                    {/* STATUS */}

                    <div className="absolute top-3 right-3 max-w-[calc(100%-1.5rem)]">

                      {ws.status ===
                      "Open" ? (
                        <span className="
                          inline-flex
                          items-center
                          gap-1
                          max-w-full
                          bg-emerald-600
                          text-white
                          text-[10px]
                          font-extrabold
                          px-3
                          py-1
                          rounded-full
                          shadow-md
                          whitespace-nowrap
                        ">

                          <Clock className="w-3 h-3 shrink-0" />

                          Registration
                          Open

                        </span>
                      ) : (
                        <span className="
                          inline-flex
                          max-w-full
                          bg-gray-600
                          text-white
                          text-[10px]
                          font-extrabold
                          px-3
                          py-1
                          rounded-full
                          shadow-md
                          whitespace-nowrap
                        ">
                          {
                            ws.status
                          }
                        </span>
                      )}

                    </div>

                    {/* STAFF CONTROLS */}

                    {isStaff && (
                      <div
                        className="
                          absolute
                          top-3
                          left-3
                          flex
                          items-center
                          gap-1.5
                          bg-black/80
                          p-1.5
                          rounded-xl
                          border
                          border-[#D4AF37]/50
                          shadow-lg
                          z-10
                        "
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                      >

                        <button
                          type="button"
                          onClick={() =>
                            startEdit(
                              ws
                            )
                          }
                          className="
                            p-1
                            text-white
                            hover:text-[#D4AF37]
                            transition-colors
                            cursor-pointer
                          "
                          title="Edit Event"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {onDeleteWorkshop && (
                          <button
                            type="button"
                            onClick={() =>
                              deleteWorkshop(
                                ws
                              )
                            }
                            className="
                              p-1
                              text-red-400
                              hover:text-red-200
                              transition-colors
                              cursor-pointer
                            "
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                      </div>
                    )}

                    {/* CATEGORY */}

                    <div
                      className="
                        absolute
                        bottom-3
                        left-3
                        max-w-[80%]
                        bg-white/95
                        text-[#A67C00]
                        text-[10px]
                        font-bold
                        px-2.5
                        py-1
                        rounded-lg
                        border
                        border-[#D4AF37]/40
                        shadow-sm
                        backdrop-blur-sm
                        break-words
                      "
                    >
                      {
                        ws.category ||
                        "Literature Event"
                      }
                    </div>

                  </div>

                  {/* ========================================
                      CARD BODY
                  ======================================== */}

                  <div className="
                    p-6
                    space-y-4
                    min-w-0
                  ">

                    {/* TITLE */}

                    <h3
                      className="
                        font-serif-title
                        text-lg
                        font-bold
                        text-[#171717]
                        leading-snug
                        break-words
                        whitespace-normal
                        overflow-wrap-anywhere
                        group-hover:text-[#A67C00]
                        transition-colors
                      "
                      style={{
                        overflowWrap:
                          "anywhere",
                      }}
                    >
                      {
                        displayTitle
                      }
                    </h3>

                    {/* EVENT CODE */}

                    {ws.eventCode ? (
                      <div className="
                        flex
                        items-start
                        gap-2
                        min-w-0
                        flex-wrap
                      ">

                        <span className="
                          shrink-0
                          text-[10px]
                          font-bold
                          uppercase
                          text-[#777777]
                        ">
                          Event Code
                        </span>

                        <span
                          className="
                            min-w-0
                            max-w-full
                            font-mono
                            text-[10px]
                            font-extrabold
                            text-[#A67C00]
                            bg-[#D4AF37]/10
                            border
                            border-[#D4AF37]/30
                            px-2
                            py-1
                            rounded-lg
                            break-all
                          "
                        >
                          {
                            ws.eventCode
                          }
                        </span>

                      </div>
                    ) : (
                      <div className="text-[10px] text-gray-400">
                        Event code not
                        assigned
                      </div>
                    )}

                    {/* DESCRIPTION */}

                    <p
                      className="
                        text-[#666666]
                        text-xs
                        leading-6
                        whitespace-normal
                        break-words
                        line-clamp-4
                      "
                      style={{
                        overflowWrap:
                          "anywhere",
                      }}
                    >
                      {
                        ws.description ||
                        "Literature Club event."
                      }
                    </p>

                    {/* REGISTRATION TYPE */}

                    <div className="
                      flex
                      flex-wrap
                      gap-2
                      min-w-0
                    ">

                      <span className="
                        inline-flex
                        max-w-full
                        items-center
                        px-2.5
                        py-1
                        rounded-lg
                        bg-[#D4AF37]/10
                        border
                        border-[#D4AF37]/30
                        text-[#A67C00]
                        text-[10px]
                        font-bold
                        break-words
                      ">
                        {ws.registrationType ===
                        "team"
                          ? "Team Registration"
                          : "Individual Registration"}
                      </span>

                      {ws.registrationType ===
                        "team" &&
                        ws.teamMinSize &&
                        ws.teamMaxSize && (
                          <span className="
                            inline-flex
                            items-center
                            px-2.5
                            py-1
                            rounded-lg
                            bg-gray-100
                            border
                            border-gray-200
                            text-gray-600
                            text-[10px]
                            font-bold
                            whitespace-nowrap
                          ">
                            Team:
                            {" "}
                            {
                              ws.teamMinSize
                            }
                            -
                            {
                              ws.teamMaxSize
                            }
                          </span>
                        )}

                    </div>

                    {/* EVENT DETAILS */}

                    <div
                      className="
                        space-y-3
                        text-xs
                        pt-3
                        border-t
                        border-[#D4AF37]/20
                        text-[#666666]
                        min-w-0
                      "
                    >

                      {/* DATE */}

                      <div className="
                        flex
                        items-start
                        gap-2
                        min-w-0
                      ">

                        <Calendar
                          className="
                            w-4
                            h-4
                            text-[#D4AF37]
                            shrink-0
                            mt-0.5
                          "
                        />

                        <div
                          className="
                            min-w-0
                            flex-1
                            break-words
                            whitespace-normal
                          "
                          style={{
                            overflowWrap:
                              "anywhere",
                          }}
                        >

                          <strong className="text-[#171717]">
                            Date &
                            Time:
                          </strong>
                          {" "}

                          {
                            formatDateTime(
                              ws.dateTime
                            )
                          }

                        </div>

                      </div>

                      {/* VENUE */}

                      <div className="
                        flex
                        items-start
                        gap-2
                        min-w-0
                      ">

                        <MapPin
                          className="
                            w-4
                            h-4
                            text-[#D4AF37]
                            shrink-0
                            mt-0.5
                          "
                        />

                        <div
                          className="
                            min-w-0
                            flex-1
                            break-words
                            whitespace-normal
                          "
                          style={{
                            overflowWrap:
                              "anywhere",
                          }}
                        >

                          <strong className="text-[#171717]">
                            Venue:
                          </strong>
                          {" "}

                          {
                            ws.venue ||
                            "Venue to be announced"
                          }

                        </div>

                      </div>

                      {/* RESOURCE SPEAKER */}

                      <div className="
                        flex
                        items-start
                        gap-2
                        min-w-0
                      ">

                        <UserIcon
                          className="
                            w-4
                            h-4
                            text-[#D4AF37]
                            shrink-0
                            mt-0.5
                          "
                        />

                        <div
                          className="
                            min-w-0
                            flex-1
                            break-words
                            whitespace-normal
                          "
                          style={{
                            overflowWrap:
                              "anywhere",
                          }}
                        >

                          <strong className="text-[#171717]">
                            Resource
                            Speaker:
                          </strong>
                          {" "}

                          {
                            ws.resourcePerson ||
                            "To be announced"
                          }

                        </div>

                      </div>

                    </div>

                  </div>

                  {/* ========================================
                      REGISTER BUTTON
                  ======================================== */}

                  <div className="p-6 pt-0">

                    <button
                      type="button"
                      disabled={
                        ws.status !==
                        "Open"
                      }
                      onClick={(event) => {
                        event.stopPropagation();

                        registerForWorkshop(
                          ws
                        );
                      }}
                      className={`
                        w-full
                        py-3
                        px-4
                        rounded-2xl
                        font-bold
                        text-xs
                        transition-all
                        flex
                        items-center
                        justify-center
                        gap-2
                        ${
                          ws.status ===
                          "Open"
                            ? "bg-gradient-to-r from-[#D4AF37] via-[#C9A227] to-[#A67C00] hover:shadow-[0_4px_16px_rgba(212,175,55,0.35)] text-white shadow-md cursor-pointer"
                            : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                        }
                      `}
                    >

                      <span>
                        {ws.status ===
                        "Open"
                          ? "Register Now"
                          : ws.status}
                      </span>

                      {ws.status ===
                        "Open" && (
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 text-white" />
                      )}

                    </button>

                  </div>

                </article>
              );
            }
          )}

        </div>

        {/* ==================================================
            EMPTY STATE
        ================================================== */}

        {filteredWorkshops.length ===
          0 && (
          <div className="text-center py-16">

            <div className="
              mx-auto
              w-14
              h-14
              rounded-full
              bg-[#D4AF37]/10
              flex
              items-center
              justify-center
              mb-4
            ">
              <Calendar className="w-6 h-6 text-[#A67C00]" />
            </div>

            <h3 className="text-lg font-bold text-[#171717]">
              No events found
            </h3>

            <p className="text-sm text-[#666666] mt-2">
              There are no workshops
              matching this category.
            </p>

          </div>
        )}

        {/* ==================================================
            FULL EVENT DETAILS MODAL
        ================================================== */}

        {selectedWorkshop && (
          <div
            className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              bg-black/60
              backdrop-blur-sm
              p-4
              overflow-y-auto
            "
            onClick={() =>
              setSelectedWorkshop(null)
            }
          >

            <div
              className="
                relative
                w-full
                max-w-4xl
                max-h-[92vh]
                overflow-y-auto
                rounded-3xl
                bg-white
                shadow-2xl
                border
                border-[#D4AF37]/40
                min-w-0
              "
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              {/* ==========================================
                  CLOSE BUTTON
              ========================================== */}

              <button
                type="button"
                onClick={() =>
                  setSelectedWorkshop(
                    null
                  )
                }
                className="
                  absolute
                  right-4
                  top-4
                  z-20
                  w-10
                  h-10
                  rounded-full
                  bg-white/95
                  border
                  border-[#D4AF37]/30
                  shadow-md
                  flex
                  items-center
                  justify-center
                  text-[#555555]
                  hover:text-[#A67C00]
                  hover:border-[#D4AF37]
                  transition-all
                  cursor-pointer
                "
                aria-label="Close event details"
              >
                <X className="w-5 h-5" />
              </button>

              {/* ==========================================
                  MODAL POSTER
              ========================================== */}

              <div className="relative w-full bg-[#FAFAFA]">

                {selectedWorkshop.posterUrl ? (
                  <img
                    src={
                      selectedWorkshop.posterUrl
                    }
                    alt={getDisplayTitle(
                      selectedWorkshop
                    )}
                    className="
                      w-full
                      max-h-[420px]
                      object-cover
                    "
                  />
                ) : (
                  <div className="
                    h-64
                    flex
                    items-center
                    justify-center
                    text-[#A67C00]
                    text-sm
                    font-bold
                  ">
                    Literature Club
                    Event
                  </div>
                )}

                {/* BADGES */}

                <div className="
                  absolute
                  left-4
                  bottom-4
                  flex
                  flex-wrap
                  gap-2
                  max-w-[calc(100%-2rem)]
                ">

                  <span className="
                    max-w-full
                    px-3
                    py-1.5
                    rounded-full
                    bg-white/95
                    border
                    border-[#D4AF37]/40
                    text-[#A67C00]
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wide
                    shadow-sm
                    break-words
                  ">
                    {
                      selectedWorkshop.category ||
                      "Literature Event"
                    }
                  </span>

                  <span
                    className={`
                      px-3
                      py-1.5
                      rounded-full
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wide
                      shadow-sm
                      whitespace-nowrap
                      ${
                        selectedWorkshop.status ===
                        "Open"
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-600 text-white"
                      }
                    `}
                  >
                    {
                      selectedWorkshop.status ===
                      "Open"
                        ? "Registration Open"
                        : selectedWorkshop.status
                    }
                  </span>

                </div>

              </div>

              {/* ==========================================
                  MODAL CONTENT
              ========================================== */}

              <div className="
                p-6
                sm:p-8
                md:p-10
                min-w-0
              ">

                {/* TITLE */}

                <div className="pr-8 min-w-0">

                  <h2
                    className="
                      font-serif-title
                      text-2xl
                      sm:text-3xl
                      md:text-4xl
                      font-black
                      text-[#171717]
                      leading-tight
                      break-words
                      whitespace-normal
                    "
                    style={{
                      overflowWrap:
                        "anywhere",
                    }}
                  >
                    {
                      getDisplayTitle(
                        selectedWorkshop
                      )
                    }
                  </h2>

                  {selectedWorkshop.eventCode && (
                    <div className="
                      flex
                      items-center
                      gap-2
                      mt-4
                      flex-wrap
                    ">

                      <span className="
                        shrink-0
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wide
                        text-[#777777]
                      ">
                        Event Code
                      </span>

                      <span className="
                        min-w-0
                        max-w-full
                        font-mono
                        text-xs
                        font-extrabold
                        text-[#A67C00]
                        bg-[#D4AF37]/10
                        border
                        border-[#D4AF37]/30
                        px-2.5
                        py-1
                        rounded-lg
                        break-all
                      ">
                        {
                          selectedWorkshop.eventCode
                        }
                      </span>

                    </div>
                  )}

                </div>

                {/* ========================================
                    DETAIL GRID
                ======================================== */}

                <div className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  gap-4
                  mt-8
                ">

                  <DetailCard
                    icon={
                      <Calendar className="w-5 h-5 text-[#D4AF37]" />
                    }
                    label="Date & Time"
                  >
                    {
                      formatDateTime(
                        selectedWorkshop.dateTime
                      )
                    }
                  </DetailCard>

                  <DetailCard
                    icon={
                      <MapPin className="w-5 h-5 text-[#D4AF37]" />
                    }
                    label="Venue"
                  >
                    {
                      selectedWorkshop.venue ||
                      "Venue to be announced"
                    }
                  </DetailCard>

                  <DetailCard
                    icon={
                      <UserIcon className="w-5 h-5 text-[#D4AF37]" />
                    }
                    label="Resource Speaker"
                  >
                    {
                      selectedWorkshop.resourcePerson ||
                      "To be announced"
                    }
                  </DetailCard>

                  <DetailCard
                    icon={
                      <ExternalLink className="w-5 h-5 text-[#D4AF37]" />
                    }
                    label="Registration"
                  >
                    {selectedWorkshop.registrationType ===
                    "team"
                      ? "Team Registration"
                      : "Individual Registration"}

                    {selectedWorkshop.registrationType ===
                      "team" &&
                      selectedWorkshop.teamMinSize &&
                      selectedWorkshop.teamMaxSize && (
                        <span className="
                          block
                          mt-1
                          text-xs
                          text-[#666666]
                          break-words
                        ">
                          Team size:
                          {" "}
                          {
                            selectedWorkshop.teamMinSize
                          }
                          {" - "}
                          {
                            selectedWorkshop.teamMaxSize
                          }
                        </span>
                      )}
                  </DetailCard>

                </div>

                {/* ========================================
                    ABOUT EVENT
                ======================================== */}

                <div className="
                  mt-8
                  pt-7
                  border-t
                  border-[#D4AF37]/20
                  min-w-0
                ">

                  <div className="
                    flex
                    flex-wrap
                    items-center
                    gap-3
                    mb-4
                  ">

                    <span className="w-8 h-px bg-[#D4AF37] shrink-0" />

                    <h3 className="
                      font-serif-title
                      text-lg
                      sm:text-xl
                      font-bold
                      text-[#171717]
                    ">
                      About the Event
                    </h3>

                    <span className="w-8 h-px bg-[#D4AF37] shrink-0" />

                  </div>

                  <p
                    className="
                      text-sm
                      sm:text-base
                      text-[#555555]
                      leading-8
                      whitespace-pre-line
                      break-words
                    "
                    style={{
                      overflowWrap:
                        "anywhere",
                    }}
                  >
                    {
                      selectedWorkshop.description ||
                      "No detailed description has been added for this event yet."
                    }
                  </p>

                </div>

                {/* ========================================
                    ACTIONS
                ======================================== */}

                <div className="
                  mt-8
                  pt-6
                  border-t
                  border-[#D4AF37]/20
                  flex
                  flex-col
                  sm:flex-row
                  gap-3
                ">

                  {/* CLOSE */}

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedWorkshop(
                        null
                      )
                    }
                    className="
                      flex-1
                      py-3.5
                      px-5
                      rounded-2xl
                      border
                      border-gray-200
                      text-[#555555]
                      font-bold
                      text-sm
                      hover:bg-gray-50
                      transition-all
                      cursor-pointer
                    "
                  >
                    Close
                  </button>

                  {/* REGISTER */}

                  <button
                    type="button"
                    disabled={
                      selectedWorkshop.status !==
                      "Open"
                    }
                    onClick={() =>
                      registerForWorkshop(
                        selectedWorkshop
                      )
                    }
                    className={`
                      flex-1
                      py-3.5
                      px-5
                      rounded-2xl
                      font-bold
                      text-sm
                      transition-all
                      ${
                        selectedWorkshop.status ===
                        "Open"
                          ? "bg-gradient-to-r from-[#D4AF37] to-[#A67C00] text-white shadow-md hover:shadow-[0_6px_20px_rgba(212,175,55,0.3)] cursor-pointer"
                          : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                      }
                    `}
                  >
                    {selectedWorkshop.status ===
                    "Open"
                      ? "Register Now"
                      : selectedWorkshop.status}
                  </button>

                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
};

// ============================================================
// DETAIL CARD
// ============================================================

const DetailCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}> = ({
  icon,
  label,
  children,
}) => {
  return (
    <div className="
      rounded-2xl
      border
      border-[#D4AF37]/20
      bg-[#FBF8EF]
      p-4
      min-w-0
    ">

      <div className="
        flex
        items-start
        gap-3
        min-w-0
      ">

        <span className="shrink-0 mt-0.5">
          {icon}
        </span>

        <div className="
          min-w-0
          flex-1
          break-words
          whitespace-normal
        "
        style={{
          overflowWrap:
            "anywhere",
        }}
        >

          <p className="
            text-[10px]
            uppercase
            tracking-wide
            font-bold
            text-[#A67C00]
          ">
            {label}
          </p>

          <div className="
            mt-1
            text-sm
            font-semibold
            text-[#171717]
            break-words
            whitespace-normal
          "
          style={{
            overflowWrap:
              "anywhere",
          }}
          >
            {children}
          </div>

        </div>

      </div>

    </div>
  );
};

export default UpcomingWorkshopSection;