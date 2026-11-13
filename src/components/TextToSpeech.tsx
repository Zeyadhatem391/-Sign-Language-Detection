
"use client";

import { useEffect, useRef, useState } from "react";

type Voice = {
  voice_id: string;
  name: string;
  gender: "male" | "female" | null;
  languages: string[];
  dialect: string[];
  sample_url: string;
};

export default function TextToSpeech() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voiceId, setVoiceId] = useState("");
  const [gender, setGender] = useState("all");
  const [speed, setSpeed] = useState(1);
  const [stability, setStability] = useState(0.5);
  const [loading, setLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const getVoices = async () => {
      try {
        const response = await fetch("/api/voices");

        if (!response.ok) throw new Error("Failed to load voices");

        const data: Voice[] = await response.json();

        setVoices(data);

        if (data.length > 0) {
          setVoiceId(data[0].voice_id);
        }
      } catch (error) {
        console.error(error);
      }
    };

    getVoices();

    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  const filteredVoices = voices.filter((voice) => {
    if (gender === "all") return true;
    return voice.gender === gender;
  });

  const speak = async () => {
    if (!text.trim() || !voiceId) return;

    setLoading(true);

    try {
      audioRef.current?.pause();

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voiceId,
          speed,
          stability,
        }),
      });

      if (!response.ok) {
        throw new Error("Speech generation failed");
      }

      const blob = await response.blob();

      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }

      const url = URL.createObjectURL(blob);

      audioUrlRef.current = url;

      if (audioRef.current) {
        audioRef.current.src = url;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-5 rounded-xl border p-6">

      <h2 className="text-2xl font-bold">
        Text to Speech
      </h2>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="اكتب النص هنا..."
        className="w-full rounded-lg border p-3"
        rows={5}
      />

      <div>
        <label>Voice Gender</label>

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full rounded-lg border p-2"
        >
          <option value="all">All Voices</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      <div>
        <label>Choose Voice</label>

        <select
          value={voiceId}
          onChange={(e) => setVoiceId(e.target.value)}
          className="w-full rounded-lg border p-2"
        >
          {filteredVoices.map((voice) => (
            <option key={voice.voice_id} value={voice.voice_id}>
              {voice.name} - {voice.gender ?? "Unknown"} -
              {voice.dialect.join(", ")}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Speed: {speed}</label>

        <input
          type="range"
          min="0.7"
          max="1.2"
          step="0.1"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label>Stability: {stability}</label>

        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={stability}
          onChange={(e) => setStability(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={speak}
          disabled={loading || !text.trim() || !voiceId}
          className="rounded-lg bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Generating..." : "Speak"}
        </button>

        <button
          onClick={() => audioRef.current?.pause()}
          className="rounded-lg border px-4 py-2"
        >
          Pause
        </button>

        <button
          onClick={() => audioRef.current?.play()}
          className="rounded-lg border px-4 py-2"
        >
          Resume
        </button>

        <button
          onClick={stop}
          className="rounded-lg border px-4 py-2"
        >
          Stop
        </button>
      </div>

      <audio ref={audioRef} controls className="w-full" />

    </div>
  );
}
