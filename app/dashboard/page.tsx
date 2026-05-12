"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  LayoutDashboard, Calendar, Settings, List, Mic2,
  TrendingUp, Flame, Clock, Eye, Zap, X,
  ChevronLeft, ChevronRight, AlertCircle
} from "lucide-react";
import ConfidenceScore from "@/components/coach/ConfidenceScore";
import { useAuth } from "@/hooks/useAuth";

const MOCK_SESSIONS = [
  {
    id: "s1",
    date: "May 9, 2026",
    dateObj: new Date(2026, 4, 9),
    duration: 30,
    confidenceScore: 74,
    eyeContactPercent: 68,
    fillerWordsPerMinute: 2.1,
    wordsPerMinute: 118,
    fidgetLevel: 24,
    topic: "Introduction speech",
    transcript: "Hi everyone, um, my name is Kasey and today I want to talk about, like, communication skills. So basically, uh, being able to speak well is really important for, you know, your career and stuff.",
  },
  {
    id: "s2",
    date: "May 10, 2026",
    dateObj: new Date(2026, 4, 10),
    duration: 30,
    confidenceScore: 79,
    eyeContactPercent: 71,
    fillerWordsPerMinute: 1.8,
    wordsPerMinute: 134,
    fidgetLevel: 19,
    topic: "Project pitch",
    transcript: "Good afternoon. I'm pitching our new project management tool. The core problem we're solving is that teams lose an average of 4.5 hours per week to miscommunication. Our solution integrates directly into existing workflows.",
  },
  {
    id: "s3",
    date: "May 11, 2026",
    dateObj: new Date(2026, 4, 11),
    duration: 30,
    confidenceScore: 82,
    eyeContactPercent: 74,
    fillerWordsPerMinute: 1.4,
    wordsPerMinute: 148,
    fidgetLevel: 16,
    topic: "Debate preparation",
    transcript: "The resolution I'm defending today is that structured debate improves critical thinking. I'll present three contentions: first, logical framework building; second, evidence evaluation; and third, rebuttal skill development.",
  },
];

type NavSection = "overview" | "sessions" | "calendar" | "settings";

