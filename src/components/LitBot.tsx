import {
    ArrowRight,
    BookOpen,
    Bot,
    CalendarDays,
    ChevronRight,
    Lightbulb,
    MessageCircle,
    Minimize2,
    Send,
    Sparkles,
    Trophy,
    Users,
    X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { coordinators } from "../data/coordinators";
type Message = {
  id: number;
  sender: "bot" | "user";
  text: string;
};

type Book = {
  title: string;
  author: string;
  genre: string;
  color: string;
  shortTitle: string;
};

const books: Book[] = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Classic",
    color: "bg-emerald-700",
    shortTitle: "Gatsby",
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    genre: "Romance",
    color: "bg-rose-700",
    shortTitle: "Pride",
  },
  {
    title: "1984",
    author: "George Orwell",
    genre: "Dystopian",
    color: "bg-slate-800",
    shortTitle: "1984",
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    genre: "Adventure",
    color: "bg-amber-700",
    shortTitle: "Alchemist",
  },
  {
    title: "The Little Prince",
    author: "Antoine de Saint-Exupéry",
    genre: "Fiction",
    color: "bg-indigo-700",
    shortTitle: "Prince",
  },
];

const quickActions = [
  {
    label: "Upcoming Events",
    icon: CalendarDays,
    question: "What are the upcoming Literature Club events?",
  },
  {
    label: "Competitions",
    icon: Trophy,
    question: "Tell me about Literature Club competitions.",
  },
  {
    label: "Join the Club",
    icon: Users,
    question: "How can I join the Literature Club?",
  },
  {
    label: "Suggest a Book",
    icon: BookOpen,
    question: "Suggest a good book for me.",
  },
];

const getBotReply = (question: string): string => {
  const q = question.toLowerCase();

  if (
    q.includes("event") ||
    q.includes("upcoming") ||
    q.includes("program")
  ) {
    return "📅 You can explore the Events section for the latest Literature Club activities, workshops and programs. New activities can be added by the club management team.";
  }

  if (
    q.includes("competition") ||
    q.includes("contest") ||
    q.includes("winner")
  ) {
    return "🏆 Literature Club conducts creative and literary activities for students. Visit the Competitions and Winners sections to explore the latest updates.";
  }

  if (
    q.includes("join") ||
    q.includes("membership") ||
    q.includes("member")
  ) {
    return "👥 Interested in joining? You can contact the Literature Club through the Contact section and ask about the current membership process.";
  }

  if (
    q.includes("book") ||
    q.includes("read") ||
    q.includes("recommend")
  ) {
    return "📖 Here's a suggestion: The Little Prince. It's short, thoughtful and explores friendship, imagination and human relationships. You can also tell me your favourite genre!";
  }

  if (
    q.includes("about") ||
    q.includes("literature club") ||
    q.includes("club")
  ) {
    return "📚 The Literature Club of V.S.B. Engineering College is a space for students to explore literature, creativity, communication and literary activities.";
  }

  if (
    q.includes("contact") ||
    q.includes("coordinator") ||
    q.includes("help")
  ) {
    return "💬 You can use the Contact section to send an inquiry to the Literature Club. The management team can review and respond to your message.";
  }

  if (
    q.includes("hello") ||
    q.includes("hi") ||
    q.includes("hey")
  ) {
    return "👋 Hello, reader! I'm LitBot. What would you like to discover today?";
  }

  return "✨ I'm LitBot, your Literature Club assistant. Ask me about events, competitions, membership, books or the Literature Club.";
};

const LitBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedBook, setSelectedBook] = useState(0);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      text: "👋 Hello, reader! I'm LitBot. What would you like to discover today?",
    },
  ]);

  /* ---------------------------------------------------------
     Rotate Book of the Moment
  --------------------------------------------------------- */

  useEffect(() => {
    if (!isOpen || isMinimized) return;

    const timer = setInterval(() => {
      setSelectedBook((current) => (current + 1) % books.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [isOpen, isMinimized]);

  const currentBook = useMemo(
    () => books[selectedBook],
    [selectedBook]
  );

  /* ---------------------------------------------------------
     Send Message
  --------------------------------------------------------- */

  const sendMessage = (text?: string) => {
    const messageText = (text ?? input).trim();

    if (!messageText || isTyping) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: messageText,
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const botMessage: Message = {
        id: Date.now() + 1,
        sender: "bot",
        text: getBotReply(messageText),
      };

      setMessages((previous) => [...previous, botMessage]);
      setIsTyping(false);
    }, 850);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };

  const openBot = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  /* ---------------------------------------------------------
     Floating Button
  --------------------------------------------------------- */

  if (!isOpen) {
    return (
      <button
        onClick={openBot}
        aria-label="Open LitBot"
        className="
          fixed bottom-6 right-6 z-[9999]
          group
        "
      >
        {/* Outer glow */}
        <span
          className="
            absolute inset-0
            rounded-full
            bg-amber-400/30
            blur-xl
            scale-125
            opacity-70
            group-hover:opacity-100
            transition
          "
        />

        {/* Button */}
        <span
          className="
            relative
            flex items-center justify-center
            w-[66px] h-[66px]
            rounded-full
            bg-[#171717]
            text-white
            border border-amber-300/50
            shadow-[0_12px_40px_rgba(0,0,0,0.28)]
            group-hover:scale-110
            group-active:scale-95
            transition-all duration-300
          "
        >
          <BookOpen
            size={25}
            strokeWidth={1.8}
            className="group-hover:rotate-[-8deg] transition-transform"
          />

          <Sparkles
            size={15}
            className="
              absolute
              top-2 right-2
              text-amber-300
              animate-pulse
            "
          />
        </span>

        {/* Label */}
        <span
          className="
            absolute
            right-[78px]
            top-1/2
            -translate-y-1/2
            whitespace-nowrap
            rounded-full
            bg-[#171717]
            text-white
            px-4 py-2
            text-xs font-semibold
            shadow-xl
            opacity-0
            translate-x-2
            group-hover:opacity-100
            group-hover:translate-x-0
            transition-all duration-300
            pointer-events-none
          "
        >
          Ask LitBot ✨
        </span>
      </button>
    );
  }

  /* ---------------------------------------------------------
     Minimized State
  --------------------------------------------------------- */

  if (isMinimized) {
    return (
      <div
        className="
          fixed bottom-6 right-6 z-[9999]
          bg-white
          border border-gray-200
          shadow-2xl
          rounded-2xl
          px-4 py-3
          flex items-center gap-3
          cursor-pointer
          hover:shadow-[0_15px_45px_rgba(0,0,0,0.15)]
          transition
        "
        onClick={() => setIsMinimized(false)}
      >
        <div
          className="
            w-10 h-10
            rounded-xl
            bg-[#171717]
            text-amber-300
            flex items-center justify-center
          "
        >
          <BookOpen size={19} />
        </div>

        <div>
          <p className="text-sm font-bold text-gray-900">
            LitBot
          </p>
          <p className="text-[11px] text-gray-500">
            Continue reading...
          </p>
        </div>

        <ChevronRight size={18} className="text-gray-400" />
      </div>
    );
  }

  /* ---------------------------------------------------------
     Main Chat UI
  --------------------------------------------------------- */

  return (
    <div
      className="
        fixed bottom-6 right-6 z-[9999]
        w-[390px]
        max-w-[calc(100vw-24px)]
        h-[650px]
        max-h-[calc(100vh-48px)]
        bg-white
        rounded-[28px]
        overflow-hidden
        border border-gray-200
        shadow-[0_25px_80px_rgba(0,0,0,0.22)]
        flex flex-col
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          relative
          bg-[#171717]
          text-white
          px-5 py-4
          overflow-hidden
        "
      >
        {/* Decorative circles */}
        <div
          className="
            absolute
            -right-12 -top-16
            w-36 h-36
            rounded-full
            border border-amber-300/20
          "
        />

        <div
          className="
            absolute
            -right-5 -top-8
            w-20 h-20
            rounded-full
            bg-amber-300/10
          "
        />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="
                w-11 h-11
                rounded-2xl
                bg-white/10
                border border-white/10
                flex items-center justify-center
              "
            >
              <BookOpen
                size={23}
                className="text-amber-300"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl font-bold">
                  LitBot
                </h3>

                <span
                  className="
                    flex items-center gap-1
                    text-[9px]
                    font-bold
                    tracking-wide
                    bg-emerald-500/20
                    text-emerald-300
                    border border-emerald-400/20
                    rounded-full
                    px-2 py-1
                  "
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  ONLINE
                </span>
              </div>

              <p className="text-[11px] text-white/60">
                Your Literature Club companion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="
                w-8 h-8
                rounded-full
                hover:bg-white/10
                flex items-center justify-center
                transition
              "
              aria-label="Minimize LitBot"
            >
              <Minimize2 size={16} />
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="
                w-8 h-8
                rounded-full
                hover:bg-white/10
                flex items-center justify-center
                transition
              "
              aria-label="Close LitBot"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          BOOK OF THE MOMENT
      ===================================================== */}

      <div className="px-4 pt-4 bg-[#faf9f5]">
        <div
          className="
            relative
            rounded-2xl
            overflow-hidden
            border border-[#e8e2d4]
            bg-[#f3efe5]
            p-4
          "
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles
                size={14}
                className="text-amber-600"
              />

              <span
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-gray-500
                "
              >
                Book of the Moment
              </span>
            </div>

            <span className="text-[10px] text-gray-400">
              {selectedBook + 1}/{books.length}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Book cover */}
            <div
              className={`
                relative
                w-[76px] h-[100px]
                flex-shrink-0
                rounded-md
                ${currentBook.color}
                shadow-[5px_7px_15px_rgba(0,0,0,0.22)]
                overflow-hidden
                transition-all duration-500
              `}
            >
              <div
                className="
                  absolute inset-2
                  border border-white/30
                  rounded-sm
                  flex flex-col
                  items-center
                  justify-center
                  px-2
                  text-center
                "
              >
                <BookOpen
                  size={16}
                  className="text-white/80 mb-2"
                />

                <span
                  className="
                    text-[10px]
                    leading-tight
                    font-serif
                    font-bold
                    text-white
                  "
                >
                  {currentBook.shortTitle}
                </span>
              </div>

              {/* Book shine */}
              <div
                className="
                  absolute
                  top-0 left-0
                  w-5 h-full
                  bg-white/10
                  -skew-x-12
                "
              />
            </div>

            {/* Book details */}
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-amber-700 mb-1">
                {currentBook.genre}
              </p>

              <h4 className="font-serif text-base font-bold text-gray-900 leading-tight">
                {currentBook.title}
              </h4>

              <p className="text-xs text-gray-500 mt-1">
                {currentBook.author}
              </p>

              <button
                onClick={() =>
                  sendMessage(
                    `Tell me about ${currentBook.title}`
                  )
                }
                className="
                  mt-3
                  inline-flex items-center gap-1
                  text-[11px]
                  font-semibold
                  text-gray-800
                  hover:text-amber-700
                  transition
                "
              >
                Discover book
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* Book dots */}
          <div className="flex justify-center gap-1.5 mt-3">
            {books.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedBook(index)}
                className={`
                  h-1.5 rounded-full transition-all
                  ${
                    index === selectedBook
                      ? "w-5 bg-gray-800"
                      : "w-1.5 bg-gray-300"
                  }
                `}
                aria-label={`Book ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* =====================================================
          CHAT AREA
      ===================================================== */}

      <div className="flex-1 overflow-y-auto bg-[#faf9f5] px-4 py-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              {message.sender === "bot" && (
                <div
                  className="
                    w-8 h-8
                    rounded-xl
                    bg-[#171717]
                    text-amber-300
                    flex items-center justify-center
                    flex-shrink-0
                    mr-2
                    mt-1
                  "
                >
                  <Bot size={16} />
                </div>
              )}

              <div
                className={`
                  max-w-[78%]
                  px-4 py-3
                  rounded-2xl
                  text-[13px]
                  leading-relaxed
                  ${
                    message.sender === "user"
                      ? "bg-[#171717] text-white rounded-br-md"
                      : "bg-white text-gray-700 border border-[#e7e3da] rounded-bl-md shadow-sm"
                  }
                `}
              >
                {message.text}
              </div>
            </div>
          ))}

          {/* Typing */}
          {isTyping && (
            <div className="flex items-center gap-2">
              <div
                className="
                  w-8 h-8
                  rounded-xl
                  bg-[#171717]
                  text-amber-300
                  flex items-center justify-center
                "
              >
                <Bot size={16} />
              </div>

              <div
                className="
                  bg-white
                  border border-[#e7e3da]
                  rounded-2xl rounded-bl-md
                  px-4 py-3
                  shadow-sm
                "
              >
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        {messages.length === 1 && (
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb
                size={14}
                className="text-amber-600"
              />

              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.15em]
                  text-gray-500
                "
              >
                Explore with LitBot
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <button
                    key={action.label}
                    onClick={() =>
                      sendMessage(action.question)
                    }
                    className="
                      group
                      flex items-center gap-2
                      text-left
                      bg-white
                      border border-[#e5e0d5]
                      rounded-xl
                      px-3 py-3
                      text-[11px]
                      font-semibold
                      text-gray-700
                      hover:border-gray-400
                      hover:bg-[#f3efe5]
                      transition-all
                    "
                  >
                    <Icon
                      size={15}
                      className="
                        text-amber-700
                        flex-shrink-0
                        group-hover:scale-110
                        transition
                      "
                    />

                    <span className="leading-tight">
                      {action.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          INPUT
      ===================================================== */}

      <div className="bg-white border-t border-gray-200 p-3">
        <div
          className="
            flex items-center gap-2
            bg-[#f5f3ee]
            border border-[#e5e0d5]
            rounded-2xl
            px-3 py-2
            focus-within:border-gray-400
            focus-within:ring-2
            focus-within:ring-gray-100
            transition
          "
        >
          <MessageCircle
            size={17}
            className="text-gray-400 flex-shrink-0"
          />

          <input
            type="text"
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Ask LitBot anything..."
            className="
              flex-1
              bg-transparent
              outline-none
              text-[13px]
              text-gray-700
              placeholder:text-gray-400
              min-w-0
            "
          />

          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            className="
              w-9 h-9
              rounded-xl
              bg-[#171717]
              text-amber-300
              flex items-center justify-center
              disabled:opacity-30
              disabled:cursor-not-allowed
              hover:bg-gray-800
              transition
            "
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>

        <p className="text-[9px] text-center text-gray-400 mt-2">
          ✨ LitBot • Discover. Read. Connect.
        </p>
      </div>
    </div>
  );
};

export default LitBot;