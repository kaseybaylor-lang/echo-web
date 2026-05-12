import Link from "next/link";
import {
  Mic2, Eye, Activity, GraduationCap, ArrowRight,
  Zap, Shield, Users, ChevronRight
} from "lucide-react";
import Navigation from "@/components/ui/Navigation";

const FEATURES = [
  {
    icon: Eye,
    title: "Eye Contact Tracking",
    description: "Real-time gaze analysis measures audience engagement as you speak, comparing you against top-percentile presenters.",
    color: "#22D3A5",
  },
  {
    icon: Mic2,
    title: "Filler Word Detection",
    description: "\"Um\", \"like\", \"uh\" spotted instantly. Echo gives you a live count and post-session breakdown to help you clean up your speech.",
    color: "#6C63FF",
  },
  {
    icon: Activity,
    title: "Presence & Stillness",
    description: "Head movement variance is a real signal. Echo detects nervous fidgeting so you can project calm authority.",
    color: "#F5A623",
  },
  {
    icon: Shield,
    title: "100% Private",
    description: "All processing happens on-device. Your video never leaves your machine, not even to our servers.",
    color: "#22D3A5",
  },
];

const STEPS = [
  { num: "01", title: "Click 30-Second Trial", body: "No account needed. Allow camera access and start speaking." },
  { num: "02", title: "Speak Naturally", body: "Echo tracks your eye contact, stillness, and filler words live." },
  { num: "03", title: "See Your Report", body: "Compare your results against executive communication baselines." },
  { num: "04", title: "Level Up", body: "Create an account to track progress over time and share with professors." },
];

const STATS = [
  { value: "72%", label: "avg executive eye contact" },
  { value: "1.2", label: "filler words/min (exec baseline)" },
  { value: "83", label: "avg executive presence score" },
  { value: "30s", label: "to get your first insight" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center pt-40 pb-32 px-6 text-center overflow-hidden">
        {/* Background glow */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-20 blur-[140px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #6C63FF 0%, transparent 70%)" }}
        />

        <h1 className="text-6xl md:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-8 fade-up max-w-4xl">
          Speak like you
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #6C63FF, #22D3A5)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            already own the room.
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-white/50 max-w-2xl leading-relaxed mb-12 fade-up fade-up-delay-2">
          Echo is your private AI communication coach. 30 seconds is all it takes
          to know where you stand and exactly what to work on.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 fade-up fade-up-delay-3">
          <Link
            href="/onboarding"
            className="flex items-center justify-center gap-2 px-10 py-5 rounded-2xl bg-[#6C63FF] hover:bg-[#7B74FF] text-white font-bold text-lg transition-all hover:shadow-2xl hover:shadow-[#6C63FF]/30 active:scale-[0.97] glow-accent"
          >
            <Zap size={20} />
            Try for Free in 30 Seconds
          </Link>
          <Link
            href="/dashboard/professor"
            className="flex items-center justify-center gap-2 px-10 py-5 rounded-2xl glass hover:bg-white/8 text-white/70 hover:text-white font-semibold text-lg transition-all border border-white/8"
          >
            <GraduationCap size={18} />
            Professor View
            <ChevronRight size={16} className="text-white/30" />
          </Link>
        </div>

        <p className="mt-8 text-sm text-white/25 fade-up fade-up-delay-4">
          No credit card. No video upload. Runs entirely in your browser.
        </p>
      </section>

      {/* ── Stats Bar ──────────────────────────────────────────────────────── */}
      <section className="mx-6 md:mx-auto md:max-w-5xl mb-28">
        <div className="glass rounded-2xl grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center py-8 px-6 text-center">
              <span className="text-4xl md:text-5xl font-bold text-white tabular-nums">{value}</span>
              <span className="text-sm text-white/35 mt-2 leading-tight max-w-[120px]">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section className="px-6 pb-28">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-white/30 mb-4">What Echo Measures</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white">Four signals. Infinite improvement.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {FEATURES.map(({ icon: Icon, title, description, color }) => (
              <div
                key={title}
                className="glass rounded-2xl p-8 group hover:bg-white/6 transition-all duration-300"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${color}18` }}
                >
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
                <p className="text-base text-white/45 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────────── */}
      <section className="px-6 pb-28">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-white/30 mb-4">Getting Started</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white">Zero setup. Real results.</h2>
          </div>
          <div className="flex flex-col gap-4">
            {STEPS.map(({ num, title, body }) => (
              <div key={num} className="flex items-start gap-6 glass rounded-2xl p-6">
                <span className="text-sm font-bold text-white/20 tabular-nums mt-0.5 w-8 shrink-0">{num}</span>
                <div>
                  <p className="font-semibold text-white text-base mb-1.5">{title}</p>
                  <p className="text-base text-white/45">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Professor CTA ──────────────────────────────────────────────────── */}
      <section className="px-6 pb-28">
        <div className="max-w-3xl mx-auto">
          <div className="glass-strong rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full opacity-15 blur-[80px] pointer-events-none"
              style={{ background: "#6C63FF" }}
            />
            <GraduationCap size={40} className="text-[#6C63FF] mx-auto mb-5" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">For Professors & Instructors</h2>
            <p className="text-lg text-white/50 mb-8 max-w-lg mx-auto leading-relaxed">
              Students can generate a shareable performance link (proof they practiced) without
              sharing any video. A privacy-first solution for communication courses.
            </p>
            <Link
              href="/dashboard/professor"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#6C63FF] hover:bg-[#7B74FF] text-white font-semibold text-base transition-all hover:shadow-lg hover:shadow-[#6C63FF]/25"
            >
              <Users size={18} />
              View Professor Dashboard
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <section className="px-6 pb-36 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5">Ready to hear yourself clearly?</h2>
          <p className="text-lg text-white/45 mb-10">
            No download. No signup required to start. Just you, a camera, and 30 seconds.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-12 py-5 rounded-2xl bg-[#6C63FF] hover:bg-[#7B74FF] text-white font-bold text-lg transition-all hover:shadow-2xl hover:shadow-[#6C63FF]/30 active:scale-[0.97]"
          >
            <Zap size={20} />
            Start Your Free Trial
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Mic2 size={16} className="text-[#6C63FF]" />
            <span className="text-base font-semibold text-white/60">Echo</span>
          </div>
          <p className="text-sm text-white/25">
            Built for USF students. All processing on-device. No video stored.
          </p>
        </div>
      </footer>
    </div>
  );
}
