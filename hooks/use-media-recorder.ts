"use client";

import { useCallback, useRef, useState } from "react";

export function useMediaRecorder() {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [recording, setRecording] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (event) => chunksRef.current.push(event.data);
    recorder.onstop = () => {
      setBlob(new Blob(chunksRef.current, { type: "audio/webm" }));
      stream.getTracks().forEach((track) => track.stop());
    };
    recorder.start();
    recorderRef.current = recorder;
    setRecording(true);
  }, []);

  const stop = useCallback(() => {
    recorderRef.current?.stop();
    setRecording(false);
  }, []);

  return { start, stop, recording, blob };
}
