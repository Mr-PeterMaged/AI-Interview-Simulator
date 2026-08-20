"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { FaceExpressions } from "@vladmandic/face-api";
import type { BodyLanguageSnapshot } from "@/types/interview";

export type BodyLanguageStatus = "idle" | "loading-models" | "running" | "no-face" | "unavailable";

const MODEL_URL = "/models";
const SAMPLE_INTERVAL_MS = 900;
const HISTORY_SIZE = 20;
const LOOKING_AWAY_THRESHOLD = 0.16;

type FrameSample = {
  detected: boolean;
  centerX: number;
  centerY: number;
  boxSize: number;
  noseOffset: number;
};

let modelsPromise: Promise<typeof import("@vladmandic/face-api")> | null = null;

function loadModels() {
  if (!modelsPromise) {
    modelsPromise = import("@vladmandic/face-api").then(async (faceapi) => {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]);
      return faceapi;
    });
  }
  return modelsPromise;
}

export function useBodyLanguage(videoRef: RefObject<HTMLVideoElement | null>, enabled: boolean) {
  const [status, setStatus] = useState<BodyLanguageStatus>("idle");
  const [metrics, setMetrics] = useState<BodyLanguageSnapshot | undefined>();
  const historyRef = useRef<FrameSample[]>([]);

  useEffect(() => {
    if (!enabled) {
      setStatus("idle");
      setMetrics(undefined);
      historyRef.current = [];
      return;
    }

    let cancelled = false;
    let intervalId: number | undefined;

    (async () => {
      setStatus("loading-models");
      try {
        const faceapi = await loadModels();
        if (cancelled) return;
        setStatus("running");

        intervalId = window.setInterval(async () => {
          const video = videoRef.current;
          if (!video || video.readyState < 2 || video.videoWidth === 0) return;

          const detection = await faceapi
            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
            .withFaceLandmarks(true)
            .withFaceExpressions();

          const history = historyRef.current;

          if (!detection) {
            history.push({ detected: false, centerX: 0.5, centerY: 0.5, boxSize: 0, noseOffset: 0 });
            if (history.length > HISTORY_SIZE) history.shift();
            if (!cancelled) {
              setStatus("no-face");
              setMetrics(computeSnapshot(history, undefined));
            }
            return;
          }

          const { box } = detection.detection;
          const points = detection.landmarks.positions;
          const leftEdge = points[0];
          const rightEdge = points[16];
          const noseTip = points[30];
          const faceWidth = rightEdge.x - leftEdge.x;
          const noseOffset = faceWidth ? (noseTip.x - leftEdge.x) / faceWidth - 0.5 : 0;

          history.push({
            detected: true,
            centerX: (box.x + box.width / 2) / video.videoWidth,
            centerY: (box.y + box.height / 2) / video.videoHeight,
            boxSize: box.width / video.videoWidth,
            noseOffset
          });
          if (history.length > HISTORY_SIZE) history.shift();

          if (!cancelled) {
            setStatus("running");
            setMetrics(computeSnapshot(history, detection.expressions));
          }
        }, SAMPLE_INTERVAL_MS);
      } catch {
        if (!cancelled) setStatus("unavailable");
      }
    })();

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [enabled, videoRef]);

  return { status, metrics };
}

function computeSnapshot(history: FrameSample[], expressions: FaceExpressions | undefined): BodyLanguageSnapshot {
  const detectedFrames = history.filter((frame) => frame.detected);
  const faceDetectedPercentage = Math.round((detectedFrames.length / history.length) * 100);

  const lookingAwayFrames = detectedFrames.filter((frame) => Math.abs(frame.noseOffset) > LOOKING_AWAY_THRESHOLD);
  const lookingAwayPercentage = detectedFrames.length ? Math.round((lookingAwayFrames.length / detectedFrames.length) * 100) : 0;

  // Frame-to-frame position/size deltas stand in for stability and movement, since
  // we only have a 2D bounding box and landmarks, not full pose estimation.
  let headStabilityScore = 70;
  let gestureScore = 70;
  let movementScore = 70;
  if (detectedFrames.length > 1) {
    let positionJitter = 0;
    let sizeJitter = 0;
    for (let i = 1; i < detectedFrames.length; i += 1) {
      const prev = detectedFrames[i - 1];
      const curr = detectedFrames[i];
      positionJitter += Math.hypot(curr.centerX - prev.centerX, curr.centerY - prev.centerY);
      sizeJitter += Math.abs(curr.boxSize - prev.boxSize);
    }
    const avgPositionJitter = positionJitter / (detectedFrames.length - 1);
    const avgSizeJitter = sizeJitter / (detectedFrames.length - 1);
    headStabilityScore = Math.max(20, Math.round(100 - avgPositionJitter * 400));
    movementScore = Math.max(20, Math.round(100 - avgPositionJitter * 300));
    gestureScore = Math.max(20, Math.round(100 - avgSizeJitter * 600));
  }

  const postureScore = Math.max(30, Math.round(100 - lookingAwayPercentage * 0.6));

  let dominantExpression = "neutral";
  let expressionConfidence = 0;
  const topExpression = expressions?.asSortedArray()[0];
  if (topExpression) {
    dominantExpression = topExpression.expression;
    expressionConfidence = Math.round(topExpression.probability * 100);
  }

  const composedExpressions = new Set(["neutral", "happy", "surprised"]);
  const notes = detectedFrames.length
    ? `Local browser-based estimate (face-api.js, runs on-device — no camera frames are uploaded). Dominant expression: ${dominantExpression} (${expressionConfidence}% confidence), reads as ${composedExpressions.has(dominantExpression) ? "composed/engaged" : "tense — try to relax your expression"}.`
    : "No face detected in the last few samples. Face the camera in good lighting for accurate readings.";

  return {
    faceDetectedPercentage,
    lookingAwayPercentage,
    postureScore,
    headStabilityScore,
    gestureScore,
    movementScore,
    notes
  };
}
