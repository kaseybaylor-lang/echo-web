"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, Square, Eye, Activity, Gauge, Wind,
  FileText, CheckCircle2, Mic2, AlertCircle
} from "lucide-react";
import { useSocialTracking } from "@/hooks/useSocialTracking";
import { useLiveFeedback } from "@/hooks/useLiveFeedback";
import LiveFeedbackBanner from "@/components/coach/LiveFeedbackBanner";
import ConfidenceScore from "@/components/coach/ConfidenceScore";
import { countFillerWords, scoreGrade } from "@/lib/utils";

function formatTime(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

type Phase = "loading" | "active" | "result";

interface SessionResult {
  duration: number;
  confidenceScore: number;
  eyeContactPercent: number;
  fidgetLevel: number;
  wordsPerMinute: number;
  transcript: string;
  fillerCount: number;
  fillerBreakdown: { word: string; count: number }[];
}

// ── Metric pill ───────────────────────────────────────────────────────────────
function MetricPill({
  icon: Icon, label, value, unit, color,
}: {
  icon: React.ElementType; label: string; value: number | string; unit?: string; color: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/4 border border-white/6">
      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
        <Icon size={11} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-white/35 leading-none">{label}</p>
        <p className="text-sm font-bold tabular-nums" style={{ color }}>
          {value}{unit && <span className="text-[10px] font-normal text-white/40 ml-0.5">{unit}</span>}
        </p>
      </div>
    </div>
  );
}

export default function TryPage() {
  const tracking = useSocialTracking();
  const [phase, setPhase]         = useState<Phase>("loading");
  const [elapsed, setElapsed]     = useState(0);
  const [transcript, setTranscript] = useState("");
  const [notes, setNotes]         = useState("");
  const [result, setResult]       = useState<SessionResult | null>(null);

  const timerRef            = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef      = useRef<any>(null);
  const fullTranscriptRef   = useRef("");
  const elapsedRef          = useRef(0);
  const wordCountRef        = useRef(0);
  const isInitializedRef    = useRef(tracking.isInitialized);

  // Keep ref in sync so the one-shot useEffect can poll without tracking as dep
  isInitializedRef.current = tracking.isInitialized;

  const { feedbackMessage, feedbackSeverity } = useLiveFeedback(tracking, transcript);

  const eyeColor  = tracking.eyeContactPercent > 60 ? "#22D3A5" : tracking.eyeContactPercent > 40 ? "#F5A623" : "#FF5555";
  const paceColor = tracking.wordsPerMinute === 0 ? "#6C63FF"
    : tracking.wordsPerMinute >= 100 && tracking.wordsPerMinute <= 160 ? "#22D3A5"
    : "#F5A623";

  // ── Init on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    const init = async () => {
      // Poll until model ready (max 30s) — reads via ref so effect deps stay []
      for (let i = 0; i < 150; i++) {
        if (!active) return;
        if (isInitializedRef.current) break;
        await new Promise((r) => setTimeout(r, 200));
      }
      if (!active) return;
      await tracking.startTracking();
      startSpeechRecognition();
      startTimer();
      setPhase("active");
    };
    init();
    return () => {
      active = false;
      timerRef.current && clearInterval(timerRef.current);
      recognitionRef.current?.stop();
      tracking.stopTracking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // empty — polls isInitialized via ref, never triggers cleanup on model ready

  const startSpeechRecognition = useCallback(() => {
    const SR = typeof window !== "undefined"
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e: any) => {
      let interim = "", finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t + " ";
        else interim += t;
      }
      fullTranscriptRef.current += finalText;
      setTranscript(fullTranscriptRef.current + interim);
      wordCountRef.current = fullTranscriptRef.current.trim().split(/\s+/).filter(Boolean).length;
      if (elapsedRef.current > 0) tracking.reportWords(wordCountRef.current, elapsedRef.current);
    };
    rec.onerror = () => {};
    rec.onend   = () => { try { rec.start(); } catch {} };
    recognitionRef.current = rec;
    try { rec.start(); } catch {}
  }, [tracking]);

  const startTimer = useCallback(() => {
    timerRef.current && clearInterval(timerRef.current);
    let secs = 0;
    timerRef.current = setInterval(() => {
      secs += 1;
      elapsedRef.current = secs;
      setElapsed(secs);
      if (wordCountRef.current > 0) tracking.reportWords(wordCountRef.current, secs);
    }, 1000);
  }, [tracking]);

  const handleStop = useCallback(() => {
    timerRef.current && clearInterval(timerRef.current);
    recognitionRef.current?.stop();
    tracking.stopTracking();
    const { total, breakdown } = countFillerWords(fullTranscriptRef.current);
    setResult({
      duration: elapsedRef.current,
      confidenceScore: tracking.confidenceScore,
      eyeContactPercent: tracking.eyeContactPercent,
      fidgetLevel: tracking.fidgetLevel,
      wordsPerMinute: tracking.wordsPerMinute,
      transcript: fullTranscriptRef.current,
      fillerCount: total,
      fillerBreakdown: breakdown,
    });
    setPhase("result");
  }, [tracking]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (phase === "loading" && !tracking.isInitialized) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
        <p className="text-white/50 text-sm">Loading face tracking model…</p>
        <Link href="/" className="flex items-center gap-1.5 text-white/25 hover:text-white/50 text-xs transition-colors mt-2">
          <ArrowLeft size={12} /> Back
        </Link>
      </div>
    );
  }

  // ── Result ─────────────────────────────────────────────────────────────────
  if (phase === "result" && result) {
    const { label, color } = scoreGrade(result.confidenceScore);
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg flex flex-col gap-5 fade-up">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/35 mb-2">
              Session Complete: {formatTime(result.duration)}
            </p>
            <h2 className="text-2xl font-bold text-white">Your Results</h2>
          </div>

          <div className="glass rounded-2xl p-6 flex flex-col items-center gap-3">
            <ConfidenceScore score={result.confidenceScore} size="lg" animated showLabel />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Eye Contact", value: `${result.eyeContactPercent}%`, color: result.eyeContactPercent >= 65 ? "#22D3A5" : "#F5A623" },
              { label: "Speaking Pace", value: result.wordsPerMinute > 0 ? `${result.wordsPerMinute} WPM` : "—", color: paceColor },
              { label: "Filler Words", value: String(result.fillerCount), color: result.fillerCount <= 3 ? "#22D3A5" : "#F5A623" },
              { label: "Stillness", value: `${100 - result.fidgetLevel}%`, color: result.fidgetLevel < 30 ? "#22D3A5" : "#F5A623" },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass rounded-xl p-4 flex flex-col gap-1">
                <p className="text-[11px] text-white/35">{label}</p>
                <p className="text-xl font-bold" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          {result.fillerBreakdown.length > 0 && (
            <div className="glass rounded-xl p-4">
              <p className="text-[11px] uppercase tracking-widest text-white/25 font-semibold mb-2">Filler Words</p>
              <div className="flex flex-wrap gap-2">
                {result.fillerBreakdown.map(({ word, count }) => (
                  <span key={word} className="px-2 py-1 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/20 text-xs text-[#F5A623]">
                    "{word}" &times;{count}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.transcript && (
            <div className="glass rounded-xl p-4">
              <p className="text-[11px] uppercase tracking-widest text-white/25 font-semibold mb-2">Transcript</p>
              <p className="text-sm text-white/50 leading-relaxed line-clamp-4">{result.transcript}</p>
            </div>
          )}

          <Link href="/onboarding" className="w-full py-4 rounded-2xl bg-[#6C63FF] hover:bg-[#7B74FF] text-white font-bold text-sm text-center transition-all hover:shadow-xl hover:shadow-[#6C63FF]/25">
            Create an account to save this
          </Link>
          <Link href="/try" className="w-full py-3 rounded-2xl glass border border-white/8 text-white/50 hover:text-white/70 font-medium text-sm text-center transition-all">
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  // ── Active Session ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/6 glass shrink-0">
        <Link href="/" className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm transition-colors">
          <ArrowLeft size={14} /> Back
        </Link>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5555] animate-pulse" />
          <span className="text-sm font-bold tabular-nums font-mono text-white">{formatTime(elapsed)}</span>
        </div>
        <button
          onClick={handleStop}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#FF5555]/10 border border-[#FF5555]/25 text-[#FF5555] text-sm font-semibold hover:bg-[#FF5555]/20 transition-all active:scale-95"
        >
          <Square size={12} /> Stop
        </button>
      </div>

      {/* ── Main layout ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex gap-0 overflow-hidden">

        {/* ── Left column: webcam + notes + transcript ─────────────────── */}
        <div className="flex-1 flex flex-col gap-4 p-4 min-w-0">

          {/* Webcam — landscape 16:9 */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-black border border-white/8" style={{ aspectRatio: "16/9" }}>
            <video
              ref={tracking.videoRef}
              className="w-full h-full object-cover scale-x-[-1]"
              muted
              playsInline
            />

            {/* Feedback banner — center top of frame */}
            <LiveFeedbackBanner feedbackMessage={feedbackMessage} feedbackSeverity={feedbackSeverity} />

            {/* Camera error */}
            {tracking.error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <div className="flex items-center gap-2 text-white/50 text-sm px-4">
                  <AlertCircle size={16} className="text-[#FF5555] shrink-0" />
                  {tracking.error}
                </div>
              </div>
            )}

            {/* Corner metrics overlay */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold"
                style={{ color: eyeColor }}>
                <Eye size={10} /> {tracking.eyeContactPercent}%
              </div>
              {tracking.wordsPerMinute > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold"
                  style={{ color: paceColor }}>
                  <Gauge size={10} /> {tracking.wordsPerMinute} WPM
                </div>
              )}
            </div>
          </div>

          {/* Bottom row: notes + transcript side by side */}
          <div className="flex gap-4 flex-1 min-h-0">

            {/* Speaker notes */}
            <div className="flex-1 flex flex-col glass rounded-2xl p-4 min-h-[140px]">
              <div className="flex items-center gap-2 mb-2 shrink-0">
                <FileText size={12} className="text-white/35" />
                <p className="text-[11px] uppercase tracking-widest text-white/35 font-semibold">Speaker Notes</p>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Type your talking points here…"
                className="flex-1 bg-transparent text-sm text-white/70 placeholder:text-white/20 resize-none focus:outline-none leading-relaxed"
              />
            </div>

            {/* Live transcript */}
            <div className="flex-1 flex flex-col glass rounded-2xl p-4 min-h-[140px] overflow-hidden">
              <div className="flex items-center gap-2 mb-2 shrink-0">
                <Mic2 size={12} className="text-white/35" />
                <p className="text-[11px] uppercase tracking-widest text-white/35 font-semibold">Live Transcript</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                <p className="text-sm text-white/55 leading-relaxed">
                  {transcript || <span className="text-white/20 italic">Start speaking…</span>}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right sidebar: score + metrics ───────────────────────────── */}
        <div className="w-64 shrink-0 border-l border-white/6 flex flex-col gap-4 p-4 overflow-y-auto">

          {/* Score */}
          <div className="flex flex-col items-center gap-1 pt-2">
            <ConfidenceScore score={tracking.confidenceScore} size="md" animated showLabel />
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22D3A5] pulse-dot" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/35">Live</span>
            </div>
          </div>

          <div className="h-px bg-white/6" />

          {/* Metric pills */}
          <div className="flex flex-col gap-2">
            <MetricPill
              icon={Eye}
              label="Eye Contact"
              value={tracking.eyeContactPercent}
              unit="%"
              color={eyeColor}
            />
            <MetricPill
              icon={Activity}
              label="Stillness"
              value={100 - tracking.fidgetLevel}
              unit="%"
              color={tracking.fidgetLevel < 30 ? "#22D3A5" : tracking.fidgetLevel < 60 ? "#F5A623" : "#FF5555"}
            />
            <MetricPill
              icon={Wind}
              label="Blink Rate"
              value={tracking.blinkRate}
              unit="/min"
              color="#6C63FF"
            />
            <MetricPill
              icon={Gauge}
              label="Speaking Pace"
              value={tracking.wordsPerMinute || "—"}
              unit={tracking.wordsPerMinute ? " WPM" : ""}
              color={paceColor}
            />
          </div>

          <div className="h-px bg-white/6" />

          {/* Eye / gaze status */}
          <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-300 ${
            tracking.isLookingDown
              ? "bg-[#FF5555]/10 text-[#FF5555] border-[#FF5555]/20"
              : tracking.isLookingAtAudience
              ? "bg-[#22D3A5]/10 text-[#22D3A5] border-[#22D3A5]/20"
              : "bg-white/4 text-white/35 border-white/6"
          }`}>
            <Eye size={12} />
            {tracking.isLookingDown
              ? "Looking down, eyes up"
              : tracking.isLookingAtAudience
              ? "Engaging audience"
              : "Look at the camera"}
          </div>

          {/* Pacing feedback */}
          {tracking.pacingFeedback && (
            <div className={`px-3 py-2.5 rounded-xl text-xs leading-relaxed border ${
              tracking.wordsPerMinute >= 100 && tracking.wordsPerMinute <= 160
                ? "bg-[#22D3A5]/8 text-[#22D3A5] border-[#22D3A5]/15"
                : "bg-[#F5A623]/8 text-[#F5A623] border-[#F5A623]/15"
            }`}>
              {tracking.pacingFeedback}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
