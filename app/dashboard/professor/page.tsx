"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  GraduationCap, Eye, Mic2, Activity, Copy, Check, ExternalLink,
  ArrowLeft, Lock, RefreshCw, TrendingUp, TrendingDown, Minus,
  Search, Users, ChevronRight
} from "lucide-react";
import ConfidenceScore from "@/components/coach/ConfidenceScore";
import { generateShareToken, scoreGrade, EXECUTIVE_BASELINE } from "@/lib/utils";

// ── 20 demo student profiles ──────────────────────────────────────────────────
interface Session { date: string; score: number; eyeContact: number; fillerWPM: number; topic: string; transcript: string; }
interface Student {
  id: number; name: string; university: string; classYear: string;
  avgScore: number; trend: number; sessions: Session[];
  eyeContact: number; fillerWPM: number; fidgetLevel: number;
}

function makeSessions(base: number, trend: number): Session[] {
  const topics = [
    ["Introduction speech", "Project pitch", "Debate prep"],
    ["Persuasive argument", "Research summary", "Group facilitation"],
    ["Product demo", "Case study", "Interview simulation"],
    ["TED-style talk", "Panel Q&A", "Negotiation roleplay"],
  ];
  const transcripts = [
    "Hi everyone, I want to share why effective communication matters. Research shows that clear speakers earn 25% more than peers with equal skills. Today I'll cover three actionable techniques you can use starting tomorrow.",
    "Good afternoon. The problem I'm solving today is information overload in modern teams. My proposed solution reduces meeting time by 40% through asynchronous video updates and structured written summaries.",
    "The resolution I'm defending is that structured practice improves outcomes in any domain. Evidence from sports psychology, music training, and language acquisition all point to the same conclusion: deliberate repetition with feedback wins.",
  ];
  const t = topics[base % topics.length];
  return [
    { date: "May 9, 2026", score: Math.max(40, base - 8), eyeContact: Math.max(35, base - 10), fillerWPM: 2.8 - (base - 40) / 50, topic: t[0], transcript: transcripts[0] },
    { date: "May 10, 2026", score: Math.max(40, base - 4 + Math.round(trend / 2)), eyeContact: Math.max(38, base - 5), fillerWPM: 2.4 - (base - 40) / 50, topic: t[1], transcript: transcripts[1] },
    { date: "May 11, 2026", score: Math.min(95, base + trend), eyeContact: Math.min(90, base + 3), fillerWPM: Math.max(0.5, 2.0 - (base - 40) / 50), topic: t[2], transcript: transcripts[2] },
  ];
}

