"use client";

import { useEffect, useRef, useState } from "react";
import { CameraOff } from "lucide-react";

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [error, setError] = useState(false);

  useEffect(() => {
    let stream: MediaStream;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setError(false);
      } catch (err) {
        console.error("Camera access error:", err);
        setError(true);
      }
    };

    startCamera();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="w-full h-full bg-black overflow-hidden rounded-xl flex items-center justify-center">
      {error ? (
        <div className="w-full h-full min-h-140 flex flex-col items-center justify-center gap-3 text-zinc-400">
          <CameraOff size={55} strokeWidth={1.5} />

          <p className="text-sm">Camera access denied</p>

          <p className="text-xs text-zinc-500">
            Please allow camera access to continue
          </p>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-contain"
        />
      )}
    </div>
  );
}
