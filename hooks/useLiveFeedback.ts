"use client";

import { useEffect, useRef, useState } from "react";
import { TrackingState } from "@/hooks/useSocialTracking";

export type FeedbackSeverity = "good" | "warn" | "bad" | "neutral";

interface LiveFeedback {
  feedbackMessage: string;
  feedbackSeverity: FeedbackSeverity;
}

function countFillers(transcript: string): number {
  const lower = transcript.toLowerCase();
  return [/\bum\b/gi, /\buh\b/gi, /\blike\b/gi, /\byou know\b/gi].reduce((acc, re) => {
    const m = lower.match(re);
    return acc + (m ? m.length : 0);
  }, 0);
}

function evaluate(
  state: TrackingState,
  transcript: string,
  prevFillers: number
): { message: string; severity: FeedbackSeverity } {
  if (state.isLookingDown)
    return { message: "Look up, avoid reading from notes", severity: "bad" };
  if (state.eyeContactPercent < 35)
    return { message: "Look at the camera", severity: "bad" };
  if (!state.isLookingAtAudience)
    return { message: "Make eye contact with the camera", severity: "warn" };
  if (state.fidgetLevel > 65)
    return { message: "Stay still, you look nervous", severity: "bad" };
  if (state.wordsPerMinute > 0 && state.wordsPerMinute < 100)
    return { message: "Speaking too slowly, pick up the pace", severity: "bad" };
  if (state.wordsPerMinute > 160)
    return { message: "Too fast, slow down so ideas can land", severity: "warn" };
  const fillers = countFillers(transcript);
  if (fillers > prevFillers && fillers > 0)
    return { message: `Watch the filler words: ${fillers} so far`, severity: "warn" };
  if (state.eyeContactPercent >= 65)
    return { message: "Great eye contact, keep it up", severity: "good" };
  if (state.wordsPerMinute >= 100 && state.wordsPerMinute <= 160)
    return { message: "Perfect pace", severity: "good" };
  return { message: "", severity: "neutral" };
}

export function useLiveFeedback(
  state: TrackingState,
  transcript: string
): LiveFeedback {
  // Use refs so the interval doesn't need state/transcript as deps,
  // which would cause the effect to re-run on every tracking update (60fps).
  const stateRef      = useRef(state);
  const transcriptRef = useRef(transcript);
  const prevFillers   = useRef(0);

  stateRef.current      = state;
  transcriptRef.current = transcript;

  const [feedbackMessage, setFeedbackMessage]   = useState("");
  const [feedbackSeverity, setFeedbackSeverity] = useState<FeedbackSeverity>("neutral");

  useEffect(() => {
    const tick = () => {
      const { message, severity } = evaluate(
        stateRef.current,
        transcriptRef.current,
        prevFillers.current
      );
      prevFillers.current = countFillers(transcriptRef.current);
      setFeedbackMessage(message);
      setFeedbackSeverity(severity);
    };

    tick();
    const id = setInterval(tick, 3000);
    return () => clearInterval(id);
  }, []); // empty — reads current values via refs, never re-subscribes

  // Clear when tracking stops
  useEffect(() => {
    if (!state.isTracking) {
      setFeedbackMessage("");
      setFeedbackSeverity("neutral");
      prevFillers.current = 0;
    }
  }, [state.isTracking]);

  return { feedbackMessage, feedbackSeverity };
}
