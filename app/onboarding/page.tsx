"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Mic2, ArrowLeft, ArrowRight, CheckCircle2, User, Mail, Lock,
  Eye, Gauge, Heart, Layers, Star, Check
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type Step = "intro" | "feedback-style" | "goals" | "profile" | "signup";

const STEPS: Step[] = ["intro", "feedback-style", "goals", "profile", "signup"];

interface ProfileData {
  feedbackStyle: string;
  goals: string[];
  classYear: string;
  university: string;
  ageGroup: string;
}

const FEEDBACK_OPTIONS = [
  { id: "direct", label: "Direct & blunt", description: "Give it to me straight, no sugar-coating", emoji: "⚡" },
  { id: "encouraging", label: "Encouraging first", description: "Start positive, then areas to improve", emoji: "🌱" },
  { id: "data", label: "Data-driven only", description: "Just the numbers, I'll figure out the rest", emoji: "📊" },
];

const GOAL_OPTIONS = [
  { id: "eye-contact", label: "Eye contact", icon: Eye },
  { id: "filler-words", label: "Filler words", icon: Mic2 },
  { id: "speaking-pace", label: "Speaking pace", icon: Gauge },
  { id: "confidence", label: "Confidence", icon: Heart },
  { id: "clarity", label: "Clarity", icon: Layers },
  { id: "stage-presence", label: "Stage presence", icon: Star },
];

