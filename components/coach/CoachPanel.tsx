"use client";

import { Eye, Activity, Wind, Zap, AlertCircle, Gauge } from "lucide-react";
import { TrackingState } from "@/hooks/useSocialTracking";
import ConfidenceScore from "./ConfidenceScore";
import { cn } from "@/lib/utils";

interface Props {
  state: TrackingState;
}

function MetricRow({
  icon: Icon,
  label,
  value,
  unit,
  color,
  sublabel,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  unit?: string;
  color: string;
  sublabel?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}18` }}
        >
          <Icon size={14} style={{ color }} />
        </div>
        <div>
          <p className="text-sm font-medium text-white/80">{label}</p>
          {sublabel && <p className="text-[11px] text-white/35">{sublabel}</p>}
        </div>
      </div>
      <div className="text-right">
        <span className="text-sm font-semibold tabular-nums" style={{ color }}>
          {value}
        </span>
        {unit && <span className="text-xs text-white/35 ml-1">{unit}</span>}
      </div>
    </div>
  );
}

function LiveDot({ active }: { active: boolean }) {
  return (
    <span className="relative flex h-2 w-2">
      {active && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#22D3A5] opacity-75 animate-ping" />
      )}
      <span
        className={cn(
          "relative inline-flex rounded-full h-2 w-2",
          active ? "bg-[#22D3A5]" : "bg-white/20"
        )}
      />
    </span>
  );
}

function wpmColor(wpm: number): string {
  if (wpm === 0) return "#6C63FF";
  if (wpm >= 130 && wpm <= 160) return "#22D3A5";
  if ((wpm >= 100 && wpm < 130) || (wpm > 160 && wpm <= 180)) return "#F5A623";
  return "#FF5555";
}

export default function CoachPanel({ state }: Props) {
  const eyeColor = state.eyeContactPercent > 60 ? "#22D3A5" : state.eyeContactPercent > 40 ? "#F5A623" : "#FF5555";
  const fidgetColor = state.fidgetLevel < 30 ? "#22D3A5" : state.fidgetLevel < 60 ? "#F5A623" : "#FF5555";
  const paceColor = wpmColor(state.wordsPerMinute);

  return (
    <div className="glass rounded-2xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LiveDot active={state.isTracking} />
          <span className="text-xs font-semibold uppercase tracking-widest text-white/50">
            {state.isTracking ? "Live Coach" : "Offline"}
          </span>
        </div>
        <Zap size={14} className="text-[#6C63FF]" />
      </div>

      {/* Score */}
      <div className="flex justify-center py-2">
        <ConfidenceScore score={state.confidenceScore} size="lg" animated />
      </div>

      {/* Error state */}
      {state.error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FF5555]/10 border border-[#FF5555]/20">
          <AlertCircle size={14} className="text-[#FF5555] mt-0.5 shrink-0" />
          <p className="text-xs text-[#FF5555]">{state.error}</p>
        </div>
      )}

      {/* Metrics */}
      <div className="flex flex-col">
        <MetricRow
          icon={Eye}
          label="Eye Contact"
          value={state.eyeContactPercent}
          unit="%"
          color={eyeColor}
          sublabel="10-second rolling window"
        />
        <MetricRow
          icon={Activity}
          label="Stillness"
          value={100 - state.fidgetLevel}
          unit="%"
          color={fidgetColor}
          sublabel="Head movement variance"
        />
        <MetricRow
          icon={Wind}
          label="Blink Rate"
          value={state.blinkRate}
          unit="/ min"
          color="#6C63FF"
          sublabel="Natural range: 8–20"
        />
        <MetricRow
          icon={Gauge}
          label="Speaking Pace"
          value={state.wordsPerMinute}
          unit="wpm"
          color={paceColor}
          sublabel="Ideal range: 130–160"
        />
      </div>

      {/* Pacing feedback tip */}
      {state.pacingFeedback && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-white/4 border border-white/6">
          <Gauge size={13} className="mt-0.5 shrink-0" style={{ color: paceColor }} />
          <p className="text-xs text-white/55 leading-relaxed">{state.pacingFeedback}</p>
        </div>
      )}

      {/* Audience status badge */}
      <div
        className={cn(
          "flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300",
          state.isLookingAtAudience
            ? "bg-[#22D3A5]/10 text-[#22D3A5] border border-[#22D3A5]/20"
            : "bg-white/5 text-white/35 border border-white/5"
        )}
      >
        <Eye size={14} />
        {state.isLookingAtAudience ? "Engaging Audience" : "Look at the Camera"}
      </div>
    </div>
  );
}
