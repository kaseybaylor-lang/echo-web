"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Mic, MicOff, Camera, CameraOff, Clock, CheckCircle2 } from "lucide-react";
import { countFillerWords } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface TrialResult {
  duration: number;           // seconds
  transcript: string;
  fillerCount: number;
  fillerBreakdown: { word: string; count: number }[];
  fillerWordsPerMinute: number;
  eyeContactPercent: number;  // passed in from parent tracking hook
  confidenceScore: number;
}

interface Props {
  eyeContactPercent: number;
  confidenceScore: number;
  onComplete: (result: TrialResult) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isTrackingActive: boolean;
}

const TRIAL_DURATION = 30;

export default function TrialSession({
  eyeContactPercent,
  confidenceScore,
  onComplete,
  videoRef,
  isTrackingActive,
}: Props) {
  const [phase, setPhase] = useState<"idle" | "countdown" | "recording" | "processing">("idle");
  const [countdown, setCountdown] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<any | null>(null);
  const fullTranscriptRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Speech recognition setup ───────────────────────────────────────────────
  const startRecognition = useCallback(() => {
    const SR =
      (typeof window !== "undefined" &&
        ((window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition)) ||
      null;
    if (!SR) return;

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (e: any) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          final += text + " ";
        } else {
          interim += text;
        }
      }
      fullTranscriptRef.current += final;
      setTranscript(fullTranscriptRef.current + interim);
    };

    rec.onerror = () => setIsListening(false);
    rec.onend = () => {
      // Auto-restart during recording phase
      if (phase === "recording") {
        try { rec.start(); } catch {}
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
      setIsListening(true);
    } catch {}
  }, [phase]);

  // ── Countdown → Recording ──────────────────────────────────────────────────
  const startCountdown = useCallback(() => {
    setPhase("countdown");
    setCountdown(3);
    let count = 3;

    const id = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(id);
        beginRecording();
      }
    }, 1000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const beginRecording = useCallback(() => {
    setPhase("recording");
    setElapsed(0);
    fullTranscriptRef.current = "";
    startRecognition();

    let secs = 0;
    timerRef.current = setInterval(() => {
      secs += 1;
      setElapsed(secs);
      if (secs >= TRIAL_DURATION) {
        clearInterval(timerRef.current!);
        finishRecording();
      }
    }, 1000);
  }, [startRecognition]); // eslint-disable-line react-hooks/exhaustive-deps

  const finishRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setPhase("processing");

    setTimeout(() => {
      const finalTranscript = fullTranscriptRef.current;
      const { total, breakdown } = countFillerWords(finalTranscript);
      const minutes = TRIAL_DURATION / 60;

      onComplete({
        duration: TRIAL_DURATION,
        transcript: finalTranscript,
        fillerCount: total,
        fillerBreakdown: breakdown,
        fillerWordsPerMinute: total / minutes,
        eyeContactPercent,
        confidenceScore,
      });
    }, 800);
  }, [eyeContactPercent, confidenceScore, onComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timerRef.current && clearInterval(timerRef.current);
      recognitionRef.current?.stop();
    };
  }, []);

  const remaining = TRIAL_DURATION - elapsed;
  const progress = (elapsed / TRIAL_DURATION) * 100;

  return (
    <div className="flex flex-col gap-6">
      {/* Webcam Preview */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/60 border border-white/8">
        <video
          ref={videoRef}
          className="w-full h-full object-cover scale-x-[-1]"
          muted
          playsInline
          aria-label="Webcam preview"
        />

        {/* Overlay: countdown */}
        {phase === "countdown" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="text-center">
              <span className="text-7xl font-bold text-white tabular-nums">{countdown}</span>
              <p className="text-white/60 text-sm mt-2">Get ready…</p>
            </div>
          </div>
        )}

        {/* Overlay: processing */}
        {phase === "processing" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
              <p className="text-white/60 text-sm">Analysing your session…</p>
            </div>
          </div>
        )}

        {/* Recording badge */}
        {phase === "recording" && (
          <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#FF5555] pulse-dot" />
            <span className="text-xs font-semibold text-white">REC</span>
          </div>
        )}

        {/* Timer badge */}
        {phase === "recording" && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
            <Clock size={12} className="text-white/60" />
            <span className="text-xs font-bold text-white tabular-nums">
              {remaining}s
            </span>
          </div>
        )}

        {/* No camera placeholder */}
        {!isTrackingActive && phase === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/30">
            <CameraOff size={32} />
            <p className="text-sm">Camera activates on start</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {phase === "recording" && (
        <div className="w-full h-1 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#6C63FF] rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Live transcript */}
      {(phase === "recording" || phase === "processing") && (
        <div className="glass rounded-xl p-4 min-h-[72px]">
          <div className="flex items-center gap-2 mb-2">
            <Mic size={12} className={cn("", isListening ? "text-[#22D3A5]" : "text-white/30")} />
            <span className="text-[11px] uppercase tracking-widest text-white/30 font-semibold">
              Transcript
            </span>
          </div>
          <p className="text-sm text-white/60 leading-relaxed">
            {transcript || (
              <span className="italic text-white/25">Start speaking…</span>
            )}
          </p>
        </div>
      )}

      {/* CTA */}
      {phase === "idle" && (
        <button
          onClick={startCountdown}
          className="w-full py-4 rounded-2xl bg-[#6C63FF] hover:bg-[#7B74FF] text-white font-bold text-base transition-all hover:shadow-xl hover:shadow-[#6C63FF]/30 active:scale-[0.98] gradient-border"
        >
          Start 30-Second Trial
        </button>
      )}

      {phase === "recording" && (
        <button
          onClick={finishRecording}
          className="w-full py-3 rounded-2xl bg-white/6 hover:bg-white/10 text-white/60 font-semibold text-sm transition-all border border-white/8"
        >
          End Early
        </button>
      )}
    </div>
  );
}