function ProgressDots({ current }: { current: Step }) {
  const idx = STEPS.indexOf(current);
  return (
    <div className="flex items-center gap-2 justify-center">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`rounded-full transition-all duration-300 ${
              i < idx
                ? "w-2 h-2 bg-[#22D3A5]"
                : i === idx
                ? "w-3 h-3 bg-[#6C63FF]"
                : "w-2 h-2 bg-white/15"
            }`}
          />
          {i < STEPS.length - 1 && (
            <div className={`h-px transition-all duration-500 ${i < idx ? "w-8 bg-[#22D3A5]/40" : "w-8 bg-white/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { register, signInDemo } = useAuth();

  const [step, setStep] = useState<Step>("intro");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [accountCreated, setAccountCreated] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    feedbackStyle: "",
    goals: [],
    classYear: "",
    university: "",
    ageGroup: "",
  });

  const handleCreateAccount = useCallback(() => {
    register(fullName || email.split("@")[0], email, password);
    setAccountCreated(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  }, [fullName, email, password, register, router]);

  const handleSkip = useCallback(() => {
    signInDemo();
    router.push("/dashboard");
  }, [signInDemo, router]);

  const goNext = useCallback(() => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  }, [step]);

  const goBack = useCallback(() => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  }, [step]);

  const toggleGoal = (id: string) => {
    setProfile((p) => {
      const has = p.goals.includes(id);
      if (has) return { ...p, goals: p.goals.filter((g) => g !== id) };
      if (p.goals.length >= 3) return p;
      return { ...p, goals: [...p.goals, id] };
    });
  };

  const showBack = step !== "intro";


  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A]">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="w-16">
          {showBack && (
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="text-sm font-medium">Back</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Mic2 size={14} className="text-[#6C63FF]" />
          <span className="text-sm font-semibold text-white/80">Echo</span>
        </div>
        <div className="w-16" />
      </header>

      <div className="flex-1 flex flex-col items-center px-4 py-8 max-w-5xl mx-auto w-full gap-6">
        {/* Progress dots */}
        <ProgressDots current={step} />

        {/* ── Step 1: Intro ─────────────────────────────────────────────── */}
        {step === "intro" && (
          <div className="w-full max-w-md mx-auto flex flex-col gap-6 fade-up">
            <div className="text-center pt-4">
              <div className="w-16 h-16 rounded-2xl bg-[#6C63FF]/15 flex items-center justify-center mx-auto mb-5 glow-accent">
                <Mic2 size={28} className="text-[#6C63FF]" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">Welcome to Echo</h1>
              <p className="text-white/50 leading-relaxed">
                In 30 seconds, you&apos;ll have real data on your eye contact, pacing, and
                filler words, compared to executive-level communicators.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { icon: "👁", text: "Camera access for eye contact tracking" },
                { icon: "🎤", text: "Microphone for filler word detection" },
                { icon: "🔒", text: "Everything stays on your device" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3 glass rounded-xl px-4 py-3">
                  <span className="text-base">{icon}</span>
                  <p className="text-sm text-white/60">{text}</p>
                </div>
              ))}
            </div>

            <button
              onClick={goNext}
              className="w-full py-4 rounded-2xl bg-[#6C63FF] hover:bg-[#7B74FF] text-white font-bold text-base transition-all hover:shadow-2xl hover:shadow-[#6C63FF]/30 active:scale-[0.98] gradient-border flex items-center justify-center gap-2"
            >
              Start Today
              <ArrowRight size={16} />
            </button>

            <p className="text-center text-xs text-white/25">
              No account needed. Your data stays on your device.
            </p>
          </div>
        )}

        {/* ── Step 2: Feedback Style ─────────────────────────────────────── */}
        {step === "feedback-style" && (
          <div className="w-full max-w-lg mx-auto flex flex-col gap-6 fade-up">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-2">Step 2 of 5</p>
              <h2 className="text-2xl font-bold text-white mb-2">How do you prefer to receive feedback?</h2>
              <p className="text-sm text-white/45">This shapes how Echo coaches you during sessions.</p>
            </div>

            <div className="flex flex-col gap-3">
              {FEEDBACK_OPTIONS.map((opt) => {
                const selected = profile.feedbackStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setProfile((p) => ({ ...p, feedbackStyle: opt.id }))}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                      selected
                        ? "border-[#6C63FF]/60 bg-[#6C63FF]/10"
                        : "border-white/8 glass hover:border-white/20 hover:bg-white/5"
                    }`}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-white text-sm">{opt.label}</p>
                      <p className="text-xs text-white/45 mt-0.5">{opt.description}</p>
                    </div>
                    {selected && <Check size={16} className="text-[#6C63FF] shrink-0" />}
                  </button>
                );
              })}
            </div>

            <button
              onClick={goNext}
              disabled={!profile.feedbackStyle}
              className="w-full py-4 rounded-2xl bg-[#6C63FF] hover:bg-[#7B74FF] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ── Step 3: Goals ─────────────────────────────────────────────── */}
        {step === "goals" && (
          <div className="w-full max-w-lg mx-auto flex flex-col gap-6 fade-up">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-2">Step 3 of 5</p>
              <h2 className="text-2xl font-bold text-white mb-2">What do you want to improve?</h2>
              <p className="text-sm text-white/45">Pick up to 3 areas to focus on.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {GOAL_OPTIONS.map(({ id, label, icon: Icon }) => {
                const selected = profile.goals.includes(id);
                const disabled = !selected && profile.goals.length >= 3;
                return (
                  <button
                    key={id}
                    onClick={() => toggleGoal(id)}
                    disabled={disabled}
                    className={`relative flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${
                      selected
                        ? "border-[#6C63FF]/60 bg-[#6C63FF]/10"
                        : disabled
                        ? "border-white/5 opacity-40 cursor-not-allowed"
                        : "border-white/8 glass hover:border-white/20 hover:bg-white/5"
                    }`}
                  >
                    {selected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#6C63FF] flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: selected ? "rgba(108,99,255,0.2)" : "rgba(255,255,255,0.05)" }}
                    >
                      <Icon size={18} style={{ color: selected ? "#6C63FF" : "rgba(255,255,255,0.4)" }} />
                    </div>
                    <span className={`text-sm font-medium ${selected ? "text-white" : "text-white/60"}`}>{label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={goNext}
              disabled={profile.goals.length === 0}
              className="w-full py-4 rounded-2xl bg-[#6C63FF] hover:bg-[#7B74FF] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ── Step 4: Profile ───────────────────────────────────────────── */}
        {step === "profile" && (
          <div className="w-full max-w-md mx-auto flex flex-col gap-6 fade-up">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-2">Step 4 of 5</p>
              <h2 className="text-2xl font-bold text-white mb-2">Tell us about yourself</h2>
              <p className="text-sm text-white/45">Helps Echo benchmark you against your peers.</p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Class Year</label>
                <select
                  value={profile.classYear}
                  onChange={(e) => setProfile((p) => ({ ...p, classYear: e.target.value }))}
                  className="w-full px-4 py-3.5 rounded-xl glass border border-white/8 text-sm text-white bg-transparent focus:outline-none focus:border-[#6C63FF]/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled className="bg-[#111]">Select year…</option>
                  <option value="freshman" className="bg-[#111]">Freshman</option>
                  <option value="sophomore" className="bg-[#111]">Sophomore</option>
                  <option value="junior" className="bg-[#111]">Junior</option>
                  <option value="senior" className="bg-[#111]">Senior</option>
                  <option value="grad" className="bg-[#111]">Graduate Student</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">University</label>
                <input
                  type="text"
                  value={profile.university}
                  onChange={(e) => setProfile((p) => ({ ...p, university: e.target.value }))}
                  placeholder="e.g. University of San Francisco"
                  className="w-full px-4 py-3.5 rounded-xl glass border border-white/8 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#6C63FF]/50 focus:bg-white/6 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Age Group</label>
                <select
                  value={profile.ageGroup}
                  onChange={(e) => setProfile((p) => ({ ...p, ageGroup: e.target.value }))}
                  className="w-full px-4 py-3.5 rounded-xl glass border border-white/8 text-sm text-white bg-transparent focus:outline-none focus:border-[#6C63FF]/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled className="bg-[#111]">Select age group…</option>
                  <option value="18-20" className="bg-[#111]">18–20</option>
                  <option value="21-23" className="bg-[#111]">21–23</option>
                  <option value="24-26" className="bg-[#111]">24–26</option>
                  <option value="27+" className="bg-[#111]">27+</option>
                </select>
              </div>
            </div>

            <button
              onClick={goNext}
              className="w-full py-4 rounded-2xl bg-[#6C63FF] hover:bg-[#7B74FF] text-white font-bold text-sm transition-all hover:shadow-xl hover:shadow-[#6C63FF]/30 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight size={16} />
            </button>

            <p className="text-center text-xs text-white/25">Fields are optional. You can skip ahead.</p>
          </div>
        )}

        {/* ── Step 5: Signup ────────────────────────────────────────────── */}
        {step === "signup" && (
          <div className="w-full max-w-md mx-auto">
            {accountCreated ? (
              <div className="flex flex-col items-center gap-4 py-12 fade-up">
                <div className="w-16 h-16 rounded-2xl bg-[#22D3A5]/15 flex items-center justify-center">
                  <CheckCircle2 size={28} className="text-[#22D3A5]" />
                </div>
                <h2 className="text-2xl font-bold text-white">Account created!</h2>
                <p className="text-sm text-white/45">Taking you to your dashboard…</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5 fade-up">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#6C63FF]/15 flex items-center justify-center mx-auto mb-4">
                    <User size={24} className="text-[#6C63FF]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Save Your Progress</h2>
                  <p className="text-sm text-white/45">
                    Create a free account to track improvement over time and share with professors.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full name"
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl glass border border-white/8 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#6C63FF]/50 focus:bg-white/6 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@university.edu"
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl glass border border-white/8 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#6C63FF]/50 focus:bg-white/6 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl glass border border-white/8 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#6C63FF]/50 focus:bg-white/6 transition-all"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCreateAccount}
                  disabled={!email || !password}
                  className="w-full py-4 rounded-2xl bg-[#6C63FF] hover:bg-[#7B74FF] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-all hover:shadow-xl hover:shadow-[#6C63FF]/30 active:scale-[0.98]"
                >
                  Create Free Account
                </button>

                <button
                  onClick={handleSkip}
                  className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/8 text-white/50 hover:text-white/70 font-medium text-sm transition-all border border-white/8"
                >
                  Skip for now
                </button>

                <p className="text-center text-sm text-white/40">
                  Already have an account?{" "}
                  <a href="/signin" className="text-[#6C63FF] hover:text-[#7B74FF] font-medium transition-colors">
                    Sign in
                  </a>
                </p>

                <div className="flex items-start gap-2 p-3 rounded-xl bg-white/3 border border-white/5">
                  <CheckCircle2 size={14} className="text-[#22D3A5] mt-0.5 shrink-0" />
                  <p className="text-xs text-white/35 leading-relaxed">
                    Your video is never stored. We only keep aggregated performance metrics.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
