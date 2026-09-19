import React, { useState } from 'react';

import {
  BookOpen,
  Building,
  CheckCircle,
  Clock,
  Edit3,
  Feather,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Save,
  Send,
} from 'lucide-react';

import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '../lib/firebase';

import {
  DEPARTMENT_OPTIONS,
  Inquiry,
  User,
} from '../types';

interface ContactSectionProps {
  currentUser?: User | null;
  onAddInquiry?: (inq: Inquiry) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  currentUser,
  onAddInquiry,
}) => {
  const isStaff =
    currentUser &&
    (currentUser.role === 'admin' ||
      currentUser.role === 'coordinator');

  const [isEditing, setIsEditing] = useState(false);

  const [address, setAddress] = useState(
    'NH-67, Covai Road,\nKarudayampalayam Post,\nKarur - 639111, Tamil Nadu, India'
  );

  const [email, setEmail] = useState(
    'vsbliterature@gmail.com'
  );

  const [phone, setPhone] = useState(
    '+91 74488 08599 / +91 94871 51072'
  );

  const [hours, setHours] = useState(
    'Mon - Sat: 8:45 AM - 5:15 PM IST'
  );

  const [formData, setFormData] = useState({
    name: currentUser?.fullName || '',
    email: currentUser?.email || '',
    department:
      currentUser?.department || 'Biotechnology',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const [submittedDeptTarget, setSubmittedDeptTarget] =
    useState('');

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  // =====================================================
  // SUBMIT INQUIRY
  // =====================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const name = formData.name.trim();
    const senderEmail = formData.email.trim();
    const message = formData.message.trim();
    const department = formData.department.trim();

    if (!name || !senderEmail || !message) {
      return;
    }

    setIsSubmitting(true);

    try {
      // =================================================
      // SAVE INQUIRY DIRECTLY TO FIRESTORE
      // =================================================

      const inquiryId = `INQ-${Date.now()}`;

      const inquiryRef = await addDoc(
        collection(db, 'inquiries'),
        {
          inquiryId,

          senderName: name,

          senderEmail: senderEmail,

          senderUid:
            currentUser?.id || null,

          department,

          message,

          status: 'pending',

          read: false,

          replied: false,

          replyMessage: '',

          response: '',

          createdAt: serverTimestamp(),

          updatedAt: serverTimestamp(),
        }
      );

      // =================================================
      // LOCAL OBJECT FOR EXISTING APP STATE
      // =================================================

      const newInquiry = {
        id: inquiryRef.id,

        inquiryId,

        senderName: name,

        senderEmail: senderEmail,

        senderUid:
          currentUser?.id || '',

        department,

        message,

        status: 'pending',

        read: false,

        replied: false,

        replyMessage: '',

        response: '',

        createdAt:
          new Date().toISOString(),

        updatedAt:
          new Date().toISOString(),
      } as unknown as Inquiry;

      // =================================================
      // UPDATE EXISTING APP STATE
      // =================================================

      if (onAddInquiry) {
        onAddInquiry(newInquiry);
      }

      // =================================================
      // SUCCESS UI
      // =================================================

      setSubmittedDeptTarget(
        department
      );

      setSubmitted(true);

      // =================================================
      // CLEAR MESSAGE FORM
      // =================================================

      setFormData({
        name:
          currentUser?.fullName || '',

        email:
          currentUser?.email || '',

        department:
          currentUser?.department ||
          'Biotechnology',

        message: '',
      });

      // =================================================
      // RETURN TO FORM AFTER 5 SECONDS
      // =================================================

      setTimeout(() => {
        setSubmitted(false);
      }, 5000);

      console.log(
        'Inquiry saved successfully:',
        inquiryRef.id
      );

    } catch (error) {
      console.error(
        'Inquiry submission failed:',
        error
      );

      alert(
        'Unable to submit your inquiry. Please try again.'
      );

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="
        relative
        overflow-hidden
        py-16
        md:py-24
        px-4
        sm:px-6
        text-[#171717]
        border-t
        border-[#D4AF37]/25
        bg-[#FBF8F1]
      "
    >

      {/* DECORATIVE BACKGROUND */}

      <div
        className="
          pointer-events-none
          absolute
          -top-32
          -left-32
          w-80
          h-80
          rounded-full
          bg-[#D4AF37]/10
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          top-1/3
          -right-32
          w-96
          h-96
          rounded-full
          bg-[#7B1E2B]/5
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          left-0
          text-[#D4AF37]/10
        "
      >
        <Feather className="w-48 h-48 rotate-[-25deg]" />
      </div>

      <div
        className="
          pointer-events-none
          absolute
          top-24
          right-8
          text-[#D4AF37]/10
        "
      >
        <BookOpen className="w-36 h-36 rotate-12" />
      </div>

      <div className="relative max-w-7xl mx-auto space-y-12">

        {/* SECTION HEADER */}

        <div className="text-center max-w-4xl mx-auto">

          <div className="flex items-center justify-center gap-2 mb-5">

            <span
              className="
                inline-flex
                items-center
                gap-2
                text-[#8B6508]
                text-xs
                font-bold
                tracking-[0.18em]
                uppercase
                bg-[#FFF9E8]
                border
                border-[#D4AF37]/45
                px-4
                py-2
                rounded-full
                shadow-sm
              "
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Connect With Us
            </span>

            {isStaff && !isEditing && (
              <button
                type="button"
                onClick={() =>
                  setIsEditing(true)
                }
                className="
                  px-3
                  py-2
                  bg-white
                  text-[#8B6508]
                  hover:bg-[#FFF9E8]
                  rounded-full
                  text-[11px]
                  font-bold
                  transition-all
                  flex
                  items-center
                  gap-1.5
                  border
                  border-[#D4AF37]/50
                  cursor-pointer
                  shadow-sm
                "
              >
                <Edit3 className="w-3 h-3" />

                <span>
                  Edit Contact Details
                </span>
              </button>
            )}

          </div>

          <div className="flex items-center justify-center gap-4 mb-3">

            <span className="hidden sm:block w-16 h-px bg-[#D4AF37]" />

            <h2
              className="
                font-serif-title
                text-4xl
                md:text-5xl
                font-black
                tracking-tight
                text-[#10284A]
                uppercase
              "
            >
              Contact{' '}
              <span className="text-[#7B1E2B]">
                Literature Club
              </span>
            </h2>

            <span className="hidden sm:block w-16 h-px bg-[#D4AF37]" />

          </div>

          <div className="flex items-center justify-center gap-2 mb-5">

            <span className="w-10 h-px bg-[#D4AF37]" />

            <BookOpen className="w-5 h-5 text-[#B8891C]" />

            <span className="w-10 h-px bg-[#D4AF37]" />

          </div>

          <p
            className="
              text-[#5E6470]
              text-sm
              md:text-base
              leading-relaxed
              max-w-3xl
              mx-auto
            "
          >
            Have questions regarding upcoming workshops,
            paper writing mentorship, or club membership?
            Reach out to our faculty coordinators and
            student heads.
          </p>

        </div>

        {/* MAIN CONTENT */}

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-12
            gap-8
            lg:gap-10
            items-stretch
          "
        >

          {/* LEFT CONTACT DETAILS */}

          <div
            className="
              lg:col-span-5
              bg-white
              p-7
              md:p-8
              rounded-[28px]
              border
              border-[#D4AF37]/45
              shadow-[0_12px_40px_rgba(16,40,74,0.08)]
              relative
              overflow-hidden
            "
          >

            <div
              className="
                absolute
                top-0
                left-0
                right-0
                h-1
                bg-gradient-to-r
                from-[#D4AF37]
                via-[#B8891C]
                to-[#7B1E2B]
              "
            />

            <div className="flex items-start justify-between gap-4 mb-7">

              <div>

                <p
                  className="
                    text-[#B8891C]
                    text-[10px]
                    font-bold
                    tracking-[0.2em]
                    uppercase
                    mb-2
                  "
                >
                  Official Club Address
                </p>

                <h3
                  className="
                    font-serif-title
                    font-black
                    text-2xl
                    md:text-3xl
                    text-[#10284A]
                  "
                >
                  V.S.B. Engineering College
                </h3>

                <p
                  className="
                    text-xs
                    text-[#8B6508]
                    font-bold
                    uppercase
                    tracking-wider
                    mt-2
                    leading-relaxed
                  "
                >
                  Department of Biomedical Engineering
                  <br />
                  and Biotechnology &bull; Literature Club
                  Portal
                </p>

              </div>

              {isEditing && (
                <button
                  type="button"
                  onClick={() =>
                    setIsEditing(false)
                  }
                  className="
                    shrink-0
                    px-3
                    py-2
                    bg-gradient-to-r
                    from-[#D4AF37]
                    to-[#A67C00]
                    text-white
                    text-xs
                    font-bold
                    rounded-xl
                    flex
                    items-center
                    gap-1.5
                    shadow-sm
                    cursor-pointer
                  "
                >
                  <Save className="w-3.5 h-3.5" />

                  <span>
                    Done
                  </span>
                </button>
              )}

            </div>

            <div className="h-px bg-[#D4AF37]/25 mb-7" />

            <div className="space-y-6">

              {/* ADDRESS */}

              <div className="flex items-start gap-4">

                <div
                  className="
                    shrink-0
                    w-11
                    h-11
                    rounded-full
                    bg-[#FFF4CE]
                    border
                    border-[#D4AF37]/40
                    flex
                    items-center
                    justify-center
                  "
                >
                  <MapPin className="w-5 h-5 text-[#8B6508]" />
                </div>

                <div className="flex-1">

                  <strong
                    className="
                      text-[#10284A]
                      block
                      font-bold
                      text-sm
                      mb-1
                    "
                  >
                    Campus Address
                  </strong>

                  {isEditing ? (
                    <textarea
                      rows={4}
                      value={address}
                      onChange={(e) =>
                        setAddress(
                          e.target.value
                        )
                      }
                      className="
                        w-full
                        text-sm
                        p-3
                        border
                        border-gray-200
                        rounded-xl
                        bg-white
                        focus:outline-none
                        focus:border-[#D4AF37]
                        resize-none
                      "
                    />
                  ) : (
                    <span
                      className="
                        text-sm
                        text-[#626B78]
                        leading-relaxed
                        whitespace-pre-line
                      "
                    >
                      {address}
                    </span>
                  )}

                </div>

              </div>

              {/* EMAIL */}

              <div className="flex items-start gap-4">

                <div
                  className="
                    shrink-0
                    w-11
                    h-11
                    rounded-full
                    bg-[#FFF4CE]
                    border
                    border-[#D4AF37]/40
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Mail className="w-5 h-5 text-[#8B6508]" />
                </div>

                <div className="flex-1">

                  <strong
                    className="
                      text-[#10284A]
                      block
                      font-bold
                      text-sm
                      mb-1
                    "
                  >
                    Email
                  </strong>

                  {isEditing ? (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(
                          e.target.value
                        )
                      }
                      className="
                        w-full
                        text-sm
                        p-2.5
                        border
                        border-gray-200
                        rounded-xl
                        bg-white
                        focus:outline-none
                        focus:border-[#D4AF37]
                      "
                    />
                  ) : (
                    <a
                      href={`mailto:${email}`}
                      className="
                        text-sm
                        text-[#626B78]
                        hover:text-[#8B6508]
                        transition-colors
                      "
                    >
                      {email}
                    </a>
                  )}

                </div>

              </div>

              {/* PHONE */}

              <div className="flex items-start gap-4">

                <div
                  className="
                    shrink-0
                    w-11
                    h-11
                    rounded-full
                    bg-[#FFF4CE]
                    border
                    border-[#D4AF37]/40
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Phone className="w-5 h-5 text-[#8B6508]" />
                </div>

                <div className="flex-1">

                  <strong
                    className="
                      text-[#10284A]
                      block
                      font-bold
                      text-sm
                      mb-1
                    "
                  >
                    Phone Contact
                  </strong>

                  {isEditing ? (
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) =>
                        setPhone(
                          e.target.value
                        )
                      }
                      className="
                        w-full
                        text-sm
                        p-2.5
                        border
                        border-gray-200
                        rounded-xl
                        bg-white
                        focus:outline-none
                        focus:border-[#D4AF37]
                      "
                    />
                  ) : (
                    <a
                      href={`tel:${phone
                        .replace(/\s/g, '')
                        .replace(/\//g, ',')}`}
                      className="
                        text-sm
                        text-[#626B78]
                        hover:text-[#8B6508]
                        transition-colors
                      "
                    >
                      {phone}
                    </a>
                  )}

                </div>

              </div>

              {/* OFFICE HOURS */}

              <div className="flex items-start gap-4">

                <div
                  className="
                    shrink-0
                    w-11
                    h-11
                    rounded-full
                    bg-[#FFF4CE]
                    border
                    border-[#D4AF37]/40
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Clock className="w-5 h-5 text-[#8B6508]" />
                </div>

                <div className="flex-1">

                  <strong
                    className="
                      text-[#10284A]
                      block
                      font-bold
                      text-sm
                      mb-1
                    "
                  >
                    Office Hours
                  </strong>

                  {isEditing ? (
                    <input
                      type="text"
                      value={hours}
                      onChange={(e) =>
                        setHours(
                          e.target.value
                        )
                      }
                      className="
                        w-full
                        text-sm
                        p-2.5
                        border
                        border-gray-200
                        rounded-xl
                        bg-white
                        focus:outline-none
                        focus:border-[#D4AF37]
                      "
                    />
                  ) : (
                    <span className="text-sm text-[#626B78]">
                      {hours}
                    </span>
                  )}

                </div>

              </div>

            </div>

            {/* CAMPUS MAP */}

            <div className="mt-8 pt-6 border-t border-[#D4AF37]/20">

              <div
                className="
                  group
                  bg-gradient-to-r
                  from-[#FFFDF7]
                  via-white
                  to-[#FFFDF7]
                  border
                  border-[#D4AF37]/45
                  p-4
                  rounded-2xl
                  text-center
                  shadow-sm
                  hover:shadow-md
                  transition-all
                "
              >

                <div className="flex items-center justify-center gap-2 mb-1">

                  <MapPin className="w-4 h-4 text-[#B8891C]" />

                  <span
                    className="
                      text-sm
                      font-serif-title
                      font-bold
                      text-[#10284A]
                    "
                  >
                    VSB Karur Campus Map
                  </span>

                </div>

                <p className="text-[11px] text-[#666666]">
                  Central Library Block - 2nd Floor
                  Literature Club Desk
                </p>

              </div>

            </div>

            <div className="mt-6 text-center">

              <p
                className="
                  font-serif-title
                  italic
                  text-[#7B1E2B]
                  text-sm
                "
              >
                “A home for every curious mind.”
              </p>

            </div>

          </div>

          {/* RIGHT MESSAGE FORM */}

          <div
            className="
              lg:col-span-7
              bg-white
              p-7
              md:p-8
              rounded-[28px]
              border
              border-[#D4AF37]/45
              shadow-[0_12px_40px_rgba(16,40,74,0.08)]
              relative
              overflow-hidden
            "
          >

            <div
              className="
                absolute
                top-0
                left-0
                right-0
                h-1
                bg-gradient-to-r
                from-[#7B1E2B]
                via-[#B8891C]
                to-[#D4AF37]
              "
            />

            <h3
              className="
                font-serif-title
                font-black
                text-2xl
                md:text-3xl
                text-[#10284A]
                flex
                items-center
                gap-3
                mb-7
              "
            >

              <span
                className="
                  w-11
                  h-11
                  rounded-xl
                  bg-[#FFF4CE]
                  border
                  border-[#D4AF37]/40
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >
                <MessageSquare className="w-5 h-5 text-[#8B6508]" />
              </span>

              <span>
                Send a Message to Club Coordinators
              </span>

            </h3>

            {submitted ? (

              <div
                className="
                  min-h-[380px]
                  flex
                  flex-col
                  items-center
                  justify-center
                  p-8
                  bg-[#FFFDF7]
                  border
                  border-[#D4AF37]
                  rounded-2xl
                  text-center
                  space-y-4
                  animate-fade-in
                "
              >

                <div
                  className="
                    w-16
                    h-16
                    rounded-full
                    bg-[#FFF4CE]
                    flex
                    items-center
                    justify-center
                    border
                    border-[#D4AF37]/50
                  "
                >
                  <CheckCircle className="w-9 h-9 text-[#B8891C]" />
                </div>

                <h4
                  className="
                    font-serif-title
                    text-2xl
                    font-bold
                    text-[#10284A]
                  "
                >
                  Inquiry Submitted Successfully!
                </h4>

                <p
                  className="
                    text-sm
                    text-[#666666]
                    max-w-md
                    mx-auto
                    leading-relaxed
                  "
                >
                  Your message has been routed to the{' '}
                  <strong className="text-[#8B6508]">
                    {submittedDeptTarget}
                  </strong>{' '}
                  recipient inbox. A club coordinator
                  or staff advisor will review and respond
                  to your email.
                </p>

                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    px-4
                    py-2
                    bg-white
                    border
                    border-[#D4AF37]/40
                    rounded-full
                    text-xs
                    font-bold
                    text-[#8B6508]
                  "
                >
                  <Building className="w-4 h-4 text-[#D4AF37]" />

                  <span>
                    Routed to: {submittedDeptTarget}
                  </span>
                </div>

              </div>

            ) : (

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* NAME + EMAIL */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  <div>

                    <label
                      className="
                        block
                        text-sm
                        font-bold
                        text-[#10284A]
                        mb-2
                      "
                    >
                      Full Name *
                    </label>

                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                        })
                      }
                      placeholder="e.g. Priya Dharshini"
                      className="
                        w-full
                        text-sm
                        px-4
                        py-3.5
                        border
                        border-gray-200
                        rounded-xl
                        bg-[#FCFCFC]
                        focus:outline-none
                        focus:border-[#D4AF37]
                        focus:ring-2
                        focus:ring-[#D4AF37]/10
                        transition-all
                      "
                    />

                  </div>

                  <div>

                    <label
                      className="
                        block
                        text-sm
                        font-bold
                        text-[#10284A]
                        mb-2
                      "
                    >
                      Email ID *
                    </label>

                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: e.target.value,
                        })
                      }
                      placeholder="e.g. student@vsbec.ac.in"
                      className="
                        w-full
                        text-sm
                        px-4
                        py-3.5
                        border
                        border-gray-200
                        rounded-xl
                        bg-[#FCFCFC]
                        focus:outline-none
                        focus:border-[#D4AF37]
                        focus:ring-2
                        focus:ring-[#D4AF37]/10
                        transition-all
                      "
                    />

                  </div>

                </div>

                {/* DEPARTMENT */}

                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-bold
                      text-[#10284A]
                      mb-2
                    "
                  >
                    Department / Inquiry Category *
                  </label>

                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        department:
                          e.target.value,
                      })
                    }
                    className="
                      w-full
                      text-sm
                      px-4
                      py-3.5
                      border
                      border-gray-200
                      rounded-xl
                      focus:outline-none
                      focus:border-[#D4AF37]
                      focus:ring-2
                      focus:ring-[#D4AF37]/10
                      bg-[#FCFCFC]
                      font-medium
                    "
                  >

                    <option value="Admin / General Inquiries">
                      🏛️ Admin / General Inquiries
                      (College-Wide)
                    </option>

                    <optgroup label="── 13 Department Coordinators ──">

                      {DEPARTMENT_OPTIONS.map(
                        (dept) => (
                          <option
                            key={dept.code}
                            value={dept.name}
                          >
                            {dept.name} ({dept.code})
                          </option>
                        )
                      )}

                    </optgroup>

                  </select>

                  <p
                    className="
                      text-[11px]
                      text-[#777777]
                      mt-2
                    "
                  >
                    Your inquiry will be routed specifically
                    to this department coordinator's inbox.
                  </p>

                </div>

                {/* MESSAGE */}

                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-bold
                      text-[#10284A]
                      mb-2
                    "
                  >
                    Your Message or Query *
                  </label>

                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        message:
                          e.target.value,
                      })
                    }
                    placeholder="Inquire about upcoming workshops, submission deadlines, or feedback..."
                    className="
                      w-full
                      text-sm
                      px-4
                      py-3.5
                      border
                      border-gray-200
                      rounded-xl
                      bg-[#FCFCFC]
                      focus:outline-none
                      focus:border-[#D4AF37]
                      focus:ring-2
                      focus:ring-[#D4AF37]/10
                      resize-none
                      transition-all
                    "
                  />

                </div>

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="
                    w-full
                    py-4
                    bg-gradient-to-r
                    from-[#D4AF37]
                    via-[#C9A227]
                    to-[#A67C00]
                    hover:shadow-[0_8px_25px_rgba(212,175,55,0.35)]
                    hover:-translate-y-0.5
                    text-white
                    rounded-xl
                    text-sm
                    font-bold
                    transition-all
                    shadow-md
                    flex
                    items-center
                    justify-center
                    gap-2.5
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    cursor-pointer
                  "
                >

                  <Send className="w-4 h-4 text-white" />

                  <span>
                    {isSubmitting
                      ? 'Submitting Inquiry...'
                      : 'Submit Inquiry Message'}
                  </span>

                </button>

                <div className="flex items-center justify-center gap-3 pt-1">

                  <span className="w-10 h-px bg-[#D4AF37]/60" />

                  <span
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.18em]
                      font-bold
                      text-[#8B6508]
                    "
                  >
                    We'd Love To Hear From You
                  </span>

                  <span className="w-10 h-px bg-[#D4AF37]/60" />

                </div>

              </form>

            )}

          </div>

        </div>

        {/* BOTTOM QUOTE */}

        <div className="text-center pt-2">

          <div className="flex items-center justify-center gap-3">

            <span className="w-16 h-px bg-[#D4AF37]/50" />

            <Feather className="w-4 h-4 text-[#B8891C]" />

            <span
              className="
                font-serif-title
                italic
                text-sm
                text-[#7B1E2B]
              "
            >
              Words connect people. Ideas create change.
            </span>

            <Feather className="w-4 h-4 text-[#B8891C] scale-x-[-1]" />

            <span className="w-16 h-px bg-[#D4AF37]/50" />

          </div>

        </div>

      </div>
    </section>
  );
};