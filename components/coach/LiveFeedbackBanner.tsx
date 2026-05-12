"use client";

import { Eye, Gauge, Activity, Mic2, CheckCircle2 } from "lucide-react";
import { FeedbackSeverity } from "@/hooks/useLiveFeedback";

interface Props {
  feedbackMessage: string;
  feedbackSeverity: FeedbackSeverity;
}

const SEVERITY_COLORS: Record<FeedbackSeverity, string> = {
  good: "#22D3A5",
  warn: "#F5A623",
  bad: "#FF5555",
  neutral: "transparent",
};

function getIcon(message: string, severity: FeedbackSeverity) {
  const lower = message.toLowerCase();
  if (severity === "good") return <CheckCircle2 size={14} />;
  if (lower.includes("eye contact") || lower.includes("look")) return <Eye size={14} />;
  if (lower.includes("pace") || lower.includes("slow") || lower.includes("fast") || lower.includes("speaking")) return <Gauge size={14} />;
  if (lower.includes("still") || lower.includes("fidget") || lower.includes("nervous")) return <Activity size={14} />;
  if (lower.includes("filler") || lower.includes("um") || lower.includes("uh")) return <Mic2 size={14} />;
  return <CheckCircle2 size={14} />;
}

export default function LiveFeedbackBanner({ feedbackMessage, feedbackSeverity }: Props) {
  const visible = feedbackMessage !== "" && feedbackSeverity !== "neutral";
  const color = SEVERITY_COLORS[feedbackSeverity];

  return (
    <div
      className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
      style={{
        transition: "opacity 0.4s ease, transform 0.4s ease",
        opacity: visible ? 1 : 0,
        transform: `translateX(-50%) translateY(${visible ? "0px" : "-8px"})`,
      }}
    >
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap shadow-lg"
        style={{
          background: visible ? `${color}22` : "transparent",
          border: `1px solid ${visible ? color + "55" : "transparent"}`,
          color: visible ? color : "transparent",
          backdropFilter: "blur(12px)",
        }}
      >
        {visible && getIcon(feedbackMessage, feedbackSeverity)}
        <span>{feedbackMessage}</span>
      </div>
    </div>
  );
}
