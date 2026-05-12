"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface TrackingState {
  confidenceScore: number;       // 0–100
  isLookingAtAudience: boolean;
  isLookingDown: boolean;        // reading from notes / phone
  eyeContactPercent: number;     // rolling 10s percentage
  fidgetLevel: number;           // 0–100 (0 = perfectly still)
  blinkRate: number;             // blinks per minute
  wordsPerMinute: number;        // live WPM from speech recognition
  pacingFeedback: string;        // coaching tip based on WPM
  isInitialized: boolean;
  isTracking: boolean;
  error: string | null;
}

// 100–160 WPM is the comfortable/optimal presentation range
function computePacingFeedback(wpm: number): string {
  if (wpm === 0) return "";
  if (wpm < 100) return "Speaking too slowly, your audience will lose interest";
  if (wpm > 160) return "Speaking too fast, slow down so ideas can land";
  return "Good pace, keep it up";
}

interface HeadPoseSnapshot {
  yaw: number;
  pitch: number;
  timestamp: number;
}

const WINDOW_SIZE = 60;
const EYE_CONTACT_WINDOW = 10; // seconds
// Throttle React setState to 8fps max — prevents "max update depth" at 60fps RAF
const UI_THROTTLE_MS = 125;

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function estimateHeadPose(landmarks: { x: number; y: number; z: number }[]) {
  if (!landmarks || landmarks.length < 468) return { yaw: 0, pitch: 0 };
  const noseTip  = landmarks[1];
  const leftEye  = landmarks[33];
  const rightEye = landmarks[263];
  const chin     = landmarks[152];
  const eyeMidX  = (leftEye.x + rightEye.x) / 2;
  const yaw      = (noseTip.x - eyeMidX) * 180;
  const eyeMidY  = (leftEye.y + rightEye.y) / 2;
  const pitch    = (noseTip.y - eyeMidY) * 100 - (chin.y - noseTip.y) * 30;
  return { yaw, pitch };
}

/**
 * Looking at audience: head roughly straight, not tilted far down.
 * isLookingDown: pitch well above threshold — head tilted down (reading notes/screen).
 */
function computeGaze(yaw: number, pitch: number): {
  isLookingAtAudience: boolean;
  isLookingDown: boolean;
} {
  const isLookingDown = pitch > 18; // head pitched significantly downward
  const isLookingAtAudience = Math.abs(yaw) < 18 && pitch > -18 && pitch < 14;
  return { isLookingAtAudience, isLookingDown };
}

function computeMovementVariance(snapshots: HeadPoseSnapshot[]): number {
  if (snapshots.length < 2) return 0;
  const yaws   = snapshots.map((s) => s.yaw);
  const pitches = snapshots.map((s) => s.pitch);
  const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = (arr: number[], m: number) =>
    arr.reduce((acc, v) => acc + (v - m) ** 2, 0) / arr.length;
  return variance(yaws, mean(yaws)) + variance(pitches, mean(pitches));
}

function getEAR(landmarks: { x: number; y: number; z: number }[]): number {
  if (landmarks.length < 468) return 1;
  const p1 = landmarks[159], p2 = landmarks[145];
  const p3 = landmarks[158], p4 = landmarks[153];
  const p5 = landmarks[33],  p6 = landmarks[133];
  const dist = (a: typeof p1, b: typeof p1) =>
    Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  const vertical  = (dist(p1, p2) + dist(p3, p4)) / 2;
  const horizontal = dist(p5, p6);
  return horizontal > 0 ? vertical / horizontal : 1;
}