const NAV_ITEMS: { id: NavSection; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "sessions", label: "Sessions", icon: List },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "settings", label: "Settings", icon: Settings },
];

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function CalendarView() {
  const today = new Date(2026, 4, 11); // May 11 2026
  const [viewDate, setViewDate] = useState(new Date(2026, 4, 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTime, setModalTime] = useState("10:00");

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const sessionDays = new Set(
    MOCK_SESSIONS
      .filter((s) => s.dateObj.getMonth() === month && s.dateObj.getFullYear() === year)
      .map((s) => s.dateObj.getDate())
  );

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const cells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Calendar</h2>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 glass rounded-lg hover:bg-white/8 transition-colors">
            <ChevronLeft size={16} className="text-white/60" />
          </button>
          <span className="text-sm font-semibold text-white min-w-[130px] text-center">
            {MONTHS[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-2 glass rounded-lg hover:bg-white/8 transition-colors">
            <ChevronRight size={16} className="text-white/60" />
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-3">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-[11px] font-semibold text-white/30 uppercase py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            const hasSession = sessionDays.has(day);
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                onClick={() => { setSelectedDay(day); setShowModal(true); }}
                className={`relative flex flex-col items-center justify-center aspect-square rounded-xl text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-[#6C63FF] text-white"
                    : isToday
                    ? "bg-[#6C63FF]/20 text-[#6C63FF] border border-[#6C63FF]/40"
                    : "hover:bg-white/6 text-white/70"
                }`}
              >
                {day}
                {hasSession && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#22D3A5]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-white/40">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#22D3A5]" />
          Practice session
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#6C63FF]" />
          Today
        </div>
      </div>

      {/* Schedule modal */}
      {showModal && selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-strong rounded-2xl p-6 w-full max-w-sm mx-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white">
                Schedule Session: {MONTHS[month]} {selectedDay}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {sessionDays.has(selectedDay) && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#22D3A5]/10 border border-[#22D3A5]/20">
                <span className="w-2 h-2 rounded-full bg-[#22D3A5]" />
                <p className="text-xs text-[#22D3A5]">Session already recorded for this day</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Time</label>
              <input
                type="time"
                value={modalTime}
                onChange={(e) => setModalTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass border border-white/8 text-sm text-white bg-transparent focus:outline-none focus:border-[#6C63FF]/50 transition-all"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl glass border border-white/8 text-white/60 text-sm font-medium hover:bg-white/6 transition-all"
              >
                Cancel
              </button>
              <Link
                href="/onboarding"
                className="flex-1 py-3 rounded-xl bg-[#6C63FF] hover:bg-[#7B74FF] text-white text-sm font-bold text-center transition-all"
                onClick={() => setShowModal(false)}
              >
                Start Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SessionsView() {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-white">All Sessions</h2>
      <div className="glass rounded-2xl overflow-hidden">
        {[...MOCK_SESSIONS].reverse().map((s, i) => (
          <div key={s.id} className="border-b border-white/5 last:border-0">
            <button
              className="w-full px-5 py-4 flex items-center gap-4 hover:bg-white/3 transition-colors text-left"
              onClick={() => setExpanded(expanded === s.id ? null : s.id)}
            >
              <ConfidenceScore score={s.confidenceScore} size="sm" showLabel={false} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{s.topic}</p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="text-xs text-white/40">{s.date}</span>
                  <span className="text-xs text-white/40 flex items-center gap-1"><Clock size={9} />{s.duration}s</span>
                  <span className="text-xs text-white/40 flex items-center gap-1"><Eye size={9} />{s.eyeContactPercent}%</span>
                  <span className="text-xs text-white/40">{s.wordsPerMinute} WPM</span>
                  <span className="text-xs text-[#F5A623]">{s.fillerWordsPerMinute}/min fillers</span>
                </div>
              </div>
              <ChevronRight size={14} className={`text-white/30 shrink-0 transition-transform ${expanded === s.id ? "rotate-90" : ""}`} />
            </button>
            {expanded === s.id && (
              <div className="px-5 pb-5 pt-2 border-t border-white/5 bg-white/2">
                <p className="text-[11px] uppercase tracking-widest text-white/25 font-semibold mb-2">Transcript</p>
                <p className="text-sm text-white/55 leading-relaxed">{s.transcript}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-white">Settings</h2>
      <div className="glass rounded-2xl p-6 flex flex-col gap-5">
        <div>
          <p className="text-sm font-semibold text-white mb-1">Display Name</p>
          <input
            type="text"
            defaultValue="Demo User"
            className="w-full max-w-xs px-4 py-3 rounded-xl glass border border-white/8 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#6C63FF]/50 transition-all"
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-white mb-1">Email</p>
          <input
            type="email"
            defaultValue="demo@echo.app"
            className="w-full max-w-xs px-4 py-3 rounded-xl glass border border-white/8 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#6C63FF]/50 transition-all"
          />
        </div>
        <button className="w-fit px-5 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#7B74FF] text-white text-sm font-semibold transition-all">
          Save Changes
        </button>
      </div>
    </div>
  );
}

// ── Sparkline SVG ─────────────────────────────────────────────────────────────
function Sparkline({ scores, dates }: { scores: number[]; dates: string[] }) {
  const W = 400; const H = 80; const PAD = 12;
  const min = Math.min(...scores) - 5;
  const max = Math.max(...scores) + 5;
  const xStep = (W - PAD * 2) / (scores.length - 1);
  const toY = (v: number) => H - PAD - ((v - min) / (max - min)) * (H - PAD * 2);
  const points = scores.map((s, i) => `${PAD + i * xStep},${toY(s)}`).join(" ");

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
        {/* Gradient fill */}
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6C63FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          points={`${PAD},${H} ${points} ${PAD + (scores.length - 1) * xStep},${H}`}
          fill="url(#sparkGrad)"
        />
        <polyline points={points} fill="none" stroke="#6C63FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {scores.map((s, i) => (
          <circle key={i} cx={PAD + i * xStep} cy={toY(s)} r="4" fill="#0A0A0A" stroke="#6C63FF" strokeWidth="2" />
        ))}
        {scores.map((s, i) => (
          <text key={`l${i}`} x={PAD + i * xStep} y={toY(s) - 8} textAnchor="middle" fill="#fff" fontSize="10" opacity="0.6">{s}</text>
        ))}
      </svg>
      <div className="flex justify-between px-3 mt-1">
        {dates.map((d, i) => (
          <span key={i} className="text-[10px] text-white/30">{d}</span>
        ))}
      </div>
    </div>
  );
}

// ── Metric Bar ─────────────────────────────────────────────────────────────────
function MetricBar({ label, value, baseline, unit, color, higherIsBetter = true }: {
  label: string; value: number; baseline: number; unit: string;
  color: string; higherIsBetter?: boolean;
}) {
  const pct = Math.min(100, Math.max(0, higherIsBetter ? (value / 100) * 100 : Math.max(0, 100 - (value / 5) * 100)));
  const good = higherIsBetter ? value >= baseline : value <= baseline;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/50">{label}</span>
        <span className="font-semibold" style={{ color }}>{value}{unit}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <p className="text-[10px] text-white/25">Baseline: {baseline}{unit} · {good ? "Above" : "Below"} target</p>
    </div>
  );
}

function OverviewView({ isDemo, userName }: { isDemo: boolean; userName: string }) {
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const avgScore = Math.round(MOCK_SESSIONS.reduce((a, s) => a + s.confidenceScore, 0) / MOCK_SESSIONS.length);
  const latestSession = MOCK_SESSIONS[MOCK_SESSIONS.length - 1];
  const bestSession = [...MOCK_SESSIONS].sort((a, b) => b.confidenceScore - a.confidenceScore)[0];

  const coachingTips = [
    "Your eye contact improved 6% from your first session. Try to push past 75% today.",
    "You said 'um' less in your last session. Before your next one, try 10 seconds of silence.",
    "Your speaking pace hit 148 WPM last session, right in the ideal range. Maintain it.",
  ];
  const tip = coachingTips[new Date().getDay() % coachingTips.length];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col gap-6">
      {/* Demo banner */}
      {isDemo && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#F5A623]/10 border border-[#F5A623]/20">
          <AlertCircle size={16} className="text-[#F5A623] shrink-0" />
          <p className="text-sm text-[#F5A623]">
            Viewing Demo Account.{" "}
            <Link href="/onboarding" className="underline underline-offset-2 font-semibold hover:text-[#F5A623]/80">
              sign up to save real progress
            </Link>
          </p>
        </div>
      )}

      {/* Welcome + New Session */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">{greeting}, {userName} 👋</h2>
          <p className="text-sm text-white/45 mt-1">Monday, May 11, 2026</p>
        </div>
        <Link
          href="/try"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6C63FF] hover:bg-[#7B74FF] text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-[#6C63FF]/20"
        >
          <Zap size={14} />
          New Session
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: List, label: "Sessions This Week", value: MOCK_SESSIONS.length, color: "#6C63FF" },
          { icon: TrendingUp, label: "Avg Score", value: avgScore, color: "#22D3A5" },
          { icon: Flame, label: "Day Streak", value: "3🔥", color: "#F5A623" },
          { icon: Eye, label: "Avg Eye Contact", value: `${Math.round(MOCK_SESSIONS.reduce((a, s) => a + s.eyeContactPercent, 0) / MOCK_SESSIONS.length)}%`, color: "#22D3A5" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="glass rounded-2xl p-4 flex flex-col gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
              <Icon size={13} style={{ color }} />
            </div>
            <p className="text-xl font-bold text-white tabular-nums">{value}</p>
            <p className="text-[11px] text-white/40 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Performance Trend */}
      <div className="glass rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/35">Performance Trend</p>
          <span className="text-xs text-[#22D3A5] font-semibold">+8 pts this week</span>
        </div>
        <Sparkline
          scores={MOCK_SESSIONS.map(s => s.confidenceScore)}
          dates={MOCK_SESSIONS.map(s => s.date.replace("May ", "May "))}
        />
      </div>

      {/* Metrics breakdown — latest session */}
      <div className="glass rounded-2xl p-5 flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/35">
          Latest Session Breakdown: {latestSession.topic}
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <MetricBar label="Eye Contact" value={latestSession.eyeContactPercent} baseline={72} unit="%" color="#22D3A5" higherIsBetter />
          <MetricBar label="Speaking Pace" value={latestSession.wordsPerMinute} baseline={145} unit=" WPM" color="#6C63FF" higherIsBetter />
          <MetricBar label="Filler Words" value={Number(latestSession.fillerWordsPerMinute.toFixed(1))} baseline={1.2} unit="/min" color="#F5A623" higherIsBetter={false} />
          <MetricBar label="Presence Score" value={latestSession.confidenceScore} baseline={83} unit="" color="#22D3A5" higherIsBetter />
        </div>
      </div>

      {/* Personal Best + Next session row */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="shrink-0">
            <ConfidenceScore score={bestSession.confidenceScore} size="sm" showLabel={false} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#F5A623] mb-1">Personal Best</p>
            <p className="text-sm font-semibold text-white">{bestSession.topic}</p>
            <p className="text-xs text-white/40">{bestSession.date}</p>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6C63FF]/15 flex items-center justify-center shrink-0">
              <Calendar size={16} className="text-[#6C63FF]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Next Session</p>
              <p className="text-[11px] text-white/40 mt-0.5">Today · 3:00 PM</p>
            </div>
          </div>
          <Link href="/try" className="px-3 py-1.5 rounded-lg bg-[#6C63FF]/15 text-[#6C63FF] text-xs font-bold border border-[#6C63FF]/20 hover:bg-[#6C63FF]/25 transition-all whitespace-nowrap">
            Start Now
          </Link>
        </div>
      </div>

      {/* Recent sessions — expandable */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/35">Recent Sessions</p>
        {[...MOCK_SESSIONS].reverse().map((s) => (
          <div key={s.id} className="glass rounded-2xl overflow-hidden">
            <button
              className="w-full p-4 flex items-center justify-between gap-4 hover:bg-white/3 transition-colors text-left"
              onClick={() => setExpandedSession(expandedSession === s.id ? null : s.id)}
            >
              <div className="flex items-center gap-4">
                <ConfidenceScore score={s.confidenceScore} size="sm" showLabel={false} />
                <div>
                  <p className="text-sm font-semibold text-white">{s.topic}</p>
                  <p className="text-xs text-white/40 mt-0.5">{s.date} · {s.duration}s</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="hidden sm:flex items-center gap-3 text-xs text-white/40">
                  <span className="flex items-center gap-1"><Eye size={10} />{s.eyeContactPercent}%</span>
                  <span className="flex items-center gap-1"><Clock size={10} />{s.wordsPerMinute} WPM</span>
                  <span className="text-[#F5A623]">{s.fillerWordsPerMinute}/min fillers</span>
                </div>
                <ChevronRight size={14} className={`text-white/30 transition-transform ${expandedSession === s.id ? "rotate-90" : ""}`} />
              </div>
            </button>
            {expandedSession === s.id && (
              <div className="px-4 pb-4 border-t border-white/5 pt-3">
                <p className="text-[11px] uppercase tracking-widest text-white/25 font-semibold mb-2">Transcript</p>
                <p className="text-sm text-white/50 leading-relaxed">{s.transcript}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Coaching tip */}
      <div className="glass rounded-2xl p-5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#22D3A5]/15 flex items-center justify-center shrink-0 mt-0.5">
          <Zap size={14} className="text-[#22D3A5]" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#22D3A5] mb-1">Coaching Tip</p>
          <p className="text-sm text-white/60 leading-relaxed">{tip}</p>
        </div>
      </div>
    </div>
  );
}

function DashboardInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, ready, signInDemo } = useAuth();
  const [active, setActive] = useState<NavSection>("overview");

  // If arriving via ?demo=true, sign in as demo automatically
  useEffect(() => {
    if (!ready) return;
    if (searchParams.get("demo") === "true" && !user) {
      signInDemo();
    }
  }, [ready, searchParams, user, signInDemo]);

  // Redirect unauthenticated visitors who aren't arriving via demo link
  useEffect(() => {
    if (!ready) return;
    if (!user && searchParams.get("demo") !== "true") {
      router.replace("/");
    }
  }, [ready, user, searchParams, router]);

  // Show nothing while resolving auth
  if (!ready || (!user && searchParams.get("demo") !== "true")) {
    return <div className="min-h-screen bg-[#0A0A0A]" />;
  }

  const isDemo = user?.isDemo ?? searchParams.get("demo") === "true";
  const userName = user?.name ?? "there";

  return (
    <div className="min-h-screen flex bg-[#0A0A0A]">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-56 border-r border-white/5 py-6 px-4 gap-2 shrink-0">
        <Link href="/" className="flex items-center gap-2 mb-6 px-2">
          <div className="w-7 h-7 rounded-lg bg-[#6C63FF]/20 flex items-center justify-center">
            <Mic2 size={14} className="text-[#6C63FF]" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-white">Echo</span>
        </Link>

        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
              active === id
                ? "bg-[#6C63FF]/15 text-white border border-[#6C63FF]/20"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Mobile top nav */}
        <div className="md:hidden flex items-center gap-2 px-4 py-3 border-b border-white/5 overflow-x-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                active === id
                  ? "bg-[#6C63FF]/15 text-white"
                  : "text-white/50"
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 px-6 py-8 max-w-4xl">
          {active === "overview" && <OverviewView isDemo={isDemo} userName={userName} />}
          {active === "sessions" && <SessionsView />}
          {active === "calendar" && <CalendarView />}
          {active === "settings" && <SettingsView />}
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
      <DashboardInner />
    </Suspense>
  );
}