const DEMO_STUDENTS: Student[] = [
  { id: 1, name: "Kasey Baylor",     university: "USF",    classYear: "Junior",   avgScore: 78, trend: +8,  eyeContact: 71, fillerWPM: 1.8, fidgetLevel: 18, sessions: makeSessions(74, 8) },
  { id: 2, name: "Marcus Osei",      university: "UCF",    classYear: "Senior",   avgScore: 83, trend: +5,  eyeContact: 76, fillerWPM: 1.3, fidgetLevel: 14, sessions: makeSessions(80, 5) },
  { id: 3, name: "Priya Nair",       university: "UF",     classYear: "Grad",     avgScore: 89, trend: +3,  eyeContact: 82, fillerWPM: 0.9, fidgetLevel: 11, sessions: makeSessions(87, 3) },
  { id: 4, name: "Jordan Ellis",     university: "FSU",    classYear: "Freshman", avgScore: 52, trend: +11, eyeContact: 44, fillerWPM: 3.6, fidgetLevel: 41, sessions: makeSessions(45, 11) },
  { id: 5, name: "Aisha Thompson",   university: "FIU",    classYear: "Junior",   avgScore: 71, trend: +6,  eyeContact: 65, fillerWPM: 2.1, fidgetLevel: 22, sessions: makeSessions(67, 6) },
  { id: 6, name: "Devon Alvarez",    university: "Miami",  classYear: "Sophomore",avgScore: 64, trend: -2,  eyeContact: 58, fillerWPM: 2.7, fidgetLevel: 31, sessions: makeSessions(66, -2) },
  { id: 7, name: "Chloe Park",       university: "Nova",   classYear: "Junior",   avgScore: 77, trend: +4,  eyeContact: 70, fillerWPM: 1.9, fidgetLevel: 20, sessions: makeSessions(74, 4) },
  { id: 8, name: "Elijah Moss",      university: "Stetson",classYear: "Senior",   avgScore: 81, trend: +2,  eyeContact: 74, fillerWPM: 1.5, fidgetLevel: 16, sessions: makeSessions(79, 2) },
  { id: 9, name: "Natalia Reyes",    university: "USF",    classYear: "Sophomore",avgScore: 60, trend: +9,  eyeContact: 53, fillerWPM: 2.9, fidgetLevel: 35, sessions: makeSessions(53, 9) },
  { id: 10, name: "Brendan Walsh",   university: "UCF",    classYear: "Grad",     avgScore: 86, trend: +1,  eyeContact: 79, fillerWPM: 1.1, fidgetLevel: 13, sessions: makeSessions(85, 1) },
  { id: 11, name: "Imani Clarke",    university: "UF",     classYear: "Junior",   avgScore: 74, trend: +7,  eyeContact: 68, fillerWPM: 2.0, fidgetLevel: 23, sessions: makeSessions(69, 7) },
  { id: 12, name: "Tyler Nguyen",    university: "FSU",    classYear: "Freshman", avgScore: 48, trend: +12, eyeContact: 40, fillerWPM: 4.1, fidgetLevel: 48, sessions: makeSessions(40, 12) },
  { id: 13, name: "Simone Dubois",   university: "FIU",    classYear: "Senior",   avgScore: 85, trend: +3,  eyeContact: 78, fillerWPM: 1.2, fidgetLevel: 15, sessions: makeSessions(83, 3) },
  { id: 14, name: "Leo Kowalski",    university: "Miami",  classYear: "Junior",   avgScore: 69, trend: -4,  eyeContact: 62, fillerWPM: 2.5, fidgetLevel: 28, sessions: makeSessions(73, -4) },
  { id: 15, name: "Fatima Hussain",  university: "Nova",   classYear: "Grad",     avgScore: 91, trend: +2,  eyeContact: 85, fillerWPM: 0.7, fidgetLevel: 10, sessions: makeSessions(90, 2) },
  { id: 16, name: "Caleb Freeman",   university: "Stetson",classYear: "Sophomore",avgScore: 63, trend: +5,  eyeContact: 57, fillerWPM: 2.8, fidgetLevel: 33, sessions: makeSessions(59, 5) },
  { id: 17, name: "Yuki Tanaka",     university: "USF",    classYear: "Junior",   avgScore: 79, trend: +6,  eyeContact: 72, fillerWPM: 1.7, fidgetLevel: 19, sessions: makeSessions(74, 6) },
  { id: 18, name: "Mia Goldstein",   university: "UCF",    classYear: "Senior",   avgScore: 87, trend: +1,  eyeContact: 81, fillerWPM: 1.0, fidgetLevel: 12, sessions: makeSessions(86, 1) },
  { id: 19, name: "Darius Bell",     university: "UF",     classYear: "Freshman", avgScore: 55, trend: +10, eyeContact: 47, fillerWPM: 3.4, fidgetLevel: 44, sessions: makeSessions(47, 10) },
  { id: 20, name: "Sofia Mendes",    university: "FSU",    classYear: "Junior",   avgScore: 76, trend: +4,  eyeContact: 69, fillerWPM: 2.0, fidgetLevel: 21, sessions: makeSessions(73, 4) },
];

const classAvg = Math.round(DEMO_STUDENTS.reduce((a, s) => a + s.avgScore, 0) / DEMO_STUDENTS.length);

