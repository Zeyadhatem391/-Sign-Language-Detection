"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

import Image from "@/assets/images/background_text.jpg";
import Camera from "@/components/Camera";

const languages = [
  { code: "en", name: "English" },
  { code: "ar", name: "Arabic" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "es", name: "Spanish" },
  { code: "it", name: "Italian" },
  { code: "tr", name: "Turkish" },
];

export default function Page() {
  const [text, setText] = useState("");
  const [source, setSource] = useState("ar");
  const [target, setTarget] = useState("ar");

  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!text.trim()) {
      setTranslatedText("");
      setError("");
      setLoading(false);
      return;
    }

    if (source === target) {
      setTranslatedText(text);
      setError("");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            source,
            target,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Translation failed");
        }

        if (!cancelled) {
          setTranslatedText(data.translatedText);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 700);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [text, source, target]);

  return (
    <div className="min-h-screen p-3 sm:p-5 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
        {/* Translation */}
        <section className="lg:col-span-2 space-y-4 sm:space-y-5 min-w-0 order-2 lg:order-1">
          <h2 className="text-lg sm:text-xl font-semibold">Translation</h2>

          <Input
            className="h-11 sm:h-12"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write something..."
          />

          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="border rounded-md p-2 bg-background w-full h-11 sm:h-12"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>

          <div
            className="relative w-full min-h-40 sm:min-h-48 border shadow p-3 sm:p-4 rounded-md whitespace-pre-wrap break-words text-white overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: `url(${Image.src})` }}
          >
            <div className="absolute inset-0 bg-black/60" />

            <div className="relative z-10">
              {translatedText || text || (
                <span className="inline-block w-1 h-5 bg-white animate-pulse" />
              )}
            </div>
          </div>

          {loading && (
            <p className="text-sm text-muted-foreground">Translating...</p>
          )}

          {error && <p className="text-sm text-red-500 break-words">{error}</p>}
        </section>

        {/* Camera */}
        <section className="lg:col-span-3 space-y-4 min-w-0 order-1 lg:order-2">
          <h2 className="text-lg sm:text-xl font-semibold">
            Sign Language Detection
          </h2>

          <div className="h-[350px] sm:h-[450px] lg:h-[calc(100vh-120px)] min-h-0">
            <Camera />
          </div>
        </section>
      </div>
    </div>
  );
}
