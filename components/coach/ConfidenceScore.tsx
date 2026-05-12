"use client";

import { scoreGrade } from "@/lib/utils";

interface Props {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
}

const RADIUS = 44;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ConfidenceScore({
  score,
  size = "md",
  showLabel = true,
  animated = true,
}: Props) {
  const { label, color, description } = scoreGrade(score);
  const dashOffset = CIRCUMFERENCE * (1 - score / 100);

  const dims = { sm: 80, md: 120, lg: 160 }[size];
  const strokeW = { sm: 3, md: 4, lg: 5 }[size];
  const fontSize = { sm: "text-base", md: "text-2xl", lg: "text-4xl" }[size];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: dims, height: dims }}>
        <svg
          width={dims}
          height={dims}
          viewBox="0 0 100 100"
          className="-rotate-90"
        >
          {/* Track */}
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeW}
          />
          {/* Progress */}
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{
              transition: animated ? "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" : "none",
              filter: `drop-shadow(0 0 6px ${color}80)`,
            }}
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${fontSize} font-bold tabular-nums`} style={{ color }}>
            {score}
          </span>
          {size !== "sm" && (
            <span className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">
              score
            </span>
          )}
        </div>
      </div>

      {showLabel && (
        <div className="text-center">
          <p className="text-sm font-semibold" style={{ color }}>
            {label}
          </p>
          {size === "lg" && (
            <p className="text-xs text-white/40 mt-0.5">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}