// ── Share link card ───────────────────────────────────────────────────────────
function ShareLinkCard({ studentName }: { studentName: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => { setToken(generateShareToken()); setCopied(false); }, []);
  const copy = useCallback(() => {
    if (!token) return;
    navigator.clipboard.writeText(`https://echo.app/share/${token}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [token]);

  return (
    <div className="glass rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-white text-sm">Share Link: {studentName}</h3>
          <p className="text-xs text-white/40 mt-1">Metrics only · No video · Expires in 7 days</p>
        </div>
        <Lock size={14} className="text-[#6C63FF] mt-0.5" />
      </div>
      {token && (
        <div className="flex gap-2">
          <div className="flex-1 glass rounded-xl px-3 py-2 text-xs text-white/40 font-mono truncate border border-white/8">
            echo.app/share/{token}
          </div>
          <button onClick={copy} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${copied ? "bg-[#22D3A5]/15 text-[#22D3A5] border border-[#22D3A5]/20" : "bg-[#6C63FF]/15 text-[#6C63FF] border border-[#6C63FF]/20 hover:bg-[#6C63FF]/25"}`}>
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
      <button onClick={generate} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#7B74FF] text-white font-semibold text-xs transition-all">
        {token ? <RefreshCw size={12} /> : <ExternalLink size={12} />}
        {token ? "Regenerate" : "Generate Share Link"}
      </button>
    </div>
  );
}

// ── Trend icon ────────────────────────────────────────────────────────────────
function TrendBadge({ trend }: { trend: number }) {
  if (trend > 0) return <span className="flex items-center gap-0.5 text-[10px] font-bold text-[#22D3A5]"><TrendingUp size={10} />+{trend}</span>;
  if (trend < 0) return <span className="flex items-center gap-0.5 text-[10px] font-bold text-[#FF5555]"><TrendingDown size={10} />{trend}</span>;
  return <span className="flex items-center gap-0.5 text-[10px] font-bold text-white/30"><Minus size={10} />0</span>;
}

export default function ProfessorDashboard() {
  const [selectedId, setSelectedId] = useState(1);
  const [query, setQuery] = useState("");
  const [expandedSession, setExpandedSession] = useState<number | null>(null);

  const student = DEMO_STUDENTS.find(s => s.id === selectedId)!;
  const { label, color } = scoreGrade(student.avgScore);

  const filtered = useMemo(() =>
    DEMO_STUDENTS.filter(s =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.university.toLowerCase().includes(query.toLowerCase())
    ), [query]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 glass sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors">
          <ArrowLeft size={16} />
          <span className="text-sm font-medium hidden sm:block">Back</span>
        </Link>
        <div className="flex items-center gap-3">
          <GraduationCap size={16} className="text-[#6C63FF]" />
          <span className="text-sm font-semibold text-white/80">Professor Dashboard</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30 border border-white/8 font-bold uppercase tracking-wider">Read-only</span>
        </div>
        <div className="w-20" />
      </header>

      {/* Class average banner */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#6C63FF]/5">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-[#6C63FF]" />
            <span className="text-white/60">Class of <span className="text-white font-semibold">{DEMO_STUDENTS.length} students</span></span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-white/40 text-xs">Class average:</span>
            <span className="text-white font-bold tabular-nums">{classAvg}</span>
            <span className="text-white/40 text-xs">/ 100</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-white/40 text-xs">Improving:</span>
            <span className="text-[#22D3A5] font-bold">{DEMO_STUDENTS.filter(s => s.trend > 0).length}</span>
            <span className="text-white/40 text-xs">· Declining:</span>
            <span className="text-[#FF5555] font-bold">{DEMO_STUDENTS.filter(s => s.trend < 0).length}</span>
          </div>
        </div>
        <Link href="/onboarding" className="text-xs text-[#6C63FF] hover:text-[#7B74FF] font-semibold transition-colors">
          Add Student →
        </Link>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Student list sidebar ──────────────────────────────────────── */}
        <aside className="w-64 shrink-0 border-r border-white/5 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-white/5">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search students…"
                className="w-full pl-8 pr-3 py-2 rounded-xl glass border border-white/8 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-[#6C63FF]/40 transition-all"
              />
            </div>
          </div>

          {/* Student list */}
          <div className="flex-1 overflow-y-auto py-1">
            {filtered.map(s => {
              const { color: sc } = scoreGrade(s.avgScore);
              const isSelected = s.id === selectedId;
              return (
                <button
                  key={s.id}
                  onClick={() => { setSelectedId(s.id); setExpandedSession(null); }}
                  className={`w-full px-3 py-2.5 flex items-center gap-3 text-left transition-all ${isSelected ? "bg-[#6C63FF]/10 border-r-2 border-[#6C63FF]" : "hover:bg-white/3"}`}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0" style={{ background: `${sc}20`, color: sc }}>
                    {s.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${isSelected ? "text-white" : "text-white/70"}`}>{s.name}</p>
                    <p className="text-[10px] text-white/35 truncate">{s.university} · {s.classYear}</p>
                  </div>
                  <div className="flex flex-col items-end shrink-0 gap-0.5">
                    <span className="text-xs font-bold tabular-nums" style={{ color: sc }}>{s.avgScore}</span>
                    <TrendBadge trend={s.trend} />
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-xs text-white/30 text-center py-8">No students match</p>
            )}
          </div>
        </aside>

        {/* ── Student detail ────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">
          {/* Student header */}
          <div className="glass rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0" style={{ background: `${color}20`, color }}>
              {student.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-white">{student.name}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${color}18`, color }}>{label}</span>
              </div>
              <p className="text-xs text-white/45 mt-0.5">{student.university} · {student.classYear} · {student.sessions.length} sessions</p>
            </div>
            <div className="hidden sm:flex items-center gap-6 text-center shrink-0">
              <div>
                <p className="text-xl font-bold text-white tabular-nums">{student.avgScore}</p>
                <p className="text-[10px] text-white/35">Avg Score</p>
              </div>
              <div>
                <p className="text-xl font-bold tabular-nums" style={{ color: student.trend >= 0 ? "#22D3A5" : "#FF5555" }}>
                  {student.trend >= 0 ? "+" : ""}{student.trend}
                </p>
                <p className="text-[10px] text-white/35">Trend</p>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Eye, label: "Eye Contact", value: `${student.eyeContact}%`, baseline: `${EXECUTIVE_BASELINE.eyeContactPercent}%`, color: student.eyeContact >= EXECUTIVE_BASELINE.eyeContactPercent ? "#22D3A5" : "#F5A623" },
              { icon: Mic2, label: "Filler Words", value: `${student.fillerWPM}/min`, baseline: `${EXECUTIVE_BASELINE.fillerWordsPerMinute}/min`, color: student.fillerWPM <= EXECUTIVE_BASELINE.fillerWordsPerMinute ? "#22D3A5" : "#F5A623" },
              { icon: Activity, label: "Presence", value: student.avgScore, baseline: EXECUTIVE_BASELINE.confidenceScore, color: student.avgScore >= EXECUTIVE_BASELINE.confidenceScore ? "#22D3A5" : "#F5A623" },
              { icon: TrendingUp, label: "Sessions", value: student.sessions.length, baseline: "—", color: "#6C63FF" },
            ].map(({ icon: Icon, label, value, baseline, color: c }) => (
              <div key={label} className="glass rounded-2xl p-4 flex flex-col gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${c}18` }}>
                  <Icon size={13} style={{ color: c }} />
                </div>
                <p className="text-lg font-bold text-white tabular-nums">{value}</p>
                <p className="text-[10px] text-white/35">{label} · baseline {baseline}</p>
              </div>
            ))}
          </div>

          {/* Session history */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-3">Session History</p>
            <div className="glass rounded-2xl overflow-hidden">
              {student.sessions.map((sess, i) => (
                <div key={i} className="border-b border-white/5 last:border-0">
                  <button
                    className="w-full px-5 py-3.5 flex items-center gap-4 hover:bg-white/3 transition-colors text-left"
                    onClick={() => setExpandedSession(expandedSession === i ? null : i)}
                  >
                    <ConfidenceScore score={sess.score} size="sm" showLabel={false} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white/80">{sess.topic}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-[11px] text-white/35">
                        <span>{sess.date}</span>
                        <span className="flex items-center gap-1"><Eye size={9} />{sess.eyeContact}%</span>
                        <span className="text-[#F5A623]">{sess.fillerWPM.toFixed(1)}/min</span>
                      </div>
                    </div>
                    <ChevronRight size={13} className={`text-white/25 transition-transform ${expandedSession === i ? "rotate-90" : ""}`} />
                  </button>
                  {expandedSession === i && (
                    <div className="px-5 pb-4 pt-2 border-t border-white/5 bg-white/2">
                      <p className="text-[10px] uppercase tracking-widest text-white/25 font-semibold mb-2">Transcript</p>
                      <p className="text-xs text-white/50 leading-relaxed">{sess.transcript}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Share link */}
          <ShareLinkCard studentName={student.name} />

          {/* Privacy note */}
          <div className="flex items-start gap-2 p-4 rounded-xl glass border border-white/5">
            <Lock size={12} className="text-white/25 mt-0.5 shrink-0" />
            <p className="text-[11px] text-white/30 leading-relaxed">
              All face-tracking runs locally on the student&apos;s device. No video is stored. Share links expose metrics only, no personal data or transcript.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