export function useSocialTracking(): TrackingState & {
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  reportWords: (wordCount: number, elapsedSecs: number) => void;
} {
  const videoRef      = useRef<HTMLVideoElement | null>(null);
  const streamRef     = useRef<MediaStream | null>(null);
  const rafRef        = useRef<number | null>(null);
  const landmarkerRef = useRef<import("@mediapipe/tasks-vision").FaceLandmarker | null>(null);
  const lastTsRef     = useRef<number>(-1);
  // Throttle setState to UI_THROTTLE_MS — prevents max-update-depth at 60fps
  const lastUIUpdateRef = useRef<number>(0);

  const poseSnapshots  = useRef<HeadPoseSnapshot[]>([]);
  const eyeContactLog  = useRef<{ ts: number; looking: boolean }[]>([]);
  const blinkLog       = useRef<number[]>([]);
  const wasBlinking    = useRef(false);
  const EAR_THRESHOLD  = 0.22;

  // Accumulate metrics between UI updates so nothing is lost
  const pendingRef = useRef<Partial<TrackingState>>({});

  const [state, setState] = useState<TrackingState>({
    confidenceScore: 0,
    isLookingAtAudience: false,
    isLookingDown: false,
    eyeContactPercent: 0,
    fidgetLevel: 0,
    blinkRate: 0,
    wordsPerMinute: 0,
    pacingFeedback: "",
    isInitialized: false,
    isTracking: false,
    error: null,
  });

  // ── Init ──────────────────────────────────────────────────────────────────
  const initLandmarker = useCallback(async () => {
    try {
      const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numFaces: 1,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      });
      setState((s) => ({ ...s, isInitialized: true }));
    } catch {
      setState((s) => ({ ...s, error: "Failed to load face tracking model. Check your connection." }));
    }
  }, []);

  useEffect(() => {
    initLandmarker();
    return () => {
      rafRef.current && cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      landmarkerRef.current = null;
    };
  }, [initLandmarker]);

  // ── Start ─────────────────────────────────────────────────────────────────
  const startTracking = useCallback(async () => {
    if (!landmarkerRef.current) {
      setState((s) => ({ ...s, error: "Model not ready yet." }));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setState((s) => ({ ...s, isTracking: true, error: null }));
      processFrame();
    } catch {
      setState((s) => ({ ...s, error: "Camera access denied. Please allow webcam access." }));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Frame Loop ────────────────────────────────────────────────────────────
  const processFrame = useCallback(() => {
    const video    = videoRef.current;
    const landmarker = landmarkerRef.current;

    // Guard: video must be live and have valid pixel dimensions
    if (
      !video || !landmarker ||
      video.readyState < 2 ||
      video.paused || video.ended ||
      video.videoWidth === 0 || video.videoHeight === 0
    ) {
      rafRef.current = requestAnimationFrame(processFrame);
      return;
    }

    // Strictly monotonic timestamp for MediaPipe
    let now = performance.now();
    if (now <= lastTsRef.current) now = lastTsRef.current + 1;
    lastTsRef.current = now;

    let result: import("@mediapipe/tasks-vision").FaceLandmarkerResult | null = null;
    try {
      result = landmarker.detectForVideo(video, now);
    } catch {
      // WASM invariant violation — skip frame, keep loop alive
      rafRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const landmarks = result?.faceLandmarks?.[0];

    if (landmarks && landmarks.length > 0) {
      const { yaw, pitch } = estimateHeadPose(landmarks);
      const { isLookingAtAudience, isLookingDown } = computeGaze(yaw, pitch);

      // Blink
      const ear = getEAR(landmarks);
      if (ear < EAR_THRESHOLD && !wasBlinking.current) {
        blinkLog.current.push(Date.now());
        wasBlinking.current = true;
      } else if (ear >= EAR_THRESHOLD) {
        wasBlinking.current = false;
      }

      poseSnapshots.current.push({ yaw, pitch, timestamp: now });
      if (poseSnapshots.current.length > WINDOW_SIZE) poseSnapshots.current.shift();

      const cutoff = Date.now() - EYE_CONTACT_WINDOW * 1000;
      eyeContactLog.current.push({ ts: Date.now(), looking: isLookingAtAudience });
      eyeContactLog.current = eyeContactLog.current.filter((e) => e.ts > cutoff);

      blinkLog.current = blinkLog.current.filter((t) => t > Date.now() - 60_000);

      const eyeContactPercent =
        (eyeContactLog.current.filter((e) => e.looking).length /
          Math.max(1, eyeContactLog.current.length)) * 100;
      const movVar       = computeMovementVariance(poseSnapshots.current);
      const fidgetLevel  = clamp(movVar * 4, 0, 100);
      const blinkRate    = blinkLog.current.length;
      const blinkNorm    = clamp(1 - Math.abs(blinkRate - 14) / 14, 0, 1) * 100;
      const stillness    = 100 - fidgetLevel;
      const confidenceScore = clamp(
        eyeContactPercent * 0.5 + stillness * 0.3 + blinkNorm * 0.2, 0, 100
      );

      // Stash computed values; flush to React state on throttle boundary
      pendingRef.current = {
        confidenceScore: Math.round(confidenceScore),
        isLookingAtAudience,
        isLookingDown,
        eyeContactPercent: Math.round(eyeContactPercent),
        fidgetLevel: Math.round(fidgetLevel),
        blinkRate,
      };

      // Throttled setState — avoids "max update depth exceeded" at 60fps
      if (now - lastUIUpdateRef.current >= UI_THROTTLE_MS) {
        lastUIUpdateRef.current = now;
        const snap = { ...pendingRef.current };
        setState((s) => ({
          ...s,
          ...snap,
          isInitialized: true,
          isTracking: true,
          error: null,
        }));
      }
    }

    rafRef.current = requestAnimationFrame(processFrame);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Stop ─────────────────────────────────────────────────────────────────
  const stopTracking = useCallback(() => {
    rafRef.current && cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    poseSnapshots.current  = [];
    eyeContactLog.current  = [];
    blinkLog.current       = [];
    lastTsRef.current      = -1;
    lastUIUpdateRef.current = 0;
    pendingRef.current      = {};
    setState((s) => ({ ...s, isTracking: false }));
  }, []);

  // ── WPM from speech recognition ──────────────────────────────────────────
  const reportWords = useCallback((wordCount: number, elapsedSecs: number) => {
    if (elapsedSecs < 1) return;
    const wpm = Math.round((wordCount / elapsedSecs) * 60);
    setState((s) => ({
      ...s,
      wordsPerMinute: wpm,
      pacingFeedback: computePacingFeedback(wpm),
    }));
  }, []);

  return { ...state, startTracking, stopTracking, videoRef, reportWords };
}
