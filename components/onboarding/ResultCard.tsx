"use client";

import { useRouter } from "next/navigation";
import {
  Eye, Mic2, Activity, TrendingUp, TrendingDown, Minus,
  ArrowRight, RotateCcw, User
} from "lucide-react";
import { TrialResult } from "./TrialSession";
import { EXECUTIVE_BASELINE, scoreGrade, formatDuration } from "@/lib/utils";
import ConfidenceScore from "@/components/coach/ConfidenceScore";

interface Props {
  result: TrialResult;
  onRetry: () => void;
}

function CompareRow({
  icon: Icon,
  label,
  yours,
  baseline,
  unit,
  higherIsBetter = true,
}: {
  icon: React.ElementType;
  label: string;
  yours: number;
  baseline: number;
  unit: string;
  higherIsBetter?: boolean;
}) {
  const delta = yours - baseline;
  const better = higherIsBetter ? delta >= 0 : delta <= 0;
  const neutral = Math.abs(delta) < 0.5;

  const Icon2 = neutral ? Minus : better ? TrendingUp : TrendingDown;
  const color = neutral ? "#6C63FF" : better ? "#22D3A5" : "#F5A623";

  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-white/5 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
        <Icon size={14} className="text-white/50" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/80">{label}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-white/35">Exec baseline: {baseline}{unit}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Icon2 size={12} style={{ color }} />
        <span className="text-sm font-bold tabular-nums" style={{ color }}>
          {yours}{unit}
        </span>
      </div>
    </div>
  );
}

export default function ResultCard({ result, onRetry }: Props) {
  const router = useRouter();
  const { description } = scoreGrade(result.confidenceScore);

  const fillerPpm = Math.round(result.fillerWordsPerMinute * 10) / 10;

  return (
    <div className="flex flex-col gap-6 fade-up">
      {/* Header */}
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/35 mb-2">
          Trial Complete: {formatDuration(result.duration)}
        </p>
        <h2 className="text-2xl font-bold text-white">Your Results</h2>
      </div>

      {/* Score + grade */}
      <div className="glass rounded-2xl p-6 flex flex-col items-center gap-3">
        <ConfidenceScore score={result.confidenceScore} size="lg" showLabel animated />
        <p className="text-sm text-white/40 text-center max-w-[220px]">{description}</p>
      </div>

      {/* Comparison table */}
      <div className="glass rounded-2xl p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/35 mb-1">
          vs. Executive Baseline
        </p>
        <CompareRow
          icon={Eye}
          label="Eye Contact"
          yours={result.eyeContactPercent}
          baseline={EXECUTIVE_BASELINE.eyeContactPercent}
          unit="%"
          higherIsBetter
        />
        <CompareRow
          icon={Mic2}
          label="Filler Words / min"
          yours={fillerPpm}
          baseline={EXECUTIVE_BASELINE.fillerWordsPerMinute}
          unit="/min"
          higherIsBetter={false}
        />
        <CompareRow
          icon={Activity}
          label="Presence Score"
          yours={result.confidenceScore}
          baseline={EXECUTIVE_BASELINE.confidenceScore}
          unit=""
          higherIsBetter
        />
      </div>

      {/* Filler word breakdown */}
      {result.fillerBreakdown.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/35 mb-3">
            Filler Words Detected ({result.fillerCount} total)
          </p>
          <div className="flex flex-wrap gap-2">
            {result.fillerBreakdown.map(({ word, count }) => (
              <div
                key={word}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/20"
              >
                <span className="text-xs text-[#F5A623] font-medium">&quot;{word}&quot;</span>
                <span className="text-[10px] text-[#F5A623]/60 font-bold">×{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transcript excerpt */}
      {result.transcript && (
        <div className="glass rounded-xl p-4">
          <p className="text-[11px] uppercase tracking-widest text-white/30 font-semibold mb-2">
            Transcript
          </p>
          <p className="text-sm text-white/50 leading-relaxed line-clamp-4">
            {result.transcript}
          </p>
        </div>
      )}

      {/* CTAs */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => router.push("/onboarding?step=signup")}
          className="w-full py-4 rounded-2xl bg-[#6C63FF] hover:bg-[#7B74FF] text-white font-bold text-sm transition-all hover:shadow-xl hover:shadow-[#6C63FF]/30 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <User size={16} />
          Save Progress & Create Account
          <ArrowRight size={14} />
        </button>
        <button
          onClick={onRetry}
          className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/8 text-white/60 hover:text-white/80 font-semibold text-sm transition-all border border-white/8 flex items-center justify-center gap-2"
        >
          <RotateCcw size={14} />
          Try Again
        </button>
      </div>
    </div>
  );
}
