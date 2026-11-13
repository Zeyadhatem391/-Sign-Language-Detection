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

export default function SpeechToVoise() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voiceId, setVoiceId] = useState("");
  const [gender, setGender] = useState("all");
  const [speed, setSpeed] = useState(1);
  const [stability, setStability] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [language, setLanguage] = useState("ar");
  const [dialect, setDialect] = useState("all");

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioUrlRef = useRef<string | null>(null);

  // تحميل الأصوات العربية فقط
  useEffect(() => {
    const getVoices = async () => {
      try {
        setError("");

        const response = await fetch("/api/voices");

        if (!response.ok) {
          throw new Error("فشل تحميل الأصوات");
        }

        const data: Voice[] = await response.json();

        const arabicVoices = data.filter((voice) =>
          voice.languages?.some((lang) => lang.toLowerCase().startsWith("ar")),
        );

        setVoices(arabicVoices);

        if (arabicVoices.length > 0) {
          setVoiceId(arabicVoices[0].voice_id);
        }
      } catch (error) {
        console.error(error);
        setError("حدث خطأ أثناء تحميل الأصوات.");
      }
    };

    getVoices();

    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  const dialects = [
    { value: "all", label: "كل اللهجات" },
    { value: "fusha", label: "العربية الفصحى" },
    { value: "egyptian", label: "المصرية" },
    { value: "emirati", label: "الإماراتية" },
    { value: "saudi", label: "السعودية" },
    { value: "levantine", label: "الشامية" },
    { value: "moroccan", label: "المغربية" },
    { value: "american", label: "الأمريكية" },
    { value: "british", label: "البريطانية" },
    { value: "australian", label: "الأسترالية" },
  ];

  const filteredVoices = voices.filter((voice) => {
    const matchesLanguage = voice.languages?.some((lang) =>
      lang.toLowerCase().startsWith(language),
    );

    const matchesDialect =
      dialect === "all" || voice.dialect?.includes(dialect);

    const matchesGender = gender === "all" || voice.gender === gender;

    return matchesLanguage && matchesDialect && matchesGender;
  });

  // التأكد من أن الصوت المختار موجود ضمن النتائج
  const selectedVoiceExists = filteredVoices.some(
    (voice) => voice.voice_id === voiceId,
  );

  // توليد الصوت
  const speak = async () => {
    if (!text.trim() || !voiceId || loading) return;

    setLoading(true);
    setError("");

    try {
      audioRef.current?.pause();

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.trim(),
          voiceId,
          speed,
          stability,
        }),
      });

      if (!response.ok) {
        throw new Error("فشل إنشاء الصوت");
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
      setError("حدث خطأ أثناء تحويل النص إلى صوت.");
    } finally {
      setLoading(false);
    }
  };

  // إيقاف الصوت
  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-5 rounded-xl border p-6">
      <h2 className="text-2xl font-bold">تحويل النص إلى صوت</h2>

      {/* النص */}
      <div>
        <label className="mb-2 block font-medium">النص</label>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="اكتب النص العربي هنا..."
          dir="auto"
          className="w-full rounded-lg border p-3"
          rows={5}
        />
      </div>

      {/* اللغة */}
      <div>
        <label className="mb-2 block font-medium">اللغة</label>

        <select value="ar" disabled className="w-full rounded-lg border p-2">
          <option value="ar">العربية</option>
        </select>
      </div>

      {/* نوع الصوت */}
      <div>
        <label className="mb-2 block font-medium">نوع الصوت</label>

        <select
          value={gender}
          onChange={(e) => {
            const newGender = e.target.value;
            setGender(newGender);

            const availableVoices = voices.filter(
              (voice) => newGender === "all" || voice.gender === newGender,
            );

            setVoiceId(availableVoices[0]?.voice_id ?? "");
          }}
          className="w-full rounded-lg border p-2"
        >
          <option value="all">الكل</option>
          <option value="male">ذكر</option>
          <option value="female">أنثى</option>
        </select>
      </div>

      {/* اختيار الصوت */}
      <div>
        <label className="mb-2 block font-medium">اختر الصوت واللهجة</label>

        <select
          value={selectedVoiceExists ? voiceId : ""}
          onChange={(e) => setVoiceId(e.target.value)}
          className="w-full rounded-lg border p-2"
          disabled={filteredVoices.length === 0}
        >
          <option value="">اختر الصوت</option>

          {filteredVoices.map((voice) => (
            <option key={voice.voice_id} value={voice.voice_id}>
              {voice.name} -{" "}
              {voice.gender === "male"
                ? "ذكر"
                : voice.gender === "female"
                  ? "أنثى"
                  : "غير محدد"}{" "}
              - {voice.dialect?.join(", ") || "اللهجة غير محددة"}
            </option>
          ))}
        </select>

        {filteredVoices.length === 0 && (
          <p className="mt-2 text-sm text-red-500">
            لا توجد أصوات متاحة لهذا الاختيار.
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block font-medium">اللغة</label>

        <select
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value);
            setDialect("all");
            setVoiceId("");
          }}
          className="w-full rounded-lg border p-2"
        >
          <option value="ar">العربية</option>
          <option value="en">الإنجليزية</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block font-medium">اللهجة</label>

        <select
          value={dialect}
          onChange={(e) => {
            setDialect(e.target.value);
            setVoiceId("");
          }}
          className="w-full rounded-lg border p-2"
        >
          {dialects
            .filter((item) =>
              language === "ar"
                ? !["american", "british", "australian"].includes(item.value)
                : ["all", "american", "british", "australian"].includes(
                    item.value,
                  ),
            )
            .map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
        </select>
      </div>
      {/* السرعة */}
      <div>
        <label className="mb-2 block font-medium">
          سرعة الصوت: {speed.toFixed(1)}
        </label>

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

      {/* الثبات */}
      <div>
        <label className="mb-2 block font-medium">
          ثبات الصوت: {stability.toFixed(1)}
        </label>

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

      {/* الأزرار */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={speak}
          disabled={loading || !text.trim() || !voiceId || !selectedVoiceExists}
          className="rounded-lg bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
        >
          {loading ? "جاري إنشاء الصوت..." : "تشغيل"}
        </button>

        <button
          onClick={() => audioRef.current?.pause()}
          className="rounded-lg border px-4 py-2"
        >
          إيقاف مؤقت
        </button>

        <button
          onClick={() => audioRef.current?.play()}
          className="rounded-lg border px-4 py-2"
        >
          استكمال
        </button>

        <button onClick={stop} className="rounded-lg border px-4 py-2">
          إيقاف
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <audio ref={audioRef} controls className="w-full" />
    </div>
  );
}
